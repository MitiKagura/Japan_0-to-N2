import { useEffect, useState, useCallback } from 'react';
import { api, type User, type ProgressMap } from './api';
import { courses } from './data/curriculum';
import type { Course, Lesson, KanaChar } from './data/types';
import { AuthScreen } from './components/AuthScreen';
import { LessonView } from './components/LessonView';
import { KanaChart } from './components/KanaChart';
import { KanjiGrid } from './components/KanjiGrid';
import { hiragana } from './data/kana';
import { katakana } from './data/kana';
import { Flower2, LogOut, Home as HomeIcon, Languages, BookOpen, Layers, Wifi, WifiOff, Sparkles, Search } from 'lucide-react';

type View = 'home' | 'course' | 'lesson' | 'hiragana' | 'katakana' | 'kanji';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [view, setView] = useState<View>('home');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [progress, setProgress] = useState<ProgressMap>({});
  const [serverOnline, setServerOnline] = useState(false);
  const [query, setQuery] = useState('');

  // При загрузке: проверяем localStorage
  useEffect(() => {
    const stored = api.getStoredUser();
    if (stored) {
      setUser(stored);
      api.me().then((u) => setUser(u)).catch(() => setUser(stored));
    }
    setAuthChecked(true);
    api.health().then(setServerOnline).catch(() => setServerOnline(false));
  }, []);

  // Загружаем прогресс когда залогинились
  useEffect(() => {
    if (!user) {
      setProgress({});
      return;
    }
    api
      .getProgress()
      .then(setProgress)
      .catch(() => setProgress({}));
  }, [user]);

  const handleAuth = useCallback((u: User) => {
    setUser(u);
    api.health().then(setServerOnline).catch(() => setServerOnline(false));
  }, []);

  const handleLogout = useCallback(() => {
    api.logout();
    setUser(null);
    setProgress({});
    setView('home');
    setSelectedCourse(null);
    setSelectedLesson(null);
  }, []);

  const handleLessonComplete = useCallback(
    async (lessonId: string, score: number) => {
      if (!user) return;
      try {
        await api.markLesson(lessonId, score);
        setProgress((p) => ({ ...p, [lessonId]: { score, completed_at: new Date().toISOString() } }));
      } catch {
        /* ignore */
      }
    },
    [user],
  );

  const handleLessonReset = useCallback(
    async (lessonId: string) => {
      if (!user) return;
      try {
        await api.unmarkLesson(lessonId);
        setProgress((p) => {
          const next = { ...p };
          delete next[lessonId];
          return next;
        });
      } catch {
        /* ignore */
      }
    },
    [user],
  );

  if (!authChecked) return null;

  return (
    <div className="min-h-screen bg-radial-glow text-pink-50">
      <div className="scanline" />
      <SakuraPetals />

      <Header
        user={user}
        view={view}
        onHome={() => {
          setView('home');
          setSelectedCourse(null);
          setSelectedLesson(null);
        }}
        onNavigate={setView}
        onLogout={handleLogout}
        progress={progress}
        serverOnline={serverOnline}
      />

      <main className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        {!user ? (
          <AuthScreen onAuth={handleAuth} />
        ) : view === 'home' ? (
          <HomePage
            query={query}
            setQuery={setQuery}
            onSelectCourse={(c) => {
              setSelectedCourse(c);
              setView('course');
            }}
            onSelectView={(v) => setView(v)}
            progress={progress}
          />
        ) : view === 'course' && selectedCourse ? (
          <CoursePage
            course={selectedCourse}
            progress={progress}
            onSelectLesson={(l) => {
              setSelectedLesson(l);
              setView('lesson');
            }}
            onBack={() => setView('home')}
          />
        ) : view === 'lesson' && selectedLesson && selectedCourse ? (
          <LessonView
            lesson={selectedLesson}
            course={selectedCourse}
            onBack={() => setView('course')}
            onComplete={(s: number) => {
              void handleLessonComplete(selectedLesson.id, s);
            }}
            onReset={() => {
              void handleLessonReset(selectedLesson.id);
            }}
          />
        ) : view === 'hiragana' ? (
          <KanaChart title="Хирагана — ひらがな" chars={hiragana as KanaChar[]} />
        ) : view === 'katakana' ? (
          <KanaChart title="Катакана — カタカナ" chars={katakana as KanaChar[]} />
        ) : view === 'kanji' ? (
          <KanjiGrid />
        ) : null}
      </main>

      <Footer />
    </div>
  );
}

function SakuraPetals() {
  return (
    <div className="sakura-petals" aria-hidden>
      {Array.from({ length: 12 }).map((_, i) => (
        <span
          key={i}
          style={{
            left: `${(i * 8.7) % 100}%`,
            animationDuration: `${10 + (i % 6) * 2}s`,
            animationDelay: `${i * 0.6}s`,
          }}
        >
          ❀
        </span>
      ))}
    </div>
  );
}

