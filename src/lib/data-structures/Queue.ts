/**
 * Nodo de la cola
 */
class QueueNode<T> {
  data: T;
  next: QueueNode<T> | null;

  constructor(data: T) {
    this.data = data;
    this.next = null;
  }
}

/**
 * Cola (Queue) - Estructura FIFO (First In, First Out)
 * El primero en entrar es el primero en salir
 */
export class Queue<T> {
  private front: QueueNode<T> | null; 
  private rear: QueueNode<T> | null; 
  private length: number;

  constructor() {
    this.front = null;
    this.rear = null;
    this.length = 0;
  }

  /**
   * Agrega un elemento al final de la cola
   * Complejidad: O(1)
   */
  enqueue(data: T): void {
    const newNode = new QueueNode(data);

    if (this.isEmpty()) {
      this.front = newNode;
      this.rear = newNode;
    } else {
      this.rear!.next = newNode;
      this.rear = newNode;
    }

    this.length++;
  }

  /**
   * Elimina y retorna el elemento del frente de la cola
   * Complejidad: O(1)
   */
  dequeue(): T | null {
    if (this.isEmpty()) {
      return null;
    }

    const dequeuedNode = this.front!;
    this.front = this.front!.next;

    if (!this.front) {
      this.rear = null;
    }

    this.length--;
    return dequeuedNode.data;
  }

  /**
   * Retorna el elemento del frente sin eliminarlo
   * Complejidad: O(1)
   */
  peek(): T | null {
    return this.front ? this.front.data : null;
  }

  /**
   * Retorna el elemento del final sin eliminarlo
   * Complejidad: O(1)
   */
  peekRear(): T | null {
    return this.rear ? this.rear.data : null;
  }

  /**
   * Verifica si la cola está vacía
   * Complejidad: O(1)
   */
  isEmpty(): boolean {
    return this.length === 0;
  }

  /**
   * Retorna el tamaño de la cola
   * Complejidad: O(1)
   */
  size(): number {
    return this.length;
  }

  /**
   * Limpia toda la cola
   * Complejidad: O(1)
   */
  clear(): void {
    this.front = null;
    this.rear = null;
    this.length = 0;
  }

  /**
   * Busca un elemento en la cola
   * Complejidad: O(n)
   */
  find(predicate: (data: T) => boolean): T | null {
    let current = this.front;

    while (current) {
      if (predicate(current.data)) {
        return current.data;
      }
      current = current.next;
    }

    return null;
  }

  /**
   * Elimina un elemento específico de la cola
   * Complejidad: O(n)
   */
  remove(predicate: (data: T) => boolean): T | null {
    if (this.isEmpty()) {
      return null;
    }

 
    if (predicate(this.front!.data)) {
      return this.dequeue();
    }

    let current = this.front!.next;
    let previous = this.front;

    while (current) {
      if (predicate(current.data)) {
        previous!.next = current.next;
        
        if (current === this.rear) {
          this.rear = previous;
        }
        
        this.length--;
        return current.data;
      }
      
      previous = current;
      current = current.next;
    }

    return null;
  }

  /**
   * Convierte la cola a un arreglo
   * Complejidad: O(n)
   */
  toArray(): T[] {
    const result: T[] = [];
    let current = this.front;

    while (current) {
      result.push(current.data);
      current = current.next;
    }

    return result;
  }

  /**
   * Retorna la posición de un elemento en la cola (0-indexed)
   * Complejidad: O(n)
   */
  getPosition(predicate: (data: T) => boolean): number {
    let current = this.front;
    let position = 0;

    while (current) {
      if (predicate(current.data)) {
        return position;
      }
      current = current.next;
      position++;
    }

    return -1;
  }

  /**
   * Imprime la cola
   */
  print(): void {
    const elements: T[] = [];
    let current = this.front;

    while (current) {
      elements.push(current.data);
      current = current.next;
    }

    console.log('Frente -> ', elements.join(' <- '), ' <- Final');
  }
}
