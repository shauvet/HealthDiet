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
  CircularProgress,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { observer } from 'mobx-react-lite';
import { recipeStore } from '../../stores/RootStore';     

const initialIngredient = {
  name: '',
  quantity: '',
  unit: 'g', // Default to grams
  isMain: true
};

// 菜系选项
const cuisineOptions = [
  { value: '川菜', label: '川菜' },
  { value: '粤菜', label: '粤菜' },
  { value: '鲁菜', label: '鲁菜' },
  { value: '湘菜', label: '湘菜' },
  { value: '闽菜', label: '闽菜' },
  { value: '徽菜', label: '徽菜' },
  { value: '浙菜', label: '浙菜' },
  { value: '江苏菜', label: '江苏菜' },
  { value: '西餐', label: '西餐' },
  { value: '日韩料理', label: '日韩料理' },
  { value: '其他', label: '其他' }
];

// 餐类型选项
const mealTypeOptions = [
  { value: 'breakfast', label: '早餐' },
  { value: 'lunch', label: '午餐' },
  { value: 'dinner', label: '晚餐' },
  { value: 'snack', label: '小吃/加餐' }
];

// 辣度选项
const spiceLevelOptions = [
  { value: 0, label: '不辣' },
  { value: 1, label: '微辣' },
  { value: 2, label: '中辣' },
  { value: 3, label: '重辣' },
  { value: 4, label: '麻辣' }
];

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
    tags: [],
    categories: [] // 添加餐类种类
  });
  
  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
  
  // 处理特定餐类别的变化
  const handleMealTypeChange = (event) => {
    const { value } = event.target;
    // 确保categories中包含餐类型
    let categories = [...recipe.categories];
    
    // 移除所有现有的餐类型
    categories = categories.filter(cat => 
      !['breakfast', 'lunch', 'dinner', 'snack'].includes(cat)
    );
    
    // 添加新选择的餐类型
    if (value !== 'none') {
      categories.push(value);
    }
    
    setRecipe({
      ...recipe,
      categories
    });
  };
  
  // 获取当前选中的餐类型
  const getCurrentMealType = () => {
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
    const found = recipe.categories.find(cat => mealTypes.includes(cat));
    return found || 'none';
  };
  
  const handleSubmit = async () => {
    try {
      // 确保基本数据有效性
      if (!recipe.name.trim()) {
        alert('请输入菜谱名称');
        return;
      }
      
      if (recipe.ingredients.length === 0) {
        alert('请至少添加一种食材');
        return;
      }
      
      if (recipe.steps.length === 0 || !recipe.steps[0].trim()) {
        alert('请至少添加一个烹饪步骤');
        return;
      }
      
      // 显示处理中提示
      setIsSubmitting(true);
      
      // 提交数据
      const response = await recipeStore.createRecipe(recipe);
      
      if (response) {
        onClose();
        // 清空表单
        setRecipe({
          name: '',
          description: '',
          cookingTime: 30,
          servings: 2,
          cuisine: '',
          spiceLevel: 0,
          ingredients: [{ ...initialIngredient }],
          steps: [''],
          tags: [],
          categories: []
        });
      }
    } catch (error) {
      console.error('创建菜谱失败:', error);
      alert('创建菜谱失败，请重试');
    } finally {
      setIsSubmitting(false);
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
      tags: [],
      categories: []
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
                  {spiceLevelOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="cuisine-label">菜系</InputLabel>
                <Select
                  labelId="cuisine-label"
                  name="cuisine"
                  value={recipe.cuisine}
                  label="菜系"
                  onChange={handleChange}
                >
                  {cuisineOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="meal-type-label">餐类</InputLabel>
                <Select
                  labelId="meal-type-label"
                  value={getCurrentMealType()}
                  label="餐类"
                  onChange={handleMealTypeChange}
                >
                  <MenuItem value="none">不指定</MenuItem>
                  {mealTypeOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          
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
