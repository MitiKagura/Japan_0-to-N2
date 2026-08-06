import { useState, useMemo } from 'react';
import { kanjiList } from '../data/kanji';
import { kanjiStrokes } from '../data/kanjiSvg';
import { KanjiWriter } from './KanjiWriter';
import { X, PenLine, Search, BookOpen, Sparkles } from 'lucide-react';

export function KanjiGrid(){
  const [jlpt,setJlpt]=useState<'all'|'N5'|'N4'|'N3'|'N2'>('all');
  const [query,setQuery]=useState('');
  const [selected,setSelected]=useState<typeof kanjiList[number]|null>(null);
  const [writerSize, setWriterSize] = useState(260);

  const filtered = useMemo(() => {
    let f = kanjiList;
    if (jlpt !== 'all') f = f.filter((k) => k.jlpt === jlpt);
    if (query) {
      const q = query.toLowerCase();
      f = f.filter((k) =>
        k.char.includes(query) ||
        k.meaning.toLowerCase().includes(q) ||
        k.onyomi.some((o) => o.toLowerCase().includes(q)) ||
        k.kunyomi.some((o) => o.includes(query))
      );
    }
    return f;
  }, [jlpt, query]);

  const totalCount = kanjiList.length;
  const animatedCount = Object.keys(kanjiStrokes).length;

  return (
    <div className="space-y-4">
      <div className="border-2 border-pink-400 p-4 bg-gradient-to-br from-pink-400/10 to-transparent">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-2xl font-bold neon-text flex items-center gap-2">
              <BookOpen size={22}/> Кандзи
            </h2>
            <p className="text-pink-200/80 text-sm mt-1 max-w-2xl">
              Полный набор JLPT N5–N2: <b className="text-pink-200">{totalCount}</b> знаков. <b className="text-pink-200">{animatedCount}</b> из них — с настоящей анимацией штрихов (рисуются по очереди как пишет каллиграф). Остальные — с текстовым порядком.
              Кликни на знак — откроется модалка с большой анимацией, чтениями и примерами.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-pink-300/70">
            <Sparkles size={12} className="text-pink-300" />
            <span>{animatedCount} с анимацией</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap items-center">
        <div className="flex gap-1 border border-pink-400/40 p-1 bg-black/60">
          {(['all','N5','N4','N3','N2'] as const).map((j) => (
            <button
              key={j}
              onClick={() => setJlpt(j)}
              className={`px-3 py-1.5 text-xs uppercase tracking-widest font-bold border transition-all ${
                jlpt === j
                  ? 'bg-pink-400 text-black border-pink-400'
                  : 'border-transparent text-pink-300 hover:border-pink-400/50'
              }`}
            >
              {j === 'all' ? `Все (${totalCount})` : j}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-pink-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск: 日, солнце, ニチ..."
            className="w-full pl-8"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
        {filtered.map((k) => {
          const hasAnim = !!kanjiStrokes[k.char];
          return (
            <button
              key={k.char}
              onClick={() => setSelected(k)}
              className="kana-cell p-3 aspect-square relative"
              title={hasAnim ? 'С анимацией штрихов' : 'Текстовый порядок'}
            >
              {hasAnim && (
                <span className="absolute top-1 right-1 text-pink-300/70 text-[8px]">★</span>
              )}
              <span className="text-3xl md:text-4xl text-pink-100 leading-none" style={{ fontFamily: 'serif' }}>
                {k.char}
              </span>
              <span className="text-[10px] text-pink-300/70 uppercase tracking-widest mt-1">
                {k.jlpt} · {k.strokes || '—'} черт
              </span>
              <span className="text-[10px] text-pink-200/90 leading-tight text-center mt-1 line-clamp-1">
                {k.meaning}
              </span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="border border-dashed border-pink-400/40 p-10 text-center text-pink-300">
          Ничего не найдено.
        </div>
      )}

      {selected && (
        <div className="stroke-overlay" onClick={() => setSelected(null)}>
          <div
            className="border-2 border-pink-400 bg-[#1a0a14] p-6 max-w-2xl w-full max-h-[92vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute top-2 right-2 z-10 p-1 border border-pink-400 text-pink-300 hover:bg-pink-400 hover:text-black"
            >
              <X size={16} />
            </button>

            <div className="text-center mb-3">
              <div className="inline-flex gap-2 flex-wrap justify-center mb-2">
                <span className="tag-sakura">{selected.jlpt}</span>
                <span className="tag-light">{selected.strokes} черт</span>
                {selected.radicals && <span className="tag-deep">{selected.radicals}</span>}
                {kanjiStrokes[selected.char] && <span className="tag-sakura">★ анимация</span>}
              </div>
              <h3 className="text-3xl text-pink-100 mb-1" style={{ fontFamily: 'serif' }}>{selected.char}</h3>
              <div className="text-pink-200 font-bold">{selected.meaning}</div>
              <div className="text-pink-300/80 text-xs mt-1">
                音: {selected.onyomi.join('、') || '—'} / 訓: {selected.kunyomi.join('、') || '—'}
              </div>
            </div>

            <div className="flex justify-center my-4">
              <KanjiWriter char={selected.char} size={writerSize} autoPlay={false} />
            </div>

            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="text-[10px] uppercase tracking-widest text-pink-300/70">Размер:</span>
              <button
                onClick={() => setWriterSize(180)}
                className={`text-[10px] px-2 py-1 border ${writerSize === 180 ? 'bg-pink-400 text-black border-pink-400' : 'border-pink-400/40 text-pink-300'}`}
              >М</button>
              <button
                onClick={() => setWriterSize(260)}
                className={`text-[10px] px-2 py-1 border ${writerSize === 260 ? 'bg-pink-400 text-black border-pink-400' : 'border-pink-400/40 text-pink-300'}`}
              >XL</button>
              <button
                onClick={() => setWriterSize(340)}
                className={`text-[10px] px-2 py-1 border ${writerSize === 340 ? 'bg-pink-400 text-black border-pink-400' : 'border-pink-400/40 text-pink-300'}`}
              >XXL</button>
            </div>

            {kanjiStrokes[selected.char] ? (
              <div className="border border-pink-400/30 p-3 bg-pink-400/5 space-y-2 mb-3">
                <div className="text-pink-300 text-xs uppercase tracking-widest font-bold flex items-center gap-1">
                  <PenLine size={12} /> Пошаговый порядок черт
                </div>
                <ol className="space-y-1.5 text-sm">
                  {kanjiStrokes[selected.char].map((s, i) => (
                    <li key={i} className="flex gap-2 items-start border-l-2 border-pink-400/40 pl-3 py-0.5">
                      <span className="text-pink-400 font-bold w-5 shrink-0">{i + 1}.</span>
                      <span className="text-pink-100/90 flex-1">{s.hint}</span>
                      <span className="text-pink-300/60 text-lg shrink-0">{s.direction}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ) : selected.strokeOrder.length > 0 ? (
              <div className="border border-pink-400/30 p-3 bg-pink-400/5 space-y-1 mb-3">
                <div className="text-pink-300 text-xs uppercase tracking-widest font-bold">Порядок черт (текст)</div>
                <ol className="space-y-1 text-sm text-pink-100/90">
                  {selected.strokeOrder.map((s, i) => (
                    <li key={i}>{i + 1}. {s}</li>
                  ))}
                </ol>
              </div>
            ) : null}

            {selected.examples.length > 0 && (
              <div className="border border-pink-400/30 p-3 bg-black/40">
                <div className="text-pink-300 text-xs uppercase tracking-widest font-bold mb-2">Примеры</div>
                {selected.examples.map((ex, i) => (
                  <div key={i} className="flex justify-between gap-2 text-sm border-b border-pink-400/20 py-1.5 last:border-0">
                    <span className="text-pink-100 font-bold">
                      {ex.word} <span className="text-pink-300/70 font-normal">({ex.reading})</span>
                    </span>
                    <span className="text-pink-300/80 text-xs self-center">{ex.meaning}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-3 text-pink-400/60 text-[10px] leading-relaxed">
              Правила кандзи: сверху вниз, слева направо; горизонталь — перед вертикалью; внешнее — перед внутренним; центр — перед крыльями (показывается стрелкой направления в углу).
            </div>

            <button
              onClick={() => setSelected(null)}
              className="neon-btn w-full mt-4"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
