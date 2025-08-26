"use server";

import { enhanceDesign, EnhanceDesignOutput } from "@/ai/flows/ai-design-enhancement";
import { z } from "zod";

const enhanceDesignSchema = z.object({
  designDataUri: z.string(),
});

type Result = {
  success: boolean;
  data?: EnhanceDesignOutput;
  error?: string;
};

export async function enhanceDesignAction(
  values: z.infer<typeof enhanceDesignSchema>
): Promise<Result> {
  const validatedFields = enhanceDesignSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      success: false,
      error: "Invalid input.",
    };
  }

  try {
    const result = await enhanceDesign({
      designDataUri: validatedFields.data.designDataUri,
    });
    return { success: true, data: result };
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
    return {
      success: false,
      error: `Failed to enhance design: ${errorMessage}`,
    };
  }
}
