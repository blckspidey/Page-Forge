# Page Forge Interview Questions and Answers

## LEVEL 0 — THE FIRST QUESTION

### Q1: Tell me about Page Forge.
**Answer:** Page Forge is a full-stack PDF workspace that lets users merge, split, organize, edit, secure, convert, summarize, and chat with PDF documents. It solves the problem of managing PDFs through a simple web experience instead of using multiple disconnected tools. The product combines a React frontend, an Express backend, PostgreSQL storage, AWS S3 for file storage, and Gemini AI for summarization and chat. The architecture is modular, with separate services for document processing, authentication, AI workflow, and data persistence. The biggest value is that it gives users both traditional PDF operations and modern AI-powered document understanding in one platform.

**Follow-up:** Why did you build it?  
**Answer:** I built it to create a single, polished platform for everyday PDF work, especially for students and professionals who need document manipulation and AI assistance in one place.

**Follow-up:** What was the hardest challenge?  
**Answer:** The hardest part was integrating document processing, storage, authentication, and AI workflows into a reliable end-to-end system while keeping the experience smooth for users.

**Follow-up:** What would you improve?  
**Answer:** I would improve scalability, add stronger observability, optimize vector retrieval performance, and add more advanced collaboration and batch-processing features.

**Follow-up:** Which part are you most proud of?  
**Answer:** I’m most proud of the AI document chat experience because it turns static PDFs into searchable, conversational knowledge.

**Follow-up:** Which part took the longest?  
**Answer:** The AI pipeline and the PDF editing experience took the longest because they involve multiple complex steps and edge cases.

---

## LEVEL 1 — PRODUCT QUESTIONS

### Why did you build Page Forge?
**Answer:** I built Page Forge because PDF workflows are often fragmented. Users need to merge files, protect them, convert formats, summarize content, and ask questions about documents, but most tools solve only one part of that journey.

**Follow-up:** Was there a market need?  
**Answer:** Yes. There is a strong need for a simple, web-based PDF toolkit that also supports AI features for content understanding.

**Follow-up:** Competitors?  
**Answer:** Competitors include SmallPDF, Adobe Acrobat, and various open-source PDF tools. The difference is that Page Forge combines core PDF operations with AI-powered summarization and document chat in one product.

**Follow-up:** Why would users use your platform instead of existing ones?  
**Answer:** Users get a cleaner experience, a unified workflow, and AI features that help them understand and interact with documents faster.

**Follow-up:** How is it different from SmallPDF?  
**Answer:** SmallPDF focuses heavily on basic PDF utilities, while Page Forge combines document manipulation with AI features and a more productized experience.

**Follow-up:** How is it different from Adobe Acrobat?  
**Answer:** Adobe Acrobat is enterprise-grade and broad, but Page Forge is lighter, more focused, and easier to extend with AI-driven workflows.

**Follow-up:** What problem are you solving?  
**Answer:** The main problem is making PDF work faster, easier, and smarter for everyday users.

### Who are your users?
**Answer:** The main users are students, professionals, freelancers, consultants, and small businesses. The product can also serve larger teams that need document management workflows.

**Follow-up:** Students?  
**Answer:** Yes, students use it for assignments, study material, and document organization.

**Follow-up:** Professionals?  
**Answer:** Yes, professionals use it for contracts, reports, invoices, and internal documents.

**Follow-up:** Enterprises?  
**Answer:** It can support enterprise use cases, but the current product is more optimized for individual and small-team workflows.

**Follow-up:** If 10,000 users come tomorrow what breaks first?  
**Answer:** The first bottlenecks would likely be storage throughput, authentication and rate limiting, AI API costs, and database query performance under high traffic.

---

## LEVEL 2 — HIGH LEVEL ARCHITECTURE

### Draw architecture.
**Answer:** A typical architecture is:

React Frontend → Express API → Authentication Layer → Document Service → AI Service → PostgreSQL → pgvector → AWS S3 → Gemini API.

### Explain request flow.
**Answer:** When a user uploads a PDF, the frontend sends the file to the backend. The backend stores the file in S3, writes metadata to PostgreSQL, extracts text, creates embeddings, and stores them in pgvector for later retrieval. When a user asks a question, the backend converts the query into an embedding, retrieves similar chunks from pgvector, augments the prompt with those chunks, and sends the combined request to Gemini.

**Follow-up:** Why upload directly to backend?  
**Answer:** Uploading through the backend is simpler for a first version and gives us a central place to validate files, enforce policies, and log metadata.

**Follow-up:** Why not presigned URLs?  
**Answer:** Presigned URLs are a good option for large-scale production deployments, but they add more complexity. The current architecture uses a backend-first flow to keep the initial implementation straightforward.

