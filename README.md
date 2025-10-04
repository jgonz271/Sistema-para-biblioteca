# 📚 Sistema de Gestión de Biblioteca

Sistema de gestión bibliotecaria que implementa **4 estructuras de datos lineales desde cero**: Lista Enlazada, Cola (Queue), Pila (Stack) y Arreglo Dinámico.

## 🎯 Descripción

Aplicación web fullstack que demuestra el uso práctico de estructuras de datos para resolver problemas reales en un contexto bibliotecario.

## ✨ Funcionalidades

- 📖 **Gestión de Libros** - CRUD completo con búsqueda
- 👥 **Gestión de Usuarios** - Registro y administración
- 🔄 **Préstamos** - Control con multas automáticas
- 🔖 **Reservas** - Sistema de cola FIFO
- 📜 **Historial** - Registro de operaciones LIFO
- 📊 **Estadísticas** - Dashboard con métricas
- 🔔 **Notificaciones** - Feedback visual en tiempo real

## 🛠️ Tecnologías

- **Next.js 15** - Framework React con App Router
- **TypeScript** - Tipado estático
- **Material-UI** - Componentes UI
- **TailwindCSS** - Estilos

## 🏗️ Estructuras de Datos

| Estructura | Uso | Archivo |
|------------|-----|---------|
| **LinkedList** | Catálogo de libros y usuarios | `LinkedList.ts` |
| **Queue (FIFO)** | Sistema de reservas | `Queue.ts` |
| **Stack (LIFO)** | Historial de operaciones | `Stack.ts` |
| **DynamicArray** | Gestión de préstamos | `DynamicArray.ts` |

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Abrir en navegador
http://localhost:3000
```

## 📁 Estructura

```
src/
├── app/                    # Páginas y API Routes
│   ├── api/               # Endpoints REST
│   └── [modulos]/         # Páginas de la app
├── lib/
│   └── data-structures/   # Estructuras implementadas
├── services/              # Lógica de negocio
├── components/            # Componentes React
└── types/                 # Tipos TypeScript
```

## 🔌 API Principal

```
GET/POST    /api/books          # Libros
GET/POST    /api/users          # Usuarios
GET/POST    /api/loans          # Préstamos
GET/POST    /api/reservations   # Reservas
GET         /api/history        # Historial
GET         /api/stats          # Estadísticas
```

## 💡 Características Técnicas

- ✅ Patrón Singleton en servicios
- ✅ Almacenamiento en memoria
- ✅ Sistema de multas: $500/día
- ✅ Validaciones completas
- ✅ Notificaciones visuales
- ✅ Sin errores de TypeScript/ESLint

## 📄 Documentación

- **README.md** - Este archivo (guía rápida)
- **DISEÑO_TECNICO.md** - Análisis técnico detallado

## 👨‍💻 Comandos

```bash
npm run dev      # Desarrollo
npm run build    # Producción
npm run start    # Servidor producción
npm run lint     # Linter
```

---

**Proyecto académico** - Curso de Estructuras de Datos
