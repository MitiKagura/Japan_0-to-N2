# 🔥 FRONT://FORGE — Полная инструкция

Интерактивный учебник по веб-разработке с **бэкендом**, **регистрацией** и **сохранением прогресса** в SQLite.

## 📁 Структура

```
.
├── client/         ← React + Vite (фронтенд)
└── server/         ← Node.js + Express + SQLite (бэкенд)
```

Корневой `package.json` — для фронта. Внутри `server/` — свой для бэка.

## 🚀 Быстрый старт (Arch/CachyOS)

### 1. Запусти бэкенд

```bash
cd server
npm install
npm start
```

Должно появиться:
```
🔑 Сгенерирован новый JWT-секрет
🔥 FRONT://FORGE backend running on http://0.0.0.0:3001
   Database: /path/to/server/database.db
```

Сервер слушает на **порту 3001**, доступен со всех устройств в локальной сети.

### 2. Запусти фронтенд (в ДРУГОМ терминале)

```bash
# Из корня проекта (не из server/)
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```

Открой: `http://localhost:5173` (или `http://<IP>:5173` с телефона).

### 3. Открой порт бэкенда (если включён firewall)

```bash
# ufw
sudo ufw allow 3001/tcp

# firewalld
sudo firewall-cmd --add-port=3001/tcp --permanent
sudo firewall-cmd --reload
```

### 4. Скажи фронту, где бэкенд (если не localhost)

Создай `.env` в корне:
```env
VITE_API_URL=http://192.168.1.42:3001/api
```

Или для разработки можно оставить дефолт (`http://localhost:3001/api`).

## 👤 Что умеет бэкенд

- 📝 **Регистрация** (username, email, password, display_name)
- 🔐 **Вход** (username или email + пароль)
- 🎫 **JWT-токены** на 30 дней (хранятся в localStorage на фронте)
- 💾 **SQLite база** — создаётся автоматически в `server/database.db`
- 📊 **Прогресс** — какой урок пройден и с каким счётом
- 🔄 **Сброс урока** — `DELETE /api/progress/:lessonId`
- 🌐 **CORS** открыт для всех (для LAN-разработки)

## 🔐 Безопасность

⚠️ **Только для локальной сети и обучения!** В продакшене:
- Закрой CORS (укажи домен фронта)
- HTTPS + reverse proxy
- Сложный JWT_SECRET в env
- Rate limiting
- Helmet middleware

## 📊 API Reference

| Метод | URL | Тело | Описание |
|---|---|---|---|
| GET | `/api/health` | — | Проверка что сервер жив |
| POST | `/api/register` | `{username, email, password, display_name?}` | Регистрация → `{token, user}` |
| POST | `/api/login` | `{username, password}` | Вход → `{token, user}` |
| GET | `/api/me` | — | Инфо о себе (требует `Authorization: Bearer ...`) |
| GET | `/api/progress` | — | `{progress: {lessonId: {score, completed_at}}}` |
| POST | `/api/progress/:lessonId` | `{score: 0-100}` | Отметить урок |
| DELETE | `/api/progress/:lessonId` | — | Сбросить урок |
| GET | `/api/stats` | — | Сколько уроков пройдено, когда последний |

## 🛠️ Типичные команды

```bash
# Перезапустить бэк (после изменений)
cd server
# Ctrl+C, потом снова:
npm start

# Или с авто-перезагрузкой:
npm run dev

# Посмотреть базу (sqlite3 CLI)
sudo pacman -S sqlite
sqlite3 server/database.db
sqlite> SELECT * FROM users;
sqlite> SELECT * FROM progress;
sqlite> .quit

# Удалить всю базу (начать с чистого листа)
rm server/database.db server/.jwt_secret
```
