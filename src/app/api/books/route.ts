/**
 * API Route para gestión de Libros
 * GET /api/books - Obtener todos los libros o buscar
 * POST /api/books - Crear un nuevo libro
 */

import { NextRequest, NextResponse } from 'next/server';
import { BookService } from '@/services';
import type { CreateBookDTO, BookCategory } from '@/types';

const bookService = BookService.getInstance();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const available = searchParams.get('available');

    let books;

    if (search) {
      // Buscar por título o autor
      const byTitle = bookService.searchByTitle(search);
      const byAuthor = bookService.searchByAuthor(search);
      books = [...new Set([...byTitle, ...byAuthor])];
    } else if (category) {
      books = bookService.filterByCategory(category as BookCategory);
    } else if (available === 'true') {
      books = bookService.getAvailableBooks();
    } else {
      books = bookService.getAllBooks();
    }

    return NextResponse.json({
      success: true,
      data: books,
      count: books.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener libros',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateBookDTO = await request.json();

    // Validaciones básicas
    if (!body.titulo || !body.autor || !body.isbn) {
      return NextResponse.json(
        {
          success: false,
          error: 'Faltan campos requeridos: titulo, autor, isbn',
        },
        { status: 400 }
      );
    }

    const newBook = bookService.addBook(body);

    return NextResponse.json(
      {
        success: true,
        data: newBook,
        message: 'Libro creado exitosamente',
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al crear libro',
      },
      { status: 500 }
    );
  }
}
