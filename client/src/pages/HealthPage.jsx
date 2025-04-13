import { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Tabs,
  Tab,
  Container,
  ListItemIcon
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AssessmentIcon from '@mui/icons-material/Assessment';
import LightbulbIcon from '@mui/icons-material/Lightbulb';

// Using MUI X Date Pickers would be better in a real app
// For simplicity, we'll use the basic TextField with type="date"

import { healthStore } from '../stores/RootStore';

// 默认数据，在没有实际数据时使用
const DEFAULT_NUTRIENT_DATA = {
  calories: { value: 1800, max: 2200, unit: 'kcal', color: '#f44336' },
  protein: { value: 60, max: 80, unit: 'g', color: '#3f51b5' },
  fat: { value: 55, max: 65, unit: 'g', color: '#ff9800' },
  carbs: { value: 220, max: 300, unit: 'g', color: '#4caf50' },
  fiber: { value: 15, max: 25, unit: 'g', color: '#9c27b0' }
};

const DEFAULT_NUTRITION_TRENDS = {
  data: {
    calories: [1750, 1900, 1850, 2000, 1800, 1700, 1950],
    protein: [55, 65, 70, 60, 58, 63, 68],
    fat: [50, 60, 55, 65, 52, 58, 60],
    carbs: [240, 200, 210, 230, 220, 235, 215],
    fiber: [12, 15, 18, 14, 16, 17, 19]
  },
  dates: ['10/01', '10/02', '10/03', '10/04', '10/05', '10/06', '10/07']
};

const DEFAULT_VITAMIN_INTAKE = [
  { name: '维生素A', current: 700, recommended: 900, unit: 'μg' },
  { name: '维生素C', current: 75, recommended: 90, unit: 'mg' },
  { name: '维生素D', current: 10, recommended: 15, unit: 'μg' },
  { name: '维生素E', current: 12, recommended: 15, unit: 'mg' },
  { name: '维生素B6', current: 1.5, recommended: 1.7, unit: 'mg' },
  { name: '维生素B12', current: 2.2, recommended: 2.4, unit: 'μg' }
];

const DEFAULT_MINERAL_INTAKE = [
  { name: '钙', current: 850, recommended: 1000, unit: 'mg' },
  { name: '铁', current: 12, recommended: 18, unit: 'mg' },
  { name: '镁', current: 320, recommended: 400, unit: 'mg' },
  { name: '锌', current: 9, recommended: 11, unit: 'mg' },
  { name: '钾', current: 3200, recommended: 4700, unit: 'mg' },
  { name: '钠', current: 2300, recommended: 2300, unit: 'mg' }
];

// 默认饮食结构数据
const DEFAULT_DIET_STRUCTURE = {
  grains: { value: 25, recommended: 25, unit: '%' },
  vegetables: { value: 30, recommended: 35, unit: '%' },
  fruits: { value: 12, recommended: 15, unit: '%' },
  protein: { value: 18, recommended: 20, unit: '%' },
  dairy: { value: 10, recommended: 15, unit: '%' },
  fats: { value: 5, recommended: 10, unit: '%' }
};

// 默认食材多样性数据
const DEFAULT_INGREDIENT_DIVERSITY = {
  vegetables: { count: 12, target: 20, description: '蔬菜品类' },
  fruits: { count: 7, target: 10, description: '水果品类' },
  proteins: { count: 5, target: 8, description: '蛋白质来源' },
  grains: { count: 3, target: 5, description: '谷物类' }
};

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
    <Box sx={{ mb: 2, width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5, width: '100%' }}>
        <Typography variant="body2">{label}</Typography>
        <Typography variant="body2" color="text.secondary">
          {value}{unit} / {max}{unit}
        </Typography>
      </Box>
      <Box sx={{ position: 'relative', height: 8, bgcolor: 'grey.200', borderRadius: 1, width: '100%' }}>
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
  
  useEffect(() => {
    // When component mounts or time range changes, fetch data
    healthStore.setTimeRange(timeRange);
    
    if (timeRange === 'custom') {
      healthStore.setCustomDateRange(customDateRange.startDate, customDateRange.endDate);
    }
    
    healthStore.fetchAllHealthData().then(() => {
      console.log('Fetched nutrition data:', healthStore.nutrientData);
      console.log('Fetched diet structure:', healthStore.dietStructure);
    });
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
  
  // 渲染营养素进度条
  const NutrientBar = ({ name, current, recommended, unit }) => {
    const percentage = recommended > 0 ? (current / recommended) * 100 : 0;
    return (
      <Box sx={{ mb: 2, width: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5, width: '100%' }}>
          <Typography variant="body2">{name}</Typography>
          <Typography variant="body2" color="text.secondary">
            {current}{unit} / {recommended}{unit}
          </Typography>
        </Box>
        <Box sx={{ position: 'relative', height: 8, bgcolor: 'grey.200', borderRadius: 1, width: '100%' }}>
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              top: 0,
              height: '100%',
              borderRadius: 1,
              width: `${Math.min(percentage, 100)}%`,
              bgcolor: percentage >= 90 ? 'success.main' :
                      percentage >= 60 ? 'warning.main' : 'error.main',
            }}
          />
        </Box>
      </Box>
    );
  };

  // 使用实际数据或默认数据
  const hasNonZeroValues = (data) => {
    if (!data) return false;
    
    // 检查对象中是否有非零值
    if (typeof data === 'object' && !Array.isArray(data)) {
      return Object.values(data).some(val => 
        typeof val === 'object' && val?.value ? val.value > 0 : val > 0
      );
    }
    
    // 检查数组中是否有非零值
    if (Array.isArray(data)) {
      return data.some(item => 
        item.current > 0
      );
    }
    
    return false;
  };
  
  const nutrientData = healthStore.nutrientData && Object.keys(healthStore.nutrientData).length > 0 && 
                      hasNonZeroValues(healthStore.nutrientData)
                      ? healthStore.nutrientData : DEFAULT_NUTRIENT_DATA;
  
  const nutritionTrends = healthStore.nutritionTrends && 
                         healthStore.nutritionTrends.data && 
                         Object.keys(healthStore.nutritionTrends.data).length > 0 &&
                         hasNonZeroValues(healthStore.nutritionTrends.data)
                         ? healthStore.nutritionTrends : DEFAULT_NUTRITION_TRENDS;
  
  const vitaminIntake = healthStore.vitaminIntake && healthStore.vitaminIntake.length > 0 &&
                       hasNonZeroValues(healthStore.vitaminIntake)
                       ? healthStore.vitaminIntake : DEFAULT_VITAMIN_INTAKE;
                       
  const mineralIntake = healthStore.mineralIntake && healthStore.mineralIntake.length > 0 &&
                       hasNonZeroValues(healthStore.mineralIntake)
                       ? healthStore.mineralIntake : DEFAULT_MINERAL_INTAKE;

  // 饮食结构数据
  const dietStructure = healthStore.dietStructure && Object.keys(healthStore.dietStructure).length > 0 &&
                        hasNonZeroValues(healthStore.dietStructure)
                       ? healthStore.dietStructure : DEFAULT_DIET_STRUCTURE;
                       
  // 食材多样性数据
  const ingredientDiversity = healthStore.ingredientDiversity && Object.keys(healthStore.ingredientDiversity).length > 0 &&
                              hasNonZeroValues(healthStore.ingredientDiversity)
                             ? healthStore.ingredientDiversity : DEFAULT_INGREDIENT_DIVERSITY;

  return (
    <Box sx={{ 
      width: '100%',
      maxWidth: '100%',
      overflow: 'hidden',
      margin: 0,
      padding: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <Container 
        maxWidth={false}
        disableGutters
        sx={{ 
          padding: 0,
          paddingTop: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Box sx={{ 
          width: '100%',
          maxWidth: { xs: '100%', sm: '600px' },
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 3,
          px: { xs: 2, sm: 0 }
        }}>
          <Typography variant="h5" component="h1">健康分析</Typography>
          
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel id="time-range-select-label">时间范围</InputLabel>
            <Select
              labelId="time-range-select-label"
              id="time-range-select"
              value={timeRange}
              label="时间范围"
              onChange={handleTimeRangeChange}
            >
              <MenuItem value="week">最近一周</MenuItem>
              <MenuItem value="month">最近一月</MenuItem>
              <MenuItem value="custom">自定义</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        {timeRange === 'custom' && (
          <Box sx={{ 
            width: '100%',
            maxWidth: { xs: '100%', sm: '600px' },
            display: 'flex',
            justifyContent: 'space-between',
            mb: 3,
            px: { xs: 2, sm: 0 }
          }}>
            <TextField
              label="开始日期"
              type="date"
              name="startDate"
              value={customDateRange.startDate}
              onChange={(e) => handleDateRangeChange(e)}
              InputLabelProps={{ shrink: true }}
              sx={{ width: '48%' }}
            />
            <TextField
              label="结束日期"
              type="date"
              name="endDate"
              value={customDateRange.endDate}
              onChange={(e) => handleDateRangeChange(e)}
              InputLabelProps={{ shrink: true }}
              sx={{ width: '48%' }}
            />
          </Box>
        )}
        
        <Box sx={{ 
          width: '100%',
          maxWidth: { xs: '100%', sm: '600px' },
          mb: 3
        }}>
          <Paper sx={{ width: '100%' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="fullWidth"
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab label="营养摄入" />
              <Tab label="食品统计" />
            </Tabs>
          </Paper>
        </Box>
        
        {/* Nutrition Tab */}
        <Box 
          sx={{ 
            display: tabValue === 0 ? 'flex' : 'none',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            maxWidth: '100%'
          }}
        >
          {/* 日均营养摄入 */}
          <Box sx={{ 
            width: '100%', 
            maxWidth: { xs: '100%', sm: '600px' },
            px: { xs: 2, sm: 0 }
          }}>
            <Card sx={{ 
              width: '100%',
              borderRadius: { xs: 0, sm: 1 },
              boxShadow: { xs: 'none', sm: 1 },
              mb: { xs: 2, sm: 3 }
            }}>
              <CardHeader title="日均营养摄入" />
              <CardContent sx={{ 
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                <Grid container spacing={2} sx={{ width: '100%' }}>
                  <Grid item xs={12} md={6}>
                    <ChartPlaceholder sx={{
                      width: '100%',
                      minHeight: { xs: 200, sm: 300 }
                    }}>
                      <Typography className="placeholder-text">营养摄入雷达图</Typography>
                    </ChartPlaceholder>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ width: '100%' }}>
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
          </Box>
          
          {/* 营养摄入趋势 */}
          <Box sx={{ 
            width: '100%', 
            maxWidth: { xs: '100%', sm: '600px' },
            px: { xs: 2, sm: 0 }
          }}>
            <Card sx={{ 
              width: '100%',
              borderRadius: { xs: 0, sm: 1 },
              boxShadow: { xs: 'none', sm: 1 },
              mb: { xs: 2, sm: 3 }
            }}>
              <CardHeader title="营养摄入趋势" />
              <CardContent sx={{ 
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                <Box sx={{ mb: 3, width: '100%' }}>
                  <Typography variant="subtitle1" gutterBottom>
                    最近7天营养摄入变化
                  </Typography>
                  {Object.entries(nutritionTrends.data).map(([nutrient, values]) => (
                    <Box key={nutrient} sx={{ mb: 2, width: '100%' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5, width: '100%' }}>
                        <Typography variant="body2">
                          {nutrient === 'calories' ? '热量 (kcal)' :
                            nutrient === 'protein' ? '蛋白质 (g)' :
                            nutrient === 'fat' ? '脂肪 (g)' :
                            nutrient === 'carbs' ? '碳水化合物 (g)' : '膳食纤维 (g)'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          平均: {Math.round(values.reduce((a, b) => a + b, 0) / values.length)}
                        </Typography>
                      </Box>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'flex-end', 
                        height: 40, 
                        width: '100%'
                      }}>
                        {values.map((value, index) => (
                          <Box
                            key={index}
                            sx={{
                              flex: 1,
                              mx: { xs: 0.1, sm: 0.5 },
                              height: `${Math.max(...values) > 0 ? (value / Math.max(...values)) * 100 : 0}%`,
                              bgcolor: 'primary.main',
                              borderRadius: '2px 2px 0 0',
                              position: 'relative',
                              minWidth: { xs: 0, sm: 'auto' },
                              '&:hover': {
                                bgcolor: 'primary.dark',
                              }
                            }}
                          />
                        ))}
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5, width: '100%' }}>
                        {nutritionTrends.dates.map((date, index) => (
                          <Typography key={index} variant="caption" color="text.secondary" sx={{ 
                            flex: 1, 
                            textAlign: 'center',
                            fontSize: { xs: '0.6rem', sm: '0.75rem' },
                            px: { xs: 0, sm: 0.5 },
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {date}
                          </Typography>
                        ))}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Box>
          
          {/* 维生素摄入 */}
          <Box sx={{ 
            width: '100%', 
            maxWidth: { xs: '100%', sm: '600px' },
            px: { xs: 2, sm: 0 }
          }}>
            <Card sx={{ 
              width: '100%',
              borderRadius: { xs: 0, sm: 1 },
              boxShadow: { xs: 'none', sm: 1 },
              mb: { xs: 2, sm: 3 }
            }}>
              <CardHeader title="维生素摄入" />
              <CardContent sx={{ 
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                {vitaminIntake.map((vitamin) => (
                  <NutrientBar
                    key={vitamin.name}
                    name={vitamin.name}
                    current={vitamin.current}
                    recommended={vitamin.recommended}
                    unit={vitamin.unit}
                  />
                ))}
              </CardContent>
            </Card>
          </Box>
          
          {/* 矿物质摄入 */}
          <Box sx={{ 
            width: '100%', 
            maxWidth: { xs: '100%', sm: '600px' },
            px: { xs: 2, sm: 0 }
          }}>
            <Card sx={{ 
              width: '100%',
              borderRadius: { xs: 0, sm: 1 },
              boxShadow: { xs: 'none', sm: 1 },
              mb: { xs: 2, sm: 3 }
            }}>
              <CardHeader title="矿物质摄入" />
              <CardContent sx={{ 
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                {mineralIntake.map((mineral) => (
                  <NutrientBar
                    key={mineral.name}
                    name={mineral.name}
                    current={mineral.current}
                    recommended={mineral.recommended}
                    unit={mineral.unit}
                  />
                ))}
              </CardContent>
            </Card>
          </Box>
        </Box>
        
        {/* Food Statistics Tab */}
        <Box 
          sx={{ 
            display: tabValue === 1 ? 'flex' : 'none',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            maxWidth: '100%'
          }}
        >
          {/* 饮食结构分析 */}
          <Box sx={{ 
            width: '100%', 
            maxWidth: { xs: '100%', sm: '600px' },
            px: { xs: 2, sm: 0 }
          }}>
            <Card sx={{ 
              width: '100%',
              borderRadius: { xs: 0, sm: 1 },
              boxShadow: { xs: 'none', sm: 1 },
              mb: { xs: 2, sm: 3 }
            }}>
              <CardHeader title="饮食结构分析" />
              <CardContent sx={{ 
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                <Grid container spacing={2} sx={{ width: '100%' }}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ 
                      width: '100%',
                      height: { xs: 200, sm: 300 },
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Typography variant="body1" color="text.secondary">
                        饮食结构饼图
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ width: '100%' }}>
                      <Typography variant="subtitle1" gutterBottom>
                        各类食物占比
                      </Typography>
                      {Object.entries(dietStructure).map(([key, data]) => (
                        <Box key={key} sx={{ 
                          mb: 2, 
                          width: '100%',
                          pr: { xs: 0, sm: 1 }
                        }}>
                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            mb: 0.5,
                            width: '100%'
                          }}>
                            <Typography variant="body2">
                              {key === 'grains' ? '谷物' :
                               key === 'vegetables' ? '蔬菜' :
                               key === 'fruits' ? '水果' :
                               key === 'protein' ? '蛋白质' :
                               key === 'dairy' ? '乳制品' : '油脂'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {data.value}% / {data.recommended}%
                            </Typography>
                          </Box>
                          <Box sx={{ 
                            position: 'relative', 
                            height: 8, 
                            bgcolor: 'grey.200', 
                            borderRadius: 1,
                            width: '100%',
                            overflow: 'hidden'
                          }}>
                            <Box
                              sx={{
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                height: '100%',
                                borderRadius: 1,
                                width: `${Math.min((data.value / data.recommended) * 100, 100)}%`,
                                bgcolor: data.value > data.recommended ? 'warning.main' : 'success.main',
                                transition: 'width 0.3s ease'
                              }}
                            />
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
          
          {/* 食材多样性分析 */}
          <Box sx={{ 
            width: '100%', 
            maxWidth: { xs: '100%', sm: '600px' },
            px: { xs: 2, sm: 0 }
          }}>
            <Card sx={{ 
              width: '100%',
              borderRadius: { xs: 0, sm: 1 },
              boxShadow: { xs: 'none', sm: 1 },
              mb: { xs: 2, sm: 3 }
            }}>
              <CardHeader title="食材多样性分析" />
              <CardContent sx={{ 
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                <Grid container spacing={2} sx={{ width: '100%' }}>
                  {Object.entries(ingredientDiversity).map(([key, data]) => (
                    <Grid item xs={12} sm={6} md={3} key={key}>
                      <Box sx={{ 
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                      }}>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          {data.description}
                        </Typography>
                        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                          <CircularProgress
                            variant="determinate"
                            value={(data.count / data.target) * 100}
                            size={80}
                            thickness={4}
                            sx={{ color: 'success.main' }}
                          />
                          <Box
                            sx={{
                              top: 0,
                              left: 0,
                              bottom: 0,
                              right: 0,
                              position: 'absolute',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Typography variant="caption" component="div" color="text.secondary">
                              {`${data.count}/${data.target}`}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Box>
          
          {/* 营养建议 */}
          <Box sx={{ 
            width: '100%', 
            maxWidth: { xs: '100%', sm: '600px' },
            px: { xs: 2, sm: 0 }
          }}>
            <Card sx={{ 
              width: '100%',
              borderRadius: { xs: 0, sm: 1 },
              boxShadow: { xs: 'none', sm: 1 },
              mb: { xs: 2, sm: 3 }
            }}>
              <CardHeader title="营养建议" />
              <CardContent sx={{ 
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                <Grid container spacing={3} sx={{ width: '100%' }}>
                  {healthStore.nutritionAdvice && healthStore.nutritionAdvice.map((section) => (
                    <Grid item xs={12} md={6} key={section.category}>
                      <Typography variant="subtitle1" gutterBottom>
                        {section.category}
                      </Typography>
                      <List>
                        {section.items.map((item, index) => (
                          <ListItem key={index} sx={{ py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              {section.category === '主要发现' ? (
                                <AssessmentIcon color="primary" fontSize="small" />
                              ) : (
                                <LightbulbIcon color="secondary" fontSize="small" />
                              )}
                            </ListItemIcon>
                            <ListItemText primary={item} />
                          </ListItem>
                        ))}
                      </List>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Box>
          
          {/* 常用食材分析 */}
          <Box sx={{ 
            width: '100%', 
            maxWidth: { xs: '100%', sm: '600px' },
            px: { xs: 2, sm: 0 }
          }}>
            <Card sx={{ 
              width: '100%',
              borderRadius: { xs: 0, sm: 1 },
              boxShadow: { xs: 'none', sm: 1 },
              mb: { xs: 2, sm: 3 }
            }}>
              <CardHeader title="常用食材分析" />
              <CardContent sx={{ 
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                <Grid container spacing={3} sx={{ width: '100%' }}>
                  {healthStore.ingredientUsage && healthStore.ingredientUsage.map((category) => (
                    <Grid item xs={12} md={4} key={category.category}>
                      <Typography variant="subtitle1" gutterBottom>
                        {category.category}
                      </Typography>
                      <List sx={{ pl: 0 }}>
                        {category.items.map((item, index) => (
                          <ListItem 
                            key={index} 
                            sx={{ 
                              py: 0.5,
                              borderBottom: index < category.items.length - 1 ? '1px solid rgba(0, 0, 0, 0.12)' : 'none'
                            }}
                          >
                            <ListItemText 
                              primary={item.name} 
                              secondary={`使用频率: ${item.frequency}次`} 
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Box>
        </Box>
        
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
      </Container>
    </Box>
  );
});

export default HealthPage; 
