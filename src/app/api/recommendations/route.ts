/**
 * API de Recomendaciones V3
 * Endpoints para sistema de recomendaciones basado en grafos
 */

import { NextRequest, NextResponse } from 'next/server';
import { RecommendationService } from '@/services';

const recommendationService = RecommendationService.getInstance();

/**
 * GET /api/recommendations
 * Obtiene recomendaciones y análisis del sistema de grafos
 * 
 * Query params:
 * - userId: ID del usuario para recomendaciones personalizadas
 * - type: 'books' | 'similar-users' | 'popular' | 'active-users' | 'communities' | 'stats'
 * - bookId: ID del libro para libros relacionados/similares
 * - limit: Número máximo de resultados
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const bookId = searchParams.get('bookId');
    const type = searchParams.get('type') ?? 'books';
    const limit = parseInt(searchParams.get('limit') ?? '10');

    switch (type) {
      case 'books': {
        if (!userId) {
          return NextResponse.json(
            { error: 'Se requiere userId para recomendaciones de libros' },
            { status: 400 }
          );
        }
        const recommendations = recommendationService.getRecommendationsForUser(userId, limit);
        return NextResponse.json({
          success: true,
          data: recommendations,
          meta: { userId, count: recommendations.length }
        });
      }

      case 'related': {
        if (!bookId) {
          return NextResponse.json(
            { error: 'Se requiere bookId para libros relacionados' },
            { status: 400 }
          );
        }
        const related = recommendationService.getRelatedBooks(bookId, limit);
        return NextResponse.json({
          success: true,
          data: related,
          meta: { bookId, count: related.length }
        });
      }

      case 'similar-books': {
        if (!bookId) {
          return NextResponse.json(
            { error: 'Se requiere bookId para libros similares' },
            { status: 400 }
          );
        }
        const similar = recommendationService.getSimilarBooks(bookId, limit);
        return NextResponse.json({
          success: true,
          data: similar,
          meta: { bookId, count: similar.length }
        });
      }

      case 'similar-users': {
        if (!userId) {
          return NextResponse.json(
            { error: 'Se requiere userId para usuarios similares' },
            { status: 400 }
          );
        }
        const similarUsers = recommendationService.getSimilarUsers(userId, limit);
        return NextResponse.json({
          success: true,
          data: similarUsers,
          meta: { userId, count: similarUsers.length }
        });
      }

      case 'popular': {
        const popular = recommendationService.getMostPopularBooks(limit);
        return NextResponse.json({
          success: true,
          data: popular,
          meta: { count: popular.length }
        });
      }

      case 'active-users': {
        const activeUsers = recommendationService.getMostActiveUsers(limit);
        return NextResponse.json({
          success: true,
          data: activeUsers,
          meta: { count: activeUsers.length }
        });
      }

      case 'communities': {
        const communities = recommendationService.getReaderCommunities();
        return NextResponse.json({
          success: true,
          data: communities,
          meta: { count: communities.length }
        });
      }

      case 'dashboard': {
        const dashboard = recommendationService.getDashboardRecommendations(userId ?? undefined);
        return NextResponse.json({
          success: true,
          data: dashboard
        });
      }

      case 'stats': {
        const stats = recommendationService.getStats();
        return NextResponse.json({
          success: true,
          data: stats
        });
      }

      default:
        return NextResponse.json(
          { error: `Tipo de recomendación no válido: ${type}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error en API de recomendaciones:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
