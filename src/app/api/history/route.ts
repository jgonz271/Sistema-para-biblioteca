/**
 * GET /api/history - Obtener historial de operaciones
 */

import { NextRequest, NextResponse } from 'next/server';
import { HistoryService } from '@/services';
import type { OperationType } from '@/types';

const historyService = HistoryService.getInstance();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    const type = searchParams.get('type');
    const userId = searchParams.get('userId');
    const bookId = searchParams.get('bookId');

    let operations;

    if (userId) {
      operations = historyService.getUserOperations(userId);
    } else if (bookId) {
      operations = historyService.getBookOperations(bookId);
    } else if (type) {
      operations = historyService.getOperationsByType(type as OperationType);
    } else if (limit) {
      operations = historyService.getRecentOperations(parseInt(limit));
    } else {
      operations = historyService.getRecentOperations(20);
    }

    return NextResponse.json({
      success: true,
      data: operations,
      count: operations.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener historial',
      },
      { status: 500 }
    );
  }
}
