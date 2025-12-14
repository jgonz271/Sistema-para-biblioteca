/**
 * RecommendationService V3 - Sistema de Recomendaciones basado en Grafos
 * Proporciona recomendaciones de libros y análisis de relaciones
 */

import { GraphService } from './GraphService';
import { BookServiceV2 } from '../v2/BookServiceV2';
import { UserServiceV2 } from '../v2/UserServiceV2';
import type { Book, User } from '@/types';

export interface BookRecommendation {
  book: Book;
  score: number;
  reason: string;
}

export interface RelatedBook {
  book: Book;
  count: number;
  percentage: number;
}

export interface SimilarUser {
  user: User;
  similarity: number;
  commonBooks: number;
}

export interface PathResult {
  path: Array<{ id: string; type: 'book' | 'user'; name: string }>;
  distance: number;
}

export class RecommendationService {
  private graphService: GraphService;
  private bookService: BookServiceV2;
  private userService: UserServiceV2;
  private static instance: RecommendationService;

  private constructor() {
    this.graphService = GraphService.getInstance();
    this.bookService = BookServiceV2.getInstance();
    this.userService = UserServiceV2.getInstance();
  }

  public static getInstance(): RecommendationService {
    if (!RecommendationService.instance) {
      RecommendationService.instance = new RecommendationService();
    }
    return RecommendationService.instance;
  }

  /**
   * Obtiene recomendaciones personalizadas para un usuario
   * Complejidad: O(k × m) donde k = usuarios similares, m = libros por usuario
   */
  public getRecommendationsForUser(
    userId: string,
    limit: number = 10
  ): BookRecommendation[] {
    const recommendations = this.graphService.getBookRecommendations(userId, limit);
    
    return recommendations
      .map(rec => {
        const book = this.bookService.findBookById(rec.bookId);
        if (!book) return null;
        
        return {
          book,
          score: rec.score,
          reason: rec.reason
        };
      })
      .filter((rec): rec is BookRecommendation => rec !== null);
  }

  /**
   * Obtiene libros relacionados ("otros también leyeron...")
   * Complejidad: O(u × b)
   */
  public getRelatedBooks(bookId: string, limit: number = 10): RelatedBook[] {
    const related = this.graphService.getRelatedBooks(bookId, limit);
    
    return related
      .map(rel => {
        const book = this.bookService.findBookById(rel.bookId);
        if (!book) return null;
        
        return {
          book,
          count: rel.count,
          percentage: Math.round(rel.percentage)
        };
      })
      .filter((rel): rel is RelatedBook => rel !== null);
  }

  /**
   * Obtiene libros similares basados en lectores comunes
   * Complejidad: O(k log k)
   */
  public getSimilarBooks(
    bookId: string,
    limit: number = 10
  ): Array<{ book: Book; similarity: number }> {
    const similar = this.graphService.getSimilarBooks(bookId, limit);
    
    return similar
      .map(sim => {
        const book = this.bookService.findBookById(sim.bookId);
        if (!book) return null;
        
        return {
          book,
          similarity: Math.round(sim.similarity * 100) / 100
        };
      })
      .filter((sim): sim is { book: Book; similarity: number } => sim !== null);
  }

  /**
   * Obtiene usuarios con gustos similares
   * Complejidad: O(k log k)
   */
  public getSimilarUsers(userId: string, limit: number = 10): SimilarUser[] {
    const similar = this.graphService.getSimilarUsers(userId, limit);
    const userBooks = new Set(this.graphService.getUserBooks(userId));
    
    return similar
      .map(sim => {
        const user = this.userService.findUserById(sim.userId);
        if (!user) return null;
        
        // Calcular libros en común
        const theirBooks = this.graphService.getUserBooks(sim.userId);
        const commonBooks = theirBooks.filter(b => userBooks.has(b)).length;
        
        return {
          user,
          similarity: Math.round(sim.similarity * 100) / 100,
          commonBooks
        };
      })
      .filter((sim): sim is SimilarUser => sim !== null);
  }

