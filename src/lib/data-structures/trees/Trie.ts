class TrieNode<T> {
  children: Map<string, TrieNode<T>>;
  isEndOfWord: boolean;
  value: T | null;

  constructor() {
    this.children = new Map();
    this.isEndOfWord = false;
    this.value = null;
  }
}

/**
 * Trie (Árbol de Prefijos) - Búsqueda de texto O(m)
 */
export class Trie<T> {
  private root: TrieNode<T>;
  private wordCount: number;

  constructor() {
    this.root = new TrieNode<T>();
    this.wordCount = 0;
  }

  private normalize(str: string): string {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  public insert(word: string, value: T): void {
    const normalizedWord = this.normalize(word);
    let node = this.root;

    for (const char of normalizedWord) {
      if (!node.children.has(char)) {
        node.children.set(char, new TrieNode<T>());
      }
      node = node.children.get(char)!;
    }

    if (!node.isEndOfWord) this.wordCount++;
    node.isEndOfWord = true;
    node.value = value;
  }

  public search(word: string): T | null {
    const normalizedWord = this.normalize(word);
    const node = this.findNode(normalizedWord);
    return node && node.isEndOfWord ? node.value : null;
  }

  public contains(word: string): boolean {
    return this.search(word) !== null;
  }

  private findNode(word: string): TrieNode<T> | null {
    let node = this.root;

    for (const char of word) {
      if (!node.children.has(char)) return null;
      node = node.children.get(char)!;
    }

    return node;
  }

  public searchByPrefix(prefix: string): T[] {
    const normalizedPrefix = this.normalize(prefix);
    const node = this.findNode(normalizedPrefix);

    if (!node) return [];

    const results: T[] = [];
    this.collectWords(node, results);
    return results;
  }

  private collectWords(node: TrieNode<T>, results: T[]): void {
    if (node.isEndOfWord && node.value !== null) {
      results.push(node.value);
    }

    for (const child of node.children.values()) {
      this.collectWords(child, results);
    }
  }

  public autocomplete(prefix: string, limit: number = 10): T[] {
    const results = this.searchByPrefix(prefix);
    return results.slice(0, limit);
  }

  public delete(word: string): boolean {
    const normalizedWord = this.normalize(word);
    return this.deleteHelper(this.root, normalizedWord, 0);
  }

  private deleteHelper(
    node: TrieNode<T>,
    word: string,
    index: number
  ): boolean {
    if (index === word.length) {
      if (!node.isEndOfWord) return false;
      node.isEndOfWord = false;
      node.value = null;
      this.wordCount--;
      return node.children.size === 0;
    }

    const char = word[index];
    const childNode = node.children.get(char);

    if (!childNode) return false;

    const shouldDeleteChild = this.deleteHelper(childNode, word, index + 1);

    if (shouldDeleteChild) {
      node.children.delete(char);
      return node.children.size === 0 && !node.isEndOfWord;
    }

    return false;
  }

  public hasPrefix(prefix: string): boolean {
    const normalizedPrefix = this.normalize(prefix);
    return this.findNode(normalizedPrefix) !== null;
  }

  public countWordsWithPrefix(prefix: string): number {
    const normalizedPrefix = this.normalize(prefix);
    const node = this.findNode(normalizedPrefix);

    if (!node) return 0;
    return this.countWordsFromNode(node);
  }

  private countWordsFromNode(node: TrieNode<T>): number {
    let count = node.isEndOfWord ? 1 : 0;

    for (const child of node.children.values()) {
      count += this.countWordsFromNode(child);
    }

    return count;
  }

  public size(): number {
    return this.wordCount;
  }

  public isEmpty(): boolean {
    return this.wordCount === 0;
  }

  public clear(): void {
    this.root = new TrieNode<T>();
    this.wordCount = 0;
  }

  public getAllWords(): T[] {
    const results: T[] = [];
    this.collectWords(this.root, results);
    return results;
  }

  public fuzzySearch(word: string, maxDistance: number = 1): T[] {
    const normalizedWord = this.normalize(word);
    const results: T[] = [];
    this.fuzzySearchHelper(this.root, normalizedWord, '', 0, maxDistance, results);
    return results;
  }

  private fuzzySearchHelper(
    node: TrieNode<T>,
    target: string,
    current: string,
    distance: number,
    maxDistance: number,
    results: T[]
  ): void {
    if (node.isEndOfWord && node.value !== null) {
      const finalDistance = this.levenshteinDistance(current, target);
      if (finalDistance <= maxDistance) {
        results.push(node.value);
      }
    }

    if (distance > maxDistance) return;

    for (const [char, childNode] of node.children.entries()) {
      this.fuzzySearchHelper(
        childNode,
        target,
        current + char,
        distance,
        maxDistance,
        results
      );
    }
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const m = str1.length;
    const n = str2.length;
    const dp: number[][] = Array(m + 1)
      .fill(null)
      .map(() => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = Math.min(
            dp[i - 1][j] + 1,
            dp[i][j - 1] + 1,
            dp[i - 1][j - 1] + 1
          );
        }
      }
    }

    return dp[m][n];
  }

  public print(): void {
    console.log('Trie Statistics:');
    console.log('  Total words:', this.wordCount);
    console.log('  Words:', this.getAllWords().slice(0, 10), '...');
  }
}
