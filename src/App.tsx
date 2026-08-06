import { useState, useEffect } from 'react';
import { courses, type Course, type Lesson } from './data/curriculum';
import { LessonView } from './components/LessonView';
import { AuthScreen } from './components/AuthScreen';
import { KanaChart } from './components/KanaChart';
import { KanjiGrid } from './components/KanjiGrid';
import { hiragana, katakana } from './data/kana';
import { api, type User, type ProgressMap } from './api';
import { Search, ArrowRight, Flower2, BookOpen, Target, Server, ServerOff, Loader2, LogOut, User as UserIcon, PenLine, Hash } from 'lucide-react';

type View='home'|'course'|'lesson'|'hiragana'|'katakana'|'kanji';

export default function App(){
  const [view,setView]=useState<View>('home');
  const [selectedCourse,setSelectedCourse]=useState<Course|null>(null);
  const [selectedLesson,setSelectedLesson]=useState<Lesson|null>(null);
  const [query,setQuery]=useState('');
  const [user,setUser]=useState<User|null>(null);
  const [authLoading,setAuthLoading]=useState(true);
  const [serverOnline,setServerOnline]=useState(true);
  const [progress,setProgress]=useState<ProgressMap>({});

  useEffect(()=>{
    const init=async()=>{
      const online=await api.health(); setServerOnline(online);
      if(api.isAuthenticated()){
        try{ const u=await api.me(); setUser(u); const p=await api.getProgress(); setProgress(p);} catch{ api.logout(); }
      }
      setAuthLoading(false);
    }; init();
  },[]);
  const handleAuth=async(u:User)=>{ setUser(u); try{ const p=await api.getProgress(); setProgress(p);} catch{} };
  const handleLogout=()=>{ api.logout(); setUser(null); setProgress({}); setView('home'); setSelectedCourse(null); setSelectedLesson(null); };
  const handleLessonComplete=async(lid:string,score:number)=>{ if(!user) return; try{ await api.markLesson(lid,score); setProgress(p=>({...p,[lid]:{score,completed_at:new Date().toISOString()}})); } catch(e){ console.error(e);} };
  const handleLessonReset=async(lid:string)=>{ if(!user) return; try{ await api.unmarkLesson(lid); setProgress(p=>{ const n={...p}; delete n[lid]; return n;}); } catch(e){console.error(e);} };

  if(authLoading) return <div className="min-h-screen bg-radial-glow bg-grid flex items-center justify-center"><div className="text-pink-300 flex items-center gap-2"><Loader2 size={20} className="animate-spin"/> Загрузка...</div></div>;
  if(!user) return <div className="min-h-screen bg-radial-glow bg-grid"><div className="scanline"/><div className="sakura-petals"><span style={{left:'10%', animationDuration:'8s'}}>🌸</span><span style={{left:'30%', animationDuration:'11s', animationDelay:'1s'}}>🌸</span><span style={{left:'60%', animationDuration:'9s', animationDelay:'2s'}}>🌸</span><span style={{left:'80%', animationDuration:'12s', animationDelay:'0.5s'}}>🌸</span></div>{!serverOnline && <div className="bg-red-500/20 border-b border-red-500 text-red-300 text-xs p-2 text-center"><ServerOff size={12} className="inline mr-1"/> Нет связи с API — запусти server на 3001</div>}<AuthScreen onAuth={handleAuth}/></div>;

  return (
    <div className="min-h-screen bg-radial-glow bg-grid">
      <div className="scanline"/><div className="sakura-petals"><span style={{left:'10%', animationDuration:'8s'}}>🌸</span><span style={{left:'30%', animationDuration:'11s', animationDelay:'1s'}}>🌸</span><span style={{left:'60%', animationDuration:'9s', animationDelay:'2s'}}>🌸</span><span style={{left:'80%', animationDuration:'12s', animationDelay:'0.5s'}}>🌸</span></div>
      <Header user={user} view={view} setView={setView} onHome={()=>{setView('home'); setSelectedCourse(null); setSelectedLesson(null);}} onLogout={handleLogout} progress={progress} serverOnline={serverOnline}/>
      <main className="max-w-6xl mx-auto px-4 py-6 relative z-10">
        {view==='home' && <HomePage query={query} setQuery={setQuery} onSelectCourse={c=>{setSelectedCourse(c); setView('course');}} setView={setView}/>}
        {view==='course' && selectedCourse && <CoursePage course={selectedCourse} progress={progress} onSelectLesson={l=>{setSelectedLesson(l); setView('lesson');}} onBack={()=>setView('home')}/>}
        {view==='lesson' && selectedLesson && selectedCourse && <LessonView lesson={selectedLesson} course={selectedCourse} onBack={()=>setView('course')} onComplete={(s:number)=>{void handleLessonComplete(selectedLesson.id,s);}} onReset={()=>{void handleLessonReset(selectedLesson.id);}}/>}
        {view==='hiragana' && <KanaChart title="ひらがな — Хирагана" data={hiragana}/>}
        {view==='katakana' && <KanaChart title="カタカナ — Катакана" data={katakana}/>}
        {view==='kanji' && <KanjiGrid/>}
      </main>
      <Footer/>
    </div>
  );
}

