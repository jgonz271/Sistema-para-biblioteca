/**
 * Interfaz para aristas del grafo
 */
export interface Edge {
  source: string;
  target: string;
  weight: number;
  metadata?: {
    lastInteraction?: Date;
    interactionCount?: number;
    type?: 'loan' | 'reservation' | 'similarity';
  };
}

/**
 * Interfaz para nodos del grafo
 */
export interface GraphNode<T> {
  id: string;
  data: T;
}

/**
 * Grafo genérico con lista de adyacencia
 * Soporta grafos dirigidos/no dirigidos y ponderados/no ponderados
 */
export class Graph<T> {
  // Mapa de nodos: ID → datos
  protected nodes: Map<string, T>;
  
  // Lista de adyacencia: ID origen → Map<ID destino, peso>
  protected adjacencyList: Map<string, Map<string, number>>;
  
  // Para grafos dirigidos: lista inversa para consultas eficientes
  protected reverseAdjacencyList: Map<string, Map<string, number>>;
  
  // Configuración del grafo
  protected readonly isDirected: boolean;
  protected readonly isWeighted: boolean;

  constructor(directed: boolean = false, weighted: boolean = true) {
    this.nodes = new Map();
    this.adjacencyList = new Map();
    this.reverseAdjacencyList = new Map();
    this.isDirected = directed;
    this.isWeighted = weighted;
  }

  /**
   * Agrega un nodo al grafo
   * Complejidad: O(1)
   */
  addNode(id: string, data: T): void {
    if (!this.nodes.has(id)) {
      this.nodes.set(id, data);
      this.adjacencyList.set(id, new Map());
      if (this.isDirected) {
        this.reverseAdjacencyList.set(id, new Map());
      }
    }
  }

  /**
   * Elimina un nodo y todas sus aristas
   * Complejidad: O(V + E)
   */
  removeNode(id: string): boolean {
    if (!this.nodes.has(id)) return false;

    // Eliminar aristas salientes
    this.adjacencyList.delete(id);

    // Eliminar aristas entrantes (desde otros nodos)
    this.adjacencyList.forEach((neighbors) => {
      neighbors.delete(id);
    });

    if (this.isDirected) {
      this.reverseAdjacencyList.delete(id);
      this.reverseAdjacencyList.forEach((neighbors) => {
        neighbors.delete(id);
      });
    }

    this.nodes.delete(id);
    return true;
  }

  /**
   * Verifica si un nodo existe
   * Complejidad: O(1)
   */
  hasNode(id: string): boolean {
    return this.nodes.has(id);
  }

  /**
   * Obtiene los datos de un nodo
   * Complejidad: O(1)
   */
  getNode(id: string): T | undefined {
    return this.nodes.get(id);
  }

  /**
   * Agrega o actualiza una arista
   * Complejidad: O(1)
   */
  addEdge(source: string, target: string, weight: number = 1): boolean {
    if (!this.nodes.has(source) || !this.nodes.has(target)) {
      return false;
    }

    const finalWeight = this.isWeighted ? weight : 1;

    this.adjacencyList.get(source)!.set(target, finalWeight);

    if (this.isDirected) {
      this.reverseAdjacencyList.get(target)!.set(source, finalWeight);
    } else {
      // En grafos no dirigidos, agregar en ambas direcciones
      this.adjacencyList.get(target)!.set(source, finalWeight);
    }

    return true;
  }

  /**
   * Elimina una arista
   * Complejidad: O(1)
   */
  removeEdge(source: string, target: string): boolean {
    if (!this.hasEdge(source, target)) return false;

    this.adjacencyList.get(source)?.delete(target);

    if (this.isDirected) {
      this.reverseAdjacencyList.get(target)?.delete(source);
    } else {
      this.adjacencyList.get(target)?.delete(source);
    }

    return true;
  }

  /**
   * Verifica si existe una arista
   * Complejidad: O(1)
   */
  hasEdge(source: string, target: string): boolean {
    return this.adjacencyList.get(source)?.has(target) ?? false;
  }

  /**
   * Obtiene el peso de una arista
   * Complejidad: O(1)
   */
  getEdgeWeight(source: string, target: string): number | undefined {
    return this.adjacencyList.get(source)?.get(target);
  }

  /**
   * Actualiza el peso de una arista existente
   * Complejidad: O(1)
   */
  updateEdgeWeight(source: string, target: string, weight: number): boolean {
    if (!this.hasEdge(source, target)) return false;
    return this.addEdge(source, target, weight);
  }

