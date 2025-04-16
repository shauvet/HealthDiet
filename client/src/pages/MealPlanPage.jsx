import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  CircularProgress,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  TextField,
  MenuItem,
  Paper,
  Tooltip,
  Chip,
  FormControl,
  InputLabel,
  Select,
  Icon,
  Alert,
  Rating,
  Checkbox
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  Restaurant as RestaurantIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  AddShoppingCart as ShoppingCartIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Today as TodayIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Add as AddIcon,
  Remove as RemoveIcon
} from '@mui/icons-material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { mealPlanStore, inventoryStore, recipeStore } from '../stores/RootStore';

const initialIngredient = {
  name: '',
  quantity: '',
  unit: 'g', // Default to grams
  isMain: true
};

const MealPlanPage = observer(() => {
  // 添加debugId用于标识组件实例
  const debugId = useRef(`mealplan-${Math.random().toString(36).substr(2, 9)}`);
  const navigate = useNavigate();
  const [selectedMeals, setSelectedMeals] = useState([]);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mealIngredientStatus, setMealIngredientStatus] = useState({});
  const todayCardRef = useRef(null);
  const [ingredientsChecked, setIngredientsChecked] = useState(false);
  
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

  const formatDateForAPI = (date) => {
    return date.toISOString().split('T')[0];
  };

  // 提取一个函数，用于处理购物清单和食材状态
  const updateMealIngredientsFromShoppingList = useCallback(() => {
    // 如果没有膳食计划数据，则不处理
    if (mealPlanStore.mealPlans.length === 0) return;
    
    console.log(`[${debugId.current}] Processing shopping list against meal plans`);
    
    // 处理每个膳食计划的食材状态
    const newIngredientStatus = {};
    
    mealPlanStore.mealPlans.forEach(meal => {
      const mealId = String(meal._id || meal.id);
      let ingredients = [];
      
      // 从膳食计划中获取食材
      if (meal.ingredients && Array.isArray(meal.ingredients)) {
        ingredients = meal.ingredients;
      } else if (meal.recipe && meal.recipe.ingredients && Array.isArray(meal.recipe.ingredients)) {
        ingredients = meal.recipe.ingredients;
      } else if (meal.recipeId && typeof meal.recipeId === 'object' && 
                meal.recipeId.ingredients && Array.isArray(meal.recipeId.ingredients)) {
        ingredients = meal.recipeId.ingredients;
      }
      
      // 检查食材是否在购物清单中
      if (ingredients && ingredients.length > 0) {
        const inShoppingList = ingredients.filter(ingredient => 
          inventoryStore.shoppingList.some(item => 
            item.name.toLowerCase() === ingredient.name.toLowerCase()
          )
        );
        
        newIngredientStatus[mealId] = {
          inShoppingList: inShoppingList
        };
        
        // 同时为meal.id和meal._id都存储状态，确保在UI中能够找到
        if (meal.id) {
          newIngredientStatus[String(meal.id)] = { inShoppingList: inShoppingList };
        }
        if (meal._id) {
          newIngredientStatus[String(meal._id)] = { inShoppingList: inShoppingList };
        }
      }
    });
    
    console.log(`[${debugId.current}] Updated ingredient status based on shopping list:`, newIngredientStatus);
    setMealIngredientStatus(newIngredientStatus);
    setIngredientsChecked(true);
  }, [debugId]);

  // 创建一个函数，用于智能获取购物清单数据
  const getShoppingList = useCallback(async () => {
    await inventoryStore.fetchShoppingList();
  }, []);
  
  const fetchMeals = useCallback(async () => {
    setLoading(true);
    setError('');
    setIngredientsChecked(false);
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
  }, [dateRange.startDate, dateRange.endDate]);
  
  useEffect(() => {
    // 先加载购物清单数据，然后加载膳食计划数据
    const loadData = async () => {
      try {
        // 先获取购物清单数据
        await getShoppingList();
        
        // 再加载膳食计划
        await fetchMeals();
      } catch (error) {
        console.error(`Error loading initial data:`, error);
        // 即使获取购物清单失败，也尝试加载膳食计划
        fetchMeals();
      }
    };
    
    loadData();
    // 添加所有必要的依赖
  }, [getShoppingList, fetchMeals]);
  
  // 简化数据加载和处理逻辑，仅在必要时触发API调用
  useEffect(() => {
    // 只有当膳食计划加载完成且不在加载状态时才处理
    if (mealPlanStore.mealPlans.length > 0 && !loading) {
      console.log(`[${debugId.current}] Processing meal plans after loading`);
      
      // 使用异步IIFE避免在useEffect中直接使用async
      (async () => {
        // 只有在尚未检查食材且购物清单已加载的情况下才处理
        if (!ingredientsChecked) {
          updateMealIngredientsFromShoppingList();
        }
      })();
    }
  }, [loading, ingredientsChecked, updateMealIngredientsFromShoppingList]);
  
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
  
  const handlePreviousWeek = () => {
    const newStartDate = new Date(dateRange.startDate);
    newStartDate.setDate(dateRange.startDate.getDate() - 7);
    const newEndDate = new Date(newStartDate);
    newEndDate.setDate(newStartDate.getDate() + 6);
    setDateRange({ startDate: newStartDate, endDate: newEndDate, currentWeek: false });
    // 这里我们直接调用fetchMeals，这样可以确保所有状态都被正确重置
    fetchMeals();
  };
  
  const handleNextWeek = () => {
    const newStartDate = new Date(dateRange.startDate);
    newStartDate.setDate(dateRange.startDate.getDate() + 7);
    const newEndDate = new Date(newStartDate);
    newEndDate.setDate(newStartDate.getDate() + 6);
    setDateRange({ startDate: newStartDate, endDate: newEndDate, currentWeek: false });
    // 这里我们直接调用fetchMeals，这样可以确保所有状态都被正确重置
    fetchMeals();
  };
  
  const handleCurrentWeek = () => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - today.getDay());
    
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    
    setDateRange({ startDate, endDate, currentWeek: true });
    // 这里我们直接调用fetchMeals，这样可以确保所有状态都被正确重置
    fetchMeals();
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
  
  const ToShoppingList = async () => {
    navigate('/inventory?tab=shopping');
  };
  
  const getMealsForDateAndType = (date, mealType) => {
    const formattedDate = formatDateForAPI(date);
    return mealPlanStore.mealPlans.filter(meal => {
      // Get just the date part from the meal's date, regardless of its format
      const mealDateStr = meal.date instanceof Date 
        ? formatDateForAPI(meal.date) 
        : typeof meal.date === 'string' 
          ? meal.date.split('T')[0] 
          : null;
      
      return mealDateStr === formattedDate && meal.mealType === mealType;
    });
  };
  
  // Recipe ingredients dialog handlers
  const handleOpenIngredientsDialog = async (meal) => {
    setCurrentMeal(meal);
    
    try {
      // Get ingredients based on the new data structure
      if (meal.ingredients && meal.ingredients.length > 0) {
        // If ingredients are already at root level, use them directly
        setEditedIngredients([...meal.ingredients]);
      } else if (meal.recipe && meal.recipe.ingredients && meal.recipe.ingredients.length > 0) {
        // If ingredients are in the recipe object, use them from there
        setEditedIngredients([...meal.recipe.ingredients]);
      } else if (meal.recipeId && typeof meal.recipeId !== 'string') {
        // For backwards compatibility - if recipeId is still an object
        if (meal.recipeId.ingredients && meal.recipeId.ingredients.length > 0) {
          setEditedIngredients([...meal.recipeId.ingredients]);
        }
      } else if (meal.recipe && meal.recipe.id) {
        // If meal has recipe ID but no ingredients, fetch them from the API
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
    if (!currentMeal) return;
    
    setSavingIngredients(true);
    try {
      // Determine the recipe ID based on the new structure
      const recipeId = 
        (currentMeal.recipe && currentMeal.recipe.id) || // Recipe object with ID
        (typeof currentMeal.recipeId === 'string' ? currentMeal.recipeId : // String recipeId
         (currentMeal.recipeId && currentMeal.recipeId._id) || // Old structure object recipeId
          null);
      
      if (!recipeId) {
        throw new Error('Recipe ID not found');
      }
      
      // Here we would call an API to update the recipe ingredients
      await recipeStore.updateRecipeIngredients(recipeId, editedIngredients);
      
      // 手动更新本地膳食计划数据
      const updatedMealPlans = mealPlanStore.mealPlans.map(meal => {
        // 检查是否是当前编辑的膳食
        if ((meal._id === currentMeal._id) || (meal.id === currentMeal.id)) {
          // 创建新的膳食对象，深拷贝
          const updatedMeal = {...meal};
          
          // 根据数据结构决定如何更新食材
          if (meal.ingredients) {
            updatedMeal.ingredients = [...editedIngredients];
          } else if (meal.recipe && meal.recipe.ingredients) {
            updatedMeal.recipe = {
              ...meal.recipe,
              ingredients: [...editedIngredients]
            };
          } else if (meal.recipeId && typeof meal.recipeId === 'object') {
            updatedMeal.recipeId = {
              ...meal.recipeId,
              ingredients: [...editedIngredients]
            };
          }
          
          return updatedMeal;
        }
        return meal;
      });
      
      // 手动更新 MobX store 中的数据
      mealPlanStore.mealPlans = updatedMealPlans;
      
      // 只重置食材检查状态
      setIngredientsChecked(false);
      
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
  
  // 创建一个辅助函数，用于检查购物清单状态
  const hasIngredientsInShoppingList = (meal) => {
    if (!meal) return false;
    
    // 获取meal的ID，以字符串形式
    const mealId = String(meal._id || meal.id || '');
    const status = mealIngredientStatus[mealId];
    
    // 确保状态对象和inShoppingList数组有效
    return status && 
           status.inShoppingList && 
           Array.isArray(status.inShoppingList) && 
           status.inShoppingList.length > 0;
  };
  
  // 修改强制更新函数，避免重复获取购物清单
  const forceUpdateShoppingListStatus = async () => {
    if (mealPlanStore.mealPlans.length === 0) return;
    
    setLoading(true);
    try {
        // 强制刷新购物清单
        await getShoppingList(true);
        
        // 重置食材检查状态，以便触发重新检查
        setIngredientsChecked(false);
        setSuccess('已更新所有食材状态');
    } catch (error) {
      setError('更新食材状态失败: ' + error.message);
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
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
      
      {!loading && mealPlanStore.mealPlans.length > 0 && (
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={forceUpdateShoppingListStatus}
            size="small"
          >
            刷新食材状态
          </Button>
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
                  flexDirection: 'column',
                  backgroundColor: isPastDate(date) ? 'rgba(0, 0, 0, 0.05)' : 'background.paper'
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
                                key={meal.id || meal._id} 
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
                                        fontWeight: (!isPastDate(date) && hasIngredientsInShoppingList(meal)) ? 'bold' : 'normal',
                                        color: (!isPastDate(date) && hasIngredientsInShoppingList(meal)) ? 'error.main' : 'inherit'
                                      }}
                                    >
                                      {meal.name || (meal.recipe && meal.recipe.name) || '未知菜品'}
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
                                  {(!isPastDate(date) && hasIngredientsInShoppingList(meal)) ? (
                                    <Tooltip title="添加缺少的食材到采购清单">
                                      <IconButton
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          ToShoppingList();
                                        }}
                                        color="primary"
                                        size="small"
                                        sx={{ mr: 1 }}
                                      >
                                        <ShoppingCartIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  ) : null}
                                  {!isPastDate(date) && <Box onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenIngredientsDialog(meal);
                                      }} sx={{display: 'flex', alignItems: 'center'}}>
                                  <Typography variant="body2" color="text.secondary">查看食谱详情</Typography>
                                  <Tooltip title="查看食谱详情">
                                    <IconButton
                                      edge="end"
                                      size="small"
                                    >
                                      <InfoIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  </Box>}
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
          {currentMeal?.name || (currentMeal?.recipe?.name) || '食谱详情'} - 食材列表
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
