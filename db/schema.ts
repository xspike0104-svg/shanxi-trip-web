import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const tripItinerary = sqliteTable("trip_itinerary", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  roomCode: text("room_code").notNull(),
  day: integer("day").notNull(),
  time: text("time").notNull(),
  title: text("title").notNull(),
  detail: text("detail").notNull().default(""),
  done: integer("done").notNull().default(0),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const tripExpenses = sqliteTable("trip_expenses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  roomCode: text("room_code").notNull(),
  description: text("description").notNull(),
  amount: real("amount").notNull(),
  paidBy: text("paid_by").notNull(),
  sharedBy: integer("shared_by").notNull().default(4),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const tripChecklist = sqliteTable("trip_checklist", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  roomCode: text("room_code").notNull(),
  label: text("label").notNull(),
  checked: integer("checked").notNull().default(0),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