  /**
   * Encuentra la conexión entre dos libros
   * Complejidad: O((V + E) log V)
   */
  public findConnectionBetweenBooks(
    bookIdA: string,
    bookIdB: string
  ): PathResult | null {
    const result = this.graphService.findPathBetweenBooks(bookIdA, bookIdB);
    if (!result) return null;

    const path = result.path.map(bookId => {
      const book = this.bookService.findBookById(bookId);
      return {
        id: bookId,
        type: 'book' as const,
        name: book?.titulo ?? 'Libro desconocido'
      };
    });

    return {
      path,
      distance: Math.round(result.distance * 100) / 100
    };
  }

  /**
   * Encuentra la conexión entre dos usuarios
   * Complejidad: O((V + E) log V)
   */
  public findConnectionBetweenUsers(
    userIdA: string,
    userIdB: string
  ): PathResult | null {
    const result = this.graphService.findPathBetweenUsers(userIdA, userIdB);
    if (!result) return null;

    const path = result.path.map(userId => {
      const user = this.userService.findUserById(userId);
      return {
        id: userId,
        type: 'user' as const,
        name: user ? `${user.nombre} ${user.apellido}` : 'Usuario desconocido'
      };
    });

    return {
      path,
      distance: Math.round(result.distance * 100) / 100
    };
  }

  /**
   * Obtiene los libros más populares con información completa
   * Complejidad: O(L log L)
   */
  public getMostPopularBooks(limit: number = 10): Array<{ book: Book; readers: number }> {
    const popular = this.graphService.getMostPopularBooks(limit);
    
    return popular
      .map(p => {
        const book = this.bookService.findBookById(p.bookId);
        if (!book) return null;
        return { book, readers: p.readers };
      })
      .filter((p): p is { book: Book; readers: number } => p !== null);
  }

  /**
   * Obtiene los usuarios más activos con información completa
   * Complejidad: O(U log U)
   */
  public getMostActiveUsers(limit: number = 10): Array<{ user: User; booksRead: number }> {
    const active = this.graphService.getMostActiveUsers(limit);
    
    return active
      .map(a => {
        const user = this.userService.findUserById(a.userId);
        if (!user) return null;
        return { user, booksRead: a.booksRead };
      })
      .filter((a): a is { user: User; booksRead: number } => a !== null);
  }

  /**
   * Obtiene comunidades de lectores
   * Complejidad: O(V + E)
   */
  public getReaderCommunities(): Array<{
    users: User[];
    commonBooks: Book[];
    size: number;
  }> {
    const communities = this.graphService.findReaderCommunities();
    
    return communities
      .filter(c => c.users.length > 1)
      .map(community => {
        const users = community.users
          .map(userId => this.userService.findUserById(userId))
          .filter((u): u is User => u !== null);
        
        const commonBooks = community.commonBooks
          .map(bookId => this.bookService.findBookById(bookId))
          .filter((b): b is Book => b !== null);
        
        return {
          users,
          commonBooks,
          size: users.length
        };
      })
      .sort((a, b) => b.size - a.size);
  }

  /**
   * Genera un resumen de recomendaciones para la página principal
   */
  public getDashboardRecommendations(userId?: string) {
    const popularBooks = this.getMostPopularBooks(5);
    const activeUsers = this.getMostActiveUsers(5);
    
    let personalRecommendations: BookRecommendation[] = [];
    let similarUsers: SimilarUser[] = [];
    
    if (userId) {
      personalRecommendations = this.getRecommendationsForUser(userId, 5);
      similarUsers = this.getSimilarUsers(userId, 3);
    }

    return {
      popularBooks,
      activeUsers,
      personalRecommendations,
      similarUsers,
      graphStats: this.graphService.getStats()
    };
  }

  /**
   * Obtiene estadísticas del sistema de recomendaciones
   */
  public getStats() {
    return {
      ...this.graphService.getStats(),
      performance: this.graphService.getPerformanceInfo()
    };
  }
}
