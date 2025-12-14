/**
 * Algoritmos de similitud para grafos
 * Usados para recomendaciones y análisis de relaciones
 */

/**
 * Calcula el índice de Jaccard entre dos conjuntos
 * J(A, B) = |A ∩ B| / |A ∪ B|
 * Complejidad: O(min(|A|, |B|))
 */
export function jaccardIndex(setA: Set<string>, setB: Set<string>): number {
  if (setA.size === 0 && setB.size === 0) return 0;

  let intersection = 0;
  const smaller = setA.size < setB.size ? setA : setB;
  const larger = setA.size < setB.size ? setB : setA;

  for (const item of smaller) {
    if (larger.has(item)) {
      intersection++;
    }
  }

  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Calcula la similitud del coseno entre dos vectores (mapas)
 * cos(A, B) = (A · B) / (||A|| × ||B||)
 * Complejidad: O(min(|A|, |B|))
 */
export function cosineSimilarity(
  vectorA: Map<string, number>,
  vectorB: Map<string, number>
): number {
  if (vectorA.size === 0 || vectorB.size === 0) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  // Calcular producto punto y norma de A
  for (const [key, valueA] of vectorA) {
    normA += valueA * valueA;
    const valueB = vectorB.get(key);
    if (valueB !== undefined) {
      dotProduct += valueA * valueB;
    }
  }

  // Calcular norma de B
  for (const valueB of vectorB.values()) {
    normB += valueB * valueB;
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (normA * normB);
}

/**
 * Cuenta vecinos comunes entre dos nodos
 * Complejidad: O(min(|N(a)|, |N(b)|))
 */
export function countCommonNeighbors(
  neighborsA: Set<string>,
  neighborsB: Set<string>
): number {
  let count = 0;
  const smaller = neighborsA.size < neighborsB.size ? neighborsA : neighborsB;
  const larger = neighborsA.size < neighborsB.size ? neighborsB : neighborsA;

  for (const neighbor of smaller) {
    if (larger.has(neighbor)) {
      count++;
    }
  }

  return count;
}

/**
 * Calcula el coeficiente de Adamic-Adar
 * Penaliza vecinos comunes muy conectados
 * AA(x, y) = Σ 1/log(|N(z)|) para z ∈ N(x) ∩ N(y)
 * Complejidad: O(|N(x) ∩ N(y)|)
 */
export function adamicAdar(
  neighborsA: Set<string>,
  neighborsB: Set<string>,
  getDegree: (id: string) => number
): number {
  let score = 0;

  for (const neighbor of neighborsA) {
    if (neighborsB.has(neighbor)) {
      const degree = getDegree(neighbor);
      if (degree > 1) {
        score += 1 / Math.log(degree);
      }
    }
  }

  return score;
}

/**
 * Encuentra los K elementos más similares
 * Complejidad: O(n log k) donde n = número de candidatos
 */
export function topKSimilar<T>(
  items: Array<{ id: string; score: number; data?: T }>,
  k: number
): Array<{ id: string; score: number; data?: T }> {
  return items
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}

/**
 * Calcula matriz de similitud para un conjunto de elementos
 * Complejidad: O(n² × m) donde n = elementos, m = tamaño promedio de conjuntos
 */
export function buildSimilarityMatrix(
  items: Map<string, Set<string>>,
  similarityFn: (a: Set<string>, b: Set<string>) => number = jaccardIndex
): Map<string, Map<string, number>> {
  const matrix = new Map<string, Map<string, number>>();
  const ids = Array.from(items.keys());

  for (const idA of ids) {
    matrix.set(idA, new Map());
  }

  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      const idA = ids[i];
      const idB = ids[j];
      const setA = items.get(idA)!;
      const setB = items.get(idB)!;

      const similarity = similarityFn(setA, setB);
      
      if (similarity > 0) {
        matrix.get(idA)!.set(idB, similarity);
        matrix.get(idB)!.set(idA, similarity);
      }
    }
  }

  return matrix;
}
