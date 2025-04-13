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

const RecipeCard = observer(({ recipe }) => {
  const [isFavorite, setIsFavorite] = useState(recipe.favoriteId !== undefined || recipe.isFavorite || false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [mealPlanData, setMealPlanData] = useState({
    date: new Date().toISOString().split('T')[0],
    mealType: 'lunch', // breakfast, lunch, dinner
    servings: 1
  });
  
  const handleFavoriteToggle = async () => {
    // Update local UI state optimistically
    setIsFavorite(!isFavorite);
    
    // Call API to update server state
    try {
      await recipeStore.toggleFavorite(recipe.id, isFavorite);
    } catch (error) {
      // Revert local state on error
      setIsFavorite(isFavorite);
      console.error("Failed to toggle favorite status:", error);
    }
  };
  
  const handleAddToMealPlan = () => {
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
    try {
      await mealPlanStore.addMeal({
        recipeId: recipe.id,
        ...mealPlanData
      });
      
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
