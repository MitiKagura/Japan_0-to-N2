import { useState } from 'react';
import { api, ApiError, type User } from '../api';
import { Flower2, LogIn, UserPlus, AlertCircle, Loader2 } from 'lucide-react';

export function AuthScreen({ onAuth }: { onAuth: (user: User) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let result;
      if (mode === 'login') result = await api.login(username, password);
      else {
        if (!email) {
          setError('Email обязателен');
          setLoading(false);
          return;
        }
        result = await api.register({
          username,
          email,
          password,
          display_name: displayName || username,
        });
      }
      localStorage.setItem('sakura_user', JSON.stringify(result.user));
      onAuth(result.user);
    } catch (e) {
      if (e instanceof ApiError) setError(e.message);
      else if (e instanceof Error)
        setError('Не удалось подключиться к серверу. Запусти server/server.js');
      else setError('Неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 border-2 border-pink-400 sakura-bg mb-3 pulse-sakura">
            <Flower2 size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold neon-text uppercase tracking-widest">SAKURA://SENSEI</h1>
          <p className="text-pink-300/80 text-sm mt-2">
            {mode === 'login' ? 'Войди, чтобы продолжить путь' : 'Создай аккаунт за 30 секунд'}
          </p>
        </div>
        <div className="border-2 border-pink-400 bg-black/60 p-5 space-y-4">
          <div className="flex border border-pink-400/40 bg-black/60">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
              }}
              className={`flex-1 py-2 text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition-all ${
                mode === 'login' ? 'bg-pink-400 text-black' : 'text-pink-300 hover:text-pink-200'
              }`}
            >
              <LogIn size={14} /> Вход
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError('');
              }}
              className={`flex-1 py-2 text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition-all ${
                mode === 'register' ? 'bg-pink-400 text-black' : 'text-pink-300 hover:text-pink-200'
              }`}
            >
              <UserPlus size={14} /> Регистрация
            </button>
          </div>
          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="text-pink-300 text-xs uppercase tracking-widest block mb-1">
                {mode === 'login' ? 'Username или email' : 'Username'}
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={mode === 'login' ? 'sakura или s@mail.com' : 'sakura_chan'}
                required
                autoComplete="username"
                className="w-full"
              />
              {mode === 'register' && (
                <p className="text-pink-400/60 text-[10px] mt-1 uppercase tracking-widest">
                  3-20 символов, латиница/цифры/_
                </p>
              )}
            </div>
            {mode === 'register' && (
              <>
                <div>
                  <label className="text-pink-300 text-xs uppercase tracking-widest block mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-pink-300 text-xs uppercase tracking-widest block mb-1">
                    Имя (необязательно)
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Сакура"
                    className="w-full"
                  />
                </div>
              </>
            )}
            <div>
              <label className="text-pink-300 text-xs uppercase tracking-widest block mb-1">Пароль</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                className="w-full"
              />
              {mode === 'register' && (
                <p className="text-pink-400/60 text-[10px] mt-1 uppercase tracking-widest">
                  минимум 6 символов
                </p>
              )}
            </div>
            {error && (
              <div className="border-2 border-red-500 bg-red-500/10 p-2.5 flex items-start gap-2">
                <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                <span className="text-red-300 text-xs leading-relaxed">{error}</span>
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="neon-btn w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : mode === 'login' ? (
                <>
                  <LogIn size={14} /> Войти
                </>
              ) : (
                <>
                  <UserPlus size={14} /> Создать аккаунт
                </>
              )}
            </button>
          </form>
          <div className="border-t border-pink-400/30 pt-3 text-center">
            <p className="text-pink-400/60 text-[10px] uppercase tracking-widest">
              {mode === 'login' ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}{' '}
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'login' ? 'register' : 'login');
                  setError('');
                }}
                className="text-pink-300 hover:text-pink-200 underline"
              >
                {mode === 'login' ? 'Зарегистрируйся' : 'Войти'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
