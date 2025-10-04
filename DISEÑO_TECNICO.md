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

### 3.1 Lista Enlazada para Catálogo de Libros

**Decisión:** Usar `LinkedList` para almacenar libros y usuarios

**Justificación:**
1. **Inserciones frecuentes:** Los libros se agregan constantemente al catálogo
2. **No requiere tamaño predefinido:** El catálogo puede crecer dinámicamente
3. **Eliminaciones eficientes:** Remover libros sin reorganizar toda la estructura
4. **Búsquedas frecuentes:** Aunque O(n), se implementan métodos optimizados como `find()` y `filter()`

**Complejidad de operaciones:**
```
append()    → O(1)   # Agregar al final
prepend()   → O(1)   # Agregar al inicio
find()      → O(n)   # Búsqueda lineal
removeBy()  → O(n)   # Eliminación con condición
```

### 3.2 Cola (Queue) para Sistema de Reservas

**Decisión:** Usar `Queue` FIFO para lista de espera de libros

**Justificación:**
1. **Justicia:** Primero en reservar, primero en recibir
2. **Simplicidad:** Cola implementa naturalmente el comportamiento deseado
3. **Eficiencia:** Operaciones O(1) para enqueue/dequeue
4. **Claridad semántica:** El código refleja la lógica del negocio

### 3.3 Pila (Stack) para Historial de Operaciones

**Decisión:** Usar `Stack` LIFO para auditoría del sistema

**Justificación:**
1. **Relevancia temporal:** Las operaciones más recientes son más importantes
2. **Eficiencia:** O(1) para agregar nuevas operaciones
3. **Limitación natural:** Fácil implementar un límite (últimas 100 operaciones)
4. **Patrón común:** Similar a historial de navegación web


### 3.4 Arreglo Dinámico para Préstamos

**Decisión:** Usar `DynamicArray` para gestionar préstamos

**Justificación:**
1. **Acceso directo:** Búsqueda por índice en O(1)
2. **Filtrado frecuente:** Necesitamos filtrar por usuario, libro, estado
3. **Crecimiento dinámico:** No sabemos cuántos préstamos habrá
4. **Simplicidad:** Operaciones familiares (push, pop, get)


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
│  - BookService                      │
│  - UserService                      │
│  - LoanService                      │
│  - ReservationService               │
│  - HistoryService                   │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Data Structures (In-Memory)       │
│  - LinkedList                       │
│  - Queue                            │
│  - Stack                            │
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

### Operaciones Críticas

| Operación | Estructura | Complejidad | Justificación |
|-----------|-----------|-------------|---------------|
| Agregar libro | LinkedList | O(1) | append al final |
| Buscar libro | LinkedList | O(n) | recorrer lista |
| Crear préstamo | DynamicArray | O(1)* | push amortizado |
| Filtrar préstamos | DynamicArray | O(n) | recorrer arreglo |
| Agregar reserva | Queue | O(1) | enqueue al final |
| Procesar reserva | Queue | O(1) | dequeue del frente |
| Registrar operación | Stack | O(1) | push al tope |
| Ver historial | Stack | O(n) | peekN elementos |

### Análisis de Escenarios

**Escenario 1: Biblioteca pequeña (100 libros, 50 usuarios)**
- Búsquedas O(n) son aceptables
- Memoria mínima (~50KB)
- Rendimiento excelente

**Escenario 2: Biblioteca mediana (1000 libros, 500 usuarios)**
- Búsquedas empiezan a ser lentas
- Memoria aceptable (~500KB)
- Considerar índices

**Escenario 3: Biblioteca grande (10000+ libros)**
- Necesario implementar estructuras más eficientes
- Hash tables para búsquedas O(1)
- Árboles B para orden
- Base de datos real

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

**Autor:** Juan González
**Fecha:** Octubre 2025  
**Versión:** 1.0
