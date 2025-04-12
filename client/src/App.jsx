import { useEffect, useState, useMemo } from 'react';
import { BrowserRouter, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { observer } from 'mobx-react-lite';
import { CircularProgress, Box } from '@mui/material';

// Layout
import MainLayout from './components/layout/MainLayout';

// Pages
import RecipesPage from './pages/RecipesPage';
import MealPlanPage from './pages/MealPlanPage'; 
import HealthPage from './pages/HealthPage';
import InventoryPage from './pages/InventoryPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Import store
import { userStore } from './stores/RootStore';
import './App.css';

// 全局加载组件
const LoadingScreen = () => (
  <Box sx={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    width: '100vw',
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 9999,
    backgroundColor: (theme) => 
      theme.palette.mode === 'dark' 
        ? 'rgba(18, 18, 18, 0.7)' 
        : 'rgba(255, 255, 255, 0.7)'
  }}>
    <CircularProgress />
  </Box>
);

// 路由观察器组件
const RouteChangeObserver = ({ setIsNavigating }) => {
  const location = useLocation();
  
  useEffect(() => {
    setIsNavigating(true);
    
    // 300ms后重置导航状态
    const timer = setTimeout(() => {
      setIsNavigating(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [location.pathname, setIsNavigating]);
  
  return null;
};

const App = observer(() => {
  const [authChecked, setAuthChecked] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  // Create a theme that responds to dark mode preference
  const theme = useMemo(() => 
    createTheme({
      palette: {
        mode: userStore.darkMode ? 'dark' : 'light',
        primary: {
          main: '#4caf50', // Green color for health theme
        },
        secondary: {
          main: '#ff9800', // Orange for accent
        },
        background: {
          default: userStore.darkMode ? '#121212' : '#f5f5f5',
          paper: userStore.darkMode ? '#1e1e1e' : '#ffffff',
        },
      },
      typography: {
        fontFamily: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ].join(','),
      },
    }), [userStore.darkMode]);

  useEffect(() => {
    // Check auth state on app load
    const checkAuthentication = async () => {
      await userStore.checkAuth();
      setAuthChecked(true);
    };
    
    checkAuthentication();
  }, []);

  // Protected route component
  const ProtectedRoute = ({ children }) => {
    // 如果初始认证检查还未完成，显示加载状态
    if (!authChecked) {
      return <LoadingScreen />;
    }
    
    // 如果正在请求中（除了初始检查外的其他请求），同样显示加载状态
    if (userStore.loading) {
      return <LoadingScreen />;
    }
    
    // 只有在初始检查完成并且未认证的情况下才重定向
    if (!userStore.isAuthenticated) {
      // 保存当前路径到会话存储中，以便登录后重定向回来
      const currentPath = window.location.pathname;
      if (currentPath !== '/' && currentPath !== '/login') {
        sessionStorage.setItem('lastPath', currentPath);
      }
      return <Navigate to="/login" replace />;
    }
    
    return children;
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        {/* 添加路由变化观察器 */}
        <RouteChangeObserver setIsNavigating={setIsNavigating} />
        
        {/* 导航时显示全局加载状态 */}
        {isNavigating && <LoadingScreen />}
        
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Protected routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/recipes" replace />} />
            <Route path="recipes" element={<RecipesPage />} />
            <Route path="meal-plan" element={<MealPlanPage />} />
            <Route path="health" element={<HealthPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
          
          {/* Fallback for unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
});

export default App;
