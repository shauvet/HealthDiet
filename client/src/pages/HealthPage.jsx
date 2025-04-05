import { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  ButtonGroup,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Card,
  CardContent,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Tabs,
  Tab
} from '@mui/material';
import { styled } from '@mui/material/styles';
import TodayIcon from '@mui/icons-material/Today';
import DateRangeIcon from '@mui/icons-material/DateRange';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import ShowChartIcon from '@mui/icons-material/ShowChart';

// Using MUI X Date Pickers would be better in a real app
// For simplicity, we'll use the basic TextField with type="date"

import { healthStore } from '../stores/RootStore';

// Tab Panel Component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`health-tabpanel-${index}`}
      aria-labelledby={`health-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Placeholder for charts - in a real app you would use a charting library
// like Chart.js, Recharts, or nivo
const ChartPlaceholder = styled(Box)(({ theme }) => ({
  height: 300,
  border: `1px dashed ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  "& .placeholder-text": {
    color: theme.palette.text.secondary,
  }
}));

const NutrientProgressIndicator = ({ label, value, max, unit, color }) => {
  const percentage = Math.min(100, (value / max) * 100);
  
  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="body2">{label}</Typography>
        <Typography variant="body2" color="text.secondary">
          {value}{unit} / {max}{unit}
        </Typography>
      </Box>
      <Box sx={{ position: 'relative', height: 8, bgcolor: 'grey.200', borderRadius: 1 }}>
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            borderRadius: 1,
            width: `${percentage}%`,
            bgcolor: color,
          }}
        />
      </Box>
    </Box>
  );
};

