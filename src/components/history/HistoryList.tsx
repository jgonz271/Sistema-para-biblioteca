'use client';


import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab';
import {
  Book,
  People,
  LocalLibrary,
  Bookmark,
  Edit,
} from '@mui/icons-material';
import type { Operation } from '@/types';

export default function HistoryList() {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/history?limit=50');
      const data = await response.json();

      if (data.success) {
        setOperations(data.data);
      }
    } catch (error) {
      console.error('Error al cargar historial:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'agregar_libro':
      case 'eliminar_libro':
      case 'editar_libro':
        return <Book />;
      case 'agregar_usuario':
      case 'eliminar_usuario':
      case 'editar_usuario':
        return <People />;
      case 'realizar_prestamo':
      case 'devolver_libro':
        return <LocalLibrary />;
      case 'agregar_reserva':
      case 'cancelar_reserva':
        return <Bookmark />;
      default:
        return <Edit />;
    }
  };

  const getColor = (tipo: string) => {
    if (tipo.includes('agregar')) return 'success';
    if (tipo.includes('eliminar')) return 'error';
    if (tipo.includes('devolver')) return 'info';
    if (tipo.includes('prestamo') || tipo.includes('reserva')) return 'warning';
    return 'primary';
  };

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      agregar_libro: 'Libro Agregado',
      eliminar_libro: 'Libro Eliminado',
      editar_libro: 'Libro Editado',
      agregar_usuario: 'Usuario Registrado',
      eliminar_usuario: 'Usuario Eliminado',
      editar_usuario: 'Usuario Editado',
      realizar_prestamo: 'Préstamo Realizado',
      devolver_libro: 'Libro Devuelto',
      agregar_reserva: 'Reserva Creada',
      cancelar_reserva: 'Reserva Cancelada',
    };
    return labels[tipo] || tipo;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Historial de Operaciones
      </Typography>


      {operations.length === 0 ? (
        <Card>
          <CardContent>
            <Typography variant="body1" color="text.secondary" textAlign="center" py={4}>
              No hay operaciones registradas
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Timeline position="right">
          {operations.map((operation, index) => (
            <TimelineItem key={operation.id}>
              <TimelineOppositeContent color="text.secondary" sx={{ flex: 0.3 }}>
                <Typography variant="body2">
                  {new Date(operation.fecha).toLocaleDateString()}
                </Typography>
                <Typography variant="caption">
                  {new Date(operation.fecha).toLocaleTimeString()}
                </Typography>
              </TimelineOppositeContent>

              <TimelineSeparator>
                <TimelineDot color={getColor(operation.tipo)}>
                  {getIcon(operation.tipo)}
                </TimelineDot>
                {index < operations.length - 1 && <TimelineConnector />}
              </TimelineSeparator>

              <TimelineContent>
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Chip
                        label={getTipoLabel(operation.tipo)}
                        color={getColor(operation.tipo)}
                        size="small"
                      />
                    </Box>
                    <Typography variant="body1">
                      {operation.descripcion}
                    </Typography>
                  </CardContent>
                </Card>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      )}
    </Box>
  );
}
