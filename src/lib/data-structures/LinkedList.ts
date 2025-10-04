/**
 * Nodo de la lista enlazada
 * Contiene el dato y referencia al siguiente nodo
 */
class ListNode<T> {
  data: T;
  next: ListNode<T> | null;

  constructor(data: T) {
    this.data = data;
    this.next = null;
  }
}

/**
 * Lista Enlazada Simple
 * Estructura de datos lineal donde cada elemento apunta al siguiente
 */
export class LinkedList<T> {
  private head: ListNode<T> | null;
  private tail: ListNode<T> | null;
  private length: number;

  constructor() {
    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  /**
   * Inserta un elemento al final de la lista
   * Complejidad: O(1)
   */
  append(data: T): void {
    const newNode = new ListNode(data);

    if (!this.head) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      this.tail!.next = newNode;
      this.tail = newNode;
    }

    this.length++;
  }

  /**
   * Inserta un elemento al inicio de la lista
   * Complejidad: O(1)
   */
  prepend(data: T): void {
    const newNode = new ListNode(data);

    if (!this.head) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      newNode.next = this.head;
      this.head = newNode;
    }

    this.length++;
  }

  /**
   * Inserta un elemento en una posición específica
   * Complejidad: O(n)
   */
  insertAt(index: number, data: T): boolean {
    if (index < 0 || index > this.length) {
      return false;
    }

    if (index === 0) {
      this.prepend(data);
      return true;
    }

    if (index === this.length) {
      this.append(data);
      return true;
    }

    const newNode = new ListNode(data);
    let current = this.head;
    let previous: ListNode<T> | null = null;
    let currentIndex = 0;

    while (currentIndex < index) {
      previous = current;
      current = current!.next;
      currentIndex++;
    }

    newNode.next = current;
    previous!.next = newNode;
    this.length++;

    return true;
  }

  /**
   * Elimina un elemento en una posición específica
   * Complejidad: O(n)
   */
  removeAt(index: number): T | null {
    if (index < 0 || index >= this.length || !this.head) {
      return null;
    }

    let removedNode: ListNode<T>;

    if (index === 0) {
      removedNode = this.head;
      this.head = this.head.next;

      if (this.length === 1) {
        this.tail = null;
      }
    } else {
      let current: ListNode<T> | null = this.head;
      let previous: ListNode<T> | null = null;
      let currentIndex = 0;

      while (currentIndex < index && current) {
        previous = current;
        current = current.next;
        currentIndex++;
      }

      removedNode = current!;
      previous!.next = current!.next;

      if (index === this.length - 1) {
        this.tail = previous;
      }
    }

    this.length--;
    return removedNode.data;
  }

  /**
   * Elimina el primer elemento que coincida con el criterio
   * Complejidad: O(n)
   */
  removeBy(predicate: (data: T) => boolean): T | null {
    if (!this.head) {
      return null;
    }

    // Si es el primer elemento
    if (predicate(this.head.data)) {
      const removedData = this.head.data;
      this.head = this.head.next;
      
      if (!this.head) {
        this.tail = null;
      }
      
      this.length--;
      return removedData;
    }

    // Buscar en el resto de la lista
    let current = this.head.next;
    let previous = this.head;

    while (current) {
      if (predicate(current.data)) {
        previous.next = current.next;
        
        if (current === this.tail) {
          this.tail = previous;
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
   * Busca un elemento por índice
   * Complejidad: O(n)
   */
  get(index: number): T | null {
    if (index < 0 || index >= this.length || !this.head) {
      return null;
    }

    let current: ListNode<T> | null = this.head;
    let currentIndex = 0;

    while (currentIndex < index && current) {
      current = current.next;
      currentIndex++;
    }

    return current!.data;
  }

  /**
   * Busca un elemento que cumpla una condición
   * Complejidad: O(n)
   */
  find(predicate: (data: T) => boolean): T | null {
    let current = this.head;

    while (current) {
      if (predicate(current.data)) {
        return current.data;
      }
      current = current.next;
    }

    return null;
  }

  /**
   * Filtra elementos que cumplan una condición
   * Complejidad: O(n)
   */
  filter(predicate: (data: T) => boolean): T[] {
    const result: T[] = [];
    let current = this.head;

    while (current) {
      if (predicate(current.data)) {
        result.push(current.data);
      }
      current = current.next;
    }

    return result;
  }

  /**
   * Convierte la lista a un arreglo
   * Complejidad: O(n)
   */
  toArray(): T[] {
    const result: T[] = [];
    let current = this.head;

    while (current) {
      result.push(current.data);
      current = current.next;
    }

    return result;
  }

  /**
   * Verifica si la lista está vacía
   * Complejidad: O(1)
   */
  isEmpty(): boolean {
    return this.length === 0;
  }

  /**
   * Retorna el tamaño de la lista
   * Complejidad: O(1)
   */
  size(): number {
    return this.length;
  }

  /**
   * Limpia toda la lista
   * Complejidad: O(1)
   */
  clear(): void {
    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  /**
   * Imprime la lista (útil para debugging)
   */
  print(): void {
    const elements: T[] = [];
    let current = this.head;

    while (current) {
      elements.push(current.data);
      current = current.next;
    }

    console.log(elements);
  }
}
