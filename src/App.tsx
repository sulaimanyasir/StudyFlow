import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, Layers, BookOpen, ClipboardList, 
  Clock, GraduationCap, AlertTriangle, Settings, 
  Menu, X, Compass, RefreshCw
} from 'lucide-react';

import { 
  StudyFlowData, Semester, Course, Assignment, Exam, AppSettings, 
  STORAGE_KEY, getSampleData 
} from './types';

// Views
import LandingView from './components/LandingView';
import DashboardView from './components/DashboardView';
import SemesterView from './components/SemesterView';
import CoursesView from './components/CoursesView';
import AssignmentsView from './components/AssignmentsView';
import TimetableView from './components/TimetableView';
import GpaCalculatorView from './components/GpaCalculatorView';
import ExamsView from './components/ExamsView';
import SettingsView from './components/SettingsView';

const ACCENT_PALETTES: Record<string, Record<string, string>> = {
  '#6366f1': { // Classic Indigo
    '300': '#818cf8',
    '400': '#818cf8',
    '500': '#6366f1',
    '600': '#4f46e5',
    '650': '#4338ca',
    '700': '#4338ca',
    '900': '#312e81',
  },
  '#10b981': { // Emerald Wave
    '300': '#6ee7b7',
    '400': '#34d399',
    '500': '#10b981',
    '600': '#059669',
    '650': '#047857',
    '700': '#047857',
    '900': '#064e3b',
  },
  '#06b6d4': { // Cyan Spark
    '300': '#67e8f9',
    '400': '#22d3ee',
    '500': '#06b6d4',
    '600': '#0891b2',
    '650': '#0e7490',
    '700': '#0e7490',
    '900': '#164e63',
  },
  '#a855f7': { // Purple Dream
    '300': '#d8b4fe',
    '400': '#c084fc',
    '500': '#a855f7',
    '600': '#9333ea',
    '650': '#7e22ce',
    '700': '#7e22ce',
    '900': '#581c87',
  },
  '#f43f5e': { // Rose Petal
    '300': '#fda4af',
    '400': '#fb7185',
    '500': '#f43f5e',
    '600': '#e11d48',
    '650': '#be123c',
    '700': '#be123c',
    '900': '#881337',
  },
  '#f97316': { // Orange Sunset
    '300': '#fdba74',
    '400': '#fb923c',
    '500': '#f97316',
    '600': '#ea580c',
    '650': '#c2410c',
    '700': '#c2410c',
    '900': '#7c2d12',
  },
};

