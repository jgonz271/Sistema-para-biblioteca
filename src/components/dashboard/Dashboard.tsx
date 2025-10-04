'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import {
  Book,
  People,
  LocalLibrary,
  Bookmark,
} from '@mui/icons-material';
import StatsCard from './StatsCard';

interface Stats {
  libros: {
    total: number;
    disponibles: number;
    prestados: number;
  };
  usuarios: {
    total: number;
    activos: number;
    conPrestamos: number;
  };
  prestamos: {
    total: number;
    activos: number;
    vencidos: number;
  };
  reservas: {
    total: number;
  };
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={700}>
        Panel de Control
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom mb={4}>
        Resumen general del sistema de biblioteca
      </Typography>

      <Box display="flex" gap={3} flexWrap="wrap" mb={3}>
        <Box flex="1 1 250px">
          <StatsCard
            title="Total Libros"
            value={stats?.libros.total || 0}
            subtitle={`${stats?.libros.disponibles || 0} disponibles`}
            icon={<Book fontSize="large" />}
            color="#1976d2"
          />
        </Box>

        <Box flex="1 1 250px">
          <StatsCard
            title="Usuarios"
            value={stats?.usuarios.total || 0}
            subtitle={`${stats?.usuarios.activos || 0} activos`}
            icon={<People fontSize="large" />}
            color="#2e7d32"
          />
        </Box>

        <Box flex="1 1 250px">
          <StatsCard
            title="Préstamos Activos"
            value={stats?.prestamos.activos || 0}
            subtitle={`${stats?.prestamos.vencidos || 0} vencidos`}
            icon={<LocalLibrary fontSize="large" />}
            color="#ed6c02"
          />
        </Box>

        <Box flex="1 1 250px">
          <StatsCard
            title="Reservas"
            value={stats?.reservas.total || 0}
            subtitle="En cola de espera"
            icon={<Bookmark fontSize="large" />}
            color="#9c27b0"
          />
        </Box>
      </Box>

      <Box display="flex" gap={3} flexWrap="wrap">
        <Box flex="1 1 400px">
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Actividad Reciente
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Las últimas operaciones aparecerán aquí
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box flex="1 1 400px">
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Libros Más Prestados
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Top 5 libros más solicitados
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
