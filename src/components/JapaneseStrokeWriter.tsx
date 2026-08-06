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
  // A yoon pair (きゃ / キャ) is two separate glyphs. The local writer handles
  // it as one composition; AnimCJK is used for every single kana/kanji glyph.
  if (chars.length !== 1) return null;
  const code = chars[0].codePointAt(0);
  if (!code) return null;
  const isKana = (code >= 0x3040 && code <= 0x30ff) || (code >= 0x31f0 && code <= 0x31ff);
  return `${ANIM_CJK_BASE}/${isKana ? 'svgsJaKana' : 'svgsJa'}/${code}.svg`;
}

function recolorSvg(raw: string, size: number): string {
  // AnimCJK files use the actual stroke outlines as clip paths, then animate a
  // dashed median line inside each outline. We preserve that geometry and only
  // replace its black/gray palette with the sakura palette used by this app.
  const withoutScripts = raw.replace(/<script[\s\S]*?<\/script>/gi, '');
  const customStyle = `
    <style>
      @keyframes sakuraCjkStroke { to { stroke-dashoffset: 0; } }
      svg.acjk { width:${size}px; height:${size}px; display:block; overflow:visible; }
      svg.acjk path[id] { fill:#fff5f9 !important; opacity:.96; }
      svg.acjk path[clip-path] {
        stroke:#ff4f8c !important;
        filter:drop-shadow(0 0 6px #ff6b9d) drop-shadow(0 0 12px rgba(255,107,157,.72));
        animation-name:sakuraCjkStroke !important;
        animation-duration:.72s !important;
        animation-timing-function:ease-out !important;
        animation-fill-mode:forwards !important;
        animation-delay:var(--d, 0s) !important;
        stroke-dasharray:3337 !important;
        stroke-dashoffset:3339 !important;
        stroke-width:128 !important;
        stroke-linecap:round !important;
        fill:none !important;
      }
    </style>`;
  return withoutScripts.replace(/<style>[\s\S]*?<\/style>/i, customStyle);
}

export function JapaneseStrokeWriter({ symbol, strokes, strokeOrder, size = 260 }: JapaneseStrokeWriterProps) {
  const url = useMemo(() => getSvgUrl(symbol), [symbol]);
  const [svg, setSvg] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(url));
  const [failed, setFailed] = useState(false);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let active = true;
    setSvg(null);
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
        if (active) setSvg(recolorSvg(raw, size));
      })
      .catch(() => {
        if (active) setFailed(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [url, size, revision]);

  if (!svg || loading || failed) {
    return (
      <div className="flex flex-col items-center gap-2">
        <SymbolWriter
          symbol={symbol}
          strokes={strokes}
          strokeOrder={strokeOrder}
          size={size}
          autoPlay={!loading}
        />
        {failed && (
          <div className="flex items-center gap-1 text-[10px] text-pink-300/60">
            <WifiOff size={11} /> Локальная анимация: AnimCJK недоступен
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative border-2 border-pink-400/60 bg-[#1a0a14] overflow-hidden" style={{ width: size, height: size }}>
        <div className="absolute inset-0 opacity-30 pointer-events-none" style={{
          backgroundImage: 'linear-gradient(rgba(255,107,157,.22) 1px, transparent 1px), linear-gradient(90deg, rgba(255,107,157,.22) 1px, transparent 1px)',
          backgroundSize: `${size / 4}px ${size / 4}px`,
        }} />
        <div className="absolute left-1/2 top-0 bottom-0 border-l border-dashed border-pink-400/20 pointer-events-none" />
        <div className="absolute top-1/2 left-0 right-0 border-t border-dashed border-pink-400/20 pointer-events-none" />
        <div
          key={revision}
          className="relative z-10 flex items-center justify-center w-full h-full"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setRevision((r) => r + 1)}
          className="p-1.5 border border-pink-400/40 text-pink-300 hover:bg-pink-400 hover:text-black"
          title="Проиграть порядок черт заново"
        >
          <RotateCcw size={14} />
        </button>
        <span className="text-[10px] uppercase tracking-widest text-pink-300/70">
          Реальный порядок черт · AnimCJK
        </span>
      </div>
    </div>
  );
}