// This is an AI-powered tool that enhances uploaded designs by upscaling resolution, optimizing colors for printing, and suggesting potential layout improvements.
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
import wav from 'wav';

const EnhanceDesignInputSchema = z.object({
  designDataUri: z
    .string()
    .describe(
      'The design file as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // Correct the typo here
    ),
});
export type EnhanceDesignInput = z.infer<typeof EnhanceDesignInputSchema>;

const EnhanceDesignOutputSchema = z.object({
  enhancedDesignDataUri: z
    .string()
    .describe(
      'The enhanced design file as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
  suggestions: z.array(z.string()).describe('An array of suggestions for layout improvements.'),
});
export type EnhanceDesignOutput = z.infer<typeof EnhanceDesignOutputSchema>;

export async function enhanceDesign(input: EnhanceDesignInput): Promise<EnhanceDesignOutput> {
  return enhanceDesignFlow(input);
}

const enhanceDesignPrompt = ai.definePrompt({
  name: 'enhanceDesignPrompt',
  input: {schema: EnhanceDesignInputSchema},
  output: {schema: EnhanceDesignOutputSchema},
  prompt: `You are an AI design enhancement tool. You will receive a design file and enhance it by:
- Upscaling the resolution to at least 300 DPI for high-quality printing.
- Optimizing the colors for printing, ensuring they are vibrant and accurate.
- Suggesting potential layout improvements to make the design more visually appealing and effective for print-on-demand products.

Original Design: {{media url=designDataUri}}

Please provide the enhanced design as a data URI and a list of layout improvement suggestions.

Output the enhanced design and suggestions in the following format:
Enhanced Design: <enhanced_design_data_uri>
Suggestions: [<suggestion1>, <suggestion2>, ...]
`,
});

const enhanceDesignFlow = ai.defineFlow(
  {
    name: 'enhanceDesignFlow',
    inputSchema: EnhanceDesignInputSchema,
    outputSchema: EnhanceDesignOutputSchema,
  },
  async input => {
    // Call the image generation model to enhance the design.
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: [
        {
          media: {url: input.designDataUri},
        },
        {text: 'Enhance this image for print.'},
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'], // MUST provide both TEXT and IMAGE, IMAGE only won't work
      },
    });

    const {output} = await enhanceDesignPrompt({
      designDataUri: media?.url ?? input.designDataUri, // Use the enhanced image if available
    });

    return {
      enhancedDesignDataUri: media?.url ?? input.designDataUri,
      suggestions: output?.suggestions ?? [],
    };
  }
);