**Follow-up:** Why not upload directly to S3?  
**Answer:** Direct-to-S3 is efficient, but backend-based upload is easier to secure and manage in an MVP or early production version.

**Follow-up:** Why not store PDFs in database?  
**Answer:** Databases are not ideal for storing large binary files. Object storage like S3 is more efficient, cheaper, and better suited for files like PDFs.

**Follow-up:** Why not use object storage locally?  
**Answer:** Local object storage is fine for development, but S3 is more reliable and production-friendly because it provides durability, scaling, and integration with cloud workflows.

---

## LEVEL 3 — FRONTEND QUESTIONS

### Why React?
**Answer:** React is great for building interactive, component-based UIs. It makes it easier to manage state, reuse components, and create modern user interfaces for features like file upload, document preview, and chat panels.

**Follow-up:** React vs Angular  
**Answer:** React is more flexible and ecosystem-driven, while Angular is more opinionated and framework-complete.

**Follow-up:** React vs Vue  
**Answer:** Vue is simpler for some teams, but React has a larger ecosystem and stronger adoption for modern web products.

**Follow-up:** Virtual DOM  
**Answer:** React uses a virtual DOM to efficiently compare the previous and next UI trees and only update the parts that changed.

**Follow-up:** Reconciliation  
**Answer:** Reconciliation is the process React uses to determine the minimal set of DOM updates needed.

**Follow-up:** Fiber architecture  
**Answer:** Fiber is React’s internal re-rendering engine that improves scheduling, interruption, and prioritization of UI work.

**Follow-up:** Keys in React  
**Answer:** Keys help React identify which list items changed, were added, or removed, which improves rendering correctness and performance.

**Follow-up:** useEffect lifecycle  
**Answer:** useEffect runs after render and is used for side effects such as data fetching, subscriptions, or DOM integration.

**Follow-up:** Controlled components  
**Answer:** Controlled components get their value from React state, which makes validation and predictable behavior easier.

**Follow-up:** State management  
**Answer:** For a project like this, local state and Context API are enough for most parts. Redux would be overkill unless the app becomes more complex.

### Why Vite?
**Answer:** Vite is a fast build tool and dev server with excellent startup speed and hot module replacement. It improves the frontend development experience significantly.

**Follow-up:** Vite vs CRA  
**Answer:** Vite is faster and more modern than Create React App, which is now considered older and slower.

**Follow-up:** How does Vite work?  
**Answer:** Vite uses native ES modules in development and bundles for production, which makes startup and iteration much faster.

**Follow-up:** What is HMR?  
**Answer:** Hot Module Replacement lets the browser update modules without a full refresh, which improves developer productivity.

### State Management
**Answer:** I used local state and Context API for app-level auth and UI state. For this size of app, that was sufficient.

**Follow-up:** Why didn’t you use Redux?  
**Answer:** Redux adds boilerplate and is most useful when the app has many shared states, complex async flows, or a large team with stricter state patterns.

**Follow-up:** When should Redux be used?  
**Answer:** It should be used when state becomes shared across many components and becomes hard to manage with Context alone.

### Performance
**Answer:** Performance improvements can include code splitting, lazy loading, memoization, and avoiding unnecessary renders.

**Follow-up:** Lazy loading  
**Answer:** Lazy loading loads components only when needed, which improves initial page load time.

**Follow-up:** Code splitting  
**Answer:** Code splitting breaks the app into smaller bundles so users only download what they need.

**Follow-up:** Memoization  
**Answer:** Memoization caches expensive computations so they are not repeated unnecessarily.

**Follow-up:** React.memo  
**Answer:** React.memo prevents re-rendering of a component when its props have not changed.

**Follow-up:** useMemo  
**Answer:** useMemo memoizes values derived from computation-heavy logic.

**Follow-up:** useCallback  
**Answer:** useCallback memoizes functions so child components do not receive new function references unnecessarily.

---

## LEVEL 4 — BACKEND QUESTIONS

### Why Node?
**Answer:** Node is a strong choice for a real-time web app because it uses JavaScript across the stack, has a large ecosystem, and works well for APIs, file handling, and async workloads.

**Follow-up:** Why not Spring Boot?  
**Answer:** Spring Boot is excellent for enterprise Java applications, but Node was a better fit for this project because of speed of development and shared JavaScript expertise.

**Follow-up:** Why not Django?  
**Answer:** Django is great for Python-based web applications, but Node gave me a simpler full-stack JavaScript experience.

**Follow-up:** Why not Go?  
**Answer:** Go is excellent for high-performance services, but for this project Node offered faster development and enough performance for the workload.

