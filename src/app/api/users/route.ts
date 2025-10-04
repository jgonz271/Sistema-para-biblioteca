/**
 * GET /api/users - Obtener todos los usuarios o buscar
 * POST /api/users - Crear un nuevo usuario
 */

import { NextRequest, NextResponse } from 'next/server';
import { UserService, HistoryService } from '@/services';
import type { CreateUserDTO } from '@/types';

const userService = UserService.getInstance();
const historyService = HistoryService.getInstance();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const active = searchParams.get('active');

    let users;

    if (search) {
      users = userService.searchByName(search);
    } else if (active === 'true') {
      users = userService.getActiveUsers();
    } else {
      users = userService.getAllUsers();
    }

    return NextResponse.json({
      success: true,
      data: users,
      count: users.length,
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
