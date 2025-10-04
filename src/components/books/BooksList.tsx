'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
} from '@mui/icons-material';
import type { Book, BookCategory } from '@/types';
import Notification from '../common/Notification';

const categorias: BookCategory[] = [
  'Ficción',
  'Ciencia',
  'Historia',
  'Tecnología',
  'Arte',
  'Biografía',
  'Filosofía',
  'Otro',
];

export default function BooksList() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
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
    titulo: '',
    autor: '',
    isbn: '',
    categoria: 'Ficción' as BookCategory,
    anioPublicacion: new Date().getFullYear(),
    editorial: '',
    numeroPaginas: 0,
    copias: 1,
    descripcion: '',
  });

  const fetchBooks = useCallback(async () => {
    try {
      const url = searchQuery 
        ? `/api/books?search=${encodeURIComponent(searchQuery)}`
        : '/api/books';
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setBooks(data.data);
      }
    } catch (error) {
      console.error('Error al cargar libros:', error);
      setError('Error al cargar los libros');
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleSearch = () => {
    setLoading(true);
    fetchBooks();
  };

  const handleOpenDialog = (book?: Book) => {
    if (book) {
      setEditingBook(book);
      setFormData({
        titulo: book.titulo,
        autor: book.autor,
        isbn: book.isbn,
        categoria: book.categoria,
        anioPublicacion: book.anioPublicacion,
        editorial: book.editorial,
        numeroPaginas: book.numeroPaginas,
        copias: book.copias,
        descripcion: book.descripcion || '',
      });
    } else {
      setEditingBook(null);
      setFormData({
        titulo: '',
        autor: '',
        isbn: '',
        categoria: 'Ficción',
        anioPublicacion: new Date().getFullYear(),
        editorial: '',
        numeroPaginas: 0,
        copias: 1,
        descripcion: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingBook(null);
    setError(null);
  };

  const handleSubmit = async () => {
    try {
      const url = editingBook ? `/api/books/${editingBook.id}` : '/api/books';
      const method = editingBook ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        handleCloseDialog();
        fetchBooks();
        setNotification({
          open: true,
          message: editingBook ? ' Libro actualizado exitosamente' : ' Libro creado exitosamente',
          severity: 'success',
        });
      } else {
        setError(data.error);
      }
    } catch (error) {
      console.error('Error al guardar libro:', error);
      setError('Error al guardar el libro');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este libro?')) return;

    try {
      const response = await fetch(`/api/books/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        fetchBooks();
        setNotification({
          open: true,
          message: '🗑️ Libro eliminado exitosamente',
          severity: 'success',
        });
      } else {
        setNotification({
          open: true,
          message: 'Error al eliminar libro',
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('Error al eliminar libro:', error);
      setNotification({
        open: true,
        message: 'Error al eliminar libro',
        severity: 'error',
      });
    }
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'disponible':
        return 'success';
      case 'prestado':
        return 'error';
      case 'reservado':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (loading && books.length === 0) {
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
          Gestión de Libros
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Agregar Libro
        </Button>
      </Box>

      <Box display="flex" gap={2} mb={3}>
        <TextField
          fullWidth
          placeholder="Buscar por título o autor..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
        />
        <Button variant="outlined" onClick={handleSearch}>
          Buscar
        </Button>
      </Box>

      <Box display="flex" flexWrap="wrap" gap={3}>
        {books.map((book) => (
          <Card key={book.id} sx={{ width: 320 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                <Typography variant="h6" fontWeight={600}>
                  {book.titulo}
                </Typography>
                <Chip
                  label={book.estado}
                  color={getStatusColor(book.estado)}
                  size="small"
                />
              </Box>

              <Typography variant="body2" color="text.secondary" mb={1}>
                <strong>Autor:</strong> {book.autor}
              </Typography>

              <Typography variant="body2" color="text.secondary" mb={1}>
                <strong>ISBN:</strong> {book.isbn}
              </Typography>

              <Typography variant="body2" color="text.secondary" mb={1}>
                <strong>Categoría:</strong> {book.categoria}
              </Typography>

              <Typography variant="body2" color="text.secondary" mb={1}>
                <strong>Editorial:</strong> {book.editorial}
              </Typography>

              <Typography variant="body2" color="text.secondary" mb={1}>
                <strong>Año:</strong> {book.anioPublicacion}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                <strong>Disponibles:</strong> {book.copiasDisponibles} / {book.copias}
              </Typography>
            </CardContent>

            <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
              <IconButton
                size="small"
                color="primary"
                onClick={() => handleOpenDialog(book)}
              >
                <Edit />
              </IconButton>
              <IconButton
                size="small"
                color="error"
                onClick={() => handleDelete(book.id)}
              >
                <Delete />
              </IconButton>
            </CardActions>
          </Card>
        ))}
      </Box>

      {books.length === 0 && !loading && (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary">
            No se encontraron libros
          </Typography>
        </Box>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingBook ? 'Editar Libro' : 'Agregar Nuevo Libro'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Título"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              required
              fullWidth
            />

            <TextField
              label="Autor"
              value={formData.autor}
              onChange={(e) => setFormData({ ...formData, autor: e.target.value })}
              required
              fullWidth
            />

            <TextField
              label="ISBN"
              value={formData.isbn}
              onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
              required
              fullWidth
            />

            <TextField
              select
              label="Categoría"
              value={formData.categoria}
              onChange={(e) => setFormData({ ...formData, categoria: e.target.value as BookCategory })}
              fullWidth
            >
              {categorias.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Editorial"
              value={formData.editorial}
              onChange={(e) => setFormData({ ...formData, editorial: e.target.value })}
              required
              fullWidth
            />

            <Box display="flex" gap={2}>
              <TextField
                label="Año de Publicación"
                type="number"
                value={formData.anioPublicacion}
                onChange={(e) => setFormData({ ...formData, anioPublicacion: parseInt(e.target.value) })}
                required
                fullWidth
              />

              <TextField
                label="Páginas"
                type="number"
                value={formData.numeroPaginas}
                onChange={(e) => setFormData({ ...formData, numeroPaginas: parseInt(e.target.value) })}
                required
                fullWidth
              />

              <TextField
                label="Copias"
                type="number"
                value={formData.copias}
                onChange={(e) => setFormData({ ...formData, copias: parseInt(e.target.value) })}
                required
                fullWidth
              />
            </Box>

            <TextField
              label="Descripción"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingBook ? 'Actualizar' : 'Crear'}
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
