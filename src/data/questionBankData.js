export const QUESTION_BANK = [
  {
    id: 'q-sw-1',
    role: 'Software Engineering',
    category: 'System Design',
    difficulty: 'Hard',
    question: 'How would you design a high-throughput, low-latency URL Shortener service (like bit.ly) handling 100M daily active users?',
    hints: [
      'Discuss hashing algorithms (Base62 vs MD5/SHA256 truncation).',
      'Address database storage selection (NoSQL like Cassandra vs Relational PostgreSQL).',
      'Describe caching strategy (Redis/Memcached) for read-heavy traffic (99:1 read-to-write ratio).',
      'Explain rate limiting and key generation service (KGS) to avoid hash collisions.'
    ],
    starGuide: {
      situation: 'When asked to design a system at scale, start by clarifying requirements (functional & non-functional).',
      task: 'Estimate traffic (100M DAU -> ~1.1k writes/sec, 110k reads/sec) and storage needs.',
      action: 'Detail the API endpoints, key generator service, caching tier, and sharded database schema.',
      result: 'Demonstrate how the system handles failover, rate limiting, and guarantees <50ms latency globally.'
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
   - Deploy behind AWS ALB with Auto Scaling EC2/ECS instances. Use Cloudflare CDN for edge caching and DDoS mitigation.`
  },
  {
    id: 'q-sw-2',
    role: 'Software Engineering',
    category: 'Behavioral & Leadership',
    difficulty: 'Medium',
    question: 'Describe a situation where you had a major technical disagreement with a Senior Architect or Product Manager. How did you handle it?',
    hints: [
      'Focus on data and benchmarks rather than personal opinions.',
      'Show active listening and empathy for business constraints.',
      'Explain the compromise or escalation path that resulted in project success.'
    ],
    starGuide: {
      situation: 'Set up a specific context (e.g., choosing DB technology or microservices vs monolith for a tight deadline).',
      task: 'Clarify what the disagreement was and why it mattered to the product or engineering quality.',
      action: 'Detail how you ran a quick proof-of-concept (PoC) or gathered benchmark data to present objectively.',
      result: 'Explain the outcome, what you learned, and how it strengthened team trust.'
    },
    sampleAnswer: `**Situation**: At my previous company, our Lead Architect proposed rewriting our core authentication module using a new custom OAuth server framework, right as we were 3 weeks away from a major enterprise client launch.

**Task**: I was concerned that introducing an unproven custom auth service right before launch carried immense security risks and would delay the deadline by over a month.

**Action**: Rather than simply rejecting the idea in a group meeting, I scheduled a 1-on-1 with the Lead Architect. I brought concrete benchmark data and security audit reports demonstrating that integrating Auth0/Okta standard SDKs would meet 95% of our requirements immediately with zero security overhead. I also proposed building a prototype of his custom architecture during our upcoming innovation sprint after the enterprise launch.

**Result**: He appreciated that I validated his long-term architectural vision while protecting the immediate business deadline. We launched on time with Auth0, secured the enterprise customer, and later evaluated custom auth systematically.`
  },
  {
    id: 'q-pm-1',
    role: 'Product Management',
    category: 'Product Strategy & Metrics',
    difficulty: 'Medium',
    question: 'How would you measure the success of Spotify Wrapped, and what new feature would you propose for next year?',
    hints: [
      'Break metrics down into Acquisition, Engagement, Virality, and Retention.',
      'Propose a user-centric feature solving a clear pain point (e.g. social sharing, interactive live listening).',
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
1. **Virality Rate**: % of users who export/share their Wrapped story to Instagram, TikTok, X, or WhatsApp.
2. **DAU Surge**: YoY increase in Daily Active Users during launch week.
3. **Retention Impact**: 30-day retention rate for users who viewed Wrapped vs those who did not.

**Proposed Feature - "Wrapped Listening Parties"**:
- Allow users to generate a collaborative "Blend Wrapped" with their top 3 closest friends or partner, creating a shared 2026 music memory card and real-time listening room.
- **Guardrail Metric**: Premium subscription churn during Q1 to ensure campaign isn't just a brief viral spike without long-term value.`
  },
  {
    id: 'q-ds-1',
    role: 'Data Science',
    category: 'Machine Learning',
    difficulty: 'Hard',
    question: 'Explain how you address class imbalance in a credit card fraud detection model where only 0.1% of transactions are fraudulent.',
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
   - Use Tree-based ensembles (LightGBM / XGBoost) with \`scale_pos_weight\` parameter set to ratio of negative to positive classes (999:1).
   - Apply Cost-Sensitive Learning: Assign higher penalty cost to False Negatives (uncaught fraud) than False Positives (customer verification call).`
  }
];
