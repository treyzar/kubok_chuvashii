# 🏗️ Архитектура системы

## 📐 Общая архитектура

```
┌─────────────────────────────────────────────────────────────────┐
│                     Пользовательский слой                        │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Граждане   │  │  Сотрудники  │  │Администраторы│         │
│  │  (Публичная  │  │     CRM      │  │  (Админка)   │         │
│  │    форма)    │  │              │  │              │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                 │                  │                  │
└─────────┼─────────────────┼──────────────────┼──────────────────┘
          │                 │                  │
          └─────────────────┴──────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (React + TypeScript)                 │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Presentation Layer                     │  │
│  │  • Pages (PublicForm, Dashboard, AppealsList, etc.)      │  │
│  │  • Layouts (CRMLayout, PublicLayout)                     │  │
│  │  • Components (UI, Forms, Maps, Charts)                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Business Logic Layer                   │  │
│  │  • Features (FSD architecture)                            │  │
│  │  • Entities (Appeal, User, Category)                     │  │
│  │  • Shared (Hooks, Utils, UI Kit)                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Data Access Layer                      │  │
│  │  • API Clients (Axios)                                    │  │
│  │  • State Management (React Context/Hooks)                │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP/REST
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend (Go + Gin + Huma)                     │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    API Layer (Huma v2)                    │  │
│  │  • OpenAPI 3.1 Auto-generation                            │  │
│  │  • Request/Response Validation                            │  │
│  │  • Swagger UI                                             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Middleware Layer                       │  │
│  │  • Authentication (X-User-ID → JWT planned)               │  │
│  │  • Authorization (RBAC by department)                     │  │
│  │  • CORS                                                   │  │
│  │  • Logging                                                │  │
│  │  • Error Handling                                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Handler Layer                          │  │
│  │  • TicketHandler (CRUD, Search, Merge)                    │  │
│  │  • AuthHandler (Login, Logout)                            │  │
│  │  • AdminHandler (User Management)                         │  │
│  │  • StatisticsHandler (Analytics)                          │  │
│  │  • HeatmapHandler (Geo data)                              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Service Layer                          │  │
│  │  • Business Logic                                         │  │
│  │  • Transaction Management                                 │  │
│  │  • AI Embeddings Integration                              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Repository Layer (sqlc)                │  │
│  │  • Type-safe SQL queries                                  │  │
│  │  • Auto-generated from SQL                                │  │
│  │  • Transaction support                                    │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┬────────────────┐
        │                │                │                │
        ▼                ▼                ▼                ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ PostgreSQL  │  │    Redis    │  │   Ollama    │  │   PostGIS   │
│  Database   │  │    Cache    │  │ AI Embeddings│ │  Geo Engine │
│             │  │             │  │             │  │             │
│ • pgvector  │  │ • Sessions  │  │ • 768D      │  │ • Heatmaps  │
│ • PostGIS   │  │ • Cache     │  │   vectors   │  │ • Spatial   │
│ • ACID      │  │ • Pub/Sub   │  │ • Semantic  │  │   queries   │
│             │  │             │  │   search    │  │             │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
```

---

## 🎯 Ключевые компоненты

### 1. Frontend (React + TypeScript)

#### Структура (Feature-Sliced Design)

```
frontend/src/
├── app/                    # Инициализация приложения
├── pages/                  # Страницы
│   ├── PublicForm.tsx      # Публичная форма
│   └── crm/                # CRM-система
│       ├── Dashboard.tsx   # Дашборд
│       ├── AppealsList.tsx # Список обращений
│       └── AppealDetail.tsx# Детали обращения
├── entities/               # Бизнес-сущности
│   ├── appeal/             # Обращения
│   ├── user/               # Пользователи
│   └── category/           # Категории
├── features/               # Фичи
├── shared/                 # Общие компоненты
│   ├── ui/                 # UI Kit
│   ├── hooks/              # Хуки
│   └── lib/                # Утилиты
└── layouts/                # Лейауты
```

#### Технологии

- **React 18** - UI библиотека
- **TypeScript** - Типизация
- **Vite** - Сборщик
- **React Router v6** - Роутинг
- **Tailwind CSS** - Стили
- **shadcn/ui** - UI компоненты
- **Leaflet** - Карты
- **Axios** - HTTP клиент
- **React Hook Form** - Формы
- **Zod** - Валидация

---

### 2. Backend (Go + Gin + Huma)

#### Структура

