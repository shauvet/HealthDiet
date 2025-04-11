import { useState } from 'react';
import { 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Chip,
  IconButton,
  InputAdornment,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { observer } from 'mobx-react-lite';
import { recipeStore } from '../../stores/RootStore';
import foodPlaceholder from '../../assets/food-placeholder.svg';

const initialIngredient = {
  name: '',
  quantity: '',
  unit: 'g', // Default to grams
  isMain: true
};

const CreateRecipeDialog = observer(({ open, onClose }) => {
  const [recipe, setRecipe] = useState({
    name: '',
    description: '',
    cookingTime: 30,
    servings: 2,
    cuisine: '',
    spiceLevel: 0,
    ingredients: [{ ...initialIngredient }],
    steps: [''],
    tags: []
  });
  
  const [newTag, setNewTag] = useState('');
  
  const handleChange = (event) => {
    const { name, value } = event.target;
    setRecipe({
      ...recipe,
      [name]: value
    });
  };
  
  const handleIngredientChange = (index, field, value) => {
    const updatedIngredients = [...recipe.ingredients];
    updatedIngredients[index] = {
      ...updatedIngredients[index],
      [field]: value
    };
    
    setRecipe({
      ...recipe,
      ingredients: updatedIngredients
    });
  };
  
  const handleAddIngredient = () => {
    setRecipe({
      ...recipe,
      ingredients: [...recipe.ingredients, { ...initialIngredient }]
    });
  };
  
  const handleRemoveIngredient = (index) => {
    const updatedIngredients = [...recipe.ingredients];
    updatedIngredients.splice(index, 1);
    
    setRecipe({
      ...recipe,
      ingredients: updatedIngredients
    });
  };
  
  const handleStepChange = (index, value) => {
    const updatedSteps = [...recipe.steps];
    updatedSteps[index] = value;
    
    setRecipe({
      ...recipe,
      steps: updatedSteps
    });
  };
  
  const handleAddStep = () => {
    setRecipe({
      ...recipe,
      steps: [...recipe.steps, '']
    });
  };
  
  const handleRemoveStep = (index) => {
    const updatedSteps = [...recipe.steps];
    updatedSteps.splice(index, 1);
    
    setRecipe({
      ...recipe,
      steps: updatedSteps
    });
  };
  
  const handleAddTag = () => {
    if (newTag.trim() && !recipe.tags.includes(newTag.trim())) {
      setRecipe({
        ...recipe,
        tags: [...recipe.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };
  
  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };
  
  const handleDeleteTag = (tagToDelete) => {
    setRecipe({
      ...recipe,
      tags: recipe.tags.filter(tag => tag !== tagToDelete)
    });
  };
  
  const handleSubmit = async () => {
    // Basic validation
    if (!recipe.name || !recipe.description || recipe.ingredients.length === 0) {
      return;
    }
    
    try {
      await recipeStore.createRecipe(recipe);
      handleClose();
    } catch (error) {
      console.error("Failed to create recipe:", error);
    }
  };
  
  const handleClose = () => {
    // Reset form
    setRecipe({
      name: '',
      description: '',
      cookingTime: 30,
      servings: 2,
      cuisine: '',
      spiceLevel: 0,
      ingredients: [{ ...initialIngredient }],
      steps: [''],
      tags: []
    });
    setNewTag('');
    onClose();
  };
  
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>创建新菜谱</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Basic Info */}
          <TextField
            label="菜名"
            name="name"
            value={recipe.name}
            onChange={handleChange}
            fullWidth
            required
          />
          
          <TextField
            label="描述"
            name="description"
            value={recipe.description}
            onChange={handleChange}
            fullWidth
            multiline
            rows={2}
            required
          />
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                label="烹饪时间 (分钟)"
                name="cookingTime"
                type="number"
                value={recipe.cookingTime}
                onChange={handleChange}
                fullWidth
                InputProps={{
                  inputProps: { min: 1 }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="份数"
                name="servings"
                type="number"
                value={recipe.servings}
                onChange={handleChange}
                fullWidth
                InputProps={{
                  inputProps: { min: 1 }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel id="spice-level-label">辣度</InputLabel>
                <Select
                  labelId="spice-level-label"
                  name="spiceLevel"
                  value={recipe.spiceLevel}
                  label="辣度"
                  onChange={handleChange}
                >
                  <MenuItem value={0}>不辣</MenuItem>
                  <MenuItem value={1}>微辣</MenuItem>
                  <MenuItem value={2}>中辣</MenuItem>
                  <MenuItem value={3}>重辣</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          
          <FormControl fullWidth>
            <InputLabel id="cuisine-label">菜系</InputLabel>
            <Select
              labelId="cuisine-label"
              name="cuisine"
              value={recipe.cuisine}
              label="菜系"
              onChange={handleChange}
            >
              <MenuItem value="川菜">川菜</MenuItem>
              <MenuItem value="粤菜">粤菜</MenuItem>
              <MenuItem value="鲁菜">鲁菜</MenuItem>
              <MenuItem value="湘菜">湘菜</MenuItem>
              <MenuItem value="闽菜">闽菜</MenuItem>
              <MenuItem value="徽菜">徽菜</MenuItem>
              <MenuItem value="浙菜">浙菜</MenuItem>
              <MenuItem value="江苏菜">江苏菜</MenuItem>
              <MenuItem value="西餐">西餐</MenuItem>
              <MenuItem value="日韩料理">日韩料理</MenuItem>
              <MenuItem value="其他">其他</MenuItem>
            </Select>
          </FormControl>
          
          {/* Tags */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              标签
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {recipe.tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  onDelete={() => handleDeleteTag(tag)}
                  color="primary"
                  variant="outlined"
                />
              ))}
              
              <TextField
                placeholder="添加标签"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleTagKeyPress}
                size="small"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        edge="end"
                        onClick={handleAddTag}
                        disabled={!newTag.trim()}
                      >
                        <AddIcon />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Box>
          </Box>
          
          {/* Ingredients */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              食材
            </Typography>
            
            {recipe.ingredients.map((ingredient, index) => (
              <Grid container spacing={2} key={index} sx={{ mb: 1 }}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="食材名称"
                    value={ingredient.name}
                    onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    label="数量"
                    type="number"
                    value={ingredient.quantity}
                    onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                    fullWidth
                    required
                    InputProps={{
                      inputProps: { min: 0.1, step: 0.1 }
                    }}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <FormControl fullWidth>
                    <InputLabel id={`unit-label-${index}`}>单位</InputLabel>
                    <Select
                      labelId={`unit-label-${index}`}
                      value={ingredient.unit}
                      label="单位"
                      onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                    >
                      <MenuItem value="g">克 (g)</MenuItem>
                      <MenuItem value="kg">千克 (kg)</MenuItem>
                      <MenuItem value="ml">毫升 (ml)</MenuItem>
                      <MenuItem value="piece">个</MenuItem>
                      <MenuItem value="tbsp">汤匙</MenuItem>
                      <MenuItem value="tsp">茶匙</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6} sm={1}>
                  <IconButton
                    color="error"
                    onClick={() => handleRemoveIngredient(index)}
                    disabled={recipe.ingredients.length <= 1}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            ))}
            
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddIngredient}
              size="small"
              sx={{ mt: 1 }}
            >
              添加食材
            </Button>
          </Box>
          
          {/* Cooking Steps */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              烹饪步骤
            </Typography>
            
            {recipe.steps.map((step, index) => (
              <Box key={index} sx={{ display: 'flex', mb: 1 }}>
                <Typography sx={{ mr: 1, mt: 1 }}>{index + 1}.</Typography>
                <TextField
                  fullWidth
                  placeholder={`步骤 ${index + 1}`}
                  value={step}
                  onChange={(e) => handleStepChange(index, e.target.value)}
                  multiline
                />
                <IconButton
                  color="error"
                  onClick={() => handleRemoveStep(index)}
                  disabled={recipe.steps.length <= 1}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
            
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddStep}
              size="small"
              sx={{ mt: 1 }}
            >
              添加步骤
            </Button>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>取消</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={recipeStore.loading}
        >
          {recipeStore.loading ? <CircularProgress size={24} /> : '创建菜谱'}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default CreateRecipeDialog; 
