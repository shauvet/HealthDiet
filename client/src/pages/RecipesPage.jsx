import { useEffect, useState, useCallback, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { 
  Box, 
  Tab, 
  Tabs, 
  Typography, 
  TextField,
  InputAdornment,
  Button,
  Grid,
  CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';

// Store
import { recipeStore } from '../stores/RootStore';

// Components (to be created later)
import RecipeCard from '../components/recipes/RecipeCard';
import RecipeFilterMenu, { cuisineTypes } from '../components/recipes/RecipeFilterMenu';
import CreateRecipeDialog from '../components/recipes/CreateRecipeDialog';

// Tab Panel Component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`recipe-tabpanel-${index}`}
      aria-labelledby={`recipe-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const RecipesPage = observer(() => {
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [filters, setFilters] = useState({
    cuisines: [],
    spiceLevel: [0, 4],
    mealType: 'all'
  });
  
  // 使用ref记录每个标签页是否已加载过数据
  const tabInitialized = useRef({
    0: false,
    1: false,
    2: false
  });
  
  // 为对话框关闭后的刷新添加标记
  const dialogRefreshNeeded = useRef(false);

  useEffect(() => {
    // 为当前标签页加载数据
    if (tabValue === 0 && !tabInitialized.current[0]) {
      recipeStore.fetchRecommendedRecipes();
      tabInitialized.current[0] = true;
    } else if (tabValue === 1 && !tabInitialized.current[1]) {
      recipeStore.fetchPersonalRecipes();
      tabInitialized.current[1] = true;
    } else if (tabValue === 2 && !tabInitialized.current[2]) {
      recipeStore.fetchFavoriteRecipes();
      tabInitialized.current[2] = true;
    }
  }, [tabValue]);
  
  // 当对话框关闭时，刷新个人菜谱列表
  useEffect(() => {
    if (isCreateDialogOpen) {
      // 对话框打开时，标记需要刷新
      dialogRefreshNeeded.current = true;
    } else if (dialogRefreshNeeded.current && tabValue === 1) {
      // 当对话框关闭且有标记需要刷新且当前是个人菜谱标签时，刷新数据
      dialogRefreshNeeded.current = false;
      recipeStore.fetchPersonalRecipes();
      tabInitialized.current[1] = true;
    }
  }, [isCreateDialogOpen, tabValue]);
  
  const handleChangeTab = (event, newValue) => {
    setTabValue(newValue);
    
    // 每次切换标签时都重新加载数据
    if (newValue === 0) {
      recipeStore.fetchRecommendedRecipes();
    } else if (newValue === 1) {
      recipeStore.fetchPersonalRecipes();
    } else if (newValue === 2) {
      recipeStore.fetchFavoriteRecipes();
    }
  };
  
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await recipeStore.searchRecipes(searchQuery);
      setSearchResults(results);
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
    if (!e.target.value) {
      setSearchResults([]);
    }
  };
  
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);
  
  // Get the appropriate recipe list based on the selected tab and apply filters
  const getRecipeList = () => {
    let recipes = [];
    switch (tabValue) {
      case 0:
        recipes = recipeStore.recipes.recommended;
        break;
      case 1:
        recipes = recipeStore.recipes.personal;
        break;
      case 2:
        recipes = recipeStore.recipes.favorite;
        break;
      default:
        recipes = [];
    }

    // Apply filters
    return recipes.filter(recipe => {
      // Filter by meal type
      if (filters.mealType !== 'all') {
        // 检查所有可能包含餐类信息的字段
        const mealTypeFields = [
          // 主要字段 - categories数组
          ...(recipe.categories || []),
          // 兼容可能存在的mealType字段
          recipe.mealType,
          // 兼容可能在tags中的餐类信息
          ...(recipe.tags || [])
        ].filter(Boolean); // 过滤掉null和undefined
        
        // 检查任意字段是否匹配餐类
        const hasCorrectMealType = mealTypeFields.some(value => {
          if (!value) return false;
          const valueStr = String(value).toLowerCase();
          
          // 直接英文匹配
          if (valueStr === filters.mealType.toLowerCase()) {
            return true;
          }
          
          // 中文匹配关键词
          const matches = {
            breakfast: ['早餐', '早'],
            lunch: ['午餐', '中餐', '午', '中'],
            dinner: ['晚餐', '晚', '夜'],
            snack: ['小吃', '加餐', '点心', '零食']
          };
          
          return (matches[filters.mealType] || []).some(term => valueStr.includes(term));
        });
        if (!hasCorrectMealType) return false;
      }

      // Filter by cuisine
      if (filters.cuisines.length > 0) {
        // 菜系可能存储在cuisine字段或categories数组中
        const cuisineMatches = filters.cuisines.some(cuisineId => {
          // 尝试根据ID匹配菜系
          if (recipe.cuisineId && recipe.cuisineId === cuisineId) {
            return true;
          }
          
          // 查找对应的菜系名称
          const cuisineObj = cuisineTypes.find(c => c.id === cuisineId);
          if (!cuisineObj) return false;
          
          const cuisineName = cuisineObj.name;
          
          // 检查cuisine字段
          if (recipe.cuisine && 
              (recipe.cuisine === cuisineName || 
               recipe.cuisine.includes(cuisineName))) {
            return true;
          }
          
          // 检查categories数组中是否包含该菜系
          return recipe.categories && recipe.categories.some(
            category => category === cuisineName || category.includes(cuisineName)
          );
        });
        if (!cuisineMatches) return false;
      }

      // Filter by spice level
      if (recipe.spiceLevel < filters.spiceLevel[0] || recipe.spiceLevel > filters.spiceLevel[1]) {
        return false;
      }

      return true;
    });
  };
  
  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h1">食谱清单</Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            placeholder="搜索食材或菜名"
            size="small"
            value={searchQuery}
            onChange={handleSearchInputChange}
            onKeyPress={handleSearchKeyPress}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: isSearching ? (
                <CircularProgress size={20} />
              ) : null
            }}
          />
          
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => setIsCreateDialogOpen(true)}
          >
            创建菜谱
          </Button>
        </Box>
      </Box>
      
      {/* Recipe filter options */}
      <RecipeFilterMenu onFilterChange={handleFilterChange} />
      
      {/* Show search results if available */}
      {searchResults.length > 0 && (
        <Box sx={{ my: 2 }}>
          <Typography variant="h6" gutterBottom>搜索结果</Typography>
          <Grid container spacing={2}>
            {searchResults.map(recipe => (
              <Grid item xs={12} sm={12} md={6} key={recipe.id} sx={{ width: '100%' }}>
                <RecipeCard recipe={recipe} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
      
      {/* Tabs for different recipe categories */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 2 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleChangeTab}
          aria-label="recipe categories"
        >
          <Tab label="网络推荐" />
          <Tab label="自创菜单" />
          <Tab label="收藏菜单" />
        </Tabs>
      </Box>
      
      {/* Tab content */}
      <TabPanel value={tabValue} index={0}>
        {recipeStore.loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={2}>
            {getRecipeList().map(recipe => (
              <Grid item xs={12} sm={12} md={6} key={recipe.id} sx={{ width: '100%' }}>
                <RecipeCard recipe={recipe} />
              </Grid>
            ))}
            {getRecipeList().length === 0 && (
              <Box sx={{ width: '100%', textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">
                  没有找到符合条件的菜谱
                </Typography>
              </Box>
            )}
          </Grid>
        )}
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        {recipeStore.loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={2}>
            {getRecipeList().map(recipe => (
              <Grid item xs={12} sm={12} md={6} key={recipe.id} sx={{ width: '100%' }}>
                <RecipeCard recipe={recipe} />
              </Grid>
            ))}
            
            {getRecipeList().length === 0 && (
              <Box sx={{ width: '100%', textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">
                  您还没有创建自己的菜谱，点击"创建菜谱"按钮开始添加
                </Typography>
              </Box>
            )}
          </Grid>
        )}
      </TabPanel>
      
      <TabPanel value={tabValue} index={2}>
        {recipeStore.loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={2}>
            {getRecipeList().map(recipe => (
              <Grid item xs={12} sm={12} md={6} key={recipe.id} sx={{ width: '100%' }}>
                <RecipeCard recipe={recipe} />
              </Grid>
            ))}
            
            {getRecipeList().length === 0 && (
              <Box sx={{ width: '100%', textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">
                  您还没有收藏任何菜谱，浏览菜单并点击收藏按钮来添加
                </Typography>
              </Box>
            )}
          </Grid>
        )}
      </TabPanel>
      
      {/* Create Recipe Dialog */}
      <CreateRecipeDialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
      />
    </Box>
  );
});

export default RecipesPage; 