function Header({
  user,
  view,
  onHome,
  onNavigate,
  onLogout,
  progress,
  serverOnline,
}: {
  user: User | null;
  view: View;
  onHome: () => void;
  onNavigate: (v: View) => void;
  onLogout: () => void;
  progress: ProgressMap;
  serverOnline: boolean;
}) {
  const completed = Object.keys(progress).length;
  return (
    <header className="border-b border-pink-400/30 bg-black/60 backdrop-blur sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
        <button
          type="button"
          onClick={onHome}
          className="flex items-center gap-2 hover:opacity-80 transition"
        >
          <div className="flex h-9 w-9 items-center justify-center sakura-bg pulse-sakura">
            <Flower2 size={20} className="text-white" />
          </div>
          <div className="hidden sm:block">
            <div className="text-lg font-bold neon-text uppercase tracking-widest leading-none">
              SAKURA://SENSEI
            </div>
            <div className="text-[10px] text-pink-300/70 leading-none">日本語 · от 0 до N2</div>
          </div>
        </button>

        {user && (
          <nav className="flex items-center gap-1 ml-3">
            {([
              { v: 'home' as View, label: 'Уроки', icon: HomeIcon },
              { v: 'hiragana' as View, label: 'Хирагана', icon: Languages },
              { v: 'katakana' as View, label: 'Катакана', icon: Languages },
              { v: 'kanji' as View, label: 'Кандзи', icon: BookOpen },
            ] as const).map(({ v, label, icon: Icon }) => {
              const active = view === v || (v === 'home' && (view === 'course' || view === 'lesson'));
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => {
                    if (v === 'home') onHome();
                    else onNavigate(v);
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1.5 text-xs uppercase tracking-widest font-bold transition ${
                    active ? 'bg-pink-400 text-black' : 'text-pink-300 hover:text-pink-200 hover:bg-pink-400/10'
                  }`}
                >
                  <Icon size={12} /> <span className="hidden md:inline">{label}</span>
                </button>
              );
            })}
          </nav>
        )}

        <div className="ml-auto flex items-center gap-2">
          {serverOnline ? (
            <span className="hidden sm:flex items-center gap-1 text-emerald-300/80 text-[10px] uppercase tracking-widest">
              <Wifi size={12} /> сервер
            </span>
          ) : (
            <span className="hidden sm:flex items-center gap-1 text-rose-300/80 text-[10px] uppercase tracking-widest">
              <WifiOff size={12} /> оффлайн
            </span>
          )}

          {user && completed > 0 && (
            <span className="flex items-center gap-1 text-pink-300 text-[10px] uppercase tracking-widest">
              <Sparkles size={12} /> {completed}
            </span>
          )}

          {user && (
            <div className="flex items-center gap-2 border border-pink-400/40 px-2 py-1">
              <span className="text-pink-200 text-xs hidden sm:inline">
                {user.display_name || user.username}
              </span>
              <button
                type="button"
                onClick={onLogout}
                className="text-pink-300 hover:text-pink-100"
                title="Выйти"
              >
                <LogOut size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function HomePage({
  query,
  setQuery,
  onSelectCourse,
  onSelectView,
  progress,
}: {
  query: string;
  setQuery: (q: string) => void;
  onSelectCourse: (c: Course) => void;
  onSelectView: (v: View) => void;
  progress: ProgressMap;
}) {
  const filtered = courses.filter((c: Course) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q);
  });
  return (
    <div className="space-y-6">
      <div className="border-2 border-pink-400 p-6 bg-gradient-to-br from-pink-400/10 to-transparent">
        <div className="text-pink-300/70 text-[10px] uppercase tracking-widest flicker">
          [sakura.bloom]
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold gradient-text mt-1">日本語 / Nihongo</h1>
        <p className="text-pink-200/80 mt-1 text-sm">零 → N2</p>
        <p className="text-pink-100/80 mt-3 text-sm leading-relaxed max-w-2xl">
          Учитель японского от нуля до JLPT N2. Постепенно, как в SoloLearn: каждый урок разбит на этапы
          с обязательными тестами. Кликни на любой знак каны или кандзи — увидишь порядок черт и не
          закроешь, пока не выучишь.
        </p>
        <div className="flex flex-wrap items-center gap-3 mt-4 text-[11px] uppercase tracking-widest text-pink-300/80">
          <span>{courses.length} курсов</span>
          <span>·</span>
          <span>{courses.reduce((s, c) => s + c.lessons.length, 0)} уроков</span>
          <span>·</span>
          <span>ひらがな・カタカナ・漢字</span>
          <span>·</span>
          <span>N5 → N2</span>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <InfoBox
          icon={<Layers size={20} />}
          title="Уроки"
          text={`${courses.reduce((s, c) => s + c.lessons.length, 0)} уроков от азбуки до бизнес-кейго. Каждый этап с тестом.`}
          onClick={() => onSelectView('home')}
        />
        <InfoBox
          icon={<Languages size={20} />}
          title="Кана"
          text="Хирагана и катакана с порядком черт на клик. Правильные направления из animCJK."
          onClick={() => onSelectView('hiragana')}
        />
        <InfoBox
          icon={<BookOpen size={20} />}
          title="Кандзи"
          text={`${Object.keys(progress).length ? Math.round((Object.keys(progress).length / Math.max(1, Object.keys(progress).length)) * 100) : 0}% пройдено. Поэтапная анимация штрихов с правильным направлением.`}
          onClick={() => onSelectView('kanji')}
        />
      </div>

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск по урокам (です, て-форма, потенциал...)"
          className="w-full pl-10 pr-3 py-2.5"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {filtered.map((c: Course) => (
          <CourseCard key={c.id} course={c} onClick={() => onSelectCourse(c)} progress={progress} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full border border-dashed border-pink-400/30 p-6 text-center text-sm text-pink-300/70">
            Ничего не найдено.
          </div>
        )}
      </div>

      <div className="border border-pink-400/30 p-4 bg-pink-400/5">
        <h3 className="text-pink-300 text-xs uppercase tracking-widest font-bold mb-2">// Как учить</h3>
        <ol className="space-y-1 text-sm text-pink-100/80 list-decimal pl-5">
          <li>Начни с Каны (2 урока), параллельно учи хирагану по таблице (кликай на знаки).</li>
          <li>Иди по N5 → N4 → N3 → N2 строго по порядку. Каждый этап — тест.</li>
          <li>Кандзи учи по вкладке 漢字: N5 → N4 → N3 → N2. Пиши от руки.</li>
          <li>Прогресс сохраняется на сервере. Не закрывай модалку с чертами, пока не запомнишь.</li>
        </ol>
      </div>
    </div>
  );
}

function InfoBox({
  icon,
  title,
  text,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="glow-card text-left p-3 flex items-start gap-3"
    >
      <div className="text-pink-300 shrink-0 mt-0.5">{icon}</div>
      <div>
        <div className="text-pink-200 text-sm font-bold uppercase tracking-widest">{title}</div>
        <div className="text-pink-100/70 text-xs mt-0.5 leading-snug">{text}</div>
      </div>
    </button>
  );
}

function CourseCard({
  course,
  onClick,
  progress,
}: {
  course: Course;
  onClick: () => void;
  progress: ProgressMap;
}) {
  const total = course.lessons.length;
  const done = course.lessons.filter((l) => progress[l.id]).length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  return (
    <button type="button" onClick={onClick} className="glow-card text-left p-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-2xl">{course.icon}</span>
        <span className="text-pink-200 font-bold">{course.shortName}</span>
        <span className="ml-auto text-[10px] uppercase tracking-widest text-pink-300/70">
          {done}/{total} · {pct}%
        </span>
      </div>
      <h3 className="text-pink-100 font-semibold">{course.title}</h3>
      <p className="text-pink-100/70 text-xs mt-1 leading-snug">{course.description}</p>
      {course.level && (
        <span className="inline-block mt-2 tag-sakura">{course.level}</span>
      )}
    </button>
  );
}

function CoursePage({
  course,
  progress,
  onSelectLesson,
  onBack,
}: {
  course: Course;
  progress: ProgressMap;
  onSelectLesson: (l: Lesson) => void;
  onBack: () => void;
}) {
  const total = course.lessons.length;
  const done = course.lessons.filter((l) => progress[l.id]).length;
  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="text-pink-300 text-xs uppercase tracking-widest hover:text-pink-200"
      >
        ← К курсам
      </button>
      <div className="border-2 border-pink-400 p-5 bg-gradient-to-br from-pink-400/10 to-transparent">
        <div className="flex items-center gap-2 text-pink-300 text-xs uppercase tracking-widest">
          <span>{course.icon}</span>
          <span>{course.shortName}</span>
          <span className="ml-auto text-pink-200/80">
            Прогресс: {done} / {total}
          </span>
        </div>
        <h2 className="text-2xl font-bold neon-text mt-1">{course.title}</h2>
        <p className="text-pink-100/80 text-sm mt-1">{course.description}</p>
      </div>
      <div className="space-y-2">
        {course.lessons.map((l, i) => {
          const isDone = !!progress[l.id];
          return (
            <button
              key={l.id}
              type="button"
              onClick={() => onSelectLesson(l)}
              className="w-full text-left glow-card p-3 flex items-center gap-3"
            >
              <div
                className={`shrink-0 w-8 h-8 flex items-center justify-center text-xs font-bold ${
                  isDone ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-500/50' : 'bg-pink-400/20 text-pink-200 border border-pink-400/40'
                }`}
              >
                {isDone ? '✓' : i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-pink-100 text-sm font-semibold truncate">{l.title}</div>
                <div className="text-pink-300/70 text-xs truncate">{l.shortDesc}</div>
              </div>
              <div className="text-pink-300/60 text-[10px] uppercase tracking-widest shrink-0">
                {l.estimatedMinutes} мин
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-pink-400/20 py-4 text-center text-pink-400/40 text-[10px] uppercase tracking-widest">
      🌸 SAKURA://SENSEI · от 0 до N2 · neko ga neko de aru 🌸
    </footer>
  );
}
