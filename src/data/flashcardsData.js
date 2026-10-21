export const FLASHCARDS_DATA = [
  // --- SYSTEM DESIGN ---
  {
    id: 'fc-1',
    category: 'System Design',
    difficulty: 'Advanced',
    question: 'What is the CAP Theorem and how does the PACELC Theorem expand upon it?',
    answer: 'CAP states that in any asynchronous network subject to partitions, a distributed system can only guarantee 2 of Consistency, Availability, and Partition Tolerance. PACELC expands on this: If there is a Partition (P), trade off Availability (A) vs Consistency (C); Else (E), when the system is running normally, trade off Latency (L) vs Consistency (C).',
    keyTakeaways: [
      'CAP applies during network partitions.',
      'PACELC addresses normal operation latency trade-offs.'
    ]
  },
  {
    id: 'fc-2',
    category: 'System Design',
    difficulty: 'Intermediate',
    question: 'What are the main Caching Invalidation Strategies (Cache-Aside, Write-Through, Write-Behind)?',
    answer: '1. Cache-Aside: Application looks in cache first; on miss, reads DB and writes to cache. 2. Write-Through: Data is written into cache and DB simultaneously (higher write latency, strong consistency). 3. Write-Behind (Write-Back): Data is written only to cache first, then asynchronously flushed in batches to DB (fastest writes, risk of data loss on cache crash).',
    keyTakeaways: [
      'Cache-Aside is the most popular general pattern.',
      'Write-Through prioritizes consistency; Write-Behind prioritizes write throughput.'
    ]
  },
  {
    id: 'fc-3',
    category: 'System Design',
    difficulty: 'Advanced',
    question: 'How does Consistent Hashing solve the Rehashing Problem in distributed caches?',
    answer: 'Traditional hashing (hash(key) % N) requires remapping almost every single key whenever a server node is added or removed. Consistent Hashing maps both servers and data keys to positions on a 360° virtual ring. Adding or removing a server only relocates k/N keys (where k is total keys and N is server count). Virtual nodes prevent hotspots.',
    keyTakeaways: [
      'Minimizes cache misses during node scaling.',
      'Virtual nodes ensure uniform load distribution across heterogeneous servers.'
    ]
  },
  {
    id: 'fc-4',
    category: 'System Design',
    difficulty: 'Intermediate',
    question: 'What is Database Sharding (Horizontal Partitioning) vs Replication?',
    answer: 'Replication copies the exact same database to multiple nodes to scale read throughput and provide high availability failover. Sharding splits a huge dataset horizontally across multiple database nodes by a Shard Key (e.g., user_id) so that each node holds a distinct subset of data, scaling both storage volume and write throughput.',
    keyTakeaways: [
      'Replication scales reads and fault tolerance.',
      'Sharding scales write throughput and multi-terabyte data capacity.'
    ]
  },

  // --- FRONTEND & WEB ---
  {
    id: 'fc-5',
    category: 'Frontend & Web',
    difficulty: 'Intermediate',
    question: 'What is the Virtual DOM and how does React reconciliation algorithm work?',
    answer: 'Virtual DOM is a lightweight JavaScript representation of real DOM nodes stored in memory. React uses a diffing heuristic (O(n) complexity) comparing element types and unique key props to batch DOM updates efficiently with minimal expensive browser reflows and repaints.',
    keyTakeaways: [
      'Avoids slow direct DOM mutations.',
      'React Fiber reconciliation prioritizes and pauses render work.'
    ]
  },
  {
    id: 'fc-6',
    category: 'Frontend & Web',
    difficulty: 'Beginner',
    question: 'What is a JavaScript Closure and where is it practically used in modern web apps?',
    answer: 'A closure is the combination of a function bundled together with references to its surrounding lexical scope. Even after the outer function has finished executing, the inner function retains access to outer variables. Practical uses include: data privacy/encapsulation, React hook states (useState), currying, and memoization caches.',
    keyTakeaways: [
      'Functions remember their lexical lexical scope where they were declared.',
      'Fundamental to React hooks and function factories.'
    ]
  },
  {
    id: 'fc-7',
    category: 'Frontend & Web',
    difficulty: 'Beginner',
    question: 'What is Event Delegation in the browser DOM and why is it beneficial?',
    answer: 'Event Delegation is a technique where you attach a single event listener to a parent container instead of attaching listeners to every individual child element. It relies on Event Bubbling (events propagate up from target to ancestors). It saves memory and automatically handles dynamically inserted child elements.',
    keyTakeaways: [
      'Reduces browser memory allocation dramatically.',
      'Seamlessly supports dynamic list items.'
    ]
  },
  {
    id: 'fc-8',
    category: 'Frontend & Web',
    difficulty: 'Advanced',
    question: 'What is the difference between SSR (Server-Side Rendering), SSG, and CSR?',
    answer: 'CSR (Client-Side Rendering) sends an empty HTML shell; JavaScript builds the UI in the browser (fast navigation, poor initial SEO). SSR (Server-Side Rendering) renders full HTML on the server on each request (great SEO, dynamic data, server load). SSG (Static Site Generation) pre-builds HTML files at build time (fastest CDN TTFB, best for blogs/docs).',
    keyTakeaways: [
      'CSR: Rich interactivity post-load.',
      'SSR: Dynamic real-time SEO.',
      'SSG: Maximum speed via CDN edge caching.'
    ]
  },

  // --- BACKEND & DATABASES ---
  {
    id: 'fc-9',
    category: 'Backend & Databases',
    difficulty: 'Intermediate',
    question: 'What are the ACID Properties in Relational Databases?',
    answer: '1. Atomicity: All operations in a transaction succeed, or all rollback ("all or nothing"). 2. Consistency: Database transitions only between valid states satisfying constraints. 3. Isolation: Concurrent transactions do not interfere with each other (isolation levels: Read Committed, Serializable). 4. Durability: Once committed, changes survive power outages or crashes.',
    keyTakeaways: [
      'Guarantees reliability and financial transaction safety.',
      'Contrast with BASE (Basically Available, Soft-state, Eventual consistency) in NoSQL.'
    ]
  },
  {
    id: 'fc-10',
    category: 'Backend & Databases',
    difficulty: 'Intermediate',
    question: 'What is the difference between B-Tree Index vs Hash Index in databases?',
    answer: 'B-Tree indexes maintain a balanced, self-sorting tree supporting equality (=), range queries (<, >, BETWEEN), and sorting (ORDER BY) in O(log N) time. Hash indexes use a hash map providing O(1) average lookup for exact equality (=) but cannot perform range scans or prefix lookups.',
    keyTakeaways: [
      'B-Tree is the default index type in PostgreSQL, MySQL, and MongoDB.',
      'Hash indexes are strictly for exact match equality.'
    ]
  },
  {
    id: 'fc-11',
    category: 'Backend & Databases',
    difficulty: 'Intermediate',
    question: 'What is the difference between REST and GraphQL APIs?',
    answer: 'REST exposes fixed resource endpoints (e.g. GET /users/1) returning fixed payloads, which often leads to over-fetching or under-fetching (requiring N+1 API calls). GraphQL exposes a single endpoint allowing clients to query exact fields needed in one round-trip, powered by a strongly-typed schema.',
    keyTakeaways: [
      'GraphQL eliminates over-fetching and multiple network round-trips.',
      'REST has simpler HTTP caching and straightforward rate limiting.'
    ]
  },
  {
    id: 'fc-12',
    category: 'Backend & Databases',
    difficulty: 'Advanced',
    question: 'What is Database Connection Pooling and why is it critical under high traffic?',
    answer: 'Establishing a new TCP and TLS database connection for every single HTTP request is computationally expensive (hundreds of ms). A connection pool maintains a set of pre-warmed, reusable connections. Requests borrow a connection from the pool, execute the query, and return it to the pool, preventing database thread exhaustion and spikes.',
    keyTakeaways: [
      'Prevents DB crashes from connection limits (e.g. max_connections).',
      'Cuts query latency from ~200ms to <5ms.'
    ]
  },

  // --- CORE CS & FRESHER FUNDAMENTALS ---
  {
    id: 'fc-13',
    category: 'Core CS & Fresher',
    difficulty: 'Beginner',
    question: 'What is the difference between a Process and a Thread in Operating Systems?',
    answer: 'A Process is an independent executing program with its own isolated memory space (heap, stack, code, file descriptors). A Thread is the smallest unit of CPU execution within a process; multiple threads in the same process share the same memory heap and address space, enabling fast communication but requiring mutex/synchronization to prevent race conditions.',
    keyTakeaways: [
      'Processes have separate memory addresses; crash of one does not kill others.',
      'Threads are lightweight and share process memory.'
    ]
  },
  {
    id: 'fc-14',
    category: 'Core CS & Fresher',
    difficulty: 'Beginner',
    question: 'What is the difference between Stack Memory and Heap Memory?',
    answer: 'Stack Memory is used for static memory allocation, local primitive variables, and function call frames (LIFO order). It is extremely fast and automatically managed by the CPU architecture. Heap Memory is used for dynamic memory allocation (objects, arrays, dynamic data) that outlive a function call. It is managed via manual memory free or automatic Garbage Collection.',
    keyTakeaways: [
      'Stack: Fast, fixed-size, auto-cleared on function exit.',
      'Heap: Flexible, larger, prone to memory leaks if uncollected.'
    ]
  },
  {
    id: 'fc-15',
    category: 'Core CS & Fresher',
    difficulty: 'Beginner',
    question: 'What is Big-O Notation and what are the time complexities of common sorting algorithms?',
    answer: 'Big-O notation describes the upper bound limiting behavior of an algorithm as input size (N) grows towards infinity: 1. Quicksort: O(N log N) average, O(N^2) worst case. 2. Mergesort: O(N log N) guaranteed in all cases (requires O(N) extra space). 3. Heapsort: O(N log N) in-place. 4. Bubble/Insertion Sort: O(N^2) worst case.',
    keyTakeaways: [
      'O(1) < O(log N) < O(N) < O(N log N) < O(N^2) < O(2^N).',
      'Mergesort guarantees O(N log N) for stable sorting.'
    ]
  },
  {
    id: 'fc-16',
    category: 'Core CS & Fresher',
    difficulty: 'Beginner',
    question: 'What is the difference between Synchronous and Asynchronous execution?',
    answer: 'In Synchronous execution, tasks are executed sequentially line-by-line; each instruction must finish before the next one starts, blocking execution during slow operations (like file reads or network calls). In Asynchronous execution, long-running tasks are started in the background (using callbacks, promises, or async/await), freeing the execution thread to process other tasks.',
    keyTakeaways: [
      'Synchronous code blocks the execution thread.',
      'Asynchronous code keeps applications responsive under I/O latency.'
    ]
  },

  // --- BEHAVIORAL & STRATEGY ---
  {
    id: 'fc-17',
    category: 'Behavioral Strategy',
    difficulty: 'Beginner',
    question: 'What is the STAR Method for behavioral interview questions?',
    answer: 'STAR stands for: 1. Situation: Set the context, company, and timeline. 2. Task: Explain the specific challenge, problem, or objective. 3. Action: Detail the exact actions YOU personally took, tools used, and obstacles overcome. 4. Result: Conclude with quantified achievements (%, revenue, speedup) and key takeaways.',
    keyTakeaways: [
      'Structure every behavioral answer using STAR.',
      'Focus 60% of your time on the Action and Result.'
    ]
  },
  {
    id: 'fc-18',
    category: 'Behavioral Strategy',
    difficulty: 'Intermediate',
    question: 'How should you answer: "What is your greatest weakness?" in an interview?',
    answer: 'Pick a genuine, non-fatal technical or process skill (not "I am a perfectionist"). Explain the context, acknowledge the learning opportunity, and immediately detail the proactive steps you are currently taking to improve (courses, mentoring, tooling) along with positive measurable progress.',
    keyTakeaways: [
      'Never choose a fake weakness or a core fatal competency for the role.',
      'Highlight self-awareness and active remediation.'
    ]
  },
  {
    id: 'fc-19',
    category: 'Behavioral Strategy',
    difficulty: 'Intermediate',
    question: 'What is the RICE Prioritization Framework in Product Management?',
    answer: 'RICE is a scoring model to quantitatively prioritize projects: Score = (Reach × Impact × Confidence) / Effort. Reach: number of users impacted per quarter. Impact: score 0.25 to 3. Confidence: percentage certainty (50% to 100%). Effort: person-months required. Projects with highest RICE score get prioritized first.',
    keyTakeaways: [
      'Prevents bias and emotional decision-making in roadmaps.',
      'Quantifies return on engineering investment.'
    ]
  },
  {
    id: 'fc-20',
    category: 'Behavioral Strategy',
    difficulty: 'Intermediate',
    question: 'How do you handle ambiguous requirements when starting a new engineering feature?',
    answer: '1. Ask clarifying questions to determine user personas and business goals. 2. Identify constraints (latency, throughput, deadlines). 3. Document explicit assumptions in a Technical Design Document (RFC). 4. Create wireframes/PoC prototypes to validate assumptions early with stakeholders. 5. Break the scope into iterative milestones.',
    keyTakeaways: [
      'Turn ambiguity into documented assumptions.',
      'Validate fast with prototypes before writing production code.'
    ]
  }
];