function Header({user,view,setView,onHome,onLogout,progress,serverOnline}:{user:User; view:View; setView:(v:View)=>void; onHome:()=>void; onLogout:()=>void; progress:ProgressMap; serverOnline:boolean;}){
  const completed=Object.keys(progress).length;
  const navActive='bg-pink-400 text-black';
  const navIdle='text-pink-300 hover:text-pink-200 hover:bg-pink-400/10';
  return (
    <header className="border-b border-pink-400/40 bg-black/70 backdrop-blur sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
        <button onClick={onHome} className="flex items-center gap-3 group">
          <div className="w-9 h-9 border-2 border-pink-400 flex items-center justify-center group-hover:shadow-[0_0_15px_#ff6b9d] transition-all sakura-bg">
            <Flower2 size={18} className="text-white"/>
          </div>
          <div className="text-left">
            <div className="text-pink-300 font-bold text-lg leading-none tracking-widest flicker">SAKURA://SENSEI</div>
            <div className="text-pink-300/60 text-[10px] tracking-widest uppercase">日本語 N5→N2</div>
          </div>
        </button>
        <nav className="flex items-center gap-1 flex-wrap">
          <button onClick={()=>setView('home')} className={`px-3 py-1.5 text-xs uppercase tracking-widest font-bold border ${view==='home'||view==='course'||view==='lesson'?navActive:navIdle} border-pink-400/40 transition-all`}>Уроки</button>
          <button onClick={()=>setView('hiragana')} className={`px-3 py-1.5 text-xs uppercase tracking-widest font-bold border ${view==='hiragana'?navActive:navIdle} border-pink-400/40 transition-all flex items-center gap-1`}><PenLine size={12}/> ひらがな</button>
          <button onClick={()=>setView('katakana')} className={`px-3 py-1.5 text-xs uppercase tracking-widest font-bold border ${view==='katakana'?navActive:navIdle} border-pink-400/40 transition-all`}>カタカナ</button>
          <button onClick={()=>setView('kanji')} className={`px-3 py-1.5 text-xs uppercase tracking-widest font-bold border ${view==='kanji'?navActive:navIdle} border-pink-400/40 transition-all flex items-center gap-1`}><Hash size={12}/> 漢字</button>
        </nav>
        <div className="flex items-center gap-2 text-[10px] tracking-widest uppercase">
          {serverOnline?<span title="API онлайн"><Server size={12} className="text-green-400"/></span>:<span title="API оффлайн"><ServerOff size={12} className="text-red-400"/></span>}
          {completed>0 && <span className="text-yellow-200 flex items-center gap-1"><Target size={12}/> {completed}</span>}
          <div className="flex items-center gap-2 border border-pink-400/40 px-2 py-1 bg-black/40">
            <UserIcon size={12} className="text-pink-300"/><span className="text-pink-100 normal-case tracking-normal text-xs">{user.display_name||user.username}</span>
            <button onClick={onLogout} className="ml-1 text-pink-300 hover:text-red-400 transition-colors" title="Выйти"><LogOut size={12}/></button>
          </div>
        </div>
      </div>
    </header>
  );
}

