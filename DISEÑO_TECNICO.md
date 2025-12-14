# Documento de Diseño Técnico
## Sistema de Gestión de Biblioteca

---

## 1. Resumen Ejecutivo

Este documento detalla las decisiones de diseño, arquitectura y justificación técnica del Sistema de Gestión de Biblioteca.

## 2. Objetivos del Sistema

### 2.1 Objetivos Funcionales
- Gestionar el catálogo de libros de manera eficiente
- Controlar préstamos con validaciones y multas
- Implementar sistema justo de reservas (FIFO)
- Mantener auditoría de operaciones (LIFO)
- Proporcionar interfaz intuitiva y moderna

## 3. Selección de Estructuras de Datos

### 3.1 Arquitectura Multi-Índice para Libros y Usuarios (V2)

**Decisión:** Combinar AVL Tree + Trie + LinkedList para máxima eficiencia

**Justificación:**
1. **AVL Tree:** Búsquedas por clave única (ISBN/Email) en O(log n)
2. **Trie:** Búsquedas por prefijo y autocompletado en O(m) donde m = longitud
3. **LinkedList:** Mantener orden de inserción O(1)

**Complejidad de operaciones:**
```
Búsqueda por ISBN/Email    → O(log n)  # AVL Tree
Búsqueda por prefijo        → O(m)      # Trie
Autocompletado              → O(m)      # Trie
Inserción                   → O(log n)  # AVL balanceo
Orden de inserción          → O(1)      # LinkedList
```

### 3.2 AVL Tree (Árbol Binario Auto-balanceado)

**Uso:** Índice principal para ISBN (libros) y Email (usuarios)

**Características:**
- Auto-balanceo garantiza altura O(log n)
- Rotaciones LL, LR, RR, RL mantienen balance
- Factor de balance: altura(izq) - altura(der) ∈ [-1, 1]

### 3.3 Trie (Árbol de Prefijos)

**Uso:** Búsquedas de texto en títulos, autores, nombres

**Características:**
- Normalización (lowercase, sin acentos) para búsquedas flexibles
- Autocompletado eficiente con límite configurable
- Búsqueda difusa con distancia Levenshtein

### 3.4 Cola (Queue) para Sistema de Reservas

**Decisión:** Usar `Queue` FIFO para lista de espera de libros

**Justificación:**
1. **Justicia:** Primero en reservar, primero en recibir
2. **Eficiencia:** Operaciones O(1) para enqueue/dequeue

### 3.5 Pila (Stack) para Historial de Operaciones

**Decisión:** Usar `Stack` LIFO para auditoría del sistema

**Justificación:**
1. **Relevancia temporal:** Las operaciones más recientes son más importantes
2. **Eficiencia:** O(1) para agregar nuevas operaciones

### 3.6 Arreglo Dinámico para Préstamos

**Decisión:** Usar `DynamicArray` para gestionar préstamos

**Justificación:**
1. **Acceso directo:** Búsqueda por índice en O(1)
2. **Filtrado frecuente:** Por usuario, libro, estado
3. **Crecimiento dinámico:** Sin límite predefinido


## 4. Arquitectura del Sistema

### 4.1 Capas de la Aplicación

```
┌─────────────────────────────────────┐
│     Presentation Layer (React)      │
│  - Componentes UI                   │
│  - Material-UI                      │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│     API Layer (Next.js Routes)      │
│  - /api/books                       │
│  - /api/users                       │
│  - /api/loans                       │
│  - /api/reservations                │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│     Business Logic (Services)       │
│  - BookServiceV2 (AVL+Trie)         │
│  - UserServiceV2 (AVL+Trie)         │
│  - LoanService                      │
│  - ReservationService               │
│  - HistoryService                   │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Data Structures (In-Memory)       │
│  Árboles:                           │
│  - AVLTree (auto-balanceado)        │
│  - Trie (búsqueda prefijos)         │
│  Lineales:                          │
│  - LinkedList                       │
│  - Queue (FIFO)                     │
│  - Stack (LIFO)                     │
│  - DynamicArray                     │
└─────────────────────────────────────┘
```

### 4.2 Patrón Singleton

Todos los servicios implementan Singleton para:
- **Mantener estado consistente** en toda la aplicación
- **Evitar múltiples instancias** con datos diferentes
- **Simular persistencia** durante la sesión del servidor


