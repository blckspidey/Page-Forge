# PageForge — Complete Project Documentation (Part 1 of 2)

---

## 1. Project Overview

**PageForge** is a production-grade, full-stack web application that provides a complete PDF processing toolkit combined with an AI-powered document intelligence layer. Users can perform every common PDF operation — merging, splitting, organizing, editing, converting, encrypting — directly in their browser without installing any software. Authenticated users additionally get access to AI-powered features: a structured PDF summarizer and a conversational "Chat with PDF" interface powered by Google Gemini and a RAG (Retrieval-Augmented Generation) vector search pipeline.

**Live URL:** https://pageforge.ganeshdev.me  
**API URL:** https://api.pageforge.ganeshdev.me  
**Repository:** https://github.com/blckspidey/Page-Forge (branch: `v2`)

---

## 2. Problem Statement

PDF is the world's most used document format, yet working with PDFs is painful:
- Adobe Acrobat requires expensive licensing
- SmallPDF, ILovePDF throttle free users with file-size limits and watermarks
- No free tool combines PDF editing, conversion, AI summarization, AND chat in one place
- Enterprise tools are overkill for students and freelancers

**PageForge solves this** by providing a completely free, open-source, self-hostable alternative that works without login for basic tools and adds AI capabilities for registered users.

---

## 3. Complete Feature List

### 3.1 PDF Toolkit (No Login Required)

| Feature | What It Does | Key Libraries |
|---|---|---|
| **Merge PDF** | Combines 2+ PDFs into one file | `pdf-lib` |
| **Split PDF** | Extracts page ranges into separate PDFs or a ZIP | `pdf-lib`, `archiver` |
| **Organize Pages** | Drag-and-drop reorder, rotate (90°/180°/270°), delete, insert blank pages | `pdf-lib` (backend), `PDF.js` (frontend preview) |
| **Edit PDF** | Overlay text, images, hand-drawn signatures, and shapes (rectangle, circle, line) on any PDF page | `pdf-lib` (backend), `PDF.js` (frontend canvas) |
| **Word → PDF** | Convert `.docx` to PDF | LibreOffice on Linux, PowerShell+Word COM on Windows |
| **PDF → Word** | Extract text from PDF and package as `.docx` | `pdf-parse`, `docx` |
| **Protect PDF** | Password-encrypt with 256-bit AES | `qpdf`, fallback: `@pdfsmaller/pdf-encrypt` |
| **Unlock PDF** | Remove password from a PDF | `qpdf`, fallback: `@pdfsmaller/pdf-decrypt` |

### 3.2 AI Features (Login Required)

| Feature | What It Does |
|---|---|
| **PDF Summarizer** | Upload any PDF → receive AI-structured output: summary paragraph, key points, important dates, action items, FAQs |
| **Chat with PDF** | Upload a PDF → it gets chunked, embedded into a pgvector database → ask questions in natural language → Gemini streams answers in real time |
| **Persistent Chat Sessions** | All conversations are saved to PostgreSQL; the original PDF is stored in AWS S3 |
| **Session History** | Previous chat sessions load from the sidebar with full message history |

### 3.3 Authentication System

- Email/password registration and login
- Google OAuth 2.0 (Passport.js)
- JWT-based auth with **access tokens (15 min)** and **refresh tokens (7 days)**
- Tokens stored in **HttpOnly cookies** (not localStorage — XSS-safe)
- Optional auth on PDF tools: logged-in users get history tracking; guests can still use tools freely

### 3.4 History & Cloud Storage

- Every PDF operation is logged to PostgreSQL (`pdf_history` table)
- Output files uploaded to **private AWS S3 bucket**
- History page generates **24-hour presigned S3 URLs** for secure re-download
- Single S3 presign failures don't crash the history list (wrapped in try-catch)

---

## 4. Technology Stack

### 4.1 Frontend

