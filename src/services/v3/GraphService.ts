/**
 * GraphService V3 - Gestión de Grafos del Sistema Bibliotecario
 * Maneja tres grafos: Usuario-Libro, Libro-Libro, Usuario-Usuario
 */

import { Graph, jaccardIndex } from '@/lib/data-structures';

// Tipos de nodos en el sistema
type NodeType = 'user' | 'book';

interface NodeData {
  type: NodeType;
  entityId: string;
}

export class GraphService {
  // Grafo bipartito Usuario-Libro (dirigido, ponderado)
  private userBookGraph: Graph<NodeData>;
  
  // Grafo de similitud Libro-Libro (no dirigido, ponderado)
  private bookSimilarityGraph: Graph<NodeData>;
  
  // Grafo de similitud Usuario-Usuario (no dirigido, ponderado)
  private userSimilarityGraph: Graph<NodeData>;

  // Mapas para acceso rápido a conjuntos
  private userBooks: Map<string, Set<string>>; // userId -> Set<bookId>
  private bookUsers: Map<string, Set<string>>; // bookId -> Set<userId>

  private static instance: GraphService;

  private constructor() {
    // Grafo dirigido: usuario -> libro (préstamo)
    this.userBookGraph = new Graph<NodeData>(true, true);
    
    // Grafos no dirigidos para similitudes
    this.bookSimilarityGraph = new Graph<NodeData>(false, true);
    this.userSimilarityGraph = new Graph<NodeData>(false, true);

    // Índices auxiliares
    this.userBooks = new Map();
    this.bookUsers = new Map();
  }

  public static getInstance(): GraphService {
    if (!GraphService.instance) {
      GraphService.instance = new GraphService();
    }
    return GraphService.instance;
  }

  /**
   * Registra un usuario en los grafos
   */
  public addUser(userId: string): void {
    const nodeData: NodeData = { type: 'user', entityId: userId };
    
    this.userBookGraph.addNode(userId, nodeData);
    this.userSimilarityGraph.addNode(userId, nodeData);
    
    if (!this.userBooks.has(userId)) {
      this.userBooks.set(userId, new Set());
    }
  }

  /**
   * Registra un libro en los grafos
   */
  public addBook(bookId: string): void {
    const nodeData: NodeData = { type: 'book', entityId: bookId };
    
    this.userBookGraph.addNode(bookId, nodeData);
    this.bookSimilarityGraph.addNode(bookId, nodeData);
    
    if (!this.bookUsers.has(bookId)) {
      this.bookUsers.set(bookId, new Set());
    }
  }

  /**
   * Registra un préstamo (arista usuario -> libro)
   * Complejidad: O(U + L) para actualizar similitudes
   */
  public recordLoan(userId: string, bookId: string): void {
    // Asegurar que los nodos existen
    this.addUser(userId);
    this.addBook(bookId);

    // Incrementar peso de la arista (número de préstamos)
    const currentWeight = this.userBookGraph.getEdgeWeight(userId, bookId) ?? 0;
    this.userBookGraph.addEdge(userId, bookId, currentWeight + 1);

    // Actualizar índices
    this.userBooks.get(userId)!.add(bookId);
    this.bookUsers.get(bookId)!.add(userId);

    // Actualizar similitudes (puede ser costoso, considerar hacerlo en batch)
    this.updateBookSimilarities(bookId);
    this.updateUserSimilarities(userId);
  }

  /**
   * Actualiza similitudes del libro con otros libros
   */
  private updateBookSimilarities(bookId: string): void {
    const usersOfBook = this.bookUsers.get(bookId);
    if (!usersOfBook || usersOfBook.size === 0) return;

    // Para cada otro libro, calcular similitud
    for (const [otherBookId, otherUsers] of this.bookUsers) {
      if (otherBookId === bookId) continue;
      if (otherUsers.size === 0) continue;

      const similarity = jaccardIndex(usersOfBook, otherUsers);
      
      if (similarity > 0) {
        this.bookSimilarityGraph.addEdge(bookId, otherBookId, similarity);
      }
    }
  }

  /**
   * Actualiza similitudes del usuario con otros usuarios
   */
  private updateUserSimilarities(userId: string): void {
    const booksOfUser = this.userBooks.get(userId);
    if (!booksOfUser || booksOfUser.size === 0) return;

    // Para cada otro usuario, calcular similitud
    for (const [otherUserId, otherBooks] of this.userBooks) {
      if (otherUserId === userId) continue;
      if (otherBooks.size === 0) continue;

      const similarity = jaccardIndex(booksOfUser, otherBooks);
      
      if (similarity > 0) {
        this.userSimilarityGraph.addEdge(userId, otherUserId, similarity);
      }
    }
  }

  /**
   * Obtiene libros que un usuario ha leído
   */
  public getUserBooks(userId: string): string[] {
    return Array.from(this.userBooks.get(userId) ?? []);
  }

  /**
   * Obtiene usuarios que han leído un libro
   */
  public getBookUsers(bookId: string): string[] {
    return Array.from(this.bookUsers.get(bookId) ?? []);
  }

