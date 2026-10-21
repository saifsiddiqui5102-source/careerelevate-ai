export const QUESTION_BANK = [
  // --- SOFTWARE ENGINEERING & FULL STACK ---
  {
    id: 'q-sw-1',
    role: 'Software Engineering',
    category: 'System Design',
    difficulty: 'Senior',
    topic: 'Distributed Systems & Scaling',
    question: 'How would you design a high-throughput, low-latency URL Shortener service (like bit.ly) handling 100M daily active users?',
    hints: [
      'Discuss hashing algorithms (Base62 vs MD5/SHA256 truncation).',
      'Address database storage selection (NoSQL like Cassandra vs Relational PostgreSQL).',
      'Describe caching strategy (Redis/Memcached) for read-heavy traffic (99:1 read-to-write ratio).',
      'Explain rate limiting and key generation service (KGS) to avoid hash collisions.'
    ],
    starGuide: {
      situation: 'Clarify scale: 100M daily active users translates to ~1.1k writes/sec and 110k reads/sec with a 100:1 read-to-write ratio.',
      task: 'Design key generation, low-latency redirection, caching tier, and scalable data persistence.',
      action: 'Implement a dedicated pre-generated Base62 Key Generation Service, distributed Redis cache, and sharded MongoDB/NoSQL cluster.',
      result: 'Guarantees under 10ms redirect latency globally with 99.99% uptime and zero hash collision overhead.'
    },
    sampleAnswer: `When designing a URL Shortener for 100 million DAUs:

1. **Requirements & Scale**:
   - Write capacity: 100M URLs/day ≈ 1,160 writes/sec.
   - Read capacity: 100:1 ratio ≈ 116,000 reads/sec.
   - Storage: 100M * 500 bytes = 50GB/day. 10-year storage ≈ 180TB.

2. **Key Generation Service (KGS)**:
   - To avoid real-time hashing collisions and latency, use a dedicated Key Generation Service that pre-generates 7-character Base62 strings (62^7 = 3.5 Trillion unique URLs).
   - Maintain two tables in KGS: 'Unused Keys' and 'Used Keys'.

3. **Data Storage & Caching**:
   - Use MongoDB or DynamoDB for schema-less, distributed storage with primary key 'shortKey'.
   - Deploy a Redis Caching layer storing top 20% most requested URLs (80/20 rule), reducing DB load by 80%+ and serving requests in under 10ms.

4. **High Availability**:
   - Deploy behind AWS ALB with Auto Scaling EC2/ECS instances. Use Cloudflare CDN for edge caching and DDoS mitigation.`,
    fresherFriendly: false
  },
  {
    id: 'q-sw-2',
    role: 'Software Engineering',
    category: 'Behavioral (STAR)',
    difficulty: 'Intermediate',
    topic: 'Conflict Resolution & Technical Disagreement',
    question: 'Describe a situation where you had a major technical disagreement with a Senior Architect or Product Manager. How did you handle it?',
    hints: [
      'Focus on data and benchmarks rather than personal opinions.',
      'Show active listening and empathy for business constraints.',
      'Explain the compromise or escalation path that resulted in project success.'
    ],
    starGuide: {
      situation: 'Set up a specific context (e.g. choosing DB technology or microservices vs monolith for a tight deadline).',
      task: 'Clarify what the disagreement was and why it mattered to the product or engineering quality.',
      action: 'Detail how you ran a quick proof-of-concept (PoC) or gathered benchmark data to present objectively.',
      result: 'Explain the outcome, what you learned, and how it strengthened team trust.'
    },
    sampleAnswer: `**Situation**: At my previous company, our Lead Architect proposed rewriting our core authentication module using a new custom OAuth server framework, right as we were 3 weeks away from a major enterprise client launch.

**Task**: I was concerned that introducing an unproven custom auth service right before launch carried immense security risks and would delay the deadline by over a month.

**Action**: Rather than simply rejecting the idea in a group meeting, I scheduled a 1-on-1 with the Lead Architect. I brought concrete benchmark data and security audit reports demonstrating that integrating Auth0/Okta standard SDKs would meet 95% of our requirements immediately with zero security overhead. I also proposed building a prototype of his custom architecture during our upcoming innovation sprint after the enterprise launch.

**Result**: He appreciated that I validated his long-term architectural vision while protecting the immediate business deadline. We launched on time with Auth0, secured the enterprise customer, and later evaluated custom auth systematically.`,
    fresherFriendly: true
  },
  {
    id: 'q-sw-3',
    role: 'Software Engineering',
    category: 'Technical',
    difficulty: 'Intermediate',
    topic: 'API Design & Microservices',
    question: 'How do you design a resilient microservices architecture that prevents cascading failures during downstream service outages?',
    hints: [
      'Mention Circuit Breaker pattern (Netflix Hystrix / Resilience4j).',
      'Discuss Dead Letter Queues (DLQ) and asynchronous message brokers (Kafka/RabbitMQ).',
      'Explain exponential backoff with jitter and graceful degradation/fallbacks.'
    ],
    starGuide: {
      situation: 'Downstream payment gateway or analytics service experiencing high latency and 500 errors.',
      task: 'Prevent upstream thread pool exhaustion and protect user experience.',
      action: 'Implemented Circuit Breaker with 3 states (Closed, Open, Half-Open), fallback cache responses, and asynchronous event streaming.',
      result: 'Maintained 99.95% system uptime despite a 45-minute downstream provider outage.'
    },
    sampleAnswer: `To prevent cascading failures in microservices:
1. **Circuit Breaker Pattern**: Wrap remote calls in a circuit breaker. If the failure rate exceeds 50% over a 10-second rolling window, open the circuit and return an immediate cached fallback without calling the struggling downstream service.
2. **Timeouts & Exponential Backoff with Jitter**: Enforce strict HTTP/gRPC request timeouts (e.g. 800ms) with retries using randomized exponential jitter to prevent the "thundering herd" problem.
3. **Asynchronous Decoupling**: Offload non-critical side effects (email notifications, audit logs, analytics) to an Apache Kafka or RabbitMQ message broker with Dead Letter Queues (DLQs).
4. **Bulkhead Pattern**: Isolate thread pools and CPU/memory resources so a slow service cannot starve memory from other critical flows.`,
    fresherFriendly: false
  },

  // --- FRONTEND DEVELOPER ---
  {
    id: 'q-fe-1',
    role: 'Frontend Developer',
    category: 'Technical',
    difficulty: 'Intermediate',
    topic: 'React Performance & Fiber Architecture',
    question: 'How does React Virtual DOM diffing work, and how do you diagnose and eliminate unnecessary component re-renders in a large web app?',
    hints: [
      'Explain React Fiber reconciliation (O(n) heuristic, keys, component types).',
      'Distinguish between React.memo, useMemo, and useCallback.',
      'Mention state localization and avoiding unnecessary object references in context.'
    ],
    starGuide: {
      situation: 'A large dashboard with 50+ data widgets experiencing noticeable input lag (>200ms) during typing.',
      task: 'Isolate root re-rendering culprits and optimize rendering performance to 60fps.',
      action: 'Profiled with React DevTools Profiler, localized input state into child leaf nodes, wrapped callbacks with useCallback, and split heavy contexts.',
      result: 'Reduced render times from 210ms to under 16ms across all dashboard widgets.'
    },
    sampleAnswer: `1. **Virtual DOM Diffing & Reconciliation**:
   - React constructs a virtual tree in memory. During state updates, React Fiber reconciles the new tree against the old tree using an O(n) heuristic:
     - If two elements have different types (e.g. <div> to <span>), React unmounts the old tree entirely.
     - For children lists, React uses the unique 'key' prop to track moves, insertions, and deletions without re-rendering matching items.

2. **Diagnosing Unnecessary Renders**:
   - Open React DevTools Profiler, check "Highlight updates when components render", and inspect which components rendered and why (e.g., "Props changed: onClick").

3. **Elimination Techniques**:
   - **State Localization**: Move state as close as possible to the component that actually needs it (e.g., form input state inside the input component rather than global page state).
   - **Memoization**: Wrap heavy pure leaf components in 'React.memo' with stable prop references ('useCallback' for handlers, 'useMemo' for expensive computed filters).
   - **Context Splitting**: Separate frequently changing state from stable dispatch functions to prevent whole-tree consumer re-renders.`,
    fresherFriendly: false
  },
  {
    id: 'q-fe-2',
    role: 'Frontend Developer',
    category: 'Technical',
    difficulty: 'Senior',
    topic: 'Web Vitals & Performance Optimization',
    question: 'How do you optimize Core Web Vitals (LCP, FID/INP, and CLS) for a high-traffic e-commerce landing page?',
    hints: [
      'LCP: Preload critical hero images, server-side rendering, CDN edge delivery.',
      'INP/FID: Break up long JavaScript tasks (>50ms), debounce, defer third-party scripts.',
      'CLS: Set explicit width/height on images and reserve space for dynamic ads/banners.'
    ],
    starGuide: {
      situation: 'E-commerce product page failing Google Core Web Vitals assessment with LCP > 4.2s and CLS > 0.25.',
      task: 'Achieve "Good" thresholds: LCP < 2.5s, INP < 200ms, and CLS < 0.1.',
      action: 'Preloaded hero webp images with priority=high, set explicit aspect ratios on containers, and code-split non-essential JS with dynamic import().',
      result: 'LCP improved to 1.8s, CLS dropped to 0.02, leading to a +14% lift in organic search traffic.'
    },
    sampleAnswer: `To optimize Core Web Vitals:
1. **Largest Contentful Paint (LCP < 2.5s)**:
   - Preload the above-the-fold hero image using '<link rel="preload" as="image" fetchpriority="high">'.
   - Use modern image formats (AVIF/WebP) sized responsively with 'srcset'.
   - Enable Edge SSR (Server-Side Rendering) or SSG via Next.js/Vite with Brotli compression and CDN caching.

2. **Interaction to Next Paint (INP < 200ms)**:
   - Identify JavaScript tasks exceeding 50ms using Chrome DevTools Performance panel.
   - Break long tasks using 'scheduler.yield()' or 'setTimeout(..., 0)' to allow browser paint frames.
   - Defer third-party tracking scripts (GTM, Hotjar) using 'defer' or 'async'.

3. **Cumulative Layout Shift (CLS < 0.1)**:
   - Always specify explicit 'width' and 'height' or CSS 'aspect-ratio' on all <img>, <video>, and iframe tags.
   - Reserve container slots with min-height for dynamically loaded ads, cookie banners, and skeleton loaders.`,
    fresherFriendly: false
  },
  {
    id: 'q-fe-3',
    role: 'Frontend Developer',
    category: 'Coding & Algorithms',
    difficulty: 'Intermediate',
    topic: 'JavaScript Utilities & DOM',
    question: 'Implement a debounce function in JavaScript with immediate execution support (leading/trailing options). When should debounce be used vs throttle?',
    hints: [
      'Debounce delays function execution until N ms have passed since the last event.',
      'Throttle guarantees execution at most once every N ms.',
      'Use debounce for search autocomplete inputs and window resize; throttle for scroll listeners.'
    ],
    starGuide: {
      situation: 'Search input triggering expensive backend autocomplete API calls on every single keystroke.',
      task: 'Create a reusable debounce utility that minimizes API load without delaying the user experience.',
      action: 'Implemented timer-based debounce with clear cleanup and leading edge trigger support.',
      result: 'Cut backend search requests by 82% while maintaining responsive search suggestions.'
    },
    sampleAnswer: `\`\`\`javascript
function debounce(func, wait, immediate = false) {
  let timeout;
  return function executedFunction(...args) {
    const context = this;
    const callNow = immediate && !timeout;
    
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      timeout = null;
      if (!immediate) func.apply(context, args);
    }, wait);
    
    if (callNow) func.apply(context, args);
  };
}
\`\`\`

**Debounce vs Throttle**:
- **Debounce**: Delays execution until a pause in events occurs. Best for: Search bar autocomplete inputs, window resize layout recalculations, auto-saving form drafts.
- **Throttle**: Ensures the function executes at regular fixed intervals (e.g. once every 100ms) regardless of how many times the event fires. Best for: Infinite scroll pagination, mousemove canvas tracking, video playback progress tracking.`,
    fresherFriendly: true
  },

  // --- BACKEND DEVELOPER ---
  {
    id: 'q-be-1',
    role: 'Backend Developer',
    category: 'Technical',
    difficulty: 'Intermediate',
    topic: 'Node.js Internals & Concurrency',
    question: 'Explain the Node.js Event Loop phases, how Libuv manages asynchronous I/O, and what happens when the main thread gets blocked.',
    hints: [
      'Event loop phases: Timers -> Pending callbacks -> Idle/prepare -> Poll -> Check (setImmediate) -> Close callbacks.',
      'Libuv thread pool default size is 4 (handles fs, crypto, zlib, dns).',
      'Blocking the main thread stops all incoming HTTP requests.'
    ],
    starGuide: {
      situation: 'CPU-intensive JSON encryption blocking HTTP endpoints in an Express production service.',
      task: 'Understand event loop blocking and offload heavy computation away from the single main thread.',
      action: 'Offloaded heavy crypto and data compression into Worker Threads and utilized asynchronous non-blocking stream APIs.',
      result: 'P99 API response latency dropped from 3400ms to 45ms under concurrent load.'
    },
    sampleAnswer: `1. **Event Loop Phases**:
   - **Timers**: Executes callbacks scheduled by 'setTimeout()' and 'setInterval()'.
   - **Pending Callbacks**: Executes I/O callbacks deferred to the next loop iteration (e.g. network socket errors).
   - **Idle, Prepare**: Used internally by Node.js.
   - **Poll**: Retrieves new I/O events, executes I/O related callbacks. If queue is empty, waits for incoming events or progresses to Check phase.
   - **Check**: Executes 'setImmediate()' callbacks.
   - **Close Callbacks**: Handles socket/handle closures (e.g. 'socket.on("close", ...)').

2. **Libuv Thread Pool**:
   - While JavaScript is single-threaded, Libuv maintains a background thread pool (default 4 threads, configurable via 'UV_THREADPOOL_SIZE') for blocking OS operations: File system ('fs'), cryptography ('crypto'), compression ('zlib'), and DNS lookups.

3. **Blocking Main Thread**:
   - Long-running sync loops (e.g. regex catastrophic backtracking or large JSON parsing) freeze the entire event loop. No new HTTP requests can be accepted. Solution: Offload CPU tasks to Node.js 'worker_threads' or dedicated microservices.`,
    fresherFriendly: false
  },
  {
    id: 'q-be-2',
    role: 'Backend Developer',
    category: 'Technical',
    difficulty: 'Senior',
    topic: 'Database Optimization & SQL vs NoSQL',
    question: 'How do you analyze and optimize a slow PostgreSQL query in production, and how do B-Tree indexes impact read vs write performance?',
    hints: [
      'Use EXPLAIN (ANALYZE, BUFFERS) to detect Sequential Scans vs Index Scans.',
      'Check for missing indexes, bloated indexes, and N+1 query patterns.',
      'Understand write amplification: every new index slows down INSERT/UPDATE/DELETE.'
    ],
    starGuide: {
      situation: 'Production user order search query taking 4.8 seconds during peak traffic hours.',
      task: 'Optimize execution plan and achieve sub-50ms response times.',
      action: 'Ran EXPLAIN ANALYZE, replaced Seq Scan with composite B-Tree index on (tenant_id, created_at DESC), and eliminated unnecessary table joins.',
      result: 'Query execution time decreased from 4.8s to 12ms (99.7% reduction).'
    },
    sampleAnswer: `1. **Query Diagnostics**:
   - Run \`EXPLAIN (ANALYZE, BUFFERS) SELECT ...\` to inspect the query execution plan. Look for:
     - **Seq Scan (Sequential Scan)**: Table is being read row-by-row because no usable index exists.
     - **High Buffer Reads / Temp Disk Spills**: Memory 'work_mem' is insufficient for sorting or hash joins.

2. **Index Optimization**:
   - **Composite Indexes**: Align column order with the query filtering and sorting: equality columns first, followed by range/sorting columns (e.g., \`CREATE INDEX idx_user_orders ON orders (user_id, status, created_at DESC)\`).
   - **Covering Indexes**: Use \`INCLUDE (col1, col2)\` to enable index-only scans, retrieving data directly from the index tree without fetching the heap page.

3. **Read vs Write Trade-offs**:
   - B-Tree indexes provide O(log N) lookup time for reads.
   - However, each additional index adds write amplification: every INSERT, UPDATE, or DELETE must update every associated index structure and trigger WAL writes. Keep indexes lean and drop unused indexes identified via \`pg_stat_user_indexes\`.`,
    fresherFriendly: false
  },

  // --- FRESHER / ENTRY-LEVEL CANDIDATES ---
  {
    id: 'q-fr-1',
    role: 'Fresher / Entry-Level',
    category: 'HR & Culture Fit',
    difficulty: 'Entry-Level',
    topic: 'Introduction & Self Presentation',
    question: 'Tell me about yourself, your educational background, and why you decided to pursue a career in software development.',
    hints: [
      'Structure into 3 chapters: Present (Current focus/skills) -> Past (Academic/project foundation) -> Future (Why this company/role).',
      'Mention 1-2 impressive hands-on projects you built.',
      'Keep it concise (60-90 seconds) without repeating your entire resume word-for-word.'
    ],
    starGuide: {
      situation: 'Introduction opening question that sets the tone for the entire interview.',
      task: 'Deliver a structured, confident 90-second elevator pitch connecting your passions to this role.',
      action: 'Highlighted technical coursework, real-world full-stack MERN project built, and proactive learning.',
      result: 'Created an engaging conversation starter demonstrating enthusiasm and strong fundamentals.'
    },
    sampleAnswer: `"Hello! I recently graduated with a degree in Computer Science, where I built a solid foundation in Data Structures, Algorithms, Object-Oriented Programming, and Web Technologies.

During my degree, I developed a passion for full-stack web development. For my capstone project, I designed and built 'CareerElevate AI'—a full-stack web application using React, Node.js, Express, and MongoDB that helps candidates analyze resumes and practice interview questions. I implemented JWT authentication, responsive Tailwind UI, and integrated REST APIs with Google Gemini AI.

What excites me about your company is your focus on engineering excellence and high-scale products. As an entry-level engineer, I am eager to contribute my strong problem-solving skills, learn from senior mentors, and build scalable features that deliver real user value."`,
    fresherFriendly: true
  },
  {
    id: 'q-fr-2',
    role: 'Fresher / Entry-Level',
    category: 'Technical',
    difficulty: 'Entry-Level',
    topic: 'Object-Oriented Programming (OOP)',
    question: 'What are the four pillars of Object-Oriented Programming (OOP)? Provide a real-world software example for each.',
    hints: [
      'Four pillars: Encapsulation, Abstraction, Inheritance, Polymorphism.',
      'Use a cohesive theme (e.g. Bank Account or Vehicle) for clarity.',
      'Explain method overriding vs method overloading.'
    ],
    starGuide: {
      situation: 'Core computer science fundamentals question asked in almost every campus & fresher technical round.',
      task: 'Explain Encapsulation, Abstraction, Inheritance, and Polymorphism with real code/architectural analogies.',
      action: 'Provided precise definitions accompanied by a clear Bank Account software example.',
      result: 'Demonstrated solid grasp of reusable, clean code architecture principles.'
    },
    sampleAnswer: `The four core pillars of Object-Oriented Programming are:

1. **Encapsulation (Data Hiding)**:
   - Bundling data (variables) and methods operating on that data within a single class while restricting direct external access using private/protected access modifiers.
   - *Example*: In a \`BankAccount\` class, the \`balance\` field is \`private\`. External code cannot write \`account.balance = 1000000\`; it must call the \`deposit(amount)\` method which validates business rules.

2. **Abstraction (Hiding Complexity)**:
   - Showing only essential features to the user while hiding underlying internal implementation details.
   - *Example*: Calling \`paymentGateway.processPayment()\` executes credit card authorization, tokenization, and encryption behind the scenes without the caller needing to know the low-level socket protocol.

3. **Inheritance (Code Reusability)**:
   - Mechanism where a child/derived class inherits properties and behaviors from a parent/base class.
   - *Example*: \`SavingsAccount\` and \`CheckingAccount\` inherit common fields (\`accountNumber\`, \`ownerName\`) from the base \`Account\` class.

4. **Polymorphism (Many Forms)**:
   - Ability of an object or method to take many forms.
   - *Compile-Time (Overloading)*: Same method name with different parameters (e.g. \`calculateInterest(rate)\` vs \`calculateInterest(rate, bonus)\`).
   - *Run-Time (Overriding)*: A child class provides a specific implementation of a parent method (e.g. \`SavingsAccount.calculateInterest()\` calculates compound interest, whereas \`CheckingAccount\` returns zero).`,
    fresherFriendly: true
  },
  {
    id: 'q-fr-3',
    role: 'Fresher / Entry-Level',
    category: 'Technical',
    difficulty: 'Entry-Level',
    topic: 'Relational Database & SQL',
    question: 'What are the differences between INNER JOIN, LEFT JOIN, RIGHT JOIN, and FULL OUTER JOIN in SQL? Give a quick table query example.',
    hints: [
      'INNER JOIN returns only matching rows from both tables.',
      'LEFT JOIN returns all rows from left table and matching rows from right (null otherwise).',
      'Explain when you would use LEFT JOIN (e.g. finding customers who have made zero orders).'
    ],
    starGuide: {
      situation: 'Essential SQL query design question asked across entry-level software, backend, and data roles.',
      task: 'Clearly differentiate all four join types with schema examples.',
      action: 'Used Customers and Orders tables to illustrate Venn diagram logic and NULL handling.',
      result: 'Showed readiness to write production database queries and reports.'
    },
    sampleAnswer: `Consider two tables: \`Customers(id, name)\` and \`Orders(id, customer_id, amount)\`:

1. **INNER JOIN**:
   - Returns records that have matching values in both tables.
   - *Example*: Customers who have placed at least one order.
   - \`SELECT * FROM Customers C INNER JOIN Orders O ON C.id = O.customer_id;\`

2. **LEFT JOIN (LEFT OUTER JOIN)**:
   - Returns ALL rows from the left table, plus matched records from the right table. If no match exists, NULL values appear on the right.
   - *Example*: All customers, including those who have never placed an order (\`WHERE O.id IS NULL\` identifies inactive users).

3. **RIGHT JOIN (RIGHT OUTER JOIN)**:
   - Returns ALL rows from the right table, plus matched records from the left table.
   - *Example*: All orders, matched to customer records if existing.

4. **FULL OUTER JOIN**:
   - Returns all rows when there is a match in either left or right table. Returns NULL on whichever side lacks a corresponding record.`,
    fresherFriendly: true
  },
  {
    id: 'q-fr-4',
    role: 'Fresher / Entry-Level',
    category: 'HR & Culture Fit',
    difficulty: 'Entry-Level',
    topic: 'Career Motivation & Culture',
    question: 'Where do you see yourself in 3 to 5 years, and how do you plan to achieve those career goals?',
    hints: [
      'Emphasize deepening technical skills first, followed by taking ownership and mentoring.',
      'Show commitment to staying with the company and contributing long-term value.',
      'Avoid vague buzzwords or jumping straight into management without engineering mastery.'
    ],
    starGuide: {
      situation: 'Common HR question evaluating candidate retention, motivation, and career trajectory.',
      task: 'Provide a realistic, ambitious roadmap that aligns with an engineering career ladder.',
      action: 'Detailed plan: Years 1-2 mastering codebase and clean architecture; Years 3-5 taking lead on feature modules and mentoring juniors.',
      result: 'Demonstrated mature mindset, loyalty, and passion for continuous improvement.'
    },
    sampleAnswer: `"In the next 3 to 5 years, my goal is to evolve from an enthusiastic junior developer into a dependable, high-impact Senior Software Engineer.

- In years 1 and 2, my priority is to master our team's tech stack, understand our production architecture, write clean and thoroughly tested code, and deliver features independently with minimal supervision.
- In years 3 to 5, I aspire to take end-to-end architectural ownership of complex system modules, participate in system design discussions, and mentor newer developers joining the team.

I plan to achieve this by consistently seeking constructive feedback from senior engineers, staying updated with emerging tech trends, and actively taking on challenges that push me outside my comfort zone."`,
    fresherFriendly: true
  },

  // --- PRODUCT MANAGEMENT ---
  {
    id: 'q-pm-1',
    role: 'Product Management',
    category: 'Technical',
    difficulty: 'Intermediate',
    topic: 'Product Strategy & Metric Trees',
    question: 'How would you measure the success of Spotify Wrapped, and what new feature would you propose for next year?',
    hints: [
      'Break metrics down into Acquisition, Engagement, Virality, and Retention.',
      'Propose a user-centric feature solving a clear pain point.',
      'Explain trade-offs and guardrail metrics.'
    ],
    starGuide: {
      situation: 'Define Spotify Wrapped goal: driving annual viral social sharing & user re-engagement.',
      task: 'Establish North Star metric and primary KPI tree.',
      action: 'Propose a new feature concept with detailed user journey.',
      result: 'Describe how you would test and measure adoption.'
    },
    sampleAnswer: `**North Star Metric**: Total Social Impressions & App Re-activations driven by Wrapped shares within 14 days of launch.

**Primary KPIs**:
1. **Virality Rate**: % of active users who export/share their Wrapped story to Instagram, TikTok, X, or WhatsApp.
2. **DAU Surge**: YoY increase in Daily Active Users during launch week.
3. **Retention Impact**: 30-day retention rate for users who viewed Wrapped vs those who did not.

**Proposed Feature - "Wrapped Listening Parties"**:
- Allow users to generate a collaborative "Blend Wrapped" with their top 3 closest friends or partner, creating a shared music memory card and real-time listening room.
- **Guardrail Metric**: Premium subscription churn during Q1 to ensure campaign isn't just a brief viral spike without long-term value.`,
    fresherFriendly: false
  },

  // --- DATA SCIENCE & AI ---
  {
    id: 'q-ds-1',
    role: 'Data Science',
    category: 'Technical',
    difficulty: 'Senior',
    topic: 'Machine Learning & Imbalanced Data',
    question: 'Explain how you address severe class imbalance in a credit card fraud detection model where only 0.1% of transactions are fraudulent.',
    hints: [
      'Explain why Accuracy is a misleading metric (99.9% accuracy guessing non-fraud).',
      'Mention resampling techniques (SMOTE, ADASYN, random undersampling).',
      'Discuss algorithm-level adjustments (class weights, Focal Loss) and evaluation metrics (PR-AUC, Recall@Precision).'
    ],
    starGuide: {
      situation: 'Highlight the severe financial impact of false negatives in fraud detection.',
      task: 'Select appropriate loss functions, sampling techniques, and evaluation metrics.',
      action: 'Detail implementation steps: SMOTE + Cost-Sensitive XGBoost.',
      result: 'Achieve high Recall while holding Precision at an acceptable threshold.'
    },
    sampleAnswer: `When dealing with 0.1% extreme class imbalance:

1. **Evaluation Metrics Selection**:
   - Never rely on Accuracy. Use Precision-Recall AUC (PR-AUC), F1-Score, and Recall at a target 95% Precision threshold.

2. **Data Resampling**:
   - Combine SMOTE (Synthetic Minority Over-sampling Technique) to generate synthetic fraud samples with Tomek Links undersampling to clean decision boundary overlap.

3. **Model & Cost Matrix**:
   - Use Tree-based ensembles (LightGBM / XGBoost) with 'scale_pos_weight' parameter set to ratio of negative to positive classes (999:1).
   - Apply Cost-Sensitive Learning: Assign higher penalty cost to False Negatives (uncaught fraud) than False Positives (customer verification call).`,
    fresherFriendly: false
  },

  // --- DEVOPS & CLOUD ---
  {
    id: 'q-do-1',
    role: 'DevOps & Cloud',
    category: 'Technical',
    difficulty: 'Intermediate',
    topic: 'CI/CD & Zero-Downtime Deployment',
    question: 'Explain the difference between Blue-Green Deployment and Canary Deployment. How do you implement zero-downtime rollouts in Kubernetes?',
    hints: [
      'Blue-Green switches 100% of traffic via load balancer once the green environment is verified.',
      'Canary routes a small percentage (e.g. 5%) of real traffic to the new version before gradual rollout.',
      'Kubernetes uses readiness probes and RollingUpdate deployment strategy.'
    ],
    starGuide: {
      situation: 'High-availability payment API needing 100% uptime during frequent production deployments.',
      task: 'Design an automated CI/CD deployment pipeline with zero downtime and automatic rollback on elevated error rates.',
      action: 'Implemented Canary release using Argo Rollouts and Istio service mesh routing 5% -> 25% -> 100% based on Prometheus HTTP 5xx error metrics.',
      result: 'Achieved zero downtime across 120+ monthly production releases and caught 3 critical bugs before full rollout.'
    },
    sampleAnswer: `1. **Blue-Green Deployment**:
   - Two identical production environments exist: "Blue" (currently live) and "Green" (idle).
   - Deploy new code to Green, run integration/smoke tests.
   - Once verified, switch the router/load balancer traffic from Blue to Green instantly.
   - *Advantage*: Instant rollback (switch router back to Blue). *Downside*: Requires 2x cloud infrastructure cost.

2. **Canary Deployment**:
   - Deploy the new version alongside the current version, routing only a small percentage of user traffic (e.g. 5%) using a service mesh (Istio/Envoy) or Kubernetes Ingress.
   - Monitor real-time metrics (latency, HTTP 5xx error rates, APM logs).
   - If error thresholds remain healthy, automatically scale traffic to 25%, 50%, and 100%. If errors spike, immediately roll back with minimal blast radius.

3. **Kubernetes Implementation**:
   - Use \`readinessProbe\` and \`livenessProbe\` so pods only receive traffic after warming up.
   - Configure \`maxSurge: 25%\` and \`maxUnavailable: 0\` in the Deployment spec to ensure zero capacity loss during rolling updates.`,
    fresherFriendly: false
  }
];
