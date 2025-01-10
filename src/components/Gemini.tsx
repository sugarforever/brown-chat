import React, { useEffect, useRef, useState, useCallback } from 'react';
import { AudioRecorder } from '../utils/audio-recorder';
import { AudioStreamer } from '../utils/audio-streamer';
import { MultimodalLiveClient } from '../utils/MultimodalLiveClient';
import { SchemaType } from "@google/generative-ai";
import IconMicrophone from './icons/IconMicrophone';
import IconSpinner from './icons/IconSpinner';
import IconStop from './icons/IconStop';
import { Mic, Settings as SettingsIcon, KeyRound } from 'lucide-react';
import { ServerContent, ToolCall } from '@/types/multimodal-live-types';
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChatMessage } from '@/types/chat';
import Message from './Message';
import { SettingsForm } from './SettingsForm';

interface GeminiProps {
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}

const VOICE_NAMES = ["Puck", "Charon", "Kore", "Fenrir", "Aoede"]
const RESPONSE_MODALITIES = ["TEXT", "AUDIO"] as const;
type ResponseModality = typeof RESPONSE_MODALITIES[number];

const Gemini: React.FC<GeminiProps> = ({
  defaultExpanded = false,
  onExpandedChange
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [showSettings, setShowSettings] = useState(false);
  const [showApiSettings, setShowApiSettings] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedVoice, setSelectedVoice] = useState(localStorage.getItem('voice-name') || VOICE_NAMES[0]);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [error, setError] = useState<string>('');
  const lastMessageTimestampRef = useRef<number>(0);
  const [responseModality, setResponseModality] = useState<ResponseModality>(
    (localStorage.getItem('response-modality') as ResponseModality) || "AUDIO"
  );

  const wsClientRef = useRef<MultimodalLiveClient | null>(null);
  const audioRecorderRef = useRef<AudioRecorder>(new AudioRecorder());
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioStreamerRef = useRef<AudioStreamer | null>(null);
  const connectionStatusRef = useRef<'disconnected' | 'connecting' | 'connected'>('disconnected');

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

  const showTextMessageDeclaration = {
    name: "show_text_message",
    description: "Receive a Markdown format text message and display in the chat interface.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        message: {
          type: SchemaType.STRING,
          description: "The message to display. The message should always be in Markdown format.",
        },
      },
      required: ["message"],
    },
  };

  const openMeteoDeclaration = {
    name: "open_meteo_forecast",
    description: "Get weather forecast data from Open Meteo API for current location."
  };

  const buttonStyles = `w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 relative ${connectionStatus === 'disconnected'
    ? 'bg-primary-500 hover:bg-primary-600 dark:bg-primary-700 dark:hover:bg-primary-800 text-primary-500'
    : connectionStatus === 'connecting'
      ? 'bg-yellow-500 dark:bg-yellow-600 cursor-not-allowed'
      : 'bg-red-500 hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-800 text-primary-500'
    }`;

  const statusText = {
    connecting: 'Initializing connection...',
    connected: 'Tap to end conversation',
    disconnected: 'Tap to start conversation',
  }[connectionStatus];

  const updateConnectionStatus = (status: 'disconnected' | 'connecting' | 'connected') => {
    setConnectionStatus(status);
    connectionStatusRef.current = status;
  };

  // Define stopConnection first since it's simpler and doesn't depend on handleToolCall
  const stopConnection = useCallback(() => {
    if (wsClientRef.current) {
      wsClientRef.current.disconnect();
      wsClientRef.current = null;
    }
    audioRecorderRef.current.stop();
    if (audioStreamerRef.current) {
      audioStreamerRef.current.stop();
      audioStreamerRef.current = null;
    }
    updateConnectionStatus('disconnected');
  }, []);

  // Then define handleToolCall
  const handleToolCall = useCallback(async (toolCall: ToolCall) => {
    const tavilyFunctionCall = toolCall.functionCalls.find(fc => fc.name === declaration.name);
    const openMeteoFunctionCall = toolCall.functionCalls.find(fc => fc.name === openMeteoDeclaration.name);
    const showTextMessageCall = toolCall.functionCalls.find(fc => fc.name === showTextMessageDeclaration.name);

    if (showTextMessageCall && showTextMessageCall.args) {
      const message = showTextMessageCall.args.message;
      setMessages(prev => [...prev, { content: message, role: 'tool' }]);
      wsClientRef.current?.sendToolResponse({
        functionResponses: [{
          id: showTextMessageCall.id,
          name: showTextMessageDeclaration.name,
          response: { output: "Message displayed successfully" }
        }]
      });
    } else if (tavilyFunctionCall && tavilyFunctionCall.args) {
      try {
        const tavilyApiKey = localStorage.getItem('tavily-api-key');

        if (!tavilyApiKey) {
          throw new Error('Tavily API key not found. Please configure it in Settings.');
        }

        const response = await fetch('https://api.tavily.com/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            api_key: tavilyApiKey,
            query: tavilyFunctionCall.args.query,
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
            id: tavilyFunctionCall.id,
            name: declaration.name,
            response: { output: formattedResults }
          }]
        });

      } catch (error: any) {
        console.error('Tavily search error:', error);
        wsClientRef.current?.sendToolResponse({
          functionResponses: [{
            id: tavilyFunctionCall.id,
            name: declaration.name,
            response: { output: `Error performing search: ${error.message}` }
          }]
        });
      }
    } else if (openMeteoFunctionCall) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        const { latitude, longitude } = position.coords;
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m`);

        const data = await response.json();
        let formattedResults = 'Weather Forecast:\n\n';

        formattedResults += 'Current Weather:\n';
        formattedResults += `Temperature: ${data.current.temperature_2m}${data.current_units.temperature_2m}\n`;
        formattedResults += `Wind Speed: ${data.current.wind_speed_10m}${data.current_units.wind_speed_10m}\n\n`;

        formattedResults += 'Hourly Forecast (next 24 hours):\n';
        for (let i = 0; i < 24; i++) {
          formattedResults += `Time: ${data.hourly.time[i]}\n`;
          formattedResults += `Temperature: ${data.hourly.temperature_2m[i]}${data.hourly_units.temperature_2m}\n`;
          formattedResults += `Humidity: ${data.hourly.relative_humidity_2m[i]}${data.hourly_units.relative_humidity_2m}\n`;
          formattedResults += `Wind Speed: ${data.hourly.wind_speed_10m[i]}${data.hourly_units.wind_speed_10m}\n\n`;
        }

        wsClientRef.current?.sendToolResponse({
          functionResponses: [{
            id: openMeteoFunctionCall.id,
            name: openMeteoDeclaration.name,
            response: { output: formattedResults }
          }]
        });

      } catch (error: any) {
        console.error('Open Meteo API error:', error);
        let errorMessage = error.message;
        if (error.code === 1) { // Permission denied
          errorMessage = 'Location access denied. Please enable location services to get weather forecast.';
        } else if (error.code === 2) { // Position unavailable
          errorMessage = 'Unable to determine your location. Please try again later.';
        } else if (error.code === 3) { // Timeout
          errorMessage = 'Location request timed out. Please try again.';
        }
        wsClientRef.current?.sendToolResponse({
          functionResponses: [{
            id: openMeteoFunctionCall.id,
            name: openMeteoDeclaration.name,
            response: { output: `Error getting weather forecast: ${errorMessage}` }
          }]
        });
      }
    }
  }, []);

  // Update isExpanded when defaultExpanded changes
  useEffect(() => {
    setIsExpanded(defaultExpanded);
  }, [defaultExpanded]);

  // Notify parent of expansion state changes
  useEffect(() => {
    onExpandedChange?.(isExpanded);
  }, [isExpanded, onExpandedChange]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (wsClientRef.current) {
        wsClientRef.current.off('toolcall', handleToolCall);
      }
      stopConnection();
    };
  }, [stopConnection, handleToolCall]);

  const initConnection = async () => {
    try {
      updateConnectionStatus('connecting');
      setError('');

      const GEMINI_API_KEY = localStorage.getItem('gemini-api-key');
      const selectedVoice = localStorage.getItem('voice-name') || VOICE_NAMES[0];

      if (!GEMINI_API_KEY) {
        throw new Error('Gemini API key not found. Please configure it in Settings.');
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
        updateConnectionStatus('connected');
        audioRecorderRef.current.on('data', (base64Audio) => {
          if (connectionStatusRef.current === 'connected') {
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

      wsClientRef.current.on('error', (err: Error) => {
        console.error('Gemini Event: WebSocket error:', err);
        setError(`Connection error: ${err.message}`);
        stopConnection();
      });

      wsClientRef.current.on('audio', async (audioData) => {
        if (audioStreamerRef.current) {
          audioStreamerRef.current.addPCM16(new Uint8Array(audioData));
        }
      });

      wsClientRef.current.on('content', (content: ServerContent) => {
        console.log('Gemini Content Event:', content);
        const text = content.modelTurn?.parts?.[0]?.text;
        if (text) {
          const now = Date.now();
          const delta = now - lastMessageTimestampRef.current;

          setMessages(prev => {
            if (lastMessageTimestampRef.current > 0 && delta < 500 && prev.length > 0) {
              const newMessages = [...prev];
              newMessages[newMessages.length - 1] = {
                ...newMessages[newMessages.length - 1],
                content: newMessages[newMessages.length - 1].content + " " + text
              };
              return newMessages;
            } else {
              return [...prev, { content: text, role: 'assistant' }];
            }
          });
          lastMessageTimestampRef.current = now;
        }
      });

      // Register tool call handler
      wsClientRef.current.on('toolcall', handleToolCall);

      const tools = [];
      const tavilyApiKey = localStorage.getItem('tavily-api-key');
      const openMeteoEnabled = localStorage.getItem('use-open-meteo') === 'true';

      if (tavilyApiKey) {
        tools.push({ functionDeclarations: [declaration] });
      }

      if (openMeteoEnabled) {
        tools.push({ functionDeclarations: [openMeteoDeclaration] });
      }

      // Always include the show_text_message tool
      tools.push({ functionDeclarations: [showTextMessageDeclaration] });

      await wsClientRef.current.connect({
        model: 'models/gemini-2.0-flash-exp',
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
          responseModalities: [responseModality],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: selectedVoice } },
          },
        },
        tools,
      });

      wsClientRef.current.send({
        text: "Hello!"
      });

    } catch (error) {
      if (error instanceof Error) {
        console.error('Connection error:', error);
        setError(`Failed to connect: ${error.message}`);
        updateConnectionStatus('disconnected');
        audioRecorderRef.current.stop();
        if (audioStreamerRef.current) {
          audioStreamerRef.current.stop();
          audioStreamerRef.current = null;
        }
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

  const handleExpand = (expand: boolean) => {
    setIsExpanded(expand);
  };

  const handleVoiceChange = (voice: string) => {
    setSelectedVoice(voice);
    localStorage.setItem('voice-name', voice);
  };

  const handleModalityChange = (modality: string) => {
    setResponseModality(modality as ResponseModality);
    localStorage.setItem('response-modality', modality);
  };

  return (
    <div className="">
      {!isExpanded ? (
        <div
          onClick={() => handleExpand(true)}
          className="cursor-pointer bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 p-4 hover:border-primary-500 dark:hover:border-primary-500 transition-all shadow-sm hover:shadow"
        >
          <div className="w-10 h-10 flex items-center justify-center text-gray-600 dark:text-gray-400">
            <Mic className="w-6 h-6" />
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 w-[450px] overflow-hidden shadow-md">
          <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 rounded-t-lg">
            <div className="flex items-center">
              <div className="w-8 h-8 mr-2 flex items-center justify-center text-gray-600 dark:text-gray-400">
                <Mic className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-gray-900 dark:text-gray-100">Voice Chat</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Powered by <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-primary-600 dark:text-primary-400">gemini-2.0-flash-exp</span>
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setShowSettings(false)
                  setShowApiSettings(!showApiSettings)
                }}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <KeyRound className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  setShowSettings(!showSettings)
                  setShowApiSettings(false)
                }}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <SettingsIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleExpand(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <span className="text-xl">×</span>
              </button>
            </div>
          </div>

          {showApiSettings && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30">
              <SettingsForm />
            </div>
          )}

          {showSettings && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30">
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Conversation Settings</h3>

                <div className="space-y-2">
                  <Label htmlFor="voice-name" className="text-sm text-gray-700 dark:text-gray-300">AI Voice</Label>
                  <Select value={selectedVoice} onValueChange={handleVoiceChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a voice" />
                    </SelectTrigger>
                    <SelectContent>
                      {VOICE_NAMES.map((voice) => (
                        <SelectItem key={voice} value={voice}>
                          {voice}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="response-modality" className="text-sm text-gray-700 dark:text-gray-300">Response Modality</Label>
                  <Select value={responseModality} onValueChange={handleModalityChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a response modality" />
                    </SelectTrigger>
                    <SelectContent>
                      {RESPONSE_MODALITIES.map((modality) => (
                        <SelectItem key={modality} value={modality}>
                          {modality}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Placeholder for future settings */}
                <div className="space-y-2 opacity-50">
                  <div className="text-sm text-gray-500 dark:text-gray-400">More settings coming soon...</div>
                </div>
              </div>
            </div>
          )}

          {messages.length > 0 && (
            <div
              className="transition-[height] duration-300 ease-in-out overflow-hidden"
              style={{ height: messages.length > 0 ? '540px' : '0px' }}
            >
              <div className="h-full max-h-[540px] overflow-y-auto border-b border-gray-200 dark:border-gray-700">
                <div className="p-4 space-y-4">
                  {messages.map((message, index) => (
                    <Message key={index} message={message} />
                  ))}
                </div>
              </div>
            </div>
          )}

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
                      className="mx-1 w-1 rounded-full animate-wave bg-gray-500 dark:bg-gray-700"
                      style={{
                        height: `${20 + Math.random() * 20}px`,
                        animationDelay: `${i * 0.1}s`
                      }}
                    />
                  ))}
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
