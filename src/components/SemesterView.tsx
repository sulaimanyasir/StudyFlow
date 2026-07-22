import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  FolderPlus, Edit3, Trash2, Calendar, 
  ArrowRight
} from 'lucide-react';
import { Semester, Course, Assignment, Exam } from '../types';
import { CustomDatePicker } from './ui/CustomInputs';
import ConfirmModal from './ui/ConfirmModal';

interface SemesterViewProps {
  user: { name: string; currentSemesterId: string };
  semesters: Semester[];
  courses: Course[];
  assignments: Assignment[];
  exams: Exam[];
  onSelectSemester: (id: string) => void;
  onCreateSemester: (name: string, startDate: string, endDate: string) => void;
  onUpdateSemester: (id: string, name: string, startDate: string, endDate: string, isCompleted: boolean) => void;
  onDeleteSemester: (id: string) => void;
}

export default function SemesterView({
  user,
  semesters,
  courses,
  assignments,
  exams,
  onSelectSemester,
  onCreateSemester,
  onUpdateSemester,
  onDeleteSemester,
}: SemesterViewProps) {
  // Local state for UI forms
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newStart, setNewStart] = useState('');
  const [newEnd, setNewEnd] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editStart, setEditStart] = useState('');
  const [editEnd, setEditEnd] = useState('');
  const [editCompleted, setEditCompleted] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string; name: string }>({
    isOpen: false,
    id: '',
    name: ''
  });

  // Submit adding new semester
  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newStart || !newEnd) return;
    onCreateSemester(newName.trim(), newStart, newEnd);
    setIsAdding(false);
    setNewName('');
    setNewStart('');
    setNewEnd('');
  };

  // Start editing a semester
  const startEdit = (sem: Semester) => {
    setEditingId(sem.id);
    setEditName(sem.name);
    setEditStart(sem.startDate);
    setEditEnd(sem.endDate);
    setEditCompleted(sem.isCompleted);
  };

  // Submit editing semester
  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !editName.trim() || !editStart || !editEnd) return;
    onUpdateSemester(editingId, editName.trim(), editStart, editEnd, editCompleted);
    setEditingId(null);
  };

  // Calculations for each semester to show dynamic stats on their cards
  const getSemesterStats = (semId: string) => {
    const semCourses = courses.filter(c => c.semesterId === semId);
    const semAssignments = assignments.filter(a => a.semesterId === semId);
    const semExams = exams.filter(e => e.semesterId === semId);

    const totalCredits = semCourses.reduce((acc, c) => acc + c.credits, 0);
    const pendingAssignments = semAssignments.filter(a => a.status !== 'completed').length;
    const completedAssignments = semAssignments.filter(a => a.status === 'completed').length;
    const pendingExams = semExams.filter(e => !e.completed).length;

    return {
      coursesCount: semCourses.length,
      credits: totalCredits,
      pendingAssignments,
      completedAssignments,
      pendingExams,
    };
  };

  // Calculate semester progress based on dates
  const calculateSemesterProgress = (startStr: string, endStr: string) => {
    const start = new Date(startStr).getTime();
    const end = new Date(endStr).getTime();
    const now = Date.now();

    if (now < start) return 0;
    if (now > end) return 100;

    const totalDuration = end - start;
    const elapsed = now - start;
    return Math.round((elapsed / totalDuration) * 100);
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="space-y-8 pb-12">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Semester Hub</h1>
          <p className="text-slate-400 text-sm font-light">Switch semesters, view academic progress, or create new terms</p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            id="btn-add-semester-toggle"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-sm font-medium shadow-lg shadow-indigo-500/15 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Create Semester</span>
          </button>
        )}
      </div>

      {/* Add Semester Form (Glassmorphic) */}
      {isAdding && (
        <motion.div 
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/[0.03] border border-indigo-500/20 p-6 rounded-3xl backdrop-blur-md max-w-2xl relative z-50"
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-indigo-400" />
              <span>Create New Academic Term</span>
            </h3>
            <button 
              onClick={() => setIsAdding(false)}
              className="text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmitAdd} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 font-mono">TERM NAME</label>
                <input 
                  type="text" 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={`Fall ${currentYear}`} 
                  required
                  className="w-full px-4 py-2.5 bg-slate-900/40 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 font-mono">START DATE</label>
                <CustomDatePicker
                  value={newStart}
                  onChange={(val) => setNewStart(val)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 font-mono">END DATE</label>
                <CustomDatePicker
                  value={newEnd}
                  onChange={(val) => setNewEnd(val)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 bg-white/5 text-slate-300 hover:bg-white/10 rounded-xl text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="btn-submit-semester-add"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium shadow-md shadow-indigo-600/10 transition-colors"
              >
                Save Semester
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Editing Term Dialog */}
      {editingId && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/[0.04] border border-cyan-500/20 p-6 rounded-3xl backdrop-blur-md max-w-2xl relative z-50"
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-cyan-400" />
              <span>Configure Semester Details</span>
            </h3>
            <button 
              onClick={() => setEditingId(null)}
              className="text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmitEdit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 font-mono">SEMESTER NAME</label>
                <input 
                  type="text" 
                  value={editName} 
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-slate-900/40 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 font-mono">START DATE</label>
                <CustomDatePicker
                  value={editStart}
                  onChange={(val) => setEditStart(val)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 font-mono">END DATE</label>
                <CustomDatePicker
                  value={editEnd}
                  onChange={(val) => setEditEnd(val)}
                />
              </div>
            </div>

            {/* Toggle Complete status */}
            <div className="flex items-center gap-3 p-3 bg-slate-900/30 rounded-xl border border-white/5 max-w-sm">
              <input 
                type="checkbox" 
                id="edit-complete-checkbox"
                checked={editCompleted}
                onChange={(e) => setEditCompleted(e.target.checked)}
                className="w-4.5 h-4.5 rounded text-cyan-500 focus:ring-cyan-500/25 cursor-pointer"
              />
              <label htmlFor="edit-complete-checkbox" className="text-xs text-slate-200 font-medium cursor-pointer">
                Mark as Completed / Archived Semester
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditingId(null)}
                className="px-4 py-2 bg-white/5 text-slate-300 hover:bg-white/10 rounded-xl text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="btn-submit-semester-edit"
                className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-medium shadow-md shadow-cyan-600/10 transition-colors"
              >
                Apply Changes
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Grid List of semesters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {semesters.map(sem => {
          const isCurrent = sem.id === user.currentSemesterId;
          const stats = getSemesterStats(sem.id);
          const progress = calculateSemesterProgress(sem.startDate, sem.endDate);
          
          return (
            <motion.div 
              key={sem.id}
              whileHover={{ y: -3 }}
              className={`p-6 rounded-3xl backdrop-blur-xl border transition-all flex flex-col justify-between relative overflow-hidden min-h-[300px] ${
                isCurrent 
                  ? 'bg-indigo-650/10 border-indigo-500/40 shadow-lg shadow-indigo-500/5' 
                  : 'bg-white/[0.02] border-white/10 hover:border-white/20'
              }`}
            >
              {/* Highlight gradient background for current */}
              {isCurrent && (
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none" />
              )}

              {/* Top Row: Name and Action buttons */}
              <div>
                <div className="flex justify-between items-start gap-4 pb-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-xl font-bold text-white tracking-tight">{sem.name}</h2>
                      {isCurrent && (
                        <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-full border border-indigo-500/30">
                          Active
                        </span>
                      )}
                      {sem.isCompleted && (
                        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 bg-slate-500/15 px-2 py-0.5 rounded-full border border-white/5">
                          Completed
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-light">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>
                        {new Date(sem.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        {' — '}
                        {new Date(sem.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-1 opacity-80 hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => startEdit(sem)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                      title="Edit Term Settings"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    {semesters.length > 1 && (
                      <button 
                        onClick={() => setDeleteConfirm({ isOpen: true, id: sem.id, name: sem.name })}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors"
                        title="Delete Semester"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Grid stats overview */}
                <div className="grid grid-cols-4 gap-4 py-6">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono tracking-wider text-slate-400 font-semibold uppercase">COURSES</span>
                    <div className="text-lg font-bold text-white font-mono">{stats.coursesCount}</div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono tracking-wider text-slate-400 font-semibold uppercase">CREDITS</span>
                    <div className="text-lg font-bold text-white font-mono">{stats.credits}</div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono tracking-wider text-slate-400 font-semibold uppercase">TASKS</span>
                    <div className="text-lg font-bold text-white font-mono">
                      <span className="text-rose-400">{stats.pendingAssignments}</span>
                      <span className="text-slate-500 text-xs font-normal">/{stats.completedAssignments + stats.pendingAssignments}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono tracking-wider text-slate-400 font-semibold uppercase">EXAMS</span>
                    <div className="text-lg font-bold text-white font-mono text-purple-400">{stats.pendingExams}</div>
                  </div>
                </div>
              </div>

              {/* Progress and bottom button */}
              <div className="space-y-5">
                {/* Term progress slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono font-medium">
                    <span className="text-slate-400">Semester Elapsed Progress</span>
                    <span className="text-cyan-400 font-semibold">{progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-950/40 rounded-full overflow-hidden border border-white/5 p-0.5">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Selection button */}
                <div className="pt-2">
                  {isCurrent ? (
                    <div className="w-full text-center py-2.5 rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-xs text-indigo-300 font-semibold font-mono uppercase tracking-widest">
                      ★ Active Current Workspace
                    </div>
                  ) : (
                    <button
                      onClick={() => onSelectSemester(sem.id)}
                      className="w-full group py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-500/30 text-xs text-slate-200 font-medium font-mono uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
                    >
                      <span>Load Semester Workspace</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        title="Delete Semester?"
        message={`Are you absolutely sure you want to delete ${deleteConfirm.name}? This will remove all associated courses, assignments, and exams.`}
        confirmText="Yes, Delete"
        onConfirm={() => onDeleteSemester(deleteConfirm.id)}
        onCancel={() => setDeleteConfirm({ isOpen: false, id: '', name: '' })}
        isDestructive={true}
      />
    </div>
  );
}
