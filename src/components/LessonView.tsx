import { useState } from 'react';
import type { Lesson, Course, LessonStage, FinalQuiz } from '../data/types';
import { CodeBlock } from './CodeBlock';
import { InlineQuiz } from './InlineQuiz';
import { CodeEditor } from './CodeEditor';
import { ArrowLeft, ArrowRight, Check, RotateCcw, Trophy, Lightbulb, BookOpen, Hammer } from 'lucide-react';

interface LessonViewProps { lesson: Lesson; course: Course; onBack: ()=>void; onComplete:(score:number)=>void; onReset?:()=>void; }
type Phase='stages'|'quiz'|'tasks'|'done';

export function LessonView({ lesson, course, onBack, onComplete, onReset }: LessonViewProps){
  const [phase,setPhase]=useState<Phase>('stages');
  const [stageIdx,setStageIdx]=useState(0);
  const [stageDone,setStageDone]=useState<boolean[]>(new Array(lesson.stages.length).fill(false));
  const [quizIdx,setQuizIdx]=useState(0);
  const [quizDone,setQuizDone]=useState<boolean[]>(new Array(lesson.finalQuiz.length).fill(false));
  const [finalScore,setFinalScore]=useState(0);
  const currentStage=lesson.stages[stageIdx];
  const allStagesDone=stageDone.every(Boolean);
  const markStageDone=()=>{ const n=[...stageDone]; n[stageIdx]=true; setStageDone(n); };
  const nextStage=()=>{ if(stageIdx+1<lesson.stages.length){ setStageIdx(stageIdx+1); window.scrollTo({top:0,behavior:'smooth'});} else { setPhase('quiz'); window.scrollTo({top:0,behavior:'smooth'});} };
  const prevStage=()=>{ if(stageIdx>0){ setStageIdx(stageIdx-1); window.scrollTo({top:0,behavior:'smooth'});} };
  const handleQuizAnswer=(i:number)=>{ if(quizDone[quizIdx]) return; const n=[...quizDone]; n[quizIdx]=true; setQuizDone(n); if(i===lesson.finalQuiz[quizIdx].correct) setFinalScore(finalScore+1); };
  const nextQuiz=()=>{ if(quizIdx+1<lesson.finalQuiz.length) setQuizIdx(quizIdx+1); else { setPhase('tasks'); window.scrollTo({top:0,behavior:'smooth'});} };
  const prevQuiz=()=>{ if(quizIdx>0) setQuizIdx(quizIdx-1); };
  const finalize=()=>{ const pct=Math.round((finalScore/lesson.finalQuiz.length)*100); setPhase('done'); onComplete(pct); window.scrollTo({top:0,behavior:'smooth'}); };
  const restart=()=>{ if(onReset) onReset(); setPhase('stages'); setStageIdx(0); setStageDone(new Array(lesson.stages.length).fill(false)); setQuizIdx(0); setQuizDone(new Array(lesson.finalQuiz.length).fill(false)); setFinalScore(0); };

  if(phase==='done'){
    const pct=Math.round((finalScore/lesson.finalQuiz.length)*100);
    return (
      <div className="space-y-4">
        <button onClick={onBack} className="neon-btn-light inline-flex items-center gap-2 text-xs"><ArrowLeft size={14}/> Назад к урокам</button>
        <div className="border-2 border-pink-400 p-6 bg-black/60 text-center space-y-4 pulse-sakura">
          <Trophy size={48} className="mx-auto text-yellow-300"/>
          <h2 className="text-3xl font-bold neon-text uppercase tracking-widest">Урок пройден!</h2>
          <div className="text-5xl font-bold gradient-text">{finalScore}/{lesson.finalQuiz.length}</div>
          <div className="text-pink-300 text-lg">{pct}% правильных</div>
          <p className="text-pink-200/80 text-sm">{pct>=80?'🌸 Сакура цветёт! Отлично.':pct>=50?'Хороший уровень.': 'Перечитай урок.'}</p>
          <div className="flex gap-2 justify-center flex-wrap">
            <button onClick={onBack} className="neon-btn">К списку уроков →</button>
            <button onClick={restart} className="neon-btn-light flex items-center gap-1"><RotateCcw size={14}/> Пройти заново</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="neon-btn-light inline-flex items-center gap-2 text-xs"><ArrowLeft size={14}/> Назад к урокам</button>
      <div className="border-2 border-pink-400 p-4 bg-gradient-to-br from-pink-400/10 to-transparent">
        <div className="flex items-center gap-2 flex-wrap mb-2"><span className="tag-sakura">{course.shortName}</span><span className="text-pink-300/60 text-xs">⏱ ~{lesson.estimatedMinutes} мин</span></div>
        <h1 className="text-2xl md:text-3xl font-bold neon-text">{lesson.title}</h1>
        <p className="text-pink-200/80 text-sm mt-1">{lesson.shortDesc}</p>
      </div>
      <PhaseTabs phase={phase} setPhase={(p)=>{ if(p==='stages') setPhase('stages'); else if(p==='quiz'&& allStagesDone) setPhase('quiz'); else if(p==='tasks'&& allStagesDone && quizDone.every(Boolean)) setPhase('tasks'); }} allStagesDone={allStagesDone} allQuizDone={quizDone.every(Boolean)} />
      {phase==='stages' && <StageView stage={currentStage} stageIdx={stageIdx} total={lesson.stages.length} stageDone={stageDone[stageIdx]} onComplete={markStageDone} onNext={nextStage} onPrev={prevStage} isLast={stageIdx===lesson.stages.length-1} />}
      {phase==='quiz' && <QuizView question={lesson.finalQuiz[quizIdx]} idx={quizIdx} total={lesson.finalQuiz.length} done={quizDone[quizIdx]} onAnswer={handleQuizAnswer} onNext={nextQuiz} onPrev={prevQuiz} />}
      {phase==='tasks' && <TasksView lesson={lesson} onComplete={finalize} />}
    </div>
  );
}

function PhaseTabs({phase,setPhase,allStagesDone,allQuizDone}:{phase:Phase; setPhase:(p:Phase)=>void; allStagesDone:boolean; allQuizDone:boolean;}){
  const tabs:{id:Phase; label:string; icon:typeof BookOpen; locked:boolean}[]=[
    {id:'stages', label:'Урок', icon:BookOpen, locked:false},
    {id:'quiz', label:'Тест', icon:Trophy, locked:!allStagesDone},
    {id:'tasks', label:'Практика', icon:Hammer, locked:!allStagesDone||!allQuizDone},
  ];
  return (
    <div className="flex gap-1 flex-wrap border border-pink-400/40 p-1 bg-black/60">
      {tabs.map(t=>{
        const Icon=t.icon; const active=phase===t.id;
        return <button key={t.id} onClick={()=>!t.locked&&setPhase(t.id)} disabled={t.locked} className={`px-4 py-2 text-xs uppercase tracking-widest font-bold flex items-center gap-2 border transition-all ${active?'bg-pink-400 text-black border-pink-400 shadow-[0_0_10px_#ff6b9d]':t.locked?'border-transparent text-pink-700 cursor-not-allowed':'border-transparent text-pink-300 hover:text-pink-200 hover:border-pink-400/50'}`}><Icon size={14}/> {t.label}{t.locked&&' 🔒'}</button>;
      })}
    </div>
  );
}

function StageView({stage,stageIdx,total,stageDone,onComplete,onNext,onPrev,isLast}:{stage:LessonStage; stageIdx:number; total:number; stageDone:boolean; onComplete:()=>void; onNext:()=>void; onPrev:()=>void; isLast:boolean;}){
  return (
    <div className="space-y-4">
      <div className="border border-pink-400/40 bg-black/40 p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-pink-300 text-xs uppercase tracking-widest font-bold">Этап {stageIdx+1} / {total}</span>
          <div className="w-32 h-1 bg-pink-900/40"><div className="h-full bg-gradient-to-r from-pink-300 to-pink-600 transition-all" style={{width:`${((stageIdx+1)/total)*100}%`}}/></div>
        </div>
        <h2 className="text-xl font-bold text-pink-100 mb-3">{stage.title}</h2>
        <div className="prose-lesson">
          {stage.theory.split('\n').map((line,i)=>{
            if(line.startsWith('•')|| line.startsWith('-')) return <div key={i} className="ml-2 text-pink-50/90">{line}</div>;
            if(line.trim()==='') return <div key={i} className="h-1.5"/>;
            return <p key={i} className="my-1.5">{formatInline(line)}</p>;
          })}
        </div>
      </div>
      {stage.code && <div><div className="text-pink-300 text-xs uppercase tracking-widest font-bold mb-2">// Пример</div><CodeBlock code={stage.code} language={stage.language||'japanese'}/></div>}
      {stage.question && !stageDone && <InlineQuiz question={stage.question} onSuccess={onComplete}/>}
      {stage.codeTask && !stageDone && <CodeEditor task={stage.codeTask} onSuccess={onComplete}/>}
      {stageDone && <div className="border-2 border-green-500/50 p-4 bg-green-500/10 flex items-center gap-2"><Check size={20} className="text-green-400"/><span className="text-green-300 font-bold text-sm uppercase tracking-widest">Этап пройден</span></div>}
      <div className="flex justify-between items-center pt-2">
        <button onClick={onPrev} disabled={stageIdx===0} className="neon-btn-light text-xs flex items-center gap-1"><ArrowLeft size={12}/> Назад</button>
        <button onClick={onNext} disabled={!stageDone} className="neon-btn text-xs flex items-center gap-1">{isLast?'К тесту':'Следующий этап'} <ArrowRight size={12}/></button>
      </div>
    </div>
  );
}

function formatInline(text:string):React.ReactNode{
  const parts:React.ReactNode[]=[]; const re=/<(\w+)>(.*?)<\/\1>/g; let last=0; let m; let k=0;
  while((m=re.exec(text))!==null){ if(m.index>last) parts.push(text.slice(last,m.index)); const tag=m[1].toLowerCase(); const c=m[2]; if(tag==='b'||tag==='strong') parts.push(<b key={k++}>{c}</b>); else if(tag==='i'||tag==='em') parts.push(<i key={k++}>{c}</i>); else if(tag==='code') parts.push(<code key={k++}>{c}</code>); else parts.push(m[0]); last=m.index+m[0].length; }
  if(last<text.length) parts.push(text.slice(last));
  return parts;
}

function QuizView({question,idx,total,done,onAnswer,onNext,onPrev}:{question:FinalQuiz; idx:number; total:number; done:boolean; onAnswer:(i:number)=>void; onNext:()=>void; onPrev:()=>void;}){
  return (
    <div className="space-y-4">
      <div className="border-2 border-pink-400/60 p-5 bg-black/40 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-pink-300 text-xs uppercase tracking-widest font-bold">Финальный тест: {idx+1} / {total}</span>
          <div className="w-32 h-1 bg-pink-900/40"><div className="h-full bg-gradient-to-r from-pink-300 to-pink-600" style={{width:`${((idx+1)/total)*100}%`}}/></div>
        </div>
        <p className="text-pink-50 text-lg leading-relaxed font-semibold">{question.question}</p>
        <div className="space-y-2">
          {question.options.map((opt,i)=>{
            const correct=i===question.correct; let cls='border-pink-400/30 hover:border-pink-300 hover:bg-pink-400/5 text-pink-50';
            if(done && correct) cls='border-green-500 bg-green-500/20 text-green-200'; else if(done && !correct) cls='border-pink-400/20 text-pink-100/50';
            return <button key={i} onClick={()=>onAnswer(i)} disabled={done} className={`w-full text-left p-3 border ${cls} transition-all text-sm flex items-center gap-2`}><span className="text-pink-300 font-bold w-5">{String.fromCharCode(65+i)}.</span><span className="flex-1">{opt}</span>{done&&correct&&<Check size={14} className="text-green-400"/>}</button>;
          })}
        </div>
        {done && <div className="border-l-4 border-green-500 pl-3 py-2 text-sm bg-green-500/10 text-green-200"><span className="font-bold uppercase tracking-widest mr-1">✓</span>{question.explanation}</div>}
      </div>
      <div className="flex justify-between">
        <button onClick={onPrev} disabled={idx===0} className="neon-btn-light text-xs flex items-center gap-1"><ArrowLeft size={12}/> Назад</button>
        <button onClick={onNext} disabled={!done} className="neon-btn text-xs flex items-center gap-1">{idx+1<total?'Следующий':'К практике'} <ArrowRight size={12}/></button>
      </div>
    </div>
  );
}

function TasksView({lesson,onComplete}:{lesson:Lesson; onComplete:()=>void;}){
  return (
    <div className="space-y-4">
      <div className="border-2 border-yellow-500/60 p-4 bg-yellow-500/5">
        <h3 className="text-yellow-300 font-bold uppercase tracking-widest text-sm flex items-center gap-2 mb-2"><Lightbulb size={14}/> Практические задания</h3>
        <p className="text-yellow-100/80 text-sm leading-relaxed">Напиши от руки или в редакторе. Когда готов — завершай урок.</p>
      </div>
      {lesson.finalTasks.map((t,i)=><TaskCard key={i} task={t} index={i+1}/>)}
      <div className="flex justify-end pt-4"><button onClick={onComplete} className="neon-btn flex items-center gap-2"><Check size={14}/> Завершить урок</button></div>
    </div>
  );
}

function TaskCard({task,index}:{task:import('../data/types').FinalTask; index:number}){
  const [open,setOpen]=useState(false);
  const colors:Record<string,string>={easy:'border-green-500/60 text-green-300 bg-green-500/10', medium:'border-yellow-500/60 text-yellow-300 bg-yellow-500/10', hard:'border-red-500/60 text-red-300 bg-red-500/10'};
  const labels:Record<string,string>={easy:'ЛЁГКО', medium:'СРЕДНЕ', hard:'СЛОЖНО'};
  return (
    <div className="border border-pink-400/40 bg-black/40">
      <button onClick={()=>setOpen(!open)} className="w-full p-3 flex items-center justify-between hover:bg-pink-400/5 text-left">
        <div className="flex items-center gap-3 flex-1"><span className="text-pink-300 font-bold">#{index}</span><span className="text-pink-50 font-semibold text-sm">{task.title}</span></div>
        <span className={`px-2 py-0.5 border text-[10px] uppercase tracking-widest ${colors[task.difficulty]}`}>{labels[task.difficulty]}</span>
      </button>
      {open && <div className="border-t border-pink-400/30 p-4 space-y-3">
        <p className="text-pink-100/90 text-sm leading-relaxed">{task.description}</p>
        {task.hints.length>0 && <div className="border-l-2 border-yellow-500/50 pl-3 space-y-1"><div className="text-yellow-300 text-xs uppercase tracking-widest font-bold">Подсказки:</div>{task.hints.map((h,i)=><div key={i} className="text-yellow-200/80 text-xs">▸ {h}</div>)}</div>}
        <details><summary className="text-pink-300 text-xs uppercase tracking-widest font-bold cursor-pointer">// Решение</summary><pre className="mt-2 p-3 bg-black/50 border border-pink-400/30 text-pink-100 text-xs font-mono overflow-x-auto whitespace-pre">{task.solution}</pre></details>
      </div>}
    </div>
  );
}