  /**
   * Incrementa el peso de una arista (útil para conteos)
   * Complejidad: O(1)
   */
  incrementEdgeWeight(source: string, target: string, increment: number = 1): boolean {
    const currentWeight = this.getEdgeWeight(source, target) ?? 0;
    return this.addEdge(source, target, currentWeight + increment);
  }

  /**
   * Obtiene los vecinos de un nodo (nodos adyacentes)
   * Complejidad: O(1)
   */
  getNeighbors(id: string): Map<string, number> {
    return this.adjacencyList.get(id) ?? new Map();
  }

  /**
   * Obtiene los IDs de los vecinos
   * Complejidad: O(k) donde k = número de vecinos
   */
  getNeighborIds(id: string): string[] {
    return Array.from(this.getNeighbors(id).keys());
  }

  /**
   * Para grafos dirigidos: obtiene nodos que apuntan a este nodo
   * Complejidad: O(1)
   */
  getIncomingNeighbors(id: string): Map<string, number> {
    if (!this.isDirected) {
      return this.getNeighbors(id);
    }
    return this.reverseAdjacencyList.get(id) ?? new Map();
  }

  /**
   * Obtiene el grado de un nodo (número de aristas)
   * Complejidad: O(1)
   */
  getDegree(id: string): number {
    return this.adjacencyList.get(id)?.size ?? 0;
  }

  /**
   * Para grafos dirigidos: grado de entrada
   * Complejidad: O(1)
   */
  getInDegree(id: string): number {
    if (!this.isDirected) return this.getDegree(id);
    return this.reverseAdjacencyList.get(id)?.size ?? 0;
  }

  /**
   * Para grafos dirigidos: grado de salida
   * Complejidad: O(1)
   */
  getOutDegree(id: string): number {
    return this.getDegree(id);
  }

  /**
   * Obtiene todos los nodos
   * Complejidad: O(V)
   */
  getAllNodes(): Map<string, T> {
    return new Map(this.nodes);
  }

  /**
   * Obtiene todos los IDs de nodos
   * Complejidad: O(V)
   */
  getAllNodeIds(): string[] {
    return Array.from(this.nodes.keys());
  }

  /**
   * Obtiene todas las aristas
   * Complejidad: O(E)
   */
  getAllEdges(): Edge[] {
    const edges: Edge[] = [];
    const seen = new Set<string>();

    this.adjacencyList.forEach((neighbors, source) => {
      neighbors.forEach((weight, target) => {
        const edgeKey = this.isDirected 
          ? `${source}->${target}` 
          : [source, target].sort().join('<->');
        
        if (!seen.has(edgeKey)) {
          seen.add(edgeKey);
          edges.push({ source, target, weight });
        }
      });
    });

    return edges;
  }

  /**
   * Número de nodos
   * Complejidad: O(1)
   */
  getNodeCount(): number {
    return this.nodes.size;
  }

  /**
   * Número de aristas
   * Complejidad: O(V)
   */
  getEdgeCount(): number {
    let count = 0;
    this.adjacencyList.forEach((neighbors) => {
      count += neighbors.size;
    });
    return this.isDirected ? count : count / 2;
  }

  /**
   * Verifica si el grafo está vacío
   * Complejidad: O(1)
   */
  isEmpty(): boolean {
    return this.nodes.size === 0;
  }

  /**
   * Limpia el grafo
   * Complejidad: O(1)
   */
  clear(): void {
    this.nodes.clear();
    this.adjacencyList.clear();
    this.reverseAdjacencyList.clear();
  }

  /**
   * Obtiene configuración del grafo
   */
  getConfig(): { directed: boolean; weighted: boolean } {
    return {
      directed: this.isDirected,
      weighted: this.isWeighted,
    };
  }

