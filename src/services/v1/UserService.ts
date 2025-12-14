/**
 * Servicio de gestión de Usuarios
 * Utiliza LinkedList para almacenar y gestionar usuarios
 */

import { LinkedList } from '@/lib/data-structures';
import type { User, CreateUserDTO } from '@/types';

export class UserService {
  private users: LinkedList<User>;
  private static instance: UserService;

  private constructor() {
    this.users = new LinkedList<User>();
    this.initializeSampleData();
  }

  /**
   * Patrón Singleton
   */
  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  /**
   * Inicializa datos de ejemplo
   */
  private initializeSampleData(): void {
    const sampleUsers: CreateUserDTO[] = [
      {
        nombre: 'Juan',
        apellido: 'David',
        email: 'juan.david@example.com',
        telefono: '555-1234',
        direccion: 'Calle 128, Ciudad',
      },
      {
        nombre: 'María',
        apellido: 'González',
        email: 'maria.gonzalez@example.com',
        telefono: '555-5678',
        direccion: 'Avenida 456, Ciudad',
      },
    ];

    sampleUsers.forEach(user => this.addUser(user));
  }

  /**
   * Genera un ID único
   */
  private generateId(): string {
    return `USR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Agrega un nuevo usuario
   */
  public addUser(data: CreateUserDTO): User {
    const existingUser = this.findByEmail(data.email);
    if (existingUser) {
      throw new Error('Ya existe un usuario con este email');
    }

    const newUser: User = {
      id: this.generateId(),
      ...data,
      fechaRegistro: new Date(),
      activo: true,
      prestamosActivos: 0,
      historialPrestamos: 0,
    };

    this.users.append(newUser);
    return newUser;
  }

  /**
   * Obtiene todos los usuarios
   */
  public getAllUsers(): User[] {
    return this.users.toArray();
  }

  /**
   * Busca un usuario por ID
   */
  public findUserById(id: string): User | null {
    return this.users.find(user => user.id === id);
  }

  /**
   * Busca un usuario por email
   */
  public findByEmail(email: string): User | null {
    return this.users.find(user => user.email.toLowerCase() === email.toLowerCase());
  }

  /**
   * Busca usuarios por nombre (búsqueda parcial)
   */
  public searchByName(query: string): User[] {
    const lowerQuery = query.toLowerCase();
    return this.users.filter(user => 
      user.nombre.toLowerCase().includes(lowerQuery) ||
      user.apellido.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Obtiene usuarios activos
   */
  public getActiveUsers(): User[] {
    return this.users.filter(user => user.activo);
  }

  /**
   * Obtiene usuarios con préstamos activos
   */
  public getUsersWithActiveLoans(): User[] {
    return this.users.filter(user => user.prestamosActivos > 0);
  }

  /**
   * Actualiza un usuario
   */
  public updateUser(id: string, updates: Partial<User>): User | null {
    const user = this.findUserById(id);
    if (!user) return null;

    // No permitir cambio de email si ya existe otro usuario con ese email
    if (updates.email && updates.email !== user.email) {
      const existingUser = this.findByEmail(updates.email);
      if (existingUser) {
        throw new Error('Ya existe un usuario con este email');
      }
    }

    Object.assign(user, updates);
    return user;
  }

  /**
   * Desactiva un usuario (no lo elimina)
   */
  public deactivateUser(id: string): boolean {
    const user = this.findUserById(id);
    if (!user) return false;

    user.activo = false;
    return true;
  }

  /**
   * Activa un usuario
   */
  public activateUser(id: string): boolean {
    const user = this.findUserById(id);
    if (!user) return false;

    user.activo = true;
    return true;
  }

  /**
   * Elimina un usuario permanentemente
   */
  public deleteUser(id: string): boolean {
    const user = this.findUserById(id);
    if (!user) return false;

    // No permitir eliminar usuarios con préstamos activos
    if (user.prestamosActivos > 0) {
      throw new Error('No se puede eliminar un usuario con préstamos activos');
    }

    const removed = this.users.removeBy(u => u.id === id);
    return removed !== null;
  }

  /**
   * Incrementa el contador de préstamos activos
   */
  public incrementActiveLoans(userId: string): boolean {
    const user = this.findUserById(userId);
    if (!user) return false;

    user.prestamosActivos++;
    user.historialPrestamos++;
    return true;
  }

  /**
   * Decrementa el contador de préstamos activos
   */
  public decrementActiveLoans(userId: string): boolean {
    const user = this.findUserById(userId);
    if (!user || user.prestamosActivos <= 0) return false;

    user.prestamosActivos--;
    return true;
  }

  /**
   * Verifica si un usuario puede solicitar más préstamos
   */
  public canRequestLoan(userId: string, maxLoans: number = 3): boolean {
    const user = this.findUserById(userId);
    if (!user || !user.activo) return false;

    return user.prestamosActivos < maxLoans;
  }

  /**
   * Obtiene estadísticas de usuarios
   */
  public getStats() {
    const allUsers = this.getAllUsers();
    return {
      total: allUsers.length,
      activos: allUsers.filter(u => u.activo).length,
      conPrestamos: allUsers.filter(u => u.prestamosActivos > 0).length,
      totalPrestamosActivos: allUsers.reduce((sum, u) => sum + u.prestamosActivos, 0),
    };
  }

  /**
   * Limpia todos los usuarios
   */
  public clear(): void {
    this.users.clear();
  }
}
