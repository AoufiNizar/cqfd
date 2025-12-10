import React, { useMemo } from 'react';
import katex from 'katex';

interface LatexProps {
  content: string;
  className?: string;
  displayMode?: boolean;
}

const LatexRenderer: React.FC<LatexProps> = ({ content, className = '', displayMode = false }) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString(content, {
        throwOnError: false,
        displayMode: displayMode,
      });
    } catch (e) {
      return content;
    }
  }, [content, displayMode]);

  return (
    <span 
      className={className}
      dangerouslySetInnerHTML={{ __html: html }} 
    />
  );
};

// Advanced component that parses a string containing mixed text and latex delimiters ($ or $$)
export const SmartText: React.FC<{ text: string; className?: string }> = ({ text, className = '' }) => {
  // Regex to split by $$...$$ (display) or $...$ (inline)
  // Captures the delimiters and the content
  const parts = text.split(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g);

  return (
    <div className={`leading-relaxed text-slate-200 ${className}`}>
      {parts.map((part, index) => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
          const content = part.slice(2, -2);
          return <LatexRenderer key={index} content={content} displayMode={true} />;
        } else if (part.startsWith('$') && part.endsWith('$')) {
          const content = part.slice(1, -1);
          return <LatexRenderer key={index} content={content} displayMode={false} />;
        } else {
          // Render regular text, preserving line breaks
          return part.split('\n').map((line, i) => (
            <React.Fragment key={`${index}-${i}`}>
              {line}
              {i < part.split('\n').length - 1 && <br />}
            </React.Fragment>
          ));
        }
      })}
    </div>
  );
};

export default LatexRenderer;