export default function App() {
  const [data, setData] = useState<StudyFlowData | null>(null);
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  
  // Quick Action triggers from Dashboard to other Views
  const [quickActionTrigger, setQuickActionTrigger] = useState<string>('');

  // 1. Initial State Loading from Local Storage
  useEffect(() => {
    const localStore = localStorage.getItem(STORAGE_KEY);
    if (localStore) {
      try {
        const parsed = JSON.parse(localStore);
        setData(parsed);
        // If they have returned, they can skip landing, but we will start on landing for a complete fresh session,
        // or check if they prefer entering dashboard immediately.
        // Let's let them start on landing page but they can immediately enter.
      } catch (e) {
        // Fallback to sample data
        const sample = getSampleData();
        setData(sample);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sample));
      }
    } else {
      const sample = getSampleData();
      setData(sample);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sample));
    }
  }, []);

  // Update CSS custom properties for color theme when settings change
  useEffect(() => {
    if (data?.settings?.accentColor) {
      const hex = data.settings.accentColor;
      const palette = ACCENT_PALETTES[hex] || ACCENT_PALETTES['#6366f1'];
      
      Object.entries(palette).forEach(([shade, value]) => {
        document.documentElement.style.setProperty(`--accent-${shade}`, value);
      });
    }
  }, [data?.settings?.accentColor]);

  // Save changes to Local Storage
  const saveToLocalStorage = (updatedData: StudyFlowData) => {
    setData(updatedData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-[#070b19] flex items-center justify-center font-sans text-slate-300">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-xs font-mono tracking-widest uppercase">Initializing StudyFlow...</p>
        </div>
      </div>
    );
  }

  const { user, semesters, courses, assignments, exams, settings } = data;
  const currentSemester = semesters.find(s => s.id === user.currentSemesterId) || semesters[0] || null;

  // User handlers
  const handleUpdateUser = (updatedUser: any) => {
    const updated = {
      ...data,
      user: updatedUser
    };
    saveToLocalStorage(updated);
  };

  // --- CRUD OPERATORS ---

  // Semester handlers
  const handleSelectSemester = (id: string) => {
    const updated = {
      ...data,
      user: { ...user, currentSemesterId: id }
    };
    saveToLocalStorage(updated);
  };

  const handleCreateSemester = (name: string, startDate: string, endDate: string) => {
    const newSem: Semester = {
      id: `sem-${Date.now()}`,
      name,
      startDate,
      endDate,
      isCompleted: false,
    };
    const updated = {
      ...data,
      semesters: [...semesters, newSem],
      user: { ...user, currentSemesterId: newSem.id } // switch to newly created term
    };
    saveToLocalStorage(updated);
  };

  const handleUpdateSemester = (id: string, name: string, startDate: string, endDate: string, isCompleted: boolean) => {
    const updatedSemesters = semesters.map(s => 
      s.id === id ? { ...s, name, startDate, endDate, isCompleted } : s
    );
    const updated = {
      ...data,
      semesters: updatedSemesters
    };
    saveToLocalStorage(updated);
  };

  const handleDeleteSemester = (id: string) => {
    const updatedSemesters = semesters.filter(s => s.id !== id);
    // Find next available semester id
    const fallbackId = updatedSemesters[0]?.id || '';
    
    // Cascading delete courses, assignments, exams
    const updatedCourses = courses.filter(c => c.semesterId !== id);
    const updatedAssignments = assignments.filter(a => a.semesterId !== id);
    const updatedExams = exams.filter(e => e.semesterId !== id);

    const updated = {
      ...data,
      semesters: updatedSemesters,
      courses: updatedCourses,
      assignments: updatedAssignments,
      exams: updatedExams,
      user: { ...user, currentSemesterId: fallbackId }
    };
    saveToLocalStorage(updated);
  };

  // Course Handlers
  const handleCreateCourse = (courseSpecs: Omit<Course, 'id' | 'semesterId'>) => {
    const newCourse: Course = {
      ...courseSpecs,
      id: `course-${Date.now()}`,
      semesterId: user.currentSemesterId,
    };
    const updated = {
      ...data,
      courses: [...courses, newCourse]
    };
    saveToLocalStorage(updated);
  };

  const handleUpdateCourse = (updatedCourse: Course) => {
    const updatedCourses = courses.map(c => c.id === updatedCourse.id ? updatedCourse : c);
    const updated = {
      ...data,
      courses: updatedCourses
    };
    saveToLocalStorage(updated);
  };

  const handleDeleteCourse = (courseId: string) => {
    const updatedCourses = courses.filter(c => c.id !== courseId);
    // Cascade delete associated assignments & exams
    const updatedAssignments = assignments.filter(a => a.courseId !== courseId);
    const updatedExams = exams.filter(e => e.courseId !== courseId);

    const updated = {
      ...data,
      courses: updatedCourses,
      assignments: updatedAssignments,
      exams: updatedExams,
    };
    saveToLocalStorage(updated);
  };

  // Assignment Handlers
  const handleCreateAssignment = (asgSpecs: Omit<Assignment, 'id' | 'semesterId' | 'createdDate'>) => {
    const newAsg: Assignment = {
      ...asgSpecs,
      id: `asg-${Date.now()}`,
      semesterId: user.currentSemesterId,
      createdDate: new Date().toISOString().split('T')[0]
    };
    const updated = {
      ...data,
      assignments: [...assignments, newAsg]
    };
    saveToLocalStorage(updated);
  };

  const handleUpdateAssignment = (updatedAsg: Assignment) => {
    const updatedAssignments = assignments.map(a => a.id === updatedAsg.id ? updatedAsg : a);
    const updated = {
      ...data,
      assignments: updatedAssignments
    };
    saveToLocalStorage(updated);
  };

  const handleDeleteAssignment = (asgId: string) => {
    const updatedAssignments = assignments.filter(a => a.id !== asgId);
    const updated = {
      ...data,
      assignments: updatedAssignments
    };
    saveToLocalStorage(updated);
  };

  // Exam Handlers
  const handleCreateExam = (examSpecs: Omit<Exam, 'id' | 'semesterId'>) => {
    const newExam: Exam = {
      ...examSpecs,
      id: `exam-${Date.now()}`,
      semesterId: user.currentSemesterId,
    };
    const updated = {
      ...data,
      exams: [...exams, newExam]
    };
    saveToLocalStorage(updated);
  };

  const handleUpdateExam = (updatedExam: Exam) => {
    const updatedExams = exams.map(e => e.id === updatedExam.id ? updatedExam : e);
    const updated = {
      ...data,
      exams: updatedExams
    };
    saveToLocalStorage(updated);
  };

  const handleDeleteExam = (examId: string) => {
    const updatedExams = exams.filter(e => e.id !== examId);
    const updated = {
      ...data,
      exams: updatedExams
    };
    saveToLocalStorage(updated);
  };

  const handleToggleAssignmentById = (id: string) => {
    const asg = assignments.find(a => a.id === id);
    if (!asg) return;
    handleUpdateAssignment({
      ...asg,
      status: asg.status === 'completed' ? 'pending' : 'completed'
    });
  };

  const handleToggleExamById = (id: string) => {
    const exam = exams.find(e => e.id === id);
    if (!exam) return;
    handleUpdateExam({
      ...exam,
      completed: !exam.completed
    });
  };

  // Settings Handlers
  const handleUpdateSettings = (updatedSettings: AppSettings) => {
    const updated = {
      ...data,
      settings: updatedSettings
    };
    saveToLocalStorage(updated);
  };

  // Restore/Wipe database
  const handleImportData = (imported: StudyFlowData) => {
    saveToLocalStorage(imported);
  };

  const handleResetData = () => {
    const defaults = getSampleData();
    saveToLocalStorage(defaults);
    setActiveTab('dashboard');
  };

  // Quick Action trigger routing from dashboard
  const handleQuickAction = (action: string) => {
    if (action === 'add-course') {
      setQuickActionTrigger('add-course');
      setActiveTab('courses');
    } else if (action === 'add-assignment') {
      setQuickActionTrigger('add-assignment');
      setActiveTab('assignments');
    } else if (action === 'add-exam') {
      setQuickActionTrigger('add-exam');
      setActiveTab('exams');
    }
  };

  const handleClearQuickActionTrigger = () => {
    setQuickActionTrigger('');
  };

  // Helper navigation action
  const handleTabChange = (tab: string, userName?: string, department?: string) => {
    if (userName && tab === 'dashboard') {
        const updatedUser = { ...user, name: userName };
        if (department !== undefined) {
          updatedUser.department = department;
        }
        handleUpdateUser(updatedUser);
    }
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  // Nav definitions
  const navigationItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'semester', name: 'Semester Hub', icon: Layers },
    { id: 'courses', name: 'Courses Registry', icon: BookOpen },
    { id: 'assignments', name: 'Tasks', icon: ClipboardList },
    { id: 'timetable', name: 'Weekly Timetable', icon: Clock },
    { id: 'gpa', name: 'GPA Calculator', icon: GraduationCap },
    { id: 'exams', name: 'Exams Vault', icon: AlertTriangle },
    { id: 'settings', name: 'System Settings', icon: Settings },
  ];

  const getActiveView = () => {
    switch (activeTab) {
      case 'landing':
        return <LandingView onGetStarted={(name, dept) => handleTabChange('dashboard', name, dept)} hasData={user.name !== 'Guest User'} />;
      case 'dashboard':
        return (
          <DashboardView
            user={user}
            semester={currentSemester}
            courses={courses}
            assignments={assignments}
            exams={exams}
            onNavigate={handleTabChange}
            onQuickAction={handleQuickAction}
            onToggleAssignment={handleToggleAssignmentById}
            onToggleExam={handleToggleExamById}
          />
        );
      case 'semester':
        return (
          <SemesterView
            user={user}
            semesters={semesters}
            courses={courses}
            assignments={assignments}
            exams={exams}
            onSelectSemester={handleSelectSemester}
            onCreateSemester={handleCreateSemester}
            onUpdateSemester={handleUpdateSemester}
            onDeleteSemester={handleDeleteSemester}
          />
        );
      case 'courses':
        return (
          <CoursesView
            currentSemester={currentSemester}
            courses={courses}
            onCreateCourse={handleCreateCourse}
            onUpdateCourse={handleUpdateCourse}
            onDeleteCourse={handleDeleteCourse}
            onQuickActionTrigger={quickActionTrigger}
            onClearQuickActionTrigger={handleClearQuickActionTrigger}
          />
        );
      case 'assignments':
        return (
          <AssignmentsView
            currentSemester={currentSemester}
            courses={courses}
            assignments={assignments}
            onCreateAssignment={handleCreateAssignment}
            onUpdateAssignment={handleUpdateAssignment}
            onDeleteAssignment={handleDeleteAssignment}
            onQuickActionTrigger={quickActionTrigger}
            onClearQuickActionTrigger={handleClearQuickActionTrigger}
          />
        );
      case 'timetable':
        return (
          <TimetableView
            currentSemester={currentSemester}
            courses={courses}
            onNavigate={handleTabChange}
          />
        );
      case 'gpa':
        return (
          <GpaCalculatorView
            currentSemester={currentSemester}
            courses={courses}
          />
        );
      case 'exams':
        return (
          <ExamsView
            currentSemester={currentSemester}
            courses={courses}
            exams={exams}
            onCreateExam={handleCreateExam}
            onUpdateExam={handleUpdateExam}
            onDeleteExam={handleDeleteExam}
            onQuickActionTrigger={quickActionTrigger}
            onClearQuickActionTrigger={handleClearQuickActionTrigger}
          />
        );
      case 'settings':
        return (
          <SettingsView
            settings={settings}
            data={data}
            user={user}
            onUpdateSettings={handleUpdateSettings}
            onImportData={handleImportData}
            onResetData={handleResetData}
            onUpdateUser={handleUpdateUser}
          />
        );
      default:
        return <LandingView onGetStarted={(name, dept) => handleTabChange('dashboard', name, dept)} hasData={user.name !== 'Guest User'} />;
    }
  };

  return (
    <div className={`min-h-screen ${settings.theme === 'light' ? 'light-theme bg-[#f4f6fa]' : 'bg-[#090e1a]'} text-slate-200 relative overflow-x-hidden font-sans selection:bg-indigo-500/30 selection:text-white`}>
      {/* Dynamic Animated Glassmorphism Background Spheres*/}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Pulsing ball 1 */}
        <div 
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-indigo-600/10 blur-[120px]"
        />

        {/* Pulsing ball 2 */}
        <div 
          className="absolute top-1/3 -right-32 w-[450px] h-[450px] rounded-full bg-purple-600/10 blur-[130px]"
        />

        {/* Pulsing ball 3 */}
        <div 
          className="absolute bottom-10 left-1/4 w-80 h-80 rounded-full bg-cyan-500/5 blur-[100px]"
        />
        
        {/* Subtitle subtle noise texture */}
        <div className="absolute inset-0 opacity-[0.015] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
      </div>

      {activeTab === 'landing' ? (
        /* Render standalone elegant Landing view */
        <div className="relative z-10">
          {/* Header navigation for Landing Page only */}
          <header className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center relative z-20">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <Compass className="w-5 h-5 text-white animate-spin-slow" />
              </div>
              <span className="text-xl font-bold text-white font-sans tracking-tight">StudyFlow</span>
            </div>
            <button
              onClick={() => setActiveTab('dashboard')}
              id="btn-nav-to-planner"
              className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-xs font-semibold uppercase tracking-widest font-mono transition-all"
            >
              Open Planner Workspace
            </button>
          </header>

          <AnimatePresence mode="wait">
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {getActiveView()}
            </motion.div>
          </AnimatePresence>
        </div>
      ) : (
        /* Render complete multi-panel planner platform */
        <div className="relative z-10 flex h-screen overflow-hidden">
          
          {/* 1. Sidebar Panel (Fixed on desktop, sliding on mobile overlays) */}
          <aside className={`w-64 border-r border-white/10 bg-[#0c1224]/75 backdrop-blur-2xl shrink-0 p-6 flex flex-col justify-between transition-all duration-300 z-50 fixed md:relative top-0 h-full overflow-y-auto scrollbar-none ${
            mobileMenuOpen 
              ? 'left-0 shadow-2xl shadow-black/80' 
              : '-left-64 md:left-0'
          }`}>
            
            <div className="space-y-8">
              {/* Logo Brand Header */}
              <div className="flex items-center justify-between">
                <div 
                  onClick={() => handleTabChange('landing')}
                  className="flex items-center gap-2.5 cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
                    <Compass className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="text-lg font-bold text-white font-sans tracking-tight block">StudyFlow</span>
                    <span className="text-[10px] text-indigo-300 tracking-wider font-mono uppercase block -mt-1">MVP Plan</span>
                  </div>
                </div>

                {/* Close sidebar button (Mobile overlay only) */}
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="md:hidden p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Active Current Semester context display */}
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[9px] text-slate-500 uppercase tracking-widest font-mono block">ACTIVE TERM</span>
                  <span className="font-semibold text-slate-200 block truncate max-w-[120px]">
                    {currentSemester?.name || 'Create Term'}
                  </span>
                </div>
                <button 
                  onClick={() => handleTabChange('semester')}
                  className="text-[10px] text-indigo-400 hover:text-indigo-300 font-mono"
                >
                  Switch
                </button>
              </div>

              {/* Navigation lists */}
              <nav className="space-y-1.5">
                {navigationItems.map(item => {
                  const IconComponent = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabChange(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                        isActive 
                          ? 'bg-gradient-to-r from-indigo-500/15 to-purple-500/5 border border-indigo-500/30 text-indigo-300 shadow-md shadow-indigo-500/5 font-semibold' 
                          : 'text-slate-400 hover:text-white hover:bg-white/[0.02]'
                      }`}
                    >
                      <IconComponent className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Profile User block at bottom of sidebar */}
            <div className="pt-6 border-t border-white/5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 font-mono font-bold text-sm">
                {user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'GU'}
              </div>
              <div className="flex-grow min-w-0">
                <div className="text-sm font-bold text-white truncate">{user.name.split(' ')[0]}</div>
                {user.department && <div className="text-[10px] text-slate-400 truncate">{user.department}</div>}
              </div>
            </div>

          </aside>

          {/* 2. Main content viewport area */}
          <div className="flex-grow flex flex-col min-w-0 h-full overflow-y-auto">
            
            {/* Mobile Top Navigation bar */}
            <header className="md:hidden border-b border-white/10 bg-[#090e1a]/85 backdrop-blur-md px-4 py-3 flex items-center justify-between sticky top-0 z-40">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="p-1.5 rounded-xl bg-white/5 text-slate-300 hover:text-white"
                >
                  <Menu className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                    <Compass className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-base font-bold text-white font-sans tracking-tight">StudyFlow</span>
                </div>
              </div>

              {/* Floating workspace name tag */}
              <div className="px-3 py-1 rounded-xl bg-white/5 border border-white/5 text-[10px] font-mono text-indigo-300">
                {currentSemester?.name || 'StudyFlow'}
              </div>
            </header>

            {/* Main Stage panel workspace */}
            <main className="flex-grow px-4 py-8 md:p-8 lg:p-12 max-w-7xl mx-auto w-full relative z-10 overflow-y-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                >
                  {getActiveView()}
                </motion.div>
              </AnimatePresence>
            </main>

          </div>

          {/* Backdrop blur clickoff filter for Mobile overlay sidebar */}
          {mobileMenuOpen && (
            <div 
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-45"
            />
          )}

        </div>
      )}
    </div>
  );
}
