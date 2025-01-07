'use client';

import { Gauge, Mic, Github } from 'lucide-react';
import BrownChatLogo from '@/components/icons/BrownChatLogo';
import { SettingsForm } from '@/components/SettingsForm';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import Script from 'next/script';

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
    <>
      <Script id="structured-data" type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'BrownChat',
          applicationCategory: 'ChatApplication',
          operatingSystem: 'Web',
          description: 'Your Gemini 2.0 Multimodal Live API powered realtime voice chatbot.',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD'
          },
          author: {
            '@type': 'Person',
            name: 'Sugar Forever'
          }
        })}
      </Script>

      <article className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center space-y-8 py-16">
        {/* Logo and Brand */}
        <header className="flex flex-col items-center space-y-6">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-2xl p-4" role="img" aria-label="BrownChat Logo">
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
            aria-label="View source code on GitHub"
          >
            <Github className="w-5 h-5" aria-hidden="true" />
            <span>GitHub</span>
          </a>
        </header>

        {/* Action Buttons */}
        <nav className="flex items-center gap-4 mt-8" aria-label="Main navigation">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-expanded={showSettings}
            aria-controls="settings-panel"
          >
            <Gauge className="w-5 h-5" aria-hidden="true" />
            <span>Settings</span>
          </button>
          <button
            onClick={() => setShowChat(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-expanded={showChat}
            aria-controls="chat-interface"
          >
            <Mic className="w-5 h-5" aria-hidden="true" />
            <span>Start Chat</span>
          </button>
        </nav>

        {/* Settings Form */}
        {showSettings && (
          <section id="settings-panel" className="w-full mt-8">
            <SettingsForm />
          </section>
        )}

        {/* Chat Interface */}
        {showChat && (
          <section
            id="chat-interface"
            className="fixed bottom-4 flex justify-center z-50"
            aria-live="polite"
          >
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
          </section>
        )}
      </article>
    </>
  );
}
