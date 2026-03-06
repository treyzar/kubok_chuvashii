# 🚀 Быстрый старт системы обращений граждан

## Что реализовано

✅ Авторизация сотрудников CRM (email + пароль)  
✅ Разграничение доступа по департаментам (RBAC)  
✅ Публичная форма с валидацией и масками  
✅ Поле адреса вместо геолокации  
✅ Админ-панель с управлением пользователями  
✅ Выбор департамента при создании пользователя  

## Запуск системы

### 1. База данных

```bash
cd TicketService
make databases
sleep 3
```

### 2. Миграции

```bash
make migrate
```

Применит все миграции включая:
- Создание таблиц
- Добавление password_hash
- Добавление поля address

### 3. Тестовые пользователи

```bash
go run scripts/create_test_users.go
```

Создаст:
- **admin@crm.local** / admin123 (Администратор - видит всё)
- **gkh@crm.local** / gkh123 (ЖКХ - только обращения ЖКХ)
- **transport@crm.local** / transport123 (Транспорт)
- **ecology@crm.local** / ecology123 (Экология)

### 4. Запуск бэкенда

```bash
make serve
```

API: http://localhost:8888

### 5. Запуск фронтенда

В новом терминале:

```bash
cd frontend
npm install  # если ещё не установлено
npm run dev
```

Фронтенд: http://localhost:3000

## Тестирование

### Публичная форма

1. Открыть http://localhost:3000
2. Заполнить форму:
   - Категория и подкатегория
   - **Адрес** (минимум 10 символов)
   - Описание (минимум 20 символов)
   - ФИО (минимум 3 символа, только буквы)
   - Телефон (автоматическая маска: +7 (XXX) XXX-XX-XX)
3. Отправить обращение

### Вход в CRM

1. Открыть http://localhost:3000/crm/login
2. Войти как **admin@crm.local** / **admin123**
3. Проверить:
   - Видны все обращения
   - Дашборд показывает общую статистику
   - Можно создавать пользователей в Админ-панели

### Проверка разграничения доступа

1. Выйти из системы
2. Войти как **gkh@crm.local** / **gkh123**
3. Проверить:
   - Видны ТОЛЬКО обращения ЖКХ (department_id = 1)
   - Статистика только по ЖКХ
   - В профиле показан департамент

### Создание нового пользователя

1. Войти как администратор
2. Перейти в "Админ-панель"
3. Нажать "Создать пользователя"
4. Заполнить:
   - Email
   - Пароль (минимум 6 символов)
   - ФИО
   - Роль
   - **Департамент** (выбрать из списка)
5. Сохранить

## Структура департаментов

| ID | Название |
|----|----------|
| 1  | ЖКХ |
| 2  | Транспорт |
| 3  | Экология |
| 4  | Благоустройство |
| 5  | Здравоохранение |

## Проверка в базе данных

```bash
# Список пользователей с департаментами
psql postgres://admin:password@localhost:5432/tickets_db -c "
SELECT email, role, department_id, 
       (SELECT name FROM departments WHERE id = users.department_id) as dept
FROM users;
"

# Обращения по департаментам
psql postgres://admin:password@localhost:5432/tickets_db -c "
SELECT id, LEFT(description, 50) as desc, department_id,
       (SELECT name FROM departments WHERE id = t.department_id) as dept
FROM tickets t
WHERE is_deleted = false
LIMIT 10;
"
```

## Документация

- **TicketService/docs/AUTH.md** - Авторизация
- **TicketService/docs/RBAC.md** - Разграничение доступа
- **TicketService/docs/DEPARTMENTS.md** - Управление департаментами
- **TicketService/TESTING_RBAC.md** - Тестирование RBAC
- **frontend/FORM_VALIDATION.md** - Валидация формы

## Troubleshooting

### Ошибка компиляции Go

```bash
cd TicketService
go mod tidy
make serve
```

### Ошибка подключения к БД

```bash
# Проверить, что контейнеры запущены
docker ps

# Перезапустить
make databases-down
make databases
sleep 3
make migrate
```

### Фронтенд не запускается

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Не видны обращения после входа

1. Проверить заголовок X-User-ID в DevTools → Network
2. Проверить department_id пользователя в БД
3. Проверить department_id обращений в БД

## API Endpoints

### Публичные
- `POST /api/v1/public/tickets` - Создать обращение
- `GET /api/v1/public/categories` - Получить категории

### Авторизация
- `POST /api/v1/auth/login` - Вход в систему

### CRM (требуется X-User-ID)
- `GET /api/v1/tickets` - Список обращений (с фильтром по департаменту)
- `GET /api/v1/tickets/{id}` - Детали обращения
- `PATCH /api/v1/tickets/{id}` - Обновить обращение

### Админ
- `GET /api/v1/admin/users` - Список пользователей
- `POST /api/v1/admin/users` - Создать пользователя
- `PATCH /api/v1/admin/users/{id}` - Обновить пользователя
- `GET /api/v1/admin/departments` - Список департаментов

## Контакты

Для вопросов и предложений создайте issue в репозитории.