  /**
   * BFS - Recorrido en anchura
   * Complejidad: O(V + E)
   */
  bfs(startId: string): string[] {
    if (!this.hasNode(startId)) return [];

    const visited = new Set<string>();
    const queue: string[] = [startId];
    const result: string[] = [];

    while (queue.length > 0) {
      const current = queue.shift()!;
      
      if (visited.has(current)) continue;
      visited.add(current);
      result.push(current);

      const neighbors = this.getNeighborIds(current);
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          queue.push(neighbor);
        }
      }
    }

    return result;
  }

  /**
   * DFS - Recorrido en profundidad
   * Complejidad: O(V + E)
   */
  dfs(startId: string): string[] {
    if (!this.hasNode(startId)) return [];

    const visited = new Set<string>();
    const result: string[] = [];

    const dfsHelper = (nodeId: string): void => {
      if (visited.has(nodeId)) return;
      
      visited.add(nodeId);
      result.push(nodeId);

      const neighbors = this.getNeighborIds(nodeId);
      for (const neighbor of neighbors) {
        dfsHelper(neighbor);
      }
    };

    dfsHelper(startId);
    return result;
  }

  /**
   * Encuentra componentes conectados
   * Complejidad: O(V + E)
   */
  findConnectedComponents(): Set<string>[] {
    const visited = new Set<string>();
    const components: Set<string>[] = [];

    for (const nodeId of this.nodes.keys()) {
      if (!visited.has(nodeId)) {
        const component = new Set<string>();
        const queue: string[] = [nodeId];

        while (queue.length > 0) {
          const current = queue.shift()!;
          if (visited.has(current)) continue;

          visited.add(current);
          component.add(current);

          const neighbors = this.getNeighborIds(current);
          for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
              queue.push(neighbor);
            }
          }
        }

        components.push(component);
      }
    }

    return components;
  }

  /**
   * Dijkstra - Camino más corto
   * Complejidad: O((V + E) log V)
   */
  dijkstra(startId: string, endId?: string): Map<string, { distance: number; path: string[] }> {
    if (!this.hasNode(startId)) return new Map();

    const distances = new Map<string, number>();
    const previous = new Map<string, string | null>();
    const visited = new Set<string>();
    
    // Inicializar distancias
    for (const nodeId of this.nodes.keys()) {
      distances.set(nodeId, Infinity);
      previous.set(nodeId, null);
    }
    distances.set(startId, 0);

    // Cola de prioridad simple (se podría optimizar con MinHeap)
    const getMinNode = (): string | null => {
      let minDist = Infinity;
      let minNode: string | null = null;
      
      for (const [nodeId, dist] of distances) {
        if (!visited.has(nodeId) && dist < minDist) {
          minDist = dist;
          minNode = nodeId;
        }
      }
      return minNode;
    };

    while (true) {
      const current = getMinNode();
      if (current === null) break;
      if (endId && current === endId) break;

      visited.add(current);
      const currentDist = distances.get(current)!;

      const neighbors = this.getNeighbors(current);
      for (const [neighbor, weight] of neighbors) {
        if (visited.has(neighbor)) continue;

        const newDist = currentDist + weight;
        if (newDist < distances.get(neighbor)!) {
          distances.set(neighbor, newDist);
          previous.set(neighbor, current);
        }
      }
    }

    // Construir resultado con caminos
    const result = new Map<string, { distance: number; path: string[] }>();
    
    for (const [nodeId, distance] of distances) {
      if (distance === Infinity) continue;
      
      const path: string[] = [];
      let current: string | null = nodeId;
      
      while (current !== null) {
        path.unshift(current);
        current = previous.get(current) ?? null;
      }
      
      result.set(nodeId, { distance, path });
    }

    return result;
  }

  /**
   * Obtiene el camino más corto entre dos nodos
   * Complejidad: O((V + E) log V)
   */
  getShortestPath(source: string, target: string): { path: string[]; distance: number } | null {
    const results = this.dijkstra(source, target);
    const targetResult = results.get(target);
    
    if (!targetResult || targetResult.distance === Infinity) {
      return null;
    }
    
    return targetResult;
  }

  /**
   * Calcula la centralidad de grado de todos los nodos
   * Complejidad: O(V)
   */
  getDegreeCentrality(): Map<string, number> {
    const centrality = new Map<string, number>();
    const maxPossibleDegree = this.nodes.size - 1;

    if (maxPossibleDegree <= 0) return centrality;

    for (const nodeId of this.nodes.keys()) {
      const degree = this.getDegree(nodeId);
      centrality.set(nodeId, degree / maxPossibleDegree);
    }

    return centrality;
  }

  /**
   * Imprime información del grafo
   */
  print(): void {
    console.log(`Grafo: ${this.isDirected ? 'Dirigido' : 'No Dirigido'}, ${this.isWeighted ? 'Ponderado' : 'No Ponderado'}`);
    console.log(`Nodos: ${this.getNodeCount()}, Aristas: ${this.getEdgeCount()}`);
    console.log('Adyacencias:');
    this.adjacencyList.forEach((neighbors, node) => {
      const edges = Array.from(neighbors.entries())
        .map(([n, w]) => `${n}(${w})`)
        .join(', ');
      console.log(`  ${node}: [${edges}]`);
    });
  }
}
