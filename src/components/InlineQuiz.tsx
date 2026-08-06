import { useState } from 'react';
import type { InlineQuestion } from '../data/types';
import { Check, X, Lightbulb, ArrowRight } from 'lucide-react';

export function InlineQuiz({ question, onSuccess }: { question: InlineQuestion; onSuccess: () => void }) {
  const [selected, setSelected] = useState<number|null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const handleSelect = (i:number) => {
    if(showResult) return;
    setSelected(i); setShowResult(true);
    if(i===question.correct) setTimeout(onSuccess,700);
  };
  const retry = () => { setSelected(null); setShowResult(false); setShowHint(false); };
  const isCorrect = selected===question.correct;
  return (
    <div className="border-2 border-pink-400/50 bg-gradient-to-br from-pink-400/5 to-transparent">
      <div className="border-b border-pink-400/30 p-3 flex items-center gap-2">
        <div className="text-pink-300 font-bold text-xs uppercase tracking-widest">▸ БЫСТРАЯ ПРОВЕРКА</div>
        <span className="text-pink-400/60 text-xs">— ответь, чтобы продолжить</span>
      </div>
      <div className="p-4 space-y-3">
        <p className="text-pink-50 text-sm font-semibold leading-relaxed">{question.question}</p>
        <div className="space-y-2">
          {question.options.map((opt,i)=>{
            const correct=i===question.correct; const isSel=i===selected;
            let cls='border-pink-400/30 hover:border-pink-300 hover:bg-pink-400/5 text-pink-50';
            if(showResult && correct) cls='border-green-500 bg-green-500/20 text-green-200';
            else if(showResult && isSel && !correct) cls='border-red-500 bg-red-500/20 text-red-200';
            return (
              <button key={i} onClick={()=>handleSelect(i)} disabled={showResult} className={`w-full text-left p-2.5 border ${cls} transition-all text-sm flex items-center gap-2`}>
                <span className="text-pink-300 font-bold w-5">{String.fromCharCode(65+i)}.</span>
                <span className="flex-1">{opt}</span>
                {showResult && correct && <Check size={14} className="text-green-400"/>}
                {showResult && isSel && !correct && <X size={14} className="text-red-400"/>}
              </button>
            );
          })}
        </div>
        {showResult && (
          <div className={`border-l-4 pl-3 py-2 text-xs leading-relaxed ${isCorrect?'border-green-500 bg-green-500/10 text-green-200':'border-red-500 bg-red-500/10 text-red-200'}`}>
            <span className="font-bold uppercase tracking-widest mr-1">{isCorrect?'✓ Правильно':'✗ Неверно'}:</span>{question.explanation}
          </div>
        )}
        {showResult && isCorrect && <div className="flex justify-end"><button onClick={onSuccess} className="neon-btn text-xs flex items-center gap-1">Дальше <ArrowRight size={12}/></button></div>}
        {showResult && !isCorrect && (
          <div className="flex justify-between items-center flex-wrap gap-2">
            {question.hint && <button onClick={()=>setShowHint(!showHint)} className="text-yellow-300 text-xs uppercase tracking-widest flex items-center gap-1 hover:text-yellow-200"><Lightbulb size={12}/> {showHint?'Скрыть подсказку':'Показать подсказку'}</button>}
            <button onClick={retry} className="neon-btn-light text-xs">Попробовать снова</button>
          </div>
        )}
        {showHint && question.hint && <div className="border border-yellow-500/30 p-2 bg-yellow-500/5 text-xs text-yellow-200"><span className="text-yellow-400 font-bold">▸ </span>{question.hint}</div>}
      </div>
    </div>
  );
}
