import { BotMessage } from '../types';

/**
 * Servicio de bots de IA para conversaciones
 * Soporta OpenAI y Anthropic Claude
 */
export class AIBotService {
  private conversations: Map<string, BotMessage[]>;
  private aiService: 'openai' | 'anthropic' | 'mock';
  private apiKey: string | undefined;

  constructor() {
    this.conversations = new Map();
    
    // Configurar servicio de IA
    const configuredService = process.env.AI_SERVICE;
    if (configuredService === 'openai' || configuredService === 'anthropic') {
      this.aiService = configuredService;
    } else {
      this.aiService = 'mock';
    }
    
    this.apiKey = this.aiService === 'openai' 
      ? process.env.OPENAI_API_KEY 
      : process.env.ANTHROPIC_API_KEY;

    if (this.aiService !== 'mock' && !this.apiKey) {
      console.warn('⚠️ No se configuró API key para IA. Usando modo mock.');
      this.aiService = 'mock';
    }

    console.log(`🤖 AI Bot Service inicializado (modo: ${this.aiService})`);
  }

  /**
   * Inicializa una conversación con un bot
   */
  async initializeConversation(sessionId: string): Promise<void> {
    const systemMessage: BotMessage = {
      role: 'assistant',
      content: this.getSystemPrompt(),
    };

    this.conversations.set(sessionId, [systemMessage]);
    console.log(`✅ Conversación con bot inicializada: ${sessionId}`);
  }

  /**
   * Genera una respuesta del bot
   */
  async generateResponse(sessionId: string, userMessage: string): Promise<string> {
    let conversation = this.conversations.get(sessionId);

    // Si no existe la conversación, inicializarla
    if (!conversation) {
      await this.initializeConversation(sessionId);
      conversation = this.conversations.get(sessionId)!;
    }

    // Agregar mensaje del usuario
    conversation.push({
      role: 'user',
      content: userMessage,
    });

    // Generar respuesta según el servicio configurado
    let response: string;

    try {
      switch (this.aiService) {
        case 'openai':
          response = await this.generateOpenAIResponse(conversation);
          break;
        case 'anthropic':
          response = await this.generateAnthropicResponse(conversation);
          break;
        default:
          response = this.generateMockResponse(userMessage);
      }
    } catch (error) {
      console.error('❌ Error al generar respuesta de IA:', error);
      response = this.generateFallbackResponse();
    }

    // Agregar respuesta del bot al historial
    conversation.push({
      role: 'assistant',
      content: response,
    });

    // Limitar historial a últimos 20 mensajes para no exceder límites de tokens
    if (conversation.length > 20) {
      conversation = conversation.slice(-20);
      this.conversations.set(sessionId, conversation);
    }

    return response;
  }

  /**
   * Limpia una conversación
   */
  async cleanupConversation(sessionId: string): Promise<void> {
    this.conversations.delete(sessionId);
    console.log(`✅ Conversación con bot limpiada: ${sessionId}`);
  }

  /**
   * Genera respuesta usando OpenAI
   */
  private async generateOpenAIResponse(conversation: BotMessage[]): Promise<string> {
    // Implementación real requiere instalar 'openai' package
    // Por ahora, retornamos respuesta mock
    console.log('🤖 Generando respuesta con OpenAI (mock)');
    
    const lastMessage = conversation[conversation.length - 1].content;
    return this.generateMockResponse(lastMessage);
    
    /* Implementación real:
    const OpenAI = require('openai');
    const openai = new OpenAI({ apiKey: this.apiKey });
    
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: conversation.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      })),
      max_tokens: 150,
      temperature: 0.8,
    });
    
    return response.choices[0].message.content || this.generateFallbackResponse();
    */
  }