function HomePage({query,setQuery,onSelectCourse,setView}:{query:string; setQuery:(q:string)=>void; onSelectCourse:(c:Course)=>void; setView:(v:View)=>void;}){
  const filtered=courses.filter((c:Course)=> !query || c.title.toLowerCase().includes(query.toLowerCase()) || c.description.toLowerCase().includes(query.toLowerCase()));
  return (
    <div className="space-y-6">
      <div className="border-2 border-pink-400 bg-gradient-to-br from-pink-400/10 via-pink-300/5 to-transparent p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-2 right-2 text-[10px] text-pink-400/40 tracking-widest uppercase">[sakura.bloom]</div>
        <h1 className="text-3xl md:text-5xl font-bold mb-3 leading-tight">
          <span className="neon-text">日本語</span><span className="text-pink-400 mx-2">/</span><span className="neon-text-soft">Nihongo</span><br/>
          <span className="gradient-text">零 → N2</span>
        </h1>
        <p className="text-pink-100 max-w-3xl leading-relaxed text-sm md:text-base mb-5">
          Учитель японского от нуля до <b className="text-pink-200">JLPT N2</b>. Постепенно, как в SoloLearn: каждый урок разбит на этапы с обязательными тестами. Кликни на любой знак каны или кандзи — увидишь порядок черт и не закроешь, пока не выучишь.
        </p>
        <div className="flex flex-wrap gap-2 mb-5">
          <span className="tag-sakura">{courses.length} курсов</span>
          <span className="tag-light">28 уроков</span>
          <span className="tag-deep">ひらがな・カタカナ・漢字</span>
          <span className="tag-sakura">N5→N2</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <InfoBox icon={<BookOpen size={18}/>} title="Уроки" text="28 уроков от азбуки до бизнес-кейго. Каждый этап с тестом."/>
          <InfoBox icon={<PenLine size={18}/>} title="Кана" text="Хирагана и катакана с порядком черт на клик"/>
          <InfoBox icon={<Hash size={18}/>} title="Кандзи" text="45 знаков N5-N2 с чтениями и примерами"/>
        </div>
        <div className="mt-4 flex gap-2 flex-wrap">
          <button onClick={()=>setView('hiragana')} className="neon-btn text-xs">ひらがな — начать</button>
          <button onClick={()=>setView('kanji')} className="neon-btn-light text-xs">漢字 — кандзи</button>
        </div>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-300 pointer-events-none"/>
        <input type="text" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Поиск по урокам (です, て-форма, потенциал...)" className="w-full pl-10 pr-3 py-2.5"/>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((c:Course)=><CourseCard key={c.id} course={c} onClick={()=>onSelectCourse(c)}/>)}
      </div>
      {filtered.length===0 && <div className="border-2 border-dashed border-pink-400/40 p-10 text-center"><Flower2 size={32} className="mx-auto text-pink-300 mb-3"/><p className="text-pink-200">Ничего не найдено.</p></div>}

      <div className="border border-pink-400/40 bg-black/40 p-5 space-y-3">
        <h2 className="text-pink-300 font-bold uppercase tracking-widest text-sm">// Как учить</h2>
        <ol className="space-y-2 text-sm text-pink-100">
          <li className="flex gap-3"><span className="text-pink-300 font-bold w-6 shrink-0">1.</span><span>Начни с Каны (2 урока), параллельно учи хирагану по таблице (кликай на знаки).</span></li>
          <li className="flex gap-3"><span className="text-pink-300 font-bold w-6 shrink-0">2.</span><span>Иди по N5 → N4 → N3 → N2 строго по порядку. Каждый этап — тест.</span></li>
          <li className="flex gap-3"><span className="text-pink-300 font-bold w-6 shrink-0">3.</span><span>Кандзи учи по вкладке 漢字: N5 → N4 → N3 → N2. Пиши от руки.</span></li>
          <li className="flex gap-3"><span className="text-pink-300 font-bold w-6 shrink-0">4.</span><span>Прогресс сохраняется на сервере. Не закрывай модалку с чертами, пока не запомнишь.</span></li>
        </ol>
      </div>
    </div>
  );
}

