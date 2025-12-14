/**
 * Servicio de Préstamos
 * Utiliza DynamicArray para gestionar préstamos activos e históricos
 */

import { DynamicArray } from '@/lib/data-structures';
import type { Loan, CreateLoanDTO } from '@/types';
import { BookServiceV2 } from '../v2/BookServiceV2';
import { UserServiceV2 } from '../v2/UserServiceV2';
import { ReservationService } from './ReservationService';
import { HistoryService } from './HistoryService';
import { GraphService } from '../v3/GraphService';

export class LoanService {
  private loans: DynamicArray<Loan>;
  private static instance: LoanService;

  private bookService: BookServiceV2;
  private userService: UserServiceV2;
  private reservationService: ReservationService;
  private historyService: HistoryService;
  private graphService: GraphService;

  private constructor() {
    this.loans = new DynamicArray<Loan>();
    this.bookService = BookServiceV2.getInstance();
    this.userService = UserServiceV2.getInstance();
    this.reservationService = ReservationService.getInstance();
    this.historyService = HistoryService.getInstance();
    this.graphService = GraphService.getInstance();
    this.initializeGraphFromExistingData();
  }

  /**
   * Inicializa el grafo con datos existentes de usuarios y libros
   */
  private initializeGraphFromExistingData(): void {
    const users = this.userService.getAllUsers();
    const books = this.bookService.getAllBooks();
    
    users.forEach(user => this.graphService.addUser(user.id));
    books.forEach(book => this.graphService.addBook(book.id));
  }

  /**
   * Patrón Singleton
   */
  public static getInstance(): LoanService {
    if (!LoanService.instance) {
      LoanService.instance = new LoanService();
    }
    return LoanService.instance;
  }

