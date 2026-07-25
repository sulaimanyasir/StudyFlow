import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  BookOpen, Calendar, Clock, Award, Percent, CheckCircle2, 
  ArrowRight, Plus, MapPin, User, AlertTriangle, AlertCircle, CheckCircle, Settings
} from 'lucide-react';
import { Course, Assignment, Exam, Semester, Priority } from '../types';
import AiWeeklyDigest from './ui/AiWeeklyDigest';

interface DashboardViewProps {
  user: { name: string; currentSemesterId: string };
  semester: Semester | null;
  courses: Course[];
  assignments: Assignment[];
  exams: Exam[];
  onNavigate: (tab: string) => void;
  onQuickAction: (action: string) => void;
  onToggleAssignment: (id: string) => void;
  onToggleExam: (id: string) => void;
}

export default function DashboardView({
  user,
  semester,
  courses,
  assignments,
  exams,
  onNavigate,
  onQuickAction,
  onToggleAssignment,
  onToggleExam,
}: DashboardViewProps) {
  const [greeting, setGreeting] = useState('Welcome');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Dynamic greeting based on time of day
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now);
      const hours = now.getHours();
      if (hours < 12) setGreeting('Good Morning');
      else if (hours < 18) setGreeting('Good Afternoon');
      else if (hours < 22) setGreeting('Good Evening');
      else setGreeting('Good Night');
    };

    updateTime();
    const interval = setInterval(updateTime, 10000); // update greeting/clock periodically
    return () => clearInterval(interval);
  }, []);

  const currentSemesterId = user.currentSemesterId;
  const semCourses = courses.filter(c => c.semesterId === currentSemesterId);
  const semAssignments = assignments.filter(a => a.semesterId === currentSemesterId);
  const semExams = exams.filter(e => e.semesterId === currentSemesterId);

  // Stats Calculations
  const pendingAssignments = semAssignments.filter(a => a.status !== 'completed');
  const completedAssignmentsCount = semAssignments.filter(a => a.status === 'completed').length;
  
  // Today's classes calculations
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
  const currentDay = daysOfWeek[currentTime.getDay()];
  
  const todaysClasses = semCourses.flatMap(course => 
    course.schedules
      .filter(s => s.day === currentDay)
      .map(s => ({ ...s, course }))
  ).sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Upcoming Exams
  const upcomingExams = semExams
    .filter(e => !e.completed && new Date(e.date) >= new Date(new Date().setHours(0,0,0,0)))
    .sort((a, b) => a.date.localeCompare(b.date));

  // GPA calculation
  const [gpaData, setGpaData] = useState<{ gpa: number; totalCredits: number }>({ gpa: 3.82, totalCredits: 14 });

  useEffect(() => {
    const savedGrades = localStorage.getItem(`studyflow_gpa_${currentSemesterId}`);
    if (savedGrades) {
      try {
        const parsed = JSON.parse(savedGrades);
        setGpaData({ gpa: parsed.gpa, totalCredits: parsed.totalCredits });
      } catch (e) {
        // use default fallback
      }
    } else {
      const currentSemCourses = courses.filter(c => c.semesterId === currentSemesterId);
      setGpaData({ gpa: 3.75, totalCredits: currentSemCourses.reduce((acc, c) => acc + c.credits, 0) });
    }
  }, [currentSemesterId, courses]);

  // Attendance Statistics
  const totalClassesAttended = semCourses.reduce((acc, c) => acc + c.attendance.present, 0);
  const totalClassesLate = semCourses.reduce((acc, c) => acc + c.attendance.late, 0);
  const totalClassesAbsent = semCourses.reduce((acc, c) => acc + c.attendance.absent, 0);
  const totalSessions = totalClassesAttended + totalClassesLate + totalClassesAbsent;
  const attendancePercentage = totalSessions > 0 
    ? Math.round(((totalClassesAttended + totalClassesLate) / totalSessions) * 100) 
    : 100;

  // Notification generation
  const activeNotifications: { id: string; title: string; message: string; type: 'warning' | 'danger' | 'info' }[] = [];
  
  semCourses.forEach(c => {
    const sessions = c.attendance.present + c.attendance.late + c.attendance.absent;
    const pct = sessions > 0 ? (c.attendance.present + c.attendance.late) / sessions : 1;
    if (pct < 0.85 && sessions > 0) {
      activeNotifications.push({
        id: `att-warn-${c.id}`,
        title: 'Attendance Alert',
        message: `${c.code}: Attendance drops below 85% (${Math.round(pct * 100)}%).`,
        type: 'danger',
      });
    }
  });

  pendingAssignments.forEach(a => {
    const dueDate = new Date(a.dueDate);
    const diffTime = dueDate.getTime() - new Date().setHours(0,0,0,0);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const course = courses.find(c => c.id === a.courseId);
    if (diffDays === 1) {
      activeNotifications.push({
        id: `asg-due-${a.id}`,
        title: 'Deadline Approaching',
        message: `"${a.title}" for ${course?.code || 'Course'} is due tomorrow!`,
        type: 'warning',
      });
    } else if (diffDays === 0) {
      activeNotifications.push({
        id: `asg-due-${a.id}`,
        title: 'Due Today',
        message: `"${a.title}" is due today. Complete it as soon as possible.`,
        type: 'danger',
      });
    }
  });

  upcomingExams.slice(0, 1).forEach(e => {
    const examDate = new Date(e.date);
    const diffTime = examDate.getTime() - new Date().setHours(0,0,0,0);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 2 && diffDays > 0) {
      activeNotifications.push({
        id: `exam-near-${e.id}`,
        title: 'Upcoming Exam',
        message: `"${e.title}" is in ${diffDays} days! Revise your topics.`,
        type: 'warning',
      });
    }
  });

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'urgent': return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'low': return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
    }
  };

  const getDaysCountStr = (dateStr: string) => {
    const target = new Date(dateStr);
    const diffTime = target.getTime() - new Date().setHours(0,0,0,0);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
    return `In ${diffDays} days`;
  };

  const parseHour = (t: string) => {
    if (!t) return '';
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedH = h % 12 || 12;
    return `${formattedH}:${m.toString().padStart(2, '0')} ${ampm}`;
  };

  const formatTimeSlot = (start: string, end: string) => {
    return `${parseHour(start)} - ${parseHour(end)}`;
  };

  return (
    <div className="space-y-8 pb-12">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/[0.03] border border-white/5 p-6 rounded-3xl backdrop-blur-md relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 pointer-events-none" />
        <div className="relative z-10 space-y-1">
          <h2 className="text-sm uppercase tracking-wider text-slate-400 font-mono font-medium">
            {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </h2>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            {greeting}, {user.name.split(' ')[0]}
          </h1>
          <p className="text-slate-300 font-light text-sm sm:text-base">
            {todaysClasses.length > 0 
              ? `You have ${todaysClasses.length} class${todaysClasses.length > 1 ? 'es' : ''} scheduled for today. Ready to crush your goals?`
              : "No classes scheduled for today! It's a perfect time to focus on your assignments."}
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 px-5 py-2.5 rounded-2xl backdrop-blur-xl flex flex-col items-center justify-center font-mono">
          <span className="text-2xl font-bold text-cyan-400">
            {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
          <span className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">Local Live Time</span>
        </div>
      </motion.div>

      <AiWeeklyDigest courses={courses} assignments={assignments} exams={exams} />

      {activeNotifications.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-rose-500/[0.03] border border-rose-500/20 p-5 rounded-3xl backdrop-blur-md space-y-3"
        >
          <div className="flex items-center gap-2 text-rose-400 font-medium text-sm">
            <AlertCircle className="w-5 h-5" />
            <span>Reminders & Alerts ({activeNotifications.length})</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeNotifications.map(n => (
              <div 
                key={n.id}
                className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/40 border border-white/5 text-xs text-slate-300 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 bottom-0 w-1 bg-rose-500" />
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-semibold text-white">{n.title}</div>
                  <div>{n.message}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <motion.div 
          whileHover={{ y: -3 }}
          onClick={() => onNavigate('assignments')}
          className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md cursor-pointer hover:bg-white/[0.06] transition-colors flex flex-col justify-between h-36"
        >
          <div className="flex items-center justify-between text-indigo-400">
            <BookOpen className="w-5 h-5" />
            <span className="text-[10px] font-mono bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">Pending</span>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-white tracking-tight font-mono">{pendingAssignments.length}</div>
            <div className="text-xs text-slate-400 font-light mt-1">Pending Tasks</div>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -3 }}
          onClick={() => onNavigate('timetable')}
          className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md cursor-pointer hover:bg-white/[0.06] transition-colors flex flex-col justify-between h-36"
        >
          <div className="flex items-center justify-between text-cyan-400">
            <Calendar className="w-5 h-5" />
            <span className="text-[10px] font-mono bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">Today</span>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-white tracking-tight font-mono">{todaysClasses.length}</div>
            <div className="text-xs text-slate-400 font-light mt-1">Today's Lectures</div>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -3 }}
          onClick={() => onNavigate('exams')}
          className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md cursor-pointer hover:bg-white/[0.06] transition-colors flex flex-col justify-between h-36"
        >
          <div className="flex items-center justify-between text-purple-400">
            <Clock className="w-5 h-5" />
            <span className="text-[10px] font-mono bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">Exams</span>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-white tracking-tight font-mono">{upcomingExams.length}</div>
            <div className="text-xs text-slate-400 font-light mt-1">Upcoming Exams</div>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -3 }}
          onClick={() => onNavigate('gpa')}
          className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md cursor-pointer hover:bg-white/[0.06] transition-colors flex flex-col justify-between h-36"
        >
          <div className="flex items-center justify-between text-emerald-400">
            <Award className="w-5 h-5" />
            <span className="text-[10px] font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">GPA</span>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-white tracking-tight font-mono">{gpaData.gpa.toFixed(2)}</div>
            <div className="text-xs text-slate-400 font-light mt-1">Semester GPA</div>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -3 }}
          onClick={() => onNavigate('courses')}
          className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md cursor-pointer hover:bg-white/[0.06] transition-colors flex flex-col justify-between h-36"
        >
          <div className="flex items-center justify-between text-rose-400">
            <Percent className="w-5 h-5" />
            <span className="text-[10px] font-mono bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">Attendance</span>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-white tracking-tight font-mono">{attendancePercentage}%</div>
            <div className="text-xs text-slate-400 font-light mt-1">Attendance Rate</div>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -3 }}
          onClick={() => onNavigate('assignments')}
          className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md cursor-pointer hover:bg-white/[0.06] transition-colors flex flex-col justify-between h-36"
        >
          <div className="flex items-center justify-between text-cyan-300">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-[10px] font-mono bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">Done</span>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-white tracking-tight font-mono">{completedAssignmentsCount}</div>
            <div className="text-xs text-slate-400 font-light mt-1">Completed Tasks</div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-white/[0.03] border border-white/10 p-6 rounded-3xl backdrop-blur-md space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Today's Class Schedule</h3>
                <p className="text-xs text-slate-400 font-light">Interactive outline of {currentDay} classes</p>
              </div>
              <button 
                onClick={() => onNavigate('timetable')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1.5 transition-colors group"
              >
                <span>Full Timetable</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            <div className="space-y-4">
              {todaysClasses.length > 0 ? (
                todaysClasses.map((sched) => {
                  const course = sched.course;
                  const [startH, startM] = sched.startTime.split(':').map(Number);
                  const [endH, endM] = sched.endTime.split(':').map(Number);
                  const now = currentTime;
                  const currentMinutes = now.getHours() * 60 + now.getMinutes();
                  const startMinutes = startH * 60 + startM;
                  const endMinutes = endH * 60 + endM;

                  let timeStatus = 'upcoming';
                  if (now.getDay() === currentTime.getDay()) {
                    if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
                      timeStatus = 'active';
                    } else if (currentMinutes > endMinutes) {
                      timeStatus = 'completed';
                    }
                  }

                  return (
                    <div 
                      key={sched.id}
                      className="flex gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors relative group"
                    >
                      <div className="w-1 rounded-full shrink-0" style={{ backgroundColor: course.color }} />
                      <div className="flex-grow space-y-1">
                        <div className="flex justify-between items-start gap-2">
                          <span className="font-semibold text-white text-sm sm:text-base group-hover:text-indigo-300 transition-colors">
                            {course.name}
                          </span>
                          <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            timeStatus === 'active' 
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                              : timeStatus === 'completed'
                                ? 'bg-slate-500/20 text-slate-400 border border-white/5'
                                : 'bg-indigo-500/10 text-indigo-300 border border-white/5'
                          }`}>
                            {timeStatus === 'active' ? '● Live Now' : timeStatus === 'completed' ? 'Finished' : 'Upcoming'}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap gap-y-1.5 gap-x-4 text-xs text-slate-300 font-light">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{formatTimeSlot(sched.startTime, sched.endTime)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{course.room}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span>{course.instructor}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-slate-400 font-light border border-dashed border-white/10 rounded-2xl p-6 bg-slate-900/10">
                  <Calendar className="w-10 h-10 text-slate-500 mx-auto mb-2.5 stroke-[1.5]" />
                  <p className="text-sm font-semibold text-white">No classes scheduled for today</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    Enjoy your day off or work on your high-priority projects below.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white/[0.03] border border-white/10 p-6 rounded-3xl backdrop-blur-md space-y-4">
            <h3 className="text-lg font-bold text-white">Quick Actions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <button 
                onClick={() => onQuickAction('add-course')}
                className="p-3.5 rounded-xl bg-white/[0.02] hover:bg-indigo-600/15 border border-white/10 hover:border-indigo-500/40 text-center flex flex-col items-center justify-center gap-2 group transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/25 transition-colors">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="text-xs text-slate-200 group-hover:text-indigo-300 font-medium">Add Course</span>
              </button>

              <button 
                onClick={() => onQuickAction('add-assignment')}
                className="p-3.5 rounded-xl bg-white/[0.02] hover:bg-indigo-600/15 border border-white/10 hover:border-indigo-500/40 text-center flex flex-col items-center justify-center gap-2 group transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/25 transition-colors">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="text-xs text-slate-200 group-hover:text-indigo-300 font-medium">Add Homework</span>
              </button>

              <button 
                onClick={() => onQuickAction('add-exam')}
                className="p-3.5 rounded-xl bg-white/[0.02] hover:bg-indigo-600/15 border border-white/10 hover:border-indigo-500/40 text-center flex flex-col items-center justify-center gap-2 group transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/25 transition-colors">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="text-xs text-slate-200 group-hover:text-indigo-300 font-medium">Add Exam</span>
              </button>

              <button 
                onClick={() => onNavigate('gpa')}
                className="p-3.5 rounded-xl bg-white/[0.02] hover:bg-indigo-600/15 border border-white/10 hover:border-indigo-500/40 text-center flex flex-col items-center justify-center gap-2 group transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/25 transition-colors">
                  <Award className="w-5 h-5" />
                </div>
                <span className="text-xs text-slate-200 group-hover:text-indigo-300 font-medium">GPA Calc</span>
              </button>

              <button 
                onClick={() => onNavigate('settings')}
                className="p-3.5 rounded-xl bg-white/[0.02] hover:bg-indigo-600/15 border border-white/10 hover:border-indigo-500/40 text-center flex flex-col items-center justify-center gap-2 group transition-all col-span-2 sm:col-span-1"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/25 transition-colors">
                  <Settings className="w-5 h-5" />
                </div>
                <span className="text-xs text-slate-200 group-hover:text-indigo-300 font-medium">Settings</span>
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-8">
          <div className="bg-white/[0.03] border border-white/10 p-6 rounded-3xl backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Upcoming Deadlines</h3>
                <p className="text-xs text-slate-400 font-light">Your highest priority tasks</p>
              </div>
              <button 
                onClick={() => onNavigate('assignments')}
                className="text-xs text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1 group"
              >
                <span>All Tasks</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            <div className="space-y-3">
              {pendingAssignments.length > 0 ? (
                pendingAssignments.slice(0, 3).map(asg => {
                  const course = courses.find(c => c.id === asg.courseId);
                  return (
                    <div 
                      key={asg.id}
                      className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all flex items-start gap-3"
                    >
                      <button 
                        onClick={() => onToggleAssignment(asg.id)}
                        className="w-5 h-5 rounded-md border border-slate-400/40 hover:border-emerald-400 hover:bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5 transition-all text-slate-400/20 hover:text-emerald-400"
                        title="Mark Completed"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                      </button>

                      <div className="flex-grow space-y-1">
                        <div className="flex items-start justify-between gap-1">
                          <span className="text-xs font-semibold text-white line-clamp-1">{asg.title}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded border ${getPriorityColor(asg.priority)} font-mono uppercase`}>
                            {asg.priority}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span className="truncate max-w-[150px] font-light" style={{ color: course?.color }}>
                            {course?.code || 'Course'} - {course?.name || 'Class'}
                          </span>
                          <span className="font-mono">{getDaysCountStr(asg.dueDate)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-6 text-center text-slate-400 font-light border border-dashed border-white/10 rounded-2xl bg-slate-900/10 p-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-white">All caught up!</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">No pending tasks. Fantastic work!</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white/[0.03] border border-white/10 p-6 rounded-3xl backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Exam Countdown</h3>
                <p className="text-xs text-slate-400 font-light">Never walk into a test unprepared</p>
              </div>
              <button 
                onClick={() => onNavigate('exams')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 group"
              >
                <span>Exams vault</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            <div className="space-y-3">
              {upcomingExams.length > 0 ? (
                upcomingExams.slice(0, 2).map(exam => {
                  const course = courses.find(c => c.id === exam.courseId);
                  const examDate = new Date(exam.date);
                  const diffTime = examDate.getTime() - new Date().setHours(0,0,0,0);
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  
                  let countdownText = `${diffDays} days`;
                  let urgencyClass = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
                  
                  if (diffDays === 0) {
                    countdownText = 'TODAY';
                    urgencyClass = 'bg-rose-500/20 text-rose-400 border-rose-500/30 animate-pulse';
                  } else if (diffDays === 1) {
                    countdownText = 'TOMORROW';
                    urgencyClass = 'bg-orange-500/20 text-orange-400 border-orange-500/30 font-bold';
                  } else if (diffDays <= 3) {
                    urgencyClass = 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
                  }

                  return (
                    <div 
                      key={exam.id}
                      className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-4 hover:border-white/10 transition-colors"
                    >
                      <div className={`w-16 h-16 shrink-0 rounded-xl border flex flex-col items-center justify-center ${urgencyClass} font-mono`}>
                        <span className="text-lg font-extrabold">{diffDays <= 0 ? '★' : diffDays}</span>
                        <span className="text-[9px] uppercase tracking-wider">{diffDays === 1 ? 'day' : 'days'}</span>
                      </div>

                      <div className="flex-grow space-y-1 overflow-hidden">
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-xs font-semibold text-white truncate">{exam.title}</span>
                          <span className="text-[8px] font-mono uppercase bg-white/5 border border-white/5 px-1 py-0.5 rounded text-slate-300">
                            {exam.type}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 truncate" style={{ color: course?.color }}>
                          {course?.code} - {course?.name}
                        </p>
                        <div className="flex items-center gap-3 text-[10px] text-slate-400 font-light">
                          <span>{parseHour(exam.time)}</span>
                          <span>•</span>
                          <span className="truncate">{exam.room}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-6 text-center text-slate-400 font-light border border-dashed border-white/10 rounded-2xl bg-slate-900/10 p-4">
                  <Award className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-white font-sans">No upcoming exams</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Your schedule is exam-free. Keep reviewing notes!</p>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
