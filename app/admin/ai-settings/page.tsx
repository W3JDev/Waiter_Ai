"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { AIAPI } from "@/lib/api"
import type { AIConfig } from "@/types"
import { Loader2, Save, Bot, Sparkles } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

// Mock restaurant ID - in a real app, this would be dynamic
const RESTAURANT_ID = "123"

// AI providers
const AI_PROVIDERS = [
  { id: "openai", name: "OpenAI" },
  { id: "google", name: "Google AI" },
  { id: "groq", name: "Groq" },
]

// AI models by provider
const AI_MODELS = {
  openai: [
    { id: "gpt-4o", name: "GPT-4o" },
    { id: "gpt-4-turbo", name: "GPT-4 Turbo" },
    { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo" },
  ],
  google: [
    { id: "gemini-pro", name: "Gemini Pro" },
    { id: "gemini-ultra", name: "Gemini Ultra" },
  ],
  groq: [
    { id: "llama3-8b", name: "Llama 3 8B" },
    { id: "llama3-70b", name: "Llama 3 70B" },
    { id: "mixtral-8x7b", name: "Mixtral 8x7B" },
  ],
}

export default function AISettingsPage() {
  const [config, setConfig] = useState<AIConfig>({
    id: "",
    restaurant_id: RESTAURANT_ID,
    provider: "openai",
    model: "gpt-3.5-turbo",
    temperature: 0.7,
    max_tokens: 150,
    prompt_template:
      'Generate a detailed and appealing description for a menu item called "{{name}}". If any of the following information is available, incorporate it into the description: {{dietary_info}}, {{allergens}}, {{spice_level}}. Make it sound enticing and descriptive, between 100-150 characters.',
  })

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<string | null>(null)

  // Fetch AI config
  useEffect(() => {
    const fetchConfig = async () => {
      setIsLoading(true)
      try {
        const configData = await AIAPI.getConfig(RESTAURANT_ID)
        setConfig(configData)
      } catch (error) {
        console.error("Error fetching AI config:", error)
        // Use default config if none exists
      } finally {
        setIsLoading(false)
      }
    }

    fetchConfig()
  }, [])

  // Handle form input changes
  const handleChange = (field: keyof AIConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [field]: value }))
  }

  // Handle provider change
  const handleProviderChange = (provider: string) => {
    // Update provider
    handleChange("provider", provider)

    // Set default model for the selected provider
    const defaultModel = AI_MODELS[provider as keyof typeof AI_MODELS][0].id
    handleChange("model", defaultModel)
  }

  // Save AI config
  const saveConfig = async () => {
    setIsSaving(true)
    try {
      await AIAPI.updateConfig(config.id, config)
      toast({
        title: "Success",
        description: "AI settings saved successfully.",
      })
    } catch (error) {
      console.error("Error saving AI config:", error)
      toast({
        title: "Error",
        description: "Failed to save AI settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Test AI generation
  const testGeneration = async () => {
    setIsTesting(true)
    setTestResult(null)
    try {
      // Define test variables
      const name = "Delicious Pizza"
      const dietary_info = "Vegetarian"
      const allergens = "Gluten"
      const spice_level = "Mild"

      // Create a test object matching the prompt template
      const testData = {
        name: name,
        dietary_info: dietary_info,
        allergens: allergens,
        spice_level: spice_level,
      }

      // Just pass the name and other parameters separately
      const result = await AIAPI.generateDescription(name, "en", dietary_info, allergens, spice_level)
      setTestResult(result)
    } catch (error) {
      console.error("Error testing AI generation:", error)
      toast({
        title: "Error",
        description: "Failed to test AI generation. Please check your settings.",
        variant: "destructive",
      })
    } finally {
      setIsTesting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-5rem)]">
        <div className="glass-card p-8 rounded-lg">
          <h2 className="text-xl font-bold">Loading AI settings...</h2>
          <div className="mt-4 flex space-x-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce delay-75" />
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce delay-150" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <h2 className="text-3xl font-bold">AI Settings</h2>
        <div className="flex gap-2">
          <Button onClick={testGeneration} disabled={isTesting} variant="outline" className="gap-2">
            {isTesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}
            Test Generation
          </Button>
          <Button onClick={saveConfig} disabled={isSaving} className="gap-2">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Settings
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* AI Provider Settings */}
        <Card>
          <CardHeader>
            <CardTitle>AI Provider</CardTitle>
            <CardDescription>Configure your AI provider and model.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="provider">Provider</Label>
              <Select value={config.provider} onValueChange={handleProviderChange}>
                <SelectTrigger id="provider">
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  {AI_PROVIDERS.map((provider) => (
                    <SelectItem key={provider.id} value={provider.id}>
                      {provider.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Select value={config.model} onValueChange={(value) => handleChange("model", value)}>
                <SelectTrigger id="model">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  {AI_MODELS[config.provider as keyof typeof AI_MODELS].map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
              <Input
                id="api-key"
                type="password"
                placeholder="Enter your API key"
                value="••••••••••••••••••••••••••••••"
                onChange={() => {}}
              />
              <p className="text-xs text-muted-foreground">For security reasons, API keys are managed separately.</p>
            </div>
          </CardContent>
        </Card>

        {/* Generation Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Generation Settings</CardTitle>
            <CardDescription>Configure how the AI generates content.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="temperature">Temperature: {config.temperature.toFixed(1)}</Label>
              </div>
              <Slider
                id="temperature"
                min={0}
                max={1}
                step={0.1}
                value={[config.temperature]}
                onValueChange={(value) => handleChange("temperature", value[0])}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>More Predictable</span>
                <span>More Creative</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="max-tokens">Max Tokens: {config.max_tokens}</Label>
              </div>
              <Slider
                id="max-tokens"
                min={50}
                max={500}
                step={10}
                value={[config.max_tokens]}
                onValueChange={(value) => handleChange("max_tokens", value[0])}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Shorter</span>
                <span>Longer</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prompt Template */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Prompt Template</CardTitle>
            <CardDescription>Customize the prompt used for generating menu descriptions.</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={config.prompt_template}
              onChange={(e) => handleChange("prompt_template", e.target.value)}
              rows={6}
              className="font-mono text-sm"
            />
            <p className="mt-2 text-sm text-muted-foreground">
              Use variables like {"{name}"}, {"{dietary_info}"}, {"{allergens}"}, and {"{spice_level}"} in your
              template.
            </p>
          </CardContent>
        </Card>

        {/* Test Results */}
        {testResult && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                AI Generation Test Result
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="glass-card p-4 rounded-lg">
                <p className="italic">{testResult}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

