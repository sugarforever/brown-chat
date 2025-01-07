'use client';

import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { KeyRound } from "lucide-react";

interface ApiKeys {
  geminiKey: string;
  tavilyKey: string;
}

export function SettingsForm() {
  const [keys, setKeys] = useState<ApiKeys>({
    geminiKey: '',
    tavilyKey: ''
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load existing keys from localStorage
    const storedGeminiKey = localStorage.getItem('gemini-api-key') || '';
    const storedTavilyKey = localStorage.getItem('tavily-api-key') || '';
    setKeys({
      geminiKey: storedGeminiKey,
      tavilyKey: storedTavilyKey
    });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('gemini-api-key', keys.geminiKey);
    localStorage.setItem('tavily-api-key', keys.tavilyKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="w-5 h-5" />
          API Keys
        </CardTitle>
        <CardDescription>
          Configure your API keys for Gemini and Tavily services. These keys are stored securely in your browser&apos;s local storage.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="gemini-key">Gemini API Key</Label>
            <Input
              id="gemini-key"
              type="password"
              value={keys.geminiKey}
              onChange={(e) => setKeys(prev => ({ ...prev, geminiKey: e.target.value }))}
              placeholder="Enter your Gemini API key"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tavily-key">Tavily API Key</Label>
            <Input
              id="tavily-key"
              type="password"
              value={keys.tavilyKey}
              onChange={(e) => setKeys(prev => ({ ...prev, tavilyKey: e.target.value }))}
              placeholder="Enter your Tavily API key"
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col items-start gap-4">
          <Button type="submit" className="w-full sm:w-auto">
            Save Settings
          </Button>

          {saved && (
            <p className="text-sm text-green-600 dark:text-green-500">
              Settings saved successfully!
            </p>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}
