import { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Divider,
  Tooltip,
  InputAdornment,
  CircularProgress,
  Checkbox,
  Chip,
  Autocomplete
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SearchIcon from '@mui/icons-material/Search';
import { inventoryStore } from '../stores/RootStore';

// Tab Panel Component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`inventory-tabpanel-${index}`}
      aria-labelledby={`inventory-tab-${index}`}
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

const InventoryPage = observer(() => {
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newIngredient, setNewIngredient] = useState({
    name: '',
    quantity: 0,
    unit: 'g',
    category: 'vegetables',
    purchaseDate: new Date().toISOString().split('T')[0]
  });
  const [selectedItems, setSelectedItems] = useState([]);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStock, setFilterStock] = useState('all'); // 'all', 'inStock', 'outOfStock'
  
  useEffect(() => {
    // Load inventory on initial render
    inventoryStore.fetchInventory();
    inventoryStore.fetchShoppingList();
  }, []);
  
  const handleChangeTab = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const handleOpenAddDialog = () => {
    setOpenAddDialog(true);
  };
  
  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    setNewIngredient({
      name: '',
      quantity: 0,
      unit: 'g',
      category: 'vegetables',
      purchaseDate: new Date().toISOString().split('T')[0]
    });
  };
  
  const handleNewIngredientChange = (e) => {
    const { name, value } = e.target;
    setNewIngredient({
      ...newIngredient,
      [name]: value
    });
  };
  
  const handleAddIngredient = async () => {
    if (!newIngredient.name || newIngredient.quantity <= 0) {
      return;
    }
    
    await inventoryStore.addIngredient(newIngredient);
    handleCloseAddDialog();
  };
  
  const handleChangeQuantity = async (ingredientId, delta) => {
    const ingredient = inventoryStore.ingredients.find(i => i.id === ingredientId);
    if (ingredient) {
      const newQuantity = Math.max(0, ingredient.quantity + delta);
      await inventoryStore.updateIngredientQuantity(ingredientId, newQuantity);
    }
  };
  
  const handleRemoveIngredient = async (ingredientId) => {
    await inventoryStore.removeIngredient(ingredientId);
  };
  
  const handleToggleSelect = (ingredientId) => {
    setSelectedItems(prev => {
      if (prev.includes(ingredientId)) {
        return prev.filter(id => id !== ingredientId);
      } else {
        return [...prev, ingredientId];
      }
    });
  };
  
  const handleSelectAll = () => {
    // Select all visible items
    const visibleIngredients = filterIngredients();
    setSelectedItems(visibleIngredients.map(i => i.id));
  };
  
  const handleDeselectAll = () => {
    setSelectedItems([]);
  };
  
  const handleMarkAsPurchased = async () => {
    if (selectedItems.length > 0) {
      await inventoryStore.markAsPurchased(selectedItems);
      setSelectedItems([]);
    }
  };
  
  const handleCategoryFilterChange = (e) => {
    setFilterCategory(e.target.value);
  };
  
  const handleStockFilterChange = (e) => {
    setFilterStock(e.target.value);
  };
  
  const filterIngredients = () => {
    let filtered = inventoryStore.ingredients;
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(query)
      );
    }
    
    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter(item => item.category === filterCategory);
    }
    
    // Filter by stock status
    if (filterStock === 'inStock') {
      filtered = filtered.filter(item => item.quantity > 0);
    } else if (filterStock === 'outOfStock') {
      filtered = filtered.filter(item => item.quantity <= 0);
    }
    
    return filtered;
  };
  
  const sortedIngredients = filterIngredients().slice().sort((a, b) => {
    // Sort by category first, then by name
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }
    return a.name.localeCompare(b.name);
  });
  
  const getCategoryLabel = (category) => {
    switch (category) {
      case 'vegetables':
        return '蔬菜';
      case 'meat':
        return '肉类';
      case 'condiments':
        return '调味料';
      case 'dairy':
        return '奶制品';
      case 'grains':
        return '谷物';
      case 'fruits':
        return '水果';
      case 'others':
        return '其他';
      default:
        return category;
    }
  };
  
  const getUnitLabel = (unit) => {
    switch (unit) {
      case 'g':
        return '克';
      case 'kg':
        return '千克';
      case 'ml':
        return '毫升';
      case 'piece':
        return '个';
      case 'tbsp':
        return '汤匙';
      case 'tsp':
        return '茶匙';
      default:
        return unit;
    }
  };
  
  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h1">库存与采购</Typography>
        
        <Button 
          variant="contained" 
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenAddDialog}
        >
          添加食材
        </Button>
      </Box>
      
      <Paper sx={{ mb: 2 }}>
        <Tabs 
          value={tabValue}
          onChange={handleChangeTab}
          aria-label="inventory tabs"
          variant="fullWidth"
        >
          <Tab label="库存" />
          <Tab label="采购清单" />
        </Tabs>
      </Paper>
      
      {/* Inventory Tab */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                placeholder="搜索食材"
                value={searchQuery}
                onChange={handleSearchInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <FormControl fullWidth>
                <InputLabel id="category-filter-label">分类</InputLabel>
                <Select
                  labelId="category-filter-label"
                  value={filterCategory}
                  label="分类"
                  onChange={handleCategoryFilterChange}
                >
                  <MenuItem value="all">全部</MenuItem>
                  <MenuItem value="vegetables">蔬菜</MenuItem>
                  <MenuItem value="meat">肉类</MenuItem>
                  <MenuItem value="condiments">调味料</MenuItem>
                  <MenuItem value="dairy">奶制品</MenuItem>
                  <MenuItem value="grains">谷物</MenuItem>
                  <MenuItem value="fruits">水果</MenuItem>
                  <MenuItem value="others">其他</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={3}>
              <FormControl fullWidth>
                <InputLabel id="stock-filter-label">库存状态</InputLabel>
                <Select
                  labelId="stock-filter-label"
                  value={filterStock}
                  label="库存状态"
                  onChange={handleStockFilterChange}
                >
                  <MenuItem value="all">全部</MenuItem>
                  <MenuItem value="inStock">有库存</MenuItem>
                  <MenuItem value="outOfStock">缺货</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
        
        {inventoryStore.loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {sortedIngredients.length === 0 ? (
              <Typography variant="body1" sx={{ textAlign: 'center', my: 4 }}>
                {searchQuery || filterCategory !== 'all' || filterStock !== 'all' 
                  ? '没有符合条件的食材'
                  : '库存中没有食材，点击"添加食材"按钮开始添加'}
              </Typography>
            ) : (
              <List>
                {sortedIngredients.map((ingredient, index) => (
                  <div key={ingredient.id}>
                    {index > 0 && 
                      sortedIngredients[index - 1].category !== ingredient.category && (
                      <Divider sx={{ mt: 2, mb: 1 }} />
                    )}
                    
                    {(index === 0 || 
                      sortedIngredients[index - 1].category !== ingredient.category) && (
                      <Typography 
                        variant="subtitle1" 
                        sx={{ mt: index > 0 ? 2 : 0, mb: 1, fontWeight: 'bold' }}
                      >
                        {getCategoryLabel(ingredient.category)}
                      </Typography>
                    )}
                    
                    <ListItem 
                      sx={{ 
                        bgcolor: 'background.paper', 
                        mb: 1, 
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: ingredient.quantity <= 0 ? 'error.light' : 'divider'
                      }}
                      secondaryAction={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <IconButton
                            edge="end"
                            aria-label="减少"
                            onClick={() => handleChangeQuantity(ingredient.id, -1)}
                            disabled={ingredient.quantity <= 0}
                          >
                            <RemoveIcon />
                          </IconButton>
                          <Typography sx={{ mx: 1, minWidth: '40px', textAlign: 'center' }}>
                            {ingredient.quantity}
                          </Typography>
                          <IconButton
                            edge="end"
                            aria-label="增加"
                            onClick={() => handleChangeQuantity(ingredient.id, 1)}
                          >
                            <AddIcon />
                          </IconButton>
                          <IconButton
                            edge="end"
                            aria-label="删除"
                            onClick={() => handleRemoveIngredient(ingredient.id)}
                            color="error"
                            sx={{ ml: 1 }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      }
                    >
                      <ListItemText
                        primary={ingredient.name}
                        secondary={`${ingredient.quantity} ${getUnitLabel(ingredient.unit)}`}
                        primaryTypographyProps={{
                          color: ingredient.quantity <= 0 ? 'error' : 'inherit'
                        }}
                      />
                    </ListItem>
                  </div>
                ))}
              </List>
            )}
          </>
        )}
      </TabPanel>
      
      {/* Shopping List Tab */}
      <TabPanel value={tabValue} index={1}>
        {selectedItems.length > 0 && (
          <Box sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Typography variant="subtitle1" component="div">
              已选择 {selectedItems.length} 项
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<ShoppingCartIcon />}
                onClick={handleMarkAsPurchased}
              >
                已采购
              </Button>
              <Button onClick={handleDeselectAll}>
                取消选择
              </Button>
            </Box>
          </Box>
        )}
        
        {inventoryStore.loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {inventoryStore.shoppingList.length === 0 ? (
              <Typography variant="body1" sx={{ textAlign: 'center', my: 4 }}>
                当前没有需要采购的物品
              </Typography>
            ) : (
              <List>
                <ListItem>
                  <ListItemText primary={
                    <Box sx={{ display: 'flex' }}>
                      <Checkbox
                        checked={selectedItems.length === inventoryStore.shoppingList.length}
                        onChange={selectedItems.length === inventoryStore.shoppingList.length ? 
                          handleDeselectAll : handleSelectAll}
                        indeterminate={selectedItems.length > 0 && 
                          selectedItems.length < inventoryStore.shoppingList.length}
                      />
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', ml: 1 }}>
                        全选
                      </Typography>
                    </Box>
                  } />
                </ListItem>
                
                <Divider />
                
                {inventoryStore.shoppingList.map((item) => (
                  <ListItem 
                    key={item.id}
                    sx={{ 
                      bgcolor: 'background.paper', 
                      my: 1, 
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider'
                    }}
                  >
                    <Checkbox
                      checked={selectedItems.includes(item.id)}
                      onChange={() => handleToggleSelect(item.id)}
                    />
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body1">
                            {item.name}
                          </Typography>
                          <Chip 
                            label={getCategoryLabel(item.category)} 
                            size="small" 
                            sx={{ ml: 1 }} 
                            color="primary"
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={`需要: ${item.requiredQuantity || 0} ${getUnitLabel(item.unit)}`}
                    />
                    
                    <Box sx={{ ml: 2 }}>
                      <TextField
                        label="采购数量"
                        type="number"
                        size="small"
                        value={item.toBuyQuantity || item.requiredQuantity}
                        onChange={(e) => {
                          // In a real app, this would update the quantity to buy
                          console.log(`Update quantity for ${item.id} to ${e.target.value}`);
                        }}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">{getUnitLabel(item.unit)}</InputAdornment>,
                          inputProps: { min: 0 }
                        }}
                      />
                    </Box>
                  </ListItem>
                ))}
              </List>
            )}
          </>
        )}
      </TabPanel>
      
      {/* Add Ingredient Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog}>
        <DialogTitle>添加食材</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="食材名称"
              name="name"
              value={newIngredient.name}
              onChange={handleNewIngredientChange}
              fullWidth
              required
            />
            
            <Grid container spacing={2}>
              <Grid item xs={7}>
                <TextField
                  label="数量"
                  name="quantity"
                  type="number"
                  value={newIngredient.quantity}
                  onChange={handleNewIngredientChange}
                  fullWidth
                  required
                  InputProps={{
                    inputProps: { min: 0 }
                  }}
                />
              </Grid>
              <Grid item xs={5}>
                <FormControl fullWidth>
                  <InputLabel id="unit-label">单位</InputLabel>
                  <Select
                    labelId="unit-label"
                    name="unit"
                    value={newIngredient.unit}
                    label="单位"
                    onChange={handleNewIngredientChange}
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
            </Grid>
            
            <FormControl fullWidth>
              <InputLabel id="category-label">分类</InputLabel>
              <Select
                labelId="category-label"
                name="category"
                value={newIngredient.category}
                label="分类"
                onChange={handleNewIngredientChange}
              >
                <MenuItem value="vegetables">蔬菜</MenuItem>
                <MenuItem value="meat">肉类</MenuItem>
                <MenuItem value="condiments">调味料</MenuItem>
                <MenuItem value="dairy">奶制品</MenuItem>
                <MenuItem value="grains">谷物</MenuItem>
                <MenuItem value="fruits">水果</MenuItem>
                <MenuItem value="others">其他</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              label="购买日期"
              name="purchaseDate"
              type="date"
              value={newIngredient.purchaseDate}
              onChange={handleNewIngredientChange}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog}>取消</Button>
          <Button 
            onClick={handleAddIngredient} 
            variant="contained"
            disabled={!newIngredient.name || newIngredient.quantity <= 0}
          >
            添加
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
});

export default InventoryPage; 