  /**
   * Genera respuesta usando Anthropic Claude
   */
  private async generateAnthropicResponse(conversation: BotMessage[]): Promise<string> {
    // Implementación real requiere instalar '@anthropic-ai/sdk' package
    // Por ahora, retornamos respuesta mock
    console.log('🤖 Generando respuesta con Anthropic (mock)');
    
    const lastMessage = conversation[conversation.length - 1].content;
    return this.generateMockResponse(lastMessage);
    
    /* Implementación real:
    const Anthropic = require('@anthropic-ai/sdk');
    const anthropic = new Anthropic({ apiKey: this.apiKey });
    
    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 150,
      messages: conversation.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      })),
    });
    
    return response.content[0].text || this.generateFallbackResponse();
    */
  }

  /**
   * Genera respuesta mock para desarrollo/testing
   */
  private generateMockResponse(userMessage: string): string {
    const responses = [
      '¡Hola! ¿Cómo estás? Me encanta conocer gente nueva.',
      'Eso suena interesante. Cuéntame más sobre eso.',
      '¡Qué genial! Yo también disfruto de esas cosas.',
      '¿De dónde eres? Me gustaría saber más sobre ti.',
      'Jaja, eso es divertido. ¿Tienes algún hobby favorito?',
      'Entiendo. ¿Y qué te gusta hacer en tu tiempo libre?',
      '¡Wow! Eso es fascinante. Nunca había pensado en eso.',
      '¿En serio? Eso es muy interesante.',
      'Me parece muy bien. ¿Qué más te gustaría compartir?',
      'Gracias por compartir eso conmigo. Es muy interesante.',
    ];

    // Respuestas contextuales simples
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('hola') || lowerMessage.includes('hi')) {
      return '¡Hola! ¿Cómo estás? Es un placer conocerte.';
    }
    
    if (lowerMessage.includes('cómo estás') || lowerMessage.includes('how are you')) {
      return '¡Estoy muy bien, gracias por preguntar! ¿Y tú cómo estás?';
    }
    
    if (lowerMessage.includes('adiós') || lowerMessage.includes('bye')) {
      return '¡Fue un placer charlar contigo! Que tengas un excelente día.';
    }
    
    if (lowerMessage.includes('nombre') || lowerMessage.includes('name')) {
      return 'Soy un bot amigable aquí para conversar contigo. ¿Cómo te llamas tú?';
    }
    
    if (lowerMessage.includes('?')) {
      return 'Esa es una buena pregunta. Déjame pensar... ' + 
             responses[Math.floor(Math.random() * responses.length)];
    }

    // Respuesta aleatoria
    return responses[Math.floor(Math.random() * responses.length)];
  }

  /**
   * Genera respuesta de fallback en caso de error
   */
  private generateFallbackResponse(): string {
    return 'Lo siento, tuve un pequeño problema. ¿Podrías repetir eso?';
  }

  /**
   * Obtiene el prompt del sistema para el bot
   */
  private getSystemPrompt(): string {
    return `Eres un bot amigable y conversacional en una plataforma de video chat aleatorio. 
Tu objetivo es mantener conversaciones interesantes y hacer que el usuario se sienta cómodo.
Sé amable, curioso y haz preguntas para conocer mejor a la persona.
Mantén las respuestas cortas (máximo 2-3 oraciones) para que la conversación fluya naturalmente.
Evita temas controversiales o sensibles.
Si el usuario parece incómodo o quiere terminar la conversación, sé comprensivo.`;
  }

  /**
   * Obtiene estadísticas de conversaciones activas
   */
  getStats(): {
    activeConversations: number;
    totalMessages: number;
  } {
    let totalMessages = 0;
    
    for (const conversation of this.conversations.values()) {
      totalMessages += conversation.length;
    }

    return {
      activeConversations: this.conversations.size,
      totalMessages,
    };
  }

  /**
   * Limpia conversaciones inactivas (mantenimiento)
   */
  cleanupInactiveConversations(): number {
    // En una implementación real, rastrearíamos timestamps
    // Por ahora, solo retornamos 0
    return 0;
  }
}

// Exportar instancia singleton
export const aiBotService = new AIBotService();
