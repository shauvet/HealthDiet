import { useEffect, useState, useCallback, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  IconButton,
  Card,
  CardContent,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip,
  CircularProgress,
  Alert,
  Tooltip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TodayIcon from '@mui/icons-material/Today';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AddIcon from '@mui/icons-material/Add';
import InfoIcon from '@mui/icons-material/Info';
import { mealPlanStore, inventoryStore, recipeStore } from '../stores/RootStore';

const initialIngredient = {
  name: '',
  quantity: '',
  unit: 'g', // Default to grams
  isMain: true
};

const MealPlanPage = observer(() => {
  const [selectedMeals, setSelectedMeals] = useState([]);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mealIngredientStatus, setMealIngredientStatus] = useState({});
  const todayCardRef = useRef(null);
  
  // Recipe ingredients dialog state
  const [openIngredientsDialog, setOpenIngredientsDialog] = useState(false);
  const [currentMeal, setCurrentMeal] = useState(null);
  const [editedIngredients, setEditedIngredients] = useState([]);
  const [savingIngredients, setSavingIngredients] = useState(false);
  const [recipeDetailsLoading, setRecipeDetailsLoading] = useState(false);
  
  // Date range for weekly view
  const [dateRange, setDateRange] = useState(() => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - today.getDay()); // Start from Sunday
    
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6); // End on Saturday
    
    return {
      startDate,
      endDate,
      currentWeek: true
    };
  });

  const fetchMeals = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      await mealPlanStore.fetchMealPlans(
        formatDateForAPI(dateRange.startDate),
        formatDateForAPI(dateRange.endDate)
      );
    } catch {
      setError('加载菜单失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);
  
  useEffect(() => {
    fetchMeals();
  }, [fetchMeals]);
  
  // Auto-check ingredients when meals are loaded
  useEffect(() => {
    const checkAllIngredients = async () => {
      if (mealPlanStore.mealPlans.length > 0) {
        const statusPromises = mealPlanStore.mealPlans.map(async (meal) => {
          try {
            // 使用 meal._id 如果存在，否则使用 meal.id
            const mealId = meal._id || meal.id;
            const status = await mealPlanStore.checkIngredientAvailability(mealId);
            return { mealId, status };
          } catch (error) {
            console.error(`Failed to check ingredients for meal ${meal.id || meal._id}:`, error);
            return { mealId: meal.id || meal._id, status: { outOfStock: [] } };
          }
        });
        
        const statuses = await Promise.all(statusPromises);
        const newIngredientStatus = {};
        
        statuses.forEach(({ mealId, status }) => {
          newIngredientStatus[mealId] = status;
        });
        
        setMealIngredientStatus(newIngredientStatus);
      }
    };
    
    if (!loading) {
      checkAllIngredients();
    }
  }, [mealPlanStore.mealPlans, loading]);
  
  // Auto-scroll to today's menu when data is loaded
  useEffect(() => {
    if (!loading && todayCardRef.current) {
      setTimeout(() => {
        if (todayCardRef.current) {
          todayCardRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
      }, 300); // Short delay to ensure all elements are properly rendered
    }
  }, [loading]);
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('zh-CN', options);
  };
  
  const isToday = (dateString) => {
    const today = new Date();
    const date = new Date(dateString);
    return date.toDateString() === today.toDateString();
  };
  
  const isPastDate = (dateString) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(dateString);
    return date < today;
  };
  
  const getMealTypeText = (mealType) => {
    switch (mealType) {
      case 'breakfast':
        return '早餐';
      case 'lunch':
        return '午餐';
      case 'dinner':
        return '晚餐';
      default:
        return mealType;
    }
  };
  
  // Get dates for the week
  const getDatesInRange = () => {
    const dates = [];
    const currentDate = new Date(dateRange.startDate);
    
    while (currentDate <= dateRange.endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  };
  
  const weekDates = getDatesInRange();
  
  const formatDateForAPI = (date) => {
    return date.toISOString().split('T')[0];
  };
  
  const handlePreviousWeek = () => {
    const newStartDate = new Date(dateRange.startDate);
    newStartDate.setDate(dateRange.startDate.getDate() - 7);
    const newEndDate = new Date(newStartDate);
    newEndDate.setDate(newStartDate.getDate() + 6);
    setDateRange({ startDate: newStartDate, endDate: newEndDate, currentWeek: false });
  };
  
  const handleNextWeek = () => {
    const newStartDate = new Date(dateRange.startDate);
    newStartDate.setDate(dateRange.startDate.getDate() + 7);
    const newEndDate = new Date(newStartDate);
    newEndDate.setDate(newStartDate.getDate() + 6);
    setDateRange({ startDate: newStartDate, endDate: newEndDate, currentWeek: false });
  };
  
  const handleCurrentWeek = () => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - today.getDay());
    
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    
    setDateRange({ startDate, endDate, currentWeek: true });
  };
  
  const handleToggleMeal = (mealId) => {
    setSelectedMeals(prevSelected => {
      if (prevSelected.includes(mealId)) {
        return prevSelected.filter(id => id !== mealId);
      } else {
        return [...prevSelected, mealId];
      }
    });
  };
  
  const handleDeselectAll = () => {
    setSelectedMeals([]);
  };
  
  const handleOpenDeleteDialog = () => {
    if (selectedMeals.length === 0) return;
    setOpenDeleteDialog(true);
  };
  
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };
  
  const handleConfirmDelete = async () => {
    setLoading(true);
    try {
      await mealPlanStore.removeMeals(selectedMeals);
      setSelectedMeals([]);
      setSuccess('已成功删除所选菜单');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('删除菜单失败，请稍后重试');
    } finally {
      setLoading(false);
      setOpenDeleteDialog(false);
    }
  };
  
  const handleAddToShoppingList = async (mealId) => {
    setLoading(true);
    try {
      await mealPlanStore.addOutOfStockToShoppingList(mealId);
      // Refresh the shopping list data
      await inventoryStore.fetchShoppingList();
      setSuccess('已成功添加缺少的食材到采购清单');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('添加到采购清单失败，请稍后重试');
      console.error('Failed to add to shopping list:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const getMealsForDateAndType = (date, mealType) => {
    const formattedDate = formatDateForAPI(date);
    return mealPlanStore.mealPlans.filter(
      meal => meal.date === formattedDate && meal.mealType === mealType
    );
  };
  
  // Recipe ingredients dialog handlers
  const handleOpenIngredientsDialog = async (meal) => {
    setCurrentMeal(meal);
    
    try {
      // If meal has recipe ID but no ingredients, fetch them from the API
      if (meal.recipe && meal.recipe.id && (!meal.recipe.ingredients || meal.recipe.ingredients.length === 0)) {
        console.log('Fetching recipe details for:', meal.recipe.id);
        setRecipeDetailsLoading(true);
        
        // Fetch full recipe details using the recipe ID
        const recipeDetails = await recipeStore.getRecipeById(meal.recipe.id);
        
        if (recipeDetails && recipeDetails.ingredients && recipeDetails.ingredients.length > 0) {
          // Use the fetched ingredients
          setEditedIngredients([...recipeDetails.ingredients]);
        } else {
          // If no ingredients found, set empty array or default ingredient
          setEditedIngredients([{ ...initialIngredient }]);
        }
      } else if (meal.recipe && meal.recipe.ingredients) {
        // If ingredients are already in the meal object, use them directly
        setEditedIngredients([...meal.recipe.ingredients]);
      } else {
        // No recipe or ingredients, set default empty ingredient
        setEditedIngredients([{ ...initialIngredient }]);
      }
    } catch (error) {
      console.error('Error fetching recipe details:', error);
      setEditedIngredients([{ ...initialIngredient }]);
    } finally {
      setRecipeDetailsLoading(false);
      setOpenIngredientsDialog(true);
    }
  };
  
  const handleCloseIngredientsDialog = () => {
    setOpenIngredientsDialog(false);
    setCurrentMeal(null);
    setEditedIngredients([]);
  };
  
  const handleIngredientChange = (index, field, value) => {
    const updatedIngredients = [...editedIngredients];
    updatedIngredients[index] = {
      ...updatedIngredients[index],
      [field]: field === 'quantity' ? parseFloat(value) : value
    };
    
    setEditedIngredients(updatedIngredients);
  };
  
  const handleAddIngredient = () => {
    setEditedIngredients([...editedIngredients, { ...initialIngredient }]);
  };
  
  const handleRemoveIngredient = (index) => {
    const updatedIngredients = [...editedIngredients];
    updatedIngredients.splice(index, 1);
    setEditedIngredients(updatedIngredients);
  };
  
  const handleSaveIngredients = async () => {
    if (!currentMeal || !currentMeal.recipe) return;
    
    setSavingIngredients(true);
    try {
      // Here we would call an API to update the recipe ingredients
      // For now, we'll just update the local state
      await recipeStore.updateRecipeIngredients(currentMeal.recipe.id, editedIngredients);
      
      // Refresh meal plans to get updated data
      await fetchMeals();
      
      setSuccess('食材已更新');
      setTimeout(() => setSuccess(''), 3000);
      handleCloseIngredientsDialog();
    } catch (error) {
      setError('更新食材失败，请稍后重试');
      console.error('Failed to update ingredients:', error);
    } finally {
      setSavingIngredients(false);
    }
  };
  
  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1">已点菜单</Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton onClick={handlePreviousWeek}>
            <ChevronLeftIcon />
          </IconButton>
          
          <Button 
            startIcon={<TodayIcon />}
            variant={dateRange.currentWeek ? 'contained' : 'outlined'}
            onClick={handleCurrentWeek}
            size="small"
          >
            本周
          </Button>
          
          <IconButton onClick={handleNextWeek}>
            <ChevronRightIcon />
          </IconButton>
        </Box>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      
      {selectedMeals.length > 0 && (
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1">
            已选择 {selectedMeals.length} 个菜单
          </Typography>
          
          <Box>
            <Button onClick={handleDeselectAll} sx={{ mr: 1 }}>
              取消选择
            </Button>
            <Button 
              variant="contained" 
              color="error" 
              startIcon={<DeleteIcon />}
              onClick={handleOpenDeleteDialog}
            >
              删除所选
            </Button>
          </Box>
        </Box>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid 
          container 
          spacing={2}
          sx={{
            width: '100%',
            margin: '0 auto'
          }}
        >
          {weekDates.map((date, dateIndex) => (
            <Grid 
              item 
              xs={12} 
              sm={6} 
              md={4} 
              key={dateIndex}
              sx={{
                display: 'flex',
                width: {
                  xs: '100%',
                  sm: '50%',
                  md: '33.333%'
                }
              }}
              ref={isToday(date) ? todayCardRef : null}
            >
              <Card 
                elevation={isToday(date) ? 3 : 1}
                sx={{
                  opacity: isPastDate(date) ? 0.8 : 1,
                  border: isToday(date) ? '2px solid #4caf50' : 'none',
                  height: '100%',
                  width: '100%',
                  minHeight: 350,
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <CardHeader
                  title={formatDate(date)}
                  titleTypographyProps={{ 
                    variant: 'h6',
                    sx: {
                      fontSize: '1rem',
                      fontWeight: 600
                    }
                  }}
                  sx={{ 
                    backgroundColor: 'background.default',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    p: 2
                  }}
                  action={
                    isToday(date) && (
                      <Chip 
                        label="今天" 
                        color="primary" 
                        size="small"
                        sx={{ mr: 1 }}
                      />
                    )
                  }
                />
                <CardContent 
                  sx={{ 
                    flexGrow: 1, 
                    p: 2,
                    '&:last-child': {
                      pb: 2
                    }
                  }}
                >
                  {['breakfast', 'lunch', 'dinner'].map(mealType => {
                    const mealsForType = getMealsForDateAndType(date, mealType);
                    return (
                      <Box 
                        key={mealType} 
                        sx={{ 
                          mb: 2,
                          '&:last-child': {
                            mb: 0
                          }
                        }}
                      >
                        <Typography 
                          variant="subtitle1" 
                          gutterBottom
                          sx={{
                            fontWeight: 'medium',
                            color: 'primary.main',
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            pb: 0.5,
                            fontSize: '0.875rem'
                          }}
                        >
                          {getMealTypeText(mealType)}
                        </Typography>
                        
                        {mealsForType.length === 0 ? (
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ 
                              fontStyle: 'italic',
                              py: 1,
                              textAlign: 'center',
                              fontSize: '0.875rem'
                            }}
                          >
                            暂无菜单
                          </Typography>
                        ) : (
                          <List dense disablePadding>
                            {mealsForType.map(meal => (
                              <ListItem 
                                key={meal.id} 
                                divider
                                sx={{
                                  borderRadius: 1,
                                  py: 0.5,
                                  '&:hover': {
                                    backgroundColor: 'action.hover'
                                  },
                                  '&:last-child': {
                                    borderBottom: 'none'
                                  }
                                }}
                                onClick={() => handleOpenIngredientsDialog(meal)}
                              >
                                <Checkbox
                                  edge="start"
                                  checked={selectedMeals.includes(meal._id) || selectedMeals.includes(meal.id)}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    handleToggleMeal(meal._id || meal.id);
                                  }}
                                  disabled={isPastDate(date)}
                                  size="small"
                                />
                                <ListItemText
                                  primary={
                                    <Typography 
                                      variant="body2"
                                      sx={{ 
                                        fontSize: '0.875rem', 
                                        fontWeight: (mealIngredientStatus[meal._id] && mealIngredientStatus[meal._id].outOfStock.length > 0) || 
                                                   (mealIngredientStatus[meal.id] && mealIngredientStatus[meal.id].outOfStock.length > 0) 
                                                   ? 'bold' : 'normal',
                                        color: (mealIngredientStatus[meal._id] && mealIngredientStatus[meal._id].outOfStock.length > 0) || 
                                               (mealIngredientStatus[meal.id] && mealIngredientStatus[meal.id].outOfStock.length > 0) 
                                               ? 'error.main' : 'inherit'
                                      }}
                                    >
                                      {meal.recipe?.name || '未知菜品'}
                                    </Typography>
                                  }
                                  secondary={
                                    <Typography 
                                      variant="body2" 
                                      color="text.secondary"
                                      sx={{ fontSize: '0.75rem' }}
                                    >
                                      {`${meal.servings || 0} 份`}
                                    </Typography>
                                  }
                                />
                                <ListItemSecondaryAction sx={{ display: 'flex', alignItems: 'center' }}>
                                  {((mealIngredientStatus[meal._id] && mealIngredientStatus[meal._id].outOfStock.length > 0) || 
                                    (mealIngredientStatus[meal.id] && mealIngredientStatus[meal.id].outOfStock.length > 0)) && (
                                    <Tooltip title="添加缺少的食材到采购清单">
                                      <IconButton
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleAddToShoppingList(meal._id || meal.id);
                                        }}
                                        color="primary"
                                        size="small"
                                        sx={{ mr: 1 }}
                                      >
                                        <ShoppingCartIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                  <Typography variant="body2" color="text.secondary">查看食谱详情</Typography>
                                  <Tooltip title="查看食谱详情">
                                    <IconButton
                                      edge="end"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenIngredientsDialog(meal);
                                      }}
                                      size="small"
                                    >
                                      <InfoIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </ListItemSecondaryAction>
                              </ListItem>
                            ))}
                          </List>
                        )}
                      </Box>
                    );
                  })}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Bottom navigation controls */}
      {!loading && (
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            mt: 4,
            pt: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Paper
            elevation={2}
            sx={{
              display: 'flex',
              alignItems: 'center',
              borderRadius: 4,
              px: 2,
              py: 1,
              backgroundColor: 'background.paper',
            }}
          >
            <Button 
              onClick={handlePreviousWeek}
              startIcon={<ChevronLeftIcon />}
              sx={{ mr: 1 }}
              color="primary"
              variant="text"
            >
              上一周
            </Button>
            
            <Button 
              variant="contained" 
              color="primary"
              onClick={handleCurrentWeek}
              startIcon={<TodayIcon />}
              sx={{ 
                mx: 1,
                px: 2,
                boxShadow: dateRange.currentWeek ? 3 : 0
              }}
            >
              本周
            </Button>
            
            <Button 
              onClick={handleNextWeek}
              endIcon={<ChevronRightIcon />}
              sx={{ ml: 1 }}
              color="primary"
              variant="text"
            >
              下一周
            </Button>
          </Paper>
        </Box>
      )}
      
      {/* Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>
          <DialogContentText>
            确定要删除所选的 {selectedMeals.length} 个菜单吗？此操作不可撤销。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>取消</Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            删除
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Recipe Ingredients Dialog */}
      <Dialog 
        open={openIngredientsDialog} 
        onClose={handleCloseIngredientsDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {currentMeal?.recipe?.name || '食谱详情'} - 食材列表
        </DialogTitle>
        <DialogContent>
          {recipeDetailsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {editedIngredients.length === 0 ? (
                <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  暂无食材信息
                </Typography>
              ) : (
                <>
                  {editedIngredients.map((ingredient, index) => (
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
                      <Grid item xs={6} sm={2} sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton
                          color="error"
                          onClick={() => handleRemoveIngredient(index)}
                          disabled={editedIngredients.length <= 1}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  ))}
                </>
              )}
              
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
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseIngredientsDialog}>取消</Button>
          <Button 
            onClick={handleSaveIngredients} 
            variant="contained"
            disabled={savingIngredients}
          >
            {savingIngredients ? <CircularProgress size={24} /> : '保存'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
});

export default MealPlanPage; 
