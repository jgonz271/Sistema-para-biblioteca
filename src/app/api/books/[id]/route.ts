/**
 * GET /api/books/[id] - Obtener un libro por ID
 * PUT /api/books/[id] - Actualizar un libro
 * DELETE /api/books/[id] - Eliminar un libro
 */

import { NextRequest, NextResponse } from 'next/server';
import { BookService, HistoryService } from '@/services';

const bookService = BookService.getInstance();
const historyService = HistoryService.getInstance();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const book = bookService.findBookById(id);

    if (!book) {
      return NextResponse.json(
        { success: false, error: 'Libro no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: book,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener libro',
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

    const updatedBook = bookService.updateBook(id, body);

    if (!updatedBook) {
      return NextResponse.json(
        { success: false, error: 'Libro no encontrado' },
        { status: 404 }
      );
    }

    historyService.logEditBook(id, updatedBook.titulo);

    return NextResponse.json({
      success: true,
      data: updatedBook,
      message: 'Libro actualizado exitosamente',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al actualizar libro',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const book = bookService.findBookById(id);

    if (!book) {
      return NextResponse.json(
        { success: false, error: 'Libro no encontrado' },
        { status: 404 }
      );
    }

    const deleted = bookService.deleteBook(id);

    if (deleted) {
      historyService.logDeleteBook(id, book.titulo);
    }

    return NextResponse.json({
      success: true,
      message: 'Libro eliminado exitosamente',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al eliminar libro',
      },
      { status: 500 }
    );
  }
}
