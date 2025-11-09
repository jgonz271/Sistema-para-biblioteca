class AVLNode<T> {
  key: string;
  value: T;
  left: AVLNode<T> | null;
  right: AVLNode<T> | null;
  height: number;

  constructor(key: string, value: T) {
    this.key = key;
    this.value = value;
    this.left = null;
    this.right = null;
    this.height = 1;
  }
}

/**
 * Árbol AVL (Auto-balanceado) - O(log n) garantizado
 */
export class AVLTree<T> {
  private root: AVLNode<T> | null;

  constructor() {
    this.root = null;
  }

  private getHeight(node: AVLNode<T> | null): number {
    return node ? node.height : 0;
  }

  private getBalanceFactor(node: AVLNode<T> | null): number {
    return node ? this.getHeight(node.left) - this.getHeight(node.right) : 0;
  }

  private updateHeight(node: AVLNode<T>): void {
    node.height = Math.max(
      this.getHeight(node.left),
      this.getHeight(node.right)
    ) + 1;
  }

  private rotateRight(y: AVLNode<T>): AVLNode<T> {
    const x = y.left!;
    const T2 = x.right;

    x.right = y;
    y.left = T2;

    this.updateHeight(y);
    this.updateHeight(x);

    return x;
  }

  private rotateLeft(x: AVLNode<T>): AVLNode<T> {
    const y = x.right!;
    const T2 = y.left;

    y.left = x;
    x.right = T2;

    this.updateHeight(x);
    this.updateHeight(y);

    return y;
  }

  private balance(node: AVLNode<T>): AVLNode<T> {
    this.updateHeight(node);
    const balance = this.getBalanceFactor(node);

    if (balance > 1 && this.getBalanceFactor(node.left) >= 0) {
      return this.rotateRight(node);
    }

    if (balance > 1 && this.getBalanceFactor(node.left) < 0) {
      node.left = this.rotateLeft(node.left!);
      return this.rotateRight(node);
    }

    if (balance < -1 && this.getBalanceFactor(node.right) <= 0) {
      return this.rotateLeft(node);
    }

    if (balance < -1 && this.getBalanceFactor(node.right) > 0) {
      node.right = this.rotateRight(node.right!);
      return this.rotateLeft(node);
    }

    return node;
  }

  public insert(key: string, value: T): void {
    this.root = this.insertNode(this.root, key, value);
  }

  private insertNode(
    node: AVLNode<T> | null,
    key: string,
    value: T
  ): AVLNode<T> {
    if (!node) {
      return new AVLNode(key, value);
    }

    if (key < node.key) {
      node.left = this.insertNode(node.left, key, value);
    } else if (key > node.key) {
      node.right = this.insertNode(node.right, key, value);
    } else {
      node.value = value;
      return node;
    }

    return this.balance(node);
  }

  public search(key: string): T | null {
    return this.searchNode(this.root, key);
  }

  private searchNode(node: AVLNode<T> | null, key: string): T | null {
    if (!node) return null;
    if (key === node.key) return node.value;
    return key < node.key
      ? this.searchNode(node.left, key)
      : this.searchNode(node.right, key);
  }

  public delete(key: string): boolean {
    const initialSize = this.size();
    this.root = this.deleteNode(this.root, key);
    return this.size() < initialSize;
  }

  private deleteNode(node: AVLNode<T> | null, key: string): AVLNode<T> | null {
    if (!node) return null;

    if (key < node.key) {
      node.left = this.deleteNode(node.left, key);
    } else if (key > node.key) {
      node.right = this.deleteNode(node.right, key);
    } else {
      if (!node.left && !node.right) return null;
      if (!node.left) return node.right;
      if (!node.right) return node.left;

      const minRight = this.findMinNode(node.right);
      if (!minRight) return node;
      node.key = minRight.key;
      node.value = minRight.value;
      node.right = this.deleteNode(node.right, minRight.key);
    }

    return this.balance(node);
  }

  public findMin(): T | null {
    const node = this.findMinNode(this.root);
    return node ? node.value : null;
  }

  private findMinNode(node: AVLNode<T> | null): AVLNode<T> | null {
    if (!node) return null;
    while (node.left) node = node.left;
    return node;
  }

  public findMax(): T | null {
    const node = this.findMaxNode(this.root);
    return node ? node.value : null;
  }

  private findMaxNode(node: AVLNode<T> | null): AVLNode<T> | null {
    if (!node) return null;
    while (node.right) node = node.right;
    return node;
  }

  public inOrderTraversal(): T[] {
    const result: T[] = [];
    this.inOrder(this.root, result);
    return result;
  }

  private inOrder(node: AVLNode<T> | null, result: T[]): void {
    if (node) {
      this.inOrder(node.left, result);
      result.push(node.value);
      this.inOrder(node.right, result);
    }
  }

  public preOrderTraversal(): T[] {
    const result: T[] = [];
    this.preOrder(this.root, result);
    return result;
  }

  private preOrder(node: AVLNode<T> | null, result: T[]): void {
    if (node) {
      result.push(node.value);
      this.preOrder(node.left, result);
      this.preOrder(node.right, result);
    }
  }

  public postOrderTraversal(): T[] {
    const result: T[] = [];
    this.postOrder(this.root, result);
    return result;
  }

  private postOrder(node: AVLNode<T> | null, result: T[]): void {
    if (node) {
      this.postOrder(node.left, result);
      this.postOrder(node.right, result);
      result.push(node.value);
    }
  }

  public searchRange(minKey: string, maxKey: string): T[] {
    const result: T[] = [];
    this.rangeSearch(this.root, minKey, maxKey, result);
    return result;
  }

  private rangeSearch(
    node: AVLNode<T> | null,
    minKey: string,
    maxKey: string,
    result: T[]
  ): void {
    if (!node) return;

    if (minKey < node.key) {
      this.rangeSearch(node.left, minKey, maxKey, result);
    }

    if (minKey <= node.key && node.key <= maxKey) {
      result.push(node.value);
    }

    if (node.key < maxKey) {
      this.rangeSearch(node.right, minKey, maxKey, result);
    }
  }

  public size(): number {
    return this.countNodes(this.root);
  }

  private countNodes(node: AVLNode<T> | null): number {
    if (!node) return 0;
    return 1 + this.countNodes(node.left) + this.countNodes(node.right);
  }

  public isEmpty(): boolean {
    return this.root === null;
  }

  public clear(): void {
    this.root = null;
  }

  public getTreeHeight(): number {
    return this.getHeight(this.root);
  }

  public isBalanced(): boolean {
    return this.checkBalance(this.root) !== -1;
  }

  private checkBalance(node: AVLNode<T> | null): number {
    if (!node) return 0;

    const leftHeight = this.checkBalance(node.left);
    if (leftHeight === -1) return -1;

    const rightHeight = this.checkBalance(node.right);
    if (rightHeight === -1) return -1;

    if (Math.abs(leftHeight - rightHeight) > 1) return -1;

    return Math.max(leftHeight, rightHeight) + 1;
  }

  public toArray(): T[] {
    return this.inOrderTraversal();
  }

  public print(): void {
    console.log('AVL Tree (In-Order):', this.toArray());
    console.log('Size:', this.size(), '| Height:', this.getTreeHeight());
  }
}
