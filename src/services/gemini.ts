import { GoogleGenerativeAI, type Tool, SchemaType } from '@google/generative-ai';
import { OverseerrService } from './overseerr';
import type { Settings, Message } from '../types';

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private overseerr: OverseerrService;

  constructor(settings: Settings) {
    this.genAI = new GoogleGenerativeAI(settings.geminiApiKey);
    this.overseerr = new OverseerrService(settings.overseerrUrl, settings.overseerrApiKey);

    // Define Tools
    const tools: Tool[] = [
      {
        functionDeclarations: [
          {
            name: 'search_media',
            description: 'Search for movies or TV shows in the Overseerr database to get their ID and details. Always search before requesting to ensure you have the correct ID.',
            parameters: {
              type: SchemaType.OBJECT,
              properties: {
                query: {
                  type: SchemaType.STRING,
                  description: 'The title of the movie or TV show to search for.',
                },
              },
              required: ['query'],
            },
          },
          {
            name: 'request_media',
            description: 'Request a movie or TV show on Overseerr. REQUIRES the exact mediaId found via search_media.',
            parameters: {
              type: SchemaType.OBJECT,
              properties: {
                mediaId: {
                  type: SchemaType.NUMBER,
                  description: 'The TMDB ID of the media.',
                },
                mediaType: {
                  type: SchemaType.STRING,
                  description: 'Either "movie" or "tv".',
                  enum: ['movie', 'tv'],
                  format: 'enum',
                },
                title: {
                    type: SchemaType.STRING,
                    description: 'The title of the media (for confirmation context).'
                },
                seasons: {
                  type: SchemaType.ARRAY,
                  description: 'List of season numbers to request (only for TV shows). If requesting all seasons, omit this or ask user.',
                  items: {
                    type: SchemaType.NUMBER,
                  },
                },
              },
              required: ['mediaId', 'mediaType', 'title'],
            },
          },
        ],
      },
    ];

    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-1.5-flash', // Cost effective and fast
      tools: tools,
    });
  }

  async sendMessage(history: Message[], newMessage: string, onTokenUsageUpdate?: (usage: any) => void): Promise<Message[]> {
    // Convert our internal Message format to Gemini's format
    // Note: Gemini stateful chat history is separate, but we can just send the context or use startChat

    const chat = this.model.startChat({
        history: history.filter(h => h.role !== 'system').map(h => ({
            role: h.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: h.content }],
        })),
    });

    try {
        let result = await chat.sendMessage(newMessage);
        let response = await result.response;
        let functionCalls = response.functionCalls();

        // Handle Tool Calls Loop
        // Gemini might return multiple function calls or just one.
        // We need to execute them and send the result back.

        // Add the initial user message if we were returning the whole chain,
        // but here we just return the new messages generated.

        // Track initial usage
        if (response.usageMetadata && onTokenUsageUpdate) {
            onTokenUsageUpdate(response.usageMetadata);
        }

        while (functionCalls && functionCalls.length > 0) {
            // For each function call, execute it
            const call = functionCalls[0]; // Simplification: handle first call. Gemini usually does one at a time or parallel.

            // Log thought process? Gemini doesn't always expose "thought" separate from text.
            // If there is text alongside function call, it's usually empty for 1.0 pro/flash unless specified.

            let functionResponse;
            try {
                if (call.name === 'search_media') {
                    const { query } = call.args;
                    console.log(`Executing Search: ${query}`);
                    const results = await this.overseerr.searchMedia(query as string);
                    functionResponse = {
                        results: results.slice(0, 5) // Limit context size
                    };
                } else if (call.name === 'request_media') {
                    const { mediaId, mediaType, seasons, title } = call.args;
                    console.log(`Executing Request: ${title}`);
                    const result = await this.overseerr.requestMedia({
                        mediaId: mediaId as number,
                        mediaType: mediaType as 'movie' | 'tv',
                        seasons: seasons as number[] | undefined
                    });
                    functionResponse = { success: true, message: "Request sent successfully", details: result };
                } else {
                    functionResponse = { error: "Unknown tool" };
                }
            } catch (err: any) {
                 functionResponse = { error: err.message };
            }

            // Send result back to model
            result = await chat.sendMessage([
                {
                    functionResponse: {
                        name: call.name,
                        response: functionResponse
                    }
                }
            ]);

            response = await result.response;

            // Track intermediate usage
            if (response.usageMetadata && onTokenUsageUpdate) {
                onTokenUsageUpdate(response.usageMetadata);
            }

            functionCalls = response.functionCalls();
        }

        return [{
            id: Date.now().toString(),
            role: 'assistant',
            content: response.text(),
            timestamp: Date.now()
        }];

    } catch (error) {
        console.error("Gemini Error:", error);
        throw error;
    }
  }
}
