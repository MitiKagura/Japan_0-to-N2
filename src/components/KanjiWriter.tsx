import { useEffect, useState, useRef } from 'react';
import { hiraganaStrokes, katakanaStrokes, type KanaStroke } from '../data/kana_strokes';
import { kanjiStrokes } from '../data/kanjiSvg';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Eye, Sparkles } from 'lucide-react';

interface KanjiWriterProps {
  char: string;
  size?: number;
  showControls?: boolean;
  autoPlay?: boolean;
  speedMs?: number;
}

export function KanjiWriter({ char, size = 260, showControls = true, autoPlay = true, speedMs = 700 }: KanjiWriterProps) {
  // 1. Пытаемся получить векторные штрихи
  const strokes = getStrokesForChar(char);
  const total = strokes ? strokes.length : 0;
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(autoPlay);
  const [revealed, setRevealed] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    setCurrent(0);
    setRevealed(false);
    setPlaying(autoPlay);
  }, [char, autoPlay]);

  useEffect(() => {
    if (!playing) return;
    if (total === 0) {
      // Для символов без векторных данных запускаем красивое автоматическое проявление через 1.5 сек
      timer.current = window.setTimeout(() => {
        setRevealed(true);
        setPlaying(false);
      }, 1500);
      return;
    }
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
    setRevealed(false);
    setPlaying(autoPlay);
  };

  const prev = () => {
    setCurrent((c) => Math.max(0, c - 1));
    setPlaying(false);
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

  // Эффект плавного проявления (для символов без векторных штрихов)
  const isFallback = total === 0;

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative border-2 border-pink-400/60 bg-[#0f050a] overflow-hidden"
        style={{ width: size, height: size }}
      >
        {/* Сетка для каллиграфии */}
        <svg className="absolute inset-0 pointer-events-none z-10" viewBox="0 0 100 100" width={size} height={size}>
          <line x1="0" y1="50" x2="100" y2="50" stroke="#ff6b9d" strokeOpacity="0.12" strokeDasharray="2 2" strokeWidth="0.5" />
          <line x1="50" y1="0" x2="50" y2="100" stroke="#ff6b9d" strokeOpacity="0.12" strokeDasharray="2 2" strokeWidth="0.5" />
          <line x1="0" y1="0" x2="100" y2="100" stroke="#ff6b9d" strokeOpacity="0.08" strokeDasharray="2 2" strokeWidth="0.5" />
          <line x1="100" y1="0" x2="0" y2="100" stroke="#ff6b9d" strokeOpacity="0.08" strokeDasharray="2 2" strokeWidth="0.5" />
        </svg>

        {/* 1. БАЗОВЫЙ ШАБЛОН ЭЛЕМЕНТА (Серый контур) */}
        <div
          className="absolute inset-0 flex items-center justify-center text-pink-100/10 pointer-events-none select-none transition-all duration-300"
          style={{
            fontFamily: getFontFamily(),
            fontSize: size * 0.72,
            lineHeight: 1,
            filter: 'blur(0.5px)',
          }}
        >
          {char}
        </div>

        {/* 2. НАПЛЫВ ЦВЕТА И РИСУНКА (Живой эффект) */}
        {isFallback ? (
          // Умное «живое» проявление для символов без векторного скелета (например, редких кандзи)
          <div
            className={`absolute inset-0 flex items-center justify-center pointer-events-none select-none`}
            style={{
              fontFamily: getFontFamily(),
              fontSize: size * 0.72,
              lineHeight: 1,
              color: '#ff6b9d',
              textShadow: '0 0 8px #ff6b9d, 0 0 15px rgba(255,107,157,0.5)',
              clipPath: revealed || playing ? 'inset(0 0 0 0)' : 'inset(100% 0 0 0)',
              transition: playing ? 'clip-path 1.5s cubic-bezier(0.4, 0, 0.2, 1)' : 'clip-path 0.3s ease',
            }}
          >
            {char}
          </div>
        ) : (
          // Настоящая каллиграфическая прорисовка пером поверх контура
          <svg
            className="absolute inset-0 z-20"
            viewBox="0 0 100 100"
            width={size}
            height={size}
          >
            {strokes && strokes.map((s, i) => {
              const visible = revealed || i < current;
              const currentStroke = i === current && !revealed;
              const pathData = convertPointsToPath(s.points);

              return (
                <g key={i}>
                  {/* Контур следующего штриха (подсказка) */}
                  {currentStroke && (
                    <path
                      d={pathData}
                      fill="none"
                      stroke="#ff6b9d"
                      strokeOpacity="0.25"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}
                  {/* Живой нарисованный штрих */}
                  {visible && (
                    <path
                      d={pathData}
                      fill="none"
                      stroke="#ff6b9d"
                      strokeOpacity={0.95}
                      strokeWidth="7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{
                        filter: 'drop-shadow(0 0 5px #ff6b9d) drop-shadow(0 0 10px rgba(255,107,157,0.6))',
                        strokeDasharray: currentStroke ? 2000 : 0,
                        strokeDashoffset: currentStroke ? 2000 : 0,
                        animation: currentStroke ? `draw-stroke 0.65s cubic-bezier(0.25, 1, 0.5, 1) forwards` : undefined,
                      }}
                    />
                  )}
                  {/* Светящаяся точка пера в процессе рисования */}
                  {currentStroke && s.points.length > 0 && (
                    <circle
                      cx={s.points[0][0]}
                      cy={s.points[0][1]}
                      r="4.5"
                      fill="#fff"
                      style={{
                        filter: 'drop-shadow(0 0 8px #ff6b9d) drop-shadow(0 0 15px #ff1f6b)',
                        animation: `pulse-brush 0.65s infinite alternate`,
                      }}
                    />
                  )}
                </g>
              );
            })}
          </svg>
        )}

        {/* Индикатор прогресса */}
        <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-pink-400/90 text-black text-[10px] font-bold border border-pink-200 z-30 uppercase tracking-widest">
          {isFallback ? 'Auto' : `${current}/${total}`}
        </div>

        {/* Спецэффект для полностью завершенного знака */}
        {(revealed || current >= total) && (
          <div className="absolute inset-0 bg-pink-500/5 pointer-events-none animate-pulse z-0" />
        )}
      </div>

      {showControls && (
        <div className="flex items-center gap-1 z-30">
          <button onClick={reset} className="p-1.5 border border-pink-400/40 text-pink-300 hover:bg-pink-400 hover:text-black" title="Заново">
            <RotateCcw size={14} />
          </button>
          <button onClick={prev} disabled={current === 0 || isFallback} className="p-1.5 border border-pink-400/40 text-pink-300 hover:bg-pink-400 hover:text-black disabled:opacity-30" title="Предыдущий">
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={() => {
              if (current >= total && !isFallback) reset();
              else setPlaying(!playing);
            }}
            className="p-1.5 border border-pink-400 bg-pink-400/10 text-pink-300 hover:bg-pink-400 hover:text-black"
            title={playing ? 'Пауза' : 'Пуск'}
          >
            {playing ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <button onClick={next} disabled={current >= total || isFallback} className="p-1.5 border border-pink-400/40 text-pink-300 hover:bg-pink-400 hover:text-black disabled:opacity-30" title="Следующий">
            <ChevronRight size={14} />
          </button>
          <button onClick={revealAll} className="p-1.5 border border-pink-400/40 text-pink-300 hover:bg-pink-400 hover:text-black" title="Показать всё">
            <Eye size={14} />
          </button>
        </div>
      )}

      {/* Текстовые подсказки */}
      {!isFallback && current < total && strokes && strokes[current] && (
        <div className="text-xs text-pink-300/80 text-center max-w-[240px] px-2 py-1 bg-pink-950/20 border border-pink-400/10 min-h-[32px] flex items-center justify-center">
          {strokes[current].hint}
        </div>
      )}
      {isFallback && playing && (
        <div className="text-xs text-pink-300/80 text-center max-w-[240px] px-2 py-1 bg-pink-950/20 border border-pink-400/10 min-h-[32px] flex items-center justify-center gap-1.5">
          <Sparkles size={12} className="animate-spin text-pink-300" />
          <span>Проявление каллиграфии...</span>
        </div>
      )}
      {(revealed || current >= total) && (
        <div className="text-xs text-pink-400 font-bold uppercase tracking-widest text-center min-h-[32px] flex items-center justify-center">
          完成 — Отлично!
        </div>
      )}

      <style>{`
        @keyframes draw-stroke {
          from { stroke-dashoffset: 2000; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes pulse-brush {
          from { r: 3.5; opacity: 0.8; }
          to { r: 5.5; opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// === Вспомогательные хелперы ===

function getFontFamily(): string {
  return "'Noto Serif JP', 'Georgia', serif";
}

function getStrokesForChar(char: string): KanaStroke[] | null {
  // 1. Проверяем хирагану
  if (hiraganaStrokes[char]) return hiraganaStrokes[char];
  // 2. Проверяем катакану
  if (katakanaStrokes[char]) return katakanaStrokes[char];
  // 3. Проверяем кандзи (если есть SVG)
  if (kanjiStrokes[char]) {
    // Конвертируем KanjiVG в формат KanaStroke
    return kanjiStrokes[char].map((s) => {
      const pts = parseSvgPathToPoints(s.d);
      return {
        points: pts,
        hint: s.hint,
      };
    });
  }
  return null;
}

function convertPointsToPath(points: [number, number][]): string {
  if (points.length === 0) return '';
  let d = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 1; i < points.length; i++) {
    d += ` L ${points[i][0]} ${points[i][1]}`;
  }
  return d;
}

function parseSvgPathToPoints(d: string): [number, number][] {
  // Простой парсер путей типа "M x y L x2 y2" в массив точек
  const pts: [number, number][] = [];
  const tokens = d.split(/\s+/);
  let i = 0;
  while (i < tokens.length) {
    const cmd = tokens[i];
    if (cmd === 'M' || cmd === 'L') {
      const x = parseFloat(tokens[i + 1]);
      const y = parseFloat(tokens[i + 2]);
      if (!isNaN(x) && !isNaN(y)) {
        pts.push([x, y]);
      }
      i += 3;
    } else {
      i++;
    }
  }
  return pts;
}