  /**
   * Genera un ID único
   */
  private generateId(): string {
    return `LN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Calcula la fecha de devolución estimada
   */
  private calculateReturnDate(dias: number): Date {
    const date = new Date();
    date.setDate(date.getDate() + dias);
    return date;
  }

  /**
   * Calcula la multa por retraso (por día)
   */
  private calculateFine(fechaEstimada: Date, fechaReal: Date): number {
    const multaPorDia = 500;
    const diffTime = fechaReal.getTime() - fechaEstimada.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays * multaPorDia : 0;
  }

  /**
   * Crea un nuevo préstamo
   */
  public createLoan(data: CreateLoanDTO): Loan {
    const { libroId, usuarioId, diasPrestamo } = data;

    const book = this.bookService.findBookById(libroId);
    if (!book) {
      throw new Error('Libro no encontrado');
    }

    if (book.copiasDisponibles <= 0) {
      throw new Error('No hay copias disponibles de este libro');
    }

    const user = this.userService.findUserById(usuarioId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    if (!user.activo) {
      throw new Error('Usuario inactivo');
    }

    if (!this.userService.canRequestLoan(usuarioId)) {
      throw new Error('El usuario ha alcanzado el límite de préstamos activos');
    }

    // Objeto para el prestamos
    const loan: Loan = {
      id: this.generateId(),
      libroId,
      usuarioId,
      fechaPrestamo: new Date(),
      fechaDevolucionEstimada: this.calculateReturnDate(diasPrestamo),
      estado: 'activo',
      multa: 0,
    };

    // Actualizar estado del libro
    this.bookService.decreaseAvailableCopies(libroId);

    // Actualizar contador de préstamos del usuario
    this.userService.incrementActiveLoans(usuarioId);

    // Guardar el préstamo
    this.loans.push(loan);

    // Registrar en el grafo para recomendaciones
    this.graphService.recordLoan(usuarioId, libroId);

    this.historyService.logLoan(
      usuarioId,
      libroId,
      `${user.nombre} ${user.apellido}`,
      book.titulo
    );

    return loan;
  }

  /**
   * Procesa la devolución de un libro
   */
  public returnBook(loanId: string): Loan {
    const loan = this.findLoanById(loanId);
    if (!loan) {
      throw new Error('Préstamo no encontrado');
    }

    if (loan.estado !== 'activo') {
      throw new Error('Este préstamo ya fue devuelto');
    }

    const fechaDevolucion = new Date();
    
    // Calcular multa si hay retraso
    const multa = this.calculateFine(loan.fechaDevolucionEstimada, fechaDevolucion);

    // Actualizar el préstamo
    loan.fechaDevolucionReal = fechaDevolucion;
    loan.estado = multa > 0 ? 'vencido' : 'devuelto';
    loan.multa = multa;

    // Actualizar estado del libro
    this.bookService.increaseAvailableCopies(loan.libroId);

    // Actualizar contador de préstamos del usuario
    this.userService.decrementActiveLoans(loan.usuarioId);

    // Verificar si hay reservas pendientes
    if (this.reservationService.hasReservations(loan.libroId)) {
      const nextReservation = this.reservationService.processNextReservation(loan.libroId);
      // Aquí podrías implementar notificaciones
      console.log('Libro disponible para reserva:', nextReservation);
    }

    // Registrar en el historial
    const user = this.userService.findUserById(loan.usuarioId);
    const book = this.bookService.findBookById(loan.libroId);
    
    if (user && book) {
      this.historyService.logReturn(
        loan.usuarioId,
        loan.libroId,
        `${user.nombre} ${user.apellido}`,
        book.titulo
      );
    }

    return loan;
  }

  /**
   * Obtiene todos los préstamos
   */
  public getAllLoans(): Loan[] {
    return this.loans.toArray();
  }

  /**
   * Busca un préstamo por ID
   */
  public findLoanById(id: string): Loan | null {
    return this.loans.find(loan => loan.id === id) || null;
  }

  /**
   * Obtiene préstamos activos
   */
  public getActiveLoans(): Loan[] {
    return this.loans.filter(loan => loan.estado === 'activo');
  }

  /**
   * Obtiene préstamos de un usuario
   */
  public getUserLoans(userId: string): Loan[] {
    return this.loans.filter(loan => loan.usuarioId === userId);
  }

  /**
   * Obtiene préstamos activos de un usuario
   */
  public getUserActiveLoans(userId: string): Loan[] {
    return this.loans.filter(
      loan => loan.usuarioId === userId && loan.estado === 'activo'
    );
  }

  /**
   * Obtiene préstamos de un libro
   */
  public getBookLoans(bookId: string): Loan[] {
    return this.loans.filter(loan => loan.libroId === bookId);
  }

  /**
   * Obtiene préstamos vencidos
   */
  public getOverdueLoans(): Loan[] {
    const now = new Date();
    return this.loans.filter(
      loan => loan.estado === 'activo' && loan.fechaDevolucionEstimada < now
    );
  }

  /**
   * Verifica si un préstamo está vencido
   */
  public isOverdue(loanId: string): boolean {
    const loan = this.findLoanById(loanId);
    if (!loan || loan.estado !== 'activo') return false;

    return loan.fechaDevolucionEstimada < new Date();
  }

  /**
   * Obtiene días restantes para la devolución
   */
  public getDaysUntilReturn(loanId: string): number {
    const loan = this.findLoanById(loanId);
    if (!loan || loan.estado !== 'activo') return 0;

    const now = new Date();
    const diffTime = loan.fechaDevolucionEstimada.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  }

  /**
   * Obtiene estadísticas de préstamos
   */
  public getStats() {
    const allLoans = this.getAllLoans();
    const activeLoans = this.getActiveLoans();
    const overdueLoans = this.getOverdueLoans();

    return {
      total: allLoans.length,
      activos: activeLoans.length,
      vencidos: overdueLoans.length,
      devueltos: allLoans.filter(l => l.estado === 'devuelto').length,
      multaTotal: allLoans.reduce((sum, l) => sum + l.multa, 0),
    };
  }

  /**
   * Limpia todos los préstamos
   */
  public clear(): void {
    this.loans.clear();
  }
}