| Technology | Version | Why Used |
|---|---|---|
| **React** | 19.0.0 | Component-based UI, virtual DOM for efficient re-renders |
| **Vite** | Latest | Lightning-fast dev server with HMR, faster than CRA, native ESM |
| **React Router** | v6.22.3 | Client-side routing with protected routes |
| **Axios** | 1.6.8 | HTTP client; supports `withCredentials` for cookie-based auth, blob response types |
| **TailwindCSS** | v4 beta | Utility-first CSS, rapid styling without custom CSS files |
| **PDF.js (pdfjs-dist)** | 6.0.227 | Renders PDF pages as canvas elements in the browser (Edit & Organize) |
| **react-signature-canvas** | 1.0.6 | HTML5 canvas-based signature drawing pad |
| **react-markdown** | 10.1.0 | Renders Gemini's markdown-formatted AI responses |
| **Lucide React** | 1.18.0 | Clean SVG icon library |

### 4.2 Backend

| Technology | Version | Why Used |
|---|---|---|
| **Node.js** | 20 | Non-blocking I/O, same language as frontend, npm ecosystem |
| **Express.js** | 4.19.2 | Lightweight, unopinionated REST API framework |
| **Prisma ORM** | 7.8.0 | Type-safe DB access, schema migrations, Neon serverless adapter |
| **@prisma/adapter-neon** | 7.8.0 | Prisma adapter for Neon's WebSocket-based serverless Postgres |
| **@neondatabase/serverless** | 1.1.0 | Neon Postgres driver for serverless environments |
| **@google/genai** | 1.0.0 | New official Google AI SDK using stable v1 API (not deprecated v1beta) |
| **pdf-lib** | 1.17.1 | Pure JS PDF manipulation — merge, split, organize, edit overlays |
| **pdf-parse** | 1.1.1 | Extracts raw text from PDF binary for AI processing |
| **docx** | 8.5.0 | Builds `.docx` Word files programmatically |
| **archiver** | 8.0.0 | Streams multiple files into a ZIP archive for split output |
| **@aws-sdk/client-s3** | 3.1068.0 | AWS S3 file upload, delete operations |
| **@aws-sdk/s3-request-presigner** | 3.1068.0 | Generates temporary signed S3 download URLs |
| **@pdfsmaller/pdf-encrypt** | 1.0.2 | JS-based PDF AES encryption fallback |
| **@pdfsmaller/pdf-decrypt** | 1.0.1 | JS-based PDF decryption fallback |
| **passport** + **passport-google-oauth20** | Latest | Google OAuth 2.0 authentication strategy |
| **jsonwebtoken** | 9.0.3 | JWT sign and verify |
| **bcryptjs** | 3.0.3 | Password hashing with cost factor 12 |
| **multer** | 1.4.5-lts.1 | Multipart/form-data file uploads (50MB limit) |
| **helmet** | 8.2.0 | HTTP security headers (CSP, X-Frame-Options, etc.) |
| **cors** | 2.8.5 | Cross-origin request handling with credentials support |
| **cookie-parser** | 1.4.7 | Parses HTTP cookies from request headers |
| **express-rate-limit** | 8.5.2 | Request throttling to prevent abuse |

### 4.3 Database

| Technology | Role |
|---|---|
| **Neon PostgreSQL** | Serverless Postgres cloud database (auto-scales, no server management) |
| **pgvector extension** | Stores and queries 768-dimensional floating-point embeddings for semantic search |

### 4.4 Infrastructure & DevOps

