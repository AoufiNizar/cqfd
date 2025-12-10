
import React, { useRef, useState } from 'react';
import { 
  Bold, Italic, Heading1, Heading2, List, Sigma, 
  Eye, EyeOff, Image as ImageIcon, Link as LinkIcon 
} from 'lucide-react';
import { SmartText } from './Latex';

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ 
  value, 
  onChange, 
  placeholder = "Commencez à écrire...",
  minHeight = "min-h-[200px]"
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertTag = (startTag: string, endTag: string = '', defaultText: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end) || defaultText;

    const newText = text.substring(0, start) + startTag + selectedText + endTag + text.substring(end);
    
    onChange(newText);

    // Restore cursor / selection
    setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + startTag.length, start + startTag.length + selectedText.length);
    }, 0);
  };

  return (
    <div className="border border-space-700 rounded-lg overflow-hidden bg-space-950 flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 bg-space-900 border-b border-space-800 overflow-x-auto">
        <button onClick={() => insertTag('**', '**', 'gras')} className="p-2 text-space-400 hover:text-white hover:bg-space-800 rounded" title="Gras">
          <Bold size={16} />
        </button>
        <button onClick={() => insertTag('*', '*', 'italique')} className="p-2 text-space-400 hover:text-white hover:bg-space-800 rounded" title="Italique">
          <Italic size={16} />
        </button>
        <div className="w-px h-6 bg-space-800 mx-1" />
        <button onClick={() => insertTag('### ', '', 'Titre')} className="p-2 text-space-400 hover:text-white hover:bg-space-800 rounded" title="Titre">
          <Heading1 size={16} />
        </button>
        <button onClick={() => insertTag('#### ', '', 'Sous-titre')} className="p-2 text-space-400 hover:text-white hover:bg-space-800 rounded" title="Sous-titre">
          <Heading2 size={16} />
        </button>
        <div className="w-px h-6 bg-space-800 mx-1" />
        <button onClick={() => insertTag('- ', '', 'élément')} className="p-2 text-space-400 hover:text-white hover:bg-space-800 rounded" title="Liste à puces">
          <List size={16} />
        </button>
        <button onClick={() => insertTag('$$ ', ' $$', 'x^2')} className="p-2 text-space-accent hover:text-white hover:bg-space-800 rounded font-bold" title="Formule Math (LaTeX)">
          <Sigma size={16} />
        </button>
        <div className="w-px h-6 bg-space-800 mx-1" />
        <button onClick={() => insertTag('![Description](', ')', 'https://...')} className="p-2 text-space-400 hover:text-white hover:bg-space-800 rounded" title="Image">
          <ImageIcon size={16} />
        </button>
        <div className="flex-grow" />
        <button 
          onClick={() => setShowPreview(!showPreview)} 
          className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
             showPreview ? 'bg-space-accent text-space-950' : 'bg-space-800 text-space-300 hover:text-white'
          }`}
        >
           {showPreview ? <><EyeOff size={14}/> Éditer</> : <><Eye size={14}/> Aperçu</>}
        </button>
      </div>

      {/* Editor Area */}
      <div className={`relative w-full ${minHeight} bg-space-950`}>
         {showPreview ? (
             <div className="p-4 prose prose-invert max-w-none text-slate-300 overflow-y-auto h-full">
                 <SmartText text={value || '(Vide)'} />
             </div>
         ) : (
             <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full h-full p-4 bg-transparent text-slate-200 outline-none font-mono text-sm resize-y min-h-[inherit]"
                placeholder={placeholder}
             />
         )}
      </div>
      <div className="px-4 py-1 bg-space-900 text-[10px] text-space-500 border-t border-space-800 flex justify-between">
         <span>Markdown supporté</span>
         <span>LaTeX supporté avec $$...$$</span>
      </div>
    </div>
  );
};
