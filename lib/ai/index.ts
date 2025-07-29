// Enterprise AI Integration System for WaiterAI
// Dual AI Provider System: DeepSeek + Google Gemini with Vercel AI SDK

import { createOpenAI } from '@ai-sdk/openai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { generateText, streamText } from 'ai'

// AI Provider Configuration
export interface AIProvider {
  name: string
  endpoint?: string
  apiKey: string
  models: {
    chat: string
    description: string
    translation: string
  }
}

// DeepSeek Configuration
export const DEEPSEEK_CONFIG: AIProvider = {
  name: 'deepseek',
  endpoint: 'https://api.deepseek.com/v1',
  apiKey: process.env.DEEPSEEK_API_KEY || '',
  models: {
    chat: 'deepseek-chat',
    description: 'deepseek-chat',
    translation: 'deepseek-chat',
  }
}

// Google Gemini Configuration  
export const GEMINI_CONFIG: AIProvider = {
  name: 'google',
  apiKey: process.env.GOOGLE_AI_API_KEY || '',
  models: {
    chat: 'gemini-1.5-pro-latest',
    description: 'gemini-1.5-flash',
    translation: 'gemini-1.5-flash',
  }
}

// Subscription plan limits
export const AI_LIMITS = {
  free: {
    descriptionsPerMonth: 10,
    translationsPerMonth: 5,
    chatQueriesPerMonth: 20,
  },
  starter: {
    descriptionsPerMonth: 200,
    translationsPerMonth: 100,
    chatQueriesPerMonth: 500,
  },
  professional: {
    descriptionsPerMonth: 1000,
    translationsPerMonth: 500,
    chatQueriesPerMonth: 2000,
  },
  enterprise: {
    descriptionsPerMonth: -1, // unlimited
    translationsPerMonth: -1,
    chatQueriesPerMonth: -1,
  }
}

// Initialize AI providers
function getDeepSeekProvider() {
  return createOpenAI({
    baseURL: DEEPSEEK_CONFIG.endpoint,
    apiKey: DEEPSEEK_CONFIG.apiKey,
  })
}

function getGeminiProvider() {
  return createGoogleGenerativeAI({
    apiKey: GEMINI_CONFIG.apiKey,
  })
}

// Main AI Menu Description Generator Class
export class AIMenuDescriptionGenerator {
  private deepseek: ReturnType<typeof createOpenAI>
  private gemini: ReturnType<typeof createGoogleGenerativeAI>
  private fallbackProvider: 'gemini' | 'deepseek' = 'gemini'

  constructor() {
    this.deepseek = getDeepSeekProvider()
    this.gemini = getGeminiProvider()
  }

  /**
   * Generate sales-optimized menu item descriptions
   */
  async generateDescription(
    itemName: string,
    ingredients: string[],
    cuisine: string,
    dietary: string[] = [],
    allergens: string[] = [],
    spiceLevel?: string,
    language: string = 'en'
  ): Promise<{ description: string; provider: string; cost?: number }> {
    const prompt = this.buildDescriptionPrompt(
      itemName,
      ingredients,
      cuisine,
      dietary,
      allergens,
      spiceLevel,
      language
    )

    try {
      // Try DeepSeek first (primary provider)
      const result = await generateText({
        model: this.deepseek(DEEPSEEK_CONFIG.models.description),
        prompt,
        temperature: 0.7,
        maxTokens: 300,
      })

      return {
        description: result.text,
        provider: 'deepseek',
        cost: this.calculateCost(result.usage?.totalTokens || 0, 'deepseek')
      }
    } catch (error) {
      console.warn('DeepSeek failed, falling back to Gemini:', error)
      
      try {
        // Fallback to Gemini
        const result = await generateText({
          model: this.gemini(GEMINI_CONFIG.models.description),
          prompt,
          temperature: 0.7,
          maxTokens: 300,
        })

        return {
          description: result.text,
          provider: 'gemini',
          cost: this.calculateCost(result.usage?.totalTokens || 0, 'gemini')
        }
      } catch (fallbackError) {
        console.error('Both AI providers failed:', fallbackError)
        throw new Error('AI description generation failed. Please try again later.')
      }
    }
  }

