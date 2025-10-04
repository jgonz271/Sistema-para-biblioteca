/**
 * POST /api/reservations/cancel - Cancelar una reserva
 */

import { NextRequest, NextResponse } from 'next/server';
import { ReservationService } from '@/services';

const reservationService = ReservationService.getInstance();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookId, userId } = body;

    if (!bookId || !userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Faltan campos requeridos: bookId, userId',
        },
        { status: 400 }
      );
    }

    const cancelled = reservationService.cancelReservation(bookId, userId);

    if (!cancelled) {
      return NextResponse.json(
        { success: false, error: 'Reserva no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Reserva cancelada exitosamente',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al cancelar reserva',
      },
      { status: 500 }
    );
  }
}