| Technology | Role |
|---|---|
| **AWS EC2** | Backend server hosting (t2.micro or similar) |
| **AWS S3** | Object storage for chat PDFs and processed output files |
| **AWS IAM** | `page-forge-app-user` with scoped S3 permissions (PutObject, GetObject, DeleteObject) |
| **Docker** | Containerizes the Node.js backend with LibreOffice and qpdf system dependencies |
| **Docker Hub** | Container image registry (`username/page-forge-backend:latest`) |
| **Nginx** | Reverse proxy on EC2 — SSL termination, 100MB upload limit, 300s proxy timeouts |
| **Certbot / Let's Encrypt** | Free SSL certificates for `api.pageforge.ganeshdev.me` |
| **Vercel** | Frontend static hosting with SPA rewrites (`vercel.json`) |
| **GitHub Actions** | CI/CD pipeline — triggers on push to `main` or `v2`, builds Docker image, pushes to Hub, SSH deploys to EC2 |

---

## 5. Architecture

```
┌─────────────────────────────────────────────────────┐
│  Browser — pageforge.ganeshdev.me (Vercel)          │
│  React 19 + Vite + TailwindCSS                      │
│  PDF.js canvas rendering for Edit/Organize          │
└──────────────────┬──────────────────────────────────┘
                   │ HTTPS (Axios + withCredentials)
                   │ VITE_API_URL env variable
                   ▼
┌─────────────────────────────────────────────────────┐
│  Nginx (EC2 — api.pageforge.ganeshdev.me)           │
│  - SSL via Certbot/Let's Encrypt                    │
│  - client_max_body_size 100M                        │
│  - proxy_read_timeout 300s                          │
│  - Redirects HTTP → HTTPS                           │
└──────────────────┬──────────────────────────────────┘
                   │ proxy_pass → localhost:5000
                   ▼
┌─────────────────────────────────────────────────────┐
│  Docker Container: page-forge-backend               │
│  Node.js 20-slim + LibreOffice + qpdf               │
│  Express REST API on port 5000                      │
│  Volume: /var/www/uploads → /usr/src/app/uploads    │
└───────┬────────────────────┬────────────────────────┘
        │                    │
        ▼                    ▼
┌───────────────┐   ┌──────────────────────────────────┐
│  Neon Postgres│   │  AWS S3 (private bucket)          │
│  via Prisma   │   │  uploads/chat-{sessionId}.pdf     │
│  + pgvector   │   │  outputs/{operation}-{ts}-{name} │
│  Tables:      │   │  24-hour presigned download URLs  │
│  - users      │   └──────────────────────────────────┘
│  - chat_sess  │
│  - doc_chunks │            ▼
│  - pdf_history│   ┌──────────────────────────────────┐
└───────────────┘   │  Google Gemini API (@google/genai)│
                    │  Text model: gemini-3.1-flash-lite │
                    │  Embed model: gemini-embedding-001 │
                    │  Endpoint: v1 (stable, not v1beta) │
                    └──────────────────────────────────┘
```

---

## 6. Frontend — Page by Page

### 6.1 App.jsx — Router & Auth Guard
Defines all routes. Uses `AuthContext` for global user state. `ProtectedRoute` wraps AI pages — redirects to `/login` if not authenticated. PDF tool pages are public.

### 6.2 Dashboard.jsx
Landing page shown to logged-in users. Shows all available tools in a card grid with descriptions. Quick links to recent history.

### 6.3 EditPDF.jsx (most complex — 1484 lines)
The canvas-based PDF editor. Architecture:
1. **PDF.js renders** each page as a `<canvas>` element at `EDITOR_SCALE = 1.5`
2. User places elements (text boxes, images, signature pads, shapes) on an **overlay div** positioned absolutely above the canvas
3. Elements store coordinates in **screen space** (`x * EDITOR_SCALE`)
4. On save, coordinates are **divided by EDITOR_SCALE** to get raw PDF coords
5. Element data is sent as JSON in a `FormData` multipart request to `POST /api/pdf/edit`
6. Backend uses `pdf-lib` to draw overlays at the correct positions
7. Response blob is downloaded via `downloadBlob()` helper

