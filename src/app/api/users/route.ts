/**
 * Users API V2 - Con Árboles
 * ?email - Búsqueda por email O(log n)
 * ?namePrefix - Búsqueda por prefijo
 * ?autocomplete - Autocompletado
 * ?sorted - Ordenados por email
 */

import { NextRequest, NextResponse } from 'next/server';
import { UserServiceV2, HistoryService } from '@/services';
import type { CreateUserDTO } from '@/types';

const userService = UserServiceV2.getInstance();
const historyService = HistoryService.getInstance();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const email = searchParams.get('email');
    const namePrefix = searchParams.get('namePrefix');
    const autocomplete = searchParams.get('autocomplete');
    const active = searchParams.get('active');
    const sorted = searchParams.get('sorted');

    let users;

    if (email) {
      const user = userService.findByEmail(email);
      users = user ? [user] : [];
    }
    else if (autocomplete) {
      const limit = parseInt(searchParams.get('limit') || '10');
      users = userService.autocompleteNames(autocomplete, limit);
    }
    else if (namePrefix) {
      users = userService.searchByName(namePrefix);
    }
    else if (search) {
      users = userService.searchByName(search);
    }
    else if (active === 'true') {
      users = userService.getActiveUsers();
    }
    else {
      users = sorted === 'true'
        ? userService.getAllUsersSorted()
        : userService.getAllUsers();
    }

    return NextResponse.json({
      success: true,
      data: users,
      count: users.length,
      performance: searchParams.get('debug') === 'true'
        ? userService.getPerformanceInfo()
        : undefined,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener usuarios',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateUserDTO = await request.json();

    if (!body.nombre || !body.apellido || !body.email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Faltan campos requeridos: nombre, apellido, email',
        },
        { status: 400 }
      );
    }

    const newUser = userService.addUser(body);

    historyService.logAddUser(newUser.id, `${newUser.nombre} ${newUser.apellido}`);

    return NextResponse.json(
      {
        success: true,
        data: newUser,
        message: 'Usuario creado exitosamente',
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al crear usuario',
      },
      { status: 400 }
    );
  }
}
