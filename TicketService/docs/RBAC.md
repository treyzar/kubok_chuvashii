# Разграничение доступа по департаментам (RBAC)

## Обзор

Реализовано разграничение доступа на основе ролей и департаментов:
- **Администратор** (`admin`) - полный доступ ко всем обращениям
- **Сотрудники** (`executor`, `org`) - доступ только к обращениям своего департамента

## Архитектура

### Backend

#### Auth Context (`internal/auth_context.go`)
Хранит информацию о текущем пользователе в контексте запроса:
```go
type AuthUser struct {
    ID           uuid.UUID
    Email        string
    Role         repository.UserRole
    DepartmentID *int32
}
```

#### Auth Middleware (`internal/auth_middleware.go`)
- `AuthMiddleware` - извлекает user_id из заголовка `X-User-ID` и загружает пользователя из БД
- `RequireAuth` - требует авторизации (401 если нет пользователя)
- `RequireAdmin` - требует роль admin (403 если не админ)
- `DepartmentFilter` - возвращает фильтр департамента (nil для админа, department_id для остальных)
- `CanAccessTicket` - проверяет доступ к конкретному обращению

#### SQL Queries
Обновлены запросы для фильтрации по департаменту:

**GetTicket:**
```sql
WHERE t.id = $1 AND t.is_hidden = false AND t.is_deleted = false AND
  ($2::INTEGER IS NULL OR t.department_id = $2::INTEGER)
```

**ListTickets:**
```sql
WHERE
  t.is_hidden = false AND t.is_deleted = false AND
  ... AND
  ($6::INTEGER IS NULL OR t.department_id = $6::INTEGER)
```

#### Handlers
Обновлены handlers для применения фильтра:
```go
deptFilter := internal.DepartmentFilter(ctx)

tickets, err := h.Repo.ListTickets(ctx, repository.ListTicketsParams{
    // ... other params
    DepartmentFilter: deptFilter,
})
```

### Frontend

#### Auth Store (`frontend/src/store/auth.ts`)
Сохраняет `userId` после логина для отправки в заголовках.

#### API Client (`frontend/src/api/tickets.ts`)
Axios interceptor автоматически добавляет заголовок `X-User-ID`:
```typescript
axios.interceptors.request.use((config) => {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
        const { state } = JSON.parse(authStorage);
        if (state?.userId) {
            config.headers['X-User-ID'] = state.userId;
        }
    }
    return config;
});
```

## Логика работы

### Сценарий 1: Администратор
1. Админ логинится → получает `user_id`
2. При запросе обращений отправляется `X-User-ID: <admin_id>`
3. Middleware загружает пользователя, видит `role = admin`
4. `DepartmentFilter` возвращает `nil`
5. SQL запрос: `department_filter IS NULL` → видны все обращения

### Сценарий 2: Сотрудник ЖКХ
1. Сотрудник логинится → получает `user_id`
2. При запросе обращений отправляется `X-User-ID: <user_id>`
3. Middleware загружает пользователя, видит `department_id = 1` (ЖКХ)
4. `DepartmentFilter` возвращает `1`
5. SQL запрос: `t.department_id = 1` → видны только обращения ЖКХ

## Создание тестовых пользователей

```bash
cd TicketService
go run scripts/create_test_users.go
```

Создаст пользователей:
- `admin@crm.local` / `admin123` - Администратор (все департаменты)
- `gkh@crm.local` / `gkh123` - Сотрудник ЖКХ (department_id = 1)
- `transport@crm.local` / `transport123` - Сотрудник транспорта (department_id = 2)
- `ecology@crm.local` / `ecology123` - Сотрудник экологии (department_id = 3)

## Проверка работы

1. Создать тестовых пользователей
2. Создать обращения с разными департаментами
3. Войти как `gkh@crm.local` → видны только обращения ЖКХ
4. Войти как `admin@crm.local` → видны все обращения

## Безопасность

⚠️ Текущая реализация для демо:
- User ID передается в открытом виде в заголовке
- Нет проверки подлинности токена
- Можно подделать заголовок `X-User-ID`

Для production:
- Использовать JWT токены с подписью
- Проверять подпись токена в middleware
- Добавить rate limiting
- Логировать попытки доступа к чужим обращениям

## Расширение

### Добавление новых ролей
1. Добавить роль в enum `user_role` (миграция)
2. Обновить логику в `DepartmentFilter` если нужна особая логика
3. Обновить фронтенд для отображения роли

### Более сложные права
Можно добавить таблицу `permissions`:
```sql
CREATE TABLE permissions (
    user_id UUID REFERENCES users(id),
    department_id INT REFERENCES departments(id),
    can_read BOOLEAN,
    can_write BOOLEAN,
    can_delete BOOLEAN
);
```

И проверять права в middleware перед каждой операцией.