**Element types supported:**
- `text` — custom font, size, color (Helvetica, Helvetica Bold, Times Roman, Courier)
- `image` — PNG/JPG upload, embedded as base64 data URL
- `signature` — drawn on HTML5 canvas via `react-signature-canvas`, saved as PNG data URL
- `shape` — rectangle, circle, line with fill/stroke options

**Key interaction features:** Drag-to-move, resize handles, click-to-select, delete button per element, page-specific layering (elements only appear on their target page).

### 6.4 OrganizePDF.jsx
Renders PDF thumbnails using PDF.js. Each page thumbnail is draggable. User can:
- Drag to reorder pages
- Click rotate button (cycles 0→90→180→270)
- Click delete (marks page for deletion)
- Insert blank page before/after any page

On save: sends `operations` JSON array to `POST /api/pdf/organize`.

### 6.5 MergePDF.jsx
Multi-file drop zone. Accepts 2–20 PDF files. Shows list with drag-to-reorder. Sends `files[]` array to `POST /api/pdf/merge`. Triggers browser download on success.

### 6.6 SplitPDF.jsx
Single file upload. User enters page ranges (e.g., `1-3, 5, 7-9`). Backend returns either a single PDF or a ZIP file depending on the number of ranges specified.

### 6.7 ConvertPDF.jsx
Two-tab UI: Word→PDF and PDF→Word. Validates file extension before upload. Shows progress indicator during conversion (LibreOffice can take 10–30 seconds).

### 6.8 SecurePDF.jsx
Two-tab UI: Protect (encrypt) and Unlock (decrypt). Password input with show/hide toggle. Clear error messages for wrong passwords.

### 6.9 Summarize.jsx (AI)
Upload a PDF → calls `POST /api/ai/summarize` → displays structured result:
- Summary paragraph in a highlighted card
- Key Points as a bullet list
- Important Dates as a timeline
- Action Items as a checklist
- FAQs in accordion/expandable format

Requires login. Redirects to login if not authenticated.

### 6.10 ChatPDF.jsx (AI)
The most feature-rich AI page. Three-panel layout:
- **Left sidebar:** lists past sessions with document names, delete button
- **Main area:** chat messages with markdown rendering via `react-markdown`
- **Right panel:** PDF preview using an `<iframe>` or `<embed>` with S3 presigned URL

**SSE Streaming:** Uses the `Fetch API` with `ReadableStream` to consume Server-Sent Events. Each SSE `data:` chunk is appended to the current AI message in real-time, creating a typewriter effect. An `AbortController` ref prevents duplicate streams in React StrictMode double-invocation.

### 6.11 History.jsx
Lists all past operations with operation type badge, filename, timestamp, and a re-download link (24-hour S3 presigned URL). Groups by date.

### 6.12 Login.jsx / Register.jsx
Styled auth forms with Google OAuth button. Error handling for duplicate emails, wrong passwords. On success, calls `GET /api/auth/me` to populate `AuthContext`.

---

## 7. Backend — Service by Service

### 7.1 app.js — Express Application
- Security: `helmet()` with `crossOriginResourcePolicy: cross-origin`
- CORS: allows `FRONTEND_URL` env + localhost variants; `credentials: true`; exposes `Content-Disposition` header (required for named file downloads)
- Body limits: `express.json({ limit: '50mb' })`, `express.urlencoded({ limit: '50mb' })`
- Static files: `/uploads` folder served for local dev
- Global error handler middleware

### 7.2 auth.controller.js

**Register:**
1. Validate email, password (min 6 chars), name
2. Check for duplicate email in `users` table
3. `bcrypt.hash(password, 12)` — cost factor 12 (secure but not too slow)
4. Create user in DB
5. `generateTokens(user)` → access token (15 min) + refresh token (7 days)
6. `setAuthCookies(res, tokens)` → sets HttpOnly, Secure, SameSite=strict cookies

**Login:**
1. Find user by email
2. `bcrypt.compare(inputPassword, storedHash)`
3. Generate and set tokens same as register

