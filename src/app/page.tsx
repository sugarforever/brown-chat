'use client';

import { Gauge, Mic, Github } from 'lucide-react';
import BrownChatLogo from '@/components/icons/BrownChatLogo';
import { SettingsForm } from '@/components/SettingsForm';
import { useState } from 'react';
import dynamic from 'next/dynamic';

const Gemini = dynamic(() => import('@/components/Gemini'), {
  ssr: false,
  loading: () => (
    <div className="w-[42px] h-[42px] animate-pulse bg-gray-100 dark:bg-gray-800 rounded-full" />
  )
});

export default function Home() {
  const [showSettings, setShowSettings] = useState(false);
  const [showChat, setShowChat] = useState(false);

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center space-y-8 py-16">
      {/* Logo and Brand */}
      <div className="flex flex-col items-center space-y-6">
        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-2xl p-4">
          <BrownChatLogo className="w-full h-full" />
        </div>
        <h1 className="text-4xl font-bold">BrownChat</h1>
        <p className="text-gray-600 dark:text-gray-400 text-center max-w-lg">
          Your Gemini 2.0 Multimodal Live API powered realtime voice chatbot.
        </p>
        <a
          href="https://github.com/sugarforever/brown-chat"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-all duration-200 hover:scale-105"
        >
          <Github className="w-5 h-5" />
          <span>GitHub</span>
        </a>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4 mt-8">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <Gauge className="w-5 h-5" />
          <span>Settings</span>
        </button>
        <button
          onClick={() => setShowChat(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <Mic className="w-5 h-5" />
          <span>Start Chat</span>
        </button>
      </div>

      {/* Settings Form */}
      {showSettings && (
        <div className="w-full mt-8">
          <SettingsForm />
        </div>
      )}

      {/* Chat Interface */}
      {showChat && (
        <div className="fixed bottom-4 flex justify-center z-50">
          <div className="w-full max-w-2xl">
            <Gemini
              defaultExpanded={showChat}
              onExpandedChange={(expanded) => {
                if (!expanded) {
                  setShowChat(false);
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
