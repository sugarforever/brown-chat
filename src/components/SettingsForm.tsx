'use client';

import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { KeyRound } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface Settings {
  geminiKey: string;
  tavilyKey: string;
  useOpenMeteo: boolean;
}

export function SettingsForm() {
  const [settings, setSettings] = useState<Settings>({
    geminiKey: '',
    tavilyKey: '',
    useOpenMeteo: true
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load existing settings from localStorage
    const storedGeminiKey = localStorage.getItem('gemini-api-key') || '';
    const storedTavilyKey = localStorage.getItem('tavily-api-key') || '';
    const storedUseOpenMeteo = localStorage.getItem('use-open-meteo') !== 'false'; // default to true if not set
    setSettings({
      geminiKey: storedGeminiKey,
      tavilyKey: storedTavilyKey,
      useOpenMeteo: storedUseOpenMeteo
    });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('gemini-api-key', settings.geminiKey);
    localStorage.setItem('tavily-api-key', settings.tavilyKey);
    localStorage.setItem('use-open-meteo', settings.useOpenMeteo.toString());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="w-5 h-5" />
          API Settings
        </CardTitle>
        <CardDescription>
          Configure your API keys and service preferences. These settings are stored securely in your browser&apos;s local storage.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="gemini-key">Gemini API Key</Label>
            <Input
              id="gemini-key"
              type="password"
              value={settings.geminiKey}
              onChange={(e) => setSettings(prev => ({ ...prev, geminiKey: e.target.value }))}
              placeholder="Enter your Gemini API key"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tavily-key">Tavily API Key</Label>
            <Input
              id="tavily-key"
              type="password"
              value={settings.tavilyKey}
              onChange={(e) => setSettings(prev => ({ ...prev, tavilyKey: e.target.value }))}
              placeholder="Enter your Tavily API key"
            />
          </div>

          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="open-meteo" className="text-base font-medium">
                Use Open-Meteo Weather API
              </Label>
              <Switch
                id="open-meteo"
                checked={settings.useOpenMeteo}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, useOpenMeteo: checked }))}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Open-Meteo is an open-source weather API and offers free access for non-commercial use.
            </p>
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
