// Job Description Matcher & Gap Analysis Engine

const COMMON_TECH_KEYWORDS = [
  'react', 'next.js', 'typescript', 'javascript', 'node.js', 'python', 'sql', 'postgresql',
  'mongodb', 'aws', 'docker', 'kubernetes', 'graphql', 'rest api', 'microservices',
  'ci/cd', 'agile', 'scrum', 'system design', 'todd', 'unit testing', 'jest', 'cypress',
  'redis', 'kafka', 'express', 'fastapi', 'tailwind', 'figma', 'jira', 'tableau',
  'bigquery', 'machine learning', 'nlp', 'pytorch', 'spark', 'snowflake', 'a/b testing',
  'product roadmap', 'gttm', 'rice framework', 'product strategy', 'analytics'
];

export function matchJobDescription(resumeText, jobDescriptionText) {
  if (!resumeText || !jobDescriptionText) return null;

  const resumeLower = resumeText.toLowerCase();
  const jdLower = jobDescriptionText.toLowerCase();

  // Extract keywords present in Job Description
  const jdKeywords = COMMON_TECH_KEYWORDS.filter(kw => jdLower.includes(kw));

  if (jdKeywords.length === 0) {
    // Fallback word matching
    const wordsInJd = Array.from(new Set(jdLower.match(/\b[a-z]{4,}\b/g) || []));
    const matched = wordsInJd.filter(w => resumeLower.includes(w));
    const missing = wordsInJd.filter(w => !resumeLower.includes(w)).slice(0, 8);
    const score = Math.round((matched.length / Math.max(1, wordsInJd.length)) * 100);
    return {
      matchScore: Math.min(95, Math.max(40, score)),
      matchedKeywords: matched.slice(0, 10),
      missingKeywords: missing,
      recommendation: 'Add missing domain keywords from the job description directly into your skills and bullet points.'
    };
  }

  const matchedKeywords = jdKeywords.filter(kw => resumeLower.includes(kw));
  const missingKeywords = jdKeywords.filter(kw => !resumeLower.includes(kw));

  const matchScore = Math.round((matchedKeywords.length / jdKeywords.length) * 100);

  let recommendation = '';
  if (matchScore >= 80) {
    recommendation = 'Strong Alignment! Your resume naturally covers the core technical requirements for this role.';
  } else if (matchScore >= 60) {
    recommendation = 'Moderate Alignment. We recommend incorporating the missing keywords below into your Experience and Skills sections.';
  } else {
    recommendation = 'Low Match. High risk of ATS rejection. Tailor your resume summary and bullet points to explicitly mention required technologies.';
  }

  return {
    matchScore,
    matchedKeywords,
    missingKeywords,
    totalJdKeywordsCount: jdKeywords.length,
    recommendation
  };
}