```
TicketService/
├── services/api/           # Точка входа
│   └── main.go             # Инициализация сервера
├── handlers/               # HTTP обработчики
│   ├── tickets.go          # CRUD обращений
│   ├── auth.go             # Авторизация
│   ├── admin_users.go      # Управление пользователями
│   ├── statistics.go       # Статистика
│   └── heatmap.go          # Тепловая карта
├── internal/               # Внутренние пакеты
│   ├── auth_middleware.go  # Middleware авторизации
│   ├── auth_context.go     # Контекст пользователя
│   ├── config.go           # Конфигурация
│   ├── database.go         # Подключение к БД
│   └── embeddings/         # AI эмбеддинги
│       └── embed.go        # Интеграция с Ollama
├── repository/             # Сгенерированный код (sqlc)
│   ├── db.go               # Интерфейс БД
│   ├── models.go           # Модели
│   ├── tickets.sql.go      # Запросы обращений
│   ├── users.sql.go        # Запросы пользователей
│   └── ...
├── db/
│   ├── migrations/         # SQL миграции (goose)
│   └── queries/            # SQL запросы (sqlc)
└── mock/                   # Генерация тестовых данных
```

#### Технологии

- **Go 1.25.5** - Язык программирования
- **Gin** - HTTP фреймворк
- **Huma v2** - OpenAPI генерация
- **pgx/v5** - PostgreSQL драйвер
- **sqlc** - Type-safe SQL
- **goose** - Миграции
- **bcrypt** - Хеширование паролей

---

### 3. База данных (PostgreSQL)

#### Схема данных

```sql
-- Основные таблицы
tickets (
    id UUID PRIMARY KEY,
    description TEXT,
    status ticket_status,
    subcategory_id INTEGER,
    department_id INTEGER,
    embedding vector(768),  -- AI эмбеддинги
    created_at TIMESTAMP,
    is_hidden BOOLEAN,
    is_deleted BOOLEAN
)

complaint_details (
    id SERIAL PRIMARY KEY,
    ticket UUID REFERENCES tickets,
    description TEXT,
    sender_name VARCHAR,
    sender_phone VARCHAR,
    sender_email VARCHAR,
    address VARCHAR,
    geo_location GEOGRAPHY(POINT)  -- PostGIS
)

users (
    id UUID PRIMARY KEY,
    email VARCHAR UNIQUE,
    password_hash VARCHAR,
    role user_role,
    status user_status,
    department_id INTEGER,
    first_name VARCHAR,
    last_name VARCHAR,
    middle_name VARCHAR
)

ticket_history (
    id SERIAL PRIMARY KEY,
    ticket_id UUID REFERENCES tickets,
    action history_action,
    old_value JSONB,
    new_value JSONB,
    description TEXT,
    created_at TIMESTAMP
)

comments (
    id SERIAL PRIMARY KEY,
    ticket UUID REFERENCES tickets,
    message TEXT,
    author VARCHAR,
    created_at TIMESTAMP
)

-- Справочники
categories, subcategories, departments, tags, sources
```

#### Расширения

- **pgvector** - Векторный поиск для AI
- **PostGIS** - Географические данные
- **uuid-ossp** - Генерация UUID

#### Индексы

```sql
-- Производительность
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_department ON tickets(department_id);
CREATE INDEX idx_tickets_created_at ON tickets(created_at DESC);

-- Векторный поиск
CREATE INDEX idx_tickets_embedding ON tickets 
USING ivfflat (embedding vector_cosine_ops);

-- Географический поиск
CREATE INDEX idx_complaint_details_geo ON complaint_details 
USING GIST (geo_location);
```

---

## 🔄 Потоки данных

### 1. Создание обращения

```
Гражданин → Публичная форма → POST /api/v1/public/tickets
                                      ↓
                              TicketHandler.Post()
                                      ↓
                              1. Извлечь адрес из описания
                              2. Создать AI эмбеддинг (Ollama)
                              3. Сохранить в БД (transaction)
                              4. Создать complaint_details
                              5. Создать history entry
                                      ↓
                              Response с ID обращения
```

### 2. Поиск дубликатов

```
Сотрудник → Открывает обращение → GET /api/v1/tickets/{id}/similar
                                          ↓
                                  TicketHandler.GetSimilar()
                                          ↓
                                  1. Получить эмбеддинг обращения
                                  2. Векторный поиск (pgvector)
                                  3. Косинусное сходство > 70%
                                  4. Сортировка по схожести
                                          ↓
                                  Response с похожими обращениями
```

### 3. Авторизация и доступ

```
Пользователь → Вход → POST /api/v1/auth/login
                              ↓
                      AuthHandler.Login()
                              ↓
                      1. Проверить email
                      2. Проверить пароль (bcrypt)
                      3. Загрузить department_id
                              ↓
                      Response с user_id
                              ↓
Frontend сохраняет в localStorage
                              ↓
Все запросы → Header: X-User-ID
                              ↓
                      AuthMiddleware
                              ↓
                      1. Извлечь user_id
                      2. Загрузить пользователя из БД
                      3. Проверить роль и департамент
                      4. Добавить в контекст
                              ↓
                      Handler получает AuthUser из контекста
                              ↓
                      Фильтрация по department_id
```

