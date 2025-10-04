/**
 * Servicio de Reservas
 * Utiliza Queue (Cola FIFO) para gestionar la lista de espera de libros
 */

import { Queue } from '@/lib/data-structures';
import type { Reservation } from '@/types';

export class ReservationService {
  // Un Queue por cada libro
  private reservationQueues: Map<string, Queue<Reservation>>;
  private static instance: ReservationService;

  private constructor() {
    this.reservationQueues = new Map();
  }

  /**
   * Patrón Singleton
   */
  public static getInstance(): ReservationService {
    if (!ReservationService.instance) {
      ReservationService.instance = new ReservationService();
    }
    return ReservationService.instance;
  }

  /**
   * Genera un ID único
   */
  private generateId(): string {
    return `RSV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Obtiene o crea una cola de reservas para un libro
   */
  private getOrCreateQueue(bookId: string): Queue<Reservation> {
    if (!this.reservationQueues.has(bookId)) {
      this.reservationQueues.set(bookId, new Queue<Reservation>());
    }
    return this.reservationQueues.get(bookId)!;
  }

  /**
   * Agrega una reserva a la cola de espera
   */
  public addReservation(bookId: string, userId: string): Reservation {
    const queue = this.getOrCreateQueue(bookId);

    const existingReservation = queue.find(
      res => res.usuarioId === userId && res.activa
    );

    if (existingReservation) {
      throw new Error('Ya tienes una reserva activa para este libro');
    }

    const reservation: Reservation = {
      id: this.generateId(),
      libroId: bookId,
      usuarioId: userId,
      fechaReserva: new Date(),
      activa: true,
    };

    queue.enqueue(reservation);
    return reservation;
  }

  /**
   * Obtiene la siguiente reserva en la cola (sin eliminarla)
   */
  public getNextReservation(bookId: string): Reservation | null {
    const queue = this.getOrCreateQueue(bookId);
    return queue.peek();
  }

  /**
   * Procesa la siguiente reserva (la elimina de la cola)
   * Se usa cuando un libro se devuelve y hay que asignarlo al siguiente en la cola
   */
  public processNextReservation(bookId: string): Reservation | null {
    const queue = this.getOrCreateQueue(bookId);
    return queue.dequeue();
  }

  /**
   * Cancela una reserva específica
   */
  public cancelReservation(bookId: string, userId: string): boolean {
    const queue = this.getOrCreateQueue(bookId);
    
    const removed = queue.remove(
      res => res.usuarioId === userId && res.activa
    );

    if (removed) {
      removed.activa = false;
      return true;
    }

    return false;
  }

  /**
   * Obtiene todas las reservas activas de un libro
   */
  public getBookReservations(bookId: string): Reservation[] {
    const queue = this.getOrCreateQueue(bookId);
    return queue.toArray().filter(res => res.activa);
  }

  /**
   * Obtiene todas las reservas de un usuario
   */
  public getUserReservations(userId: string): Reservation[] {
    const allReservations: Reservation[] = [];

    this.reservationQueues.forEach(queue => {
      const userReservations = queue.toArray().filter(
        res => res.usuarioId === userId && res.activa
      );
      allReservations.push(...userReservations);
    });

    return allReservations;
  }

  /**
   * Obtiene la posición de un usuario en la cola de espera de un libro
   */
  public getPositionInQueue(bookId: string, userId: string): number {
    const queue = this.getOrCreateQueue(bookId);
    return queue.getPosition(res => res.usuarioId === userId && res.activa);
  }

  /**
   * Verifica si un libro tiene reservas pendientes
   */
  public hasReservations(bookId: string): boolean {
    const queue = this.getOrCreateQueue(bookId);
    return !queue.isEmpty();
  }

  /**
   * Obtiene el número de reservas para un libro
   */
  public getReservationCount(bookId: string): number {
    const queue = this.getOrCreateQueue(bookId);
    return queue.size();
  }

  /**
   * Cancela todas las reservas de un usuario
   */
  public cancelAllUserReservations(userId: string): number {
    let cancelledCount = 0;

    this.reservationQueues.forEach((queue) => {
      const removed = queue.remove(
        res => res.usuarioId === userId && res.activa
      );
      if (removed) {
        removed.activa = false;
        cancelledCount++;
      }
    });

    return cancelledCount;
  }

  /**
   * Obtiene estadísticas de reservas
   */
  public getStats() {
    let totalReservations = 0;
    const reservationsByBook: Record<string, number> = {};

    this.reservationQueues.forEach((queue, bookId) => {
      const count = queue.size();
      totalReservations += count;
      if (count > 0) {
        reservationsByBook[bookId] = count;
      }
    });

    return {
      total: totalReservations,
      librosConReservas: Object.keys(reservationsByBook).length,
      porLibro: reservationsByBook,
    };
  }

  /**
   * Limpia todas las reservas
   */
  public clear(): void {
    this.reservationQueues.clear();
  }
}
