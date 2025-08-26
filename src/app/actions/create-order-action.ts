"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { orders, orderItems, workOrders } from "@/lib/db/schema";

const createOrderSchema = z.object({
  productId: z.string(),
  designDataUri: z.string(),
  color: z.string(),
  size: z.string(),
  price: z.number(),
});

type Result = {
  success: boolean;
  orderId?: number;
  error?: string;
};

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

    // Use a transaction to ensure atomicity
    const result = await db.transaction(async (tx) => {
      // 1. Create the Order
      const [newOrder] = await tx
        .insert(orders)
        .values({
          customerName: "Demo Customer",
          status: "Pending",
          total: price.toString(),
        })
        .returning({ id: orders.id });

      const orderId = newOrder.id;

      // 2. Create the Order Item
      await tx.insert(orderItems).values({
        orderId: orderId,
        productId: productId,
        color: color,
        size: size,
        quantity: 1,
      });

      // 3. Create the Work Order
      await tx.insert(workOrders).values({
        orderId: orderId,
        productName: "T-Shirt",
        productColor: color,
        productSize: size,
        designDataUri: designDataUri,
        quantity: 1,
        status: "Needs Production",
        isSubcontract: needsSubcontracting(color, size),
      });

      return { orderId };
    });

    console.log("Order created with ID: ", result.orderId);
    return { success: true, orderId: result.orderId };

  } catch (e) {
    console.error("Error creating order: ", e);
    const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
    return {
      success: false,
      error: `Failed to create order: ${errorMessage}`,
    };
  }
}
