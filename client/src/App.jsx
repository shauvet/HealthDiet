import { useEffect } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { observer } from 'mobx-react-lite';

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

// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#4caf50', // Green color for health theme
    },
    secondary: {
      main: '#ff9800', // Orange for accent
    },
    background: {
      default: '#f5f5f5',
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
});

const App = observer(() => {
  useEffect(() => {
    // Check auth state on app load
    userStore.checkAuth();
  }, []);

  // Protected route component
  const ProtectedRoute = ({ children }) => {
    if (!userStore.isAuthenticated && !userStore.loading) {
      // 保存当前路径到会话存储中，以便登录后重定向回来
      const currentPath = window.location.pathname;
      if (currentPath !== '/' && currentPath !== '/login') {
        sessionStorage.setItem('lastPath', currentPath);
      }
      return <Navigate to="/login" />;
    }
    return children;
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
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
            <Route index element={<Navigate to="/recipes" />} />
            <Route path="recipes" element={<RecipesPage />} />
            <Route path="meal-plan" element={<MealPlanPage />} />
            <Route path="health" element={<HealthPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
          
          {/* Fallback for unknown routes */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
});

export default App;