**Refresh:**
1. Read `refresh_token` from cookie
2. `verifyRefreshToken()` → decode, check expiry
3. Fetch user from DB (confirms account still exists)
4. Issue new pair of tokens

**Logout:** `clearAuthCookies(res)` — sets cookies to empty with maxAge=0

### 7.3 pdf.controller.js

Each handler follows this pattern:
1. Validate input (file present, required fields)
2. Call service function (CPU-bound PDF operation)
3. `await addHistoryEntry(userId, {...})` — write to DB **before** sending response (prevents race condition where frontend refreshes history before DB write completes)
4. Set `Content-Type` and `Content-Disposition` headers
5. `res.send(Buffer.from(bytes))`
6. `finally { safeUnlink(req.file.path) }` — always clean up temp file

**Why history is awaited before response:** Previously `addHistoryEntry` was fire-and-forget (no await). The frontend would receive the download response and immediately fetch history — but the DB insert hadn't committed yet, so history appeared stale. Awaiting ensures DB consistency.

### 7.4 edit.service.js — PDF Overlay Engine

Uses `pdf-lib` to:
1. Load PDF from disk with `PDFDocument.load(bytes)`
2. Embed standard fonts (Helvetica, HelveticaBold, TimesRoman, Courier)
3. For each element in the `elements` array:
   - Get the target page by 0-based index (`el.page - 1`)
   - Get `pageHeight` (pdf-lib uses bottom-left origin; web uses top-left)
   - **Coordinate conversion:** `yPdf = pageHeight - el.y - elementHeight`
   - Draw text with `page.drawText()`, image with `page.drawImage()`, shapes with `page.drawRectangle()` / `page.drawCircle()` / `page.drawLine()`
4. `pdfDoc.save()` → returns `Uint8Array`

### 7.5 organize.service.js — Page Operations Engine

Maintains a `pagesState` array representing the current page ordering with metadata (originalIndex, rotation, type: 'source'|'blank'). Operations are applied sequentially:
- `delete`: filters out 1-based page numbers
- `rotate`: accumulates rotation angle mod 360
- `blank`: splices a new blank page object into the array
- `reorder`: maps a new order array to existing pagesState

Final pass: creates a new `PDFDocument`, copies or adds pages in the final order with correct rotations.

### 7.6 split.service.js

Parses page range strings like `"1-3, 5, 7-9"` into arrays of page numbers. If only one range: returns a single PDF. If multiple ranges: uses `archiver` to stream multiple PDFs into a ZIP buffer.

### 7.7 merge.service.js

Uses `pdf-lib`:
1. `PDFDocument.create()` — empty output doc
2. For each input PDF: `PDFDocument.load(bytes)`, then `outputDoc.copyPages(sourceDoc, [...indices])`
3. `outputDoc.addPage(copiedPage)` for each page
4. `outputDoc.save()`

### 7.8 secure.service.js — Encryption/Decryption

**protectPDF:** Calls `qpdf --encrypt {userPass} {ownerPass} 256 -- {input} {output}`. This produces 256-bit AES-encrypted PDF (PDF 1.7 standard). Falls back to `@pdfsmaller/pdf-encrypt` if qpdf binary not found (e.g., local dev without qpdf installed).

**unlockPDF:** Calls `qpdf --password={pass} --decrypt {input} {output}`. Falls back to `@pdfsmaller/pdf-decrypt`. Sanitizes qpdf error messages to surface friendly user-facing text (e.g., "Incorrect password" instead of raw stderr).

### 7.9 convert.service.js — Document Conversion

**wordToPdf:**
- **On Windows (dev):** Generates a PowerShell script that uses Word COM automation (`New-Object -ComObject Word.Application`), opens the docx, exports as PDF (format code 17), then kills the Word process by PID
- **On Linux/Docker (prod):** Uses LibreOffice headless (`soffice --headless --convert-to pdf --outdir ...`)
- 90-second timeout via `spawnPromise` to kill hung processes
- Returns raw PDF bytes

