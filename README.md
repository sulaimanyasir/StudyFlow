# StudyFlow

<div align="center">
  <p><strong>Your Intelligent Academic Companion</strong></p>
  <p><i>Master your semester, track your GPA, and study smarter with built-in AI tools.</i></p>
</div>

---

## 🎯 What it Does & The Problem it Solves
**App Name:** StudyFlow

University students often juggle multiple courses, scattered deadlines, and complex grading rubrics while struggling to retain massive amounts of study material. Existing tools are either generic to-do lists, clunky academic portals, or disconnected AI chatbots. 

**StudyFlow** solves this by centralizing all academic tracking (courses, deadlines, exams, and GPA calculations) into a single, beautifully designed dashboard. Most importantly, it integrates a powerful **AI Workspace** directly into your study environment. It's built for college/university students who want to stay organized and leverage AI to study more efficiently without constantly switching between different apps.

## 🔗 Live Deployment
**[👉 Click here to view the LIVE APP](https://study-flow-psi-sooty.vercel.app/)** 

---

## ✨ Features

StudyFlow provides a complete suite of tools to manage your academic life:
- **Comprehensive Dashboard:** See an immediate overview of urgent deadlines, upcoming exams, and your current GPA in a stunning glassmorphism UI.
- **Course & Semester Management:** Organize your academic history term by term.
- **Task & Deadline Tracking:** Never miss a homework assignment or project deadline.
- **Interactive Study Plan:** Automatically distribute large study tasks across multiple days using AI.
- **GPA Simulator:** Calculate your current GPA and project future grades based on course credits.
- **Dark/Light Mode Themes:** Highly customizable visual themes with dynamic color accents.
- **Local-First Architecture:** Instant load times with robust local storage persistence.

### 🧠 The AI Workspace (Core Feature)
The **AI Workspace** transforms static study materials into interactive learning sessions. Instead of just tracking *what* to study, StudyFlow helps you actually study it.

**Included AI Tools:**
1. **AI Weekly Digest:** Automatically reads your current courses, assignments, and exams to generate a friendly, natural-language summary of your week's priorities.
2. **Notes Summarizer:** Upload a PDF, DOCX, or text file, and the AI will extract the text and generate a structured markdown summary (Main Title, Key Concepts, Brief Summary).
3. **Quiz Generator:** Provide a topic or upload your lecture notes to instantly generate an interactive multiple-choice quiz (complete with answer explanations) to test your knowledge.
4. **Document Chat (RAG):** Upload any document and chat directly with it. Ask the AI to find specific information or explain complex paragraphs from your uploaded course materials.
5. **AI Flashcards:** Automatically generate review flashcards based on your notes.
6. **Natural Language Quick-Add:** Type naturally (e.g., *"DBMS assignment due next Friday, high priority"*) and the AI will parse it into a structured task in your database.

#### 🤖 Under the Hood: System Prompts & Instructions
The backend utilizes highly specific prompts passed to the Google Gemini model. For example, when generating a quiz from a document, the system prompt is:
> *"Generate a multiple-choice quiz with X questions. Based on this document: [Extracted File Text]. Ensure options are distinct and the correctAnswerIndex is 0-indexed."*
(Coupled with a strict JSON schema enforcement to ensure the frontend receives a perfectly parsable interactive quiz).

For Document Chat, the context is dynamically injected:
> *"You are a helpful AI study tutor analyzing a document. Answer the user's question based on the provided document content. [Extracted File Text]. User Question: [Message]"*

---

## 🛠️ Tools, Services, & AI Models Used

**Frontend Ecosystem:**
- **React 19 & Vite:** For blazing fast rendering and development.
- **Tailwind CSS 4:** For the intricate, responsive glassmorphism design.
- **Motion (framer-motion):** For fluid layout transitions and interactive modal animations.
- **Lucide React:** For clean, modern iconography.
- **React Markdown:** To cleanly render structured AI responses.

**Backend & File Parsing:**
- **Express.js:** Lightweight server to proxy AI requests and handle file uploads safely.
- **Multer:** Handles multipart/form-data memory buffering for document uploads.
- **pdf-parse & mammoth:** Extracts raw text from uploaded PDFs and DOCX files.

**AI Integration:**
- **Google Gemini (gemini-3.5-flash):** Used as the core intelligence engine for its massive context window (perfect for reading full lecture documents) and incredibly fast response times. It's interacted with via the native REST API using strict JSON Schema enforcement.

---

## 📸 Screenshots

*(Replace these placeholder links with actual images by placing them in a `screenshots` folder!)*

1. **The Dashboard & Weekly Digest**  
   ![Dashboard Demo](./screenshots/dashboard.png)  
   *Overview of upcoming tasks with the AI-generated weekly digest.*

2. **The AI Workspace (Document Chat)**  
   ![AI Workspace](./screenshots/ai-workspace.png)  
   *Chatting directly with an uploaded PDF syllabus.*

3. **Tasks & Deadlines**  
   ![Tasks Manager](./screenshots/tasks.png)  
   *Managing course assignments, projects, and upcoming deadlines with the help of AI.*

4. **Study Plan Generator**  
   ![Study Plan Generator](./screenshots/study-plan.png)  
   *Generating a day-by-day study plan for a task.*

5. **AI Flashcards**  
   ![AI Flashcards](./screenshots/flashcards.png)  
   *Generating practice flashcards for a topic.*

6. **Natural Language Quick-Add**  
   ![Natural Language Quick-Add](./screenshots/quick-add.png)  
   *Adding a new task using natural language.*

---

## 🚀 How to Run the Project Locally

### Prerequisites
- Node.js (v18+ recommended)
- A Google Gemini API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd student-semester-planner
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory and add your Gemini API Key:
   ```env
   GEMINI_API_KEY=your_google_gemini_api_key_here
   ```

4. **Start the Application:**
   You need to run both the frontend UI and the backend AI proxy server.
   
   *In terminal 1 (Frontend):*
   ```bash
   npm run dev
   ```
   *In terminal 2 (Backend):*
   ```bash
   npm run server
   ```

5. **Open your browser:**
   Navigate to `http://localhost:3000` to start using StudyFlow!
