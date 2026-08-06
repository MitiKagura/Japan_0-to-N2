import { useEffect, useState, useRef } from 'react';
import { hiraganaStrokes, katakanaStrokes, type KanaStroke } from '../data/kana_strokes';
import { JapaneseStrokeWriter } from './JapaneseStrokeWriter';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface KanjiWriterProps {
  char: string;
  size?: number;
  showControls?: boolean;
  autoPlay?: boolean;
  /** мс на штрих */
  speedMs?: number;
  /** показать весь символ сразу без анимации */
  noAnimation?: boolean;
}

/**
 * Превращает массив точек [x,y] в SVG path, который можно анимировать
 * через stroke-dasharray / stroke-dashoffset от начала к концу.
 *
 * Точки в kana_strokes.ts упорядочены в правильном направлении написания —
 * от старта штриха к концу — поэтому анимация отрисует штрих
 * ровно так, как его пишет каллиграф.
 */
function pointsToPath(points: [number, number][]): string {
  if (points.length === 0) return '';
  let d = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 1; i < points.length; i++) {
    d += ` L ${points[i][0]} ${points[i][1]}`;
  }
  return d;
}

function isKana(char: string): boolean {
  // Хирагана 0x3040-0x309F, катакана 0x30A0-0x30FF, полуширокая кана 0xFF65-0xFF9F
  const code = char.codePointAt(0);
  if (!code) return false;
  return (
    (code >= 0x3040 && code <= 0x309f) ||
    (code >= 0x30a0 && code <= 0x30ff) ||
    (code >= 0xff65 && code <= 0xff9f)
  );
}

function getKanaStrokes(char: string): KanaStroke[] | null {
  return hiraganaStrokes[char] ?? katakanaStrokes[char] ?? null;
}

/**
 * KanjiWriter — правильная поэтапная анимация написания.
 *
 * 1. КАНА (хирагана/катакана) — БАЗОВЫЕ знаки рисуются локально
 *    через stroke-dasharray по точкам из kana_strokes.ts. Штрихи
 *    упорядочены в правильном направлении. Для базовых знаков
 *    (あ-ん, ア-ン) это работает хорошо.
 *
 *    Для DAKUTEN/HANDAKUOTN (が, ぱ, ガ, パ) и YÖON (きゃ, きゅ, キャ и т.д.)
 *    данных в kana_strokes.ts нет, поэтому они идут в JapaneseStrokeWriter
 *    (animCJK), где медианы нарисованы профессионально.
 *
 * 2. КАНДЗИ — ВСЕГДА отдаётся в JapaneseStrokeWriter (animCJK). Там
 *    профессиональные SVG с правильно прорисованными медианами каждого
 *    штриха, которые анимируются через stroke-dasharray по median-кривой.
 *    Это единственный способ гарантировать правильное начертание.
 */
export function KanjiWriter({
  char,
  size = 260,
  showControls = true,
  autoPlay = true,
  speedMs = 700,
  noAnimation = false,
}: KanjiWriterProps) {
  // Кандзи → ВСЕГДА JapaneseStrokeWriter (animCJK)
  if (!isKana(char)) {
    return (
      <JapaneseStrokeWriter
        symbol={char}
        strokes={1}
        size={size}
        strokeOrder={[]}
      />
    );
  }

  // Кана — пытаемся локальный рендер.
  // Если данных нет (ёон, dakuten, handakuten) — fallback на animCJK.
  const strokes = getKanaStrokes(char);
  if (!strokes || strokes.length === 0) {
    return (
      <JapaneseStrokeWriter
        symbol={char}
        strokes={1}
        size={size}
        strokeOrder={[]}
      />
    );
  }

  return (
    <KanaAnimator
      char={char}
      strokes={strokes}
      size={size}
      showControls={showControls}
      autoPlay={autoPlay}
      speedMs={speedMs}
      noAnimation={noAnimation}
    />
  );
}

