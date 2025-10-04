/**
 * Servicio de gestión de Libros
 * Utiliza LinkedList para almacenar y gestionar el catálogo de libros
 */

import { LinkedList } from '@/lib/data-structures';
import type { Book, CreateBookDTO, BookCategory } from '@/types';

export class BookService {
  private books: LinkedList<Book>;
  private static instance: BookService;

  private constructor() {
    this.books = new LinkedList<Book>();
    this.initializeSampleData();
  }

  /**
   * Patrón Singleton
   */
  public static getInstance(): BookService {
    if (!BookService.instance) {
      BookService.instance = new BookService();
    }
    return BookService.instance;
  }

  /**
   * Datos de ejemplo
   */
  private initializeSampleData(): void {
    const sampleBooks: CreateBookDTO[] = [
      {
        titulo: 'Cien Años de Soledad',
        autor: 'Gabriel García Márquez',
        isbn: '978-0307474728',
        categoria: 'Ficción',
        anioPublicacion: 1967,
        editorial: 'Editorial Sudamericana',
        numeroPaginas: 417,
        copias: 3,
        descripcion: 'Una obra maestra del realismo mágico',
      },
      {
        titulo: 'El Principito',
        autor: 'Antoine de Saint-Exupéry',
        isbn: '978-0156012195',
        categoria: 'Ficción',
        anioPublicacion: 1943,
        editorial: 'Reynal & Hitchcock',
        numeroPaginas: 96,
        copias: 5,
        descripcion: 'Una historia sobre la amistad y el amor',
      },
      {
        titulo: 'Breve Historia del Tiempo',
        autor: 'Stephen Hawking',
        isbn: '978-0553380163',
        categoria: 'Ciencia',
        anioPublicacion: 1988,
        editorial: 'Bantam Books',
        numeroPaginas: 256,
        copias: 2,
        descripcion: 'Una exploración del universo y el tiempo',
      },
    ];

    sampleBooks.forEach(book => this.addBook(book));
  }

  /**
   * Genera un ID único
   */
  private generateId(): string {
    return `BK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Agrega un nuevo libro al catálogo
   */
  public addBook(data: CreateBookDTO): Book {
    const newBook: Book = {
      id: this.generateId(),
      ...data,
      estado: 'disponible',
      copiasDisponibles: data.copias,
      fechaRegistro: new Date(),
    };

    this.books.append(newBook);
    return newBook;
  }

  /**
   * Obtiene todos los libros
   */
  public getAllBooks(): Book[] {
    return this.books.toArray();
  }

  /**
   * Busca un libro por ID
   */
  public findBookById(id: string): Book | null {
    return this.books.find(book => book.id === id);
  }

  /**
   * Busca libros por título (búsqueda parcial)
   */
  public searchByTitle(query: string): Book[] {
    const lowerQuery = query.toLowerCase();
    return this.books.filter(book => 
      book.titulo.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Busca libros por autor (búsqueda parcial)
   */
  public searchByAuthor(query: string): Book[] {
    const lowerQuery = query.toLowerCase();
    return this.books.filter(book => 
      book.autor.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Busca libros por ISBN
   */
  public searchByISBN(isbn: string): Book | null {
    return this.books.find(book => book.isbn === isbn);
  }

  /**
   * Filtra libros por categoría
   */
  public filterByCategory(category: BookCategory): Book[] {
    return this.books.filter(book => book.categoria === category);
  }

  /**
   * Filtra libros disponibles
   */
  public getAvailableBooks(): Book[] {
    return this.books.filter(book => 
      book.copiasDisponibles > 0 && book.estado !== 'mantenimiento'
    );
  }

  /**
   * Actualiza un libro
   */
  public updateBook(id: string, updates: Partial<Book>): Book | null {
    const book = this.findBookById(id);
    if (!book) return null;

    Object.assign(book, updates);
    return book;
  }

  /**
   * Elimina un libro por ID
   */
  public deleteBook(id: string): boolean {
    const removed = this.books.removeBy(book => book.id === id);
    return removed !== null;
  }

  /**
   * Decrementa copias disponibles (al realizar préstamo)
   */
  public decreaseAvailableCopies(bookId: string): boolean {
    const book = this.findBookById(bookId);
    if (!book || book.copiasDisponibles <= 0) return false;

    book.copiasDisponibles--;
    if (book.copiasDisponibles === 0) {
      book.estado = 'prestado';
    }
    return true;
  }

  /**
   * Incrementa copias disponibles (al devolver libro)
   */
  public increaseAvailableCopies(bookId: string): boolean {
    const book = this.findBookById(bookId);
    if (!book) return false;

    book.copiasDisponibles++;
    if (book.copiasDisponibles > 0) {
      book.estado = 'disponible';
    }
    return true;
  }

  /**
   * Obtiene estadísticas de libros
   */
  public getStats() {
    const allBooks = this.getAllBooks();
    return {
      total: allBooks.length,
      disponibles: allBooks.filter(b => b.copiasDisponibles > 0).length,
      prestados: allBooks.filter(b => b.estado === 'prestado').length,
      porCategoria: this.getBooksByCategory(),
    };
  }

  /**
   * Agrupa libros por categoría
   */
  private getBooksByCategory() {
    const allBooks = this.getAllBooks();
    const grouped: Record<string, number> = {};

    allBooks.forEach(book => {
      grouped[book.categoria] = (grouped[book.categoria] || 0) + 1;
    });

    return grouped;
  }

  /**
   * Limpia todos los libros (útil para testing)
   */
  public clear(): void {
    this.books.clear();
  }
}
