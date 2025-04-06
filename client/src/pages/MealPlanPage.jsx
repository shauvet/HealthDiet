import { useEffect, useState } from 'react';
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
  
  useEffect(() => {
    fetchMeals();
  }, [fetchMeals]);
  
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
  
  const fetchMeals = async () => {
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
        <Grid container spacing={2}>
          {weekDates.map((date, dateIndex) => (
            <Grid item xs={12} md={6} lg={4} key={dateIndex}>
              <Card 
                elevation={isToday(date) ? 3 : 1}
                sx={{
                  opacity: isPastDate(date) ? 0.8 : 1,
                  border: isToday(date) ? '2px solid #4caf50' : 'none'
                }}
              >
                <CardHeader
                  title={formatDate(date)}
                  titleTypographyProps={{ variant: 'h6' }}
                  action={
                    isToday(date) && (
                      <Chip label="今天" color="primary" size="small" />
                    )
                  }
                />
                <Divider />
                <CardContent>
                  {['breakfast', 'lunch', 'dinner'].map(mealType => {
                    const mealsForType = getMealsForDateAndType(date, mealType);
                    return (
                      <Box key={mealType} sx={{ mb: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          {getMealTypeText(mealType)}
                        </Typography>
                        
                        {mealsForType.length === 0 ? (
                          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            暂无菜单
                          </Typography>
                        ) : (
                          <List dense>
                            {mealsForType.map(meal => (
                              <ListItem key={meal.id} divider>
                                <Checkbox
                                  edge="start"
                                  checked={selectedMeals.includes(meal.id)}
                                  onChange={() => handleToggleMeal(meal.id)}
                                  disabled={isPastDate(date)}
                                />
                                <ListItemText
                                  primary={meal.recipe?.name || '未知菜品'}
                                  secondary={`${meal.servings} 份`}
                                />
                                <ListItemSecondaryAction>
                                  <IconButton 
                                    edge="end" 
                                    onClick={() => handleCheckIngredients(meal.id)}
                                    color={getMealStatus(meal)}
                                  >
                                    <InventoryIcon />
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
