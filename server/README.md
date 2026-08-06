# FRONT://FORGE — Backend

Бэкенд на Node.js + Express + SQLite для SAKURA://SENSEI.

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

| Метод  | URL                          | Описание                                | Требует auth |
| ------ | ---------------------------- | --------------------------------------- | ------------ |
| GET    | `/api/health`                | Health check                            | ❌            |
| POST   | `/api/register`              | Регистрация                             | ❌            |
| POST   | `/api/login`                 | Вход                                    | ❌            |
| GET    | `/api/me`                    | Информация о текущем пользователе       | ✅            |
| GET    | `/api/progress`              | Весь прогресс пользователя              | ✅            |
| POST   | `/api/progress/:lessonId`    | Отметить урок пройденным                | ✅            |
| DELETE | `/api/progress/:lessonId`    | Сбросить урок                           | ✅            |
| GET    | `/api/stats`                 | Статистика (сколько уроков, последний)  | ✅            |

## Безопасность

⚠️ **Только для локальной сети!** В продакшене нужно:
- Закрыть CORS
- Добавить rate limiting
- HTTPS
- Сложный JWT_SECRET в env
