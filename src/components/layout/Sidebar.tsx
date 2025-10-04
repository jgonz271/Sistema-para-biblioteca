'use client';

import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  Typography,
  Box,
} from '@mui/material';
import {
  Home,
  Book,
  People,
  LocalLibrary,
  Bookmark,
  History,
  BarChart,
} from '@mui/icons-material';
import { usePathname, useRouter } from 'next/navigation';

const drawerWidth = 260;

const menuItems = [
  { text: 'Inicio', icon: Home, path: '/' },
  { text: 'Libros', icon: Book, path: '/libros' },
  { text: 'Usuarios', icon: People, path: '/usuarios' },
  { text: 'Préstamos', icon: LocalLibrary, path: '/prestamos' },
  { text: 'Reservas', icon: Bookmark, path: '/reservas' },
  { text: 'Historial', icon: History, path: '/historial' },
  { text: 'Estadísticas', icon: BarChart, path: '/estadisticas' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#fff',
          borderRight: '1px solid rgba(0, 0, 0, 0.12)',
        },
      }}
    >
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Book sx={{ color: 'primary.main', fontSize: 32 }} />
          <Typography variant="h6" fontWeight={700} color="primary">
            Biblioteca
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      <List sx={{ px: 1, pt: 2 }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;

          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => router.push(item.path)}
                selected={isActive}
                sx={{
                  borderRadius: 2,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? 'white' : 'text.secondary',
                    minWidth: 40,
                  }}
                >
                  <Icon />
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 500,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Drawer>
  );
}
