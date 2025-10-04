/**
 * GET /api/reservations - Obtener reservas
 * POST /api/reservations - Crear una nueva reserva
 */

import { NextRequest, NextResponse } from 'next/server';
import { ReservationService, BookService, UserService, HistoryService } from '@/services';

const reservationService = ReservationService.getInstance();
const bookService = BookService.getInstance();
const userService = UserService.getInstance();
const historyService = HistoryService.getInstance();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const bookId = searchParams.get('bookId');

    let reservations;

    if (userId) {
      reservations = reservationService.getUserReservations(userId);
    } else if (bookId) {
      reservations = reservationService.getBookReservations(bookId);
    } else {
      return NextResponse.json(
        { success: false, error: 'Se requiere userId o bookId' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: reservations,
      count: reservations.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener reservas',
      },
      { status: 500 }
    );
  }
}

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

    // Verificar que el libro y usuario existen
    const book = bookService.findBookById(bookId);
    const user = userService.findUserById(userId);

    if (!book) {
      return NextResponse.json(
        { success: false, error: 'Libro no encontrado' },
        { status: 404 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    const newReservation = reservationService.addReservation(bookId, userId);

    const position = reservationService.getPositionInQueue(bookId, userId);

    historyService.logReservation(
      userId,
      bookId,
      `${user.nombre} ${user.apellido}`,
      book.titulo
    );

    return NextResponse.json(
      {
        success: true,
        data: newReservation,
        position: position + 1,
        message: `Reserva creada. Posición en la cola: ${position + 1}`,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al crear reserva',
      },
      { status: 400 }
    );
  }
}
