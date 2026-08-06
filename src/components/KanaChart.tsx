import { useState } from 'react';
import type { KanaChar } from '../data/types';
import { X, PenLine } from 'lucide-react';

export function KanaChart({ title, data }: { title: string; data: KanaChar[] }) {
  const [selected, setSelected] = useState<KanaChar | null>(null);
  const [filter, setFilter] = useState<'all'|'gojuuon'|'dakuon'|'handakuon'|'yoon'>('all');
  const filtered = filter==='all' ? data : data.filter(k=>k.type===filter);
  const groups: Record<string, KanaChar[]> = {};
  filtered.forEach(k=>{
    const t = k.type;
    if(!groups[t]) groups[t]=[];
    groups[t].push(k);
  });
  const labels:Record<string,string>={gojuuon:'Годзюон (базовые)', dakuon:'Дакуон (озвонч.)', handakuon:'Хандакуон', yoon:'Ёон'};
  return (
    <div className="space-y-4">
      <div className="border-2 border-pink-400 p-4 bg-gradient-to-br from-pink-400/10 to-transparent">
        <h2 className="text-2xl font-bold neon-text">{title}</h2>
        <p className="text-pink-200/80 text-sm mt-1">Кликни на любой знак — увидишь порядок черт с направлением. Не закрывай, пока не запомнишь.</p>
      </div>
      <div className="flex gap-1 flex-wrap border border-pink-400/40 p-1 bg-black/60">
        {(['all','gojuuon','dakuon','handakuon','yoon'] as const).map(f=>(
          <button key={f} onClick={()=>setFilter(f)} className={`px-3 py-1.5 text-xs uppercase tracking-widest font-bold border transition-all ${filter===f?'bg-pink-400 text-black border-pink-400':'border-transparent text-pink-300 hover:border-pink-400/50'}`}>{f==='all'?'Все':labels[f]}</button>
        ))}
      </div>
      {Object.entries(groups).map(([type, chars])=>(
        <div key={type}>
          <h3 className="text-pink-300 text-xs uppercase tracking-widest font-bold mb-2 border-l-4 border-pink-400 pl-2">{labels[type]} — {chars.length}</h3>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-1">
            {chars.map(c=>(
              <button key={c.kana} onClick={()=>setSelected(c)} className="kana-cell p-2">
                <span className="text-2xl md:text-3xl text-pink-100 leading-none">{c.kana}</span>
                <span className="text-[10px] text-pink-300/70 uppercase tracking-widest mt-1">{c.romaji}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
      {selected && (
        <div className="stroke-overlay" onClick={()=>setSelected(null)}>
          <div className="border-2 border-pink-400 bg-[#1a0a14] p-6 max-w-md w-full relative" onClick={e=>e.stopPropagation()}>
            <button onClick={()=>setSelected(null)} className="absolute top-2 right-2 p-1 border border-pink-400 text-pink-300 hover:bg-pink-400 hover:text-black"><X size={16}/></button>
            <div className="text-center mb-4">
              <div className="text-7xl text-pink-100 mb-2" style={{fontFamily:'serif'}}>{selected.kana}</div>
              <div className="text-pink-300 font-bold tracking-widest uppercase text-sm">{selected.romaji} — {selected.strokes} черт(ы)</div>
              <div className="text-pink-400/60 text-xs mt-1">{selected.example}</div>
            </div>
            <div className="border border-pink-400/30 p-3 bg-pink-400/5 space-y-2">
              <div className="text-pink-300 text-xs uppercase tracking-widest font-bold flex items-center gap-1"><PenLine size={12}/> Порядок черт</div>
              {selected.strokeOrder.map((s,i)=>(
                <div key={i} className="flex gap-2 text-sm">
                  <span className="text-pink-400 font-bold w-6 shrink-0">{i+1}.</span>
                  <span className="text-pink-100/90">{s}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 text-pink-400/60 text-xs leading-relaxed">Правило: сверху вниз, слева направо. Горизонталь — слева направо, вертикаль — сверху вниз. Тренируйся, не закрывай пока не запомнишь.</div>
            <button onClick={()=>setSelected(null)} className="neon-btn w-full mt-4">Закрыть</button>
          </div>
        </div>
      )}
    </div>
  );
}
