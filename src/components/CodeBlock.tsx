import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';

export function CodeBlock({ code, language = 'japanese' }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(()=>setCopied(false),2000); };
  return (
    <div className="relative group">
      <button onClick={handleCopy} className="absolute top-2 right-2 z-10 p-1.5 border border-pink-400 text-pink-300 hover:bg-pink-400 hover:text-black transition-all" title="Копировать">
        {copied ? <Check size={14}/> : <Copy size={14}/>}
      </button>
      <SyntaxHighlighter language={language} style={vscDarkPlus} customStyle={{background:'#1a0a14', padding:'1rem', margin:0, border:'1px solid #ff6b9d', boxShadow:'0 0 8px rgba(255,107,157,.4)', fontSize:'.8rem', lineHeight:'1.6', borderRadius:0}}>
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
