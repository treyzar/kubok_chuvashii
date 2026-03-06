# Управление департаментами

## Обзор

Департаменты используются для разграничения доступа сотрудников к обращениям. Каждый сотрудник (кроме администратора) привязан к департаменту и видит только обращения своего департамента.

## Структура департаментов

По умолчанию в системе есть следующие департаменты:

1. ЖКХ (Жилищно-коммунальное хозяйство)
2. Транспорт
3. Экология
4. Благоустройство
5. Здравоохранение

## API

### GET /api/v1/admin/departments

Получить список всех департаментов.

**Response:**
```json
{
  "departments": [
    {
      "id": 1,
      "name": "ЖКХ"
    },
    {
      "id": 2,
      "name": "Транспорт"
    }
  ]
}
```

## Назначение департамента пользователю

### Через AdminPanel (UI)

1. Войти как администратор
2. Перейти в "Админ-панель"
3. Нажать "Создать пользователя" или редактировать существующего
4. Выбрать департамент из выпадающего списка
5. Сохранить

**Примечание:** Для администраторов департамент можно не указывать - они видят все обращения.

### Через API

**Создание пользователя:**
```bash
curl -X POST http://localhost:8888/api/v1/admin/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "role": "executor",
    "department_id": 1,
    "first_name": "Иван",
    "last_name": "Петров"
  }'
```

**Обновление пользователя:**
```bash
curl -X PATCH http://localhost:8888/api/v1/admin/users/{user_id} \
  -H "Content-Type: application/json" \
  -d '{
    "department_id": 2
  }'
```

## Проверка департаментов в БД

```bash
psql $GOOSE_DBSTRING -c "SELECT * FROM departments;"
```

Вывод:
```
 id |      name       
----+-----------------
  1 | ЖКХ
  2 | Транспорт
  3 | Экология
  4 | Благоустройство
  5 | Здравоохранение
```

## Добавление нового департамента

### Через SQL

```sql
INSERT INTO departments (name) VALUES ('Образование');
```

### Через API (если добавить endpoint)

Можно добавить endpoint для создания департаментов:

```go
// В category_handler.go
type CreateDepartmentRequest struct {
    Body struct {
        Name string `json:"name" minLength:"2" maxLength:"100"`
    }
}

func (h *CategoryHandler) CreateDepartment(ctx context.Context, req *CreateDepartmentRequest) (*CreateDepartmentResponse, error) {
    dept, err := h.Repo.CreateDepartment(ctx, req.Body.Name)
    if err != nil {
        return nil, err
    }
    return &CreateDepartmentResponse{Body: dept}, nil
}
```

## Логика фильтрации

### Администратор
- `department_id` может быть NULL
- Видит все обращения независимо от департамента
- SQL: `WHERE department_filter IS NULL` → все записи

### Сотрудник
- `department_id` обязателен
- Видит только обращения своего департамента
- SQL: `WHERE t.department_id = user.department_id`

## Примеры использования

### Создание сотрудника ЖКХ

```bash
go run scripts/create_test_users.go
# Создаст gkh@crm.local с department_id = 1
```

### Создание обращения для департамента

```bash
curl -X POST http://localhost:8888/api/v1/public/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Не работает лифт",
    "sender_name": "Иван Иванов",
    "sender_phone": "+79001234567",
    "longitude": 47.2357,
    "latitude": 56.1326,
    "subcategory_id": 1,
    "department_id": 1
  }'
```

### Проверка фильтрации

1. Войти как `gkh@crm.local`
2. Открыть список обращений
3. Проверить, что видны только обращения с `department_id = 1`

## Отображение департамента

### В списке пользователей
Департамент отображается в колонке "Департамент" в таблице пользователей.

### В списке обращений
Департамент отображается в карточке обращения.

### В профиле пользователя
Департамент показан в сайдбаре CRM (если нужно, можно добавить).

## Troubleshooting

### Пользователь не видит обращения
- Проверить, что у пользователя указан `department_id`
- Проверить, что обращения имеют соответствующий `department_id`
- Проверить роль пользователя (админ видит всё)

### Ошибка при создании пользователя без департамента
- Для не-админов департамент обязателен
- Для админов можно оставить пустым

### Департамент не отображается в списке
- Проверить, что департамент существует в БД
- Проверить API endpoint `/admin/departments`
- Проверить консоль браузера на ошибки загрузки
