import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  MapPin, Plus, Trash2, Edit3, Calendar, Check,
  Clock, PlusCircle, MessageSquare, User, BookOpen, BrainCircuit
} from 'lucide-react';
import { Course, CourseSchedule, COURSE_COLORS, Semester } from '../types';
import { CustomSelect, CustomTimePicker } from './ui/CustomInputs';
import ConfirmModal from './ui/ConfirmModal';
import AiFlashcardsModal from './ui/AiFlashcardsModal';

interface CoursesViewProps {
  currentSemester: Semester | null;
  courses: Course[];
  onCreateCourse: (course: Omit<Course, 'id' | 'semesterId'>) => void;
  onUpdateCourse: (course: Course) => void;
  onDeleteCourse: (id: string) => void;
  onQuickActionTrigger?: string;
  onClearQuickActionTrigger?: () => void;
}

export default function CoursesView({
  currentSemester,
  courses,
  onCreateCourse,
  onUpdateCourse,
  onDeleteCourse,
  onQuickActionTrigger,
  onClearQuickActionTrigger,
}: CoursesViewProps) {
  const [isAdding, setIsAdding] = useState(onQuickActionTrigger === 'add-course');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [instructor, setInstructor] = useState('');
  const [credits, setCredits] = useState(3);
  const [room, setRoom] = useState('');
  const [color, setColor] = useState(COURSE_COLORS[0].hex);
  const [notes, setNotes] = useState('');
  
  // Schedules form list
  const [schedules, setSchedules] = useState<Omit<CourseSchedule, 'id'>[]>([]);
  const [schedDay, setSchedDay] = useState<CourseSchedule['day']>('Monday');
  const [schedStart, setSchedStart] = useState('09:00');
  const [schedEnd, setSchedEnd] = useState('10:30');

  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string; name: string; code: string }>({
    isOpen: false,
    id: '',
    name: '',
    code: ''
  });

  const [flashcardsCourse, setFlashcardsCourse] = useState<string | null>(null);

  // Trigger when Quick Action is clicked from Dashboard
  if (onQuickActionTrigger === 'add-course' && !isAdding) {
    setIsAdding(true);
    if (onClearQuickActionTrigger) onClearQuickActionTrigger();
  }

  const addScheduleBlock = () => {
    if (!schedStart || !schedEnd) return;
    setSchedules([...schedules, { day: schedDay, startTime: schedStart, endTime: schedEnd }]);
  };

  const removeScheduleBlock = (idx: number) => {
    setSchedules(schedules.filter((_, i) => i !== idx));
  };

  const formatTimeSlot = (start: string, end: string) => {
    const parseHour = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const formattedH = h % 12 || 12;
      return `${formattedH}:${m.toString().padStart(2, '0')} ${ampm}`;
    };
    return `${parseHour(start)} - ${parseHour(end)}`;
  };

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim() || !instructor.trim() || !room.trim()) return;

    onCreateCourse({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      instructor: instructor.trim(),
      credits,
      room: room.trim(),
      color,
      schedules: schedules.map((s, idx) => ({ ...s, id: `sched-${Date.now()}-${idx}` })),
      attendance: { present: 0, absent: 0, late: 0 },
      notes: notes.trim(),
    });

    // Reset Form
    setIsAdding(false);
    resetForm();
  };

  const startEdit = (course: Course) => {
    setEditingId(course.id);
    setName(course.name);
    setCode(course.code);
    setInstructor(course.instructor);
    setCredits(course.credits);
    setRoom(course.room);
    setColor(course.color);
    setNotes(course.notes || '');
    setSchedules(course.schedules);
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !name.trim() || !code.trim() || !instructor.trim() || !room.trim()) return;

    const originalCourse = courses.find(c => c.id === editingId);
    if (!originalCourse) return;

    onUpdateCourse({
      ...originalCourse,
      name: name.trim(),
      code: code.trim().toUpperCase(),
      instructor: instructor.trim(),
      credits,
      room: room.trim(),
      color,
      schedules: schedules.map((s, idx) => ({ ...s, id: s.id || `sched-${Date.now()}-${idx}` })),
      notes: notes.trim(),
    });

    setEditingId(null);
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setCode('');
    setInstructor('');
    setCredits(3);
    setRoom('');
    setColor(COURSE_COLORS[0].hex);
    setNotes('');
    setSchedules([]);
  };

  // Adjust Attendance levels
  const adjustAttendance = (course: Course, type: 'present' | 'absent' | 'late', increment: boolean) => {
    const updatedAttendance = { ...course.attendance };
    if (increment) {
      updatedAttendance[type]++;
    } else {
      updatedAttendance[type] = Math.max(0, updatedAttendance[type] - 1);
    }

    onUpdateCourse({
      ...course,
      attendance: updatedAttendance,
    });
  };

  const getAttendanceStats = (course: Course) => {
    const p = course.attendance.present;
    const a = course.attendance.absent;
    const l = course.attendance.late;
    const total = p + a + l;
    
    // Attendance percentage
    const percentage = total > 0 ? Math.round(((p + l) / total) * 100) : 0;
    
    let ringColor = 'text-emerald-400';
    let ringBg = 'stroke-emerald-500/10';
    let statusText = 'Excellent';

    if (percentage < 75) {
      ringColor = 'text-rose-400 animate-pulse';
      ringBg = 'stroke-rose-500/10';
      statusText = 'Critical';
    } else if (percentage < 85) {
      ringColor = 'text-amber-400';
      ringBg = 'stroke-amber-500/10';
      statusText = 'Warning';
    }

    return { percentage, total, ringColor, ringBg, statusText };
  };

  const currentSemId = currentSemester?.id;
  const filteredCourses = courses.filter(c => c.semesterId === currentSemId);

  return (
    <div className="space-y-8 pb-12">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Courses Registry</h1>
          <p className="text-slate-400 text-sm font-light">
            Active Semester: <span className="text-indigo-300 font-semibold">{currentSemester?.name || 'N/A'}</span>
          </p>
        </div>
        {!isAdding && !editingId && (
          <button
            onClick={() => setIsAdding(true)}
            id="btn-add-course-toggle"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-sm font-medium shadow-lg shadow-indigo-500/15 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
          >
            <Plus className="w-4.5 h-4.5" />
            <span>Add New Course</span>
          </button>
        )}
      </div>

      {/* Course Creator / Modifier form */}
      {(isAdding || editingId) && (
        <motion.div 
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/[0.03] border border-white/10 p-6 rounded-3xl backdrop-blur-md max-w-3xl"
        >
          <div className="flex justify-between items-start mb-5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-indigo-400" />
              <span>{editingId ? 'Modify Course Specifications' : 'Define New Course'}</span>
            </h3>
            <button 
              onClick={() => {
                setIsAdding(false);
                setEditingId(null);
                resetForm();
              }}
              className="text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={editingId ? handleSubmitEdit : handleSubmitAdd} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1.5 col-span-1 sm:col-span-2">
                <label className="text-[10px] font-bold tracking-widest text-slate-400 font-mono">COURSE NAME</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Introduction to Computer Science"
                  required
                  className="w-full px-4 py-2.5 bg-slate-900/40 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold tracking-widest text-slate-400 font-mono">COURSE CODE</label>
                <input 
                  type="text" 
                  value={code} 
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. CS-101"
                  required
                  className="w-full px-4 py-2.5 bg-slate-900/40 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold tracking-widest text-slate-400 font-mono">CREDITS HOURS</label>
                <input 
                  type="number" 
                  min={0} 
                  max={6}
                  value={credits} 
                  onChange={(e) => setCredits(Number(e.target.value))}
                  required
                  className="w-full px-4 py-2.5 bg-slate-900/40 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                />
              </div>

              <div className="space-y-1.5 col-span-1 sm:col-span-2">
                <label className="text-[10px] font-bold tracking-widest text-slate-400 font-mono">INSTRUCTOR NAME</label>
                <input 
                  type="text" 
                  value={instructor} 
                  onChange={(e) => setInstructor(e.target.value)}
                  placeholder="e.g. Dr. Jane Doe"
                  required
                  className="w-full px-4 py-2.5 bg-slate-900/40 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5 col-span-1 sm:col-span-2">
                <label className="text-[10px] font-bold tracking-widest text-slate-400 font-mono">CLASSROOM / LOCATION</label>
                <input 
                  type="text" 
                  value={room} 
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="e.g. Science Building 101"
                  required
                  className="w-full px-4 py-2.5 bg-slate-900/40 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            {/* Course Color selector */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold tracking-widest text-slate-400 font-mono block">THEME COLOR</label>
              <div className="flex flex-wrap gap-2.5">
                {COURSE_COLORS.map(c => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setColor(c.hex)}
                    className="w-8 h-8 rounded-full border border-white/15 relative flex items-center justify-center transition-all hover:scale-110"
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  >
                    {color === c.hex && (
                      <Check className="w-4 h-4 text-slate-950 font-bold" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Weekly timetables manager */}
            <div className="p-4 bg-slate-950/30 rounded-2xl border border-white/5 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-200">Lecture Slots & Timings</span>
                <span className="text-[10px] font-mono text-slate-400">Add slots to place classes on Timetable</span>
              </div>

              {/* Schedules form additions */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-mono">DAY</label>
                  <CustomSelect
                    value={schedDay}
                    onChange={(val) => setSchedDay(val as CourseSchedule['day'])}
                    options={[
                      { value: 'Monday', label: 'Monday' },
                      { value: 'Tuesday', label: 'Tuesday' },
                      { value: 'Wednesday', label: 'Wednesday' },
                      { value: 'Thursday', label: 'Thursday' },
                      { value: 'Friday', label: 'Friday' },
                    ]}
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-mono">START TIME</label>
                  <CustomTimePicker
                    value={schedStart}
                    onChange={(val) => setSchedStart(val)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-mono">END TIME</label>
                  <CustomTimePicker
                    value={schedEnd}
                    onChange={(val) => setSchedEnd(val)}
                  />
                </div>

                <button
                  type="button"
                  onClick={addScheduleBlock}
                  className="px-3 py-2 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-xl text-xs font-medium transition-colors border border-indigo-500/30 flex items-center justify-center gap-1.5 cursor-pointer h-9"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Insert Slot</span>
                </button>
              </div>

              {/* Added schedules slots lists */}
              <div className="space-y-2 pt-1">
                {schedules.map((s, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs">
                    <div className="flex items-center gap-4 text-slate-300">
                      <span className="font-semibold text-white">{s.day}</span>
                      <span className="font-mono text-cyan-400 bg-cyan-400/5 px-2 py-0.5 rounded border border-cyan-400/10">
                        {formatTimeSlot(s.startTime, s.endTime)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeScheduleBlock(idx)}
                      className="text-[10px] text-rose-400 hover:text-rose-300 px-2 py-1 rounded bg-rose-500/10 border border-rose-500/20 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                {schedules.length === 0 && (
                  <p className="text-xs text-slate-500 italic text-center py-2">No schedules assigned yet.</p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold tracking-widest text-slate-400 font-mono">COURSE SYLLABUS / NOTES</label>
              <textarea 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Important resources, syllabus outline, grading rubric, office hours..."
                rows={3}
                className="w-full px-4 py-2.5 bg-slate-900/40 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setEditingId(null);
                  resetForm();
                }}
                className="px-4 py-2 bg-white/5 text-slate-300 hover:bg-white/10 rounded-xl text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="btn-submit-course-save"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium shadow-md shadow-indigo-600/10 transition-colors"
              >
                {editingId ? 'Save Changes' : 'Confirm Course'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Grid List of courses */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {filteredCourses.map(course => {
          const { percentage, total, ringColor, ringBg, statusText } = getAttendanceStats(course);
          
          // Radial calculations
          const radius = 34;
          const stroke = 5;
          const circumference = 2 * Math.PI * radius;
          const strokeDashoffset = circumference - (percentage / 100) * circumference;

          return (
            <motion.div 
              key={course.id}
              whileHover={{ y: -3 }}
              className="p-6 rounded-3xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/10 transition-all flex flex-col md:flex-row justify-between gap-6"
            >
              {/* Left Column: Course Main Infos */}
              <div className="flex-grow space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-2.5 h-2.5 rounded-full" 
                      style={{ backgroundColor: course.color }} 
                    />
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-400">{course.code}</span>
                    <span className="text-[10px] bg-white/5 border border-white/5 px-2 py-0.5 rounded text-slate-300">
                      {course.credits} Credits
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white tracking-tight">{course.name}</h2>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs text-slate-300 font-light">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-500" />
                    <div>
                      <div className="text-[9px] text-slate-500 uppercase tracking-widest font-mono">INSTRUCTOR</div>
                      <div className="font-medium text-slate-200">{course.instructor}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-500" />
                    <div>
                      <div className="text-[9px] text-slate-500 uppercase tracking-widest font-mono">ROOM / CLASS</div>
                      <div className="font-medium text-slate-200">{course.room}</div>
                    </div>
                  </div>
                </div>

                {/* Course Schedules details list */}
                <div className="space-y-1.5 pt-2">
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-bold">TIMETABLE SLOTS</div>
                  <div className="flex flex-wrap gap-1.5">
                    {course.schedules.length > 0 ? (
                      course.schedules.map(sched => (
                        <div 
                          key={sched.id} 
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950/40 border border-white/5 text-[11px] text-slate-300"
                        >
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{sched.day.substring(0, 3)} {formatTimeSlot(sched.startTime, sched.endTime)}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-[11px] text-slate-500 italic">No schedule slots configured</span>
                    )}
                  </div>
                </div>

                {/* Personal Notes (if any) */}
                {course.notes && (
                  <div className="p-3 bg-slate-950/20 border border-white/5 rounded-2xl text-[11px] text-slate-400 font-light max-h-24 overflow-y-auto">
                    <MessageSquare className="w-3.5 h-3.5 text-slate-500 inline mr-1.5 align-text-bottom" />
                    <span>{course.notes}</span>
                  </div>
                )}
              </div>

              {/* Right Column: Interactive Attendance Ring */}
              <div className="w-full md:w-56 shrink-0 bg-slate-950/30 rounded-2xl border border-white/5 p-4 flex flex-col justify-between items-center text-center">
                <div className="flex justify-between items-center w-full mb-1">
                  <span className="text-[10px] font-mono tracking-wider font-bold text-slate-400 uppercase">ATTENDANCE RATE</span>
                  <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    ringColor.includes('emerald') 
                      ? 'bg-emerald-500/10 text-emerald-400' 
                      : ringColor.includes('amber')
                        ? 'bg-amber-500/10 text-amber-400'
                        : 'bg-rose-500/10 text-rose-400 animate-pulse'
                  }`}>
                    {statusText}
                  </span>
                </div>

                {/* SVG Radial ring */}
                <div className="relative flex items-center justify-center my-3">
                  <svg className="w-20 h-20 transform -rotate-90">
                    {/* Background Circle */}
                    <circle
                      cx="40"
                      cy="40"
                      r={radius}
                      className={ringBg}
                      strokeWidth={stroke}
                      fill="transparent"
                    />
                    {/* Progress Circle */}
                    <motion.circle
                      cx="40"
                      cy="40"
                      r={radius}
                      className={ringColor}
                      stroke="currentColor"
                      strokeWidth={stroke}
                      fill="transparent"
                      strokeDasharray={circumference}
                      initial={{ strokeDashoffset: circumference }}
                      animate={{ strokeDashoffset }}
                      transition={{ duration: 0.8 }}
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center font-mono">
                    <span className="text-sm font-bold text-white dark:text-white text-slate-900">{percentage}%</span>
                    <span className="text-[8px] text-slate-500 tracking-wider">PRESENCE</span>
                  </div>
                </div>

                {/* Counter controls */}
                <div className="space-y-3 w-full">
                  <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-mono">
                    <div className="bg-slate-900/40 p-1.5 rounded-lg border border-white/5">
                      <div className="text-white font-bold">{course.attendance.present}</div>
                      <div className="text-slate-500 text-[8px] uppercase">PRES</div>
                    </div>
                    <div className="bg-slate-900/40 p-1.5 rounded-lg border border-white/5">
                      <div className="text-white font-bold">{course.attendance.absent}</div>
                      <div className="text-slate-500 text-[8px] uppercase">ABS</div>
                    </div>
                  </div>

                  {/* Incrementor logs */}
                  <div className="flex gap-1.5 justify-center mt-3">
                    <button
                      onClick={() => adjustAttendance(course, 'present', true)}
                      className="px-2 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 border border-emerald-500/20 text-[10px] font-mono font-semibold transition-colors flex-grow cursor-pointer"
                      title="Add Present"
                    >
                      + Pres
                    </button>
                    <button
                      onClick={() => adjustAttendance(course, 'absent', true)}
                      className="px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 text-[10px] font-mono font-semibold transition-colors flex-grow cursor-pointer"
                      title="Add Absent"
                    >
                      + Abs
                    </button>
                  </div>

                  {/* Subtraction decrement settings */}
                  <div className="flex gap-1.5 justify-center border-t border-white/5 pt-2">
                    <button 
                      onClick={() => adjustAttendance(course, 'present', false)}
                      className="px-2 py-1 rounded bg-slate-500/10 hover:bg-slate-500/20 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 border border-slate-500/20 text-[10px] font-mono font-semibold transition-colors flex-grow cursor-pointer"
                      title="Reduce Present"
                    >
                      - Pres
                    </button>
                    <button 
                      onClick={() => adjustAttendance(course, 'absent', false)}
                      className="px-2 py-1 rounded bg-slate-500/10 hover:bg-slate-500/20 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 border border-slate-500/20 text-[10px] font-mono font-semibold transition-colors flex-grow cursor-pointer"
                      title="Reduce Absent"
                    >
                      - Abs
                    </button>
                  </div>
                </div>

                {/* Course Actions Footer */}
                <div className="flex gap-2 w-full pt-3 mt-1.5 border-t border-white/5 justify-end">
                  <button 
                    onClick={() => setFlashcardsCourse(course.name)}
                    className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer px-1.5 py-0.5 rounded hover:bg-indigo-500/10"
                  >
                    <BrainCircuit className="w-3 h-3" />
                    <span>Flashcards</span>
                  </button>
                  <button 
                    onClick={() => startEdit(course)}
                    className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer px-1.5 py-0.5 rounded hover:bg-white/5"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                  <button 
                    onClick={() => setDeleteConfirm({ isOpen: true, id: course.id, name: course.name, code: course.code })}
                    className="text-[10px] text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer px-1.5 py-0.5 rounded hover:bg-rose-500/10"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}

        {filteredCourses.length === 0 && (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-white/10 rounded-3xl p-8 bg-slate-900/10">
            <BookOpen className="w-12 h-12 text-slate-500 mx-auto mb-4 stroke-[1.5]" />
            <h3 className="text-lg font-bold text-white mb-2">No Courses Defined Yet</h3>
            <p className="text-slate-400 text-sm max-w-sm mx-auto font-light mb-6">
              Establish courses in this active semester to begin mapping weekly schedules, tracking attendance logs, and allocating assignments.
            </p>
            <button
              onClick={() => setIsAdding(true)}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-semibold uppercase tracking-wider font-mono shadow-lg shadow-indigo-600/15"
            >
              + Launch Add Course Wizard
            </button>
          </div>
        )}
      </div>
      
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        title="Delete Course?"
        message={`Are you sure you want to delete ${deleteConfirm.code}: ${deleteConfirm.name}? All assignments and exams under this course will be permanently removed.`}
        confirmText="Yes, Delete"
        onConfirm={() => onDeleteCourse(deleteConfirm.id)}
        onCancel={() => setDeleteConfirm({ isOpen: false, id: '', name: '', code: '' })}
        isDestructive={true}
      />

      <AiFlashcardsModal
        isOpen={!!flashcardsCourse}
        onClose={() => setFlashcardsCourse(null)}
        courseName={flashcardsCourse || ''}
      />
    </div>
  );
}
