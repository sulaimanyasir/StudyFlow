import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Search, Grid, List, PlusCircle, CheckCircle2, Edit3, 
  Trash2, Filter, Check, Clock, Calendar, Sparkles
} from 'lucide-react';
import { Assignment, Course, Priority, AssignmentStatus, Semester, AssignmentType } from '../types';
import { CustomSelect, CustomDatePicker } from './ui/CustomInputs';
import ConfirmModal from './ui/ConfirmModal';
import AiQuickAddBar from './ui/AiQuickAddBar';
import AiStudyPlanModal from './ui/AiStudyPlanModal';
import { QuickAddResult, StudyPlanInput } from '../services/aiService';

interface AssignmentsViewProps {
  currentSemester: Semester | null;
  courses: Course[];
  assignments: Assignment[];
  onCreateAssignment: (asg: Omit<Assignment, 'id' | 'semesterId' | 'createdDate'>) => void;
  onUpdateAssignment: (asg: Assignment) => void;
  onDeleteAssignment: (id: string) => void;
  onQuickActionTrigger?: string;
  onClearQuickActionTrigger?: () => void;
}

export default function AssignmentsView({
  currentSemester,
  courses,
  assignments,
  onCreateAssignment,
  onUpdateAssignment,
  onDeleteAssignment,
  onQuickActionTrigger,
  onClearQuickActionTrigger,
}: AssignmentsViewProps) {
  // Toggle forms
  const [isAdding, setIsAdding] = useState(onQuickActionTrigger === 'add-assignment');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [courseId, setCourseId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [status, setStatus] = useState<AssignmentStatus>('pending');
  const [type, setType] = useState<AssignmentType>('assignment');
  const [estimatedHours, setEstimatedHours] = useState(4);

  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string; title: string }>({
    isOpen: false,
    id: '',
    title: ''
  });

  const [studyPlanTask, setStudyPlanTask] = useState<StudyPlanInput | null>(null);
  const openStudyPlan = (asg: Assignment) => {
    setStudyPlanTask({
      title: asg.title,
      type: asg.type,
      dueDate: asg.dueDate,
      estimatedHours: asg.estimatedHours,
      description: asg.description,
    });
  };

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterStatus, setFilterStatus] = useState<'all' | AssignmentStatus>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | Priority>('all');
  const [filterCourse, setFilterCourse] = useState('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'hours' | 'title'>('dueDate');

  // Trigger when Quick Action is clicked from Dashboard
  if (onQuickActionTrigger === 'add-assignment' && !isAdding) {
    setIsAdding(true);
    if (onClearQuickActionTrigger) onClearQuickActionTrigger();
  }

  // Pre-fill courseId if courses are available
  const activeCourses = courses.filter(c => c.semesterId === currentSemester?.id);
  const defaultCourseId = activeCourses[0]?.id || '';

  const handleAiQuickAdd = (result: QuickAddResult) => {
    setTitle(result.title || '');
    setCourseId(result.courseId || defaultCourseId);
    setDueDate(result.dueDate || '');
    setPriority((result.priority as Priority) || 'medium');
    setType((result.type as AssignmentType) || 'assignment');
    setEstimatedHours(result.estimatedHours || 4);
    setStatus('pending');
    setIsAdding(true);
  };

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) return;

    onCreateAssignment({
      title: title.trim(),
      description: description.trim(),
      courseId: courseId || defaultCourseId,
      dueDate,
      priority,
      status,
      type,
      estimatedHours,
    });

    setIsAdding(false);
    resetForm();
  };

  const startEdit = (asg: Assignment) => {
    setEditingId(asg.id);
    setTitle(asg.title);
    setDescription(asg.description);
    setCourseId(asg.courseId);
    setDueDate(asg.dueDate);
    setPriority(asg.priority);
    setStatus(asg.status);
    setType(asg.type);
    setEstimatedHours(asg.estimatedHours);
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !title.trim() || !dueDate) return;

    const originalAsg = assignments.find(a => a.id === editingId);
    if (!originalAsg) return;

    onUpdateAssignment({
      ...originalAsg,
      title: title.trim(),
      description: description.trim(),
      courseId,
      dueDate,
      priority,
      status,
      type,
      estimatedHours,
    });

    setEditingId(null);
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCourseId('');
    setDueDate('');
    setPriority('medium');
    setStatus('pending');
    setType('assignment');
    setEstimatedHours(4);
  };

  const handleToggleComplete = (asg: Assignment) => {
    onUpdateAssignment({
      ...asg,
      status: asg.status === 'completed' ? 'pending' : 'completed',
    });
  };

  // Helper arrays for filters
  const priorities: Priority[] = ['low', 'medium', 'high', 'urgent'];
  const statuses: AssignmentStatus[] = ['pending', 'in_progress', 'completed', 'late'];

  // Sorting weight mapping for Priority
  const getPriorityWeight = (p: Priority) => {
    switch (p) {
      case 'urgent': return 4;
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
    }
  };

  // Filter & Sort Logic
  const filteredAssignments = assignments
    .filter(a => a.semesterId === currentSemester?.id)
    .filter(a => {
      // 1. Search Query
      const query = searchQuery.toLowerCase().trim();
      const course = courses.find(c => c.id === a.courseId);
      const matchesSearch = 
        a.title.toLowerCase().includes(query) || 
        a.description.toLowerCase().includes(query) ||
        (course?.name || '').toLowerCase().includes(query) ||
        (course?.code || '').toLowerCase().includes(query);

      // 2. Status
      const matchesStatus = filterStatus === 'all' || a.status === filterStatus;

      // 3. Priority
      const matchesPriority = filterPriority === 'all' || a.priority === filterPriority;

      // 4. Course
      const matchesCourse = filterCourse === 'all' || a.courseId === filterCourse;

      return matchesSearch && matchesStatus && matchesPriority && matchesCourse;
    })
    .sort((a, b) => {
      // Sort logic
      if (sortBy === 'dueDate') {
        return a.dueDate.localeCompare(b.dueDate);
      }
      if (sortBy === 'priority') {
        return getPriorityWeight(b.priority) - getPriorityWeight(a.priority);
      }
      if (sortBy === 'hours') {
        return b.estimatedHours - a.estimatedHours;
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

  // UI styling classes helpers
  const getPriorityClasses = (p: Priority) => {
    switch (p) {
      case 'urgent': return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      case 'high': return 'bg-orange-500/15 text-orange-300 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30';
      case 'low': return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
    }
  };

  const getStatusClasses = (s: AssignmentStatus) => {
    switch (s) {
      case 'completed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'in_progress': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'pending': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      case 'late': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    }
  };

  const getDaysDiffStr = (dueDateStr: string) => {
    const target = new Date(dueDateStr);
    const diffTime = target.getTime() - new Date().setHours(0,0,0,0);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Due Today';
    if (diffDays === 1) return 'Due Tomorrow';
    if (diffDays < 0) return `${Math.abs(diffDays)} days late`;
    return `${diffDays} days left`;
  };

  return (
    <div className="space-y-8 pb-12">
      {!isAdding && !editingId && (
        <AiQuickAddBar courses={courses} onParsed={handleAiQuickAdd} placeholder='Try "DBMS assignment due next Friday, high priority"' />
      )}

      {/* Page Title & Add task */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Tasks</h1>
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
            id="btn-add-asg-toggle"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-sm font-medium shadow-lg shadow-indigo-500/15 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
          >
            <PlusCircle className="w-4.5 h-4.5" />
            <span>Add Task</span>
          </button>
        )}
      </div>

      {/* Add / Edit Task Modal forms */}
      {(isAdding || editingId) && (
        <motion.div 
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/[0.03] border border-white/10 p-6 rounded-3xl backdrop-blur-md max-w-3xl"
        >
          <div className="flex justify-between items-start mb-5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-indigo-400" />
              <span>{editingId ? 'Modify Task Settings' : 'Create New Task'}</span>
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
                <label className="text-[10px] font-bold tracking-widest text-slate-400 font-mono">ASSIGNMENT TITLE</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Essay 1 Draft"
                  required
                  className="w-full px-4 py-2.5 bg-slate-900/40 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold tracking-widest text-slate-400 font-mono">RELATED COURSE</label>
                <CustomSelect
                  value={courseId || defaultCourseId}
                  onChange={(val) => setCourseId(val)}
                  options={activeCourses.length > 0 ? activeCourses.map(c => ({ value: c.id, label: `${c.code} - ${c.name}` })) : [{ value: '', label: 'Create a course first' }]}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold tracking-widest text-slate-400 font-mono">DUE DATE</label>
                <CustomDatePicker
                  value={dueDate}
                  onChange={(val) => setDueDate(val)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold tracking-widest text-slate-400 font-mono">PRIORITY LEVEL</label>
                <CustomSelect
                  value={priority}
                  onChange={(val) => setPriority(val as Priority)}
                  options={[
                    { value: 'low', label: 'Low' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'high', label: 'High' },
                    { value: 'urgent', label: 'Urgent' },
                  ]}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold tracking-widest text-slate-400 font-mono">TASK TYPE</label>
                <CustomSelect
                  value={type}
                  onChange={(val) => setType(val as AssignmentType)}
                  options={[
                    { value: 'assignment', label: 'Assignment' },
                    { value: 'quiz', label: 'Quiz' },
                    { value: 'project', label: 'Project' },
                  ]}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold tracking-widest text-slate-400 font-mono">ESTIMATED WORK HOURS</label>
                <input 
                  type="number" 
                  min={1} 
                  max={100}
                  value={estimatedHours} 
                  onChange={(e) => setEstimatedHours(Number(e.target.value))}
                  required
                  className="w-full px-4 py-2.5 bg-slate-900/40 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                />
              </div>

              {editingId && (
                <div className="space-y-1.5 col-span-full">
                  <label className="text-[10px] font-bold tracking-widest text-slate-400 font-mono">STATUS</label>
                  <div className="flex gap-2">
                    {statuses.map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setStatus(s)}
                        className={`px-3 py-1.5 rounded-xl border text-xs capitalize ${
                          status === s 
                            ? 'bg-indigo-600 border-indigo-400 text-white font-semibold' 
                            : 'bg-white/5 border-white/10 text-slate-300'
                        }`}
                      >
                        {s.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold tracking-widest text-slate-400 font-mono">DESCRIPTION</label>
              <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Write a 500-word essay about..."
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
                id="btn-submit-asg-save"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium shadow-md shadow-indigo-600/10 transition-colors"
              >
                {editingId ? 'Apply Changes' : 'Record Task'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Control Filter Bar Suite (Sleek Glass row) */}
      <div className="bg-white/[0.02] border border-white/10 p-4 rounded-3xl backdrop-blur-md space-y-4">
        
        {/* Core row: Search, layout toggles */}
        <div className="flex flex-col md:flex-row justify-between items-stretch gap-4">
          {/* Search box */}
          <div className="relative flex-grow max-w-lg">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search assignments, tags, course names..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/40 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Sorting & layout mode switches */}
          <div className="flex items-center gap-3 self-end sm:self-auto shrink-0 font-mono text-xs">
            
            {/* Sorting criteria */}
            <div className="flex items-center gap-2 bg-slate-900/40 border border-white/10 px-3 py-2 rounded-xl">
              <span className="text-slate-400 font-light text-[10px]">SORT BY:</span>
              <CustomSelect
                value={sortBy}
                onChange={(val) => setSortBy(val as any)}
                options={[
                  { value: 'dueDate', label: 'Due Date' },
                  { value: 'priority', label: 'Priority' },
                  { value: 'hours', label: 'Estimated Hours' },
                  { value: 'title', label: 'Title' },
                ]}
                className="!bg-transparent !border-none !py-0 !px-1 min-w-[150px]"
              />
            </div>

            {/* Layout switch controls */}
            <div className="flex bg-slate-900/40 border border-white/10 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-indigo-600/30 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:text-white'}`}
                title="Bento Grid Layout"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-indigo-600/30 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:text-white'}`}
                title="Sleek List Layout"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

        {/* Sub row: Filters triggers */}
        <div className="flex flex-wrap items-center gap-3 border-t border-white/5 pt-3 text-xs">
          
          <div className="flex items-center gap-1.5 text-slate-400 shrink-0 font-mono text-[10px] font-bold">
            <Filter className="w-3.5 h-3.5" />
            <span>FILTER BY:</span>
          </div>

          {/* Status buttons */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 rounded-full border transition-all ${
                filterStatus === 'all' ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300 font-semibold' : 'bg-transparent border-white/5 text-slate-400 hover:text-white'
              }`}
            >
              All Status
            </button>
            {statuses.map(st => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 rounded-full border capitalize transition-all ${
                  filterStatus === st ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300 font-semibold' : 'bg-transparent border-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="h-4 w-[1px] bg-white/10 hidden sm:block" />

          {/* Priority dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-900/40 border border-white/10 px-2.5 py-1 rounded-full font-mono text-[11px]">
            <span className="text-slate-400">PRIORITY:</span>
            <CustomSelect
              value={filterPriority}
              onChange={(val) => setFilterPriority(val as any)}
              options={[
                { value: 'all', label: 'All' },
                ...priorities.map(p => ({ value: p, label: p.toUpperCase() }))
              ]}
              className="!bg-transparent !border-none !py-0 !px-1 min-w-[100px]"
            />
          </div>

          {/* Course dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-900/40 border border-white/10 px-2.5 py-1 rounded-full font-mono text-[11px]">
            <span className="text-slate-400">COURSE:</span>
            <CustomSelect
              value={filterCourse}
              onChange={(val) => setFilterCourse(val)}
              options={[
                { value: 'all', label: 'All' },
                ...activeCourses.map(c => ({ value: c.id, label: c.code }))
              ]}
              className="!bg-transparent !border-none !py-0 !px-1 min-w-[120px]"
            />
          </div>

        </div>

      </div>

      {/* Main Results lists */}
      {filteredAssignments.length > 0 ? (
        viewMode === 'grid' ? (
          /* Bento grid layout mode */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssignments.map(asg => {
              const course = courses.find(c => c.id === asg.courseId);
              const isCompleted = asg.status === 'completed';

              return (
                <motion.div 
                  key={asg.id}
                  whileHover={{ y: -3 }}
                  className={`p-5 rounded-3xl backdrop-blur-xl border flex flex-col justify-between relative overflow-hidden transition-all min-h-[220px] ${
                    isCompleted 
                      ? 'bg-slate-950/20 border-white/5 opacity-70' 
                      : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div>
                    {/* Top line course + priority */}
                    <div className="flex justify-between items-center gap-2 mb-3">
                      <span 
                        className="text-[10px] font-mono uppercase tracking-wider font-semibold"
                        style={{ color: course?.color || '#a855f7' }}
                      >
                        {course?.code || 'CS-GEN'}
                      </span>

                      <span className={`text-[9px] px-2 py-0.5 rounded-full border uppercase font-mono tracking-widest ${getPriorityClasses(asg.priority)}`}>
                        {asg.priority}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <div className="space-y-1.5">
                      <div className="flex items-start gap-2.5">
                        <button 
                          onClick={() => handleToggleComplete(asg)}
                          className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                            isCompleted 
                              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' 
                              : 'border-slate-400/40 hover:border-emerald-400 hover:bg-emerald-500/10 text-slate-400/20 hover:text-emerald-400'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 font-bold" />
                        </button>

                        <h3 className={`text-base font-bold text-white line-clamp-1 leading-tight ${isCompleted ? 'line-through text-slate-400' : ''}`}>
                          {asg.title}
                        </h3>
                      </div>

                      {asg.description && (
                        <p className="text-xs text-slate-400 font-light line-clamp-2 pl-7 leading-relaxed">
                          {asg.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Footer metadata */}
                  <div className="border-t border-white/5 pt-3 mt-4 flex items-center justify-between text-xs text-slate-400 font-light pl-7">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span className="font-mono text-[10px]">{getDaysDiffStr(asg.dueDate)}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 font-mono text-[10px]">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{asg.estimatedHours}h</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => openStudyPlan(asg)}
                          className="p-1 rounded bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400"
                          title="AI Study Plan"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => startEdit(asg)}
                          className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-300"
                          title="Edit Task"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => setDeleteConfirm({ isOpen: true, id: asg.id, title: asg.title })}
                          className="p-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                          title="Delete Task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* List View Mode */
          <div className="bg-white/[0.02] border border-white/10 rounded-3xl backdrop-blur-md overflow-hidden">
            <div className="min-w-full divide-y divide-white/5">
              <div className="bg-slate-950/20 grid grid-cols-12 gap-2 p-4 text-[10px] font-mono tracking-wider font-bold text-slate-400 uppercase">
                <div className="col-span-6 flex items-center gap-2">TITLE & DESCRIPTION</div>
                <div className="col-span-2">COURSE</div>
                <div className="col-span-1 text-center">HOURS</div>
                <div className="col-span-1 text-center">PRIORITY</div>
                <div className="col-span-1 text-center">STATUS</div>
                <div className="col-span-1 text-right">ACTION</div>
              </div>

              <div className="divide-y divide-white/5">
                {filteredAssignments.map(asg => {
                  const course = courses.find(c => c.id === asg.courseId);
                  const isCompleted = asg.status === 'completed';

                  return (
                    <div 
                      key={asg.id}
                      className={`grid grid-cols-12 gap-2 p-4 items-center hover:bg-white/[0.02] transition-colors text-xs text-slate-300 ${
                        isCompleted ? 'opacity-65' : ''
                      }`}
                    >
                      {/* Checkbox + Title */}
                      <div className="col-span-6 flex items-start gap-3">
                        <button 
                          onClick={() => handleToggleComplete(asg)}
                          className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                            isCompleted 
                              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' 
                              : 'border-slate-400/40 hover:border-emerald-400 hover:bg-emerald-500/10 text-slate-400/20 hover:text-emerald-400'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>

                        <div className="space-y-0.5">
                          <h4 className={`font-semibold text-white ${isCompleted ? 'line-through text-slate-400' : ''}`}>
                            {asg.title}
                          </h4>
                          {asg.description && (
                            <p className="text-slate-400 text-[11px] font-light line-clamp-1">{asg.description}</p>
                          )}
                        </div>
                      </div>

                      {/* Course */}
                      <div className="col-span-2">
                        <span className="font-semibold" style={{ color: course?.color }}>
                          {course?.code}
                        </span>
                        <span className="text-[10px] text-slate-500 ml-1.5 truncate hidden lg:inline">
                          {course?.name}
                        </span>
                      </div>

                      {/* Est Hours */}
                      <div className="col-span-1 text-center font-mono">{asg.estimatedHours}h</div>

                      {/* Priority */}
                      <div className="col-span-1 text-center">
                        <span className={`text-[9px] px-2 py-0.5 rounded border uppercase font-mono tracking-wider ${getPriorityClasses(asg.priority)}`}>
                          {asg.priority}
                        </span>
                      </div>

                      {/* Status */}
                      <div className="col-span-1 text-center">
                        <span className={`text-[9px] px-2 py-0.5 rounded border uppercase font-mono tracking-wider ${getStatusClasses(asg.status)}`}>
                          {asg.status}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="col-span-1 text-right flex justify-end gap-1.5">
                        <button 
                          onClick={() => openStudyPlan(asg)}
                          className="p-1 rounded bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400"
                          title="AI Study Plan"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => startEdit(asg)}
                          className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-300"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => setDeleteConfirm({ isOpen: true, id: asg.id, title: asg.title })}
                          className="p-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )
      ) : (
        <div className="py-16 text-center border-2 border-dashed border-white/10 rounded-3xl p-8 bg-slate-900/10">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4 stroke-[1.5]" />
          <h3 className="text-lg font-bold text-white mb-2">No Assignments or Quizzes Match Filters</h3>
          <p className="text-slate-400 text-sm max-w-sm mx-auto font-light mb-6">
            You don't have any tasks matching the chosen search, status, priority, or course parameters. Adjust filters to discover tasks.
          </p>
          <button
            onClick={() => setIsAdding(true)}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-semibold uppercase tracking-wider font-mono shadow-lg shadow-indigo-600/15"
          >
            + Create New Task
          </button>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        title="Delete Task?"
        message={`Are you sure you want to delete the task: ${deleteConfirm.title}?`}
        confirmText="Yes, Delete"
        onConfirm={() => onDeleteAssignment(deleteConfirm.id)}
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
