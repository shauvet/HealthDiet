import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Avatar,
  IconButton,
  Divider,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  Collapse,
  Tabs,
  Tab
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/Person';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import { userStore } from '../stores/RootStore';

// Tab Panel Component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const stringToColor = (string) => {
  let hash = 0;
  let i;

   
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = '#';

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
   

  return color;
};

const stringAvatar = (name) => {
  return {
    sx: {
      bgcolor: stringToColor(name),
      width: 60,
      height: 60,
      fontSize: '1.5rem'
    },
    children: `${name.split(' ')[0][0]}${name.split(' ').length > 1 ? name.split(' ')[1][0] : ''}`,
  };
};

const ProfilePage = observer(() => {
  const [tabValue, setTabValue] = useState(0);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '',
    height: '',
    weight: '',
    birthdate: '',
    allergies: '',
    dietaryRestrictions: '',
    healthGoals: ''
  });
  const [openMemberDialog, setOpenMemberDialog] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [memberData, setMemberData] = useState({
    name: '',
    relationship: '',
    gender: '',
    birthdate: '',
    height: '',
    weight: '',
    allergies: '',
    dietaryRestrictions: ''
  });
  const [alertInfo, setAlertInfo] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  useEffect(() => {
    // Load user profile and family members on initial render
    if (userStore.currentUser) {
      setProfileData({
        name: userStore.currentUser.name || '',
        email: userStore.currentUser.email || '',
        phone: userStore.currentUser.phone || '',
        gender: userStore.currentUser.gender || '',
        height: userStore.currentUser.height || '',
        weight: userStore.currentUser.weight || '',
        birthdate: userStore.currentUser.birthdate ? 
          new Date(userStore.currentUser.birthdate).toISOString().slice(0, 10) : '',
        allergies: userStore.currentUser.allergies || '',
        dietaryRestrictions: userStore.currentUser.dietaryRestrictions || '',
        healthGoals: userStore.currentUser.healthGoals || ''
      });
    } else {
      userStore.fetchCurrentUser();
    }
    
    userStore.fetchFamilyMembers();
  }, [userStore.currentUser]);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value
    });
  };
  
  const handleUpdateProfile = async () => {
    try {
      await userStore.updateProfile(profileData);
      setAlertInfo({
        open: true,
        message: '个人资料已更新',
        severity: 'success'
      });
      
      // Auto close the alert after 3 seconds
      setTimeout(() => {
        setAlertInfo({
          ...alertInfo,
          open: false
        });
      }, 3000);
    } catch (error) {
      setAlertInfo({
        open: true,
        message: '更新失败: ' + (error.message || '未知错误'),
        severity: 'error'
      });
    }
  };
  
  const handleOpenAddMemberDialog = () => {
    setEditingMember(null);
    setMemberData({
      name: '',
      relationship: '',
      gender: '',
      birthdate: '',
      height: '',
      weight: '',
      allergies: '',
      dietaryRestrictions: ''
    });
    setOpenMemberDialog(true);
  };
  
  const handleOpenEditMemberDialog = (member) => {
    setEditingMember(member);
    setMemberData({
      name: member.name || '',
      relationship: member.relationship || '',
      gender: member.gender || '',
      birthdate: member.birthdate ? 
        new Date(member.birthdate).toISOString().slice(0, 10) : '',
      height: member.height || '',
      weight: member.weight || '',
      allergies: member.allergies || '',
      dietaryRestrictions: member.dietaryRestrictions || ''
    });
    setOpenMemberDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenMemberDialog(false);
    setEditingMember(null);
  };
  
  const handleMemberDataChange = (e) => {
    const { name, value } = e.target;
    setMemberData({
      ...memberData,
      [name]: value
    });
  };
  
  const handleSaveMember = async () => {
    try {
      if (editingMember) {
        await userStore.updateFamilyMember(editingMember.id, memberData);
        setAlertInfo({
          open: true,
          message: '家庭成员信息已更新',
          severity: 'success'
        });
      } else {
        await userStore.addFamilyMember(memberData);
        setAlertInfo({
          open: true,
          message: '已添加新家庭成员',
          severity: 'success'
        });
      }
      
      handleCloseDialog();
      
      // Auto close the alert after 3 seconds
      setTimeout(() => {
        setAlertInfo({
          ...alertInfo,
          open: false
        });
      }, 3000);
    } catch (error) {
      setAlertInfo({
        open: true,
        message: '操作失败: ' + (error.message || '未知错误'),
        severity: 'error'
      });
    }
  };
  
  const handleRemoveMember = async (memberId) => {
    if (window.confirm('确定要删除这个家庭成员吗？')) {
      try {
        await userStore.removeFamilyMember(memberId);
        setAlertInfo({
          open: true,
          message: '已删除家庭成员',
          severity: 'success'
        });
        
        // Auto close the alert after 3 seconds
        setTimeout(() => {
          setAlertInfo({
            ...alertInfo,
            open: false
          });
        }, 3000);
      } catch (error) {
        setAlertInfo({
          open: true,
          message: '删除失败: ' + (error.message || '未知错误'),
          severity: 'error'
        });
      }
    }
  };
  
  const handleLogout = () => {
    userStore.logout();
    window.location.href = '/login';
  };
  
  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1">个人中心</Typography>
        
        <Button 
          variant="outlined" 
          color="error" 
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
        >
          退出登录
        </Button>
      </Box>
      
      <Collapse in={alertInfo.open}>
        <Alert 
          severity={alertInfo.severity} 
          sx={{ mb: 2 }}
          onClose={() => setAlertInfo({ ...alertInfo, open: false })}
        >
          {alertInfo.message}
        </Alert>
      </Collapse>
      
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          aria-label="profile tabs"
        >
          <Tab icon={<PersonIcon />} label="个人信息" />
          <Tab icon={<FamilyRestroomIcon />} label="家庭成员" />
          <Tab icon={<SettingsIcon />} label="设置" />
        </Tabs>
      </Paper>
      
      {/* Personal Info Tab */}
      <TabPanel value={tabValue} index={0}>
        <Card>
          <CardHeader 
            title="个人资料" 
            subheader="您的个人信息和健康状况"
            avatar={
              <Avatar {...stringAvatar(profileData.name || '用户')} />
            }
          />
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="姓名"
                  name="name"
                  value={profileData.name}
                  onChange={handleProfileChange}
                  fullWidth
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="邮箱"
                  name="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  fullWidth
                  margin="normal"
                  disabled // Email usually can't be changed
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="电话"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleProfileChange}
                  fullWidth
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="gender-label">性别</InputLabel>
                  <Select
                    labelId="gender-label"
                    name="gender"
                    value={profileData.gender}
                    label="性别"
                    onChange={handleProfileChange}
                  >
                    <MenuItem value="male">男</MenuItem>
                    <MenuItem value="female">女</MenuItem>
                    <MenuItem value="other">其他</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="身高 (cm)"
                  name="height"
                  type="number"
                  value={profileData.height}
                  onChange={handleProfileChange}
                  fullWidth
                  margin="normal"
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="体重 (kg)"
                  name="weight"
                  type="number"
                  value={profileData.weight}
                  onChange={handleProfileChange}
                  fullWidth
                  margin="normal"
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="出生日期"
                  name="birthdate"
                  type="date"
                  value={profileData.birthdate}
                  onChange={handleProfileChange}
                  fullWidth
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="过敏物"
                  name="allergies"
                  value={profileData.allergies}
                  onChange={handleProfileChange}
                  fullWidth
                  margin="normal"
                  placeholder="如海鲜、花生等，多个过敏物用逗号分隔"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="饮食限制"
                  name="dietaryRestrictions"
                  value={profileData.dietaryRestrictions}
                  onChange={handleProfileChange}
                  fullWidth
                  margin="normal"
                  placeholder="如素食、无麸质等"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="健康目标"
                  name="healthGoals"
                  value={profileData.healthGoals}
                  onChange={handleProfileChange}
                  fullWidth
                  margin="normal"
                  multiline
                  rows={3}
                  placeholder="如减重、增肌、控制血糖等"
                />
              </Grid>
            </Grid>
          </CardContent>
          <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
            <Button
              variant="contained"
              onClick={handleUpdateProfile}
            >
              保存资料
            </Button>
          </CardActions>
        </Card>
      </TabPanel>
      
      {/* Family Members Tab */}
      <TabPanel value={tabValue} index={1}>
        <Card>
          <CardHeader 
            title="家庭成员" 
            subheader="管理您的家庭成员信息"
            action={
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenAddMemberDialog}
              >
                添加成员
              </Button>
            }
          />
          <CardContent>
            {userStore.familyMembers.length === 0 ? (
              <Typography variant="body1" sx={{ textAlign: 'center', py: 3 }}>
                您还没有添加家庭成员，点击"添加成员"按钮开始添加
              </Typography>
            ) : (
              <List>
                {userStore.familyMembers.map((member, index) => (
                  <React.Fragment key={member.id}>
                    {index > 0 && <Divider variant="inset" component="li" />}
                    <ListItem alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar {...stringAvatar(member.name)} />
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography fontWeight="bold">{member.name}</Typography>
                            <Typography 
                              variant="body2" 
                              color="text.secondary" 
                              sx={{ ml: 1 }}
                            >
                              ({member.relationship})
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" component="span">
                              {member.gender === 'male' ? '男' : 
                               member.gender === 'female' ? '女' : '其他'}
                              {member.birthdate && ` · ${new Date(member.birthdate).getFullYear()}年生`}
                              {member.height && member.weight && 
                               ` · ${member.height}cm/${member.weight}kg`}
                            </Typography>
                            {member.allergies && (
                              <Typography variant="body2" component="div" color="error">
                                过敏物: {member.allergies}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton 
                          edge="end" 
                          aria-label="edit"
                          onClick={() => handleOpenEditMemberDialog(member)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          edge="end" 
                          aria-label="delete"
                          onClick={() => handleRemoveMember(member.id)}
                          sx={{ ml: 1 }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      </TabPanel>
      
      {/* Settings Tab */}
      <TabPanel value={tabValue} index={2}>
        <Card>
          <CardHeader 
            title="应用设置" 
            subheader="个性化您的应用设置"
          />
          <CardContent>
            <List>
              <ListItem>
                <ListItemText 
                  primary="推送通知" 
                  secondary="接收菜单更新和提醒" 
                />
                <Switch 
                  edge="end"
                  checked={true}
                  onChange={() => {}}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary="夜间模式" 
                  secondary="使用深色主题" 
                />
                <Switch 
                  edge="end"
                  checked={false}
                  onChange={() => {}}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary="数据隐私" 
                  secondary="允许使用匿名数据改进服务" 
                />
                <Switch 
                  edge="end"
                  checked={true}
                  onChange={() => {}}
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </TabPanel>
      
      {/* Family Member Dialog */}
      <Dialog open={openMemberDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingMember ? '编辑家庭成员' : '添加家庭成员'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="姓名"
                name="name"
                value={memberData.name}
                onChange={handleMemberDataChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="relationship-label">关系</InputLabel>
                <Select
                  labelId="relationship-label"
                  name="relationship"
                  value={memberData.relationship}
                  label="关系"
                  onChange={handleMemberDataChange}
                >
                  <MenuItem value="spouse">配偶</MenuItem>
                  <MenuItem value="child">子女</MenuItem>
                  <MenuItem value="parent">父母</MenuItem>
                  <MenuItem value="sibling">兄弟姐妹</MenuItem>
                  <MenuItem value="other">其他</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="member-gender-label">性别</InputLabel>
                <Select
                  labelId="member-gender-label"
                  name="gender"
                  value={memberData.gender}
                  label="性别"
                  onChange={handleMemberDataChange}
                >
                  <MenuItem value="male">男</MenuItem>
                  <MenuItem value="female">女</MenuItem>
                  <MenuItem value="other">其他</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="出生日期"
                name="birthdate"
                type="date"
                value={memberData.birthdate}
                onChange={handleMemberDataChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="身高 (cm)"
                name="height"
                type="number"
                value={memberData.height}
                onChange={handleMemberDataChange}
                fullWidth
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="体重 (kg)"
                name="weight"
                type="number"
                value={memberData.weight}
                onChange={handleMemberDataChange}
                fullWidth
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="过敏物"
                name="allergies"
                value={memberData.allergies}
                onChange={handleMemberDataChange}
                fullWidth
                placeholder="如海鲜、花生等，多个过敏物用逗号分隔"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="饮食限制"
                name="dietaryRestrictions"
                value={memberData.dietaryRestrictions}
                onChange={handleMemberDataChange}
                fullWidth
                placeholder="如素食、无麸质等"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>取消</Button>
          <Button 
            onClick={handleSaveMember} 
            variant="contained"
            disabled={!memberData.name || !memberData.relationship}
          >
            保存
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
});

export default ProfilePage;