### Node Architecture
**Answer:** Node follows an event-driven architecture with a single-threaded event loop, a call stack, and an event queue. It handles I/O asynchronously so it can scale well for many network requests.

**Follow-up:** Explain this code execution order.  
**Answer:** Synchronous code runs first on the call stack. Then microtasks such as Promise callbacks run, followed by macrotasks like timers and I/O callbacks, which are processed in the event loop.

### Express Questions
**Answer:** Express is used to define routes, manage middleware, and build the REST API cleanly.

**Follow-up:** Middleware flow  
**Answer:** Requests pass through middleware in order, and each middleware can inspect, transform, or stop a request.

**Follow-up:** Error middleware  
**Answer:** Express error middleware handles exceptions and returns consistent responses to the client.

**Follow-up:** Route middleware  
**Answer:** Route middleware runs for specific routes and is useful for validation and authentication.

**Follow-up:** Authentication middleware  
**Answer:** Authentication middleware verifies user identity before allowing access to protected endpoints.

### REST APIs
**Answer:** The backend exposes REST endpoints for authentication, document processing, AI features, chat sessions, and history.

**Follow-up:** REST principles  
**Answer:** REST emphasizes stateless communication, resource-based routes, and standard HTTP methods.

**Follow-up:** PUT vs PATCH  
**Answer:** PUT replaces a resource entirely, while PATCH updates part of it.

**Follow-up:** POST vs PUT  
**Answer:** POST creates a new resource or triggers an action, while PUT is used to replace an existing resource.

**Follow-up:** Idempotency  
**Answer:** Idempotency means repeating the same request has the same effect, which is important for safe retries.

**Follow-up:** Statelessness  
**Answer:** Statelessness means the server does not need to remember prior requests; each request carries the information needed for processing.

### Security
**Answer:** Security is handled through CORS configuration, Helmet headers, input validation, and authentication checks.

**Follow-up:** CORS  
**Answer:** CORS controls which origins are allowed to access the API.

**Follow-up:** Helmet  
**Answer:** Helmet adds security headers to reduce common web vulnerabilities.

**Follow-up:** Rate limiting  
**Answer:** Rate limiting prevents abuse and protects the API from traffic spikes and brute-force attacks.

**Follow-up:** Input validation  
**Answer:** Input validation ensures unexpected or malicious data does not break the system.

---

## LEVEL 5 — AUTHENTICATION

### Why JWT?
**Answer:** JWT is useful for stateless authentication because the server can verify the token without storing session state.

**Follow-up:** JWT structure  
**Answer:** A JWT has a header, payload, and signature. The header describes the algorithm, the payload contains claims, and the signature ensures integrity.

**Follow-up:** Header  
**Answer:** The header usually contains the token type and signing algorithm.

**Follow-up:** Payload  
**Answer:** The payload stores user identity and metadata such as expiration and roles.

**Follow-up:** Signature  
**Answer:** The signature ensures the token was issued by a trusted server and has not been tampered with.

### Access token vs Refresh token
**Answer:** Access tokens are short-lived and used for API access, while refresh tokens are long-lived and used to obtain new access tokens.

**Follow-up:** Why refresh token?  
**Answer:** Refresh tokens reduce the need to re-login frequently while keeping access tokens short-lived.

**Follow-up:** Expiration?  
**Answer:** Access tokens should expire quickly, often in minutes, while refresh tokens expire later.

**Follow-up:** Rotation?  
**Answer:** Token rotation is a good practice because it limits the impact of token theft.

### Where store JWT?
**Answer:** The expected approach is to store JWTs in HttpOnly cookies so they are not reachable by JavaScript and are less exposed to XSS attacks.

**Follow-up:** Why not localStorage?  
**Answer:** LocalStorage is accessible to JavaScript, so it is more vulnerable to XSS.

**Follow-up:** XSS attack?  
**Answer:** XSS can steal tokens from localStorage, which is why HttpOnly cookies are safer.

**Follow-up:** CSRF attack?  
**Answer:** Cookies can be vulnerable to CSRF unless the application uses SameSite protections and CSRF tokens.

### Authentication Flow
**Answer:** The login flow verifies credentials, generates a JWT, sends it in a cookie, and then the middleware validates it for protected routes.

**Follow-up:** Logout flow?  
**Answer:** Logout clears the cookie and invalidates the session state if applicable.

**Follow-up:** Token invalidation?  
**Answer:** Stateless JWTs cannot be revoked globally by default without a server-side blacklist or a short expiration policy.

**Follow-up:** Password reset?  
**Answer:** Password reset would require a secure email-based reset flow and hashed password updates.

