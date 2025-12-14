/**
 * API de Grafos V3
 * Endpoints para análisis de grafos y caminos
 */

import { NextRequest, NextResponse } from 'next/server';
import { RecommendationService, GraphService } from '@/services';

const recommendationService = RecommendationService.getInstance();
const graphService = GraphService.getInstance();

/**
 * GET /api/graphs
 * Operaciones de análisis de grafos
 * 
 * Query params:
 * - action: 'path-books' | 'path-users' | 'stats' | 'user-books' | 'book-users'
 * - from: ID de origen
 * - to: ID de destino
 * - id: ID para consultas específicas
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') ?? 'stats';
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const id = searchParams.get('id');

    switch (action) {
      case 'path-books': {
        if (!from || !to) {
          return NextResponse.json(
            { error: 'Se requieren parámetros from y to' },
            { status: 400 }
          );
        }
        const path = recommendationService.findConnectionBetweenBooks(from, to);
        return NextResponse.json({
          success: true,
          data: path,
          meta: { from, to, found: path !== null }
        });
      }

      case 'path-users': {
        if (!from || !to) {
          return NextResponse.json(
            { error: 'Se requieren parámetros from y to' },
            { status: 400 }
          );
        }
        const path = recommendationService.findConnectionBetweenUsers(from, to);
        return NextResponse.json({
          success: true,
          data: path,
          meta: { from, to, found: path !== null }
        });
      }

      case 'user-books': {
        if (!id) {
          return NextResponse.json(
            { error: 'Se requiere parámetro id' },
            { status: 400 }
          );
        }
        const books = graphService.getUserBooks(id);
        return NextResponse.json({
          success: true,
          data: books,
          meta: { userId: id, count: books.length }
        });
      }

      case 'book-users': {
        if (!id) {
          return NextResponse.json(
            { error: 'Se requiere parámetro id' },
            { status: 400 }
          );
        }
        const users = graphService.getBookUsers(id);
        return NextResponse.json({
          success: true,
          data: users,
          meta: { bookId: id, count: users.length }
        });
      }

      case 'stats':
      default: {
        const stats = graphService.getStats();
        const performance = graphService.getPerformanceInfo();
        return NextResponse.json({
          success: true,
          data: { stats, performance }
        });
      }
    }
  } catch (error) {
    console.error('Error en API de grafos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/graphs
 * Operaciones de modificación de grafos
 * 
 * Body:
 * - action: 'rebuild' | 'record-loan'
 * - userId, bookId: Para record-loan
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, bookId } = body;

    switch (action) {
      case 'rebuild': {
        graphService.rebuildSimilarityGraphs();
        return NextResponse.json({
          success: true,
          message: 'Grafos de similitud reconstruidos',
          data: graphService.getStats()
        });
      }

      case 'record-loan': {
        if (!userId || !bookId) {
          return NextResponse.json(
            { error: 'Se requieren userId y bookId' },
            { status: 400 }
          );
        }
        graphService.recordLoan(userId, bookId);
        return NextResponse.json({
          success: true,
          message: 'Préstamo registrado en el grafo'
        });
      }

      default:
        return NextResponse.json(
          { error: `Acción no válida: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error en API de grafos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
