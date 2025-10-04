/**
 * GET /api/loans/[id] - Obtener un préstamo por ID
 * PUT /api/loans/[id] - Procesar devolución
 */

import { NextRequest, NextResponse } from 'next/server';
import { LoanService } from '@/services';

const loanService = LoanService.getInstance();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const loan = loanService.findLoanById(id);

    if (!loan) {
      return NextResponse.json(
        { success: false, error: 'Préstamo no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: loan,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener préstamo',
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (body.action === 'return') {
      const returnedLoan = loanService.returnBook(id);

      return NextResponse.json({
        success: true,
        data: returnedLoan,
        message: returnedLoan.multa > 0 
          ? `Libro devuelto con multa de $${returnedLoan.multa}`
          : 'Libro devuelto exitosamente',
      });
    }

    return NextResponse.json(
      { success: false, error: 'Acción no válida' },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al procesar devolución',
      },
      { status: 400 }
    );
  }
}
