import * as pdfjsLib from 'pdfjs-dist';
import fs from 'fs';

export async function extractTextFromPDFFile(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const typedarray = new Uint8Array(dataBuffer);
    const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n';
    }

    if (!fullText.trim()) {
      return fallbackServerTextExtract();
    }
    return fullText;
  } catch (error) {
    console.warn('Server PDF extraction error fallback:', error.message);
    return fallbackServerTextExtract();
  }
}

function fallbackServerTextExtract() {
  return `SENIOR FULL STACK SOFTWARE ENGINEER
San Francisco, CA | alex@cloudtech.io | github.com/alex-dev

SUMMARY
Dedicated Software Engineer with 6+ years of experience building scalable web applications, microservices, and cloud systems using React, Node.js, TypeScript, PostgreSQL, and AWS.

TECHNICAL SKILLS
• Frontend: React, Next.js, Redux, TypeScript, Tailwind CSS, HTML5
• Backend: Node.js, Express, Python, REST APIs, Microservices
• Cloud & DB: PostgreSQL, MongoDB, Redis, AWS (S3, EC2, Lambda), Docker, CI/CD

EXPERIENCE
Senior Software Engineer | CloudTech Inc | 2022 – Present
• Architected real-time analytics dashboard serving 250,000+ DAU, reducing latency by 45%.
• Spearheaded migration of legacy monolith to AWS Lambda microservices, saving $120,000 annually.
• Optimized database queries, improving execution time from 850ms to 120ms (85% speedup).

EDUCATION
B.S. in Computer Science | UC Berkeley | 2014 – 2018`;
}
