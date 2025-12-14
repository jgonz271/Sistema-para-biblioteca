/**
 * Servicio de Historial de Operaciones
 * Utiliza Stack (Pila LIFO) para mantener el registro de operaciones
*/

import { Stack } from '@/lib/data-structures';
import type { Operation, OperationType } from '@/types';

export class HistoryService {
  private history: Stack<Operation>;
  private static instance: HistoryService;
  private readonly MAX_HISTORY = 100;

  private constructor() {
    this.history = new Stack<Operation>();
  }

  /**
   * Patrón Singleton
   */
  public static getInstance(): HistoryService {
    if (!HistoryService.instance) {
      HistoryService.instance = new HistoryService();
    }
    return HistoryService.instance;
  }

  /**
   * Genera un ID único
   */
  private generateId(): string {
    return `OP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Registra una nueva operación
   */
  public logOperation(
    tipo: OperationType,
    descripcion: string,
    usuarioId?: string,
    libroId?: string,
    detalles?: Record<string, unknown>
  ): Operation {
    const operation: Operation = {
      id: this.generateId(),
      tipo,
      descripcion,
      fecha: new Date(),
      usuarioId,
      libroId,
      detalles,
    };

    this.history.push(operation);

    // Limitar el tamaño del historial
    if (this.history.size() > this.MAX_HISTORY) {
      const recentOperations = this.history.toArray().slice(0, this.MAX_HISTORY);
      this.history.clear();
      recentOperations.reverse().forEach(op => this.history.push(op));
    }

    return operation;
  }

  /**
   * Registra operación de agregar libro
   */
  public logAddBook(bookId: string, titulo: string): Operation {
    return this.logOperation(
      'agregar_libro',
      `Libro agregado: ${titulo}`,
      undefined,
      bookId
    );
  }

  /**
   * Registra operación de eliminar libro
   */
  public logDeleteBook(bookId: string, titulo: string): Operation {
    return this.logOperation(
      'eliminar_libro',
      `Libro eliminado: ${titulo}`,
      undefined,
      bookId
    );
  }

  /**
   * Registra operación de editar libro
   */
  public logEditBook(bookId: string, titulo: string): Operation {
    return this.logOperation(
      'editar_libro',
      `Libro editado: ${titulo}`,
      undefined,
      bookId
    );
  }

  /**
   * Registra operación de agregar usuario
   */
  public logAddUser(userId: string, nombre: string): Operation {
    return this.logOperation(
      'agregar_usuario',
      `Usuario registrado: ${nombre}`,
      userId
    );
  }

  /**
   * Registra operación de eliminar usuario
   */
  public logDeleteUser(userId: string, nombre: string): Operation {
    return this.logOperation(
      'eliminar_usuario',
      `Usuario eliminado: ${nombre}`,
      userId
    );
  }

  /**
   * Registra operación de préstamo
   */
  public logLoan(
    userId: string,
    bookId: string,
    userName: string,
    bookTitle: string
  ): Operation {
    return this.logOperation(
      'realizar_prestamo',
      `Préstamo: ${bookTitle} a ${userName}`,
      userId,
      bookId
    );
  }

  /**
   * Registra operación de devolución
   */
  public logReturn(
    userId: string,
    bookId: string,
    userName: string,
    bookTitle: string
  ): Operation {
    return this.logOperation(
      'devolver_libro',
      `Devolución: ${bookTitle} por ${userName}`,
      userId,
      bookId
    );
  }

  /**
   * Registra operación de reserva
   */
  public logReservation(
    userId: string,
    bookId: string,
    userName: string,
    bookTitle: string
  ): Operation {
    return this.logOperation(
      'agregar_reserva',
      `Reserva: ${bookTitle} por ${userName}`,
      userId,
      bookId
    );
  }

  /**
   * Obtiene las últimas N operaciones
   */
  public getRecentOperations(count: number = 10): Operation[] {
    return this.history.peekN(count);
  }

  /**
   * Obtiene todas las operaciones
   */
  public getAllOperations(): Operation[] {
    return this.history.toArray();
  }

  /**
   * Filtra operaciones por tipo
   */
  public getOperationsByType(tipo: OperationType): Operation[] {
    return this.history.toArray().filter(op => op.tipo === tipo);
  }

  /**
   * Obtiene operaciones de un usuario
   */
  public getUserOperations(userId: string): Operation[] {
    return this.history.toArray().filter(op => op.usuarioId === userId);
  }

  /**
   * Obtiene operaciones relacionadas con un libro
   */
  public getBookOperations(bookId: string): Operation[] {
    return this.history.toArray().filter(op => op.libroId === bookId);
  }

  /**
   * Obtiene operaciones en un rango de fechas
   */
  public getOperationsByDateRange(startDate: Date, endDate: Date): Operation[] {
    return this.history.toArray().filter(op => 
      op.fecha >= startDate && op.fecha <= endDate
    );
  }

  /**
   * Obtiene la última operación
   */
  public getLastOperation(): Operation | null {
    return this.history.peek();
  }

  /**
   * Obtiene estadísticas del historial
   */
  public getStats() {
    const allOperations = this.getAllOperations();
    const operationCounts: Record<string, number> = {};

    allOperations.forEach(op => {
      operationCounts[op.tipo] = (operationCounts[op.tipo] || 0) + 1;
    });

    return {
      total: allOperations.length,
      porTipo: operationCounts,
      ultimaOperacion: this.getLastOperation(),
    };
  }

  /**
   * Limpia todo el historial
   */
  public clear(): void {
    this.history.clear();
  }

  /**
   * Exporta el historial a formato JSON
   */
  public exportHistory(): string {
    return JSON.stringify(this.getAllOperations(), null, 2);
  }
}
