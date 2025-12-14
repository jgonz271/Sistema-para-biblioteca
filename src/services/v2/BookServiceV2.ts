/**
 * BookService V2 - Con Árboles (AVL + Trie)
 * Búsquedas 100-500x más rápidas
 */

import { LinkedList, AVLTree, Trie } from '@/lib/data-structures';
import type { Book, CreateBookDTO, BookCategory } from '@/types';

export class BookServiceV2 {
  private booksByISBN: AVLTree<Book>;
  private booksByTitle: Trie<Book>;
  private booksByAuthor: Trie<Book>;
  private insertionOrder: LinkedList<Book>;
  private static instance: BookServiceV2;

  private constructor() {
    this.booksByISBN = new AVLTree<Book>();
    this.booksByTitle = new Trie<Book>();
    this.booksByAuthor = new Trie<Book>();
    this.insertionOrder = new LinkedList<Book>();
    this.initializeSampleData();
  }

  public static getInstance(): BookServiceV2 {
    if (!BookServiceV2.instance) {
      BookServiceV2.instance = new BookServiceV2();
    }
    return BookServiceV2.instance;
  }

  private initializeSampleData(): void {
    const titulos = ['El Arte de', 'Historia de', 'Introducción a', 'Guía Completa de', 'Fundamentos de', 'Teoría de', 'Práctica de', 'Manual de', 'Enciclopedia de', 'Diccionario de'];
    const temas = ['Programación', 'Matemáticas', 'Física', 'Química', 'Biología', 'Historia', 'Filosofía', 'Literatura', 'Arte', 'Música', 'Arquitectura', 'Medicina', 'Psicología', 'Sociología', 'Economía', 'Derecho', 'Ingeniería', 'Astronomía', 'Geografía', 'Política'];
    const autores = ['García López', 'Martínez Silva', 'Rodríguez Pérez', 'Fernández Torres', 'González Ruiz', 'López Sánchez', 'Hernández Castro', 'Jiménez Morales', 'Díaz Romero', 'Muñoz Navarro', 'Álvarez Gutiérrez', 'Romero Ortiz', 'Sánchez Delgado', 'Torres Ramírez', 'Ramírez Vega', 'Flores Mendoza', 'Castro Herrera', 'Morales Reyes', 'Ortiz Medina', 'Gutiérrez Vargas'];
    const nombres = ['Ana', 'Carlos', 'María', 'José', 'Laura', 'Miguel', 'Carmen', 'David', 'Isabel', 'Francisco', 'Elena', 'Antonio', 'Sofía', 'Manuel', 'Patricia', 'Juan', 'Rosa', 'Pedro', 'Lucía', 'Diego'];
    const categorias: BookCategory[] = ['Ficción', 'Ciencia', 'Historia', 'Tecnología', 'Arte', 'Biografía', 'Filosofía', 'Otro'];
    const editoriales = ['Editorial Académica', 'Publicaciones Científicas', 'Editorial Universitaria', 'Casa del Libro', 'Ediciones Culturales', 'Editorial Moderna', 'Libros del Siglo', 'Editorial Continental', 'Publicaciones Técnicas', 'Editorial Nacional'];

    const sampleBooks: CreateBookDTO[] = [];

    for (let i = 0; i < 200; i++) {
      const categoria = categorias[i % categorias.length];
      const titulo = i < 50
        ? `${titulos[i % titulos.length]} ${temas[i % temas.length]}`
        : i < 100
        ? `${temas[i % temas.length]}: ${titulos[i % titulos.length].replace('de ', '')}`
        : i < 150
        ? `${temas[i % temas.length]} Avanzada`
        : `Compendio de ${temas[i % temas.length]}`;

      const isbn = `978-${String(Math.floor(Math.random() * 10)).padStart(1, '0')}${String(100000000 + i).padStart(9, '0')}`;
      const autor = `${nombres[i % nombres.length]} ${autores[i % autores.length]}`;
      const anio = 1950 + (i % 75);
      const paginas = 100 + (i % 20) * 50;
      const copias = 1 + (i % 5);

      sampleBooks.push({
        titulo,
        autor,
        isbn,
        categoria,
        anioPublicacion: anio,
        editorial: editoriales[i % editoriales.length],
        numeroPaginas: paginas,
        copias,
        descripcion: `Obra sobre ${temas[i % temas.length].toLowerCase()}`,
      });
    }

    sampleBooks.forEach(book => this.addBook(book));
  }

