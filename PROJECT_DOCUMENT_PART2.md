# PageForge — Complete Project Documentation (Part 2 of 2)

---

## 9. AI Features — Deep Dive

This is the most technically sophisticated part of PageForge. It combines Google Gemini's embedding and generation APIs with pgvector for real-time semantic document search.

---

### 9.1 AI Service Configuration (`ai.service.js`)

The service uses the **new `@google/genai` SDK (v1.0.0)** — not the older `@google/generative-ai`. This distinction is critical:

| SDK | Endpoint | Gemini 2.5+ Support |
|---|---|---|
| `@google/generative-ai` (old) | `v1beta/models/...` | ❌ 404 for new models |
| `@google/genai` (new) | `v1/models/...` (stable) | ✅ Full support |

**Model resolution logic:** The service has a `RETIRED_OR_BLOCKED_TEXT_MODELS` blocklist. If the `GEMINI_TEXT_MODEL` env var is set to a retired model, it automatically falls back to `gemini-3.1-flash-lite`. This prevents silent 404 failures after model deprecations.

```javascript
const DEFAULT_GEMINI_TEXT_MODEL = 'gemini-3.1-flash-lite';
const RETIRED_OR_BLOCKED_TEXT_MODELS = new Set([
  'gemini-2.0-flash', 'gemini-2.5-flash', ...
]);
const GEMINI_TEXT_MODEL = resolveGeminiTextModel(); // checks env → blocklist → default
const GEMINI_EMBEDDING_MODEL = process.env.GEMINI_EMBEDDING_MODEL || 'gemini-embedding-001';
```

The client is initialized **lazily** — only when the first AI call is made. This prevents server startup failures if `GEMINI_API_KEY` is missing in non-AI deployments.

---

### 9.2 Feature A: PDF Summarizer

#### Complete Flow:

```
User uploads PDF
      │
      ▼
POST /api/ai/summarize   (authMiddleware + multer)
      │
      ▼
ai.controller.js → summarizePdf()
      │
      ├─ fs.readFileSync(req.file.path) → Buffer
      ├─ pdf-parse(buffer) → extracts raw text
      │   (error if scanned/image-only PDF)
      ├─ Validate: text.length > 50 chars
      │
      ▼
ai.service.js → generateSummary(text)
      │
      ├─ Builds structured prompt requesting JSON output
      ├─ ai.models.generateContent({
      │    model: 'gemini-3.1-flash-lite',
      │    contents: prompt,
      │    config: { responseMimeType: 'application/json' }
      │  })
      ├─ result.text → JSON.parse()
      │
      ▼
Returns to controller:
{
  "summary": "...",
  "keyPoints": ["...", "..."],
  "importantDates": ["..."],
  "actionItems": ["..."],
  "faqs": [{ "q": "...", "a": "..." }]
}
      │
      ├─ addHistoryEntry(userId, { operation: 'summary', ... })
      │
      ▼
res.json(structuredSummary)
      │
      ▼
Frontend (Summarize.jsx)
  Renders each section in styled cards
  Key Points → bullet list
  Dates → timeline-style list
  FAQs → expandable accordion
```

#### Why `responseMimeType: 'application/json'`?
This instructs Gemini to return strictly valid JSON without markdown code fences or extra prose. Without it, Gemini sometimes wraps JSON in ```json blocks which break `JSON.parse()`.

#### What happens with scanned/image PDFs?
`pdf-parse` extracts text from the PDF text layer. If the PDF consists only of scanned images (no text layer), `parsed.text` will be empty or near-empty. The controller catches this and returns: `"This PDF does not contain enough readable text."` OCR is not implemented.

---

### 9.3 Feature B: Chat with PDF (RAG Pipeline)

This is a full Retrieval-Augmented Generation implementation using pgvector as the vector database.

#### What is RAG?
Instead of sending an entire large document to an LLM (expensive, limited by context window), RAG:
1. **Splits** the document into chunks
2. **Embeds** each chunk into a vector (a numerical representation of meaning)
3. **Stores** vectors in a database
4. At query time: **embeds the question** → **finds the most similar chunks** → **sends only those chunks** as context to the LLM

#### 9.3.1 Phase 1 — Document Ingestion (Upload & Embed)

**Route:** `POST /api/ai/chat/upload` → `uploadAndEmbedPdf()`

```
User uploads PDF
      │
      ▼
