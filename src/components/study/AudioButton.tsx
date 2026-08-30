import React, { useState } from 'react';
import { Volume2 } from 'lucide-react';
import { speakText } from '../../lib/speech';
import { SupportedLanguage } from '../../types';

interface AudioButtonProps {
  text: string;
  lang?: SupportedLanguage;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  autoPlay?: boolean;
}

export const AudioButton: React.FC<AudioButtonProps> = ({
  text,
  lang = 'en',
  size = 'md',
  className = '',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(true);
    speakText(text, lang);
    setTimeout(() => setIsPlaying(false), 1200);
  };

  const sizeClasses = {
    sm: 'p-1.5 text-xs',
    md: 'p-2.5 text-sm',
    lg: 'p-3 text-base'
  };

  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 22
  };

  return (
    <button
      type="button"
      onClick={handlePlay}
      title="Aussprache anhören"
      className={`inline-flex items-center justify-center rounded-xl text-slate-300 hover:text-white bg-slate-800/80 hover:bg-indigo-600 border border-slate-700/60 hover:border-indigo-500 transition-all duration-200 shadow-sm ${sizeClasses[size]} ${isPlaying ? 'scale-105 ring-2 ring-indigo-500 bg-indigo-600 text-white' : ''} ${className}`}
    >
      <Volume2 size={iconSizes[size]} className={isPlaying ? 'animate-pulse' : ''} />
    </button>
  );
};
