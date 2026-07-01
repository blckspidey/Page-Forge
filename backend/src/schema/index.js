import { pgTable, uuid, text, timestamp, jsonb, integer } from 'drizzle-orm/pg-core';

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = pgTable('users', {
  id:         uuid('id').primaryKey().defaultRandom(),
  email:      text('email').unique().notNull(),
  password:   text('password'),                          // null for OAuth-only accounts
  name:       text('name'),
  avatar:     text('avatar'),                            // Google profile picture URL
  googleId:   text('google_id').unique(),               // Google OAuth ID
  provider:   text('provider').default('email'),        // 'email' | 'google'
  createdAt:  timestamp('created_at').defaultNow(),
});

// ─── PDF History ──────────────────────────────────────────────────────────────
export const pdfHistory = pgTable('pdf_history', {
  id:         uuid('id').primaryKey().defaultRandom(),
  userId:     uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  filename:   text('filename').notNull(),
  operation:  text('operation').notNull(), // 'merge'|'split'|'organize'|'edit'|'convert'|'secure'|'chat'|'summary'
  fileUrl:    text('file_url'),
  metadata:   jsonb('metadata'),           // { pages, size, pageCount, etc. }
  createdAt:  timestamp('created_at').defaultNow(),
});

// ─── Document Chunks (for RAG) ─────────────────────────────────────────────────
// pgvector extension must be enabled: CREATE EXTENSION IF NOT EXISTS vector;
export const documentChunks = pgTable('document_chunks', {
  id:          uuid('id').primaryKey().defaultRandom(),
  userId:      uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  sessionId:   uuid('session_id'),                       // links to chat_sessions
  docName:     text('doc_name').notNull(),
  chunkIndex:  integer('chunk_index').notNull(),
  chunkText:   text('chunk_text').notNull(),
  // embedding stored as text (comma-separated floats) for compatibility without pgvector JS types
  embedding:   text('embedding'),
  createdAt:   timestamp('created_at').defaultNow(),
});

// ─── Chat Sessions ────────────────────────────────────────────────────────────
export const chatSessions = pgTable('chat_sessions', {
  id:          uuid('id').primaryKey().defaultRandom(),
  userId:      uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  docName:     text('doc_name').notNull(),
  messages:    jsonb('messages').default([]),   // [{role:'user'|'assistant', content, ts}]
  createdAt:   timestamp('created_at').defaultNow(),
  updatedAt:   timestamp('updated_at').defaultNow(),
});
