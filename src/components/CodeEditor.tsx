import { useState } from 'react';
import type { CodeTask } from '../data/types';
import { Check, X, Lightbulb, Eye, Sparkles } from 'lucide-react';

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
    if (pass) {
      setResult('success');
      setTimeout(onSuccess, 600);
    } else setResult('fail');
  };

  const reset = () => {
    setCode(task.starter);
    setResult('idle');
  };

  return (
    <div className="border-2 border-pink-400/50 bg-gradient-to-br from-pink-400/5 to-transparent">
      <div className="border-b border-pink-400/30 p-3 flex items-center gap-2">
        <Sparkles size={14} className="text-pink-300" />
        <div className="text-pink-300 font-bold text-xs uppercase tracking-widest">▸ ЗАДАНИЕ</div>
      </div>
      <div className="p-4 space-y-3">
        <p className="text-pink-50 text-sm font-semibold leading-relaxed">{task.instruction}</p>
        <textarea
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            if (result !== 'idle') setResult('idle');
          }}
          rows={Math.min(14, Math.max(4, code.split('\n').length + 1))}
          spellCheck={false}
          className="w-full p-3 font-mono text-sm"
          style={{ background: '#1a0a14' }}
        />
        {result === 'success' && (
          <div className="border-l-4 border-green-500 pl-3 py-2 bg-green-500/10 text-green-200 text-sm flex items-center gap-2">
            <Check size={14} /> Верно!
          </div>
        )}
        {result === 'fail' && (
          <div className="border-l-4 border-red-500 pl-3 py-2 bg-red-500/10 text-red-200 text-sm flex items-center gap-2">
            <X size={14} /> Не совпадает. Попробуй ещё раз.
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={check}
            className="neon-btn text-xs flex items-center gap-1"
          >
            <Check size={12} /> Проверить
          </button>
          <button onClick={reset} className="neon-btn-light text-xs flex items-center gap-1">
            <RotateCcw size={12} /> Сбросить
          </button>
          <button
            onClick={() => setShowHint(!showHint)}
            className="text-yellow-300 text-xs uppercase tracking-widest flex items-center gap-1 hover:text-yellow-200 border border-yellow-500/40 px-2 py-1.5"
          >
            <Lightbulb size={12} /> {showHint ? 'Скрыть подсказку' : 'Подсказка'}
          </button>
          <button
            onClick={() => setShowSolution(!showSolution)}
            className="text-pink-300 text-xs uppercase tracking-widest flex items-center gap-1 hover:text-pink-200 border border-pink-400/40 px-2 py-1.5"
          >
            <Eye size={12} /> {showSolution ? 'Скрыть решение' : 'Показать решение'}
          </button>
        </div>
        {showHint && (
          <div className="border border-yellow-500/30 p-2 bg-yellow-500/5 text-xs text-yellow-200">
            <span className="text-yellow-400 font-bold">▸ </span>
            {task.hint}
          </div>
        )}
        {showSolution && (
          <pre className="border border-pink-400/30 p-3 bg-[#0f050a] text-xs text-pink-100 overflow-x-auto">
            {task.solution}
          </pre>
        )}
      </div>
    </div>
  );
}

// Иконка сброса
function RotateCcw({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v5h5" />
    </svg>
  );
}
