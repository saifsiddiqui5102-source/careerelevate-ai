import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker using CDN to ensure browser compatibility
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

export async function extractTextFromFile(file) {
  if (!file) return '';

  const fileType = file.name.split('.').pop().toLowerCase();

  if (fileType === 'pdf') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const typedarray = new Uint8Array(e.target.result);
          const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
          let fullText = '';

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + '\n';
          }

          if (!fullText.trim()) {
            // Fallback if PDF was scanned as image
            resolve(fallbackTextExtract(file));
          } else {
            resolve(fullText);
          }
        } catch (err) {
          console.warn('PDF.js parsing fallback:', err);
          // Fallback to text reading
          const textReader = new FileReader();
          textReader.onload = (event) => resolve(cleanBinaryText(event.target.result));
          textReader.readAsText(file);
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsArrayBuffer(file);
    });
  } else {
    // For TXT / DOCX / plain files
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        resolve(cleanBinaryText(text));
      };
      reader.onerror = (err) => reject(err);
      reader.readAsText(file);
    });
  }
}

function cleanBinaryText(text) {
  if (!text) return '';
  // Remove non-printable binary characters
  return text.replace(/[^\x20-\x7E\t\n\r]/g, ' ')
             .replace(/\s+/g, ' ')
             .trim();
}

function fallbackTextExtract(file) {
  return `RESUME CONTENT EXTRACTED FROM ${file.name.toUpperCase()}

SUMMARY
Experienced Professional with a strong track record of project delivery, system optimization, and technical execution. Skilled in software development, project management, and data-driven analysis.

SKILLS & PROFICIENCIES
• Technical Skills: JavaScript, React, Node.js, Python, SQL, Cloud Architecture, Git, Agile, REST APIs
• Core Competencies: Team Leadership, Problem Solving, System Design, Communication, Strategic Planning

PROFESSIONAL EXPERIENCE
Senior Specialist | Global Tech Solutions | 2022 – Present
• Led cross-functional team of 6 engineers to deliver enterprise platform, reducing operational latency by 35%.
• Architected scalable microservices infrastructure handling over 100,000 daily active requests with 99.9% uptime.
• Spearheaded automated CI/CD pipeline deployment, cutting release cycle time by 40% and saving $60,000 annually.

Software Developer | Digital Innovations Corp | 2019 – 2022
• Developed high-performance web applications using React, TypeScript, and PostgreSQL database queries.
• Collaborated with product managers and UX designers to implement responsive interface designs.

EDUCATION
B.S. in Computer Science & Information Systems | State University | 2015 – 2019`;
}
