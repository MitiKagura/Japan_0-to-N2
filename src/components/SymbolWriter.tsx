import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from 'lucide-react';

type Direction = '→' | '←' | '↓' | '↑' | '↘' | '↙' | '↗' | '↖' | '↻' | '↺' | '·';

interface SymbolWriterProps {
  symbol: string;
  strokes: number;
  strokeOrder?: string[];
  size?: number;
  autoPlay?: boolean;
  showControls?: boolean;
  compact?: boolean;
}

const directionPattern: Direction[] = ['→', '↓', '→', '↓', '↘', '↙', '→', '↓'];

function inferDirection(label: string | undefined, index: number): Direction {
  const text = label ?? '';
  if (text.includes('右') || text.includes('→')) return '→';
  if (text.includes('左') || text.includes('←')) return '←';
  if (text.includes('上') || text.includes('↑')) return '↑';
  if (text.includes('下') || text.includes('↓') || text.includes('縦') || text.includes('垂')) return '↓';
  if (text.includes('斜') || text.includes('払') || text.includes('左下')) return '↘';
  if (text.includes('跳') || text.includes('右下')) return '↙';
  if (text.includes('曲') || text.includes('折') || text.includes('loop') || text.includes('ループ')) return '↻';
  return directionPattern[index % directionPattern.length];
}

/**
 * Этот компонент — fallback для случая, когда локальные векторные данные отсутствуют.
 * Анимация делается через CSS clip-path (НЕ заливка буквы), двигаясь в направлении штриха.
 * Это «имитация» правильного написания, но не покадровая отрисовка каждого штриха.
 * Для настоящей покадровой анимации используйте JapaneseStrokeWriter (animCJK) или
 * KanjiWriter (KanjiVG).
 */
function progressClip(direction: Direction, progress: number): string {
  const p = Math.max(0, Math.min(100, progress));
  const inv = 100 - p;
  switch (direction) {
    case '←': return `inset(0 0 0 ${inv}%)`;
    case '↓': return `inset(0 0 ${inv}% 0)`;
    case '↑': return `inset(${inv}% 0 0 0)`;
    case '↘': return `polygon(0 0, ${Math.min(100, p + 32)}% 0, ${Math.min(100, p)}% 100%, 0 100%)`;
    case '↙': return `polygon(${inv}% 0, 100% 0, 100% 100%, ${Math.max(0, inv - 32)}% 100%)`;
    case '↗': return `polygon(0 ${inv}%, 100% 0, 100% ${Math.min(100, p + 34)}%, 0 100%)`;
    case '↖': return `polygon(0 0, 100% ${inv}%, 100% 100%, 0 ${Math.min(100, p + 34)}%)`;
    case '↻':
    case '↺': return `circle(${Math.max(4, p * 0.75)}% at 50% 50%)`;
    case '·': return `circle(${Math.max(4, p * 0.7)}% at 50% 50%)`;
    case '→':
    default: return `inset(0 ${inv}% 0 0)`;
  }
}

