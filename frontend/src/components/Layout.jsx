import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Receipt as ReceiptIcon,
  Build as BuildIcon,
  AttachMoney as AttachMoneyIcon,
  BarChart as BarChartIcon,
  Settings as SettingsIcon,
  ExitToApp as ExitToAppIcon,
  BeachAccess as BeachAccessIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    handleCloseUserMenu();
    logout();
    navigate('/login');
  };

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', roles: ['ADMIN', 'TECNICO', 'RECEPCION', 'CAJA', 'AUXILIAR', 'JEFE_TALLER'] },
    { text: 'Usuarios', icon: <PeopleIcon />, path: '/users', roles: ['ADMIN'] },
    { text: 'Mis Vacaciones', icon: <BeachAccessIcon />, path: '/vacaciones', roles: ['ADMIN', 'TECNICO', 'RECEPCION', 'CAJA', 'AUXILIAR', 'JEFE_TALLER'] },
    { text: 'Clientes', icon: <PersonAddIcon />, path: '/clientes', roles: ['ADMIN', 'RECEPCION'] },
    { text: 'Órdenes de Trabajo', icon: <BuildIcon />, path: '/ordenes', roles: ['ADMIN', 'TECNICO', 'RECEPCION'] },
    { text: 'Caja', icon: <AttachMoneyIcon />, path: '/cashier', roles: ['ADMIN', 'CAJA'] },
    { text: 'Reportes', icon: <BarChartIcon />, path: '/reports', roles: ['ADMIN'] },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.rol)
  );

  const drawer = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="h6" color="primary">
          CRM Talleres
        </Typography>
        <Chip 
          label={user?.rol} 
          color="primary" 
          size="small" 
          sx={{ mt: 1 }}
        />
      </Box>
      <Divider />
      <List>
        {filteredMenuItems.map((item) => (
          <ListItem 
            button 
            key={item.text}
            onClick={() => navigate(item.path)}
            selected={location.pathname === item.path}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem button onClick={handleLogout}>
          <ListItemIcon><ExitToAppIcon /></ListItemIcon>
          <ListItemText primary="Cerrar Sesión" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
              onClick={toggleDrawer(true)}
            >
              <MenuIcon />
            </IconButton>

            <Typography
              variant="h6"
              noWrap
              component="div"
              onClick={() => navigate('/dashboard')}
              sx={{ 
                flexGrow: 1, 
                display: { xs: 'none', sm: 'block' },
                cursor: 'pointer',
                '&:hover': {
                  opacity: 0.8
                }
              }}
            >
              CRM Talleres
            </Typography>

            <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" sx={{ display: { xs: 'none', md: 'block' } }}>
                {user?.nombre_completo}
              </Typography>
              <Tooltip title="Abrir menú">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar alt={user?.nombre_completo} sx={{ bgcolor: 'secondary.main' }}>
                    {user?.nombre_completo?.charAt(0).toUpperCase()}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                <MenuItem disabled>
                  <Typography textAlign="center">{user?.email}</Typography>
                </MenuItem>
                <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/dashboard'); }}>
                  <Typography textAlign="center">Dashboard</Typography>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <Typography textAlign="center" color="error">Cerrar Sesión</Typography>
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
      >
        {drawer}
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default' }}>
        {children}
      </Box>

      <Box component="footer" sx={{ py: 2, px: 2, mt: 'auto', bgcolor: 'background.paper' }}>
        <Container maxWidth="xl">
          <Typography variant="body2" color="text.secondary" align="center">
            © 2026 CRM Talleres - Sistema de Gestión de Talleres
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;