/** Аниматор для каны — локальный рендер по точкам. */
function KanaAnimator({
  char,
  strokes,
  size,
  showControls,
  autoPlay,
  speedMs,
  noAnimation,
}: {
  char: string;
  strokes: KanaStroke[];
  size: number;
  showControls: boolean;
  autoPlay: boolean;
  speedMs: number;
  noAnimation: boolean;
}) {
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(autoPlay);
  const [revealed, setRevealed] = useState(noAnimation);
  const timer = useRef<number | null>(null);

  const total = strokes.length;

  useEffect(() => {
    setCurrent(0);
    setRevealed(noAnimation);
    setPlaying(autoPlay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [char, autoPlay, noAnimation]);

  useEffect(() => {
    if (!playing) return;
    if (current >= total) {
      setPlaying(false);
      return;
    }
    timer.current = window.setTimeout(() => {
      setCurrent((c) => c + 1);
    }, speedMs);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [current, playing, total, speedMs]);

  const reset = () => {
    setCurrent(0);
    setRevealed(noAnimation);
    setPlaying(autoPlay);
  };

  const prev = () => {
    setCurrent((c) => Math.max(0, c - 1));
    setPlaying(false);
    setRevealed(false);
  };

  const next = () => {
    setCurrent((c) => Math.min(total, c + 1));
    setPlaying(false);
  };

  const revealAll = () => {
    setRevealed(true);
    setCurrent(total);
    setPlaying(false);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative border-2 border-pink-400/60 bg-[#0f050a] overflow-hidden"
        style={{ width: size, height: size }}
      >
        {/* Сетка для каллиграфии */}
        <svg
          className="absolute inset-0 pointer-events-none z-10"
          viewBox="0 0 100 100"
          width={size}
          height={size}
        >
          <line x1="0" y1="50" x2="100" y2="50" stroke="#ff6b9d" strokeOpacity="0.12" strokeDasharray="2 2" strokeWidth="0.5" />
          <line x1="50" y1="0" x2="50" y2="100" stroke="#ff6b9d" strokeOpacity="0.12" strokeDasharray="2 2" strokeWidth="0.5" />
          <line x1="0" y1="0" x2="100" y2="100" stroke="#ff6b9d" strokeOpacity="0.08" strokeDasharray="2 2" strokeWidth="0.5" />
          <line x1="100" y1="0" x2="0" y2="100" stroke="#ff6b9d" strokeOpacity="0.08" strokeDasharray="2 2" strokeWidth="0.5" />
        </svg>

        {/* Серый контур шрифта — база */}
        <div
          className="absolute inset-0 flex items-center justify-center text-pink-100/10 pointer-events-none select-none"
          style={{
            fontFamily: 'Noto Serif JP, Yu Mincho, Hiragino Mincho ProN, serif',
            fontSize: size * 0.72,
            lineHeight: 1,
          }}
        >
          {char}
        </div>

        {/* Правильная поэтапная анимация: stroke-dasharray на каждом штрихе */}
        <svg
          className="absolute inset-0 z-20"
          viewBox="0 0 100 100"
          width={size}
          height={size}
        >
          {strokes.map((s, i) => {
            const visible = revealed || i < current;
            const isCurrent = i === current && !revealed && !noAnimation;
            const pathData = pointsToPath(s.points);

            return (
              <g key={i}>
                {/* Контур следующего штриха — лёгкая подсказка */}
                {isCurrent && (
                  <path
                    d={pathData}
                    fill="none"
                    stroke="#ff6b9d"
                    strokeOpacity="0.2"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
                {/* Сам штрих — рисуется stroke-dasharray в правильном направлении */}
                {visible && (
                  <path
                    d={pathData}
                    fill="none"
                    stroke="#ff6b9d"
                    strokeOpacity={0.95}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      filter: 'drop-shadow(0 0 4px #ff6b9d) drop-shadow(0 0 8px rgba(255,107,157,.55))',
                      strokeDasharray: 200,
                      strokeDashoffset: isCurrent ? 200 : 0,
                      animation: isCurrent ? 'cjk-stroke 0.7s ease-out forwards' : undefined,
                    }}
                  />
                )}
                {/* Точка пера на старте текущего штриха */}
                {isCurrent && s.points.length > 0 && (
                  <circle
                    cx={s.points[0][0]}
                    cy={s.points[0][1]}
                    r="3.5"
                    fill="#fff"
                    style={{
                      filter: 'drop-shadow(0 0 6px #ff6b9d) drop-shadow(0 0 12px #ff1f6b)',
                      animation: 'pulse-brush 0.6s infinite alternate',
                    }}
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Прогресс */}
        <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-pink-400/90 text-black text-[10px] font-bold border border-pink-200 z-30 uppercase tracking-widest">
          {current}/{total}
        </div>

        {/* Финальный эффект */}
        {current >= total && (
          <div className="absolute inset-0 bg-pink-500/5 pointer-events-none animate-pulse z-0" />
        )}
      </div>

      {/* Подпись с текущим штрихом и направлением */}
      <div className="text-[10px] uppercase tracking-widest text-pink-300/80 text-center max-w-[260px] leading-tight">
        {strokes[Math.min(current, total - 1)]?.hint ?? ''}
      </div>

      {showControls && (
        <div className="flex items-center gap-1 z-30">
          <button
            type="button"
            onClick={reset}
            className="p-1.5 border border-pink-400/40 text-pink-300 hover:bg-pink-400 hover:text-black"
            title="Заново"
          >
            <RotateCcw size={14} />
          </button>
          <button
            type="button"
            onClick={prev}
            disabled={current === 0}
            className="p-1.5 border border-pink-400/40 text-pink-300 hover:bg-pink-400 hover:text-black disabled:opacity-30"
            title="Предыдущий"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            onClick={() => {
              if (current >= total) reset();
              else setPlaying(!playing);
            }}
            className="p-1.5 border border-pink-400 bg-pink-400/10 text-pink-300 hover:bg-pink-400 hover:text-black"
            title={playing ? 'Пауза' : 'Пуск'}
          >
            {playing ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <button
            type="button"
            onClick={next}
            disabled={current >= total}
            className="p-1.5 border border-pink-400/40 text-pink-300 hover:bg-pink-400 hover:text-black disabled:opacity-30"
            title="Следующий"
          >
            <ChevronRight size={14} />
          </button>
          <button
            type="button"
            onClick={revealAll}
            className="p-1.5 border border-pink-400/40 text-pink-300 hover:bg-pink-400 hover:text-black"
            title="Показать сразу"
          >
            <Sparkles size={14} />
          </button>
        </div>
      )}

      <style>{`
        @keyframes cjk-stroke {
          from { stroke-dashoffset: 200; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes pulse-brush {
          from { transform: scale(1); opacity: 0.85; }
          to { transform: scale(1.6); opacity: 0.35; }
        }
      `}</style>
    </div>
  );
}


