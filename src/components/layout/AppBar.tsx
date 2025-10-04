'use client';

import {
  AppBar as MuiAppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Tooltip,
} from '@mui/material';
import {
  Notifications,
  Settings,
  AccountCircle,
} from '@mui/icons-material';

const drawerWidth = 260;

export default function AppBar() {
  return (
    <MuiAppBar
      position="fixed"
      sx={{
        width: `calc(100% - ${drawerWidth}px)`,
        ml: `${drawerWidth}px`,
        backgroundColor: 'white',
        color: 'text.primary',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
      }}
    >
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          Sistema de Gestión de Biblioteca
        </Typography>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Notificaciones">
            <IconButton color="inherit">
              <Notifications />
            </IconButton>
          </Tooltip>

          <Tooltip title="Configuración">
            <IconButton color="inherit">
              <Settings />
            </IconButton>
          </Tooltip>

          <Tooltip title="Perfil">
            <IconButton color="inherit">
              <AccountCircle />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </MuiAppBar>
  );
}
