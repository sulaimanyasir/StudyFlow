import express from 'express';
import dotenv from 'dotenv';
import multer from 'multer';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

dotenv.config();

const app = express();
app.use(express.json());

// Setup multer for memory storage
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

// Allow requests from the Vite dev server
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent';

// Calls Gemini and returns parsed JSON. If schema is passed, forces structured JSON output.
async function callGemini(prompt, schema) {
  if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not set in .env');

  const generationConfig = schema
    ? { responseMimeType: 'application/json', responseSchema: schema }
    : {};

  const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig,
    }),
    signal: AbortSignal.timeout(20000),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini');

  return schema ? JSON.parse(text) : text;
}

// Wraps a route handler and forwards errors as JSON instead of crashing the server
const handler = (fn) => async (req, res) => {
  try {
    await fn(req, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// 1. Weekly Digest — natural-language summary + priorities from current semester data
app.post('/api/ai/weekly-digest', handler(async (req, res) => {
  const { courses = [], assignments = [], exams = [] } = req.body;

  const prompt = `You are a helpful academic assistant for a student. Given this data, write a short, friendly weekly digest (3-5 sentences) summarizing what's due, what's most urgent, and one practical suggestion for the week. Be direct and specific, mention course names and dates where relevant. Do not use markdown headers.

Courses: ${JSON.stringify(courses.map(c => ({ name: c.name, code: c.code })))}
Assignments: ${JSON.stringify(assignments)}
Exams: ${JSON.stringify(exams)}

Today's date: ${new Date().toISOString().split('T')[0]}`;

  const summary = await callGemini(prompt);
  res.json({ summary });
}));

// 2. Study Plan Generator — day-by-day plan for one assignment or exam
app.post('/api/ai/study-plan', handler(async (req, res) => {
  const { title, type, dueDate, estimatedHours, description } = req.body;

  const schema = {
    type: 'object',
    properties: {
      plan: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            day: { type: 'string' },
            task: { type: 'string' },
            hours: { type: 'number' },
          },
          required: ['day', 'task', 'hours'],
        },
      },
    },
    required: ['plan'],
  };

  const prompt = `Create a day-by-day study/work plan for this task, split into sensible daily chunks. Today's date is ${new Date().toISOString().split('T')[0]}.

Title: ${title}
Type: ${type}
Due date: ${dueDate}
Estimated total hours: ${estimatedHours}
Description: ${description || 'N/A'}

Return a realistic plan that fits between today and the due date. Each "day" field should be an actual date (YYYY-MM-DD).`;

  const result = await callGemini(prompt, schema);
  res.json(result);
}));

// 3. Natural Language Quick-Add — parses free text into a structured assignment or exam
app.post('/api/ai/quick-add', handler(async (req, res) => {
  const { text, courses = [] } = req.body;

  const schema = {
    type: 'object',
    properties: {
      kind: { type: 'string', enum: ['assignment', 'exam'] },
      title: { type: 'string' },
      courseId: { type: 'string' },
      dueDate: { type: 'string' },
      priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
      type: { type: 'string', enum: ['assignment', 'quiz', 'project', 'midterm', 'final', 'other'] },
      estimatedHours: { type: 'number' },
      time: { type: 'string' },
      room: { type: 'string' },
    },
    required: ['kind', 'title', 'dueDate'],
  };

  const prompt = `Parse this into a structured task. Decide if it's an "assignment" (homework/quiz/project with a due date) or an "exam" (has a specific time/room, is a test).

Text: "${text}"

Available courses (match by name or code if mentioned, else omit courseId): ${JSON.stringify(courses.map(c => ({ id: c.id, name: c.name, code: c.code })))}

Today's date: ${new Date().toISOString().split('T')[0]}. Resolve relative dates like "next Friday" into YYYY-MM-DD. If priority/hours aren't mentioned, make a reasonable guess.`;

  const result = await callGemini(prompt, schema);
  res.json(result);
}));

