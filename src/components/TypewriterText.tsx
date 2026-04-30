import React, { useState, useEffect, memo } from 'react';

interface TypewriterTextProps {
  text: string;
  className?: string;
  speed?: number;
}

const TypewriterText = memo(({ text, className, speed = 15 }: TypewriterTextProps) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let i = 0;
    setDisplayedText('');
    const timer = setInterval(() => {
      setDisplayedText((prev) => text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(timer);
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return <span className={className}>{displayedText}</span>;
});

TypewriterText.displayName = 'TypewriterText';

export default TypewriterText;
