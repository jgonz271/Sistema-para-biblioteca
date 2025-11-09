/**
 * Books API V2 - Con Árboles
 * ?search - Búsqueda multi-criterio
 * ?isbn - Búsqueda por ISBN O(log n)
 * ?titlePrefix - Búsqueda por prefijo
 * ?autocomplete - Autocompletado
 * ?sorted - Ordenados por ISBN
 */

import { NextRequest, NextResponse } from 'next/server';
import { BookServiceV2 } from '@/services';
import type { CreateBookDTO, BookCategory } from '@/types';

const bookService = BookServiceV2.getInstance();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const isbn = searchParams.get('isbn');
    const titlePrefix = searchParams.get('titlePrefix');
    const autocomplete = searchParams.get('autocomplete');
    const category = searchParams.get('category');
    const available = searchParams.get('available');
    const sorted = searchParams.get('sorted');

    let books;

    if (isbn) {
      const book = bookService.searchByISBN(isbn);
      books = book ? [book] : [];
    }
    else if (autocomplete) {
      const limit = parseInt(searchParams.get('limit') || '10');
      books = bookService.autocompleteTitles(autocomplete, limit);
    }
    else if (titlePrefix) {
      books = bookService.searchByTitle(titlePrefix);
    }
    else if (search) {
      books = bookService.smartSearch(search);
    }
    else if (category) {
      books = bookService.filterByCategory(category as BookCategory);
    }
    else if (available === 'true') {
      books = bookService.getAvailableBooks();
    }
    else {
      books = sorted === 'true'
        ? bookService.getAllBooksSorted()
        : bookService.getAllBooks();
    }

    return NextResponse.json({
      success: true,
      data: books,
      count: books.length,
      performance: searchParams.get('debug') === 'true'
        ? bookService.getPerformanceInfo()
        : undefined,
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
