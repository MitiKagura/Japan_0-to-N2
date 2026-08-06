import { useState, useMemo } from 'react';
import { Search, BookOpen, Sparkles } from 'lucide-react';
import { kanjiList } from '../data/kanji';
import { kanjiStrokes } from '../data/kanjiSvg';
import { KanjiWriter } from './KanjiWriter';
import type { KanjiChar } from '../data/types';

/**
 * Извлекает символ направления из строки типа "1. Горизонталь слева направо" → "→"
 * Если ничего не найдено — null.
 */
function inferStrokeDirection(text: string): string | null {
  const t = text.toLowerCase();
  // Японские слова
  if (t.includes('横') || t.includes('左から右') || t.includes('左→右')) return '→';
  if (t.includes('縦') || t.includes('上から下') || t.includes('上→下')) return '↓';
  if (t.includes('右上') || t.includes('右下から左上')) return '↖';
  if (t.includes('左上') || t.includes('左下から右上')) return '↗';
  if (t.includes('右下') || t.includes('左上から右下')) return '↘';
  if (t.includes('左下') || t.includes('右上から左下')) return '↙';
  // Русские слова
  if (t.includes('справа')) return '←';
  if (t.includes('слева') && t.includes('направо')) return '→';
  if (t.includes('сверху') && t.includes('вниз')) return '↓';
  if (t.includes('снизу') && t.includes('вверх')) return '↑';
  if (t.includes('диагональ') || t.includes('наклон')) return '↘';
  if (t.includes('крюк') || t.includes('крючком')) return '↻';
  if (t.includes('петл') || t.includes('изгиб')) return '↻';
  return null;
}

const JLPT_LEVELS = ['all', 'N5', 'N4', 'N3', 'N2'] as const;