const HealthPage = observer(() => {
  const [tabValue, setTabValue] = useState(0);
  const [timeRange, setTimeRange] = useState('week');
  const [customDateRange, setCustomDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  
  // Example data - would come from the store in a real app
  const nutrientData = {
    calories: { value: 1850, max: 2000, unit: 'kcal', color: 'warning.main' },
    protein: { value: 75, max: 80, unit: 'g', color: 'success.main' },
    fat: { value: 65, max: 70, unit: 'g', color: 'error.main' },
    carbs: { value: 220, max: 250, unit: 'g', color: 'info.main' },
    fiber: { value: 22, max: 30, unit: 'g', color: 'secondary.main' },
  };
  
  // Example top food items - would come from the API
  const topRecipes = [
    { name: '番茄炒蛋', count: 7 },
    { name: '红烧肉', count: 5 },
    { name: '清蒸鱼', count: 4 },
    { name: '炒青菜', count: 4 },
    { name: '鱼香肉丝', count: 3 },
  ];
  
  const topIngredients = [
    { name: '鸡蛋', count: 14 },
    { name: '西红柿', count: 9 },
    { name: '猪肉', count: 8 },
    { name: '青菜', count: 8 },
    { name: '大米', count: 7 },
  ];
  
  useEffect(() => {
    // When component mounts or time range changes, fetch data
    healthStore.setTimeRange(timeRange);
    
    if (timeRange === 'custom') {
      healthStore.setCustomDateRange(customDateRange.startDate, customDateRange.endDate);
    }
    
    healthStore.fetchAllStats();
  }, [timeRange, customDateRange]);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };
  
  const handleDateRangeChange = (e) => {
    setCustomDateRange({
      ...customDateRange,
      [e.target.name]: e.target.value
    });
  };
  
  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1">健康分析</Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel id="time-range-label">时间范围</InputLabel>
            <Select
              labelId="time-range-label"
              id="time-range-select"
              value={timeRange}
              label="时间范围"
              onChange={handleTimeRangeChange}
            >
              <MenuItem value="week">最近一周</MenuItem>
              <MenuItem value="month">最近一月</MenuItem>
              <MenuItem value="year">最近一年</MenuItem>
              <MenuItem value="custom">自定义</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>
      
      {/* Custom date range selector */}
      {timeRange === 'custom' && (
        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
          <TextField
            label="开始日期"
            type="date"
            name="startDate"
            value={customDateRange.startDate}
            onChange={handleDateRangeChange}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <TextField
            label="结束日期"
            type="date"
            name="endDate"
            value={customDateRange.endDate}
            onChange={handleDateRangeChange}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </Box>
      )}
      
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          aria-label="health analysis tabs"
        >
          <Tab icon={<EqualizerIcon />} label="营养摄入" />
          <Tab icon={<ShowChartIcon />} label="食品统计" />
        </Tabs>
      </Paper>
      
      {/* Nutrition Tab */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardHeader title="日均营养摄入" />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <ChartPlaceholder>
                      <Typography className="placeholder-text">营养摄入雷达图</Typography>
                    </ChartPlaceholder>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        营养素摄入状况
                      </Typography>
                      {Object.entries(nutrientData).map(([key, data]) => (
                        <NutrientProgressIndicator
                          key={key}
                          label={key === 'calories' ? '热量' : 
                                 key === 'protein' ? '蛋白质' :
                                 key === 'fat' ? '脂肪' :
                                 key === 'carbs' ? '碳水化合物' : '纤维'}
                          value={data.value}
                          max={data.max}
                          unit={data.unit}
                          color={data.color}
                        />
                      ))}
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12}>
            <Card>
              <CardHeader title="营养摄入趋势" />
              <CardContent>
                <ChartPlaceholder>
                  <Typography className="placeholder-text">营养摄入趋势图</Typography>
                </ChartPlaceholder>
                <Typography variant="body2" color="text.secondary">
                  此图表显示了您在所选时间范围内的营养摄入趋势。您可以通过查看这些数据来调整您的饮食计划。
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="维生素摄入" />
              <CardContent>
                <ChartPlaceholder sx={{ height: 250 }}>
                  <Typography className="placeholder-text">维生素摄入柱状图</Typography>
                </ChartPlaceholder>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="矿物质摄入" />
              <CardContent>
                <ChartPlaceholder sx={{ height: 250 }}>
                  <Typography className="placeholder-text">矿物质摄入柱状图</Typography>
                </ChartPlaceholder>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
      
      {/* Food Statistics Tab */}
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardHeader title="饮食结构分析" />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <ChartPlaceholder>
                      <Typography className="placeholder-text">饮食结构饼图</Typography>
                    </ChartPlaceholder>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      建议改进
                    </Typography>
                    <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                      <Typography variant="body2" paragraph>
                        • 增加蔬菜水果的摄入量，建议每天300-500克
                      </Typography>
                      <Typography variant="body2" paragraph>
                        • 减少精制碳水化合物，增加全谷物的比例
                      </Typography>
                      <Typography variant="body2" paragraph>
                        • 适当增加优质蛋白质的摄入，如鱼类、鸡肉和豆制品
                      </Typography>
                      <Typography variant="body2">
                        • 减少油炸食品和加工食品的摄入频率
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="常吃菜品 Top 5" />
              <CardContent>
                <List>
                  {topRecipes.map((recipe, index) => (
                    <ListItem key={index} divider={index < topRecipes.length - 1}>
                      <ListItemText 
                        primary={recipe.name} 
                        secondary={`食用次数: ${recipe.count}`} 
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="常用食材 Top 5" />
              <CardContent>
                <List>
                  {topIngredients.map((ingredient, index) => (
                    <ListItem key={index} divider={index < topIngredients.length - 1}>
                      <ListItemText 
                        primary={ingredient.name} 
                        secondary={`使用次数: ${ingredient.count}`} 
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12}>
            <Card>
              <CardHeader title="食材使用频率" />
              <CardContent>
                <ChartPlaceholder>
                  <Typography className="placeholder-text">食材使用频率热图</Typography>
                </ChartPlaceholder>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  此图表显示了各类食材在您饮食中的使用频率。颜色越深表示使用频率越高。
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
      
      {healthStore.loading && (
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          zIndex: 1000,
        }}>
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
});

export default HealthPage; 