## 5. Flujos de Datos Principales

### 5.1 Flujo de Préstamo

```
1. Usuario solicita préstamo
   ↓
2. LoanService.createLoan()
   ↓
3. Validaciones:
   - Libro existe y tiene copias disponibles?
   - Usuario existe y está activo?
   - Usuario puede solicitar más préstamos? (máx 3)
   ↓
4. Crear objeto Loan
   ↓
5. DynamicArray.push(loan)
   ↓
6. BookService.decreaseAvailableCopies()
   ↓
7. UserService.incrementActiveLoans()
   ↓
8. HistoryService.logLoan()
   ↓
9. Retornar préstamo creado
```

### 5.2 Flujo de Reserva

```
1. Usuario solicita reserva
   ↓
2. ReservationService.addReservation()
   ↓
3. Validaciones:
   - Usuario ya tiene reserva activa para este libro?
   ↓
4. Crear objeto Reservation
   ↓
5. Queue.enqueue(reservation)
   ↓
6. Queue.getPosition() para mostrar posición en cola
   ↓
7. HistoryService.logReservation()
   ↓
8. Retornar reserva con posición
```

### 5.3 Flujo de Devolución

```
1. Usuario devuelve libro
   ↓
2. LoanService.returnBook()
   ↓
3. Calcular multa (si hay retraso)
   ↓
4. Actualizar estado del préstamo
   ↓
5. BookService.increaseAvailableCopies()
   ↓
6. UserService.decrementActiveLoans()
   ↓
7. Verificar si hay reservas pendientes
   ↓
8. Si hay reservas:
   - Queue.peek() para ver siguiente usuario
   - Queue.dequeue() para procesar reserva
   ↓
9. HistoryService.logReturn()
   ↓
10. Retornar préstamo con multa calculada
```

## 6. Decisiones de Implementación

### 6.1 TypeScript sobre JavaScript

**Razón:**
- Type safety reduce bugs
- IntelliSense mejora productividad
- Documentación auto-generada
- Familiaridad con sintaxis moderna

### 6.2 Almacenamiento en Memoria

**Razón:**
- Simplicidad para demostrar conceptos



### 6.3 Material-UI sobre componentes custom

**Razón:**
- Componentes profesionales y testeados
- Accesibilidad (a11y) integrada
- Theming consistente
- Responsive por defecto

### 6.4 Next.js App Router

**Ventajas:**
- Server Components para mejor performance
- API Routes integradas
- File-based routing
- TypeScript first-class support

## 7. Complejidad Temporal

### Operaciones Críticas (con Árboles V2)

| Operación | Estructura | Complejidad | Mejora |
|-----------|-----------|-------------|--------|
| Buscar por ISBN/Email | AVL Tree | O(log n) | ✓ 100-500x |
| Buscar por título/nombre | Trie | O(m) | ✓ 100-500x |
| Autocompletar | Trie | O(m) | ✓ Nueva |
| Agregar libro/usuario | AVL+Trie | O(log n) | - |
| Crear préstamo | DynamicArray | O(1)* | - |
| Filtrar préstamos | DynamicArray | O(n) | - |
| Agregar reserva | Queue | O(1) | - |
| Procesar reserva | Queue | O(1) | - |
| Registrar operación | Stack | O(1) | - |

*m = longitud del término de búsqueda

### Análisis de Escenarios

**Implementación actual (200 libros, 50 usuarios):**
- Búsquedas: O(log 200) ≈ 7.6 comparaciones (AVL)
- Autocompletado: O(m) instantáneo (Trie)
- Altura AVL: ~7-8 niveles
- Memoria: ~1MB con índices múltiples
- Rendimiento: Excelente

**Escalabilidad proyectada:**
- 1,000 libros: O(log 1000) ≈ 10 comparaciones
- 10,000 libros: O(log 10000) ≈ 13 comparaciones
- 100,000 libros: O(log 100000) ≈ 17 comparaciones
- AVL garantiza balanceo automático

## 8. Validaciones y Reglas de Negocio

### 8.1 Reglas Implementadas

1. **Préstamos:**
   - Máximo 3 préstamos activos por usuario
   - Solo libros con copias disponibles
   - Usuarios deben estar activos

