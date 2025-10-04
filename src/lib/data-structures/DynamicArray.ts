/**
 * Arreglo Dinámico (Dynamic Array)
 * Estructura de datos con tamaño variable que crece automáticamente
 */
export class DynamicArray<T> {
  private items: (T | undefined)[];
  private length: number;
  private capacity: number;

  constructor(initialCapacity: number = 10) {
    this.items = new Array(initialCapacity);
    this.length = 0;
    this.capacity = initialCapacity;
  }

  /**
   * Redimensiona el arreglo interno cuando se llena
   * Complejidad: O(n)
   */
  private resize(): void {
    this.capacity *= 2;
    const newItems = new Array(this.capacity);

    for (let i = 0; i < this.length; i++) {
      newItems[i] = this.items[i];
    }

    this.items = newItems;
  }

  /**
   * Agrega un elemento al final del arreglo
   * Complejidad: O(1) amortizado
   */
  push(item: T): void {
    if (this.length === this.capacity) {
      this.resize();
    }

    this.items[this.length] = item;
    this.length++;
  }

  /**
   * Elimina y retorna el último elemento
   * Complejidad: O(1)
   */
  pop(): T | undefined {
    if (this.isEmpty()) {
      return undefined;
    }

    const item = this.items[this.length - 1];
    this.items[this.length - 1] = undefined;
    this.length--;

    return item;
  }

  /**
   * Inserta un elemento en una posición específica
   * Complejidad: O(n)
   */
  insertAt(index: number, item: T): boolean {
    if (index < 0 || index > this.length) {
      return false;
    }

    if (this.length === this.capacity) {
      this.resize();
    }

    for (let i = this.length; i > index; i--) {
      this.items[i] = this.items[i - 1];
    }

    this.items[index] = item;
    this.length++;

    return true;
  }

  /**
   * Elimina un elemento en una posición específica
   * Complejidad: O(n)
   */
  removeAt(index: number): T | undefined {
    if (index < 0 || index >= this.length) {
      return undefined;
    }

    const item = this.items[index];

    for (let i = index; i < this.length - 1; i++) {
      this.items[i] = this.items[i + 1];
    }

    this.items[this.length - 1] = undefined;
    this.length--;

    return item;
  }

  /**
   * Elimina el primer elemento que cumpla la condición
   * Complejidad: O(n)
   */
  removeBy(predicate: (item: T) => boolean): T | undefined {
    for (let i = 0; i < this.length; i++) {
      if (this.items[i] !== undefined && predicate(this.items[i]!)) {
        return this.removeAt(i);
      }
    }

    return undefined;
  }

  /**
   * Obtiene un elemento por índice
   * Complejidad: O(1)
   */
  get(index: number): T | undefined {
    if (index < 0 || index >= this.length) {
      return undefined;
    }

    return this.items[index];
  }

  /**
   * Actualiza un elemento en una posición específica
   * Complejidad: O(1)
   */
  set(index: number, item: T): boolean {
    if (index < 0 || index >= this.length) {
      return false;
    }

    this.items[index] = item;
    return true;
  }

  /**
   * Busca un elemento que cumpla una condición
   * Complejidad: O(n)
   */
  find(predicate: (item: T) => boolean): T | undefined {
    for (let i = 0; i < this.length; i++) {
      if (this.items[i] !== undefined && predicate(this.items[i]!)) {
        return this.items[i];
      }
    }

    return undefined;
  }

  /**
   * Busca el índice de un elemento que cumpla una condición
   * Complejidad: O(n)
   */
  findIndex(predicate: (item: T) => boolean): number {
    for (let i = 0; i < this.length; i++) {
      if (this.items[i] !== undefined && predicate(this.items[i]!)) {
        return i;
      }
    }

    return -1;
  }

  /**
   * Filtra elementos que cumplan una condición
   * Complejidad: O(n)
   */
  filter(predicate: (item: T) => boolean): T[] {
    const result: T[] = [];

    for (let i = 0; i < this.length; i++) {
      if (this.items[i] !== undefined && predicate(this.items[i]!)) {
        result.push(this.items[i]!);
      }
    }

    return result;
  }

  /**
   * Aplica una función a cada elemento
   * Complejidad: O(n)
   */
  map<U>(callback: (item: T, index: number) => U): U[] {
    const result: U[] = [];

    for (let i = 0; i < this.length; i++) {
      if (this.items[i] !== undefined) {
        result.push(callback(this.items[i]!, i));
      }
    }

    return result;
  }

  /**
   * Verifica si existe un elemento que cumpla la condición
   * Complejidad: O(n)
   */
  some(predicate: (item: T) => boolean): boolean {
    for (let i = 0; i < this.length; i++) {
      if (this.items[i] !== undefined && predicate(this.items[i]!)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Verifica si el arreglo está vacío
   * Complejidad: O(1)
   */
  isEmpty(): boolean {
    return this.length === 0;
  }

  /**
   * Retorna el tamaño del arreglo
   * Complejidad: O(1)
   */
  size(): number {
    return this.length;
  }

  /**
   * Retorna la capacidad actual del arreglo
   * Complejidad: O(1)
   */
  getCapacity(): number {
    return this.capacity;
  }

  /**
   * Limpia todo el arreglo
   * Complejidad: O(1)
   */
  clear(): void {
    this.items = new Array(10);
    this.length = 0;
    this.capacity = 10;
  }

  /**
   * Convierte el arreglo a un array nativo
   * Complejidad: O(n)
   */
  toArray(): T[] {
    const result: T[] = [];

    for (let i = 0; i < this.length; i++) {
      if (this.items[i] !== undefined) {
        result.push(this.items[i]!);
      }
    }

    return result;
  }

  /**
   * Imprime el arreglo
   */
  print(): void {
    console.log(`[${this.toArray().join(', ')}] - Tamaño: ${this.length}, Capacidad: ${this.capacity}`);
  }
}
