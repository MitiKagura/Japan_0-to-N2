import { useEffect, useMemo, useState } from 'react';
import { RotateCcw, WifiOff } from 'lucide-react';
import { SymbolWriter } from './SymbolWriter';

interface JapaneseStrokeWriterProps {
  symbol: string;
  strokes: number;
  strokeOrder?: string[];
  size?: number;
}

const ANIM_CJK_BASE = 'https://raw.githubusercontent.com/parsimonhi/animCJK/master';

function getSvgUrl(symbol: string): string | null {
  const chars = Array.from(symbol);
  if (chars.length !== 1) return null;
  const code = chars[0].codePointAt(0);
  if (!code) return null;
  const isKana =
    (code >= 0x3040 && code <= 0x309f) ||
    (code >= 0x30a0 && code <= 0x30ff) ||
    (code >= 0x31f0 && code <= 0x31ff);
  const folder = isKana ? 'svgsJaKana' : 'svgsJa';
  return `${ANIM_CJK_BASE}/${folder}/${code}.svg`;
}

interface StrokeInfo {
  d: string;
  clipPath: string;
  delay: number;
}

export function JapaneseStrokeWriter({ symbol, strokes, strokeOrder, size = 260 }: JapaneseStrokeWriterProps) {
  const url = useMemo(() => getSvgUrl(symbol), [symbol]);
  const [svgText, setSvgText] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(url));
  const [failed, setFailed] = useState(false);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let active = true;
    setSvgText(null);
    setFailed(false);
    setLoading(Boolean(url));
    if (!url) {
      setLoading(false);
      return;
    }
    fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error(`AnimCJK: ${response.status}`);
        return response.text();
      })
      .then((raw) => {
        if (active) setSvgText(raw);
      })
      .catch(() => {
        if (active) setFailed(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [url, revision]);

  if (loading || failed || !svgText) {
    return (
      <div className="flex flex-col items-center gap-2">
        {failed && (
          <div className="flex items-center gap-1 text-[10px] text-rose-300/80">
            <WifiOff size={12} /> AnimCJK недоступен — показываю локальную анимацию
          </div>
        )}
        <SymbolWriter
          symbol={symbol}
          strokes={strokes}
          strokeOrder={strokeOrder}
          size={size}
          autoPlay={true}
          showControls={true}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <AnimCjkRenderer svgText={svgText} size={size} />
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-pink-300/80">
        <button
          type="button"
          onClick={() => setRevision((r) => r + 1)}
          className="p-1.5 border border-pink-400/40 text-pink-300 hover:bg-pink-400 hover:text-black"
          title="Проиграть порядок черт заново"
        >
          <RotateCcw size={12} />
        </button>
        <span>Реальный порядок черт · AnimCJK</span>
      </div>
    </div>
  );
}

/**
 * AnimCjkRenderer — рендерит SVG из animCJK как настоящий SVG-элемент,
 * а не через dangerouslySetInnerHTML в div.
 *
 * Алгоритм:
 * 1. Парсим исходный SVG из animCJK, извлекаем:
 *    - viewBox
 *    - контуры штрихов (<path id="zXXXXdN">) — используются как clipPath
 *    - медианы (<path style="--d:Ns" pathLength="3333" clip-path="url(#zXXXXcN)">) — анимируются
 * 2. Генерируем clipPath'ы в <defs>
 * 3. Рисуем контуры внизу (заполняются)
 * 4. Рисуем медианы поверх с stroke-dasharray/stroke-dashoffset и задержками
 */
function AnimCjkRenderer({ svgText, size }: { svgText: string; size: number }) {
  // Парсим viewBox
  const viewBoxMatch = svgText.match(/<svg[^>]*viewBox=["']([^"']+)["']/i);
  const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 1024 1024';

  // Извлекаем контуры (<path id="...">) — НЕ с clip-path
  // Это и есть заливка штриха (внутренность кисти).
  const fills: { id: string; d: string }[] = [];
  const fillRegex = /<path\s+id="(z\w+)"\s+d="([^"]+)"\s*\/?>/g;
  let m: RegExpExecArray | null;
  const cleanSvg = svgText.replace(/<style[\s\S]*?<\/style>/gi, '');
  while ((m = fillRegex.exec(cleanSvg)) !== null) {
    fills.push({
      id: m[1],
      d: m[2].replace(/&#x([0-9A-Fa-f]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16))),
    });
  }

  // Извлекаем медианы (<path style="--d:Ns" pathLength="3333" clip-path="url(#zXXXXcN)">)
  const strokes: StrokeInfo[] = [];
  const strokeRegex =
    /<path\s+style="--d:(\d+)s;"\s+pathLength="3333"\s+clip-path="(url\(#[^)]+\))"\s+d="([^"]+)"\s*\/?>/g;
  while ((m = strokeRegex.exec(cleanSvg)) !== null) {
    const baseDelay = parseFloat(m[1]);
    const clipPath = m[2];
    const d = m[3].replace(/&#x([0-9A-Fa-f]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
    strokes.push({
      d,
      clipPath,
      delay: Math.max(0, baseDelay - 1),
    });
  }

  // Цвета и стили для заливок и медиан.
  // strokeWidth уменьшен до 28 — раньше было 128, что делало обводку
  // чрезмерно жирной. Теперь она пропорциональна иероглифу.
  const fillColor = '#ffd1e8';
  const strokeColor = '#ff4f8c';
  const STROKE_WIDTH = 28;

  return (
    <div
      className="relative bg-[#1a0a14] border-2 border-pink-400/60"
      style={{ width: size, height: size }}
    >
      <svg
        viewBox={viewBox}
        width={size}
        height={size}
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block' }}
      >
        <defs>
          {fills.map((f) => (
            <clipPath key={f.id} id={f.id}>
              <path d={f.d} />
            </clipPath>
          ))}
        </defs>

        {/* Контуры штрихов (заливка) — появляются по очереди */}
        {fills.map((f, i) => (
          <path
            key={f.id}
            d={f.d}
            fill={fillColor}
            opacity="0"
            style={{
              animation: `cjk-fill-in 0.4s linear forwards`,
              animationDelay: `${i * 0.4}s`,
            }}
          />
        ))}

        {/* Медианы — рисуются правильно по направлению штриха.
            Используем pathLength=1, чтобы stroke-dasharray работал
            корректно для любой длины path. */}
        {strokes.map((s, i) => (
          <path
            key={i}
            d={s.d}
            clipPath={s.clipPath}
            fill="none"
            stroke={strokeColor}
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength="1"
            style={{
              strokeDasharray: 1,
              strokeDashoffset: 1,
              filter: 'drop-shadow(0 0 3px #ff6b9d) drop-shadow(0 0 6px rgba(255,107,157,.5))',
              animation: `cjk-median-draw 0.7s ease-out forwards`,
              animationDelay: `${s.delay * 0.8}s`,
            }}
          />
        ))}
      </svg>
      <style>{`
        @keyframes cjk-fill-in {
          from { opacity: 0; }
          to { opacity: 0.96; }
        }
        @keyframes cjk-median-draw {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
}