pdf-parse → extract full text
      │
      ▼
Create ChatSession in DB (gets UUID id)
      │
      ▼
Upload PDF to S3: uploads/chat-{sessionId}.pdf
(awaited — S3 upload completes before proceeding)
      │
      ▼
chunkText(text, maxLength=1000, overlap=200)
      │
  Algorithm:
  - Clean whitespace: text.replace(/\s+/g, ' ').trim()
  - Sliding window with 200-char overlap between chunks
  - Filter: discard chunks < 50 characters
  - Finds last space before maxLength to avoid mid-word cuts
      │
      ▼
For each chunk (sequentially, not parallel):
  generateEmbeddings(chunk)
  → ai.models.embedContent({
       model: 'gemini-embedding-001',
       contents: chunk,
       config: { outputDimensionality: 768 }
     })
  → 768-dimensional float32 vector
      │
  db.$executeRawUnsafe(
    `INSERT INTO document_chunks
     (user_id, session_id, doc_name, chunk_index, chunk_text, embedding)
     VALUES ($1::uuid, $2::uuid, $3, $4, $5, $6::vector)`,
    userId, sessionId, filename, chunkIndex, chunk, `[${embedding.join(',')}]`
  )
      │
      ▼
Return: { sessionId, docName, suggestions: [...] }
```

**Why sequential embedding (not parallel)?** Rate-limit safety. Parallel embedding calls to Gemini would trigger 429 (rate limit) errors on free-tier API keys. Sequential ensures each embedding completes before the next is requested.

**Why 1000-char chunks with 200-char overlap?**
- 1000 characters (~150-200 words) gives enough context for meaningful answers
- 200-char overlap prevents losing context at chunk boundaries (a sentence that starts near the end of one chunk also appears at the start of the next)
- Chunks too small → poor context; too large → irrelevant noise in retrieved context

**Why 768 dimensions?**
`gemini-embedding-001` outputs 768-dimensional vectors. This is configurable via `outputDimensionality`. The pgvector column is declared as `vector(768)` — dimensions must match exactly or Postgres throws a type error.

**Why raw SQL for pgvector?** Prisma's type system doesn't support `vector(N)` as a native field type. The schema uses `Unsupported("vector(768)")` which generates no query builder methods. All vector inserts and similarity searches use `$executeRawUnsafe` and `$queryRawUnsafe`.

---

#### 9.3.2 Phase 2 — Chat Query (Retrieval + Generation)

**Route:** `POST /api/ai/chat/message` → `chatWithPdf()`

```
User sends question
      │
{ sessionId, question } in req.body
      │
      ▼
Verify session belongs to this user
(security: prevents cross-user data leaks)
      │
      ▼
generateEmbeddings(question)
→ 768-dim vector representing the query's meaning
      │
      ▼
Cosine Similarity Search:
db.$queryRawUnsafe(`
  SELECT chunk_text FROM document_chunks
  WHERE session_id = $1::uuid AND user_id = $2::uuid
  ORDER BY embedding <=> $3::vector
  LIMIT 5
`, sessionId, userId, vectorString)
      │
  <=> is pgvector's cosine DISTANCE operator
  (0 = identical direction, 2 = opposite)
  Ordered ascending = most similar first
  TOP 5 most relevant chunks retrieved
      │
      ▼
context = matchedChunks.map(c => c.chunk_text).join('\n\n')
      │
      ▼
askGeminiStream(context, question)
→ ai.models.generateContentStream({
     model: GEMINI_TEXT_MODEL,
     contents: systemPrompt + context + question
   })
→ returns AsyncIterator of chunks
      │
      ▼
Setup SSE (Server-Sent Events):
res.setHeader('Content-Type', 'text/event-stream')
res.setHeader('Cache-Control', 'no-cache')
res.setHeader('Connection', 'keep-alive')
      │
      ▼
