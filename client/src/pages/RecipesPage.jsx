import { useEffect, useState } from 'react';
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
import RecipeFilterMenu from '../components/recipes/RecipeFilterMenu';
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
  
  useEffect(() => {
    // Load recommended recipes on initial render
    recipeStore.fetchRecommendedRecipes();
    recipeStore.fetchPersonalRecipes();
    recipeStore.fetchFavoriteRecipes();
  }, []);
  
  const handleChangeTab = (event, newValue) => {
    setTabValue(newValue);
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
  
  // Get the appropriate recipe list based on the selected tab
  const getRecipeList = () => {
    switch (tabValue) {
      case 0:
        return recipeStore.recipes.recommended;
      case 1:
        return recipeStore.recipes.personal;
      case 2:
        return recipeStore.recipes.favorite;
      default:
        return [];
    }
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
      
      {/* Recipe filter options could go here */}
      <RecipeFilterMenu />
      
      {/* Show search results if available */}
      {searchResults.length > 0 && (
        <Box sx={{ my: 2 }}>
          <Typography variant="h6" gutterBottom>搜索结果</Typography>
          <Grid container spacing={2}>
            {searchResults.map(recipe => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={recipe.id}>
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
            {recipeStore.recipes.recommended.map(recipe => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={recipe.id}>
                <RecipeCard recipe={recipe} />
              </Grid>
            ))}
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
            {recipeStore.recipes.personal.map(recipe => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={recipe.id}>
                <RecipeCard recipe={recipe} />
              </Grid>
            ))}
            
            {recipeStore.recipes.personal.length === 0 && (
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
            {recipeStore.recipes.favorite.map(recipe => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={recipe.id}>
                <RecipeCard recipe={recipe} />
              </Grid>
            ))}
            
            {recipeStore.recipes.favorite.length === 0 && (
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
