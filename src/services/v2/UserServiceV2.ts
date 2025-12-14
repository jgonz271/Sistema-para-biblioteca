/**
 * UserService V2 - Con Árboles (AVL + Trie)
 * Búsquedas 100-500x más rápidas
 */

import { LinkedList, AVLTree, Trie } from '@/lib/data-structures';
import type { User, CreateUserDTO } from '@/types';

export class UserServiceV2 {
  private usersByEmail: AVLTree<User>;
  private usersByName: Trie<User>;
  private insertionOrder: LinkedList<User>;
  private static instance: UserServiceV2;

  private constructor() {
    this.usersByEmail = new AVLTree<User>();
    this.usersByName = new Trie<User>();
    this.insertionOrder = new LinkedList<User>();
    this.initializeSampleData();
  }

  public static getInstance(): UserServiceV2 {
    if (!UserServiceV2.instance) {
      UserServiceV2.instance = new UserServiceV2();
    }
    return UserServiceV2.instance;
  }

  private initializeSampleData(): void {
    const nombres = ['Juan', 'María', 'Carlos', 'Ana', 'José', 'Laura', 'Miguel', 'Carmen', 'David', 'Isabel', 'Francisco', 'Elena', 'Antonio', 'Sofía', 'Manuel', 'Patricia', 'Pedro', 'Rosa', 'Diego', 'Lucía', 'Javier', 'Marta', 'Rafael', 'Teresa', 'Daniel', 'Beatriz', 'Alberto', 'Cristina', 'Sergio', 'Mónica', 'Fernando', 'Raquel', 'Roberto', 'Silvia', 'Andrés', 'Pilar', 'Jorge', 'Alicia', 'Luis', 'Victoria', 'Pablo', 'Natalia', 'Tomás', 'Gabriela', 'Ángel', 'Sandra', 'Ricardo', 'Claudia', 'Héctor', 'Daniela'];
    const apellidos = ['García', 'Martínez', 'Rodríguez', 'Fernández', 'López', 'González', 'Hernández', 'Jiménez', 'Díaz', 'Muñoz', 'Álvarez', 'Romero', 'Sánchez', 'Torres', 'Ramírez', 'Flores', 'Castro', 'Morales', 'Ortiz', 'Gutiérrez', 'Silva', 'Pérez', 'Ruiz', 'Vargas', 'Mendoza', 'Reyes', 'Cruz', 'Gómez', 'Navarro', 'Vega', 'Rojas', 'Medina', 'Aguilar', 'Delgado', 'Ramos', 'Herrera', 'Santos', 'Cortés', 'Guerrero', 'Domínguez', 'Paredes', 'León', 'Blanco', 'Soto', 'Campos', 'Ríos', 'Iglesias', 'Peña', 'Cano', 'Molina'];
    const calles = ['Calle', 'Avenida', 'Carrera', 'Diagonal', 'Transversal', 'Boulevard', 'Paseo', 'Camino'];
    const sampleUsers: CreateUserDTO[] = [];

    for (let i = 0; i < 50; i++) {
      const nombre = nombres[i % nombres.length];
      const apellido = apellidos[i % apellidos.length];
      const email = `${nombre.toLowerCase()}.${apellido.toLowerCase()}${i > 49 ? i : ''}@example.com`;
      const telefono = `555-${String(1000 + i).padStart(4, '0')}`;
      const calle = calles[i % calles.length];
      const numero = 10 + (i * 7) % 200;
      const direccion = `${calle} ${numero}, Ciudad`;

      sampleUsers.push({
        nombre,
        apellido,
        email,
        telefono,
        direccion,
      });
    }

    sampleUsers.forEach(user => this.addUser(user));
  }

