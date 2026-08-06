import { useState } from 'react';
import type { CodeTask } from '../data/types';
import { Check, X, Lightbulb, Eye } from 'lucide-react';

interface CodeEditorProps {
  task: CodeTask;
  onSuccess: () => void;
}

export function CodeEditor({ task, onSuccess }: CodeEditorProps) {
  const [code, setCode] = useState(task.starter);
  const [result, setResult] = useState<'idle' | 'success' | 'fail'>('idle');
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  const check = () => {
    const userCode = code.trim();
    const solution = task.solution.trim();
    const expected = task.expected.trim();
    let pass = false;
    if (task.expectedCheck === 'equals') {
      pass = userCode.replace(/\s+/g, '') === solution.replace(/\s+/g, '');
    } else {
      pass = userCode.includes(expected);
    }
    if (pass) { setResult('success'); setTimeout(onSuccess, 600); } else setResult('fail');
  };
  const reset = () => { setCode(task.starter); setResult('idle'); };
  return (
    <div className="border-2 border-pink-400/50 bg-black/40">
      <div className="border-b border-pink-400/30 p-3 bg-gradient-to-r from-pink-400/5 to-transparent">
        <div className="flex items-start gap-2">
          <div className="text-pink-300 mt-0.5 font-bold text-sm">▸ ЗАДАНИЕ</div>
          <p className="text-pink-50 text-sm leading-relaxed">{task.instruction}</p>
        </div>
      </div>
      <textarea value={code} onChange={(e)=>{setCode(e.target.value); if(result!=='idle') setResult('idle');}} rows={Math.min(14, Math.max(4, code.split('\n').length+1))} spellCheck={false} className="w-full p-3 border-none !border-0 focus:!shadow-none" style={{background:'#1a0a14'}} />
      {result==='success' && <div className="border-t border-green-500/50 p-3 bg-green-500/10 flex items-center gap-2"><Check size={16} className="text-green-400"/><span className="text-green-300 text-sm font-bold uppercase tracking-widest">Верно!</span></div>}
      {result==='fail' && <div className="border-t border-red-500/50 p-3 bg-red-500/10 flex items-center gap-2"><X size={16} className="text-red-400"/><span className="text-red-300 text-sm font-bold uppercase tracking-widest">Не совпадает. Попробуй ещё раз.</span></div>}
      <div className="border-t border-pink-400/30 p-3 flex flex-wrap gap-2 items-center">
        <button onClick={check} className="neon-btn text-xs">Проверить</button>
        <button onClick={reset} className="neon-btn-light text-xs">Сбросить</button>
        <button onClick={()=>setShowHint(!showHint)} className="text-yellow-300 text-xs uppercase tracking-widest flex items-center gap-1 hover:text-yellow-200 border border-yellow-500/40 px-2 py-1.5"><Lightbulb size={12}/> {showHint?'Скрыть подсказку':'Подсказка'}</button>
        <button onClick={()=>setShowSolution(!showSolution)} className="text-pink-300 text-xs uppercase tracking-widest flex items-center gap-1 hover:text-pink-200 border border-pink-400/40 px-2 py-1.5"><Eye size={12}/> {showSolution?'Скрыть решение':'Показать решение'}</button>
      </div>
      {showHint && <div className="border-t border-pink-400/30 p-3 bg-yellow-500/5"><p className="text-yellow-200 text-xs leading-relaxed"><span className="text-yellow-400 font-bold">▸ </span>{task.hint}</p></div>}
      {showSolution && <div className="border-t border-pink-400/30 p-3 bg-pink-400/5"><pre className="text-pink-100 text-xs font-mono whitespace-pre-wrap">{task.solution}</pre></div>}
    </div>
  );
}
