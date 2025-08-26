import {
  mysqlTable,
  serial,
  varchar,
  timestamp,
  decimal,
  int,
  text,
  boolean,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

export const orders = mysqlTable("printstream_orders", {
  id: serial("id").primaryKey(),
  customerName: varchar("customer_name", { length: 255 }),
  status: varchar("status", { length: 50 }).default("Pending").notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orderItems = mysqlTable("printstream_order_items", {
  id: serial("id").primaryKey(),
  orderId: int("order_id").notNull(),
  productId: varchar("product_id", { length: 100 }).notNull(),
  color: varchar("color", { length: 50 }),
  size: varchar("size", { length: 50 }),
  quantity: int("quantity").notNull(),
});

export const workOrders = mysqlTable("printstream_work_orders", {
  id: serial("id").primaryKey(),
  orderId: int("order_id").notNull(),
  productName: varchar("product_name", { length: 255 }).notNull(),
  productColor: varchar("product_color", { length: 50 }),
  productSize: varchar("product_size", { length: 50 }),
  designDataUri: text("design_data_uri"),
  quantity: int("quantity").notNull(),
  status: varchar("status", { length: 50 }).default("Needs Production").notNull(),
  isSubcontract: boolean("is_subcontract").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const ordersRelations = relations(orders, ({ many }) => ({
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
}));