// 4. Flashcard Generator — practice Q&A from a topic or pasted notes
app.post('/api/ai/flashcards', handler(async (req, res) => {
  const { topic, notes, courseName, count = 8 } = req.body;

  const schema = {
    type: 'object',
    properties: {
      flashcards: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            question: { type: 'string' },
            answer: { type: 'string' },
          },
          required: ['question', 'answer'],
        },
      },
    },
    required: ['flashcards'],
  };

  const prompt = `Create ${count} exam-review flashcards (question + concise answer) for a student.

Course: ${courseName || 'N/A'}
Topic: ${topic || 'N/A'}
Notes to base the flashcards on: ${notes || 'N/A'}

Cover the most important, testable concepts. Keep answers short (1-2 sentences).`;

  const result = await callGemini(prompt, schema);
  res.json(result);
}));

// --- AI Workspace Endpoints ---

// Helper function to extract text from an uploaded file
async function extractTextFromFile(file) {
  if (!file) return '';
  const { originalname, buffer, mimetype } = file;
  
  if (mimetype === 'application/pdf' || originalname.endsWith('.pdf')) {
    const data = await pdfParse(buffer);
    return data.text;
  } else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || originalname.endsWith('.docx')) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } else if (mimetype.startsWith('text/') || originalname.endsWith('.txt') || originalname.endsWith('.md')) {
    return buffer.toString('utf-8');
  }
  
  throw new Error('Unsupported file type. Please upload a PDF, DOCX, or Text file.');
}

// 5. AI Study Chat — general conversational chat
app.post('/api/ai/chat', handler(async (req, res) => {
  const { message, context } = req.body;
  const prompt = `You are a helpful AI study tutor. Answer the student's question clearly and concisely.
  
Context about current studies:
${context || 'No specific context provided.'}

Student: ${message}`;
  
  const reply = await callGemini(prompt);
  res.json({ reply });
}));

// 6. Document Chat (RAG) — user uploads document and chats with it
app.post('/api/ai/document-chat', upload.single('file'), handler(async (req, res) => {
  const { message, previousContext } = req.body;
  let textContext = previousContext || '';
  
  if (req.file) {
    const fileText = await extractTextFromFile(req.file);
    textContext = `Document Content:\n${fileText.substring(0, 80000)}`; // Trim to avoid massive context blowups
  }

  const prompt = `You are a helpful AI study tutor analyzing a document. Answer the user's question based on the provided document content.
  
${textContext}

User Question: ${message}`;
  
  const reply = await callGemini(prompt);
  res.json({ reply, documentContext: textContext });
}));

// 7. Notes Summarizer
app.post('/api/ai/summarize', upload.single('file'), handler(async (req, res) => {
  if (!req.file) throw new Error('No file uploaded');
  
  const fileText = await extractTextFromFile(req.file);
  const prompt = `Summarize the following notes or document. Provide a structured summary with:
1. Main Title / Topic
2. Key Concepts (bullet points)
3. Brief Summary (1 paragraph)

Document Content:
${fileText.substring(0, 80000)}`;

  const summary = await callGemini(prompt);
  res.json({ summary });
}));

// 8. Quiz Generator
app.post('/api/ai/quiz', upload.single('file'), handler(async (req, res) => {
  const { topic, numQuestions = 5 } = req.body;
  let fileText = '';
  if (req.file) {
    fileText = await extractTextFromFile(req.file);
  }

  const schema = {
    type: 'object',
    properties: {
      title: { type: 'string' },
      questions: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            question: { type: 'string' },
            options: { type: 'array', items: { type: 'string' } },
            correctAnswerIndex: { type: 'number' },
            explanation: { type: 'string' },
          },
          required: ['question', 'options', 'correctAnswerIndex', 'explanation'],
        },
      },
    },
    required: ['title', 'questions'],
  };

  const prompt = `Generate a multiple-choice quiz with ${numQuestions} questions.
${topic ? `Topic: ${topic}` : ''}
${fileText ? `Based on this document: ${fileText.substring(0, 60000)}` : ''}

Ensure options are distinct and the correctAnswerIndex is 0-indexed.`;

  const result = await callGemini(prompt, schema);
  res.json(result);
}));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`StudyFlow AI backend running on http://localhost:${PORT}`));
