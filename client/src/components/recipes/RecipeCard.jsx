import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  CardActions, 
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
  Chip
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import AddIcon from '@mui/icons-material/Add';
import { observer } from 'mobx-react-lite';
import { recipeStore, mealPlanStore } from '../../stores/RootStore';
import foodPlaceholder from '../../assets/food-placeholder.svg';

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
      <Card sx={{ maxWidth: 345, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardMedia
          component="img"
          height="140"
          image={foodPlaceholder}
          alt={recipe.name}
        />
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography gutterBottom variant="h6" component="div">
            {recipe.name}
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
            {recipe.tags && recipe.tags.map((tag, index) => (
              <Chip key={index} label={tag} size="small" />
            ))}
          </Box>
          
          <Typography variant="body2" color="text.secondary">
            {recipe.description?.substring(0, 100)}
            {recipe.description?.length > 100 ? '...' : ''}
          </Typography>
        </CardContent>
        
        <CardActions disableSpacing>
          <IconButton 
            aria-label={isFavorite ? '取消收藏' : '收藏菜谱'} 
            onClick={handleFavoriteToggle}
            color={isFavorite ? 'primary' : 'default'}
          >
            {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          </IconButton>
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={handleAddToMealPlan}
          >
            点菜
          </Button>
        </CardActions>
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
