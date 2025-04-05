import { useState } from 'react';
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
  Divider,
  Grid
} from '@mui/material';
import { userStore } from '../stores/RootStore';

const RegisterPage = observer(() => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  
  // Redirect if already authenticated
  if (userStore.isAuthenticated) {
    navigate('/');
    return null;
  }
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!userData.name || !userData.email || !userData.password) {
      setError('请填写所有必填字段');
      return;
    }
    
    if (userData.password !== userData.confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }
    
    if (userData.password.length < 6) {
      setError('密码长度至少为6位');
      return;
    }
    
    try {
      // Remove confirmPassword before sending to API
      const registrationData = { ...userData };
      delete registrationData.confirmPassword;
      
      const success = await userStore.register(registrationData);
      if (success) {
        // After successful registration, log the user in
        await userStore.login({
          email: userData.email,
          password: userData.password
        });
        navigate('/');
      } else {
        setError(userStore.error || '注册失败，请稍后再试');
      }
    } catch {
      setError('注册时发生错误');
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
            创建新账户
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              label="姓名"
              name="name"
              value={userData.name}
              onChange={handleChange}
              margin="normal"
              required
              fullWidth
              autoFocus
            />
            <TextField
              label="邮箱"
              type="email"
              name="email"
              value={userData.email}
              onChange={handleChange}
              margin="normal"
              required
              fullWidth
              autoComplete="email"
            />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="密码"
                  type="password"
                  name="password"
                  value={userData.password}
                  onChange={handleChange}
                  margin="normal"
                  required
                  fullWidth
                  autoComplete="new-password"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="确认密码"
                  type="password"
                  name="confirmPassword"
                  value={userData.confirmPassword}
                  onChange={handleChange}
                  margin="normal"
                  required
                  fullWidth
                  autoComplete="new-password"
                />
              </Grid>
            </Grid>
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, height: 48 }}
              disabled={userStore.loading}
            >
              {userStore.loading ? <CircularProgress size={24} /> : '注册'}
            </Button>
            
            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                已有账户?
              </Typography>
            </Divider>
            
            <Box sx={{ textAlign: 'center' }}>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <Button variant="outlined" fullWidth>
                  登录
                </Button>
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
});

export default RegisterPage; 