2. **Usuarios:**
   - Email único
   - No eliminar si tiene préstamos activos
   - Campos requeridos validados

3. **Reservas:**
   - Un usuario solo puede reservar una vez el mismo libro
   - Solo para libros sin copias disponibles

4. **Multas:**
   - $500 por día de retraso
   - Calculada automáticamente en devolución

---

## 9. Mejoras Implementadas V2

### Estructuras de Datos Avanzadas
- **AVL Tree:** Búsquedas O(log n) para ISBN y Email
- **Trie:** Búsquedas por prefijo O(m) para títulos, autores, nombres
- **Arquitectura Multi-Índice:** Combina AVL, Trie y LinkedList

### Nuevas Funcionalidades API
- Autocompletado: `/api/books?autocomplete=term&limit=10`
- Búsqueda por ISBN: `/api/books?isbn=978-...`
- Búsqueda por Email: `/api/users?email=user@example.com`
- Resultados ordenados: `/api/books?sorted=true`
- Debug mode: `/api/books?debug=true`

### Datos de Prueba
- 200 libros de muestra (categorías variadas)
- 50 usuarios de muestra
- ISBNs únicos generados automáticamente

---

## 10. Implementación V3 - Grafos

### 10.1 Arquitectura de Grafos

**Decisión:** Implementar sistema multi-grafo con tres grafos complementarios

```
┌─────────────────────────────────────────────────────────────┐
│                    SISTEMA DE GRAFOS V3                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐    ┌──────────────────┐               │
│  │   USUARIOS (U)   │    │    LIBROS (L)    │               │
│  │   ○ ○ ○ ○ ○     │    │    □ □ □ □ □    │               │
│  └────────┬─────────┘    └────────┬─────────┘               │
│           │                       │                          │
│           │    G1: Usuario-Libro  │                          │
│           │    (Bipartito/Dirigido/Ponderado)                │
│           └───────────────────────┘                          │
│                                                              │
│  ┌──────────────────┐    ┌──────────────────┐               │
│  │ G3: Usuario-     │    │ G2: Libro-Libro  │               │
│  │     Usuario      │    │ (Similitud)      │               │
│  │ ○───○───○       │    │ □───□───□       │               │
│  │ (Jaccard)        │    │ (Jaccard)        │               │
│  └──────────────────┘    └──────────────────┘               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 10.2 Tipos de Grafos Implementados

| Grafo | Tipo | Nodos | Aristas | Uso |
|-------|------|-------|---------|-----|
| G1: Usuario-Libro | Bipartito, Dirigido, Ponderado | Usuarios + Libros | Préstamos (peso = cantidad) | Historial de interacciones |
| G2: Libro-Libro | No Dirigido, Ponderado | Libros | Similitud Jaccard | Libros relacionados |
| G3: Usuario-Usuario | No Dirigido, Ponderado | Usuarios | Similitud Jaccard | Usuarios similares |

### 10.3 Representación: Lista de Adyacencia

**Decisión:** Usar lista de adyacencia en lugar de matriz

**Justificación:**
- Grafo disperso (no todos los usuarios leen todos los libros)
- Espacio: O(V + E) vs O(V²) de matriz
- Con 200 libros y 50 usuarios → ~1,700 aristas estimadas
- Acceso a vecinos: O(1)

```typescript
// Estructura interna
adjacencyList: Map<string, Map<string, number>>
// nodeId → Map<neighborId, weight>
```

### 10.4 Algoritmos Implementados

#### Recorridos
- **BFS (Breadth-First Search):** O(V + E) - Exploración por niveles
- **DFS (Depth-First Search):** O(V + E) - Exploración en profundidad

#### Caminos
- **Dijkstra:** O((V + E) log V) - Camino más corto ponderado

#### Similitud
- **Índice de Jaccard:** J(A,B) = |A ∩ B| / |A ∪ B|
- **Similitud del Coseno:** Para vectores de características
- **Adamic-Adar:** Penaliza vecinos muy conectados

#### Análisis
- **Centralidad de Grado:** Identificar nodos más conectados
- **Componentes Conectados:** Detectar comunidades

### 10.5 Funcionalidades del Sistema de Recomendaciones

| Funcionalidad | Método | Complejidad |
|---------------|--------|-------------|
| Recomendaciones personalizadas | `getRecommendationsForUser()` | O(k × m) |
| Libros relacionados | `getRelatedBooks()` | O(u × b) |
| Libros similares | `getSimilarBooks()` | O(k log k) |
| Usuarios similares | `getSimilarUsers()` | O(k log k) |
| Camino entre libros | `findConnectionBetweenBooks()` | O((V+E) log V) |
| Comunidades de lectores | `findReaderCommunities()` | O(V + E) |
| Libros populares | `getMostPopularBooks()` | O(L log L) |

### 10.6 Integración con Servicios Existentes

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUJO DE PRÉSTAMO V3                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  LoanService.createLoan()                                    │
│       │                                                      │
│       ├──→ BookServiceV2 (actualizar copias)                │
│       ├──→ UserServiceV2 (actualizar préstamos)             │
│       ├──→ HistoryService (registrar operación)             │
│       └──→ GraphService.recordLoan() ←── NUEVO V3           │
│                 │                                            │
│                 ├──→ Actualizar G1 (Usuario-Libro)          │
│                 ├──→ Recalcular G2 (Libro-Libro)            │
│                 └──→ Recalcular G3 (Usuario-Usuario)        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 10.7 API Endpoints V3

```
# Recomendaciones
GET /api/recommendations?type=books&userId=<id>
GET /api/recommendations?type=related&bookId=<id>
GET /api/recommendations?type=similar-books&bookId=<id>
GET /api/recommendations?type=similar-users&userId=<id>
GET /api/recommendations?type=popular
GET /api/recommendations?type=communities
GET /api/recommendations?type=dashboard&userId=<id>
GET /api/recommendations?type=stats