function InfoBox({icon,title,text}:{icon:React.ReactNode; title:string; text:string}){
  return <div className="border border-pink-400/40 bg-black/40 p-3 space-y-1"><div className="flex items-center gap-2 text-pink-300"><span>{icon}</span><h3 className="font-bold uppercase tracking-widest text-xs">{title}</h3></div><p className="text-pink-100/80 text-xs leading-relaxed">{text}</p></div>;
}

function CourseCard({course,onClick}:{course:Course; onClick:()=>void}){
  const total=course.lessons.length;
  return (
    <button onClick={onClick} className="glow-card p-5 text-left">
      <div className="flex items-start gap-3 mb-2">
        <div className="p-2 border border-pink-400 text-pink-300 shrink-0 text-xl">{course.icon}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap"><h3 className="text-pink-100 font-bold text-lg leading-tight">{course.title}</h3>{course.level && <span className="tag-sakura text-[10px]">{course.level}</span>}</div>
          <p className="text-pink-100/80 text-xs leading-relaxed mt-1">{course.description}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 text-[10px] text-pink-300/70 tracking-widest uppercase mt-3">
        <span>{total} уроков</span><span className="text-pink-700">·</span><span>~{course.lessons.reduce((s:number,l:Lesson)=>s+l.estimatedMinutes,0)} мин</span>
        <span className="ml-auto text-pink-300 flex items-center gap-1">Начать <ArrowRight size={12}/></span>
      </div>
    </button>
  );
}

function CoursePage({course,progress,onSelectLesson,onBack}:{course:Course; progress:ProgressMap; onSelectLesson:(l:Lesson)=>void; onBack:()=>void;}){
  const completed=course.lessons.filter((l:Lesson)=>progress[l.id]).length; const total=course.lessons.length;
  return (
    <div className="space-y-4">
      <button onClick={onBack} className="neon-btn-light inline-flex items-center gap-2 text-xs">← Назад к курсам</button>
      <div className="border-2 border-pink-400 bg-gradient-to-br from-pink-400/10 to-transparent p-5">
        <div className="flex items-center gap-2 flex-wrap mb-2"><span className="text-3xl">{course.icon}</span><span className="tag-sakura">{course.shortName}</span><span className="text-pink-300/60 text-xs">Прогресс: {completed} / {total}</span></div>
        <h1 className="text-2xl md:text-3xl font-bold neon-text">{course.title}</h1>
        <p className="text-pink-100/80 text-sm mt-2">{course.description}</p>
        <div className="mt-3 h-2 bg-pink-900/40 border border-pink-400/30"><div className="h-full sakura-bg transition-all" style={{width:`${(completed/total)*100}%`}}/></div>
      </div>
      <div className="space-y-2">
        <div className="text-pink-300 text-xs uppercase tracking-widest font-bold">// Уроки</div>
        {course.lessons.map((l:Lesson,i:number)=>{
          const isDone=progress[l.id];
          return (
            <button key={l.id} onClick={()=>onSelectLesson(l)} className="glow-card p-4 w-full text-left flex items-center gap-3">
              <div className={`w-10 h-10 border-2 flex items-center justify-center font-bold shrink-0 ${isDone?'border-green-500 bg-green-500/20 text-green-400':'border-pink-400 text-pink-300'}`}>{isDone?'✓':i+1}</div>
              <div className="flex-1 min-w-0"><h4 className="text-pink-50 font-semibold text-sm">{l.title}</h4><p className="text-pink-300/60 text-xs mt-0.5">{l.shortDesc}</p></div>
              <div className="flex items-center gap-2 shrink-0"><span className="text-pink-300/60 text-[10px] uppercase tracking-widest">~{l.estimatedMinutes} мин</span><ArrowRight size={14} className="text-pink-300"/></div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Footer(){
  return (
    <footer className="border-t border-pink-400/30 bg-black/70 mt-12 relative z-10">
      <div className="max-w-6xl mx-auto px-4 py-5 text-center text-xs text-pink-300/70 space-y-1">
        <div className="flex items-center justify-center gap-2 text-pink-300/60 tracking-widest uppercase"><Flower2 size={12}/> sakura://sensei — 日本語 N5→N2</div>
        <div>Backend: Node.js + Express + SQLite. Frontend: React + Vite. 🌸</div>
      </div>
    </footer>
  );
}
