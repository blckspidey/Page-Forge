# 📄 Page Forge — PDF Toolkit

> A full-stack, production-ready PDF toolkit that runs entirely in the browser for rendering and in Node.js for processing. Edit, convert, merge, split, organize, and secure PDF documents with a premium, mobile-responsive interface.

![License](https://img.shields.io/badge/license-MIT-blue)
![Node](https://img.shields.io/badge/node-%3E%3D20-green)
![React](https://img.shields.io/badge/react-19-61dafb)
![Vite](https://img.shields.io/badge/vite-8-646cff)

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started (Local Dev)](#-getting-started-local-dev)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Deployment](#-deployment)
- [Architecture Overview](#-architecture-overview)
- [Key Design Decisions](#-key-design-decisions)
- [Contributing](#-contributing)

---

## ✨ Features

### 📝 Edit PDF
Interactive canvas-based PDF editor. Upload any PDF and overlay custom elements onto any page.

| Capability | Details |
|---|---|
| **Text overlay** | Custom font, size, and color; drag to reposition |
| **Shape overlay** | Rectangle, circle, and line with custom stroke color/thickness and optional fill |
| **Image embed** | Upload PNG/JPG and place it anywhere on the page |
| **Signature pad** | Native HTML5 canvas drawing pad (no external dependency) — mouse & touch supported |
| **Drag & move** | Mouse and touch drag for all element types |
| **Resize handles** | Corner dots on every element — drag to resize (touch-enabled, 16×16 px hit target) |
| **Zoom** | `−` / `+` / percentage reset in sticky nav bar; range 50 %–300 % in 25 % steps |
| **Multi-page** | Renders all pages simultaneously; scroll detection auto-tracks current page |
| **Export** | Sends overlay data to the backend; receives a processed PDF via `pdf-lib` |

### 🔄 Convert PDF
| Direction | Method |
|---|---|
| **PDF → Word (.docx)** | `pdf-parse` extracts the text layer; `docx` library assembles a `.docx` file |
| **Word (.docx) → PDF** | Windows: PowerShell + Microsoft Word COM automation; Linux/Docker: LibreOffice headless |

### 🔀 Merge PDF
Upload multiple PDFs and merge them into a single document in the order you choose. Uses `pdf-lib` to copy pages between documents.

### ✂️ Split PDF
Upload a PDF and split it into individual pages or custom page ranges. Each range is packaged as a separate PDF file; multiple outputs are bundled into a `.zip` archive using `archiver`.

### 🗂️ Organize PDF
Drag-and-drop page reordering. Renders page thumbnails using `pdfjs-dist`; submits the new page order to the backend which rebuilds the document with `pdf-lib`.

### 🔐 Secure PDF
| Mode | Details |
|---|---|
| **Encrypt** | Password-protect a PDF using `@pdfsmaller/pdf-encrypt` (AES-256) |
| **Decrypt** | Remove password protection with `@pdfsmaller/pdf-decrypt` given the correct password |

---

## 🛠 Tech Stack

### Frontend
| Package | Role |
|---|---|
| **React 19** | UI framework |
| **Vite 8** | Dev server & bundler |
| **Tailwind CSS v4 beta** | Utility-first styling |
| **React Router v6** | Client-side routing |
| **pdfjs-dist** | Client-side PDF rendering onto HTML5 canvas |
| **pdf-lib** | Client-side PDF inspection (page dimensions) |
| **Axios** | HTTP client with blob-error interceptor |
| **Lucide React** | Icon set |

### Backend
| Package | Role |
|---|---|
| **Express 4** | HTTP server & middleware |
| **Multer** | Multipart file upload handling |
| **pdf-lib** | PDF editing — overlay embedding, page manipulation |
| **pdf-parse** | PDF text extraction (PDF → Word path) |
| **docx** | `.docx` document generation |
| **archiver** | ZIP packaging for split outputs |
| **@pdfsmaller/pdf-encrypt / pdf-decrypt** | AES-256 PDF password protection |
| **@aws-sdk/client-s3** | Optional S3 storage backend (falls back to local disk) |
| **nodemon** | Dev auto-restart |

### Infrastructure
| Tool | Role |
|---|---|
| **Docker** | Containerise the Node.js backend with LibreOffice pre-installed |
| **Nginx** | Reverse proxy on EC2; handles gzip, large uploads (100 MB limit) |
| **AWS EC2** | Backend hosting |
| **Vercel / Netlify** | Frontend static hosting |
| **GitHub Actions** | CI/CD pipeline (see `.github/`) |

---

## 📁 Project Structure

```
Page-Forge/
├── frontend/                     # Vite + React SPA
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx     # Landing / tool selection
│   │   │   ├── EditPDF.jsx       # Interactive PDF editor
│   │   │   ├── ConvertPDF.jsx    # PDF ↔ Word conversion UI
│   │   │   ├── MergePDF.jsx      # PDF merge UI
│   │   │   ├── SplitPDF.jsx      # PDF split UI
│   │   │   ├── OrganizePDF.jsx   # Drag-and-drop page organizer
│   │   │   ├── SecurePDF.jsx     # Encrypt / decrypt UI
│   │   │   └── NotFound.jsx      # 404 page
│   │   ├── services/
│   │   │   └── api.js            # Axios instance + all API helpers
│   │   ├── App.jsx               # Router & layout
│   │   └── index.css             # Tailwind + global design tokens
│   ├── public/
│   ├── vite.config.js
│   └── package.json
│
├── backend/                      # Node.js + Express API
│   ├── src/
│   │   ├── server.js             # Entry point, port 5000
│   │   ├── app.js                # Express app, CORS, routes
│   │   ├── routes/
│   │   │   ├── pdf.routes.js     # /api/pdf/*
│   │   │   ├── convert.routes.js # /api/convert/*
│   │   │   └── secure.routes.js  # /api/secure/*
│   │   ├── controllers/
│   │   │   ├── pdf.controller.js
│   │   │   ├── convert.controller.js
│   │   │   └── secure.controller.js
│   │   ├── services/
│   │   │   ├── edit.service.js       # PDF overlay embedding (pdf-lib)
│   │   │   ├── merge.service.js      # PDF merge (pdf-lib)
│   │   │   ├── split.service.js      # PDF split + ZIP (pdf-lib + archiver)
│   │   │   ├── organize.service.js   # Page reorder (pdf-lib)
│   │   │   ├── convert.service.js    # Word↔PDF conversion
│   │   │   ├── secure.service.js     # Encrypt/decrypt
│   │   │   └── s3.service.js         # AWS S3 helper (optional)
│   │   └── middleware/
│   │       └── upload.middleware.js  # Multer config (50 MB limit)
│   ├── uploads/                  # Temp file storage (auto-created)
│   ├── Dockerfile
│   └── package.json
│
├── deployment/
│   └── nginx.conf                # Production Nginx reverse-proxy config
│
├── .github/
│   └── workflows/                # GitHub Actions CI/CD
│
└── DEPLOYMENT.md                 # Full cloud deployment guide
```

---

## 🚀 Getting Started (Local Dev)

### Prerequisites
- **Node.js ≥ 20**
- **npm ≥ 9**
- **Microsoft Word** (Windows only, for Word → PDF conversion)
- **LibreOffice** (Linux/macOS, for Word → PDF conversion in Docker)

### 1. Clone the repo

```bash
git clone https://github.com/your-username/Page-Forge.git
cd Page-Forge
```

### 2. Start the backend

```bash
cd backend
npm install
npm run dev          # Starts nodemon on http://localhost:5000
```

### 3. Start the frontend

```bash
cd frontend
npm install
npm run dev          # Starts Vite on http://localhost:5173
```

> Both servers must be running. The Vite dev config proxies `/api` requests to `localhost:5000`.

### 4. Open the app

```
http://localhost:5173
```

---

## 🔑 Environment Variables

Create a `.env` file inside `backend/` (see `.env.example`):

```env
# Server
PORT=5000
NODE_ENV=development

# AWS S3 (optional — omit to use local disk storage)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET_NAME=your_bucket_name
```

When the S3 variables are absent the backend falls back to local `uploads/` disk storage automatically.

---

## 📡 API Reference

All routes are prefixed with `/api`. File uploads use `multipart/form-data`. File downloads return binary responses (`application/pdf`, `application/zip`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`).

### PDF Operations — `/api/pdf`

| Method | Path | Body (form-data) | Description |
|---|---|---|---|
| `POST` | `/merge` | `files[]` (multiple PDFs) | Merge PDFs in upload order |
| `POST` | `/split` | `file` (PDF) | Split into individual pages; returns ZIP |
| `POST` | `/organize` | `file` (PDF), `pageOrder` (JSON array) | Rebuild PDF with new page order |
| `POST` | `/edit` | `file` (PDF), `elements` (JSON array) | Embed overlay elements; returns PDF |

#### `elements` schema (for `/edit`)
```json
[
  {
    "type": "text",
    "page": 1,
    "x": 100, "y": 200,
    "text": "Hello",
    "fontSize": 18,
    "fontFamily": "Helvetica",
    "color": "#8b5cf6"
  },
  {
    "type": "shape",
    "shapeType": "rectangle",
    "page": 1,
    "x": 50, "y": 50,
    "width": 200, "height": 100,
    "color": "#ef4444",
    "thickness": 2,
    "fill": false
  },
  {
    "type": "signature",
    "page": 1,
    "x": 80, "y": 300,
    "width": 120, "height": 50,
    "imageBuffer": "data:image/png;base64,..."
  }
]
```

### Conversion — `/api/convert`

| Method | Path | Body | Response |
|---|---|---|---|
| `POST` | `/word-to-pdf` | `file` (.docx) | PDF binary |
| `POST` | `/pdf-to-word` | `file` (.pdf) | .docx binary |

> **Windows dev**: Word → PDF uses PowerShell + Microsoft Word COM automation (requires Word installed).  
> **Linux/Docker**: Uses `soffice --headless` (LibreOffice, pre-installed in the Docker image).

### Security — `/api/secure`

| Method | Path | Body | Description |
|---|---|---|---|
| `POST` | `/encrypt` | `file` (PDF), `password` | AES-256 encrypt; returns PDF |
| `POST` | `/decrypt` | `file` (PDF), `password` | Remove password; returns PDF |

### Health Check

```
GET /api/health  →  200 { status: "ok" }
```

---

## ☁️ Deployment

See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for the full step-by-step guide. Summary:

### Backend → AWS EC2 + Docker

```bash
# Build image
docker build -t page-forge-backend ./backend

# Run container (maps host :5000 → container :5000)
docker run -d -p 5000:5000 \
  -e NODE_ENV=production \
  -e AWS_REGION=... \
  page-forge-backend
```

The Docker image (`node:20-slim`) pre-installs **LibreOffice Writer** and **qpdf** so Word → PDF and PDF encryption work out-of-the-box on Linux.

### Nginx (reverse proxy)

Copy `deployment/nginx.conf` to `/etc/nginx/sites-available/page-forge` on the EC2 host and symlink it to `sites-enabled`. Update `server_name` to your domain or public IP.

Key settings:
- `client_max_body_size 100M` — allows large PDF uploads
- Gzip enabled for JSON, JS, CSS payloads
- Proxy passes all traffic to `127.0.0.1:5000`

### Frontend → Vercel / Netlify

```bash
cd frontend
npm run build        # Outputs to dist/
```

Set the environment variable `VITE_API_BASE_URL` to your EC2 backend URL (e.g. `https://api.yourdomain.com`) before building.

### GitHub Actions CI/CD

`.github/workflows/` contains pipelines that:
1. Run `npm install` and lint on every PR
2. Build and push the Docker image to ECR on merge to `main`
3. SSH into EC2 and restart the container

---

## 🏗 Architecture Overview

```
┌─────────────────────────────┐
│        Browser (React)      │
│                             │
│  pdfjs-dist  → Canvas render│
│  pdf-lib     → Dim inspect  │
│  Axios       → API calls    │
└────────────┬────────────────┘
             │ HTTPS / REST
             ▼
┌─────────────────────────────┐
│     Nginx (EC2 reverse      │
│     proxy, gzip, 100MB)     │
└────────────┬────────────────┘
             │ HTTP localhost:5000
             ▼
┌─────────────────────────────┐
│   Express API (Node 20)     │
│                             │
│  /api/pdf/*   → pdf-lib     │
│  /api/convert/*             │
│    Word→PDF: PS/soffice     │
│    PDF→Word: pdf-parse+docx │
│  /api/secure/* → encrypt    │
│                             │
│  Multer → uploads/ (50MB)   │
│  S3Service → optional S3    │
└─────────────────────────────┘
```

### File lifecycle
1. Frontend uploads file via `multipart/form-data`
2. Multer writes it to `backend/uploads/<timestamp>-<random>-<originalname>`
3. Service function reads the file, processes it, and returns the result buffer
4. Controller streams the buffer back to the client
5. `finally` block deletes all temp files from disk

---

## 🧠 Key Design Decisions

### ESM-first backend
`package.json` sets `"type": "module"`. All imports use ESM `import` syntax. CommonJS packages (like `pdf-parse`) are loaded via `createRequire(import.meta.url)` to guarantee the correct callable default export.

### Native signature canvas
`react-signature-canvas` was removed because its CommonJS exports are misresolved by Vite's ESM interop in React 19, returning a module namespace object instead of the component class. The replacement uses a plain `<canvas>` element with `onMouseDown`/`onTouchStart` handlers — zero dependencies, React-version agnostic.

### Zoom via CSS `transform: scale`
Page zoom is applied as `transform: scale(zoom)` on an inner div, while the outer wrapper div is sized to `naturalWidth × zoom` so the scroll container allocates correct layout space. All drag, resize, and click coordinate deltas are divided by `zoom` to convert from screen pixels back to natural PDF coordinates.

### Word → PDF: `spawn` over `exec`
`child_process.spawn` is used with an argument array instead of `exec` with a shell string. This avoids `cmd.exe` quoting ambiguities for paths containing spaces (common on Windows user directories). `stderr` is captured separately and forwarded to the error response so failures are diagnosable.

### Dual-platform Word → PDF
- **Windows (dev):** PowerShell + Word COM automation (`New-Object -ComObject Word.Application`). Runs with `DisplayAlerts = 0`, `Visible = $false` to stay fully headless.
- **Linux/Docker (prod):** `soffice --headless --convert-to pdf` via LibreOffice (pre-installed in Docker image).

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push to the branch: `git push origin feat/my-feature`
5. Open a Pull Request against `main`

### Code style
- **Frontend**: ESLint with `eslint-plugin-react` and `eslint-plugin-react-hooks`
- **Backend**: ESM modules, async/await throughout, `finally` blocks for temp file cleanup
- Keep service functions pure (input path → output buffer); controllers handle HTTP concerns

---

## 📜 License

MIT © 2025 Page Forge Contributors
