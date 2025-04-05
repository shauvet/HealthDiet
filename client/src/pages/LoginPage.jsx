import { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Container,
  Divider
} from '@mui/material';
import { userStore } from '../stores/RootStore';

const LoginPage = observer(() => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [savedPath, setSavedPath] = useState(null);
  
  useEffect(() => {
    // 获取之前保存的路径
    const lastPath = sessionStorage.getItem('lastPath');
    if (lastPath) {
      setSavedPath(lastPath);
    }
  }, []);
  
  // 使用useEffect处理重定向逻辑
  useEffect(() => {
    if (userStore.isAuthenticated) {
      navigate(savedPath || '/');
    }
  }, [savedPath, navigate]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({
      ...credentials,
      [name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!credentials.email || !credentials.password) {
      setError('请输入邮箱和密码');
      return;
    }
    
    try {
      const success = await userStore.login(credentials);
      if (success) {
        const redirectPath = savedPath || '/';
        // 清除保存的路径
        sessionStorage.removeItem('lastPath');
        navigate(redirectPath);
      } else {
        setError(userStore.error || '登录失败，请检查您的凭据');
      }
    } catch {
      setError('登录时发生错误，请稍后再试');
    }
  };
  
  return (
    <Container maxWidth="sm">
      <Box 
        sx={{ 
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Paper sx={{ p: 4, width: '100%' }}>
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            健康饮食
          </Typography>
          <Typography variant="subtitle1" align="center" color="text.secondary" gutterBottom>
            登录您的账户
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              label="邮箱"
              type="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              margin="normal"
              required
              fullWidth
              autoFocus
              autoComplete="email"
            />
            <TextField
              label="密码"
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              margin="normal"
              required
              fullWidth
              autoComplete="current-password"
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, height: 48 }}
              disabled={userStore.loading}
            >
              {userStore.loading ? <CircularProgress size={24} /> : '登录'}
            </Button>
            
            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                或者
              </Typography>
            </Divider>
            
            <Box sx={{ textAlign: 'center' }}>
              <Link to="/register" style={{ textDecoration: 'none' }}>
                <Button variant="outlined" fullWidth>
                  注册新账户
                </Button>
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
});

export default LoginPage; 
