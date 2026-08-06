const swaggerSpecJson = JSON.stringify({
  openapi: '3.0.0',
  info: {
    title: 'CareerElevate AI - Enterprise REST API Specification',
    version: '1.0.0',
    description: 'Production-ready REST API for CareerElevate AI Resume Analyzer and Interview Preparation Platform.',
    contact: {
      name: 'CareerElevate AI Engineering Team',
      email: 'support@careerelevate.ai'
    }
  },
  servers: [
    { url: 'http://localhost:5000/api/v1', description: 'Local Development Server (v1)' },
    { url: 'https://careerelevate-api.onrender.com/api/v1', description: 'Production Render Server (v1)' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Provide JWT token received from /api/v1/auth/login or /api/v1/auth/verify-otp'
      }
    }
  },
  tags: [
    { name: 'Authentication', description: 'User registration, OTP verification, login, password recovery & logout' },
    { name: 'User Profile', description: 'Candidate profile details, skill matrix, work experience & education' },
    { name: 'Resume Management', description: 'Resume PDF upload, 11-pillar AI ATS analysis, version management & comparison' },
    { name: 'AI Interview Prep', description: 'Dynamic 4-category question generator, STAR model evaluation & interview history' },
    { name: 'Dashboard Analytics', description: 'SaaS analytics summary cards, Recharts datasets & career progress gauges' },
    { name: 'System Health', description: 'Health check & security status endpoints' }
  ],
  paths: {
    '/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register new candidate account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'Saif Siddiqui' },
                  email: { type: 'string', example: 'saif@example.com' },
                  password: { type: 'string', example: 'password123' },
                  targetRole: { type: 'string', example: 'Senior Software Engineer' }
                }
              }
            }
          }
        },
        responses: { 200: { description: 'OTP sent successfully to candidate email' } }
      }
    },
    '/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Log in to candidate account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'saif@example.com' },
                  password: { type: 'string', example: 'password123' }
                }
              }
            }
          }
        },
        responses: { 200: { description: 'Logged in successfully with JWT token' } }
      }
    },
    '/auth/verify-otp': {
      post: {
        tags: ['Authentication'],
        summary: 'Verify 6-digit email OTP PIN',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'otp'],
                properties: {
                  email: { type: 'string', example: 'saif@example.com' },
                  otp: { type: 'string', example: '123456' }
                }
              }
            }
          }
        },
        responses: { 200: { description: 'Account verified successfully' } }
      }
    },
    '/user/profile': {
      get: {
        tags: ['User Profile'],
        summary: 'Get candidate profile details',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Candidate profile data' } }
      },
      put: {
        tags: ['User Profile'],
        summary: 'Update candidate profile',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Saif Siddiqui' },
                  targetRole: { type: 'string', example: 'Staff Full Stack Architect' }
                }
              }
            }
          }
        },
        responses: { 200: { description: 'Profile updated successfully' } }
      }
    },
    '/resume/upload': {
      post: {
        tags: ['Resume Management'],
        summary: 'Upload resume PDF document',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: { resume: { type: 'string', format: 'binary' } }
              }
            }
          }
        },
        responses: { 200: { description: 'Resume uploaded and version created' } }
      }
    },
    '/resume/analyze': {
      post: {
        tags: ['Resume Management'],
        summary: 'Run 11-pillar Gemini AI ATS Resume Analysis',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['resumeText'],
                properties: {
                  resumeText: { type: 'string', example: 'Senior Software Engineer with 6 years experience in React, Node.js and MongoDB...' },
                  resumeTitle: { type: 'string', example: 'Master Dev Resume 2026' }
                }
              }
            }
          }
        },
        responses: { 200: { description: 'Full 11-pillar ATS report generated' } }
      }
    },
    '/interview/generate-questions': {
      post: {
        tags: ['AI Interview Prep'],
        summary: 'Generate dynamic interview questions across 4 categories',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  jobRole: { type: 'string', example: 'Senior Software Engineer' },
                  skills: { type: 'array', items: { type: 'string' }, example: ['React', 'Node.js', 'System Design'] }
                }
              }
            }
          }
        },
        responses: { 200: { description: 'Dynamic interview question suite generated' } }
      }
    },
    '/dashboard': {
      get: {
        tags: ['Dashboard Analytics'],
        summary: 'Get real-time SaaS dashboard summary metrics',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Summary cards, charts, activity feed, and progress gauges' } }
      }
    }
  }
});

export const serveSwaggerUiHtml = (req, res) => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CareerElevate AI - Interactive Swagger API Docs</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css" />
  <link rel="icon" type="image/png" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/favicon-32x32.png" />
  <style>
    body { margin: 0; background: #0f172a; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .swagger-ui { filter: invert(88%) hue-rotate(180deg); }
    .swagger-ui .topbar { display: none; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      const spec = ${swaggerSpecJson};
      SwaggerUIBundle({
        spec: spec,
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        layout: "StandaloneLayout"
      });
    };
  </script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  res.send(html);
};
