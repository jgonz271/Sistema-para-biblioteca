'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Add, CheckCircle } from '@mui/icons-material';
import type { Loan, Book, User } from '@/types';
import Notification from '../common/Notification';

export default function LoansList() {
  const [loans, setLoans] = useState<Loan[]>([]);
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
    libroId: '',
    usuarioId: '',
    diasPrestamo: 15,
  });

  useEffect(() => {
    fetchLoans();
    fetchBooksAndUsers();
  }, []);

  const fetchLoans = async () => {
    try {
      const response = await fetch('/api/loans');
      const data = await response.json();

      if (data.success) {
        setLoans(data.data);
      }
    } catch (error) {
      console.error('Error al cargar préstamos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBooksAndUsers = async () => {
    try {
      const [booksRes, usersRes] = await Promise.all([
        fetch('/api/books?available=true'),
        fetch('/api/users?active=true'),
      ]);

      const booksData = await booksRes.json();
      const usersData = await usersRes.json();

      if (booksData.success) setBooks(booksData.data);
      if (usersData.success) setUsers(usersData.data);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
  };

  const handleOpenDialog = () => {
    setFormData({
      libroId: '',
      usuarioId: '',
      diasPrestamo: 15,
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
      const response = await fetch('/api/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        handleCloseDialog();
        fetchLoans();
        fetchBooksAndUsers();
        setNotification({
          open: true,
          message: ' Préstamo creado exitosamente',
          severity: 'success',
        });
      } else {
        setError(data.error);
      }
    } catch (error) {
      console.error('Error al crear préstamo:', error);
      setError('Error al crear el préstamo');
    }
  };

  const handleReturn = async (loanId: string) => {
    if (!confirm('¿Confirmar devolución del libro?')) return;

    try {
      const response = await fetch(`/api/loans/${loanId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'return' }),
      });

      const data = await response.json();

      if (data.success) {
        fetchLoans();
        fetchBooksAndUsers();
        setNotification({
          open: true,
          message: data.message || ' Libro devuelto exitosamente',
          severity: data.data.multa > 0 ? 'warning' : 'success',
        });
      } else {
        setNotification({
          open: true,
          message: 'Error al procesar devolución',
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('Error al procesar devolución:', error);
    }
  };

  const getBookTitle = (libroId: string) => {
    const book = books.find((b) => b.id === libroId);
    return book?.titulo || 'Desconocido';
  };

  const getUserName = (usuarioId: string) => {
    const user = users.find((u) => u.id === usuarioId);
    return user ? `${user.nombre} ${user.apellido}` : 'Desconocido';
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'activo':
        return 'primary';
      case 'devuelto':
        return 'success';
      case 'vencido':
        return 'error';
      default:
        return 'default';
    }
  };

  const isOverdue = (loan: Loan) => {
    if (loan.estado !== 'activo') return false;
    return new Date(loan.fechaDevolucionEstimada) < new Date();
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>
          Gestión de Préstamos
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenDialog}
        >
          Nuevo Préstamo
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'grey.100' }}>
              <TableCell><strong>Libro</strong></TableCell>
              <TableCell><strong>Usuario</strong></TableCell>
              <TableCell><strong>Fecha Préstamo</strong></TableCell>
              <TableCell><strong>Fecha Devolución</strong></TableCell>
              <TableCell><strong>Estado</strong></TableCell>
              <TableCell><strong>Multa</strong></TableCell>
              <TableCell align="right"><strong>Acciones</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loans.map((loan) => (
              <TableRow key={loan.id} hover>
                <TableCell>{getBookTitle(loan.libroId)}</TableCell>
                <TableCell>{getUserName(loan.usuarioId)}</TableCell>
                <TableCell>
                  {new Date(loan.fechaPrestamo).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {loan.fechaDevolucionReal
                    ? new Date(loan.fechaDevolucionReal).toLocaleDateString()
                    : new Date(loan.fechaDevolucionEstimada).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Chip
                    label={isOverdue(loan) ? 'Vencido' : loan.estado}
                    color={isOverdue(loan) ? 'error' : getStatusColor(loan.estado)}
                    size="small"
                  />
                </TableCell>
                <TableCell>${loan.multa}</TableCell>
                <TableCell align="right">
                  {loan.estado === 'activo' && (
                    <Button
                      size="small"
                      startIcon={<CheckCircle />}
                      onClick={() => handleReturn(loan.id)}
                    >
                      Devolver
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {loans.length === 0 && (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary">
            No hay préstamos registrados
          </Typography>
        </Box>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Nuevo Préstamo</DialogTitle>
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
              value={formData.libroId}
              onChange={(e) => setFormData({ ...formData, libroId: e.target.value })}
              required
              fullWidth
            >
              {books.map((book) => (
                <MenuItem key={book.id} value={book.id}>
                  {book.titulo} - {book.autor} ({book.copiasDisponibles} disponibles)
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Usuario"
              value={formData.usuarioId}
              onChange={(e) => setFormData({ ...formData, usuarioId: e.target.value })}
              required
              fullWidth
            >
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.nombre} {user.apellido} ({user.prestamosActivos} préstamos)
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Días de Préstamo"
              type="number"
              value={formData.diasPrestamo}
              onChange={(e) => setFormData({ ...formData, diasPrestamo: parseInt(e.target.value) })}
              required
              fullWidth
              inputProps={{ min: 1, max: 30 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            Crear Préstamo
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
