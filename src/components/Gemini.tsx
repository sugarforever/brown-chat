import React, { useEffect, useRef, useState } from 'react';
import { AudioRecorder } from '../utils/audio-recorder';
import { AudioStreamer } from '../utils/audio-streamer';
import { MultimodalLiveClient } from '../utils/MultimodalLiveClient';
import { SchemaType } from "@google/generative-ai";
import IconMicrophone from './icons/IconMicrophone';
import IconSpinner from './icons/IconSpinner';
import IconStop from './icons/IconStop';
import GeminiLogo from './icons/GeminiLogo';

interface GeminiProps {
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}

const Gemini: React.FC<GeminiProps> = ({
  defaultExpanded = false,
  onExpandedChange
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [error, setError] = useState<string>('');
  const [jsonString, setJsonString] = useState<string>('');

  const wsClientRef = useRef<MultimodalLiveClient | null>(null);
  const audioRecorderRef = useRef<AudioRecorder>(new AudioRecorder());
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioStreamerRef = useRef<AudioStreamer | null>(null);

  const declaration = {
    name: "tavily_search",
    description: "Search the web using Tavily API to get relevant information.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        query: {
          type: SchemaType.STRING,
          description: "The search query to look up",
        },
      },
      required: ["query"],
    },
  };

  const buttonStyles = `w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 relative ${
    connectionStatus === 'disconnected'
      ? 'bg-primary-500 hover:bg-primary-600 dark:bg-primary-700 dark:hover:bg-primary-800 text-white'
      : connectionStatus === 'connecting'
      ? 'bg-yellow-500 dark:bg-yellow-600 cursor-not-allowed'
      : 'bg-red-500 hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-800 text-white'
  }`;

  const statusText = {
    connecting: 'Initializing connection...',
    connected: 'Tap to end conversation',
    disconnected: 'Tap to start conversation',
  }[connectionStatus];

  useEffect(() => {
    onExpandedChange?.(isExpanded);
  }, [isExpanded, onExpandedChange]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopConnection();
    };
  }, []);

  const handleToolCall = async (toolCall: any) => {
    const functionCall = toolCall.functionCalls.find((fc: any) => fc.name === declaration.name);

    if (functionCall) {
      try {
        const tavilyApiKey = process.env.NEXT_PUBLIC_TAVILY_API_KEY;

        if (!tavilyApiKey) {
          throw new Error('Tavily API key not found');
        }

        const response = await fetch('https://api.tavily.com/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            api_key: tavilyApiKey,
            query: functionCall.args.query,
            search_depth: "basic",
            include_answer: false,
            include_images: true,
            include_image_descriptions: true,
            include_raw_content: false,
            max_results: 5,
          })
        });

        const data = await response.json();
        let formattedResults = 'Search Results:\n\n';

        data.results.forEach((result: any, index: number) => {
          formattedResults += `${index + 1}. ${result.title}\n`;
          formattedResults += `URL: ${result.url}\n`;
          formattedResults += `Content: ${result.content}\n\n`;
        });

        if (data.images?.length > 0) {
          formattedResults += '\nRelevant Images:\n';
          data.images.forEach((image: any, index: number) => {
            formattedResults += `${index + 1}. ${image.description}\n`;
            formattedResults += `URL: ${image.url}\n\n`;
          });
        }

        wsClientRef.current?.sendToolResponse({
          functionResponses: [{
            response: { output: formattedResults },
            id: functionCall.id
          }]
        });

      } catch (error: any) {
        console.error('Tavily search error:', error);
        wsClientRef.current?.sendToolResponse({
          functionResponses: [{
            response: { output: `Error performing search: ${error.message}` },
            id: functionCall.id
          }]
        });
      }
    }
  };

  const stopConnection = async () => {
    if (wsClientRef.current) {
      wsClientRef.current.disconnect();
      wsClientRef.current = null;
    }
    audioRecorderRef.current.stop();
    if (audioStreamerRef.current) {
      audioStreamerRef.current.stop();
      audioStreamerRef.current = null;
    }
    setConnectionStatus('disconnected');
  };

  const initConnection = async () => {
    try {
      setConnectionStatus('connecting');
      setError('');

      const GEMINI_API_KEY = localStorage.getItem('gemini_api_key');

      if (!GEMINI_API_KEY) {
        throw new Error('Gemini API key not found');
      }

      audioContextRef.current = new AudioContext();
      audioStreamerRef.current = new AudioStreamer(audioContextRef.current);
      await audioStreamerRef.current.resume();

      wsClientRef.current = new MultimodalLiveClient({
        apiKey: GEMINI_API_KEY
      });

      wsClientRef.current.on('log', (log) => {
        console.log('Gemini Log Event:', log);
      });

      wsClientRef.current.on('open', () => {
        setConnectionStatus('connected');
        audioRecorderRef.current.on('data', (base64Audio) => {
          if (connectionStatus === 'connected') {
            wsClientRef.current?.sendRealtimeInput([{
              data: base64Audio,
              mimeType: "audio/pcm;rate=16000"
            }]);
          }
        });
        audioRecorderRef.current.start();
      });

      wsClientRef.current.on('close', () => {
        console.log('Gemini Event: WebSocket connection closed');
        stopConnection();
      });

      wsClientRef.current.on('error', (err) => {
        console.error('Gemini Event: WebSocket error:', err);
        setError(`Connection error: ${err.message}`);
        stopConnection();
      });

      wsClientRef.current.on('audio', async (audioData) => {
        if (audioStreamerRef.current) {
          audioStreamerRef.current.addPCM16(new Uint8Array(audioData));
        }
      });

      const tools = [];
      const tavilyApiKey = process.env.NEXT_PUBLIC_TAVILY_API_KEY;

      if (tavilyApiKey) {
        tools.push({ functionDeclarations: [declaration] });
      }

      await wsClientRef.current.connect({
        model: 'models/gemini-2.0-flash-exp',
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
          responseModalities: ["audio"],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } },
          },
        },
        tools,
      });

      wsClientRef.current.send({
        text: "Hello!"
      });

    } catch (err: any) {
      console.error('Connection error:', err);
      setError(`Failed to connect: ${err.message}`);
      setConnectionStatus('disconnected');
      audioRecorderRef.current.stop();
      if (audioStreamerRef.current) {
        audioStreamerRef.current.stop();
        audioStreamerRef.current = null;
      }
    }
  };

  const handleConnectionToggle = async () => {
    if (connectionStatus === 'connected') {
      await stopConnection();
    } else {
      await initConnection();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isExpanded ? (
        <div
          onClick={() => setIsExpanded(true)}
          className="cursor-pointer bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 p-4 hover:border-primary-500 dark:hover:border-primary-500 transition-all shadow-sm hover:shadow"
        >
          <div className="w-10 h-10">
            <GeminiLogo className="w-full h-full" />
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 w-[450px] overflow-hidden shadow-md">
          <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 rounded-t-lg">
            <div className="flex items-center">
              <div className="w-8 h-8 mr-2">
                <GeminiLogo className="w-full h-full" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-gray-900 dark:text-gray-100">Charlie Gemini</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Powered by <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-primary-600 dark:text-primary-400">gemini-2.0-flash-exp</span>
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <span className="text-xl">×</span>
            </button>
          </div>

          <div className="p-6 bg-white dark:bg-gray-800">
            <div className="space-y-6">
              <div className="flex flex-col items-center">
                <button
                  onClick={handleConnectionToggle}
                  className={buttonStyles}
                  disabled={connectionStatus === 'connecting'}
                >
                  {connectionStatus === 'disconnected' && (
                    <IconMicrophone className="w-8 h-8" />
                  )}
                  {connectionStatus === 'connecting' && (
                    <IconSpinner className="w-8 h-8 animate-spin" />
                  )}
                  {connectionStatus === 'connected' && (
                    <IconStop className="w-8 h-8" />
                  )}

                  {connectionStatus === 'connected' && (
                    <div className="absolute inset-0">
                      <div className="absolute inset-0 rounded-full animate-ping opacity-25 bg-primary-500 dark:bg-primary-700"></div>
                    </div>
                  )}
                </button>

                <span className="mt-6 text-sm text-gray-600 dark:text-gray-400">{statusText}</span>
              </div>

              {connectionStatus === 'connected' && (
                <div className="flex justify-center items-center h-12">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="mx-1 w-1 bg-primary-500 dark:bg-primary-700 rounded-full animate-wave"
                      style={{
                        height: `${20 + Math.random() * 20}px`,
                        animationDelay: `${i * 0.1}s`
                      }}
                    />
                  ))}
                </div>
              )}

              {jsonString && (
                <div className="mt-4 border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                  <pre className="text-xs overflow-auto max-h-40">{jsonString}</pre>
                </div>
              )}

              {error && (
                <div className="text-red-500 dark:text-red-400 text-center text-sm">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gemini;

// Add this to your global CSS or as a styled component
const styles = `
@keyframes wave {
  0%, 100% {
    transform: scaleY(0.5);
  }
  50% {
    transform: scaleY(1);
  }
}

.animate-wave {
  animation: wave 1s ease-in-out infinite;
}
`;