---

## LEVEL 6 — DATABASE QUESTIONS

### Why PostgreSQL?
**Answer:** PostgreSQL is a reliable relational database with strong SQL support, transactions, JSON support, and a mature ecosystem. It fits the needs of user data, chat history, and document metadata well.

**Follow-up:** Why not MongoDB?  
**Answer:** MongoDB is useful for document-oriented data, but PostgreSQL is a better fit when structure, relational integrity, and SQL-based querying matter.

**Follow-up:** Why not MySQL?  
**Answer:** MySQL is solid, but PostgreSQL offers richer advanced features and is a strong choice for modern application platforms.

### Tables
**Answer:** The expected schema includes users, documents, chats, and embeddings or chunk records.

**Follow-up:** Users  
**Answer:** Users hold authentication and profile data.

**Follow-up:** Documents  
**Answer:** Documents store metadata about uploaded PDFs and their storage references.

**Follow-up:** Chats  
**Answer:** Chats track conversation sessions and messages.

**Follow-up:** Embeddings  
**Answer:** Embeddings store vector representations of text chunks that support retrieval.

### Relationships
**Answer:** Relationships include one-to-many links such as one user to many documents and one document to many chat sessions. Many-to-many patterns are less common but can appear with tags or shared access.

**Follow-up:** One-to-many  
**Answer:** One user can own many documents.

**Follow-up:** Many-to-many  
**Answer:** Many-to-many is useful for shared documents or tags if needed later.

### Indexing
**Answer:** Indexes improve read performance and help the database find rows faster.

**Follow-up:** Why indexes?  
**Answer:** Without indexes, queries can become slow on larger datasets.

**Follow-up:** Which columns indexed?  
**Answer:** Common candidates include user ID, document ID, session ID, and created timestamps.

**Follow-up:** Composite indexes?  
**Answer:** Composite indexes are useful for queries that filter on multiple columns together.

### Transactions
**Answer:** Transactions ensure consistency for multi-step operations. PostgreSQL supports ACID transactions and rollbacks.

**Follow-up:** ACID  
**Answer:** ACID stands for Atomicity, Consistency, Isolation, and Durability.

**Follow-up:** Isolation levels  
**Answer:** Isolation levels control how transactions interact with each other and how much locking or visibility they observe.

**Follow-up:** Rollbacks  
**Answer:** Rollbacks undo partial changes if an operation fails, which prevents inconsistent state.

### Query Optimization
**Answer:** Query efficiency matters for chat history retrieval, document metadata lookup, and analytics. Good practices include proper indexes, avoiding unnecessary joins, and using explain plans.

**Follow-up:** EXPLAIN ANALYZE  
**Answer:** EXPLAIN ANALYZE shows how PostgreSQL executes a query and whether it is using indexes efficiently.

**Follow-up:** N+1 problem  
**Answer:** The N+1 problem occurs when one query loads parent records and then a separate query runs for each child row, causing excessive round trips.

---

## LEVEL 7 — VECTOR DATABASE QUESTIONS

### What is embedding?
**Answer:** An embedding is a dense vector representation of text that captures semantic meaning. Similar ideas end up close together in vector space.

### How embeddings work?
**Answer:** A language model converts text into a fixed-length numeric vector where similar meanings produce similar directions and distances.

### Why vectors?
**Answer:** Vectors make similarity search possible. They allow the system to find semantically related chunks rather than only matching exact words.

### Similarity metrics
**Answer:** Common metrics include cosine similarity, Euclidean distance, and dot product.

**Follow-up:** Cosine similarity  
**Answer:** Cosine similarity measures the angle between vectors and is often preferred for text embeddings.

**Follow-up:** Euclidean distance  
**Answer:** Euclidean distance measures straight-line distance between vectors.

**Follow-up:** Dot product  
**Answer:** Dot product reflects how aligned two vectors are in the same direction.

### Why cosine similarity?
**Answer:** Cosine similarity is often preferred because it focuses on direction rather than magnitude, which works well for semantic embeddings.

### What is vector dimension?
**Answer:** Vector dimension is the length of the embedding vector, such as 1536 or 3072, depending on the model.

### Why same dimension required?
**Answer:** Similarity calculations require vectors of the same length so the operations are meaningful.

### What happens if dimensions mismatch?
**Answer:** The comparison will not work correctly unless the vectors are transformed or re-embedded into a common dimension.

### Exact Search
**Answer:** Exact search compares the query embedding against every stored vector, which is $O(N)$ in complexity.

### Approximate Search
**Answer:** Approximate search is used for scale because exact search becomes too slow as the number of vectors grows.

