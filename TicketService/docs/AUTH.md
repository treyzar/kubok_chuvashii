# Авторизация сотрудников CRM

## Обзор

Реализована простая авторизация по email + пароль для сотрудников CRM. Пользователи создаются администратором в AdminPanel, регистрация отсутствует.

## Backend

### Миграция
- `007_add_password_hash.sql` - добавляет колонку `password_hash` в таблицу `users`

### API Endpoints

#### POST /api/v1/auth/login
Вход в систему

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "admin",
    "status": "active",
    "first_name": "Иван",
    "last_name": "Иванов",
    "middle_name": "Иванович",
    "department_id": 1
  },
  "user_id": "uuid-string"
}
```

**Note:** `user_id` используется для заголовка `X-User-ID` в последующих запросах.

**Errors:**
- 400: Invalid email or password
- 400: Password not set for this user

### Создание пользователя с паролем

В AdminPanel при создании пользователя можно указать пароль (необязательно):

**POST /api/v1/admin/users**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "role": "executor",
  "first_name": "Иван",
  "last_name": "Иванов"
}
```

Пароль хэшируется с помощью bcrypt перед сохранением.

## Frontend

### Структура

- `src/store/auth.ts` - Zustand store для управления авторизацией
- `src/pages/crm/Login.tsx` - Страница входа
- `src/components/ProtectedRoute.tsx` - HOC для защиты маршрутов
- `src/layouts/CRMLayout.tsx` - Обновлен для отображения ФИО и кнопки выхода

### Хранение сессии

Данные пользователя хранятся в localStorage через Zustand persist middleware. Это простое решение для демо, без JWT токенов.

### Использование

```typescript
import { useAuthStore } from '@/store/auth';

// В компоненте
const user = useAuthStore((state) => state.user);
const userId = useAuthStore((state) => state.userId);
const login = useAuthStore((state) => state.login);
const logout = useAuthStore((state) => state.logout);
const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
const getFullName = useAuthStore((state) => state.getFullName());

// Вход
await login('user@example.com', 'password123');

// Выход
logout();
```

### API Requests с авторизацией

Axios interceptor автоматически добавляет заголовок `X-User-ID` ко всем запросам:

```typescript
// В api/tickets.ts
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

Backend использует этот заголовок для определения текущего пользователя и применения фильтров доступа.

### Защищенные маршруты

Все маршруты `/crm/*` (кроме `/crm/login`) защищены через `ProtectedRoute`. При попытке доступа без авторизации происходит редирект на `/crm/login`.

## Проверка работы

1. Применить миграцию: `make migrate`
2. Создать тестовых пользователей: `go run scripts/create_test_users.go`
3. Запустить бэкенд: `make serve`
4. Запустить фронтенд: `npm run dev`
5. Открыть `/crm` - должен произойти редирект на `/crm/login`
6. Войти как `admin@crm.local` / `admin123` - видны все обращения
7. Войти как `gkh@crm.local` / `gkh123` - видны только обращения ЖКХ
8. Проверить отображение ФИО в сайдбаре
9. Нажать "Выйти" - должен произойти редирект на логин

## Разграничение доступа

См. [RBAC.md](./RBAC.md) для подробной информации о разграничении доступа по департаментам.

## Безопасность

⚠️ Это базовая реализация для демо:
- Нет JWT токенов
- Нет refresh tokens
- Нет защиты от CSRF
- Сессия хранится в localStorage (уязвимо к XSS)

Для production рекомендуется:
- Использовать JWT с httpOnly cookies
- Добавить refresh tokens
- Реализовать CSRF защиту
- Добавить rate limiting на login endpoint
- Логировать попытки входа