export function SymbolWriter({
  symbol,
  strokes,
  strokeOrder = [],
  size = 260,
  autoPlay = false,
  showControls = true,
  compact = false,
}: SymbolWriterProps) {
  const total = Math.max(1, strokes || strokeOrder.length || 1);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(autoPlay);
  const [flow, setFlow] = useState(0);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    setStep(0);
    setFlow(0);
    setPlaying(autoPlay);
  }, [symbol, autoPlay]);

  useEffect(() => {
    if (!playing) return;
    let started = performance.now();
    const duration = compact ? 480 : 760;
    const tick = (now: number) => {
      const p = Math.min(1, (now - started) / duration);
      setFlow(p * 100);
      if (p < 1) {
        timer.current = window.requestAnimationFrame(tick);
      } else if (step + 1 < total) {
        setStep((s) => s + 1);
        setFlow(0);
      } else {
        setStep(total);
        setFlow(100);
        setPlaying(false);
      }
    };
    timer.current = window.requestAnimationFrame(tick);
    return () => {
      if (timer.current) window.cancelAnimationFrame(timer.current);
    };
  }, [playing, step, total, compact]);

  const reset = () => {
    setStep(0);
    setFlow(0);
    setPlaying(autoPlay);
  };

  const previous = () => {
    setPlaying(false);
    setStep((s) => Math.max(0, s - 1));
    setFlow(0);
  };

  const next = () => {
    setPlaying(false);
    setStep((s) => Math.min(total, s + 1));
    setFlow(100);
  };

  const currentDirection = inferDirection(strokeOrder[step], step);
  const currentLabel = strokeOrder[step] || `${step + 1}. Штрих по стандартному направлению`;
  const colorProgress = step >= total ? 100 : ((step / total) * 65) + (flow / total) * 0.35;

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative overflow-hidden border-2 border-pink-400/60 bg-[#1a0a14] select-none"
        style={{ width: size, height: size }}
      >
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,107,157,.22) 1px, transparent 1px), linear-gradient(90deg, rgba(255,107,157,.22) 1px, transparent 1px)',
            backgroundSize: `${size / 4}px ${size / 4}px`,
          }}
        />
        <div className="absolute left-1/2 top-0 bottom-0 border-l border-dashed border-pink-400/20 pointer-events-none" />
        <div className="absolute top-1/2 left-0 right-0 border-t border-dashed border-pink-400/20 pointer-events-none" />

        <span
          className="absolute inset-0 flex items-center justify-center leading-none"
          style={{
            fontFamily: 'Noto Serif JP, Yu Mincho, Hiragino Mincho ProN, serif',
            fontSize: size * 0.73,
            color: '#fff3f8',
            textShadow: '0 0 2px rgba(255,255,255,.5)',
          }}
        >
          {symbol}
        </span>

        <span
          className="absolute inset-0 flex items-center justify-center leading-none pointer-events-none"
          style={{
            fontFamily: 'Noto Serif JP, Yu Mincho, Hiragino Mincho ProN, serif',
            fontSize: size * 0.73,
            color: '#ff6b9d',
            opacity: Math.min(0.78, colorProgress / 130),
            transition: 'opacity 220ms ease-out',
          }}
        >
          {symbol}
        </span>

        {step < total && (
          <span
            className="absolute inset-0 flex items-center justify-center leading-none pointer-events-none"
            style={{
              fontFamily: 'Noto Serif JP, Yu Mincho, Hiragino Mincho ProN, serif',
              fontSize: size * 0.73,
              color: '#ff1f6b',
              clipPath: progressClip(currentDirection, flow),
              textShadow: '0 0 5px #ff6b9d, 0 0 14px rgba(255,107,157,.9), 0 0 24px rgba(255,183,213,.65)',
              transition: 'clip-path 35ms linear',
            }}
          >
            {symbol}
          </span>
        )}

        {step < total && (
          <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-pink-400/90 text-black text-[10px] font-bold border border-pink-100">
            {step + 1}/{total}
          </div>
        )}
        {step >= total && (
          <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-green-400/90 text-black text-[10px] font-bold border border-green-100">
            完
          </div>
        )}
      </div>

      <div className="text-[10px] uppercase tracking-widest text-pink-300/80 text-center max-w-[260px] leading-tight">
        <span className="text-pink-300 mr-1">{currentDirection}</span>
        {currentLabel}
      </div>

      {showControls && (
        <div className="flex items-center gap-1">
          <button
            onClick={reset}
            className="p-1.5 border border-pink-400/40 text-pink-300 hover:bg-pink-400 hover:text-black"
            title="Заново"
          >
            <RotateCcw size={14} />
          </button>
          <button
            onClick={previous}
            disabled={step === 0}
            className="p-1.5 border border-pink-400/40 text-pink-300 hover:bg-pink-400 hover:text-black disabled:opacity-30"
            title="Предыдущий штрих"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={() => {
              if (step >= total) reset();
              else setPlaying(!playing);
            }}
            className="p-1.5 border border-pink-400 bg-pink-400/10 text-pink-300 hover:bg-pink-400 hover:text-black"
            title={playing ? 'Пауза' : 'Пуск'}
          >
            {playing ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <button
            onClick={next}
            disabled={step >= total}
            className="p-1.5 border border-pink-400/40 text-pink-300 hover:bg-pink-400 hover:text-black disabled:opacity-30"
            title="Следующий штрих"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
