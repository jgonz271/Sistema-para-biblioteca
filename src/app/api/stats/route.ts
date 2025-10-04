/**
 * API Route para Estadísticas del Sistema
 * GET /api/stats - Obtener estadísticas generales
 */

import { NextResponse } from 'next/server';
import { BookService, UserService, LoanService, ReservationService, HistoryService } from '@/services';

const bookService = BookService.getInstance();
const userService = UserService.getInstance();
const loanService = LoanService.getInstance();
const reservationService = ReservationService.getInstance();
const historyService = HistoryService.getInstance();

export async function GET() {
  try {
    const bookStats = bookService.getStats();
    const userStats = userService.getStats();
    const loanStats = loanService.getStats();
    const reservationStats = reservationService.getStats();
    const historyStats = historyService.getStats();

    return NextResponse.json({
      success: true,
      data: {
        libros: bookStats,
        usuarios: userStats,
        prestamos: loanStats,
        reservas: reservationStats,
        historial: historyStats,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener estadísticas',
      },
      { status: 500 }
    );
  }
}
