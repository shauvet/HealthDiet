import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  Autocomplete,
  Snackbar,
  Alert
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
  const [searchParams] = useSearchParams();
  
  const [tabValue, setTabValue] = useState(() => {
    const tabParam = searchParams.get('tab');
    return tabParam === 'shopping' ? 1 : 0;
  });
  
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
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // 添加自动检查状态
  const [autoCheckingIngredients, setAutoCheckingIngredients] = useState(false);
  // 添加一个ref来跟踪API是否已经调用过
  const apiCalledRef = useRef(false);
  
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'shopping') {
      setTabValue(1);
    }
  }, [searchParams]);
  
  useEffect(() => {
    // 使用ref避免严格模式下重复调用API
    if (apiCalledRef.current) return;
    
    // 设置标志，防止重复调用
    apiCalledRef.current = true;
    
    // Load inventory on initial render
    console.log('===== InventoryPage: Loading inventory and starting auto check =====');
    
    // 改为单独的异步函数以便更好地控制流程
    const loadData = async () => {
      setAutoCheckingIngredients(true);
      try {
        // 首先加载库存数据
        await inventoryStore.fetchInventory();
        console.log('Inventory loaded successfully');
        
        // 然后只加载一次购物清单
        await inventoryStore.fetchShoppingList();
        console.log('Shopping list loaded successfully, starting automatic ingredient check...');
        
        // 检查完成后再次加载购物清单（如果有添加新项目）
        if (tabValue === 1) { // 只有当当前标签是购物清单时才刷新
          await inventoryStore.fetchShoppingList();
          console.log('Shopping list refreshed after ingredient check');
        }
        
        // 如果有新的购物清单项被添加，显示通知
        if (inventoryStore.shoppingList.length > 0) {
          console.log(`Shopping list now has ${inventoryStore.shoppingList.length} items`);
          setNotification({
            open: true,
            message: '已自动检查膳食计划，并将缺失食材添加到采购清单',
            severity: 'info'
          });
        } else {
          console.log('Shopping list is empty after check');
        }
      } catch (error) {
        console.error('Error during data loading:', error);
      } finally {
        setAutoCheckingIngredients(false);
      }
    };
    
    loadData();
    
    // 添加清理函数
    return () => {
      // 可以在组件卸载时做一些清理工作
      console.log('InventoryPage unmounting, cleaning up');
    };
  }, [tabValue]);
  
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
    // Find the ingredient by either id or _id
    const ingredient = inventoryStore.ingredients.find(i => (i.id === ingredientId || i._id === ingredientId));
    if (ingredient) {
      const newQuantity = Math.max(0, ingredient.quantity + delta);
      await inventoryStore.updateIngredientQuantity(ingredientId, newQuantity);
    }
  };
  
  const handleRemoveIngredient = async (ingredientId) => {
    if (!ingredientId) {
      console.error('Attempted to remove ingredient with invalid ID');
      return;
    }
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
    // Select all items in the shopping list
    setSelectedItems(inventoryStore.shoppingList.map(item => item.id || item._id));
  };
  
  const handleDeselectAll = () => {
    setSelectedItems([]);
  };
  
  const handleMarkAsPurchased = async () => {
    if (selectedItems.length > 0) {
      // Show optional loading state or message
      const result = await inventoryStore.markAsPurchased(selectedItems);
      if (result) {
        // Clear selected items after successful purchase
        setSelectedItems([]);
        
        // Show success notification
        setNotification({
          open: true,
          message: '购买的食材已加入库存并根据菜单消耗量更新',
          severity: 'success'
        });
      } else {
        // Show error notification
        setNotification({
          open: true,
          message: '更新库存失败，请重试',
          severity: 'error'
        });
      }
    }
  };
  
  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };
  
  const handleCategoryFilterChange = (e) => {
    setFilterCategory(e.target.value);
  };
  
  const handleStockFilterChange = (e) => {
    setFilterStock(e.target.value);
  };
  
  const filterIngredients = () => {
    let filtered = inventoryStore.ingredients;
    
    // Check for ingredients without IDs
    const missingIds = filtered.filter(item => !item.id);
    if (missingIds.length > 0) {
      console.error('Found ingredients missing IDs:', missingIds);
    }
    
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
        <Typography component="div" variant="h5">库存与采购</Typography>
        
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
              <Typography component="div" variant="body1" sx={{ textAlign: 'center', my: 4 }}>
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
                        component="div"
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
                          <Typography component="span" sx={{ mx: 1, minWidth: '40px', textAlign: 'center' }}>
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
                            onClick={() => {
                              console.log('Delete clicked for ingredient:', ingredient);
                              // Get the ID from either id or _id field
                              const ingredientId = ingredient?.id || ingredient?._id;
                              console.log('Using ingredient ID:', ingredientId);
                              handleRemoveIngredient(ingredientId);
                            }}
                            color="error"
                            sx={{ ml: 1 }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      }
                    >
                      <ListItemText
                        primary={<Typography component="span">{ingredient.name}</Typography>}
                        secondary={<Typography component="span">{`${ingredient.quantity} ${getUnitLabel(ingredient.unit)}`}</Typography>}
                        primaryTypographyProps={{
                          color: ingredient.quantity <= 0 ? 'error' : 'inherit',
                          component: 'span'
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
        {autoCheckingIngredients && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <CircularProgress size={20} sx={{ mr: 1 }} />
            <Typography component="div" variant="body1">
              正在自动检查膳食计划食材...
            </Typography>
          </Box>
        )}
        
        {selectedItems.length > 0 && (
          <Box sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Typography component="div" variant="subtitle1">
              已选择 {selectedItems.length} 项
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<ShoppingCartIcon />}
                onClick={handleMarkAsPurchased}
                disabled={inventoryStore.loading}
              >
                {inventoryStore.loading ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    处理中...
                  </>
                ) : (
                  '已采购'
                )}
              </Button>
              <Button onClick={handleDeselectAll} disabled={inventoryStore.loading}>
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
              <Typography component="div" variant="body1" sx={{ textAlign: 'center', my: 4 }}>
                当前没有需要采购的物品
              </Typography>
            ) : (
              <List>
                <ListItem>
                  <ListItemText primary={
                    <>
                      <Checkbox
                        checked={selectedItems.length === inventoryStore.shoppingList.length}
                        onChange={selectedItems.length === inventoryStore.shoppingList.length ? 
                          handleDeselectAll : handleSelectAll}
                        indeterminate={selectedItems.length > 0 && 
                          selectedItems.length < inventoryStore.shoppingList.length}
                      />
                      <Typography component="span" variant="subtitle1" sx={{ fontWeight: 'bold', ml: 1 }}>
                        全选
                      </Typography>
                    </>
                  } />
                </ListItem>
                
                <Divider />
                
                {inventoryStore.shoppingList.map((item) => {
                  // 确保ID字段存在，优先使用_id，其次使用id
                  const itemId = item._id || item.id;
                  
                  // 确保购买数量字段存在
                  const requiredQty = item.requiredQuantity || item.quantity || 0;
                  const toBuyQty = item.toBuyQuantity || item.quantity || requiredQty || 0;
                  
                  // 获取有用的备注信息
                  const hasNotes = item.notes && item.notes.trim().length > 0;
                  
                  return (
                    <ListItem 
                      key={itemId}
                      sx={{ 
                        bgcolor: 'background.paper', 
                        my: 1, 
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider'
                      }}
                    >
                      <Checkbox
                        checked={selectedItems.includes(itemId)}
                        onChange={() => handleToggleSelect(itemId)}
                      />
                      <ListItemText
                        primary={
                          <>
                            <Typography component="span" variant="body1">
                              {item.name}
                            </Typography>
                            <Chip 
                              label={getCategoryLabel(item.category)} 
                              size="small" 
                              sx={{ ml: 1, verticalAlign: 'middle' }} 
                              color="primary"
                              variant="outlined"
                            />
                          </>
                        }
                        secondary={
                          <>
                            <Typography component="span" variant="body2">
                              需要: {requiredQty} {getUnitLabel(item.unit)}
                            </Typography>
                            {hasNotes && (
                              <Typography component="span" variant="caption" sx={{ display: 'block' }} color="text.secondary">
                                {item.notes}
                              </Typography>
                            )}
                          </>
                        }
                      />
                      
                      <Box sx={{ ml: 2 }}>
                        <TextField
                          label="采购数量"
                          type="number"
                          size="small"
                          value={toBuyQty}
                          onChange={(e) => {
                            // In a real app, this would update the quantity to buy
                            console.log(`Update quantity for ${itemId} to ${e.target.value}`);
                          }}
                          InputProps={{
                            endAdornment: <InputAdornment position="end">{getUnitLabel(item.unit)}</InputAdornment>,
                            inputProps: { min: 0 }
                          }}
                        />
                      </Box>
                    </ListItem>
                  );
                })}
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
      
      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
});

export default InventoryPage; 