### HNSW
**Answer:** HNSW stands for Hierarchical Navigable Small World. It is an approximate nearest-neighbor index that provides fast search with strong recall, especially for high-dimensional vectors.

**Follow-up:** Full form  
**Answer:** Hierarchical Navigable Small World.

**Follow-up:** Working  
**Answer:** It builds a graph of vectors so search can navigate through nearby nodes quickly.

**Follow-up:** Complexity  
**Answer:** It provides fast approximate retrieval with practical tradeoffs in build time and memory.

**Follow-up:** Parameters  
**Answer:** Parameters include efConstruction, efSearch, and the maximum number of connections per node.

### IVFFlat
**Answer:** IVFFlat stands for Inverted File Flat. It partitions vectors into clusters and searches only the most relevant clusters.

**Follow-up:** Full form  
**Answer:** Inverted File Flat.

**Follow-up:** Training phase  
**Answer:** The index builds clusters from the vectors before serving queries.

**Follow-up:** Lists  
**Answer:** The index organizes vectors into lists or clusters.

**Follow-up:** Probes  
**Answer:** Probes control how many clusters are searched per query.

### HNSW vs IVFFlat
**Answer:** HNSW usually provides better recall and faster search at the cost of more memory and index build time. IVFFlat is more memory-efficient but can require careful tuning.

**Follow-up:** Recall  
**Answer:** Recall measures how often the correct result is retrieved.

**Follow-up:** Speed  
**Answer:** Speed measures how quickly queries return results.

**Follow-up:** Build time  
**Answer:** Build time is how long it takes to create the index.

**Follow-up:** Memory usage  
**Answer:** Memory usage depends on the index type and the number of vectors.

### Why pgvector instead of Pinecone, Weaviate, Chroma, or Milvus?
**Answer:** pgvector is attractive because it keeps the vector search inside PostgreSQL, which simplifies the architecture and reduces operational overhead. It is a strong choice for a product that already uses PostgreSQL and wants a lower-complexity setup.

---

## LEVEL 8 — RAG QUESTIONS

### What is RAG?
**Answer:** RAG stands for Retrieval-Augmented Generation. It improves LLM answers by first retrieving relevant context from a knowledge source before generating a response.

### RAG pipeline?
**Answer:** The pipeline is: PDF → extract text → chunk → embed → store vectors → query embedding → similarity search → context retrieval → prompt augmentation → LLM response.

### Chunking
**Answer:** Chunking breaks long documents into smaller, meaningful pieces for retrieval. It helps improve retrieval relevance and fit within model context windows.

**Follow-up:** Chunk size?  
**Answer:** Chunk size should balance context richness and retrieval granularity.

**Follow-up:** Why this size?  
**Answer:** It is chosen to preserve meaning while ensuring retrieval remains precise and efficient.

**Follow-up:** Chunk overlap?  
**Answer:** Overlap helps preserve context between adjacent chunks and reduces the chance of losing important information at boundaries.

**Follow-up:** Recursive chunking?  
**Answer:** Recursive chunking splits text hierarchically by structure, such as paragraphs and sentences, which is useful for documents with headings.

**Follow-up:** Semantic chunking?  
**Answer:** Semantic chunking groups content by meaning rather than by fixed character counts, which often improves retrieval quality.

### Embeddings
**Answer:** Embeddings are generated with a model suited for semantic similarity, and the embedding dimension and model choice affect both quality and cost.

**Follow-up:** Which model?  
**Answer:** A compact and cost-effective Gemini embedding model is appropriate for this kind of application.

**Follow-up:** Why?  
**Answer:** The model should provide strong semantic similarity while keeping latency and cost manageable.

**Follow-up:** Dimension?  
**Answer:** The dimension depends on the chosen embedding model and should be consistent across the index and queries.

**Follow-up:** Cost?  
**Answer:** Cost is an important tradeoff because embeddings and LLM calls create recurring inference costs.

### Retrieval
**Answer:** Retrieval uses the user query embedding to find the most relevant chunks.

**Follow-up:** Top K value?  
**Answer:** Top K controls how many chunks are retrieved for each query.

**Follow-up:** Why top 5?  
**Answer:** Top 5 is a good starting point for balancing relevance and context size.

**Follow-up:** Dynamic top K?  
**Answer:** Dynamic Top K can be used when query complexity or document size suggests more or fewer chunks.

### Re-ranking
**Answer:** Re-ranking is a strong improvement if you want higher relevance. In a first version, simpler retrieval may be sufficient, but re-ranking can be added later.

**Follow-up:** Did you use it?  
**Answer:** Not in the initial version, but it is a natural next step for quality improvement.