export function KanjiGrid() {
  const [filter, setFilter] = useState<(typeof JLPT_LEVELS)[number]>('all');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<KanjiChar | null>(null);
  const [size, setSize] = useState(280);

  const filtered = useMemo(() => {
    return kanjiList.filter((k) => {
      if (filter !== 'all' && k.jlpt !== filter) return false;
      if (query) {
        const q = query.toLowerCase();
        return (
          k.char.includes(query) ||
          k.meaning.toLowerCase().includes(q) ||
          k.onyomi.some((o) => o.toLowerCase().includes(q)) ||
          k.kunyomi.some((u) => u.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [filter, query]);

  const totalCount = kanjiList.length;
  const animatedCount = kanjiList.filter((k) => kanjiStrokes[k.char]).length;

  return (
    <div className="space-y-4">
      <div className="border-2 border-pink-400 p-4 bg-gradient-to-br from-pink-400/10 to-transparent flex flex-wrap items-center gap-3">
        <div>
          <h2 className="text-2xl font-bold neon-text flex items-center gap-2">
            <BookOpen size={22} /> Кандзи
          </h2>
          <p className="text-pink-200/80 text-sm mt-1 max-w-2xl">
            Полный набор JLPT N5–N2: <b className="text-pink-200">{totalCount}</b> знаков.{' '}
            <b className="text-pink-200">{animatedCount}</b> из них — с настоящей покадровой анимацией
            штрихов (рисуются по очереди как пишет каллиграф). Остальные — fallback на AnimCJK.
            <br />
            Кликни на знак — откроется модалка с большой анимацией, чтениями и примерами.
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2 text-[10px] uppercase tracking-widest text-pink-300/70">
          <Sparkles size={12} className="text-pink-300" />
          <span>{animatedCount} с анимацией</span>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap items-center">
        {JLPT_LEVELS.map((j) => (
          <button
            key={j}
            type="button"
            onClick={() => setFilter(j)}
            className={`px-3 py-1 text-xs uppercase tracking-widest border ${
              filter === j
                ? 'border-pink-400 bg-pink-400/10 text-pink-200'
                : 'border-pink-400/30 text-pink-300/70 hover:border-pink-400/60'
            }`}
          >
            {j === 'all' ? 'Все' : j}
          </button>
        ))}
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

      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
        {filtered.map((k) => {
          const hasAnim = !!kanjiStrokes[k.char];
          return (
            <button
              key={k.char}
              type="button"
              onClick={() => setSelected(k)}
              className="aspect-square border-2 border-pink-400/40 bg-[#1a0a14] hover:border-pink-400 hover:bg-pink-400/10 transition flex flex-col items-center justify-center gap-0.5 group"
              title={`${k.char} — ${k.meaning}`}
            >
              <div
                className="text-2xl text-pink-100 group-hover:text-pink-200 leading-none"
                style={{ fontFamily: 'Noto Serif JP, Yu Mincho, serif' }}
              >
                {k.char}
              </div>
              {hasAnim && <Sparkles size={8} className="text-pink-300" />}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="border border-dashed border-pink-400/30 p-6 text-center text-sm text-pink-300/70">
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
              type="button"
              onClick={() => setSelected(null)}
              className="absolute top-2 right-2 text-pink-300 hover:text-pink-200 p-1"
            >
              ✕
            </button>
            <div className="text-center mb-3">
              <div className="flex items-center justify-center gap-2 flex-wrap mb-1">
                <span className="tag-sakura">{selected.jlpt}</span>
                <span className="tag-light">{selected.strokes} черт</span>
                {selected.radicals && <span className="tag-deep">{selected.radicals}</span>}
                {kanjiStrokes[selected.char] && (
                  <span className="tag-sakura">★ анимация</span>
                )}
              </div>
              <h3
                className="text-5xl text-pink-100 mb-1"
                style={{ fontFamily: 'Noto Serif JP, Yu Mincho, serif' }}
              >
                {selected.char}
              </h3>
              <p className="text-pink-200">{selected.meaning}</p>
              <p className="text-pink-300/80 text-xs mt-1">
                音: {selected.onyomi.join('、') || '—'} / 訓: {selected.kunyomi.join('、') || '—'}
              </p>
            </div>

            <div className="flex justify-center mb-3">
              <KanjiWriter char={selected.char} size={size} showControls={true} autoPlay={true} speedMs={600} />
            </div>

            <div className="text-[10px] uppercase tracking-widest text-pink-300/70 mb-1 flex items-center gap-2">
              <span>Размер:</span>
              <input
                type="range"
                min={180}
                max={400}
                step={20}
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="flex-1"
              />
              <span className="font-mono text-pink-200">{size}px</span>
            </div>

            {/* Список штрихов с направлениями — для ВСЕХ кандзи */}
            {(() => {
              // Приоритет: детальные данные из kanjiStrokes
              if (kanjiStrokes[selected.char]) {
                return (
                  <div className="border border-pink-400/30 p-3 bg-pink-400/5 space-y-2 mb-3">
                    <p className="text-pink-300 text-xs uppercase tracking-widest font-bold">
                      ▸ Пошаговый порядок черт
                    </p>
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
                );
              }
              // Иначе — извлекаем направления из текстового strokeOrder
              if (selected.strokeOrder.length > 0) {
                return (
                  <div className="border border-pink-400/30 p-3 bg-pink-400/5 space-y-1 mb-3">
                    <p className="text-pink-300 text-xs uppercase tracking-widest font-bold">
                      ▸ Порядок черт
                    </p>
                    <ol className="space-y-1.5 text-sm">
                      {selected.strokeOrder.map((s, i) => {
                        const dir = inferStrokeDirection(s);
                        return (
                          <li key={i} className="flex gap-2 items-start border-l-2 border-pink-400/40 pl-3 py-0.5">
                            <span className="text-pink-400 font-bold w-5 shrink-0">{i + 1}.</span>
                            <span className="text-pink-100/90 flex-1">{s}</span>
                            {dir && <span className="text-pink-300/60 text-lg shrink-0">{dir}</span>}
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                );
              }
              return null;
            })()}

            {selected.examples.length > 0 && (
              <div className="border border-pink-400/30 p-3 bg-black/40">
                <p className="text-pink-300 text-xs uppercase tracking-widest font-bold mb-1">▸ Примеры</p>
                <div className="space-y-1">
                  {selected.examples.map((ex, i) => (
                    <div key={i} className="flex items-baseline gap-2">
                      <span className="text-pink-100 font-bold" style={{ fontFamily: 'Noto Serif JP, Yu Mincho, serif' }}>
                        {ex.word} <span className="text-pink-300/70 font-normal text-xs">({ex.reading})</span>
                      </span>
                      <span className="text-pink-300/80 text-xs">— {ex.meaning}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-pink-300/70 text-xs mt-3">
              Правила кандзи: сверху вниз, слева направо; горизонталь — перед вертикалью; внешнее — перед внутренним; центр — перед крыльями (показывается стрелкой направления).
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