for await (const chunk of stream) {
  const text = chunk.text;   // .text is a property (not a method)
  fullAnswer += text;
  res.write(`data: ${JSON.stringify({ text })}\n\n`);
}
      │
      ▼
After stream complete:
  Append Q&A to session.messages JSON array
  db.chatSession.update({ messages: updatedMessages })
      │
      ▼
res.write('data: [DONE]\n\n')
res.end()
```

**Why SSE (Server-Sent Events) instead of WebSockets?**
- SSE is unidirectional (server → client) — perfect for streaming AI responses
- Works over standard HTTP/1.1 (no protocol upgrade handshake)
- Nginx handles it correctly with `proxy_read_timeout 300s`
- WebSockets require additional setup (`Connection: upgrade` + WS proxy config)

**Frontend SSE consumption (ChatPDF.jsx):**
```javascript
const response = await fetch(`${API_BASE}/api/ai/chat/message`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',  // sends HttpOnly cookies
  body: JSON.stringify({ sessionId, question }),
});
const reader = response.body.getReader();
const decoder = new TextDecoder();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  const lines = decoder.decode(value).split('\n');
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = line.slice(6);
      if (data === '[DONE]') break;
      const parsed = JSON.parse(data);
      // Append parsed.text to the current AI message in state
      setMessages(prev => [...prev.slice(0, -1), {
        ...prev[prev.length - 1],
        content: prev[prev.length - 1].content + parsed.text
      }]);
    }
  }
}
```

**AbortController for React StrictMode:** React StrictMode double-invokes effects in development. Without an abort ref, two parallel SSE streams would write to the same message simultaneously. The `isStreamingRef` boolean lock prevents the second invocation from proceeding.

#### 9.3.3 RAG Prompt Engineering

The system prompt sent to Gemini:
```
You are an expert document assistant. You have been provided with the 
relevant context from a PDF document to answer the user's question.

Document Context:
---
{top 5 retrieved chunks, joined by \n\n}
---

User Question:
{question}

Instructions:
1. Use the provided Document Context to answer accurately.
2. If the user asks for suggestions/recommendations, combine document 
   context with your general knowledge for constructive advice.
3. Elaborate with general knowledge when relevant to the document topic.
4. Format output with markdown (lists, bolding, sections).
```

**Why allow general knowledge?** Pure RAG systems refuse to answer if the exact answer isn't in the retrieved chunks. For resumes and reports, users often ask "How can I improve my resume?" — this requires LLM intelligence beyond the retrieved text. The prompt explicitly permits this hybrid approach.

---

### 9.4 Gemini Models Used

| Model | Purpose | Input | Output |
|---|---|---|---|
| `gemini-embedding-001` | Text → vector embedding | String (chunk or query) | `float32[768]` |
| `gemini-3.1-flash-lite` | Summary + RAG chat | Text prompt | JSON string / streamed text |

---

## 10. Deployment — Complete Pipeline

### 10.1 Docker Configuration (`backend/Dockerfile`)

```dockerfile
FROM node:20-slim

# System deps: LibreOffice for Word→PDF, qpdf for encryption, fonts
RUN apt-get update && apt-get install -y --no-install-recommends \
    libreoffice-writer \
    libreoffice-common \
    qpdf \
    fonts-liberation \
    fonts-dejavu \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate        # generates Prisma client from schema
