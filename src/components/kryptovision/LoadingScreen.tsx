"use client";

import { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { TrendingUp } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface LoadingScreenProps {
  onLoaded: () => void;
}

export default function LoadingScreen({ onLoaded }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const { t } = useLanguage();
  
  const loadingMessages = [
    t('loading_message_1'),
    t('loading_message_2'),
    t('loading_message_3'),
    t('loading_message_4'),
  ];
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    // Progress simulation
    const timer = setInterval(() => {
      setProgress(prevProgress => {
        if (prevProgress >= 100) {
          clearInterval(timer);
          setTimeout(onLoaded, 500); // Wait half a second before disappearing
          return 100;
        }
        const increment = Math.random() * 15; // Increased speed
        return Math.min(prevProgress + increment, 100);
      });
    }, 80); // Adjusted loading speed to be faster

    // Message cycling
    const messageTimer = setInterval(() => {
        setCurrentMessageIndex(prevIndex => (prevIndex + 1) % loadingMessages.length);
    }, 2000);

    return () => {
      clearInterval(timer);
      clearInterval(messageTimer);
    };
  }, [onLoaded, loadingMessages, t]);
  
  const displayProgress = Math.floor(progress);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white transition-opacity duration-500">
      <div className="w-full max-w-xs px-4 text-center">

        <div className="relative inline-block mb-6">
            <div className="absolute -inset-1 bg-gradient-to-br from-primary via-emerald-400 to-teal-500 rounded-full blur-lg opacity-50 animate-pulse"></div>
            <div className="relative flex items-center justify-center h-16 w-16 bg-gray-800 rounded-full shadow-lg">
                <TrendingUp className="h-8 w-8 text-primary" />
            </div>
        </div>

        <p className="text-3xl font-bold font-headline text-primary mb-4">{displayProgress}%</p>
        
        <Progress value={displayProgress} className="w-full h-2 mb-5 bg-gray-700" />
        
        <div className="flex items-center justify-center gap-2 mb-2 text-sm text-gray-300">
            <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p>{loadingMessages[currentMessageIndex]}</p>
        </div>

         <div className="flex justify-center items-center gap-2 mb-6">
            <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="h-2 w-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="h-2 w-2 bg-purple-500 rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  );
}
