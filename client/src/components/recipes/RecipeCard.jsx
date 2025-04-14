import { useState } from 'react';
import { 
  Card, 
  Typography, 
  IconButton, 
  Box, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  Avatar
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import AddIcon from '@mui/icons-material/Add';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import { observer } from 'mobx-react-lite';
import { recipeStore, mealPlanStore } from '../../stores/RootStore';
import api from '../../api/axiosConfig';

const RecipeCard = observer(({ recipe }) => {
  
  // 通过多种方式确保获取到id
  const getRecipeId = () => {
    // 尝试各种可能的id形式
    if (recipe.id) return recipe.id;
    if (recipe._id) return recipe._id;
    if (recipe.recipeId) return recipe.recipeId;
    if (recipe.favoriteId) return recipe.favoriteId;
    
    // 可能是数字ID（模拟数据）
    if (recipe.mockId) return recipe.mockId.toString();
    
    // 还可能是直接用数字作为ID的情况
    if (typeof recipe === 'object' && Object.keys(recipe).length > 0) {
      // 尝试获取第一个看起来像ID的属性
      for (const key in recipe) {
        if ((key.toLowerCase().includes('id') || key === '_id') && recipe[key]) {
          return recipe[key].toString();
        }
      }
    }
    
    // 如果是MongoDB ObjectId对象，尝试获取其字符串表示
    if (recipe.$id) return recipe.$id.toString();
    
    console.error("无法确定食谱ID:", recipe);
    // 没有有效ID，返回一个时间戳作为临时ID
    return `temp-${Date.now()}`;
  };
  
  // 检查服务器返回的收藏状态
  const isInitiallyFavorited = () => {
    // 优先使用服务器明确标记的isFavorite属性
    if (recipe.isFavorite !== undefined) return recipe.isFavorite;
    // 如果有favoriteId，则认为已收藏
    if (recipe.favoriteId !== undefined) return true;
    // 默认为未收藏
    return false;
  };
  
  const [isFavorite, setIsFavorite] = useState(isInitiallyFavorited());
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [mealPlanData, setMealPlanData] = useState({
    date: new Date().toISOString().split('T')[0],
    mealType: 'lunch', // breakfast, lunch, dinner
    servings: 1
  });
  
  const handleFavoriteToggle = async () => {
    // 获取ID以用于API调用
    const recipeId = getRecipeId();
    
    // 检查recipeId是否存在
    if (!recipeId) {
      console.error("Cannot favorite recipe without ID:", recipe);
      return;
    }
    
    // 生成日志以便调试
    console.log("食谱详情:", {
      id: recipeId,
      name: recipe.name,
      isFavorite: isFavorite
    });
    
    // Update local UI state optimistically
    setIsFavorite(!isFavorite);
    
    // Call API to update server state
    try {
      console.log("Toggling favorite for recipe:", recipeId);
      await recipeStore.toggleFavorite(recipeId, isFavorite);
    } catch (error) {
      // Revert local state on error
      setIsFavorite(isFavorite);
      console.error("Failed to toggle favorite status:", error);
    }
  };
  
  const handleAddToMealPlan = () => {
    // 只打开弹框，不做其他操作
    setOpenAddDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenAddDialog(false);
  };
  
  const handleMealPlanChange = (event) => {
    const { name, value } = event.target;
    setMealPlanData({
      ...mealPlanData,
      [name]: value
    });
  };
  
  const handleAddToMealPlanConfirm = async () => {
    // 获取ID以用于API调用
    const recipeId = getRecipeId();
    
    // 检查recipeId是否存在
    if (!recipeId) {
      console.error("Cannot add recipe to meal plan without ID:", recipe);
      return;
    }
    
    try {
      // 先添加膳食计划
      const addedMeal = await mealPlanStore.addMeal({
        recipeId,
        ...mealPlanData
      });
      
      // 检查食材库存并添加缺货食材到购物清单
      if (recipe.ingredients && recipe.ingredients.length > 0 && addedMeal && addedMeal._id) {
        try {
          // 使用刚添加的膳食计划ID来调用批量检查库存API
          const checkResponse = await api.post(`/meal-plans/${addedMeal._id}/ingredients/batch-check`, {
            ingredients: recipe.ingredients
          });
          
          // 检查是否有库存不足的食材
          if (checkResponse.data && 
              (checkResponse.data.outOfStock?.length > 0 || checkResponse.data.lowStock?.length > 0)) {
            
            // 使用服务器端接口一次性添加所有缺货的食材到购物清单
            await api.post(`/meal-plans/${addedMeal._id}/shopping-list/add`, {
              ingredients: [
                ...(checkResponse.data.outOfStock || []).map(item => ({
                  name: item.name,
                  requiredQuantity: Number(item.quantity) || 1,
                  toBuyQuantity: Number(item.quantity) || 1,
                  quantity: Number(item.quantity) || 1,
                  unit: item.unit || 'g',
                  category: item.category || 'others'
                })),
                ...(checkResponse.data.lowStock || []).map(item => {
                  const availableQty = Number(item.availableQuantity) || 0;
                  const requiredQty = Number(item.quantity) || 0;
                  const missingQty = Math.max(requiredQty - availableQty, 0);
                  return {
                    name: item.name,
                    requiredQuantity: missingQty || 1,
                    toBuyQuantity: missingQty || 1,
                    quantity: missingQty || 1,
                    unit: item.unit || 'g',
                    category: item.category || 'others'
                  };
                }).filter(item => item.quantity > 0)
              ]
            });
          }
        } catch (error) {
          console.error("Failed to check ingredients or add to shopping list:", error);
        }
      }
      
      // Close dialog on success
      setOpenAddDialog(false);
    } catch (error) {
      console.error("Failed to add to meal plan:", error);
    }
  };
  
  return (
    <>
      <Card sx={{ 
        width: '100%', 
        display: 'flex', 
        flexDirection: 'row', 
        height: '80px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
        '&:hover': {
          boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
          transition: 'box-shadow 0.3s ease-in-out'
        }
      }}>
        {/* Left section - Recipe name and tags */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          flexGrow: 1, 
          pl: { xs: 1, sm: 2 },
          overflow: 'hidden'
        }}>
          <Typography variant="h6" component="div" noWrap>
            {recipe.name}
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {recipe.tags && recipe.tags.slice(0, 2).map((tag, index) => (
              <Chip key={index} label={tag} size="small" />
            ))}
            {recipe.tags && recipe.tags.length > 2 && (
              <Typography variant="body2" color="text.secondary">+{recipe.tags.length - 2}</Typography>
            )}
          </Box>
        </Box>
        
        {/* Middle section - Actions */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          mx: { xs: 0.5, sm: 2 }
        }}>
          <IconButton 
            aria-label={isFavorite ? '取消收藏' : '收藏菜谱'} 
            onClick={handleFavoriteToggle}
            color={isFavorite ? 'primary' : 'default'}
            size="medium"
          >
            {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          </IconButton>
          
          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={handleAddToMealPlan}
            sx={{ 
              ml: { xs: 0.5, sm: 1 },
              minWidth: { xs: '60px', sm: 'auto' },
              fontSize: { xs: '0.75rem', sm: '0.8125rem' }
            }}
          >
            点菜
          </Button>
        </Box>
        
        {/* Right section - Icon */}
        <Avatar 
          sx={{ 
            bgcolor: 'primary.light', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            width: { xs: 60, sm: 80 },
            height: '100%',
            borderRadius: 0
          }}
        >
          <FastfoodIcon sx={{ color: 'white' }} />
        </Avatar>
      </Card>
      
      {/* Add to Meal Plan Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseDialog}>
        <DialogTitle>添加 "{recipe.name}" 到菜单</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="日期"
              type="date"
              name="date"
              value={mealPlanData.date}
              onChange={handleMealPlanChange}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />
            
            <FormControl fullWidth>
              <InputLabel id="meal-type-label">餐别</InputLabel>
              <Select
                labelId="meal-type-label"
                name="mealType"
                value={mealPlanData.mealType}
                label="餐别"
                onChange={handleMealPlanChange}
              >
                <MenuItem value="breakfast">早餐</MenuItem>
                <MenuItem value="lunch">午餐</MenuItem>
                <MenuItem value="dinner">晚餐</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              label="份数"
              type="number"
              name="servings"
              value={mealPlanData.servings}
              onChange={handleMealPlanChange}
              fullWidth
              InputProps={{
                inputProps: { min: 1 }
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>取消</Button>
          <Button onClick={handleAddToMealPlanConfirm} variant="contained">
            添加
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
});

export default RecipeCard; 
