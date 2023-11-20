import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { sqliteTable, int, text, customType } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

const date = customType<{
  data: Date;
  driverData: string;
}>({
  dataType: () => "text",
  toDriver: (date) => date.toISOString(),
  fromDriver: (driverData) => new Date(driverData),
});

export const Board = sqliteTable("board", {
  id: text("id")
    .primaryKey()
    .$default(() => crypto.randomUUID()),
  name: text("name").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => User.id),
  createdAt: date("createdAt")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const Sound = sqliteTable("sound", {
  id: text("id")
    .primaryKey()
    .$default(() => crypto.randomUUID()),
  name: text("name").notNull(),
  fileUrl: text("file_url"),
  fileName: text("file_name"),
  fileKey: text("file_key"),
  boardId: text("board_id").references(() => Board.id),
});

/* LUCIA TABLES */

export const User = sqliteTable("auth_user", {
  id: text("id").primaryKey(),
  username: text("username").unique().notNull(),
});

export const Session = sqliteTable("user_session", {
  id: text("id", {
    length: 128,
  }).primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => User.id),
  activeExpires: int("active_expires", {
    mode: "number",
  }).notNull(),
  idleExpires: int("idle_expires", {
    mode: "number",
  }).notNull(),
});

export const Key = sqliteTable("user_key", {
  id: text("id", {
    length: 255,
  }).primaryKey(),
  userId: text("user_id", {
    length: 15,
  })
    .notNull()
    .references(() => User.id),
  hashedPassword: text("hashed_password", {
    length: 255,
  }),
});

const sqlite = new Database("sqlite.db");
export const db = drizzle(sqlite);