---

## 🤖 AI-детекция дубликатов

### Архитектура

```
Текст обращения
      ↓
"Нет отопления в доме на улице Ленина 45"
      ↓
Ollama API (nomic-embed-text-v2-moe)
      ↓
768-мерный вектор
[0.123, -0.456, 0.789, ..., 0.321]
      ↓
PostgreSQL (pgvector)
      ↓
Косинусное сходство с другими векторами
      ↓
Похожие обращения (similarity > 70%)
```

### Реализация

```go
// 1. Генерация эмбеддинга
func GetEmbedding(text string) (*pgvector.Vector, error) {
    resp, err := http.Post(
        "http://localhost:11434/api/embeddings",
        "application/json",
        bytes.NewBuffer(payload),
    )
    // ... обработка ответа
    return pgvector.NewVector(embedding), nil
}

// 2. Поиск похожих
-- SQL запрос
SELECT
    t.id,
    t.description,
    (1 - (t.embedding <=> target.embedding))::FLOAT AS similarity_score
FROM tickets t
CROSS JOIN (SELECT embedding FROM tickets WHERE id = $1) AS target
WHERE t.id != $1
  AND (1 - (t.embedding <=> target.embedding)) > 0.70
ORDER BY similarity_score DESC
LIMIT 10;
```

---

## 🗺️ Географическая система

### PostGIS интеграция

```sql
-- Сохранение координат
INSERT INTO complaint_details (geo_location)
VALUES (ST_GeogFromText('POINT(47.2501 56.1324)'));

-- Поиск ближайших обращений
SELECT *
FROM complaint_details
WHERE ST_DWithin(
    geo_location,
    ST_GeogFromText('POINT(47.2501 56.1324)'),
    1000  -- 1 км
);

-- Тепловая карта
SELECT
    ST_X(geo_location::geometry) AS lng,
    ST_Y(geo_location::geometry) AS lat,
    COUNT(*) AS count
FROM complaint_details
GROUP BY geo_location;
```

---

## 🔐 Безопасность

### Уровни защиты

```
1. Frontend
   ├── Input validation (Zod)
   ├── XSS protection (React auto-escape)
   └── CSRF protection (CORS)

2. Backend
   ├── Authentication (bcrypt passwords)
   ├── Authorization (RBAC by department)
   ├── SQL Injection (parameterized queries)
   └── Rate limiting (planned)

3. Database
   ├── Row-level security (planned)
   ├── Encrypted connections
   └── Regular backups
```

---

## 📊 Мониторинг и логирование

### Метрики

```
API Metrics:
- Request count
- Response time (p50, p95, p99)
- Error rate
- Active connections

Database Metrics:
- Query performance
- Connection pool usage
- Cache hit rate
- Disk usage

Business Metrics:
- Appeals per day
- Average resolution time
- Duplicate detection rate
- Department efficiency
```

---

## 🚀 Масштабирование

### Горизонтальное

```
Load Balancer (nginx)
        │
    ┌───┴───┬───────┬───────┐
    │       │       │       │
   API    API    API    API
  Server Server Server Server
    │       │       │       │
    └───┬───┴───────┴───────┘
        │
   PostgreSQL
   (Primary + Replicas)
```

### Вертикальное

- Увеличение ресурсов серверов
- Оптимизация запросов
- Кэширование (Redis)
- CDN для статики

---

## 📈 Производительность

### Оптимизации

1. **Database**
   - Connection pooling
   - Prepared statements
   - Индексы на всех FK
   - Materialized views для статистики

2. **Backend**
   - Goroutines для параллельных операций
   - Batch операции
   - Redis кэширование

3. **Frontend**
   - Code splitting
   - Lazy loading
   - Image optimization
   - Service Worker (planned)

---

## 🔄 CI/CD Pipeline (Planned)

```
GitHub Push
    ↓
GitHub Actions
    ↓
┌─────────────────┐
│ 1. Lint & Test  │
│   - golangci-lint│
│   - go test      │
│   - npm test     │
└────────┬────────┘
         ↓
┌─────────────────┐
│ 2. Build        │
│   - Docker build │
│   - Tag image    │
└────────┬────────┘
         ↓
┌─────────────────┐
│ 3. Deploy       │
│   - Push to     │
│     registry    │
│   - Update k8s  │
└─────────────────┘
```

---

**Документация**: [README.md](README.md) • [API Reference](TicketService/docs/API_REFERENCE.md)
