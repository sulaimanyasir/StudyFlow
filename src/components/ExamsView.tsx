import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  PlusCircle, Calendar, Clock, MapPin, Edit3, Trash2, 
  CheckCircle, CheckCircle2, Sparkles
} from 'lucide-react';
import { Exam, Course, ExamType, Semester } from '../types';
import { CustomSelect, CustomDatePicker, CustomTimePicker } from './ui/CustomInputs';
import ConfirmModal from './ui/ConfirmModal';
import AiQuickAddBar from './ui/AiQuickAddBar';
import AiStudyPlanModal from './ui/AiStudyPlanModal';
import { QuickAddResult, StudyPlanInput } from '../services/aiService';

interface ExamsViewProps {
  currentSemester: Semester | null;
  courses: Course[];
  exams: Exam[];
  onCreateExam: (exam: Omit<Exam, 'id' | 'semesterId'>) => void;
  onUpdateExam: (exam: Exam) => void;
  onDeleteExam: (id: string) => void;
  onQuickActionTrigger?: string;
  onClearQuickActionTrigger?: () => void;
}

export default function ExamsView({
  currentSemester,
  courses,
  exams,
  onCreateExam,
  onUpdateExam,
  onDeleteExam,
  onQuickActionTrigger,
  onClearQuickActionTrigger,
}: ExamsViewProps) {
  // Toggle form state
  const [isAdding, setIsAdding] = useState(onQuickActionTrigger === 'add-exam');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00');
  const [room, setRoom] = useState('');
  const [type, setType] = useState<ExamType>('midterm');
  const [notes, setNotes] = useState('');
  const [completed, setCompleted] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string; title: string }>({
    isOpen: false,
    id: '',
    title: ''
  });

  const [studyPlanTask, setStudyPlanTask] = useState<StudyPlanInput | null>(null);
  const openStudyPlan = (exam: Exam) => {
    setStudyPlanTask({
      title: exam.title,
      type: exam.type,
      dueDate: exam.date,
      estimatedHours: 6,
      description: exam.notes,
    });
  };

  // Trigger when Quick Action is clicked from Dashboard
  if (onQuickActionTrigger === 'add-exam' && !isAdding) {
    setIsAdding(true);
    if (onClearQuickActionTrigger) onClearQuickActionTrigger();
  }

  const activeCourses = courses.filter(c => c.semesterId === currentSemester?.id);
  const defaultCourseId = activeCourses[0]?.id || '';

  const handleAiQuickAdd = (result: QuickAddResult) => {
    setTitle(result.title || '');
    setCourseId(result.courseId || defaultCourseId);
    setDate(result.dueDate || '');
    setTime(result.time || '10:00');
    setRoom(result.room || '');
    setType((result.type as ExamType) || 'midterm');
    setIsAdding(true);
  };

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date || !time || !room.trim()) return;

    onCreateExam({
      courseId: courseId || defaultCourseId,
      title: title.trim(),
      date,
      time,
      room: room.trim(),
      type,
      notes: notes.trim(),
      completed: false,
    });

    setIsAdding(false);
    resetForm();
  };

  const startEdit = (exam: Exam) => {
    setEditingId(exam.id);
    setTitle(exam.title);
    setCourseId(exam.courseId);
    setDate(exam.date);
    setTime(exam.time);
    setRoom(exam.room);
    setType(exam.type);
    setNotes(exam.notes || '');
    setCompleted(exam.completed);
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !title.trim() || !date || !time || !room.trim()) return;

    const originalExam = exams.find(ex => ex.id === editingId);
    if (!originalExam) return;

    onUpdateExam({
      ...originalExam,
      courseId,
      title: title.trim(),
      date,
      time,
      room: room.trim(),
      type,
      notes: notes.trim(),
      completed,
    });

    setEditingId(null);
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setCourseId('');
    setDate('');
    setTime('10:00');
    setRoom('');
    setType('midterm');
    setNotes('');
    setCompleted(false);
  };

  const handleToggleComplete = (exam: Exam) => {
    onUpdateExam({
      ...exam,
      completed: !exam.completed,
    });
  };

  // Segregate exams in current semester
  const semExams = exams.filter(e => e.semesterId === currentSemester?.id);
  
  const upcomingExams = semExams
    .filter(e => !e.completed)
    .sort((a, b) => a.date.localeCompare(b.date));

  const completedExams = semExams
    .filter(e => e.completed)
    .sort((a, b) => b.date.localeCompare(a.date));

  const parseHour = (t: string) => {
    if (!t) return '';
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedH = h % 12 || 12;
    return `${formattedH}:${m.toString().padStart(2, '0')} ${ampm}`;
  };

  // Countdown computations helper
  const getCountdownStr = (dateStr: string) => {
    const examTime = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const diffTime = examTime.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'TODAY';
    if (diffDays === 1) return 'TOMORROW';
    if (diffDays < 0) return 'COMPLETED';
    return `${diffDays} Days`;
  };

  const getUrgencyClasses = (dateStr: string) => {
    const examTime = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0,0,0,0);
    const diffDays = Math.ceil((examTime.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) return 'bg-rose-500/10 border-rose-500/20 text-rose-400';
    if (diffDays <= 3) return 'bg-orange-500/10 border-orange-500/20 text-orange-400';
    return 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400';
  };

  return (
    <div className="space-y-8 pb-12">
      {!isAdding && !editingId && (
        <AiQuickAddBar courses={courses} onParsed={handleAiQuickAdd} placeholder='Try "DBMS midterm on Aug 12 at 10am in Room 204"' />
      )}

      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Exams & Milestones</h1>
          <p className="text-slate-400 text-sm font-light">
            Active Semester: <span className="text-indigo-300 font-semibold">{currentSemester?.name || 'N/A'}</span>
          </p>
        </div>
        {!isAdding && !editingId && (
          <button
            onClick={() => {
              setIsAdding(true);
              setCourseId(defaultCourseId);
            }}
            id="btn-add-exam-toggle"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-sm font-medium shadow-lg shadow-indigo-500/15 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
          >
            <PlusCircle className="w-4.5 h-4.5" />
            <span>Add Exam Target</span>
          </button>
        )}
      </div>

      {/* Add / Edit Form (Glassmorphic) */}
      {(isAdding || editingId) && (
        <motion.div 
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/[0.03] border border-white/10 p-6 rounded-3xl backdrop-blur-md max-w-3xl"
        >
          <div className="flex justify-between items-start mb-5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-indigo-400" />
              <span>{editingId ? 'Modify Exam Parameters' : 'Register New Exam Milestone'}</span>
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

          <form onSubmit={editingId ? handleSubmitEdit : handleSubmitAdd} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1.5 col-span-1 sm:col-span-2">
                <label className="text-[10px] font-bold tracking-widest text-slate-400 font-mono">EXAM TITLE</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Final Exam"
                  required
                  className="w-full px-4 py-2.5 bg-slate-900/40 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold tracking-widest text-slate-400 font-mono">TARGET COURSE</label>
                <CustomSelect
                  value={courseId || defaultCourseId}
                  onChange={(val) => setCourseId(val)}
                  options={activeCourses.length > 0 ? activeCourses.map(c => ({ value: c.id, label: `${c.code} - ${c.name}` })) : [{ value: '', label: 'Configure a course first' }]}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold tracking-widest text-slate-400 font-mono">EXAM DATE</label>
                <CustomDatePicker
                  value={date}
                  onChange={(val) => setDate(val)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold tracking-widest text-slate-400 font-mono">TIME (HH:MM)</label>
                <CustomTimePicker
                  value={time}
                  onChange={(val) => setTime(val)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold tracking-widest text-slate-400 font-mono">ROOM / CLASSROOM</label>
                <input 
                  type="text" 
                  value={room} 
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="e.g. Room 101"
                  required
                  className="w-full px-4 py-2.5 bg-slate-900/40 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold tracking-widest text-slate-400 font-mono">EXAM TYPE</label>
                <CustomSelect
                  value={type}
                  onChange={(val) => setType(val as ExamType)}
                  options={[
                    { value: 'midterm', label: 'Midterm Exam' },
                    { value: 'final', label: 'Final Examination' },
                    { value: 'quiz', label: 'Classroom Quiz' },
                    { value: 'project', label: 'Project Review / Jury' },
                    { value: 'other', label: 'Other' },
                  ]}
                />
              </div>

              {editingId && (
                <div className="space-y-1.5 p-3 bg-slate-900/30 rounded-xl border border-white/5 flex items-center gap-2 self-end mb-1">
                  <input 
                    type="checkbox" 
                    id="edit-exam-completed"
                    checked={completed}
                    onChange={(e) => setCompleted(e.target.checked)}
                    className="w-4 h-4 text-indigo-500 rounded focus:ring-indigo-500 cursor-pointer"
                  />
                  <label htmlFor="edit-exam-completed" className="text-xs text-slate-200 font-medium cursor-pointer">
                    Exam is Completed / Graded
                  </label>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold tracking-widest text-slate-400 font-mono">TOPICS / PREPARATION NOTES</label>
              <textarea 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Open book, covers chapters 1-5"
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
                id="btn-submit-exam-save"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium shadow-md shadow-indigo-600/10 transition-colors"
              >
                {editingId ? 'Save Milestones' : 'Commit Exam'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Main Splits layouts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column: Upcoming Exams timeline list */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white/[0.03] border border-white/10 p-6 rounded-3xl backdrop-blur-md space-y-5">
            <div>
              <h3 className="text-lg font-bold text-white">Upcoming Examinations ({upcomingExams.length})</h3>
              <p className="text-xs text-slate-400 font-light">Milestones scheduled chronologically</p>
            </div>

            <div className="space-y-4">
              {upcomingExams.map(exam => {
                const course = courses.find(c => c.id === exam.courseId);
                const countdown = getCountdownStr(exam.date);
                const urgency = getUrgencyClasses(exam.date);

                return (
                  <div 
                    key={exam.id}
                    className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden group"
                  >
                    {/* Color indicator side border */}
                    <div className="absolute top-0 left-0 bottom-0 w-1" style={{ backgroundColor: course?.color || '#a855f7' }} />

                    <div className="space-y-2 pl-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono uppercase tracking-wider text-slate-400">{course?.code || 'CS'}</span>
                        <span className="text-[10px] bg-white/5 border border-white/5 px-2 py-0.5 rounded text-slate-300 uppercase font-mono">
                          {exam.type}
                        </span>
                      </div>
                      
                      <h4 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {exam.title}
                      </h4>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-300 font-light">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{new Date(exam.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{parseHour(exam.time)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{exam.room}</span>
                        </div>
                      </div>

                      {exam.notes && (
                        <p className="text-xs text-slate-400 bg-slate-950/20 p-2.5 rounded-xl border border-white/5 font-light mt-1.5 max-w-xl">
                          {exam.notes}
                        </p>
                      )}
                    </div>

                    {/* Right block: Countdown & Mark Completed */}
                    <div className="flex sm:flex-col items-center sm:items-end gap-3 shrink-0 self-end sm:self-center">
                      <div className={`px-3 py-1.5 rounded-xl border font-mono text-xs font-extrabold tracking-wider ${urgency}`}>
                        {countdown}
                      </div>

                      <div className="flex gap-1.5">
                        <button 
                          onClick={() => handleToggleComplete(exam)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/20 text-emerald-400 text-xs font-medium font-mono flex items-center gap-1 transition-colors cursor-pointer"
                          title="Finish Exam"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Check</span>
                        </button>
                        <button 
                          onClick={() => openStudyPlan(exam)}
                          className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 transition-colors"
                          title="AI Study Plan"
                        >
                          <Sparkles className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => startEdit(exam)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
                          title="Edit Exam"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setDeleteConfirm({ isOpen: true, id: exam.id, title: exam.title })}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                          title="Delete Exam"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {upcomingExams.length === 0 && (
                <div className="py-12 text-center border border-dashed border-white/10 rounded-2xl bg-slate-900/10 p-6">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2.5 stroke-[1.5]" />
                  <p className="font-semibold text-white">No Upcoming Exams!</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    Excellent work! Your schedule is clear. Use this window to read syllabus logs.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column: Completed exams lists */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white/[0.03] border border-white/10 p-6 rounded-3xl backdrop-blur-md space-y-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Completed Exams ({completedExams.length})</span>
              </h3>
              <p className="text-[11px] text-slate-500 font-light">History of completed tests in active term</p>
            </div>

            <div className="space-y-3 pt-2">
              {completedExams.map(exam => {
                const course = courses.find(c => c.id === exam.courseId);
                return (
                  <div 
                    key={exam.id}
                    className="p-3 bg-white/[0.01] border border-white/5 rounded-xl flex items-start justify-between gap-3 relative overflow-hidden"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                        <span style={{ color: course?.color }}>{course?.code}</span>
                        <span>•</span>
                        <span>{new Date(exam.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                      <h4 className="text-xs font-bold text-white line-clamp-1 line-through opacity-70">
                        {exam.title}
                      </h4>
                    </div>

                    <div className="flex gap-1">
                      <button 
                        onClick={() => handleToggleComplete(exam)}
                        className="text-[10px] text-slate-400 hover:text-white bg-white/5 px-2 py-0.5 rounded cursor-pointer"
                        title="Re-open Exam Target"
                      >
                        Undo
                      </button>
                      <button 
                        onClick={() => setDeleteConfirm({ isOpen: true, id: exam.id, title: exam.title })}
                        className="text-[10px] text-rose-400 hover:text-rose-300 bg-rose-500/10 px-1 py-0.5 rounded border border-rose-500/10 cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}

              {completedExams.length === 0 && (
                <p className="text-xs text-slate-500 italic text-center py-4">No completed exams registered yet.</p>
              )}
            </div>
          </div>
        </div>

      </div>
      
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        title="Delete Exam?"
        message={`Are you sure you want to delete the exam: ${deleteConfirm.title}?`}
        confirmText="Yes, Delete"
        onConfirm={() => onDeleteExam(deleteConfirm.id)}
        onCancel={() => setDeleteConfirm({ isOpen: false, id: '', title: '' })}
        isDestructive={true}
      />

      <AiStudyPlanModal
        isOpen={!!studyPlanTask}
        onClose={() => setStudyPlanTask(null)}
        task={studyPlanTask}
      />
    </div>
  );
}