RUN mkdir -p uploads && chmod 777 uploads
EXPOSE 5000
ENV NODE_ENV=production
CMD ["npm", "start"]
```

**Why `node:20-slim` not `node:20-alpine`?** Alpine uses `musl libc` instead of `glibc`. LibreOffice and some native npm packages (particularly Prisma's query engine binary) are compiled against `glibc`. Slim uses Debian with `glibc` — compatible with all dependencies.

**Why `npm ci` not `npm install`?** `ci` installs exactly what's in `package-lock.json` — reproducible builds. `install` may update minor versions.

**Why `npx prisma generate` in Dockerfile?** Prisma generates a JavaScript client from `schema.prisma` — this is a build-time step that must happen after `COPY . .`. The generated client is included in the image.

---

### 10.2 CI/CD — GitHub Actions (`.github/workflows/deploy.yml`)

**Triggers:** Push to `main` or `v2` branches

**Steps:**
```
1. actions/checkout@v4           — checkout code
2. docker/setup-buildx-action@v3 — enable BuildKit (layer caching)
3. Clean DOCKER_USERNAME          — strip \r\n from secret (Windows line endings)
4. docker/login-action@v3        — login to Docker Hub
5. docker/build-push-action@v5   — build image from ./backend/Dockerfile
                                   push to dockerhub/page-forge-backend:latest
                                   cache-from/cache-to: type=gha (GitHub cache)
6. appleboy/ssh-action@v1.0.3   — SSH into EC2:
   a. docker login
   b. docker pull latest image
   c. docker stop page-forge-backend || true
   d. docker rm page-forge-backend || true
   e. docker run -d \
        --name page-forge-backend \
        -p 5000:5000 \
        --restart always \
        -v /var/www/uploads:/usr/src/app/uploads \
        --env-file /home/ubuntu/.env \
        username/page-forge-backend:latest
   f. docker image prune -f
```

**Required GitHub Secrets:**
| Secret | Value |
|---|---|
| `DOCKER_USERNAME` | Docker Hub username |
| `DOCKER_PASSWORD` | Docker Hub password or access token |
| `EC2_HOST` | EC2 public IP or domain |
| `EC2_USERNAME` | `ubuntu` (or your SSH user) |
| `EC2_SSH_KEY` | PEM private key content |

**`--env-file /home/ubuntu/.env`** — All 16+ environment variables are stored in a `.env` file on the EC2 instance. This file is never committed to Git. It's created manually on the server once and persists across deployments.

**`-v /var/www/uploads:/usr/src/app/uploads`** — Volume mount persists uploaded files across container restarts. Temporary files for local dev (non-S3) won't be lost on redeploy.

---

### 10.3 Nginx Production Configuration

```nginx
server {
    server_name api.pageforge.ganeshdev.me;
    client_max_body_size 100M;       # Allow large PDF uploads

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Extended timeouts for large PDF processing
        proxy_connect_timeout 300s;
        proxy_send_timeout    300s;
        proxy_read_timeout    300s;
        send_timeout          300s;
    }

    listen 443 ssl;
    ssl_certificate     /etc/letsencrypt/live/api.pageforge.ganeshdev.me/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.pageforge.ganeshdev.me/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}

