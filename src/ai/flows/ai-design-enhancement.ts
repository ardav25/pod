'use server';
/**
 * @fileOverview AI Design Enhancement flow.
 *
 * This flow enhances uploaded designs using AI to automatically upscale resolution,
 * optimize colors for printing, and suggest potential layout improvements.
 *
 * @exports enhanceDesign - A function to enhance a design.
 * @exports EnhanceDesignInput - The input type for the enhanceDesign function.
 * @exports EnhanceDesignOutput - The output type for the enhanceDesign function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnhanceDesignInputSchema = z.object({
  designDataUri: z
    .string()
    .describe(
      "A photo of a design, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  prompt: z
    .string()
    .optional()
    .describe('An optional user prompt to guide the design enhancement.'),
});
export type EnhanceDesignInput = z.infer<typeof EnhanceDesignInputSchema>;

const EnhanceDesignOutputSchema = z.object({
  enhancedDesignDataUri: z
    .string()
    .describe(
      'The enhanced design file as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
  suggestions: z
    .array(z.string())
    .describe('An array of suggestions for layout improvements.'),
});
export type EnhanceDesignOutput = z.infer<typeof EnhanceDesignOutputSchema>;

export async function enhanceDesign(input: EnhanceDesignInput): Promise<EnhanceDesignOutput> {
  return enhanceDesignFlow(input);
}

const suggestionsPrompt = ai.definePrompt({
  name: 'suggestionsPrompt',
  input: {
    schema: z.object({
      designDataUri: z.string(),
    }),
  },
  output: {
    schema: z.object({
      suggestions: z
        .array(z.string())
        .describe(
          'An array of 3-5 concise, actionable suggestions for improving the design for a t-shirt. The suggestions should be creative and practical. For example: "Add a vintage texture to the design for a retro feel."'
        ),
    }),
  },
  prompt: `You are an expert print-on-demand design critic. Analyze the following design and provide 3-5 concise, actionable suggestions for how to improve it for a t-shirt print. The suggestions should be phrased as instructions for an AI image generation model.

Design: {{media url=designDataUri}}`,
});

const enhanceDesignFlow = ai.defineFlow(
  {
    name: 'enhanceDesignFlow',
    inputSchema: EnhanceDesignInputSchema,
    outputSchema: EnhanceDesignOutputSchema,
  },
  async input => {
    // 1. Generate suggestions based on the original image
    const suggestionPromise = suggestionsPrompt({
      designDataUri: input.designDataUri,
    });

    // 2. Generate the enhanced image
    const imageEnhancementPrompt = [
      {media: {url: input.designDataUri}},
      {
        text:
          input.prompt ||
          'Enhance this image for a high-quality t-shirt print. Increase resolution to 300 DPI, ensure clean lines, and make colors vibrant for direct-to-garment printing. Keep the original art style and subject matter. Do not add any new elements unless specifically asked. The output MUST be a clean image with a transparent background.',
      },
    ];

    const imagePromise = ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: imageEnhancementPrompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    // Await both promises in parallel
    const [suggestionResponse, imageResponse] = await Promise.all([
      suggestionPromise,
      imagePromise,
    ]);

    const suggestions = suggestionResponse.output?.suggestions ?? [];
    const enhancedDesignDataUri =
      imageResponse.media?.url ?? input.designDataUri;

    return {
      enhancedDesignDataUri,
      suggestions,
    };
  }
);
