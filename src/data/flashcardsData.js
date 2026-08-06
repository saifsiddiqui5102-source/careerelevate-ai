export const FLASHCARDS_DATA = [
  {
    id: 'fc-1',
    category: 'System Design',
    question: 'What is CAP Theorem and how does PACELC expand upon it?',
    answer: 'CAP states that in a distributed system, you can only pick 2 out of Consistency, Availability, and Partition Tolerance. PACELC adds: If there is a Partition (P), trade off Availability (A) vs Consistency (C); Else (E), trade off Latency (L) vs Consistency (C).'
  },
  {
    id: 'fc-2',
    category: 'Frontend & Web',
    question: 'What is the Virtual DOM and how does React reconciliation algorithm work?',
    answer: 'Virtual DOM is a lightweight JS memory representation of real DOM nodes. React uses a diffing algorithm (O(n) heuristic) comparing element types and keys to perform batch DOM updates with minimal reflows.'
  },
  {
    id: 'fc-3',
    category: 'Behavioral Strategy',
    question: 'What is the STAR Method for behavioral interview questions?',
    answer: 'Situation (Context), Task (Challenge/Responsibility), Action (Specific steps YOU took), Result (Quantifiable outcome, lessons learned, ROI).'
  },
  {
    id: 'fc-4',
    category: 'Backend & Databases',
    question: 'What is the difference between Indexing (B-Tree) vs Hash Index in PostgreSQL?',
    answer: 'B-Tree indexes support equality (=) and range queries (<, >, BETWEEN, ORDER BY) with O(log N) lookup. Hash indexes only support exact equality (=) lookups with O(1) average time but cannot perform range scans.'
  },
  {
    id: 'fc-5',
    category: 'Product Strategy',
    question: 'What is the RICE Prioritization Framework?',
    answer: 'RICE Score = (Reach × Impact × Confidence) / Effort. Used by Product Managers to quantitatively rank product features and backlog items.'
  }
];
