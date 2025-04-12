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
  Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TodayIcon from '@mui/icons-material/Today';
import InventoryIcon from '@mui/icons-material/Inventory';
import { mealPlanStore } from '../stores/RootStore';

const MealPlanPage = observer(() => {
  const [selectedMeals, setSelectedMeals] = useState([]);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mealIngredientStatus, setMealIngredientStatus] = useState({});
  const todayCardRef = useRef(null);
  
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
  
  // Auto-scroll to today's menu when data is loaded
  useEffect(() => {
    if (!loading && todayCardRef.current) {
      setTimeout(() => {
        todayCardRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
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
  
  const handleCheckIngredients = async (mealId) => {
    try {
      const status = await mealPlanStore.checkIngredientStatus(mealId);
      setMealIngredientStatus({
        ...mealIngredientStatus,
        [mealId]: status
      });
    } catch (error) {
      console.error('Failed to check ingredients:', error);
    }
  };
  
  const getMealsForDateAndType = (date, mealType) => {
    const formattedDate = formatDateForAPI(date);
    return mealPlanStore.mealPlans.filter(
      meal => meal.date === formattedDate && meal.mealType === mealType
    );
  };
  
  const getMealStatus = (meal) => {
    // If we have ingredient status for this meal
    if (mealIngredientStatus[meal.id]) {
      const status = mealIngredientStatus[meal.id];
      if (status.outOfStock.length > 0) {
        return 'warning';
      }
      return 'success';
    }
    return 'default';
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
                              >
                                <Checkbox
                                  edge="start"
                                  checked={selectedMeals.includes(meal.id)}
                                  onChange={() => handleToggleMeal(meal.id)}
                                  disabled={isPastDate(date)}
                                  size="small"
                                />
                                <ListItemText
                                  primary={
                                    <Typography 
                                      variant="body2"
                                      sx={{ fontSize: '0.875rem' }}
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
                                <ListItemSecondaryAction>
                                  <IconButton 
                                    edge="end" 
                                    onClick={() => handleCheckIngredients(meal.id)}
                                    color={getMealStatus(meal)}
                                    size="small"
                                  >
                                    <InventoryIcon fontSize="small" />
                                  </IconButton>
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
    </Box>
  );
});

export default MealPlanPage; 
