'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from '@mui/material';
import { Add, Delete, Info } from '@mui/icons-material';
import type { Book, User } from '@/types';
import Notification from '../common/Notification';

interface Reservation {
  id: string;
  libroId: string;
  usuarioId: string;
  fechaReserva: Date;
  activa: boolean;
}

export default function ReservationsList() {
  const [selectedBook, setSelectedBook] = useState<string>('');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const [formData, setFormData] = useState({
    bookId: '',
    userId: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedBook) {
      fetchReservations(selectedBook);
    }
  }, [selectedBook]);

  const fetchData = async () => {
    try {
      const [booksRes, usersRes] = await Promise.all([
        fetch('/api/books'),
        fetch('/api/users?active=true'),
      ]);

      const booksData = await booksRes.json();
      const usersData = await usersRes.json();

      if (booksData.success) {
        setBooks(booksData.data);
        if (booksData.data.length > 0) {
          setSelectedBook(booksData.data[0].id);
        }
      }
      if (usersData.success) setUsers(usersData.data);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReservations = async (bookId: string) => {
    try {
      const response = await fetch(`/api/reservations?bookId=${bookId}`);
      const data = await response.json();

      if (data.success) {
        setReservations(data.data);
      }
    } catch (error) {
      console.error('Error al cargar reservas:', error);
    }
  };

  const handleOpenDialog = () => {
    setFormData({
      bookId: selectedBook || '',
      userId: '',
    });
    setError(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setError(null);
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        handleCloseDialog();
        fetchReservations(selectedBook);
        setNotification({
          open: true,
          message: ` ${data.message} - Posición: ${data.position}`,
          severity: 'success',
        });
      } else {
        setError(data.error);
      }
    } catch (error) {
      console.error('Error al crear reserva:', error);
      setError('Error al crear la reserva');
    }
  };

  const handleCancel = async (bookId: string, userId: string) => {
    if (!confirm('¿Cancelar esta reserva?')) return;

    try {
      const response = await fetch('/api/reservations/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId, userId }),
      });

      const data = await response.json();

      if (data.success) {
        fetchReservations(selectedBook);
        setNotification({
          open: true,
          message: ' Reserva cancelada exitosamente',
          severity: 'success',
        });
      } else {
        setNotification({
          open: true,
          message: 'Error al cancelar reserva',
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('Error al cancelar reserva:', error);
    }
  };

  const getUserName = (id: string) => {
    const user = users.find((u) => u.id === id);
    return user ? `${user.nombre} ${user.apellido}` : 'Desconocido';
  };

  const getSelectedBookInfo = () => {
    return books.find((b) => b.id === selectedBook);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const bookInfo = getSelectedBookInfo();

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>
          Cola de Reservas (FIFO)
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenDialog}
        >
          Nueva Reserva
        </Button>
      </Box>

      <Alert severity="info" icon={<Info />} sx={{ mb: 3 }}>
        Las reservas funcionan con sistema de Cola (FIFO): <strong>Primero en Reservar, Primero en Recibir</strong>. 
        Cuando se devuelva un libro, se notificará al primero de la cola.
      </Alert>

      <Box mb={3}>
        <TextField
          select
          label="Seleccionar Libro"
          value={selectedBook}
          onChange={(e) => setSelectedBook(e.target.value)}
          fullWidth
        >
          {books.map((book) => (
            <MenuItem key={book.id} value={book.id}>
              {book.titulo} - {book.autor}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {bookInfo && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {bookInfo.titulo}
            </Typography>
            <Box display="flex" gap={2} mb={2}>
              <Chip
                label={`${bookInfo.copiasDisponibles} disponibles`}
                color={bookInfo.copiasDisponibles > 0 ? 'success' : 'error'}
              />
              <Chip
                label={`${reservations.length} en cola`}
                color="primary"
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              <strong>Autor:</strong> {bookInfo.autor}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Estado:</strong> {bookInfo.estado}
            </Typography>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Cola de Espera ({reservations.length} personas)
          </Typography>

          {reservations.length === 0 ? (
            <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
              No hay reservas en cola para este libro
            </Typography>
          ) : (
            <List>
              {reservations.map((reservation, index) => (
                <ListItem
                  key={reservation.id}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 1,
                    backgroundColor: index === 0 ? 'primary.50' : 'background.paper',
                  }}
                >
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Chip
                          label={`#${index + 1}`}
                          color={index === 0 ? 'primary' : 'default'}
                          size="small"
                        />
                        <Typography fontWeight={index === 0 ? 600 : 400}>
                          {getUserName(reservation.usuarioId)}
                        </Typography>
                        {index === 0 && (
                          <Chip
                            label="Siguiente"
                            color="success"
                            size="small"
                          />
                        )}
                      </Box>
                    }
                    secondary={`Reservado: ${new Date(reservation.fechaReserva).toLocaleDateString()}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      color="error"
                      onClick={() => handleCancel(reservation.libroId, reservation.usuarioId)}
                    >
                      <Delete />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Nueva Reserva</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              select
              label="Libro"
              value={formData.bookId}
              onChange={(e) => setFormData({ ...formData, bookId: e.target.value })}
              required
              fullWidth
            >
              {books.map((book) => (
                <MenuItem key={book.id} value={book.id}>
                  {book.titulo} - {book.autor}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Usuario"
              value={formData.userId}
              onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
              required
              fullWidth
            >
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.nombre} {user.apellido}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            Crear Reserva
          </Button>
        </DialogActions>
      </Dialog>

      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={() => setNotification({ ...notification, open: false })}
      />
    </Box>
  );
}