  /**
   * Translate menu items to multiple languages
   */
  async translateMenuItem(
    itemName: string,
    description: string,
    targetLanguage: string,
    cuisine: string = ''
  ): Promise<{ name: string; description: string; provider: string }> {
    const prompt = this.buildTranslationPrompt(itemName, description, targetLanguage, cuisine)

    try {
      // Try DeepSeek first
      const result = await generateText({
        model: this.deepseek(DEEPSEEK_CONFIG.models.translation),
        prompt,
        temperature: 0.3, // Lower temperature for more consistent translations
        maxTokens: 200,
      })

      const parsed = this.parseTranslationResponse(result.text)
      return { ...parsed, provider: 'deepseek' }
    } catch (error) {
      console.warn('DeepSeek translation failed, falling back to Gemini:', error)
      
      try {
        const result = await generateText({
          model: this.gemini(GEMINI_CONFIG.models.translation),
          prompt,
          temperature: 0.3,
          maxTokens: 200,
        })

        const parsed = this.parseTranslationResponse(result.text)
        return { ...parsed, provider: 'gemini' }
      } catch (fallbackError) {
        console.error('Both translation providers failed:', fallbackError)
        throw new Error('Translation failed. Please try again later.')
      }
    }
  }

  /**
   * AI-powered menu chat assistant
   */
  async generateChatResponse(
    query: string,
    menuItems: any[],
    restaurantInfo: any,
    conversationHistory: Array<{ role: string; content: string }> = []
  ) {
    const prompt = this.buildChatPrompt(query, menuItems, restaurantInfo, conversationHistory)

    try {
      // Use streaming for better UX in chat
      const result = await streamText({
        model: this.deepseek(DEEPSEEK_CONFIG.models.chat),
        prompt,
        temperature: 0.8,
        maxTokens: 500,
      })

      return {
        stream: result.textStream,
        provider: 'deepseek'
      }
    } catch (error) {
      console.warn('DeepSeek chat failed, falling back to Gemini:', error)
      
      const result = await streamText({
        model: this.gemini(GEMINI_CONFIG.models.chat),
        prompt,
        temperature: 0.8,
        maxTokens: 500,
      })

      return {
        stream: result.textStream,
        provider: 'gemini'
      }
    }
  }

  /**
   * Build optimized description prompt
   */
  private buildDescriptionPrompt(
    itemName: string,
    ingredients: string[],
    cuisine: string,
    dietary: string[],
    allergens: string[],
    spiceLevel?: string,
    language: string = 'en'
  ): string {
    const languageMap = {
      en: 'English',
      zh: 'Chinese',
      ms: 'Malay',
      vi: 'Vietnamese',
      my: 'Burmese',
      ta: 'Tamil'
    }

    const targetLanguage = languageMap[language as keyof typeof languageMap] || 'English'
    
    return `You are an expert food writer specializing in ${cuisine} cuisine. Create an appetizing, sales-optimized menu description for "${itemName}" in ${targetLanguage}.

INGREDIENTS: ${ingredients.join(', ')}
${dietary.length > 0 ? `DIETARY INFO: ${dietary.join(', ')}` : ''}
${allergens.length > 0 ? `ALLERGENS: ${allergens.join(', ')}` : ''}
${spiceLevel ? `SPICE LEVEL: ${spiceLevel}` : ''}

REQUIREMENTS:
- 2-3 sentences maximum (80-120 words)
- Focus on flavors, textures, and cooking methods
- Use sensory language that makes people hungry
- Highlight premium or unique ingredients
- Include cultural context if relevant
- Make it sound irresistible and worth the price
- Write in ${targetLanguage} only

Generate the description now:`
  }

