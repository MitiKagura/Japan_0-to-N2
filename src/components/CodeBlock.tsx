import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';

export function CodeBlock({ code, language = 'japanese' }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative border border-pink-400/30 bg-[#0f050a] my-2">
      <button
        type="button"
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 text-pink-300/80 hover:text-pink-200 hover:bg-pink-400/20 z-10"
        title="Копировать"
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus as any}
        customStyle={{ background: 'transparent', padding: '0.75rem', fontSize: '0.85rem', margin: 0 }}
        wrapLongLines
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