**Follow-up:** If not, why not?  
**Answer:** I prioritized speed and architecture simplicity over additional retrieval complexity.

### Hallucinations
**Answer:** Hallucinations happen when the model generates information that is not grounded in the retrieved context. They can be reduced by using strong retrieval, clear prompts, and limiting the model’s freedom.

**Follow-up:** Why happen?  
**Answer:** They happen because LLMs are generative and can overgeneralize when the evidence is weak or incomplete.

**Follow-up:** How reduce?  
**Answer:** Reduced by better chunking, better retrieval, prompt grounding, and limiting unsupported claims.

**Follow-up:** Prompt engineering?  
**Answer:** Prompt engineering helps guide the model to answer only from the provided context.

### Context Window
**Answer:** The context window is the amount of text the model can read at once. If retrieved text exceeds the window, the system must trim or split it.

**Follow-up:** Gemini context limit?  
**Answer:** Gemini models support a large context window, but it still needs to be managed carefully for efficiency and cost.

**Follow-up:** What if retrieved text exceeds context?  
**Answer:** The system can reduce the number of retrieved chunks or compress the context before sending it to the model.

### Metadata Filtering
**Answer:** Metadata filtering ensures the retrieval only uses data relevant to the signed-in user or the specific document.

**Follow-up:** User ID filtering?  
**Answer:** Yes, that is important for multi-tenant isolation.

**Follow-up:** Document filtering?  
**Answer:** Yes, retrieval should stay scoped to the document being queried.

### Multi-document Retrieval
**Answer:** Multi-document retrieval is implemented by storing documents independently and carrying document IDs in the metadata so queries can retrieve only the relevant document or set of documents.

### Hybrid Search
**Answer:** Hybrid search combines vector search with keyword search. It is useful when exact terms matter, especially for names, IDs, dates, or specific technical phrases.

---

## LEVEL 9 — GEMINI QUESTIONS

### Why Gemini?
**Answer:** Gemini is a good fit because it offers strong language capabilities, large context support, and good integration for document understanding and generation tasks.

**Follow-up:** Cost  
**Answer:** Gemini is competitive, especially for projects that want strong language capabilities without a large initial cost.

**Follow-up:** Context size  
**Answer:** Context size is large enough for many document workflows, which makes it suitable for summarization and question answering.

**Follow-up:** Latency  
**Answer:** Latency is reasonable for interactive chat and summarization features when the system is optimized.

### Why Flash 3.1 Lite?
**Answer:** Flash 3.1 Lite is a good choice when low latency and lower cost matter more than maximum reasoning depth. It is suitable for many document assistant tasks.

### Temperature
**Answer:** Temperature controls randomness. Lower values produce more deterministic answers, which is useful for factual retrieval tasks.

### Top P
**Answer:** Top P controls the diversity of sampled tokens by limiting the cumulative probability mass.

### Top K
**Answer:** Top K limits the vocabulary choices to the top K most likely next tokens.

### Safety Settings
**Answer:** Safety settings help prevent sensitive or disallowed content from being generated, especially in user-facing chat experiences.

### Token Limits
**Answer:** Token limits define how much text can be sent to and generated by the model. They must be considered when building RAG workflows.

### Streaming Responses
**Answer:** Streaming responses improve perceived performance because the user can see the answer unfold as it is generated.

**Follow-up:** Did you implement?  
**Answer:** Yes, streaming is a good experience for chat interfaces.

**Follow-up:** SSE?  
**Answer:** Server-Sent Events are a simple way to stream answer chunks to the frontend.

**Follow-up:** WebSockets?  
**Answer:** WebSockets could also work, but SSE is often simpler for one-way streaming from the server to the client.

---

## LEVEL 10 — FILE PROCESSING

### PDF Extraction
**Answer:** PDF extraction is done using libraries that can read text and structure from uploaded documents. The quality depends on whether the PDF is text-based or scanned.

**Follow-up:** Which library?  
**Answer:** The project uses a PDF processing stack that supports text extraction and document handling for the required workflows.

### OCR PDFs
**Answer:** OCR is needed for scanned or image-based PDFs. Without OCR, the text may not be extractable accurately.

**Follow-up:** Scanned PDFs?  
**Answer:** Yes, scanned PDFs would require OCR to be processed meaningfully.

**Follow-up:** Image PDFs?  
**Answer:** Image PDFs are also better handled with OCR if the text needs to be searchable and retrievable.

### Corrupted PDF handling?
**Answer:** The system should catch parsing errors and return a clear error message rather than crash.

### Large PDFs?
**Answer:** Large PDFs need careful memory management, chunking, and possibly asynchronous processing to avoid timeouts or resource exhaustion.

