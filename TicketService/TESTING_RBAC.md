# Тестирование разграничения доступа по департаментам

## Подготовка

1. Применить все миграции:
```bash
cd TicketService
make migrate
```

2. Создать тестовых пользователей:
```bash
go run scripts/create_test_users.go
```

Будут созданы:
- `admin@crm.local` / `admin123` - Администратор (видит всё)
- `gkh@crm.local` / `gkh123` - Сотрудник ЖКХ (department_id = 1)
- `transport@crm.local` / `transport123` - Сотрудник транспорта (department_id = 2)
- `ecology@crm.local` / `ecology123` - Сотрудник экологии (department_id = 3)

3. Запустить бэкенд:
```bash
make serve
```

4. Запустить фронтенд (в другом терминале):
```bash
cd ../frontend
npm run dev
```

## Создание тестовых обращений

Создайте обращения с разными департаментами через публичную форму или API:

```bash
# Обращение для ЖКХ (department_id = 1)
curl -X POST http://localhost:8888/api/v1/public/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Не работает лифт\n\nАдрес: г. Чебоксары, ул. Ленина, д. 1",
    "sender_name": "Иван Иванов",
    "sender_phone": "79001234567",
    "longitude": 47.2357,
    "latitude": 56.1326,
    "subcategory_id": 1,
    "department_id": 1
  }'

# Обращение для транспорта (department_id = 2)
curl -X POST http://localhost:8888/api/v1/public/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Яма на дороге\n\nАдрес: г. Чебоксары, ул. Гагарина, д. 10",
    "sender_name": "Петр Петров",
    "sender_phone": "79009876543",
    "longitude": 47.2357,
    "latitude": 56.1326,
    "subcategory_id": 5,
    "department_id": 2
  }'

# Обращение для экологии (department_id = 3)
curl -X POST http://localhost:8888/api/v1/public/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Незаконная свалка\n\nАдрес: г. Чебоксары, ул. Лесная, д. 5",
    "sender_name": "Мария Сидорова",
    "sender_phone": "79005551234",
    "longitude": 47.2357,
    "latitude": 56.1326,
    "subcategory_id": 8,
    "department_id": 3
  }'
```

## Тестирование доступа

### Тест 1: Администратор видит всё

1. Открыть http://localhost:3000/crm/login
2. Войти: `admin@crm.local` / `admin123`
3. Перейти в "Обращения"
4. **Ожидаемый результат:** Видны ВСЕ обращения (ЖКХ, транспорт, экология)

### Тест 2: Сотрудник ЖКХ видит только ЖКХ

1. Выйти из системы
2. Войти: `gkh@crm.local` / `gkh123`
3. Перейти в "Обращения"
4. **Ожидаемый результат:** Видны ТОЛЬКО обращения с department_id = 1 (ЖКХ)

### Тест 3: Сотрудник транспорта видит только транспорт

1. Выйти из системы
2. Войти: `transport@crm.local` / `transport123`
3. Перейти в "Обращения"
4. **Ожидаемый результат:** Видны ТОЛЬКО обращения с department_id = 2 (транспорт)

### Тест 4: Проверка через API

```bash
# Получить user_id для сотрудника ЖКХ
RESPONSE=$(curl -s -X POST http://localhost:8888/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"gkh@crm.local","password":"gkh123"}')

USER_ID=$(echo $RESPONSE | jq -r '.user_id')

# Запросить обращения с этим user_id
curl -X GET "http://localhost:8888/api/v1/tickets?limit=50" \
  -H "X-User-ID: $USER_ID" | jq '.tickets[] | {id, department_id}'
```

**Ожидаемый результат:** Все обращения имеют `department_id: 1`

### Тест 5: Дашборд и статистика

1. Войти как сотрудник ЖКХ
2. Перейти на "Дашборд"
3. **Ожидаемый результат:** Статистика показывает только обращения ЖКХ

4. Войти как администратор
5. Перейти на "Дашборд"
6. **Ожидаемый результат:** Статистика показывает все обращения

### Тест 6: Тепловая карта

1. Войти как сотрудник транспорта
2. Перейти на "Тепловая карта"
3. **Ожидаемый результат:** На карте только точки обращений транспорта

## Проверка в базе данных

```bash
# Проверить департаменты пользователей
psql $GOOSE_DBSTRING -c "
SELECT email, role, department_id, 
       (SELECT name FROM departments WHERE id = users.department_id) as dept_name
FROM users 
ORDER BY role, department_id;
"

# Проверить обращения по департаментам
psql $GOOSE_DBSTRING -c "
SELECT t.id, t.description, t.department_id,
       (SELECT name FROM departments WHERE id = t.department_id) as dept_name
FROM tickets t
WHERE t.is_deleted = false
ORDER BY t.department_id, t.created_at DESC
LIMIT 20;
"
```

## Отладка

### Проверить заголовок X-User-ID

1. Открыть DevTools → Network
2. Выполнить запрос к `/api/v1/tickets`
3. Проверить Request Headers → должен быть `X-User-ID: <uuid>`

### Проверить фильтрацию в SQL

Добавить логирование в handler:
```go
deptFilter := internal.DepartmentFilter(ctx)
log.Printf("Department filter: %v", deptFilter)
```

### Проверить middleware

Убедиться, что middleware применяется:
```go
// В main.go
r.Use(internal.AuthMiddleware(repo))
```

## Ожидаемое поведение

| Пользователь | Роль | Department ID | Видит обращения |
|--------------|------|---------------|-----------------|
| admin@crm.local | admin | NULL | Все |
| gkh@crm.local | executor | 1 | Только ЖКХ (dept_id=1) |
| transport@crm.local | executor | 2 | Только транспорт (dept_id=2) |
| ecology@crm.local | executor | 3 | Только экология (dept_id=3) |

## Troubleshooting

### Сотрудник не видит обращения
- Проверить, что у пользователя указан `department_id`
- Проверить, что обращения имеют соответствующий `department_id`
- Проверить заголовок `X-User-ID` в запросах

### Видны чужие обращения
- Проверить, что middleware применяется
- Проверить логи бэкенда
- Проверить SQL-запросы с фильтром

### Администратор не видит все обращения
- Проверить, что `department_id` у админа NULL
- Проверить роль пользователя в БД
