'use client';

import Gemini from "@/components/Gemini";

export default function Home() {
  return (
    <div className="h-full flex flex-col space-y-12 justify-center">
      {/* Welcome Section - more compact */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Welcome to BrownChat</h1>
        <p className="text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Your Gemini 2.0 Multimodal Live API powered realtime voice chatbot.
        </p>
      </div>

      {/* Features Grid - reduced padding and spacing */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-800">
          <h3 className="font-semibold mb-1">Voice Interaction</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Natural voice conversations with{' '}
            <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-primary-600 dark:text-primary-400">
              gemini-2.0-flash-exp
            </code>
          </p>
        </div>
        <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-800">
          <h3 className="font-semibold mb-1">Realtime Response</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Get instant AI responses via bidirectional audio streaming
          </p>
        </div>
        <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-800">
          <h3 className="font-semibold mb-1">Web Search</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Configurable web search powered by{' '}
            <a
              href="https://tavily.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 dark:text-primary-400 hover:underline"
            >
              Tavily
            </a>
          </p>
        </div>
      </div>

      {/* Getting Started Section - redesigned */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <span className="bg-primary-500/10 dark:bg-primary-400/10 text-primary-600 dark:text-primary-400 p-2 rounded-lg mr-2">
            🚀
          </span>
          Getting Started
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-400">
              1
            </div>
            <div>
              <h3 className="font-medium mb-1">Configure API Keys</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Set up your Gemini and Tavily API keys in Settings
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-400">
              2
            </div>
            <div>
              <h3 className="font-medium mb-1">Start Conversation</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Click the microphone icon below to begin
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-400">
              3
            </div>
            <div>
              <h3 className="font-medium mb-1">Speak Naturally</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Have a natural conversation with the AI assistant
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-400">
              4
            </div>
            <div>
              <h3 className="font-medium mb-1">End Chat</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Click the stop button when you're done
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Interface - adjusted height */}
      <Gemini defaultExpanded={true} />
    </div>
  );
}