**Follow-up:** 100 MB file?  
**Answer:** It can be processed with careful streaming and chunking, but it may require more resources and time.

**Follow-up:** 1000 page file?  
**Answer:** A 1000-page file would need efficient extraction and chunking to remain practical.

### Parallel Processing?
**Answer:** For very large or many-document workloads, parallel processing or task queues can improve throughput.

---

## LEVEL 11 — AWS QUESTIONS

### Why EC2?
**Answer:** EC2 is a flexible compute option for hosting the backend and services without needing to manage the full infrastructure stack manually.

### Why not Lambda?
**Answer:** Lambda is great for event-driven workloads, but EC2 is more appropriate when the app needs long-running processes, custom runtime behavior, or greater control.

### Why S3?
**Answer:** S3 is ideal for storing uploaded files because it is durable, scalable, and optimized for object storage.

### S3 Storage Classes
**Answer:** Storage classes can be chosen based on access frequency and cost requirements, such as Standard, Intelligent-Tiering, or Glacier for archival data.

### Pre-signed URLs
**Answer:** Pre-signed URLs allow temporary, secure file access without exposing permanent credentials. They are useful for uploads and downloads.

### IAM Roles
**Answer:** IAM roles allow services to access AWS resources securely without hardcoding credentials.

### Security Groups
**Answer:** Security groups act as virtual firewalls for EC2 instances and control inbound and outbound traffic.

### Load Balancer
**Answer:** A load balancer distributes traffic across multiple instances and improves availability and resilience.

### Auto Scaling
**Answer:** Auto Scaling adjusts the number of instances based on demand, which helps handle traffic spikes.

---

## LEVEL 12 — DOCKER QUESTIONS

### What is Docker?
**Answer:** Docker packages applications and their dependencies into containers so they run consistently across environments.

### Container vs VM
**Answer:** Containers share the host OS kernel and are lighter than virtual machines, which makes them faster and more efficient.

### Docker Layers
**Answer:** Docker images are built from layers, and each layer represents a change to the filesystem. Layers make builds cacheable and efficient.

### Multi-stage Build
**Answer:** Multi-stage builds separate build dependencies from runtime dependencies, producing smaller and more secure images.

### COPY vs ADD
**Answer:** COPY is simpler and preferred for ordinary file copying. ADD is more powerful and can also extract archives or fetch remote URLs.

### CMD vs ENTRYPOINT
**Answer:** CMD provides a default command, while ENTRYPOINT defines the executable that should always run.

### Volumes
**Answer:** Volumes persist data outside the container filesystem and are useful for databases or uploaded files.

### Networking
**Answer:** Docker networking allows containers to communicate with each other and with the host using bridges or custom networks.

### Bridge Network
**Answer:** A bridge network is Docker’s default private network for containers on the same host.

### Image Optimization
**Answer:** Image optimization includes minimizing layer count, reducing image size, and removing unnecessary packages.

---

## LEVEL 13 — GITHUB ACTIONS

### Explain workflow.
**Answer:** A GitHub Actions workflow automates build, test, and deployment steps in response to events such as pushes or pull requests.

### What triggers deployment?
**Answer:** Deployment can be triggered by pushes to main, pull request merges, or manual workflow dispatch.

### Secrets handling?
**Answer:** Secrets should be stored securely in GitHub Secrets and injected at runtime rather than hardcoded into the repository.

### Rollback?
**Answer:** Rollback can be implemented by redeploying the previous working image or release version.

### Self hosted runner vs GitHub runner?
**Answer:** GitHub-hosted runners are easier to use, while self-hosted runners provide more control and can be better for private networking or specialized environments.

---

## LEVEL 14 — SYSTEM DESIGN QUESTIONS

### Design Page Forge for 1M users.
**Answer:** I would separate stateless application services, use managed PostgreSQL, object storage, a queue for background jobs, caching for hot reads, autoscaling for compute, and a robust monitoring stack. Embeddings would be stored in a scalable vector index, and the AI layer would be rate-limited and sharded as needed.

### How scale embeddings?
**Answer:** By storing them in a scalable vector database or a managed index, using partitioning and approximate search, and keeping only the necessary metadata with each embedding.

### How scale storage?
**Answer:** By using object storage like S3, lifecycle policies, and regional replication if needed.

### How cache retrieval?
**Answer:** Cache frequently asked queries, popular document metadata, and repeated retrieval results using Redis or a similar cache layer.

### How reduce AI cost?
**Answer:** By caching repeated prompts, reducing unnecessary retrieval, using smaller models for simple tasks, and batching requests when possible.

