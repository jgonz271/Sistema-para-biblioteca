/**
 * Servicios del Sistema de Biblioteca
 * Organizados por versión según las estructuras de datos utilizadas
 */

// ============================================================
// V1: Estructuras Lineales (LinkedList, Queue, Stack, DynamicArray)
// ============================================================
export { BookService, UserService } from './v1';

// ============================================================
// V2: Estructuras No Lineales - Árboles (AVL Tree, Trie)
// ============================================================
export { BookServiceV2, UserServiceV2 } from './v2';

// ============================================================
// V3: Estructuras No Lineales - Grafos
// ============================================================
export { GraphService, RecommendationService } from './v3';

// ============================================================
// Core: Servicios de lógica de negocio (usan V2 internamente)
// ============================================================
export { LoanService, ReservationService, HistoryService } from './core';