  /**
   * Obtiene libros similares a uno dado
   * Complejidad: O(k log k) donde k = número de libros similares
   */
  public getSimilarBooks(bookId: string, limit: number = 10): Array<{ bookId: string; similarity: number }> {
    const neighbors = this.bookSimilarityGraph.getNeighbors(bookId);
    
    const similar: Array<{ bookId: string; similarity: number }> = [];
    neighbors.forEach((similarity, neighborId) => {
      similar.push({ bookId: neighborId, similarity });
    });

    return similar
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  /**
   * Obtiene usuarios similares a uno dado
   * Complejidad: O(k log k) donde k = número de usuarios similares
   */
  public getSimilarUsers(userId: string, limit: number = 10): Array<{ userId: string; similarity: number }> {
    const neighbors = this.userSimilarityGraph.getNeighbors(userId);
    
    const similar: Array<{ userId: string; similarity: number }> = [];
    neighbors.forEach((similarity, neighborId) => {
      similar.push({ userId: neighborId, similarity });
    });

    return similar
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  /**
   * Obtiene recomendaciones de libros para un usuario
   * Basado en: libros que usuarios similares han leído
   * Complejidad: O(k × m) donde k = usuarios similares, m = libros por usuario
   */
  public getBookRecommendations(
    userId: string, 
    limit: number = 10
  ): Array<{ bookId: string; score: number; reason: string }> {
    const userBooksSet = this.userBooks.get(userId);
    if (!userBooksSet) return [];

    // Obtener usuarios similares
    const similarUsers = this.getSimilarUsers(userId, 20);
    if (similarUsers.length === 0) return [];

    // Puntuar libros basado en usuarios similares
    const bookScores = new Map<string, { score: number; contributors: string[] }>();

    for (const { userId: similarUserId, similarity } of similarUsers) {
      const theirBooks = this.userBooks.get(similarUserId) ?? new Set();
      
      for (const bookId of theirBooks) {
        // Excluir libros que el usuario ya leyó
        if (userBooksSet.has(bookId)) continue;

        const current = bookScores.get(bookId) ?? { score: 0, contributors: [] };
        current.score += similarity;
        current.contributors.push(similarUserId);
        bookScores.set(bookId, current);
      }
    }

    // Convertir a array y ordenar
    const recommendations: Array<{ bookId: string; score: number; reason: string }> = [];
    
    bookScores.forEach(({ score, contributors }, bookId) => {
      recommendations.push({
        bookId,
        score,
        reason: `Recomendado por ${contributors.length} usuario(s) similar(es)`
      });
    });

    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Obtiene libros relacionados ("usuarios que leyeron esto también leyeron...")
   * Complejidad: O(u × b) donde u = usuarios del libro, b = libros por usuario
   */
  public getRelatedBooks(
    bookId: string, 
    limit: number = 10
  ): Array<{ bookId: string; count: number; percentage: number }> {
    const usersOfBook = this.bookUsers.get(bookId);
    if (!usersOfBook || usersOfBook.size === 0) return [];

    // Contar cuántos usuarios leyeron cada otro libro
    const bookCounts = new Map<string, number>();

    for (const userId of usersOfBook) {
      const theirBooks = this.userBooks.get(userId) ?? new Set();
      
      for (const otherBookId of theirBooks) {
        if (otherBookId === bookId) continue;
        bookCounts.set(otherBookId, (bookCounts.get(otherBookId) ?? 0) + 1);
      }
    }

    // Convertir a array con porcentajes
    const totalUsers = usersOfBook.size;
    const related: Array<{ bookId: string; count: number; percentage: number }> = [];

    bookCounts.forEach((count, relatedBookId) => {
      related.push({
        bookId: relatedBookId,
        count,
        percentage: (count / totalUsers) * 100
      });
    });

    return related
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Encuentra el camino más corto entre dos libros
   * Complejidad: O((V + E) log V)
   */
  public findPathBetweenBooks(
    bookIdA: string, 
    bookIdB: string
  ): { path: string[]; distance: number } | null {
    return this.bookSimilarityGraph.getShortestPath(bookIdA, bookIdB);
  }

  /**
   * Encuentra el camino más corto entre dos usuarios
   * Complejidad: O((V + E) log V)
   */
  public findPathBetweenUsers(
    userIdA: string, 
    userIdB: string
  ): { path: string[]; distance: number } | null {
    return this.userSimilarityGraph.getShortestPath(userIdA, userIdB);
  }

  /**
   * Obtiene los libros más populares (mayor grado en el grafo)
   * Complejidad: O(L log L)
   */
  public getMostPopularBooks(limit: number = 10): Array<{ bookId: string; readers: number }> {
    const popularity: Array<{ bookId: string; readers: number }> = [];

    this.bookUsers.forEach((users, bookId) => {
      popularity.push({ bookId, readers: users.size });
    });

    return popularity
      .sort((a, b) => b.readers - a.readers)
      .slice(0, limit);
  }

  /**
   * Obtiene los usuarios más activos (mayor grado en el grafo)
   * Complejidad: O(U log U)
   */
  public getMostActiveUsers(limit: number = 10): Array<{ userId: string; booksRead: number }> {
    const activity: Array<{ userId: string; booksRead: number }> = [];

    this.userBooks.forEach((books, userId) => {
      activity.push({ userId, booksRead: books.size });
    });

    return activity
      .sort((a, b) => b.booksRead - a.booksRead)
      .slice(0, limit);
  }

  /**
   * Detecta comunidades de lectores (componentes conectados)
   * Complejidad: O(V + E)
   */
  public findReaderCommunities(): Array<{ users: string[]; commonBooks: string[] }> {
    const components = this.userSimilarityGraph.findConnectedComponents();
    
    return components.map(component => {
      const users = Array.from(component);
      
      // Encontrar libros en común de la comunidad
      const bookCounts = new Map<string, number>();
      for (const userId of users) {
        const books = this.userBooks.get(userId) ?? new Set();
        for (const bookId of books) {
          bookCounts.set(bookId, (bookCounts.get(bookId) ?? 0) + 1);
        }
      }

      // Libros leídos por más de la mitad de la comunidad
      const threshold = Math.ceil(users.length / 2);
      const commonBooks = Array.from(bookCounts.entries())
        .filter(([, count]) => count >= threshold)
        .map(([bookId]) => bookId);

      return { users, commonBooks };
    });
  }

  /**
   * Obtiene estadísticas generales de los grafos
   */
  public getStats() {
    return {
      userBookGraph: {
        nodes: this.userBookGraph.getNodeCount(),
        edges: this.userBookGraph.getEdgeCount(),
        type: 'bipartito dirigido'
      },
      bookSimilarityGraph: {
        nodes: this.bookSimilarityGraph.getNodeCount(),
        edges: this.bookSimilarityGraph.getEdgeCount(),
        type: 'no dirigido'
      },
      userSimilarityGraph: {
        nodes: this.userSimilarityGraph.getNodeCount(),
        edges: this.userSimilarityGraph.getEdgeCount(),
        type: 'no dirigido'
      },
      totalUsers: this.userBooks.size,
      totalBooks: this.bookUsers.size,
      totalLoans: Array.from(this.userBooks.values())
        .reduce((sum, books) => sum + books.size, 0)
    };
  }

  /**
   * Obtiene información de rendimiento de los grafos
   */
  public getPerformanceInfo() {
    const stats = this.getStats();
    return {
      ...stats,
      memoryEstimate: `~${Math.round((stats.userBookGraph.edges + stats.bookSimilarityGraph.edges + stats.userSimilarityGraph.edges) * 0.1)}KB`,
      recommendationComplexity: 'O(k × m) donde k=usuarios similares, m=libros por usuario',
      similarityComplexity: 'O(1) lookup, O(n) actualización'
    };
  }

  /**
   * Reconstruye todos los grafos de similitud
   * Útil para inicialización o recálculo completo
   * Complejidad: O(L² + U²)
   */
  public rebuildSimilarityGraphs(): void {
    // Limpiar grafos de similitud
    this.bookSimilarityGraph.clear();
    this.userSimilarityGraph.clear();

    // Re-agregar nodos
    for (const bookId of this.bookUsers.keys()) {
      this.bookSimilarityGraph.addNode(bookId, { type: 'book', entityId: bookId });
    }
    for (const userId of this.userBooks.keys()) {
      this.userSimilarityGraph.addNode(userId, { type: 'user', entityId: userId });
    }

    // Calcular similitudes de libros
    const bookIds = Array.from(this.bookUsers.keys());
    for (let i = 0; i < bookIds.length; i++) {
      for (let j = i + 1; j < bookIds.length; j++) {
        const bookA = bookIds[i];
        const bookB = bookIds[j];
        const usersA = this.bookUsers.get(bookA)!;
        const usersB = this.bookUsers.get(bookB)!;
        
        const similarity = jaccardIndex(usersA, usersB);
        if (similarity > 0) {
          this.bookSimilarityGraph.addEdge(bookA, bookB, similarity);
        }
      }
    }

    // Calcular similitudes de usuarios
    const userIds = Array.from(this.userBooks.keys());
    for (let i = 0; i < userIds.length; i++) {
      for (let j = i + 1; j < userIds.length; j++) {
        const userA = userIds[i];
        const userB = userIds[j];
        const booksA = this.userBooks.get(userA)!;
        const booksB = this.userBooks.get(userB)!;
        
        const similarity = jaccardIndex(booksA, booksB);
        if (similarity > 0) {
          this.userSimilarityGraph.addEdge(userA, userB, similarity);
        }
      }
    }
  }

  /**
   * Limpia todos los grafos
   */
  public clear(): void {
    this.userBookGraph.clear();
    this.bookSimilarityGraph.clear();
    this.userSimilarityGraph.clear();
    this.userBooks.clear();
    this.bookUsers.clear();
  }
}
