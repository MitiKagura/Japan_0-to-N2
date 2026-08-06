// server/server.js
// Бэкенд для SAKURA://SENSEI : регистрация, JWT, прогресс в SQLite
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import Database from 'better-sqlite3';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// === Конфиг ===
// Порт задаётся здесь. Меняй на свой (5007, 5003 и т.д.) или через env: PORT=5007 npm start
const PORT = process.env.PORT || 5013;

// Генерируем секрет при первом запуске — ДО чтения
const SECRET_FILE = path.join(__dirname, '.jwt_secret');
if (!fs.existsSync(SECRET_FILE)) {
  const secret = crypto.randomBytes(48).toString('hex');
  fs.writeFileSync(SECRET_FILE, secret);
  console.log('🔑 Сгенерирован новый JWT-секрет');
}
const JWT_SECRET = process.env.JWT_SECRET || fs.readFileSync(SECRET_FILE, 'utf8').trim();

// === База данных ===
const db = new Database(path.join(__dirname, 'database.db'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    display_name TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    lesson_id TEXT NOT NULL,
    score INTEGER DEFAULT 0,
    completed_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, lesson_id),
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE INDEX IF NOT EXISTS idx_progress_user ON progress(user_id);
`);

const app = express();
app.use(cors());
app.use(express.json({ limit: '64kb' }));
app.use((req,_res,next)=>{ console.log(`${new Date().toISOString()} ${req.method} ${req.url}`); next(); });

const findUserByUsername = db.prepare('SELECT * FROM users WHERE username = ?');
const findUserByEmail = db.prepare('SELECT * FROM users WHERE email = ?');
const insertUser = db.prepare(`INSERT INTO users (username, email, password_hash, display_name) VALUES (?, ?, ?, ?)`);
const insertProgress = db.prepare(`INSERT OR REPLACE INTO progress (user_id, lesson_id, score, completed_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)`);
const deleteProgress = db.prepare('DELETE FROM progress WHERE user_id = ? AND lesson_id = ?');
const getUserProgress = db.prepare('SELECT lesson_id, score, completed_at FROM progress WHERE user_id = ?');

const authMiddleware=(req,res,next)=>{
  const header=req.headers.authorization;
  if(!header || !header.startsWith('Bearer ')) return res.status(401).json({error:'Требуется авторизация'});
  const token=header.slice(7);
  try{ const payload=jwt.verify(token,JWT_SECRET); req.userId=payload.id; req.username=payload.username; next(); }
  catch(e){ return res.status(401).json({error:'Невалидный или просроченный токен'}); }
};
const validateRegister=(body)=>{
  const errors=[];
  if(!body.username || typeof body.username!=='string') errors.push('username обязателен');
  else if(!/^[a-zA-Z0-9_]{3,20}$/.test(body.username)) errors.push('username: 3-20 символов, только латиница/цифры/_');
  if(!body.email || typeof body.email!=='string') errors.push('email обязателен');
  else if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) errors.push('email: некорректный формат');
  if(!body.password || typeof body.password!=='string') errors.push('password обязателен');
  else if(body.password.length<6) errors.push('password: минимум 6 символов');
  return errors;
};

app.get('/api/health',(_req,res)=>{ res.json({status:'ok', time:new Date().toISOString()}); });
app.post('/api/register', async(req,res)=>{
  const errors=validateRegister(req.body);
  if(errors.length) return res.status(400).json({error:errors.join('; ')});
  const {username,email,password}=req.body; const displayName=req.body.display_name||username;
  if(findUserByUsername.get(username)) return res.status(409).json({error:'Пользователь с таким username уже существует'});
  if(findUserByEmail.get(email)) return res.status(409).json({error:'Email уже зарегистрирован'});
  try{
    const hash=await bcrypt.hash(password,10);
    const info=insertUser.run(username,email,hash,displayName);
    const userId=info.lastInsertRowid;
    const token=jwt.sign({id:userId,username},JWT_SECRET,{expiresIn:'30d'});
    res.status(201).json({token, user:{id:userId,username,email,display_name:displayName}});
  }catch(e){ console.error(e); res.status(500).json({error:'Ошибка сервера при регистрации'}); }
});
app.post('/api/login', async(req,res)=>{
  const {username,password}=req.body||{};
  if(!username||!password) return res.status(400).json({error:'username и password обязательны'});
  const user=findUserByUsername.get(username) || findUserByEmail.get(username);
  if(!user) return res.status(401).json({error:'Неверный логин или пароль'});
  const ok=await bcrypt.compare(password,user.password_hash);
  if(!ok) return res.status(401).json({error:'Неверный логин или пароль'});
  const token=jwt.sign({id:user.id, username:user.username},JWT_SECRET,{expiresIn:'30d'});
  res.json({token, user:{id:user.id, username:user.username, email:user.email, display_name:user.display_name}});
});
app.get('/api/me', authMiddleware, (req,res)=>{
  const user=db.prepare('SELECT id, username, email, display_name, created_at FROM users WHERE id = ?').get(req.userId);
  if(!user) return res.status(404).json({error:'Пользователь не найден'});
  res.json({user});
});
app.get('/api/progress', authMiddleware, (req,res)=>{
  const rows=getUserProgress.all(req.userId);
  const map={}; for(const r of rows) map[r.lesson_id]={score:r.score, completed_at:r.completed_at};
  res.json({progress:map});
});
app.post('/api/progress/:lessonId', authMiddleware, (req,res)=>{
  const {lessonId}=req.params; const score=Math.max(0,Math.min(100,Number(req.body?.score??100)));
  insertProgress.run(req.userId, lessonId, score);
  res.json({ok:true, lesson_id:lessonId, score});
});
app.delete('/api/progress/:lessonId', authMiddleware, (req,res)=>{
  const {lessonId}=req.params; deleteProgress.run(req.userId, lessonId); res.json({ok:true});
});
app.get('/api/stats', authMiddleware, (req,res)=>{
  const row=db.prepare('SELECT COUNT(*) as count, MAX(completed_at) as last FROM progress WHERE user_id = ?').get(req.userId);
  res.json({lessons_completed:row.count, last_completed:row.last});
});
app.use((_req,res)=>res.status(404).json({error:'Not found'}));
app.listen(PORT,'0.0.0.0',()=>{ console.log(`🌸 SAKURA://SENSEI backend running on http://0.0.0.0:${PORT}`); console.log(`   Database: ${path.join(__dirname,'database.db')}`); });
