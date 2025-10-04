/**
 * Tipos de datos para el Sistema de Gestión de Biblioteca
 */

// Categorías de libros
export type BookCategory = 
  | 'Ficción'
  | 'Ciencia'
  | 'Historia'
  | 'Tecnología'
  | 'Arte'
  | 'Biografía'
  | 'Filosofía'
  | 'Otro';

// Estado del libro
export type BookStatus = 'disponible' | 'prestado' | 'reservado' | 'mantenimiento';

// Estado del préstamo
export type LoanStatus = 'activo' | 'devuelto' | 'vencido';

// Tipo de operación para el historial
export type OperationType = 
  | 'agregar_libro'
  | 'eliminar_libro'
  | 'editar_libro'
  | 'agregar_usuario'
  | 'eliminar_usuario'
  | 'editar_usuario'
  | 'realizar_prestamo'
  | 'devolver_libro'
  | 'agregar_reserva'
  | 'cancelar_reserva';

/**
 * Interfaz de Libro
 */
export interface Book {
  id: string;
  titulo: string;
  autor: string;
  isbn: string;
  categoria: BookCategory;
  anioPublicacion: number;
  editorial: string;
  numeroPaginas: number;
  estado: BookStatus;
  copias: number;
  copiasDisponibles: number;
  fechaRegistro: Date;
  descripcion?: string;
  portada?: string;
}

/**
 * Interfaz de Usuario
 */
export interface User {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion: string;
  fechaRegistro: Date;
  activo: boolean;
  prestamosActivos: number;
  historialPrestamos: number;
}

/**
 * Interfaz de Préstamo
 */
export interface Loan {
  id: string;
  libroId: string;
  usuarioId: string;
  fechaPrestamo: Date;
  fechaDevolucionEstimada: Date;
  fechaDevolucionReal?: Date;
  estado: LoanStatus;
  multa: number;
  notas?: string;
}

/**
 * Interfaz de Reserva (para la cola de espera)
 */
export interface Reservation {
  id: string;
  libroId: string;
  usuarioId: string;
  fechaReserva: Date;
  activa: boolean;
}

/**
 * Interfaz de Operación (para el historial)
 */
export interface Operation {
  id: string;
  tipo: OperationType;
  descripcion: string;
  fecha: Date;
  usuarioId?: string;
  libroId?: string;
  detalles?: Record<string, unknown>;
}

/**
 * Datos para crear un nuevo libro
 */
export interface CreateBookDTO {
  titulo: string;
  autor: string;
  isbn: string;
  categoria: BookCategory;
  anioPublicacion: number;
  editorial: string;
  numeroPaginas: number;
  copias: number;
  descripcion?: string;
  portada?: string;
}

/**
 * Datos para crear un nuevo usuario
 */
export interface CreateUserDTO {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion: string;
}

/**
 * Datos para crear un préstamo
 */
export interface CreateLoanDTO {
  libroId: string;
  usuarioId: string;
  diasPrestamo: number;
}

/**
 * Estadísticas del sistema
 */
export interface LibraryStats {
  totalLibros: number;
  totalUsuarios: number;
  prestamosActivos: number;
  reservasActivas: number;
  librosMasPrestados: Array<{ libro: Book; prestamos: number }>;
}
