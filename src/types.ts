export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type AssignmentStatus = 'pending' | 'in_progress' | 'completed' | 'late';
export type ExamType = 'midterm' | 'final' | 'quiz' | 'project' | 'other';

export interface User {
  name: string;
  department?: string;
  avatar?: string;
  currentSemesterId: string;
}

export interface Semester {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCompleted: boolean;
}

export interface CourseSchedule {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  startTime: string; // HH:MM
  endTime: string; // HH:MM
}

export interface Course {
  id: string;
  semesterId: string;
  name: string;
  code: string;
  instructor: string;
  credits: number;
  room: string;
  color: string; // hex color or Tailwind color class prefix
  schedules: CourseSchedule[];
  attendance: {
    present: number;
    absent: number;
    late: number;
  };
  notes?: string;
}

export type AssignmentType = 'assignment' | 'quiz' | 'project';

export interface Assignment {
  id: string;
  semesterId: string;
  courseId: string;
  title: string;
  description: string;
  dueDate: string; // YYYY-MM-DD
  priority: Priority;
  status: AssignmentStatus;
  type: AssignmentType;
  estimatedHours: number;
  createdDate: string;
}

export interface Exam {
  id: string;
  semesterId: string;
  courseId: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  room: string;
  type: ExamType;
  notes?: string;
  completed: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'danger';
  timestamp: string;
}

export interface AppSettings {
  accentColor: string; // e.g. '#6366f1' or 'indigo'
  theme: 'dark' | 'light';
}

export interface StudyFlowData {
  user: User;
  semesters: Semester[];
  courses: Course[];
  assignments: Assignment[];
  exams: Exam[];
  settings: AppSettings;
}

// Key for local storage
export const STORAGE_KEY = 'studyflow_data_v2';

// Color palette options for courses
export const COURSE_COLORS = [
  { name: 'Indigo Glow', hex: '#6366f1', text: 'text-indigo-400', bg: 'bg-indigo-500/15', border: 'border-indigo-500/30' },
  { name: 'Emerald Wave', hex: '#10b981', text: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30' },
  { name: 'Sunset Orange', hex: '#f97316', text: 'text-orange-400', bg: 'bg-orange-500/15', border: 'border-orange-500/30' },
  { name: 'Cyan Spark', hex: '#06b6d4', text: 'text-cyan-400', bg: 'bg-cyan-500/15', border: 'border-cyan-500/30' },
  { name: 'Rose Petal', hex: '#f43f5e', text: 'text-rose-400', bg: 'bg-rose-500/15', border: 'border-rose-500/30' },
  { name: 'Amethyst Violet', hex: '#a855f7', text: 'text-purple-400', bg: 'bg-purple-500/15', border: 'border-purple-500/30' },
  { name: 'Amber Sun', hex: '#f59e0b', text: 'text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/30' },
];

export const GRADE_POINTS: Record<string, number> = {
  'A': 4.0,
  'A-': 3.7,
  'B+': 3.3,
  'B': 3.0,
  'B-': 2.7,
  'C+': 2.3,
  'C': 2.0,
  'D': 1.0,
  'F': 0.0,
};

// Generates high-quality sample data
export const getSampleData = (): StudyFlowData => {
  const currentYear = new Date().getFullYear();
  
  return {
    user: {
      name: 'Guest User',
      department: '',
      avatar: '',
      currentSemesterId: 'sem-1',
    },
    semesters: [
      {
        id: 'sem-1',
        name: 'Fall ' + currentYear,
        startDate: `${currentYear}-09-01`,
        endDate: `${currentYear}-12-20`,
        isCompleted: false,
      }
    ],
    courses: [
      {
        id: 'course-1',
        semesterId: 'sem-1',
        name: 'Introduction to Computer Science',
        code: 'CS-101',
        instructor: 'Dr. Jane Smith',
        credits: 3,
        room: 'Science Building 101',
        color: '#6366f1', // Indigo Glow
        schedules: [
          { id: 'sch-1-1', day: 'Monday', startTime: '10:00', endTime: '11:30' },
          { id: 'sch-1-2', day: 'Wednesday', startTime: '10:00', endTime: '11:30' }
        ],
        attendance: { present: 0, absent: 0, late: 0 },
        notes: 'Introductory course covering basics of programming and algorithms.'
      }
    ],
    assignments: [
      {
        id: 'asg-1',
        semesterId: 'sem-1',
        courseId: 'course-1',
        title: 'First Programming Assignment',
        description: 'Write a simple program to calculate the Fibonacci sequence.',
        dueDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0], // 7 days from now
        priority: 'high',
        status: 'pending',
        type: 'assignment',
        estimatedHours: 4,
        createdDate: new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0]
      }
    ],
    exams: [
      {
        id: 'exam-1',
        semesterId: 'sem-1',
        courseId: 'course-1',
        title: 'Midterm Exam',
        date: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0], // 14 days from now
        time: '10:00',
        room: 'Science Building 101',
        type: 'midterm',
        notes: 'Covers the first half of the semester.',
        completed: false
      }
    ],
    settings: {
      accentColor: '#6366f1',
      theme: 'dark'
    }
  };
};
