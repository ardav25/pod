"use server";

import { z } from "zod";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const createOrderSchema = z.object({
  productId: z.string(),
  designDataUri: z.string(),
  color: z.string(),
  size: z.string(),
  price: z.number(),
});

type Result = {
  success: boolean;
  orderId?: string;
  error?: string;
};

// A simplified function to determine if an item needs subcontracting
function needsSubcontracting(color: string, size: string): boolean {
    // Example logic: All XXL shirts or special colors are subcontracted
    return size === "XXL" || color === "Red";
}


export async function createOrderAction(
  values: z.infer<typeof createOrderSchema>
): Promise<Result> {
  const validatedFields = createOrderSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      success: false,
      error: "Invalid input.",
    };
  }

  try {
    const { productId, designDataUri, color, size, price } = validatedFields.data;
    
    // 1. Create the Order document
    const orderRef = await addDoc(collection(db, "orders"), {
      customerName: "Demo Customer", // In a real app, this would come from auth
      createdAt: serverTimestamp(),
      status: "Pending",
      price: price,
      items: [{ productId, color, size, quantity: 1 }],
    });

    console.log("Order created with ID: ", orderRef.id);
    
    // 2. Create the corresponding Work Order document
    const workOrderRef = await addDoc(collection(db, "work-orders"), {
        orderId: orderRef.id,
        createdAt: serverTimestamp(),
        product: {
            name: "T-Shirt",
            color: color,
            size: size
        },
        designDataUri: designDataUri,
        quantity: 1, // For simplicity, each order is for 1 item
        status: "Needs Production",
        isSubcontract: needsSubcontracting(color, size),
    });

    console.log("Work Order created with ID: ", workOrderRef.id);

    return { success: true, orderId: orderRef.id };

  } catch (e) {
    console.error("Error creating order: ", e);
    const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
    return {
      success: false,
      error: `Failed to create order: ${errorMessage}`,
    };
  }
}