### How handle traffic spikes?
**Answer:** Use autoscaling, rate limiting, queue-based background jobs, and load balancing across application instances.

### Multi-region deployment?
**Answer:** Multi-region deployment helps with availability and latency but adds complexity around replication, data consistency, and failover.

---

## LEVEL 15 — FAILURE SCENARIOS

### S3 goes down.
**Answer:** The app should degrade gracefully, show a clear error, and avoid data loss. Uploads and downloads would fail until S3 is healthy again.

### Gemini API rate limit.
**Answer:** The system should queue or retry requests with backoff, show a user-friendly message, and avoid blocking unrelated features.

### pgvector corrupted.
**Answer:** The app should detect the issue, restore the index from source data if possible, and alert operators. Losing the vector index would reduce retrieval quality until rebuilt.

### EC2 dies.
**Answer:** The deployment should be designed with redundant instances, a load balancer, and a recovery or restart strategy so service resumes quickly.

### GitHub Actions fails.
**Answer:** The deployment should be blocked safely, and previous stable deployments should remain available until the issue is fixed.

### Database connection exhausted.
**Answer:** The app should fail fast, return a controlled error, and use connection pooling and retry strategies to reduce impact.

---

## LEVEL 16 — TRADEOFF QUESTIONS

### Why PostgreSQL over MongoDB?
**Answer:** PostgreSQL is better when relational data, integrity, and SQL workflows are important.

### Why Node over Go?
**Answer:** Node is a better fit for faster development and shared JavaScript skills in this project.

### Why EC2 over ECS?
**Answer:** EC2 gives more control and simplicity for a smaller, self-managed deployment.

### Why Docker over PM2?
**Answer:** Docker gives consistent packaging and environment isolation, which is better for portability and deployment reliability.

### Why JWT over sessions?
**Answer:** JWT is attractive for stateless APIs and mobile or cross-service scenarios, though sessions can be simpler in some apps.

### Why pgvector over Pinecone?
**Answer:** pgvector reduces operational overhead and fits naturally into an existing PostgreSQL setup.

### Why Gemini over OpenAI?
**Answer:** Gemini was chosen for its model capabilities and ecosystem fit for this product, though OpenAI is also a strong option.

### Why REST over GraphQL?
**Answer:** REST is simpler and easier to reason about for this project’s needs.

---

## LEVEL 17 — CROSS QUESTIONS

### You say: We used pgvector.
**Interviewer:** What indexing method?  
**Answer:** I would use HNSW or IVFFlat depending on the tradeoff between recall, speed, memory, and build time.

**Interviewer:** Why?  
**Answer:** Because the choice affects search quality and latency significantly.

**Interviewer:** How many vectors?  
**Answer:** The number of vectors grows with the amount of indexed document content, so it must be designed for scale from the start.

**Interviewer:** Recall?  
**Answer:** Recall should remain high enough that the retrieved context is relevant to the user query.

**Interviewer:** Build time?  
**Answer:** Build time must be acceptable for indexing large document collections.

**Interviewer:** Memory overhead?  
**Answer:** Memory overhead matters because vector indexes can become expensive at scale.

### You say: We used Docker.
**Interviewer:** Explain image layers.  
**Answer:** Docker images are built from immutable layers, and each layer represents one filesystem change.

**Interviewer:** What is overlay filesystem?  
**Answer:** Overlay filesystem is the union filesystem mechanism Docker uses to combine layers into a single view.

**Interviewer:** Why are layers immutable?  
**Answer:** Immutable layers make builds cacheable, repeatable, and easier to reason about.

### You say: We used JWT.
**Interviewer:** How revoke token?  
**Answer:** Stateless JWTs are harder to revoke; a blacklist, short expiration, or refresh-token rotation strategy is usually required.

**Interviewer:** How logout works if JWT is stateless?  
**Answer:** Logout usually clears the cookie and invalidates the refresh token or token version if the system uses one.

### You say: We used RAG.
**Interviewer:** Why not fine-tuning?  
**Answer:** Fine-tuning is better when the model needs to learn a very specific behavior consistently across many requests. RAG is better when the knowledge changes often and should stay grounded in your documents.

**Interviewer:** When is fine-tuning better?  
**Answer:** Fine-tuning is better for tone, style, structured outputs, or domain-specific reasoning that is consistent across all prompts.

### You say: We used S3.
**Interviewer:** Why object storage?  
**Answer:** Object storage is ideal for large, immutable files like PDFs because it is cheap, scalable, and easy to access over HTTP.

**Interviewer:** Difference from block storage?  
**Answer:** Block storage is used for attached disks and databases, while object storage is optimized for files and content distribution.