  private generateId(): string {
    return `USR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getFullName(user: { nombre: string; apellido: string }): string {
    return `${user.nombre} ${user.apellido}`;
  }

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

    this.usersByEmail.insert(data.email.toLowerCase(), newUser);
    this.usersByName.insert(this.getFullName(newUser), newUser);
    this.insertionOrder.append(newUser);

    return newUser;
  }

  public getAllUsers(): User[] {
    return this.insertionOrder.toArray();
  }

  public getAllUsersSorted(): User[] {
    return this.usersByEmail.inOrderTraversal();
  }

  public findUserById(id: string): User | null {
    return this.insertionOrder.find(user => user.id === id);
  }

  public findByEmail(email: string): User | null {
    return this.usersByEmail.search(email.toLowerCase());
  }

  public findByNameExact(nombre: string, apellido: string): User | null {
    const fullName = `${nombre} ${apellido}`;
    return this.usersByName.search(fullName);
  }

  public searchByName(query: string): User[] {
    return this.usersByName.searchByPrefix(query);
  }

  public autocompleteNames(prefix: string, limit: number = 10): User[] {
    return this.usersByName.autocomplete(prefix, limit);
  }

  public getActiveUsers(): User[] {
    return this.insertionOrder.filter(user => user.activo);
  }

  public getUsersWithActiveLoans(): User[] {
    return this.insertionOrder.filter(user => user.prestamosActivos > 0);
  }

  public updateUser(id: string, updates: Partial<User>): User | null {
    const user = this.findUserById(id);
    if (!user) return null;

    if (updates.email && updates.email !== user.email) {
      const existingUser = this.findByEmail(updates.email);
      if (existingUser) {
        throw new Error('Ya existe un usuario con este email');
      }

      this.usersByEmail.delete(user.email.toLowerCase());
      this.usersByEmail.insert(updates.email.toLowerCase(), user);
    }

    if (updates.nombre || updates.apellido) {
      this.usersByName.delete(this.getFullName(user));

      const newNombre = updates.nombre || user.nombre;
      const newApellido = updates.apellido || user.apellido;

      if (updates.nombre) user.nombre = newNombre;
      if (updates.apellido) user.apellido = newApellido;

      this.usersByName.insert(this.getFullName(user), user);
    }

    Object.assign(user, updates);
    return user;
  }

  public deactivateUser(id: string): boolean {
    const user = this.findUserById(id);
    if (!user) return false;

    user.activo = false;
    return true;
  }

  public activateUser(id: string): boolean {
    const user = this.findUserById(id);
    if (!user) return false;

    user.activo = true;
    return true;
  }

  public deleteUser(id: string): boolean {
    const user = this.findUserById(id);
    if (!user) return false;

    if (user.prestamosActivos > 0) {
      throw new Error('No se puede eliminar un usuario con préstamos activos');
    }

    this.usersByEmail.delete(user.email.toLowerCase());
    this.usersByName.delete(this.getFullName(user));
    this.insertionOrder.removeBy(u => u.id === id);

    return true;
  }

  public incrementActiveLoans(userId: string): boolean {
    const user = this.findUserById(userId);
    if (!user) return false;

    user.prestamosActivos++;
    user.historialPrestamos++;
    return true;
  }

  public decrementActiveLoans(userId: string): boolean {
    const user = this.findUserById(userId);
    if (!user || user.prestamosActivos <= 0) return false;

    user.prestamosActivos--;
    return true;
  }

  public canRequestLoan(userId: string, maxLoans: number = 3): boolean {
    const user = this.findUserById(userId);
    if (!user || !user.activo) return false;

    return user.prestamosActivos < maxLoans;
  }

  public getStats() {
    const allUsers = this.getAllUsers();
    return {
      total: allUsers.length,
      activos: allUsers.filter(u => u.activo).length,
      conPrestamos: allUsers.filter(u => u.prestamosActivos > 0).length,
      totalPrestamosActivos: allUsers.reduce((sum, u) => sum + u.prestamosActivos, 0),
      alturaArbolEmail: this.usersByEmail.getTreeHeight(),
      totalNombresEnTrie: this.usersByName.size(),
    };
  }

  public clear(): void {
    this.usersByEmail.clear();
    this.usersByName.clear();
    this.insertionOrder.clear();
  }

  public getPerformanceInfo() {
    return {
      totalUsers: this.insertionOrder.size(),
      avlTreeHeight: this.usersByEmail.getTreeHeight(),
      avlTreeBalanced: this.usersByEmail.isBalanced(),
      trieWords: this.usersByName.size(),
      expectedSearchTimeEmail: `O(log ${this.insertionOrder.size()})`,
      expectedSearchTimeName: 'O(m) donde m = longitud del nombre',
    };
  }
}