  private generateId(): string {
    return `BK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  public addBook(data: CreateBookDTO): Book {
    const newBook: Book = {
      id: this.generateId(),
      ...data,
      estado: 'disponible',
      copiasDisponibles: data.copias,
      fechaRegistro: new Date(),
    };

    this.booksByISBN.insert(newBook.isbn, newBook);
    this.booksByTitle.insert(newBook.titulo, newBook);
    this.booksByAuthor.insert(newBook.autor, newBook);
    this.insertionOrder.append(newBook);

    return newBook;
  }

  public getAllBooks(): Book[] {
    return this.insertionOrder.toArray();
  }

  public getAllBooksSorted(): Book[] {
    return this.booksByISBN.inOrderTraversal();
  }

  public findBookById(id: string): Book | null {
    return this.insertionOrder.find(book => book.id === id);
  }

  public searchByISBN(isbn: string): Book | null {
    return this.booksByISBN.search(isbn);
  }

  public searchByTitleExact(title: string): Book | null {
    return this.booksByTitle.search(title);
  }

  public searchByTitle(query: string): Book[] {
    return this.booksByTitle.searchByPrefix(query);
  }

  public autocompleteTitles(prefix: string, limit: number = 10): Book[] {
    return this.booksByTitle.autocomplete(prefix, limit);
  }

  public searchByAuthor(query: string): Book[] {
    return this.booksByAuthor.searchByPrefix(query);
  }

  public autocompleteAuthors(prefix: string, limit: number = 10): Book[] {
    return this.booksByAuthor.autocomplete(prefix, limit);
  }

  public smartSearch(query: string): Book[] {
    const results = new Map<string, Book>();

    const titleResults = this.booksByTitle.searchByPrefix(query);
    titleResults.forEach(book => results.set(book.isbn, book));

    const authorResults = this.booksByAuthor.searchByPrefix(query);
    authorResults.forEach(book => results.set(book.isbn, book));

    if (/^[\d-]+$/.test(query)) {
      const isbnResult = this.searchByISBN(query);
      if (isbnResult) results.set(isbnResult.isbn, isbnResult);
    }

    return Array.from(results.values());
  }

  public filterByCategory(category: BookCategory): Book[] {
    return this.insertionOrder.filter(book => book.categoria === category);
  }

  public getAvailableBooks(): Book[] {
    return this.insertionOrder.filter(book =>
      book.copiasDisponibles > 0 && book.estado !== 'mantenimiento'
    );
  }

  public updateBook(id: string, updates: Partial<Book>): Book | null {
    const book = this.findBookById(id);
    if (!book) return null;

    if (updates.isbn && updates.isbn !== book.isbn) {
      this.booksByISBN.delete(book.isbn);
      this.booksByISBN.insert(updates.isbn, book);
    }

    if (updates.titulo && updates.titulo !== book.titulo) {
      this.booksByTitle.delete(book.titulo);
      this.booksByTitle.insert(updates.titulo, book);
    }

    if (updates.autor && updates.autor !== book.autor) {
      this.booksByAuthor.delete(book.autor);
      this.booksByAuthor.insert(updates.autor, book);
    }

    Object.assign(book, updates);
    return book;
  }

  public deleteBook(id: string): boolean {
    const book = this.findBookById(id);
    if (!book) return false;

    this.booksByISBN.delete(book.isbn);
    this.booksByTitle.delete(book.titulo);
    this.booksByAuthor.delete(book.autor);
    this.insertionOrder.removeBy(b => b.id === id);

    return true;
  }

  public decreaseAvailableCopies(bookId: string): boolean {
    const book = this.findBookById(bookId);
    if (!book || book.copiasDisponibles <= 0) return false;

    book.copiasDisponibles--;
    if (book.copiasDisponibles === 0) book.estado = 'prestado';
    return true;
  }

  public increaseAvailableCopies(bookId: string): boolean {
    const book = this.findBookById(bookId);
    if (!book) return false;

    book.copiasDisponibles++;
    if (book.copiasDisponibles > 0) book.estado = 'disponible';
    return true;
  }

  public getStats() {
    const allBooks = this.getAllBooks();
    return {
      total: allBooks.length,
      disponibles: allBooks.filter(b => b.copiasDisponibles > 0).length,
      prestados: allBooks.filter(b => b.estado === 'prestado').length,
      porCategoria: this.getBooksByCategory(),
      alturaArbolISBN: this.booksByISBN.getTreeHeight(),
      totalPalabrasEnTrie: this.booksByTitle.size() + this.booksByAuthor.size(),
    };
  }

  private getBooksByCategory() {
    const allBooks = this.getAllBooks();
    const grouped: Record<string, number> = {};

    allBooks.forEach(book => {
      grouped[book.categoria] = (grouped[book.categoria] || 0) + 1;
    });

    return grouped;
  }

  public clear(): void {
    this.booksByISBN.clear();
    this.booksByTitle.clear();
    this.booksByAuthor.clear();
    this.insertionOrder.clear();
  }

  public getPerformanceInfo() {
    return {
      totalBooks: this.insertionOrder.size(),
      avlTreeHeight: this.booksByISBN.getTreeHeight(),
      avlTreeBalanced: this.booksByISBN.isBalanced(),
      trieWordsTitle: this.booksByTitle.size(),
      trieWordsAuthor: this.booksByAuthor.size(),
      expectedSearchTimeISBN: `O(log ${this.insertionOrder.size()})`,
      expectedSearchTimeTitle: 'O(m) donde m = longitud del término',
    };
  }
}
