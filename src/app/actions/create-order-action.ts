"use server";

import { z } from "zod";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, setDoc } from "firebase/firestore";

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
    const orderCollectionRef = collection(db, "orders");
    const newOrderRef = await addDoc(orderCollectionRef, {
        customerName: "Demo Customer", // In a real app, this would come from auth
        status: "Pending",
        total: price,
        createdAt: serverTimestamp(),
        items: [ // Storing items as an array in the order
            {
                productId: productId,
                color: color,
                size: size,
                quantity: 1,
            }
        ]
    });
    
    console.log("Order created with ID: ", newOrderRef.id);

    // 2. Create the corresponding Work Order document
    const workOrderCollectionRef = collection(db, "work-orders");
    await addDoc(workOrderCollectionRef, {
        orderId: newOrderRef.id,
        productName: "T-Shirt", // Simplified
        productColor: color,
        productSize: size,
        designDataUri: designDataUri,
        quantity: 1, // For simplicity, each order is for 1 item
        status: "Needs Production",
        isSubcontract: needsSubcontracting(color, size),
        createdAt: serverTimestamp(),
    });

    console.log("Work Order created for order ID: ", newOrderRef.id);
    
    return { success: true, orderId: newOrderRef.id };

  } catch (e) {
    console.error("Error creating order: ", e);
    const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
    return {
      success: false,
      error: `Failed to create order: ${errorMessage}`,
    };
  }
}