**pdfToWord:**
- `pdf-parse` extracts text
- `docx` library creates a Word document with each line as a `Paragraph` with `TextRun` (Calibri 12pt)
- Returns a Buffer from `Packer.toBuffer(doc)`

### 7.10 s3.service.js — Cloud Storage

**uploadFileToS3:** Creates a read stream from local path, sends via `PutObjectCommand`. Used for chat PDFs (awaited — must complete before session is created).

**uploadBufferToS3:** Sends an in-memory `Buffer` directly. Used for processed output files (fire-and-forget — response is sent to user independently).

**getPresignedUrl:** Uses `getSignedUrl()` with `GetObjectCommand` and 86400-second (24-hour) expiry. Returns a temporary HTTPS URL that bypasses bucket privacy.

**isS3Configured:** Checks for all 4 required env vars (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET_NAME`, `AWS_REGION`). Returns boolean — used throughout to gracefully fall back to local storage in dev.

### 7.11 upload.middleware.js — File Upload Config

Multer configuration:
- **Storage:** Disk storage to `backend/uploads/` with timestamp+random unique filename
- **Filter:** Whitelists `.pdf`, `.docx`, `.png`, `.jpg`, `.jpeg`
- **Limits:** `fileSize: 50MB`, `fieldSize: 50MB` (fieldSize covers large base64 JSON strings from the edit tool's image elements)

### 7.12 auth.middleware.js

**authMiddleware:** Required auth — reads JWT from `access_token` cookie first, then `Authorization: Bearer` header. Decodes and attaches `req.user`. Returns 401 if missing or invalid.

**optionalAuth:** Same logic but never blocks. If token is valid, sets `req.user`. If missing/invalid, sets `req.user = null`. Used on all PDF tool routes so history logging works for logged-in users while guests proceed unblocked.

---

## 8. Database Schema (Prisma)

### 8.1 Users Table
```
id          String    @id @default(cuid())
email       String    @unique
name        String?
password    String?   (null for Google OAuth users)
avatar      String?
provider    String    @default("email")
google_id   String?   @unique
created_at  DateTime  @default(now())
```

### 8.2 ChatSession Table
```
id          String    @id @default(cuid())
user_id     String    (FK → users.id, cascade delete)
doc_name    String
messages    Json      @default("[]")
created_at  DateTime  @default(now())
updated_at  DateTime  @updatedAt
```
`messages` stores the full conversation as a JSON array:
`[{ role: "user"|"assistant", content: "...", timestamp: "ISO string" }]`

### 8.3 DocumentChunks Table
```
id            String    @id @default(cuid())
user_id       String    (FK → users.id)
session_id    String    (FK → chat_sessions.id, cascade delete)
doc_name      String
chunk_index   Int
chunk_text    String
embedding     Unsupported("vector(768)")
created_at    DateTime  @default(now())
```
The `embedding` column uses pgvector's `vector(768)` type. Because Prisma doesn't natively support this type, raw SQL is used for inserts (`$executeRawUnsafe`) and similarity queries (`$queryRawUnsafe`).

**Similarity search query:**
```sql
SELECT chunk_text FROM document_chunks
WHERE session_id = $1::uuid AND user_id = $2::uuid
ORDER BY embedding <=> $3::vector
LIMIT 5
```
The `<=>` operator is pgvector's **cosine distance** operator. Lower value = more similar.

### 8.4 PdfHistory Table
```
id          String    @id @default(cuid())
user_id     String    (FK → users.id, cascade delete)
filename    String
operation   String    (merge|split|organize|edit|convert|secure|summary|chat)
file_url    String?   (S3 key for output file, null for AI operations)
metadata    Json      @default("{}")
created_at  DateTime  @default(now())
```

---

*Continued in PROJECT_DOCUMENT_PART2.md*
