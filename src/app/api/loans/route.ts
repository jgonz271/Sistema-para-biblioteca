/**
 * GET /api/loans - Obtener todos los préstamos o filtrar
 * POST /api/loans - Crear un nuevo préstamo
 */

import { NextRequest, NextResponse } from 'next/server';
import { LoanService } from '@/services';
import type { CreateLoanDTO } from '@/types';

const loanService = LoanService.getInstance();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const bookId = searchParams.get('bookId');
    const status = searchParams.get('status');
    const overdue = searchParams.get('overdue');

    let loans;

    if (userId) {
      loans = status === 'active' 
        ? loanService.getUserActiveLoans(userId)
        : loanService.getUserLoans(userId);
    } else if (bookId) {
      loans = loanService.getBookLoans(bookId);
    } else if (overdue === 'true') {
      loans = loanService.getOverdueLoans();
    } else if (status === 'active') {
      loans = loanService.getActiveLoans();
    } else {
      loans = loanService.getAllLoans();
    }

    return NextResponse.json({
      success: true,
      data: loans,
      count: loans.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener préstamos',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateLoanDTO = await request.json();

    if (!body.libroId || !body.usuarioId || !body.diasPrestamo) {
      return NextResponse.json(
        {
          success: false,
          error: 'Faltan campos requeridos: libroId, usuarioId, diasPrestamo',
        },
        { status: 400 }
      );
    }

    const newLoan = loanService.createLoan(body);

    return NextResponse.json(
      {
        success: true,
        data: newLoan,
        message: 'Préstamo creado exitosamente',
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al crear préstamo',
      },
      { status: 400 }
    );
  }
}
