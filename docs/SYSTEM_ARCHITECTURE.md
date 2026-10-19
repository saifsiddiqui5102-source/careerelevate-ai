# 🏗️ CareerElevate AI - System Architecture Specification & Black Book Documentation

---

## 📸 1. Visual System Architecture Diagram (For Black Book Report)

![CareerElevate AI System Architecture Diagram](file:///C:/Users/Mohd%20saif%20siddiqui/.gemini/antigravity/brain/e5a1b281-59d4-41eb-b152-0706f1207e7c/system_architecture_diagram_1786196226055.jpg)

> **File Location**: [`C:\Users\Mohd saif siddiqui\Documents\resume-interview-pro\docs\system_architecture_diagram.jpg`](file:///C:/Users/Mohd%20saif%20siddiqui/Documents/resume-interview-pro/docs/system_architecture_diagram.jpg)  
> *Suitable for high-resolution print inclusion in Project Black Book, Synopsis, and Engineering Thesis reports.*

---

## 🧩 2. Component Explanation

The **CareerElevate AI** platform utilizes an enterprise-grade 3-Tier decoupled Microservices-ready MERN Architecture:

```
+-----------------------------------------------------------------------------------+
|                                 USER LAYER                                        |
|                     [ Candidate / Recruiter / Admin ]                            |
+-----------------------------------------------------------------------------------+
                                         │
                                         ▼
+-----------------------------------------------------------------------------------+
|                              PRESENTATION LAYER                                   |
|               React.js 18 + Vite + Tailwind CSS + Recharts (Port 3000)            |
+-----------------------------------------------------------------------------------+
                                         │
                                         ▼
+-----------------------------------------------------------------------------------+
|                             API & SECURITY LAYER                                  |
|            Express.js REST API v1 + Helmet + CORS + Rate Limiter                  |
+-----------------------------------------------------------------------------------+
                       │                 │                 │
                       ▼                 ▼                 ▼
             ┌──────────────────┐ ┌──────────────┐ ┌──────────────┐
             │ JWT Auth & Guard │ │ PDF Engine   │ │ Analytics    │
             └──────────────────┘ └──────────────┘ └──────────────┘
                       │                 │                 │
                       ▼                 ▼                 ▼
+-----------------------------------------------------------------------------------+
|                                 DATA & AI LAYER                                   |
|       MongoDB Atlas Database    │   Google Gemini 1.5 Pro AI   │  PDF.js Parsing    |
+-----------------------------------------------------------------------------------+
```

### Component Breakdown:

1. **User**: Candidates uploading resumes, taking mock interviews, viewing profile matrices, and tracking career analytics.
2. **React Frontend (Presentation Layer)**: Built with React.js 18, Vite, Tailwind CSS, Lucide icons, and Recharts visualization. Manages state, API integration, interactive forms, and responsive analytics.
3. **Express.js Backend (Application Server)**: Handles REST API v1 routing, request validation, middleware security pipeline (Helmet, CORS, NoSQL Sanitize, XSS filter), and error handling.
4. **JWT Authentication & Security Guard**: Enforces JSON Web Token authentication, bcrypt password hashing, 6-digit email OTP verification, and role-based request authorization.
5. **MongoDB Database (Persistence Layer)**: Document storage database managing User profiles, Resume analysis reports, Resume version histories, Interview question banks, and Mock evaluation logs.
6. **Google Gemini AI Engine**: `@google/generative-ai` integration providing 11-pillar ATS resume analysis, dynamic 4-category interview question generation, and STAR model answer evaluation.
7. **PDF Processing Module**: `multer` file upload handler combined with `pdfjs-dist` text extraction engine for parsing unformatted resume documents into structured text.
8. **Dashboard Analytics (Recharts Engine)**: Real-time aggregated statistics calculations powering summary KPI cards, skill radar charts, score timelines, activity feeds, and circular progress gauges.

---

## 🔄 3. End-to-End Data Flow Explanation

```
[User Input] ──► [PDF Upload / Form] ──► [React State] ──► [Axios / Fetch API v1]
                                                                   │
┌──────────────────────────────────────────────────────────────────┘
▼
[Express Server v1] ──► [Helmet / Security / Rate Limit] ──► [JWT Auth Middleware]
                                                                   │
┌──────────────────────────────────────────────────────────────────┘
▼
[PDF Processing Module] ──► Extract Text ──► [Google Gemini AI API]
                                                      │
┌─────────────────────────────────────────────────────┘
▼
[11-Pillar ATS Parsing] ──► [MongoDB Persistence] ──► [Dashboard Analytics Engine]
                                                                   │
┌──────────────────────────────────────────────────────────────────┘
▼
[Recharts Render] ◄── [JSON Payload] ◄── [Express v1 Response] ◄── [User Dashboard]
```

### Step-by-Step Flow:
1. **User Interaction**: Candidate logs in via JWT/OTP and uploads a PDF resume or requests an AI interview session.
2. **Client-Side Handling**: React Frontend validates input files using PDF.js and sends a secure HTTP POST request (`/api/v1/resume/upload` or `/api/v1/interview/generate-questions`) with the Authorization Bearer Token.
3. **API & Security Pipeline**: Express backend passes request through Helmet security headers, CORS origin verification, Rate Limiting, NoSQL query sanitization, and JWT authentication verification.
4. **Document Processing & AI Analysis**: `multer` receives PDF file stream, `pdfjs-dist` extracts text contents, and sends structured prompt to Google Gemini 1.5 Pro API.
5. **Data Enrichment & Storage**: Gemini AI evaluates resume across 11 ATS pillars or generates 4-category interview questions. Results are structured into JSON and persisted to MongoDB database.
6. **Analytics Computation & Presentation**: Dashboard controller aggregates overall scores, missing skills, and interview scores, returning real-time metrics rendered visually via Recharts charts on the React dashboard.

---

## 🧜‍♂️ 4. Mermaid Source Code

```mermaid
graph TD
    classDef userLayer fill:#1e293b,stroke:#3b82f6,stroke-width:2px,color:#f8fafc;
    classDef frontLayer fill:#0f172a,stroke:#8b5cf6,stroke-width:2px,color:#f8fafc;
    classDef backLayer fill:#1e1b4b,stroke:#06b6d4,stroke-width:2px,color:#f8fafc;
    classDef secLayer fill:#311b92,stroke:#ec4899,stroke-width:2px,color:#f8fafc;
    classDef dataLayer fill:#064e3b,stroke:#10b981,stroke-width:2px,color:#f8fafc;
    classDef aiLayer fill:#4c1d95,stroke:#a855f7,stroke-width:2px,color:#f8fafc;

    subgraph Client_Side ["1. User & Client Presentation Layer"]
        U["👤 Candidate / Recruiter User"] :::userLayer
        RF["⚛️ React.js 18 Frontend\n(Vite + Tailwind CSS + Recharts)"] :::frontLayer
    end

    subgraph Backend_Server ["2. Express.js REST API v1 Server"]
        EX["🚀 Express.js API Gateway (/api/v1)"] :::backLayer
        SEC["🔒 Security Layer\n(Helmet + CORS + Rate Limiter + XSS Filter)"] :::secLayer
        JWT["🔑 JWT Auth Guard & Password Hash (bcrypt)"] :::secLayer
    end

    subgraph Core_Services ["3. Service & AI Processing Layer"]
        PDF["📄 PDF Processing Module\n(Multer + PDF.js Text Extractor)"] :::backLayer
        GEM["🤖 Google Gemini 1.5 Pro AI Engine\n(11-Pillar ATS + STAR Interview Evaluator)"] :::aiLayer
        DASH["📊 Dashboard Analytics Engine\n(Summary Cards + Skill Matrix + Gauges)"] :::backLayer
    end

    subgraph Data_Storage ["4. Persistence Layer"]
        DB[("🍃 MongoDB Atlas Database\n(Users, Resumes, Versions, Interviews)")] :::dataLayer
    end

    %% Flow Connections
    U -->|1. Interacts / Uploads Resume| RF
    RF -->|2. HTTP REST Request with JWT Token| SEC
    SEC --> EX
    EX --> JWT
    JWT -->|3. Valid Token Passed| PDF
    PDF -->|4. Parsed Text Content| GEM
    GEM -->|5. Structured ATS Report / AI Score| DB
    DB -->|6. Aggregated Historical Data| DASH
    DASH -->|7. Real-Time Dashboard Payload| EX
    EX -->|8. JSON API Response| RF
    RF -->|9. Interactive Visualization| U
```

---

## 📐 5. Draw.io XML Code

```xml
<mxfile host="app.diagrams.net" modified="2026-08-08T19:00:00.000Z" agent="CareerElevate AI Architect" version="21.0.0" type="device">
  <diagram id="CareerElevate_Architecture" name="CareerElevate AI System Architecture">
    <mxGraphModel dx="1200" dy="800" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1169" pageHeight="827" background="#0F172A" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
        
        <!-- Title Header -->
        <mxCell id="title" value="CareerElevate AI - Enterprise System Architecture" style="text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontSize=22;fontStyle=1;fontColor=#F8FAFC;" vertex="1" parent="1">
          <mxGeometry x="330" y="20" width="510" height="40" as="geometry" />
        </mxCell>

        <!-- Node 1: User -->
        <mxCell id="node_user" value="User&#10;(Candidate / Admin)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#1E293B;strokeColor=#3B82F6;strokeWidth=2;fontColor=#F8FAFC;fontStyle=1;fontSize=14;" vertex="1" parent="1">
          <mxGeometry x="60" y="320" width="140" height="80" as="geometry" />
        </mxCell>

        <!-- Node 2: React Frontend -->
        <mxCell id="node_react" value="React.js Frontend&#10;(Vite + Tailwind + Recharts)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#0F172A;strokeColor=#8B5CF6;strokeWidth=2;fontColor=#F8FAFC;fontStyle=1;fontSize=14;" vertex="1" parent="1">
          <mxGeometry x="250" y="320" width="160" height="80" as="geometry" />
        </mxCell>

        <!-- Node 3: Express Backend -->
        <mxCell id="node_express" value="Express.js Backend&#10;REST API v1 (/api/v1)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#1E1B4B;strokeColor=#06B6D4;strokeWidth=2;fontColor=#F8FAFC;fontStyle=1;fontSize=14;" vertex="1" parent="1">
          <mxGeometry x="460" y="320" width="160" height="80" as="geometry" />
        </mxCell>

        <!-- Node 4: Security & JWT -->
        <mxCell id="node_jwt" value="JWT Auth &amp; Security&#10;(Helmet + RateLimit + Bcrypt)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#311B92;strokeColor=#EC4899;strokeWidth=2;fontColor=#F8FAFC;fontStyle=1;fontSize=14;" vertex="1" parent="1">
          <mxGeometry x="460" y="180" width="160" height="80" as="geometry" />
        </mxCell>

        <!-- Node 5: MongoDB -->
        <mxCell id="node_mongodb" value="MongoDB Atlas DB&#10;(Users, Resumes, Audits)" style="shape=cylinder3;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;size=15;fillColor=#064E3B;strokeColor=#10B981;strokeWidth=2;fontColor=#F8FAFC;fontStyle=1;fontSize=14;" vertex="1" parent="1">
          <mxGeometry x="670" y="310" width="150" height="100" as="geometry" />
        </mxCell>

        <!-- Node 6: Google Gemini AI -->
        <mxCell id="node_gemini" value="Google Gemini 1.5 Pro AI&#10;(11-Pillar ATS &amp; STAR Prep)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#4C1D95;strokeColor=#A855F7;strokeWidth=2;fontColor=#F8FAFC;fontStyle=1;fontSize=14;" vertex="1" parent="1">
          <mxGeometry x="870" y="180" width="180" height="80" as="geometry" />
        </mxCell>

        <!-- Node 7: PDF Processing Engine -->
        <mxCell id="node_pdf" value="PDF Processing Module&#10;(Multer + PDF.js Extractor)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#1E1B4B;strokeColor=#3B82F6;strokeWidth=2;fontColor=#F8FAFC;fontStyle=1;fontSize=14;" vertex="1" parent="1">
          <mxGeometry x="870" y="320" width="180" height="80" as="geometry" />
        </mxCell>

        <!-- Node 8: Dashboard Analytics -->
        <mxCell id="node_dash" value="Dashboard Analytics&#10;(Summary KPI + Radar Charts)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#064E3B;strokeColor=#10B981;strokeWidth=2;fontColor=#F8FAFC;fontStyle=1;fontSize=14;" vertex="1" parent="1">
          <mxGeometry x="870" y="460" width="180" height="80" as="geometry" />
        </mxCell>

        <!-- Connections -->
        <mxCell id="edge1" edge="1" parent="1" source="node_user" target="node_react" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#3B82F6;strokeWidth=2;" />
        <mxCell id="edge2" edge="1" parent="1" source="node_react" target="node_express" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#8B5CF6;strokeWidth=2;" />
        <mxCell id="edge3" edge="1" parent="1" source="node_express" target="node_jwt" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#EC4899;strokeWidth=2;" />
        <mxCell id="edge4" edge="1" parent="1" source="node_express" target="node_mongodb" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#10B981;strokeWidth=2;" />
        <mxCell id="edge5" edge="1" parent="1" source="node_pdf" target="node_gemini" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#A855F7;strokeWidth=2;" />
        <mxCell id="edge6" edge="1" parent="1" source="node_express" target="node_pdf" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#06B6D4;strokeWidth=2;" />
        <mxCell id="edge7" edge="1" parent="1" source="node_mongodb" target="node_dash" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#10B981;strokeWidth=2;" />

      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
```