  /**
   * Build translation prompt
   */
  private buildTranslationPrompt(
    itemName: string,
    description: string,
    targetLanguage: string,
    cuisine: string
  ): string {
    const languageMap = {
      zh: 'Chinese (Simplified)',
      ms: 'Malay',
      vi: 'Vietnamese', 
      my: 'Burmese',
      ta: 'Tamil'
    }

    const targetLang = languageMap[targetLanguage as keyof typeof languageMap] || targetLanguage

    return `Translate this ${cuisine} menu item to ${targetLang}. Maintain the appetizing tone and cultural accuracy.

ITEM NAME: ${itemName}
DESCRIPTION: ${description}

Requirements:
- Keep the same length and appetizing style
- Use appropriate cultural food terms
- Maintain the premium/quality feeling
- Return in this exact format:

NAME: [translated name]
DESCRIPTION: [translated description]

Translate now:`
  }

  /**
   * Build chat assistant prompt
   */
  private buildChatPrompt(
    query: string,
    menuItems: any[],
    restaurantInfo: any,
    history: Array<{ role: string; content: string }>
  ): string {
    const menuSummary = menuItems.slice(0, 10).map(item => 
      `${item.name} (${item.category}) - $${item.price}: ${item.description.substring(0, 100)}...`
    ).join('\n')

    return `You are a friendly, knowledgeable menu assistant for ${restaurantInfo.name}, specializing in ${restaurantInfo.cuisine || 'diverse'} cuisine.

RESTAURANT INFO:
- Name: ${restaurantInfo.name}
- Location: ${restaurantInfo.address}
- Specialty: ${restaurantInfo.description || 'Great food with excellent service'}

POPULAR MENU ITEMS:
${menuSummary}

CONVERSATION HISTORY:
${history.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

CUSTOMER QUERY: ${query}

Respond helpfully about our menu, ingredients, dietary options, recommendations, or restaurant info. Be warm, conversational, and focus on making great recommendations. If asked about items not on our menu, politely redirect to our available options.

Response:`
  }

  /**
   * Parse translation response
   */
  private parseTranslationResponse(response: string): { name: string; description: string } {
    const nameMatch = response.match(/NAME:\s*(.+)/i)
    const descMatch = response.match(/DESCRIPTION:\s*(.+)/i)

    return {
      name: nameMatch?.[1]?.trim() || '',
      description: descMatch?.[1]?.trim() || response.trim()
    }
  }

  /**
   * Calculate cost based on tokens and provider
   */
  private calculateCost(tokens: number, provider: string): number {
    const rates = {
      deepseek: { input: 0.14, output: 0.28 }, // per 1M tokens (estimated)
      gemini: { input: 3.5, output: 10.5 }     // per 1M tokens
    }

    const rate = rates[provider as keyof typeof rates] || rates.deepseek
    return (tokens / 1000000) * rate.output // Simplified calculation
  }
}

// Singleton instance
export const aiGenerator = new AIMenuDescriptionGenerator()

// Language support
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ms', name: 'Bahasa Malaysia', flag: '🇲🇾' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'my', name: 'မြန်မာ', flag: '🇲🇲' },
  { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
]

// Usage tracking for subscription limits
export class AIUsageTracker {
  async trackUsage(
    restaurantId: string,
    type: 'description' | 'translation' | 'chat',
    provider: string,
    tokensUsed: number,
    cost: number
  ) {
    // This would integrate with the database to track usage
    console.log(`AI Usage: ${restaurantId} - ${type} - ${provider} - ${tokensUsed} tokens - $${cost}`)
  }

  async checkLimits(restaurantId: string, subscription: string, type: string): Promise<boolean> {
    // Check if user has remaining quota for this month
    const limits = AI_LIMITS[subscription as keyof typeof AI_LIMITS]
    if (!limits) return false

    // -1 means unlimited (enterprise)
    if (limits[`${type}PerMonth` as keyof typeof limits] === -1) return true

    // In real implementation, would check database for current month usage
    return true
  }
}

export const usageTracker = new AIUsageTracker()