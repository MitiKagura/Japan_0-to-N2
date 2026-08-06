import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import type { KanaChar } from '../data/types';
import { JapaneseStrokeWriter } from './JapaneseStrokeWriter';

interface KanaChartProps {
  title: string;
  chars: KanaChar[];
}

export function KanaChart({ title, chars }: KanaChartProps) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'gojuuon' | 'dakuon' | 'handakuon' | 'yoon'>('all');
  const [selected, setSelected] = useState<KanaChar | null>(null);

  const filtered = useMemo(() => {
    return chars.filter((c) => {
      if (filter !== 'all' && c.type !== filter) return false;
      if (query) {
        const q = query.toLowerCase();
        return c.kana.includes(query) || c.romaji.toLowerCase().includes(q) || (c.example ?? '').toLowerCase().includes(q);
      }
      return true;
    });
  }, [chars, query, filter]);

  const groups = useMemo(() => {
    const g: Record<string, KanaChar[]> = {};
    filtered.forEach((k) => {
      const t = k.type;
      if (!g[t]) g[t] = [];
      g[t].push(k);
    });
    return g;
  }, [filtered]);

  const labels: Record<string, string> = {
    gojuuon: 'Годзюон (базовые)',
    dakuon: 'Дакуон (озвонч.)',
    handakuon: 'Хандакуон',
    yoon: 'Ёон',
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-pink-400 p-4 bg-gradient-to-br from-pink-400/10 to-transparent">
        <h2 className="text-2xl font-bold neon-text">{title}</h2>
        <p className="text-pink-200/80 text-sm mt-1">
          Кликни на любой знак — увидишь порядок черт с направлением. Не закрывай, пока не запомнишь.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        {(['all', 'gojuuon', 'dakuon', 'handakuon', 'yoon'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`px-3 py-1 text-xs uppercase tracking-widest border ${
              filter === f
                ? 'border-pink-400 bg-pink-400/10 text-pink-200'
                : 'border-pink-400/30 text-pink-300/70 hover:border-pink-400/60'
            }`}
          >
            {f === 'all' ? 'Все' : labels[f]}
          </button>
        ))}
        <div className="relative flex-1 min-w-[180px]">
          <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-pink-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск: あ, ka…"
            className="w-full pl-8"
          />
        </div>
      </div>

      {Object.entries(groups).map(([type, list]) => (
        <div key={type}>
          <h3 className="text-pink-300 text-xs uppercase tracking-widest font-bold mb-2 border-l-4 border-pink-400 pl-2">
            {labels[type] ?? type} — {list.length}
          </h3>
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
            {list.map((c) => (
              <button
                key={c.kana}
                type="button"
                onClick={() => setSelected(c)}
                className="kana-cell"
                title={c.example}
              >
                <div className="text-3xl text-pink-100 leading-none">{c.kana}</div>
                <div className="text-[10px] text-pink-300/70 mt-0.5">{c.romaji}</div>
              </button>
            ))}
          </div>
        </div>
      ))}

      {selected && (
        <div className="stroke-overlay" onClick={() => setSelected(null)}>
          <div
            className="border-2 border-pink-400 bg-[#1a0a14] p-6 max-w-md w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="absolute top-2 right-2 text-pink-300 hover:text-pink-200 p-1"
            >
              ✕
            </button>
            <div className="text-center mb-4">
              <div className="text-6xl neon-text-soft mb-1">{selected.kana}</div>
              <div className="text-pink-200 text-sm font-mono">
                {selected.romaji} — {selected.strokes} штрих(ов)
              </div>
              {selected.example && (
                <div className="text-pink-300/70 text-xs mt-1">{selected.example}</div>
              )}
            </div>

            {/* Правильная анимация: JapaneseStrokeWriter (animCJK) */}
            <div className="flex justify-center mb-4">
              <JapaneseStrokeWriter
                symbol={selected.kana}
                strokes={selected.strokes}
                size={240}
                strokeOrder={selected.strokeOrder}
              />
            </div>

            <div className="border border-pink-400/30 p-3 bg-pink-400/5 space-y-2">
              <p className="text-pink-300 text-xs uppercase tracking-widest font-bold">
                ▸ Порядок черт
              </p>
              <ol className="space-y-1 text-sm text-pink-100/90">
                {selected.strokeOrder.map((s, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-pink-400 font-bold w-5 shrink-0">{i + 1}.</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
            </div>

            <p className="mt-3 text-xs text-pink-300/70">
              Правило: сверху вниз, слева направо. Горизонталь — слева направо, вертикаль — сверху вниз.
              Тренируйся, не закрывай пока не запомнишь.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
