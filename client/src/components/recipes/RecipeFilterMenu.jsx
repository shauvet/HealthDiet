import { useState, useEffect } from 'react';
import { 
  Box,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Typography,
  Button
} from '@mui/material';

// Dummy data for filters - would come from API in real app
export const cuisineTypes = [
  { id: 1, name: '川菜' },
  { id: 2, name: '粤菜' },
  { id: 3, name: '鲁菜' },
  { id: 4, name: '湘菜' },
  { id: 5, name: '闽菜' },
  { id: 6, name: '徽菜' },
  { id: 7, name: '浙菜' },
  { id: 8, name: '江苏菜' },
  { id: 9, name: '西餐' },
  { id: 10, name: '日韩料理' }
];

const spiceLevels = [
  { value: 0, label: '不辣' },
  { value: 1, label: '微辣' },
  { value: 2, label: '中辣' },
  { value: 3, label: '重辣' }
];

const RecipeFilterMenu = ({ onFilterChange }) => {
  const [selectedCuisines, setSelectedCuisines] = useState([]);
  const [spiceLevel, setSpiceLevel] = useState([0, 3]); // From not spicy to very spicy
  const [mealType, setMealType] = useState('all');
  
  // 当筛选条件改变时，通知父组件
  useEffect(() => {
    const filters = {
      cuisines: selectedCuisines,
      spiceLevel,
      mealType
    };
    onFilterChange?.(filters);
  }, [selectedCuisines, spiceLevel, mealType]);

  const handleCuisineClick = (cuisineId) => {
    if (selectedCuisines.includes(cuisineId)) {
      setSelectedCuisines(selectedCuisines.filter(id => id !== cuisineId));
    } else {
      setSelectedCuisines([...selectedCuisines, cuisineId]);
    }
  };
  
  const handleSpiceLevelChange = (event, newValue) => {
    setSpiceLevel(newValue);
  };
  
  const handleMealTypeChange = (event) => {
    setMealType(event.target.value);
  };
  
  const handleClearFilters = () => {
    setSelectedCuisines([]);
    setSpiceLevel([0, 3]);
    setMealType('all');
  };
  
  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        <Typography variant="subtitle1" sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
          菜系:
        </Typography>
        {cuisineTypes.map((cuisine) => (
          <Chip
            key={cuisine.id}
            label={cuisine.name}
            clickable
            color={selectedCuisines.includes(cuisine.id) ? 'primary' : 'default'}
            onClick={() => handleCuisineClick(cuisine.id)}
          />
        ))}
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1" sx={{ mr: 2, minWidth: '60px' }}>
          辣度:
        </Typography>
        <Box sx={{ width: 300 }}>
          <Slider
            value={spiceLevel}
            onChange={handleSpiceLevelChange}
            valueLabelDisplay="auto"
            step={1}
            marks={spiceLevels}
            min={0}
            max={3}
            valueLabelFormat={(value) => spiceLevels.find(level => level.value === value)?.label}
          />
        </Box>
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1" sx={{ mr: 2, minWidth: '60px' }}>
          餐类:
        </Typography>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel id="meal-type-select-label">餐类</InputLabel>
          <Select
            labelId="meal-type-select-label"
            id="meal-type-select"
            value={mealType}
            label="餐类"
            onChange={handleMealTypeChange}
          >
            <MenuItem value="all">全部</MenuItem>
            <MenuItem value="breakfast">早餐</MenuItem>
            <MenuItem value="lunch">午餐</MenuItem>
            <MenuItem value="dinner">晚餐</MenuItem>
            <MenuItem value="snack">加餐/小吃</MenuItem>
          </Select>
        </FormControl>
        
        <Box sx={{ ml: 'auto' }}>
          <Button
            variant="outlined"
            onClick={handleClearFilters}
            size="small"
          >
            清除筛选
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default RecipeFilterMenu;
