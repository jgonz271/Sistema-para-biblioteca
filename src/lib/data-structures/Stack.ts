/**
 * Nodo de la pila
 */
class StackNode<T> {
  data: T;
  next: StackNode<T> | null;

  constructor(data: T) {
    this.data = data;
    this.next = null;
  }
}

/**
 * Pila (Stack) - Estructura LIFO (Last In, First Out)
 * El último en entrar es el primero en salir
 */
export class Stack<T> {
  private top: StackNode<T> | null; 
  private length: number;

  constructor() {
    this.top = null;
    this.length = 0;
  }

  /**
   * Agrega un elemento al tope de la pila
   * Complejidad: O(1)
   */
  push(data: T): void {
    const newNode = new StackNode(data);

    if (this.isEmpty()) {
      this.top = newNode;
    } else {
      newNode.next = this.top;
      this.top = newNode;
    }

    this.length++;
  }

  /**
   * Elimina y retorna el elemento del tope de la pila
   * Complejidad: O(1)
   */
  pop(): T | null {
    if (this.isEmpty()) {
      return null;
    }

    const poppedNode = this.top!;
    this.top = this.top!.next;
    this.length--;

    return poppedNode.data;
  }

  /**
   * Retorna el elemento del tope sin eliminarlo
   * Complejidad: O(1)
   */
  peek(): T | null {
    return this.top ? this.top.data : null;
  }

  /**
   * Verifica si la pila está vacía
   * Complejidad: O(1)
   */
  isEmpty(): boolean {
    return this.length === 0;
  }

  /**
   * Retorna el tamaño de la pila
   * Complejidad: O(1)
   */
  size(): number {
    return this.length;
  }

  /**
   * Limpia toda la pila
   * Complejidad: O(1)
   */
  clear(): void {
    this.top = null;
    this.length = 0;
  }

  /**
   * Busca un elemento en la pila
   * Complejidad: O(n)
   */
  find(predicate: (data: T) => boolean): T | null {
    let current = this.top;

    while (current) {
      if (predicate(current.data)) {
        return current.data;
      }
      current = current.next;
    }

    return null;
  }

  /**
   * Convierte la pila a un arreglo (del tope al fondo)
   * Complejidad: O(n)
   */
  toArray(): T[] {
    const result: T[] = [];
    let current = this.top;

    while (current) {
      result.push(current.data);
      current = current.next;
    }

    return result;
  }

  /**
   * Retorna los últimos N elementos sin eliminarlos
   * Complejidad: O(n)
   */
  peekN(n: number): T[] {
    const result: T[] = [];
    let current = this.top;
    let count = 0;

    while (current && count < n) {
      result.push(current.data);
      current = current.next;
      count++;
    }

    return result;
  }

  /**
   * Imprime la pila (útil para debugging)
   */
  print(): void {
    const elements: T[] = [];
    let current = this.top;

    while (current) {
      elements.push(current.data);
      current = current.next;
    }

    console.log('Tope -> ', elements.join(' | '), ' <- Fondo');
  }
}