server {
    if ($host = api.pageforge.ganeshdev.me) { return 301 https://$host$request_uri; }
    listen 80;
    server_name api.pageforge.ganeshdev.me;
    return 404;
}
```

**Why 300s timeouts?** Default Nginx timeout is 60s. Large PDF edits (100-page PDF with many image overlays) and Word→PDF conversion (LibreOffice startup + rendering) can take 60–180 seconds. Without extended timeouts, Nginx terminates the connection and the client sees a 504 Gateway Timeout while the server is still processing.

---

### 10.4 Frontend — Vercel Deployment

**`vercel.json`:**
```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

This SPA rewrite ensures direct URL access to any React route (e.g., `/edit-pdf`) returns `index.html` instead of a 404. React Router handles the routing client-side.

**Build command:** `npm run build` (Vite)  
**Output directory:** `dist/`  
**Environment variable:** `VITE_API_URL=https://api.pageforge.ganeshdev.me`

---

## 11. Security Architecture

### 11.1 Authentication Security

| Measure | Implementation |
|---|---|
| **HttpOnly Cookies** | JWT stored in `HttpOnly; Secure; SameSite=Strict` cookies — inaccessible to JavaScript (prevents XSS token theft) |
| **Access Token Expiry** | 15-minute lifetime — short window limits damage from a stolen token |
| **Refresh Token** | 7-day expiry in separate HttpOnly cookie — silently refreshes access tokens |
| **bcrypt cost factor 12** | ~300ms hash time — strong enough to resist brute-force even with modern hardware |
| **Email uniqueness** | Database unique constraint + application-level duplicate check |
| **Google OAuth** | Passport.js handles code exchange; email-based account linking (existing accounts by email get Google ID linked) |

### 11.2 API Security

| Measure | Implementation |
|---|---|
| **Helmet.js** | Sets 11+ security HTTP headers including `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security` |
| **CORS** | Only `FRONTEND_URL` + localhost allowed; `credentials: true`; explicit `exposedHeaders: ['Content-Disposition']` |
| **Rate Limiting** | `express-rate-limit` on all routes (configurable window + max requests) |
| **Input Validation** | File type whitelist in Multer; field validation in all controllers |
| **Session isolation** | `WHERE session_id = $1 AND user_id = $2` — users can only query their own document chunks |

### 11.3 File Security

| Measure | Implementation |
|---|---|
| **Temp file cleanup** | `safeUnlink()` in `finally` blocks — always cleans up even if processing fails |
| **Private S3 bucket** | No public access; all downloads via 24-hour presigned URLs |
| **File size limit** | Multer: 50MB per file; Nginx: 100MB total body |
| **No input file S3 upload** | Input files are deleted after processing; only output files go to S3 — prevents ENOENT crashes from async stream/delete race conditions |

---

## 12. Key Engineering Challenges & Solutions

### 12.1 ENOENT Server Crash (Solved)
**Problem:** Background S3 uploads of input files (`uploadFileToS3(req.file.path, ...)`) were started but not awaited. The controller's `finally` block would delete the local file (`safeUnlink`) before the S3 upload stream finished reading it. The stream then threw `ENOENT: no such file or directory` as an uncaught async exception — crashing the entire Node.js process.

**Solution:** Removed all S3 uploads of input/original files. Only the final processed output (already in-memory as a `Buffer`) is uploaded to S3. `uploadBufferToS3` never touches the disk, so there's no race condition.

### 12.2 History Race Condition (Solved)
**Problem:** `addHistoryEntry()` was called without `await` after `res.send()`. Frontend received the response, immediately fetched history, but the DB insert hadn't committed yet — history appeared stale.

**Solution:** `await addHistoryEntry(...)` is called **before** `res.send()` in every controller. The slight latency is invisible to users since the DB write completes in <50ms on Neon.

### 12.3 Gemini SDK 404 (Solved)
**Problem:** The old `@google/generative-ai` SDK calls `v1beta/models/gemini-2.5-flash:streamGenerateContent`. This endpoint returns `404` for newer models that are only available on the stable `v1` API.

**Solution:** Migrated to `@google/genai` (the new official SDK) which calls `v1/models/...` — the stable endpoint that supports all current Gemini models.

### 12.4 Large PDF Edit Timeouts (Solved)
**Problem:** Editing a large PDF (50+ pages, multiple images) could take 90–150 seconds. Both Nginx (60s default) and Axios (no timeout by default) would terminate the connection.

**Solution:**
- Nginx: `proxy_read_timeout 300s`
- Axios `editPDF` call: `timeout: 300000`, `maxContentLength: Infinity`, `maxBodyLength: Infinity`

### 12.5 Word-to-PDF Cross-Platform (Solved)
**Problem:** On Windows (dev), the system has Microsoft Word. In Docker on Linux (prod), Word doesn't exist.

**Solution:** Platform detection (`process.platform === 'win32'`) selects the conversion method. Windows uses PowerShell COM automation; Linux uses LibreOffice headless. Both are wrapped in a `spawnPromise` with a 90-second kill timeout to handle hung processes.

### 12.6 pgvector Raw SQL Requirement (By Design)
**Problem:** Prisma doesn't support `vector(768)` as a native field type for query building.

**Solution:** Schema uses `Unsupported("vector(768)")` to declare the column without query builder support. All vector operations use `$executeRawUnsafe` and `$queryRawUnsafe` with parameterized queries (safe from SQL injection since pgvector parses the vector string, not the SQL engine).

---

## 13. Environment Variables Reference

### Backend (`/home/ubuntu/.env` on EC2)

```env
# Server
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://pageforge.ganeshdev.me

# Database
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require

# JWT
JWT_SECRET=<32+ char random string>
JWT_REFRESH_SECRET=<different 32+ char string>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# AWS S3
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=ap-south-1
S3_BUCKET_NAME=page-forge-toolkit-storage

# Google AI
GEMINI_API_KEY=AIza...
GEMINI_TEXT_MODEL=gemini-3.1-flash-lite    # optional override
GEMINI_EMBEDDING_MODEL=gemini-embedding-001 # optional override

# Google OAuth (optional)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=https://api.pageforge.ganeshdev.me/api/auth/google/callback
```

### Frontend (Vercel environment)
```env
VITE_API_URL=https://api.pageforge.ganeshdev.me
```

---

## 14. Complete API Reference

### Auth (`/api/auth`)
| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/register` | — | `{email, password, name}` | `{user}` + sets cookies |
| POST | `/login` | — | `{email, password}` | `{user}` + sets cookies |
| POST | `/logout` | — | — | Clears cookies |
| POST | `/refresh` | — | — | Refreshes access token |
| GET | `/me` | ✅ | — | `{user}` |
| GET | `/google` | — | — | Redirect to Google OAuth |
| GET | `/google/callback` | — | — | Sets cookies, redirect to frontend |

### PDF Tools (`/api/pdf`) — Optional Auth
| Method | Path | Body Fields | Response |
|---|---|---|---|
| POST | `/merge` | `files[]` (2+ PDFs) | PDF binary |
| POST | `/split` | `file`, `splitPages` | PDF or ZIP binary |
| POST | `/organize` | `file`, `operations` (JSON) | PDF binary |
| POST | `/edit` | `file`, `elements` (JSON) | PDF binary |

### Convert (`/api/convert`) — Optional Auth
| Method | Path | Body Fields | Response |
|---|---|---|---|
| POST | `/word-to-pdf` | `file` (.docx) | PDF binary |
| POST | `/pdf-to-word` | `file` (.pdf) | DOCX binary |

### Secure (`/api/secure`) — Optional Auth
| Method | Path | Body Fields | Response |
|---|---|---|---|
| POST | `/protect` | `file`, `password` | PDF binary |
| POST | `/unlock` | `file`, `password` | PDF binary |

### AI (`/api/ai`) — Auth Required
| Method | Path | Body / File | Response |
|---|---|---|---|
| POST | `/summarize` | `file` (PDF) | `{summary, keyPoints, importantDates, actionItems, faqs}` |
| POST | `/chat/upload` | `file` (PDF) | `{sessionId, docName, suggestions[]}` |
| POST | `/chat/message` | `{sessionId, question}` | SSE stream of `{text}` chunks |
| GET | `/chat/sessions` | — | `{sessions[]}` |
| GET | `/chat/sessions/:id` | — | `{session, pdfUrl}` |
| DELETE | `/chat/sessions/:id` | — | Deletes session + S3 file |

### History (`/api/history`) — Auth Required
| Method | Path | Response |
|---|---|---|
| GET | `/` | `{history[]}` with presigned `file_url` |
| DELETE | `/:id` | Deletes single entry |
| DELETE | `/clear` | Deletes all user history |

---

## 15. Summary

PageForge demonstrates a complete, production-quality full-stack application with:

- **8 PDF processing tools** built on `pdf-lib`, `qpdf`, and LibreOffice
- **AI PDF Summarizer** using Gemini with structured JSON output
- **RAG-based Chat** with pgvector semantic search and SSE streaming
- **JWT + Google OAuth** authentication with HttpOnly cookie security
- **AWS S3** for persistent cloud file storage with presigned URLs
- **Neon serverless PostgreSQL** with pgvector for embeddings
- **Docker + GitHub Actions** CI/CD deploying to AWS EC2 behind Nginx SSL
- **Vercel** frontend with environment-based API routing
- Production stability fixes: ENOENT race condition resolved, history write race resolved, Gemini SDK migrated to stable v1 endpoint, Nginx timeouts extended for large files
