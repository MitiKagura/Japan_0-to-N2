# FRONT://FORGE — Backend

Бэкенд на Node.js + Express + SQLite для интерактивного учебника.

## Возможности

- 📝 Регистрация и вход (bcrypt для хэширования паролей)
- 🔐 JWT-токены (срок жизни 30 дней)
- 💾 SQLite база (создаётся автоматически в `database.db`)
- 📊 Прогресс по урокам (какие пройдены, с каким счётом)
- 🌐 CORS открыт для всех (для LAN-разработки)

## Установка

```bash
cd server
npm install
```

## Запуск

```bash
# Обычный запуск
npm start

# С автоперезагрузкой при изменении кода
npm run dev
```

Сервер слушает на `http://0.0.0.0:3001` — будет доступен со всех устройств в локальной сети.

## API

| Метод | URL | Описание | Требует auth |
|---|---|---|---|
| GET | `/api/health` | Health check | ❌ |
| POST | `/api/register` | Регистрация (`username`, `email`, `password`, `display_name?`) | ❌ |
| POST | `/api/login` | Вход (`username` или `email`, `password`) | ❌ |
| GET | `/api/me` | Инфо о текущем пользователе | ✅ |
| GET | `/api/progress` | Весь прогресс пользователя | ✅ |
| POST | `/api/progress/:lessonId` | Отметить урок пройденным (`{score: 0-100}`) | ✅ |
| DELETE | `/api/progress/:lessonId` | Сбросить урок | ✅ |
| GET | `/api/stats` | Статистика (сколько уроков, последний) | ✅ |

### Примеры

```bash
# Регистрация
curl -X POST http://localhost:3001/api/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alex","email":"a@x.com","password":"secret123","display_name":"Алекс"}'

# Логин
curl -X POST http://localhost:3001/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"alex","password":"secret123"}'

# Прогресс (с токеном)
curl http://localhost:3001/api/progress \
  -H "Authorization: Bearer <token>"

# Отметить урок пройденным
curl -X POST http://localhost:3001/api/progress/html-intro \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"score": 90}'
```

## Конфигурация

Через `.env`:

```env
PORT=3001
JWT_SECRET=your-secret-key   # опционально, иначе генерируется
```

## Безопасность

⚠️ **Только для локальной сети!** В продакшене нужно:
- Закрыть CORS
- Добавить rate limiting
- HTTPS
- Сложный JWT_SECRET в env

## Файлы

- `server.js` — основной сервер
- `database.db` — SQLite база (создаётся при первом запуске)
- `.jwt_secret` — авто-сгенерированный секрет (не удаляй, иначе все токены сбросятся)