# Análisis de Grafos
GET /api/graphs?action=stats
GET /api/graphs?action=path-books&from=<id>&to=<id>
GET /api/graphs?action=path-users&from=<id>&to=<id>
GET /api/graphs?action=user-books&id=<userId>
GET /api/graphs?action=book-users&id=<bookId>
POST /api/graphs { action: 'rebuild' }
```

---

## 11. Organización del Código

### 11.1 Estructura de Servicios

```
src/services/
├── index.ts              # Exportaciones centralizadas
├── v1/                   # Estructuras Lineales
│   ├── BookService.ts    # LinkedList
│   ├── UserService.ts    # LinkedList
│   └── index.ts
├── v2/                   # Árboles
│   ├── BookServiceV2.ts  # AVL + Trie + LinkedList
│   ├── UserServiceV2.ts  # AVL + Trie + LinkedList
│   └── index.ts
├── v3/                   # Grafos
│   ├── GraphService.ts   # Multi-grafo
│   ├── RecommendationService.ts
│   └── index.ts
└── core/                 # Lógica de negocio
    ├── LoanService.ts    # DynamicArray + GraphService
    ├── ReservationService.ts  # Queue (FIFO)
    ├── HistoryService.ts      # Stack (LIFO)
    └── index.ts
```

### 11.2 Estructura de Datos

```
src/lib/data-structures/
├── index.ts
├── LinkedList.ts
├── Queue.ts
├── Stack.ts
├── DynamicArray.ts
├── trees/
│   ├── AVLTree.ts
│   ├── Trie.ts
│   └── index.ts
└── graphs/
    ├── Graph.ts          # Clase base genérica
    ├── algorithms/
    │   ├── similarity.ts # Jaccard, Coseno, Adamic-Adar
    │   └── index.ts
    └── index.ts
```

---

## 12. Complejidad Temporal Completa

### Operaciones por Versión

| Operación | V1 (Lineal) | V2 (Árboles) | V3 (Grafos) |
|-----------|-------------|--------------|-------------|
| Buscar por ISBN | O(n) | O(log n) | O(log n) |
| Buscar por título | O(n) | O(m) | O(m) |
| Autocompletar | N/A | O(m) | O(m) |
| Recomendaciones | N/A | N/A | O(k × m) |
| Libros similares | N/A | N/A | O(1) lookup |
| Usuarios similares | N/A | N/A | O(1) lookup |
| Camino más corto | N/A | N/A | O((V+E) log V) |


---

**Autor:** Juan González
**Fecha:** Diciembre 2025
**Versión:** 3.0 (Grafos implementados)
