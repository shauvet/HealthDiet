import { useNavigate, useLocation } from 'react-router-dom';
import { BottomNavigation, BottomNavigationAction, Paper, useTheme, useMediaQuery } from '@mui/material';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import BarChartIcon from '@mui/icons-material/BarChart';
import KitchenIcon from '@mui/icons-material/Kitchen';
import PersonIcon from '@mui/icons-material/Person';

const menuItems = [
  { text: '食谱', path: '/recipes', icon: <RestaurantMenuIcon /> },
  { text: '菜单', path: '/meal-plan', icon: <CalendarMonthIcon /> },
  { text: '健康', path: '/health', icon: <BarChartIcon /> },
  { text: '库存', path: '/inventory', icon: <KitchenIcon /> },
  { text: '我的', path: '/profile', icon: <PersonIcon /> },
];

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (!isMobile) return null;

  return (
    <Paper 
      sx={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0,
        zIndex: theme.zIndex.appBar,
        borderTop: `1px solid ${theme.palette.divider}`
      }} 
      elevation={3}
    >
      <BottomNavigation
        value={menuItems.findIndex(item => item.path === location.pathname)}
        onChange={(_, newValue) => {
          navigate(menuItems[newValue].path);
        }}
        showLabels
        sx={{
          height: 56,
          '& .MuiBottomNavigationAction-root': {
            minWidth: 'auto',
            padding: '6px 0',
            '& .MuiBottomNavigationAction-label': {
              fontSize: '0.75rem'
            }
          }
        }}
      >
        {menuItems.map((item) => (
          <BottomNavigationAction
            key={item.path}
            label={item.text}
            icon={item.icon}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
};

export default BottomNav; 
