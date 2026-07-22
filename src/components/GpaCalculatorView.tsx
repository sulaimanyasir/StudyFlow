import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Award, 
  Compass, 
  Calculator, 
  Save, 
  RotateCcw, 
  BarChart2, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Info, 
  BookOpen, 
  Layers, 
  Percent 
} from 'lucide-react';
import { Course, Semester } from '../types';
import { CustomSelect } from './ui/CustomInputs';

interface GpaCalculatorViewProps {
  currentSemester: Semester | null;
  courses: Course[];
}

// UOG Batch 25 Onward Grade List for manual selection
const BATCH25_GRADES = [
  { grade: 'A', points: 4.00, label: 'A (4.00)' },
  { grade: 'A', points: 3.93, label: 'A (3.93)' },
  { grade: 'A', points: 3.87, label: 'A (3.87)' },
  { grade: 'A', points: 3.80, label: 'A (3.80)' },
  { grade: 'A', points: 3.73, label: 'A (3.73)' },
  { grade: 'A', points: 3.67, label: 'A (3.67)' },
  { grade: 'B', points: 3.60, label: 'B (3.60)' },
  { grade: 'B', points: 3.53, label: 'B (3.53)' },
  { grade: 'B', points: 3.47, label: 'B (3.47)' },
  { grade: 'B', points: 3.40, label: 'B (3.40)' },
  { grade: 'B', points: 3.33, label: 'B (3.33)' },
  { grade: 'B', points: 3.27, label: 'B (3.27)' },
  { grade: 'B', points: 3.20, label: 'B (3.20)' },
  { grade: 'B', points: 3.13, label: 'B (3.13)' },
  { grade: 'B', points: 3.07, label: 'B (3.07)' },
  { grade: 'B', points: 3.00, label: 'B (3.00)' },
  { grade: 'B', points: 2.90, label: 'B (2.90)' },
  { grade: 'B', points: 2.80, label: 'B (2.80)' },
  { grade: 'B', points: 2.70, label: 'B (2.70)' },
  { grade: 'B', points: 2.60, label: 'B (2.60)' },
  { grade: 'B', points: 2.50, label: 'B (2.50)' },
  { grade: 'C', points: 2.40, label: 'C (2.40)' },
  { grade: 'C', points: 2.30, label: 'C (2.30)' },
  { grade: 'C', points: 2.20, label: 'C (2.20)' },
  { grade: 'C', points: 2.10, label: 'C (2.10)' },
  { grade: 'C', points: 2.00, label: 'C (2.00)' },
  { grade: 'C', points: 1.90, label: 'C (1.90)' },
  { grade: 'C', points: 1.80, label: 'C (1.80)' },
  { grade: 'C', points: 1.70, label: 'C (1.70)' },
  { grade: 'D+', points: 1.60, label: 'D+ (1.60)' },
  { grade: 'D+', points: 1.50, label: 'D+ (1.50)' },
  { grade: 'D', points: 1.40, label: 'D (1.40)' },
  { grade: 'D', points: 1.30, label: 'D (1.30)' },
  { grade: 'D', points: 1.20, label: 'D (1.20)' },
  { grade: 'D', points: 1.10, label: 'D (1.10)' },
  { grade: 'D', points: 1.00, label: 'D (1.00)' },
  { grade: 'F', points: 0.00, label: 'F (0.00)' },
];

const BATCH22_24_GRADES = [
  { grade: 'A+', points: 4.00, label: 'A+ (4.00)' },
  { grade: 'A', points: 3.70, label: 'A (3.70)' },
  { grade: 'B+', points: 3.40, label: 'B+ (3.40)' },
  { grade: 'B', points: 3.00, label: 'B (3.00)' },
  { grade: 'B-', points: 2.50, label: 'B- (2.50)' },
  { grade: 'C+', points: 2.00, label: 'C+ (2.00)' },
  { grade: 'C', points: 1.50, label: 'C (1.50)' },
  { grade: 'D', points: 1.00, label: 'D (1.00)' },
  { grade: 'F', points: 0.00, label: 'F (0.00)' },
];

const calculateBatch25Grade = (percentage: number) => {
  const rounded = Math.round(percentage);
  if (rounded >= 85) return { grade: 'A', points: 4.00, remarks: 'Excellent' };
  if (rounded === 84) return { grade: 'A', points: 3.93, remarks: 'Excellent' };
  if (rounded === 83) return { grade: 'A', points: 3.87, remarks: 'Excellent' };
  if (rounded === 82) return { grade: 'A', points: 3.80, remarks: 'Excellent' };
  if (rounded === 81) return { grade: 'A', points: 3.73, remarks: 'Excellent' };
  if (rounded === 80) return { grade: 'A', points: 3.67, remarks: 'Excellent' };
  if (rounded === 79) return { grade: 'B', points: 3.60, remarks: 'Very Good' };
  if (rounded === 78) return { grade: 'B', points: 3.53, remarks: 'Very Good' };
  if (rounded === 77) return { grade: 'B', points: 3.47, remarks: 'Very Good' };
  if (rounded === 76) return { grade: 'B', points: 3.40, remarks: 'Very Good' };
  if (rounded === 75) return { grade: 'B', points: 3.33, remarks: 'Very Good' };
  if (rounded === 74) return { grade: 'B', points: 3.27, remarks: 'Very Good' };
  if (rounded === 73) return { grade: 'B', points: 3.20, remarks: 'Very Good' };
  if (rounded === 72) return { grade: 'B', points: 3.13, remarks: 'Very Good' };
  if (rounded === 71) return { grade: 'B', points: 3.07, remarks: 'Very Good' };
  if (rounded === 70) return { grade: 'B', points: 3.00, remarks: 'Very Good' };
  if (rounded === 69) return { grade: 'B', points: 2.90, remarks: 'Very Good' };
  if (rounded === 68) return { grade: 'B', points: 2.80, remarks: 'Very Good' };
  if (rounded === 67) return { grade: 'B', points: 2.70, remarks: 'Very Good' };
  if (rounded === 66) return { grade: 'B', points: 2.60, remarks: 'Very Good' };
  if (rounded === 65) return { grade: 'B', points: 2.50, remarks: 'Very Good' };
  if (rounded === 64) return { grade: 'C', points: 2.40, remarks: 'Good' };
  if (rounded === 63) return { grade: 'C', points: 2.30, remarks: 'Good' };
  if (rounded === 62) return { grade: 'C', points: 2.20, remarks: 'Good' };
  if (rounded === 61) return { grade: 'C', points: 2.10, remarks: 'Good' };
  if (rounded === 60) return { grade: 'C', points: 2.00, remarks: 'Good' };
  if (rounded === 59) return { grade: 'C', points: 1.90, remarks: 'Good' };
  if (rounded === 58) return { grade: 'C', points: 1.80, remarks: 'Good' };
  if (rounded === 57) return { grade: 'C', points: 1.70, remarks: 'Good' };
  if (rounded === 56) return { grade: 'D+', points: 1.60, remarks: 'Pass' };
  if (rounded === 55) return { grade: 'D+', points: 1.50, remarks: 'Pass' };
  if (rounded === 54) return { grade: 'D', points: 1.40, remarks: 'Low Pass' };
  if (rounded === 53) return { grade: 'D', points: 1.30, remarks: 'Low Pass' };
  if (rounded === 52) return { grade: 'D', points: 1.20, remarks: 'Low Pass' };
  if (rounded === 51) return { grade: 'D', points: 1.10, remarks: 'Low Pass' };
  if (rounded === 50) return { grade: 'D', points: 1.00, remarks: 'Low Pass' };
  return { grade: 'F', points: 0.00, remarks: 'Fail' };
};

const calculateBatch22_24Grade = (percentage: number) => {
  const rounded = Math.round(percentage);
  if (rounded >= 85) return { grade: 'A+', points: 4.00, remarks: 'Exceptional' };
  if (rounded >= 80) return { grade: 'A', points: 3.70, remarks: 'Outstanding' };
  if (rounded >= 75) return { grade: 'B+', points: 3.40, remarks: 'Excellent' };
  if (rounded >= 70) return { grade: 'B', points: 3.00, remarks: 'Very Good' };
  if (rounded >= 65) return { grade: 'B-', points: 2.50, remarks: 'Good' };
  if (rounded >= 60) return { grade: 'C+', points: 2.00, remarks: 'Average' };
  if (rounded >= 55) return { grade: 'C', points: 1.50, remarks: 'Satisfactory' };
  if (rounded >= 50) return { grade: 'D', points: 1.00, remarks: 'Pass' };
  return { grade: 'F', points: 0.00, remarks: 'Fail' };
};

const calculateUogGrade = (percentage: number, policy: 'batch25' | 'batch22_24') => {
  if (policy === 'batch22_24') {
    return calculateBatch22_24Grade(percentage);
  }
  return calculateBatch25Grade(percentage);
};

const getPointsFromGradeString = (gradeStr: string, policy: 'batch25' | 'batch22_24'): number => {
  const match = gradeStr.match(/\(([^)]+)\)/);
  if (match) {
    const pts = parseFloat(match[1]);
    if (!isNaN(pts)) return pts;
  }
  const list = policy === 'batch25' ? BATCH25_GRADES : BATCH22_24_GRADES;
  const found = list.find(g => g.grade === gradeStr || g.label === gradeStr);
  return found ? found.points : 0;
};

const getLetterFromGradeString = (gradeStr: string): string => {
  return gradeStr.split(' ')[0] || gradeStr;
};

interface ManualCourseRow {
  id: string;
  name: string;
  credits: number;
  inputMode: 'marks' | 'grade';
  obtainedMarks: number;
  totalMarks: number;
  grade: string;
}

interface SemesterRow {
  id: string;
  name: string;
  gpa: number;
  credits: number;
}

export default function GpaCalculatorView({ currentSemester, courses }: GpaCalculatorViewProps) {
  const currentSemId = currentSemester?.id || '';
  const semCourses = courses.filter(c => c.semesterId === currentSemId);

  // Active policy selection
  const [policy, setPolicy] = useState<'batch25' | 'batch22_24'>(() => {
    const saved = localStorage.getItem('studyflow_grading_policy');
    return (saved === 'batch22_24' ? 'batch22_24' : 'batch25');
  });

  // General Tabs: 'sgpa' or 'cgpa' or 'scheme'
  const [activeTab, setActiveTab] = useState<'sgpa' | 'cgpa' | 'scheme'>('sgpa');
  
  // SGPA Modes: 'linked' (from app database) or 'manual' (dynamic rows simulation)
  const [sgpaMode, setSgpaMode] = useState<'linked' | 'manual'>('linked');

  // --- STATE FOR LINKED COURSES MODE ---
  // Each linked course will store its simulated grade input details (either marks or direct grade selection)
  const [linkedCourseInputs, setLinkedCourseInputs] = useState<Record<string, {
    inputMode: 'marks' | 'grade';
    obtainedMarks: number;
    totalMarks: number;
    grade: string;
  }>>({});

  // --- STATE FOR MANUAL SIMULATOR MODE ---
  const [manualCourses, setManualCourses] = useState<ManualCourseRow[]>([
    { id: '1', name: 'Subject 1', credits: 3, inputMode: 'marks', obtainedMarks: 85, totalMarks: 100, grade: 'A (4.00)' },
    { id: '2', name: 'Subject 2', credits: 4, inputMode: 'marks', obtainedMarks: 78, totalMarks: 100, grade: 'B (3.53)' },
    { id: '3', name: 'Subject 3', credits: 3, inputMode: 'grade', obtainedMarks: 0, totalMarks: 100, grade: 'B (3.00)' },
    { id: '4', name: 'Subject 4', credits: 2, inputMode: 'marks', obtainedMarks: 92, totalMarks: 100, grade: 'A (4.00)' },
  ]);

  // --- STATE FOR MULTI-SEMESTER CGPA ---
  const [semesterRows, setSemesterRows] = useState<SemesterRow[]>([
    { id: 's1', name: 'Semester 1', gpa: 3.65, credits: 16 },
    { id: 's2', name: 'Semester 2', gpa: 3.42, credits: 18 },
    { id: 's3', name: 'Semester 3', gpa: 3.55, credits: 15 },
  ]);

  // Prior cumulative academic stats for Overall cumulative GPA predictions
  const [priorCredits, setPriorCredits] = useState<number>(32);
  const [priorGpa, setPriorGpa] = useState<number>(3.55);
  
  // Notifications
  const [isSavedNotify, setIsSavedNotify] = useState(false);
  const [notifyMsg, setNotifyMsg] = useState('');

  // Load saved state from Local Storage
  useEffect(() => {
    // 1. Linked course details loading
    const savedLinkedInputs = localStorage.getItem(`studyflow_gpa_linked_inputs_${currentSemId}`);
    if (savedLinkedInputs) {
      try {
        setLinkedCourseInputs(JSON.parse(savedLinkedInputs));
      } catch (e) {}
    } else if (semCourses.length > 0) {
      // Prepopulate default inputs
      const defaults: Record<string, any> = {};
      semCourses.forEach((c, idx) => {
        const dummyMarks = [84, 76, 72, 68];
        const marksVal = dummyMarks[idx % dummyMarks.length];
        const calculated = calculateUogGrade(marksVal, policy);
        defaults[c.id] = {
          inputMode: 'marks',
          obtainedMarks: marksVal,
          totalMarks: 100,
          grade: calculated.grade,
        };
      });
      setLinkedCourseInputs(defaults);
    }

    // 2. Manual courses loading
    const savedManual = localStorage.getItem('studyflow_gpa_manual_courses');
    if (savedManual) {
      try {
        setManualCourses(JSON.parse(savedManual));
      } catch (e) {}
    }

    // 3. Multi semester rows loading
    const savedSems = localStorage.getItem('studyflow_gpa_semesters');
    if (savedSems) {
      try {
        setSemesterRows(JSON.parse(savedSems));
      } catch (e) {}
    }

    // 4. Prior cumulative info
    const savedPrior = localStorage.getItem('studyflow_gpa_prior');
    if (savedPrior) {
      try {
        const parsed = JSON.parse(savedPrior);
        setPriorCredits(parsed.credits);
        setPriorGpa(parsed.gpa);
      } catch (e) {}
    }
  }, [currentSemId]);

  // Helpers to trigger success alerts
  const triggerNotification = (msg: string) => {
    setNotifyMsg(msg);
    setIsSavedNotify(true);
    setTimeout(() => setIsSavedNotify(false), 3000);
  };

  const handlePolicyChange = (newPolicy: 'batch25' | 'batch22_24') => {
    setPolicy(newPolicy);
    localStorage.setItem('studyflow_grading_policy', newPolicy);
    
    // Auto-update dashboard gpa on active policy switch
    const updatedInputs = { ...linkedCourseInputs };
    const stats = calculateLinkedGpa(updatedInputs, newPolicy);
    localStorage.setItem(`studyflow_gpa_${currentSemId}`, JSON.stringify({
      gpa: stats.gpa,
      totalCredits: stats.totalCredits,
    }));
    
    triggerNotification(`Grading policy switched to ${newPolicy === 'batch25' ? 'Batch 25 Onward' : 'Batches 22-24'}`);
  };

  // --- ACTIONS FOR LINKED MODE ---
  const handleLinkedInputModeChange = (courseId: string, mode: 'marks' | 'grade') => {
    const prev = linkedCourseInputs[courseId] || { inputMode: 'marks', obtainedMarks: 80, totalMarks: 100, grade: 'A' };
    const updated = {
      ...linkedCourseInputs,
      [courseId]: {
        ...prev,
        inputMode: mode,
      }
    };
    setLinkedCourseInputs(updated);
    localStorage.setItem(`studyflow_gpa_linked_inputs_${currentSemId}`, JSON.stringify(updated));
    syncGpaToDashboard(updated);
  };

  const handleLinkedMarksChange = (courseId: string, field: 'obtained' | 'total', val: number) => {
    const prev = linkedCourseInputs[courseId] || { inputMode: 'marks', obtainedMarks: 80, totalMarks: 100, grade: 'A' };
    const obt = field === 'obtained' ? val : prev.obtainedMarks;
    const tot = field === 'total' ? Math.max(1, val) : prev.totalMarks;
    
    const percentage = Math.min(100, (obt / tot) * 100);
    const { grade } = calculateUogGrade(percentage, policy);

    const updated = {
      ...linkedCourseInputs,
      [courseId]: {
        ...prev,
        obtainedMarks: obt,
        totalMarks: tot,
        grade,
      }
    };
    setLinkedCourseInputs(updated);
    localStorage.setItem(`studyflow_gpa_linked_inputs_${currentSemId}`, JSON.stringify(updated));
    syncGpaToDashboard(updated);
  };

  const handleLinkedGradeChange = (courseId: string, grade: string) => {
    const prev = linkedCourseInputs[courseId] || { inputMode: 'grade', obtainedMarks: 80, totalMarks: 100, grade: 'A' };
    const updated = {
      ...linkedCourseInputs,
      [courseId]: {
        ...prev,
        grade,
      }
    };
    setLinkedCourseInputs(updated);
    localStorage.setItem(`studyflow_gpa_linked_inputs_${currentSemId}`, JSON.stringify(updated));
    syncGpaToDashboard(updated);
  };

  const syncGpaToDashboard = (inputs: Record<string, any>) => {
    const stats = calculateLinkedGpa(inputs);
    localStorage.setItem(`studyflow_gpa_${currentSemId}`, JSON.stringify({
      gpa: stats.gpa,
      totalCredits: stats.totalCredits,
    }));
  };

  const handleSaveLinkedGpa = () => {
    syncGpaToDashboard(linkedCourseInputs);
    triggerNotification('Calculated GPA synchronized with your dashboard stats!');
  };

  const handleResetLinkedGpa = () => {
    const cleared: Record<string, any> = {};
    semCourses.forEach(c => {
      cleared[c.id] = {
        inputMode: 'marks',
        obtainedMarks: 0,
        totalMarks: 100,
        grade: 'F',
      };
    });
    setLinkedCourseInputs(cleared);
    localStorage.setItem(`studyflow_gpa_linked_inputs_${currentSemId}`, JSON.stringify(cleared));
    syncGpaToDashboard(cleared);
    triggerNotification('Simulation inputs reset to baseline.');
  };

  // Calculations for Linked Mode
  const calculateLinkedGpa = (inputs = linkedCourseInputs, activePolicy = policy) => {
    let totalWeightedPoints = 0;
    let totalGradedCredits = 0;
    let totalCredits = 0;

    semCourses.forEach(course => {
      totalCredits += course.credits;
      const meta = inputs[course.id];
      if (meta) {
        let pts = 0;
        if (meta.inputMode === 'marks') {
          const pct = meta.totalMarks > 0 ? (meta.obtainedMarks / meta.totalMarks) * 100 : 0;
          pts = calculateUogGrade(pct, activePolicy).points;
        } else {
          pts = getPointsFromGradeString(meta.grade, activePolicy);
        }
        totalWeightedPoints += pts * course.credits;
        totalGradedCredits += course.credits;
      }
    });

    const gpa = totalGradedCredits > 0 ? totalWeightedPoints / totalGradedCredits : 0;
    return { gpa, totalCredits: totalGradedCredits, totalPlanned: totalCredits };
  };

  // --- ACTIONS FOR MANUAL MODE ---
  const handleAddManualCourse = () => {
    const newCourse: ManualCourseRow = {
      id: Date.now().toString(),
      name: `Subject ${manualCourses.length + 1}`,
      credits: 3,
      inputMode: 'marks',
      obtainedMarks: 80,
      totalMarks: 100,
      grade: 'A',
    };
    const updated = [...manualCourses, newCourse];
    setManualCourses(updated);
    localStorage.setItem('studyflow_gpa_manual_courses', JSON.stringify(updated));
  };

  const handleRemoveManualCourse = (id: string) => {
    const updated = manualCourses.filter(c => c.id !== id);
    setManualCourses(updated);
    localStorage.setItem('studyflow_gpa_manual_courses', JSON.stringify(updated));
  };

  const handleUpdateManualCourse = (id: string, updates: Partial<ManualCourseRow>) => {
    const updated = manualCourses.map(c => {
      if (c.id === id) {
        const next = { ...c, ...updates };
        // Recalculate Grade/Points if marks changed
        if (updates.obtainedMarks !== undefined || updates.totalMarks !== undefined) {
          const obt = next.obtainedMarks;
          const tot = next.totalMarks > 0 ? next.totalMarks : 100;
          const pct = (obt / tot) * 100;
          next.grade = calculateUogGrade(pct, policy).grade;
        }
        return next;
      }
      return c;
    });
    setManualCourses(updated);
    localStorage.setItem('studyflow_gpa_manual_courses', JSON.stringify(updated));
  };

  const handleResetManualGpa = () => {
    const baseline = [
      { id: '1', name: 'Applied Physics', credits: 3, inputMode: 'marks', obtainedMarks: 85, totalMarks: 100, grade: 'A (4.00)' },
      { id: '2', name: 'Programming Fundamentals', credits: 4, inputMode: 'marks', obtainedMarks: 78, totalMarks: 100, grade: 'B (3.53)' },
      { id: '3', name: 'Calculus & Analytical Geometry', credits: 3, inputMode: 'grade', obtainedMarks: 0, totalMarks: 100, grade: 'B (3.00)' },
    ];
    setManualCourses(baseline);
    localStorage.setItem('studyflow_gpa_manual_courses', JSON.stringify(baseline));
    triggerNotification('Manual simulator rows re-initialized.');
  };

  const calculateManualGpa = (activePolicy = policy) => {
    let totalWeightedPoints = 0;
    let totalCredits = 0;

    manualCourses.forEach(c => {
      let pts = 0;
      if (c.inputMode === 'marks') {
        const pct = c.totalMarks > 0 ? (c.obtainedMarks / c.totalMarks) * 100 : 0;
        pts = calculateUogGrade(pct, activePolicy).points;
      } else {
        pts = getPointsFromGradeString(c.grade, activePolicy);
      }
      totalWeightedPoints += pts * c.credits;
      totalCredits += c.credits;
    });

    const gpa = totalCredits > 0 ? totalWeightedPoints / totalCredits : 0;
    return { gpa, totalCredits };
  };

  // --- ACTIONS FOR CGPA TAB ---
  const handleAddSemesterRow = () => {
    const newSem: SemesterRow = {
      id: Date.now().toString(),
      name: `Semester ${semesterRows.length + 1}`,
      gpa: 3.50,
      credits: 15,
    };
    const updated = [...semesterRows, newSem];
    setSemesterRows(updated);
    localStorage.setItem('studyflow_gpa_semesters', JSON.stringify(updated));
  };

  const handleRemoveSemesterRow = (id: string) => {
    const updated = semesterRows.filter(s => s.id !== id);
    setSemesterRows(updated);
    localStorage.setItem('studyflow_gpa_semesters', JSON.stringify(updated));
  };

  const handleUpdateSemesterRow = (id: string, field: 'gpa' | 'credits' | 'name', val: any) => {
    const updated = semesterRows.map(s => {
      if (s.id === id) {
        return {
          ...s,
          [field]: field === 'name' ? val : Number(val),
        };
      }
      return s;
    });
    setSemesterRows(updated);
    localStorage.setItem('studyflow_gpa_semesters', JSON.stringify(updated));
  };

  const handleResetCgpaRows = () => {
    const defaults = [
      { id: 's1', name: 'Semester 1', gpa: 3.65, credits: 16 },
      { id: 's2', name: 'Semester 2', gpa: 3.42, credits: 18 },
    ];
    setSemesterRows(defaults);
    localStorage.setItem('studyflow_gpa_semesters', JSON.stringify(defaults));
    triggerNotification('Cumulative semesters reset.');
  };

  const calculateCgpaFromRows = () => {
    let totalWeightedPoints = 0;
    let totalCredits = 0;

    semesterRows.forEach(s => {
      totalWeightedPoints += s.gpa * s.credits;
      totalCredits += s.credits;
    });

    const cgpa = totalCredits > 0 ? totalWeightedPoints / totalCredits : 0;
    return { cgpa, totalCredits };
  };

  const handlePriorCreditsChange = (val: number) => {
    setPriorCredits(val);
    localStorage.setItem('studyflow_gpa_prior', JSON.stringify({ credits: val, gpa: priorGpa }));
  };

  const handlePriorGpaChange = (val: number) => {
    setPriorGpa(val);
    localStorage.setItem('studyflow_gpa_prior', JSON.stringify({ credits: priorCredits, gpa: val }));
  };

  // Get active current term GPA to compute future cumulative projection
  const currentTermGpa = sgpaMode === 'linked' ? calculateLinkedGpa().gpa : calculateManualGpa().gpa;
  const currentTermCredits = sgpaMode === 'linked' ? calculateLinkedGpa().totalCredits : calculateManualGpa().totalCredits;

  const calculatePredictedCgpa = () => {
    const priorPoints = priorGpa * priorCredits;
    const currentPoints = currentTermGpa * currentTermCredits;
    const overallCredits = priorCredits + currentTermCredits;
    const projectedGpa = overallCredits > 0 ? (priorPoints + currentPoints) / overallCredits : currentTermGpa;
    return { projectedGpa, overallCredits };
  };

  const { gpa: simulatedSgpa, totalCredits: simulatedCredits } = sgpaMode === 'linked' ? calculateLinkedGpa() : calculateManualGpa();
  const { cgpa: calculatedCgpa, totalCredits: totalCgpaCredits } = calculateCgpaFromRows();
  const { projectedGpa: predictedCgpa, overallCredits: predictedCredits } = calculatePredictedCgpa();

  // Color mappings for GPA Ranges
  const getGpaColorClass = (val: number) => {
    if (val >= 3.7) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    if (val >= 3.3) return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
    if (val >= 2.7) return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
    if (val >= 2.0) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
              <Calculator className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-white tracking-tight">Academic Grade Analytics</h1>
          </div>
          <p className="text-slate-400 text-xs font-light mt-1">
            UOG Semester GPA Simulation & Lifetime Cumulative Academic Planner
          </p>
        </div>

        {/* Policy Selector & Tabs Container */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          {/* Active Grading Scheme Dropdown */}
          <div className="flex items-center justify-between sm:justify-start gap-2.5 px-3 py-1.5 bg-slate-950/30 rounded-xl border border-white/5">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold tracking-wider">Batch Scheme:</span>
            <CustomSelect
              value={policy}
              onChange={(val) => handlePolicyChange(val as 'batch25' | 'batch22_24')}
              options={[
                { value: 'batch25', label: 'Batch 25 Onward (New)' },
                { value: 'batch22_24', label: 'Batches 22-24 (Old)' },
              ]}
              className="!bg-transparent !border-none !py-0 !px-1 min-w-[220px]"
            />
          </div>

          {/* Global tab options */}
          <div className="flex p-0.5 bg-slate-950/20 rounded-xl border border-white/5 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('sgpa')}
              className={`flex-1 sm:flex-initial px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'sgpa'
                  ? 'bg-indigo-600/15 border border-indigo-500/20 text-indigo-300'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              SGPA Simulator
            </button>
            <button
              onClick={() => setActiveTab('cgpa')}
              className={`flex-1 sm:flex-initial px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'cgpa'
                  ? 'bg-indigo-600/15 border border-indigo-500/20 text-indigo-300'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              CGPA Planner
            </button>
            <button
              onClick={() => setActiveTab('scheme')}
              className={`flex-1 sm:flex-initial px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'scheme'
                  ? 'bg-indigo-600/15 border border-indigo-500/20 text-indigo-300'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Grading Policy
            </button>
          </div>
        </div>
      </div>

      {/* Sync Success Notification */}
      <AnimatePresence>
        {isSavedNotify && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2 font-mono"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>{notifyMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TAB 1: SGPA SIMULATOR */}
      {activeTab === 'sgpa' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Simulation Panel (Left 8 columns) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="relative z-20 bg-white/[0.03] border border-white/10 rounded-3xl p-5 backdrop-blur-md space-y-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-400" />
                    <span>Course-by-Course GPA Simulator</span>
                  </h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">Input obtained marks or pick grades to predict GPA outcomes</p>
                </div>

                {/* Sub-mode switcher */}
                <div className="flex p-0.5 bg-slate-950/20 rounded-lg border border-white/5 text-[10px] w-full sm:w-auto">
                  <button
                    onClick={() => setSgpaMode('linked')}
                    className={`flex-1 sm:flex-initial px-3 py-1 font-semibold rounded-md transition-all ${
                      sgpaMode === 'linked'
                        ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/20'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Active Semester
                  </button>
                  <button
                    onClick={() => setSgpaMode('manual')}
                    className={`flex-1 sm:flex-initial px-3 py-1 font-semibold rounded-md transition-all ${
                      sgpaMode === 'manual'
                        ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/20'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Custom Simulator
                  </button>
                </div>
              </div>

              {/* MODE A: LINKED SEMESTER COURSES */}
              {sgpaMode === 'linked' && (
                <div className="space-y-4">
                  {semCourses.length > 0 ? (
                    <div className="divide-y divide-white/5 space-y-4">
                      {semCourses.map(course => {
                        const state = linkedCourseInputs[course.id] || {
                          inputMode: 'marks',
                          obtainedMarks: 80,
                          totalMarks: 100,
                          grade: 'A',
                        };

                        const percent = Math.min(100, Math.max(0, state.obtainedMarks));
                        const gradeObj = calculateUogGrade(percent, policy);
                        const finalGrade = state.inputMode === 'marks' ? gradeObj.grade : getLetterFromGradeString(state.grade);
                        const finalPoints = state.inputMode === 'marks' ? gradeObj.points : getPointsFromGradeString(state.grade, policy);

                        return (
                          <div key={course.id} className="flex flex-wrap items-center justify-between gap-y-3 gap-x-4 pt-4 first:pt-0">
                            {/* Left course descriptor */}
                            <div className="flex items-center gap-3 min-w-[200px] flex-1">
                              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: course.color }} />
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-bold text-white font-mono uppercase shrink-0">{course.code}</span>
                                  <span className="text-[10px] text-slate-500 font-mono shrink-0">({course.credits} Credits)</span>
                                </div>
                                <h4 className="text-sm font-semibold text-slate-200 mt-0.5 truncate">{course.name}</h4>
                              </div>
                            </div>

                            {/* Middle inputs & Toggle */}
                            <div className="flex flex-nowrap items-center gap-2 justify-end ml-auto shrink-0">
                              {/* Toggle Mode */}
                              <div className="flex bg-slate-950/20 border border-white/5 rounded-lg p-0.5 text-[9px] font-mono font-bold shrink-0">
                                <button
                                  onClick={() => handleLinkedInputModeChange(course.id, 'marks')}
                                  className={`px-2 py-1 rounded-md ${state.inputMode === 'marks' ? 'bg-indigo-600/20 text-indigo-300' : 'text-slate-400'}`}
                                >
                                  MARKS
                                </button>
                                <button
                                  onClick={() => handleLinkedInputModeChange(course.id, 'grade')}
                                  className={`px-2 py-1 rounded-md ${state.inputMode === 'grade' ? 'bg-indigo-600/20 text-indigo-300' : 'text-slate-400'}`}
                                >
                                  GRADE
                                </button>
                              </div>

                              {/* Input Area */}
                              <div className="w-[80px] flex justify-center shrink-0">
                                {state.inputMode === 'marks' ? (
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={state.obtainedMarks}
                                    onChange={(e) => handleLinkedMarksChange(course.id, 'obtained', Number(e.target.value))}
                                    placeholder="Marks"
                                    className="w-full px-2 py-1 bg-slate-900 border border-white/10 rounded-lg text-xs text-white text-center font-mono focus:outline-none focus:border-indigo-500"
                                  />
                                ) : (
                                  <CustomSelect
                                    value={state.grade}
                                    onChange={(val) => handleLinkedGradeChange(course.id, val)}
                                    options={(policy === 'batch25' ? BATCH25_GRADES : BATCH22_24_GRADES).map(s => ({ value: s.label, label: s.label }))}
                                    className="w-full !py-1 !text-xs"
                                  />
                                )}
                              </div>

                              {/* Outputs Badges */}
                              <div className="flex items-center gap-1.5 w-[90px] justify-end shrink-0">
                                <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-lg whitespace-nowrap">
                                  {finalGrade} ({finalPoints.toFixed(2)})
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      <div className="flex justify-between items-center pt-4 border-t border-white/5">
                        <button
                          onClick={handleResetLinkedGpa}
                          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-[11px] font-semibold uppercase tracking-wider font-mono flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reset</span>
                        </button>
                        
                        <button
                          onClick={handleSaveLinkedGpa}
                          className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[11px] font-semibold uppercase tracking-wider font-mono flex items-center gap-1.5 shadow-md shadow-indigo-600/15 transition-all cursor-pointer"
                        >
                          <Save className="w-3 h-3" />
                          <span>Sync to Dashboard</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-slate-400 font-light">
                      <Compass className="w-10 h-10 text-slate-500 mx-auto mb-2 stroke-[1.5]" />
                      <p className="font-semibold text-white text-sm">No courses available in this semester</p>
                      <p className="text-xs text-slate-400 mt-1">Please populate Courses Page first or use the Custom Simulator Mode!</p>
                      <button
                        onClick={() => setSgpaMode('manual')}
                        className="mt-4 px-4 py-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 rounded-xl text-xs font-mono transition-all"
                      >
                        Launch Custom Simulator
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* MODE B: QUICK CUSTOM SIMULATOR */}
              {sgpaMode === 'manual' && (
                <div className="space-y-4">
                  <div className="space-y-3">
                    {manualCourses.map((course, idx) => {
                      const percent = Math.min(100, Math.max(0, course.obtainedMarks));
                      const gradeObj = calculateUogGrade(percent, policy);
                      const finalGrade = course.inputMode === 'marks' ? gradeObj.grade : getLetterFromGradeString(course.grade);
                      const finalPoints = course.inputMode === 'marks' ? gradeObj.points : getPointsFromGradeString(course.grade, policy);

                      return (
                        <div key={course.id} className="flex flex-wrap items-center justify-between gap-y-3 gap-x-4 bg-slate-950/10 border border-white/5 p-3 rounded-2xl">
                          {/* Left Inputs */}
                          <div className="flex flex-1 items-center gap-2 min-w-[220px]">
                            <span className="text-xs font-mono text-slate-500 font-bold shrink-0">#{idx + 1}</span>
                            <input
                              type="text"
                              value={course.name}
                              onChange={(e) => handleUpdateManualCourse(course.id, { name: e.target.value })}
                              placeholder="Course Title"
                              className="flex-1 min-w-[120px] px-3 py-1 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 truncate"
                            />
                            
                            <div className="shrink-0 w-[80px]">
                              <CustomSelect
                                value={String(course.credits)}
                                onChange={(val) => handleUpdateManualCourse(course.id, { credits: Number(val) })}
                                options={[0, 1, 2, 3, 4, 5, 6].map(c => ({ value: String(c), label: `${c} CH` }))}
                                className="w-full !py-1 !text-xs"
                              />
                            </div>
                          </div>

                          {/* Right Inputs */}
                          <div className="flex flex-nowrap items-center gap-2 justify-end ml-auto shrink-0">
                            {/* Toggle Mode */}
                            <div className="flex bg-slate-950/20 border border-white/5 rounded-lg p-0.5 text-[9px] font-mono font-bold shrink-0">
                              <button
                                  onClick={() => handleUpdateManualCourse(course.id, { inputMode: 'marks' })}
                                  className={`px-2 py-1 rounded-md ${course.inputMode === 'marks' ? 'bg-indigo-600/20 text-indigo-300' : 'text-slate-400'}`}
                              >
                                MARKS
                              </button>
                              <button
                                  onClick={() => handleUpdateManualCourse(course.id, { inputMode: 'grade' })}
                                  className={`px-2 py-1 rounded-md ${course.inputMode === 'grade' ? 'bg-indigo-600/20 text-indigo-300' : 'text-slate-400'}`}
                              >
                                GRADE
                              </button>
                            </div>

                            {/* Input Area */}
                            <div className="w-[80px] flex justify-center shrink-0">
                              {course.inputMode === 'marks' ? (
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={course.obtainedMarks}
                                  onChange={(e) => handleUpdateManualCourse(course.id, { obtainedMarks: Number(e.target.value) })}
                                  placeholder="Marks"
                                  className="w-full px-2 py-1 bg-slate-900 border border-white/10 rounded-lg text-xs text-white text-center font-mono focus:outline-none focus:border-indigo-500"
                                />
                              ) : (
                                <CustomSelect
                                  value={course.grade}
                                  onChange={(val) => handleUpdateManualCourse(course.id, { grade: val })}
                                  options={(policy === 'batch25' ? BATCH25_GRADES : BATCH22_24_GRADES).map(s => ({ value: s.label, label: s.label }))}
                                  className="w-full !py-1 !text-xs"
                                />
                              )}
                            </div>

                            {/* Outputs Badges */}
                            <div className="flex items-center gap-1.5 w-[90px] justify-end shrink-0">
                              <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-lg whitespace-nowrap">
                                {finalGrade} ({finalPoints.toFixed(2)})
                              </span>
                            </div>

                            {/* Remove Row Button */}
                            <button
                              onClick={() => handleRemoveManualCourse(course.id)}
                              className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer shrink-0"
                              title="Delete course row"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-white/5">
                    <button
                      onClick={handleResetManualGpa}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-[11px] font-semibold uppercase tracking-wider font-mono flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset Row Template</span>
                    </button>

                    <button
                      onClick={handleAddManualCourse}
                      className="px-4 py-1.5 bg-indigo-650 hover:bg-indigo-600 text-white rounded-xl text-[11px] font-semibold uppercase tracking-wider font-mono flex items-center gap-1.5 shadow-md shadow-indigo-650/10 transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Course Row</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Past Cumulative integration prediction section */}
            <div className="bg-white/[0.03] border border-white/10 p-5 rounded-3xl backdrop-blur-md space-y-4">
              <h3 className="text-sm font-bold text-white">
                <span>Overall predicted Cumulative GPA projection</span>
              </h3>
              <p className="text-xs text-slate-400 font-light leading-relaxed">
                Provide your prior credit counts and GPA baseline to preview how this simulated semester impacts your overall graduation score.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold tracking-widest text-slate-400 font-mono uppercase">PRIOR EARNED CREDITS</label>
                  <input 
                    type="number" 
                    min={0}
                    max={200}
                    value={priorCredits} 
                    onChange={(e) => handlePriorCreditsChange(Number(e.target.value))}
                    required
                    className="w-full px-4 py-2 bg-slate-900/40 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold tracking-widest text-slate-400 font-mono uppercase">PRIOR CUMULATIVE GPA</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    min={0}
                    max={4.0}
                    value={priorGpa} 
                    onChange={(e) => handlePriorGpaChange(Number(e.target.value))}
                    required
                    className="w-full px-4 py-2 bg-slate-900/40 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SGPA Visual Outcomes Panel (Right 4 columns) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/20 border border-indigo-500/20 p-6 rounded-3xl backdrop-blur-md space-y-6 text-center relative overflow-hidden">

              {/* Centered Circle GPA Gauge */}
              <div className="space-y-1 relative">
                <Award className="w-10 h-10 text-cyan-400 mx-auto mb-2" />
                <span className="text-[10px] font-mono tracking-widest text-slate-300 font-bold uppercase block">Simulated Term GPA</span>
                
                <div className="relative flex items-center justify-center my-4">
                  <svg className="w-32 h-32 transform -rotate-90">
                    {/* Background Ring */}
                    <circle cx="64" cy="64" r="50" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="6" fill="transparent" />
                    {/* Color Ring Arc */}
                    <circle 
                      cx="64" cy="64" r="50" 
                      stroke="url(#gradient)" 
                      strokeWidth="8" 
                      fill="transparent" 
                      strokeDasharray="314"
                      strokeDashoffset={314 - (314 * (simulatedSgpa / 4.0))}
                      strokeLinecap="round"
                      className="transition-all duration-700 ease-out"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#6366f1" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute flex flex-col justify-center items-center">
                    <span className="text-3xl font-extrabold font-mono text-white tracking-tight">{simulatedSgpa.toFixed(2)}</span>
                    <span className="text-[10px] text-slate-400 font-mono uppercase mt-0.5">Scale: 4.0</span>
                  </div>
                </div>

                <span className="text-[10px] text-slate-400 font-light block">
                  Aggregated from <span className="font-bold text-white font-mono">{simulatedCredits}</span> Credit Hours
                </span>
              </div>

              <div className="h-[1px] bg-white/10 w-3/4 mx-auto" />

              {/* Predicted Cumulative Output */}
              <div className="space-y-1">
                <Calculator className="w-4 h-4 text-purple-400 mx-auto" />
                <span className="text-[10px] font-mono tracking-widest text-slate-300 font-bold uppercase block">Overall Lifetime CGPA</span>
                <div className="text-2xl font-bold font-mono text-cyan-300">{predictedCgpa.toFixed(2)}</div>
                <span className="text-[9px] text-slate-400 font-light block font-mono">
                  Weighted sum across {predictedCredits} Credits
                </span>
              </div>

              {/* Status Badge */}
              <div className="pt-1">
                <span className={`text-[9px] font-mono font-bold tracking-widest uppercase px-3 py-1 rounded-full border ${getGpaColorClass(predictedCgpa)}`}>
                  {predictedCgpa >= 3.80 ? '★ Summa Cum Laude' : predictedCgpa >= 3.50 ? 'Dean\'s Honor List' : 'Good Academic Standing'}
                </span>
              </div>
            </div>

            {/* Interactive distribution summary */}
            <div className="bg-white/[0.03] border border-white/10 p-5 rounded-3xl backdrop-blur-md space-y-4">
              <div className="flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Simulation distribution summary</h3>
              </div>

              <div className="space-y-2 pt-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Total Simulated Courses:</span>
                  <span className="font-mono font-bold text-white">
                    {sgpaMode === 'linked' ? semCourses.length : manualCourses.length}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Average Credit Hours:</span>
                  <span className="font-mono font-bold text-white">
                    {simulatedCredits > 0 ? (simulatedCredits / (sgpaMode === 'linked' ? semCourses.length : manualCourses.length || 1)).toFixed(1) : 0} CH
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Performance Index:</span>
                  <span className="font-mono font-bold text-indigo-300">
                    {simulatedSgpa >= 3.7 ? 'High First-Class' : simulatedSgpa >= 3.0 ? 'Average Class' : 'Pass Criteria'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CGPA PLANNER (MULTI SEMESTER PLANNER) */}
      {activeTab === 'cgpa' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Semester list rows */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-5 backdrop-blur-md space-y-5">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span>Multi-Semester CGPA Accumulator</span>
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">Define past semester GPAs and their corresponding credit values to tabulate CGPA</p>
              </div>

              <div className="space-y-3">
                {semesterRows.map((sem, idx) => (
                  <div key={sem.id} className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-slate-950/10 border border-white/5 p-3.5 rounded-2xl">
                    <div className="flex flex-1 items-center gap-3 w-full sm:w-auto">
                      <span className="text-xs font-mono text-slate-500 font-bold">#{idx + 1}</span>
                      <input
                        type="text"
                        value={sem.name}
                        onChange={(e) => handleUpdateSemesterRow(sem.id, 'name', e.target.value)}
                        placeholder="Semester Title"
                        className="flex-1 min-w-[120px] px-3.5 py-1.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono text-slate-500 block uppercase">Semester GPA</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="4"
                          value={sem.gpa}
                          onChange={(e) => handleUpdateSemesterRow(sem.id, 'gpa', e.target.value)}
                          placeholder="SGPA"
                          className="w-16 px-2 py-1 bg-slate-900 border border-white/10 rounded-lg text-xs text-white font-mono focus:outline-none text-center"
                        />
                      </div>

                      <div className="space-y-1">
                        <span className="text-[9px] font-mono text-slate-500 block uppercase">Credits</span>
                        <input
                          type="number"
                          min="0"
                          max="30"
                          value={sem.credits}
                          onChange={(e) => handleUpdateSemesterRow(sem.id, 'credits', e.target.value)}
                          placeholder="Credits"
                          className="w-16 px-2 py-1 bg-slate-900 border border-white/10 rounded-lg text-xs text-white font-mono focus:outline-none text-center"
                        />
                      </div>

                      {/* Output weighted projection */}
                      <div className="min-w-[65px] text-right">
                        <span className="text-[9px] font-mono text-slate-500 block uppercase">Quality Pts</span>
                        <span className="text-xs font-mono font-bold text-cyan-400">
                          {(sem.gpa * sem.credits).toFixed(1)}
                        </span>
                      </div>

                      <button
                        onClick={() => handleRemoveSemesterRow(sem.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer self-end mb-0.5"
                        title="Delete semester row"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {semesterRows.length === 0 && (
                  <div className="py-8 text-center text-slate-400 font-light">
                    <Compass className="w-10 h-10 text-slate-500 mx-auto mb-2 stroke-[1.5]" />
                    <p className="font-semibold text-white">No Semester rows loaded</p>
                    <p className="text-xs text-slate-400 mt-1">Add rows below to model your overall CGPA milestones</p>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-white/5">
                <button
                  onClick={handleResetCgpaRows}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-[11px] font-semibold uppercase tracking-wider font-mono flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Semesters</span>
                </button>

                <button
                  onClick={handleAddSemesterRow}
                  className="px-4 py-1.5 bg-indigo-650 hover:bg-indigo-600 text-white rounded-xl text-[11px] font-semibold uppercase tracking-wider font-mono flex items-center gap-1.5 shadow-md shadow-indigo-650/10 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Semester</span>
                </button>
              </div>
            </div>
          </div>

          {/* Cumulative summary scorecard (Right 4 columns) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/20 border border-indigo-500/20 p-6 rounded-3xl backdrop-blur-md space-y-6 text-center">
              <div className="space-y-1">
                <Layers className="w-8 h-8 text-indigo-400 mx-auto mb-1" />
                <span className="text-[10px] font-mono tracking-widest text-slate-300 font-bold uppercase block">Calculated Cumulative GPA</span>
                <div className="text-4xl font-extrabold font-mono text-white tracking-tight my-2">{calculatedCgpa.toFixed(2)}</div>
                <span className="text-[10px] text-slate-400 font-light block">
                  Weighted across <span className="font-bold text-white font-mono">{totalCgpaCredits}</span> Semester Credit Hours
                </span>
              </div>

              <div className="h-[1px] bg-white/10 w-3/4 mx-auto" />

              <div className="space-y-2 text-left">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Academic Standing</h4>
                
                <div className="bg-slate-950/10 border border-white/5 p-3 rounded-2xl text-[11px] text-slate-300 leading-relaxed font-light">
                  {calculatedCgpa >= 3.80 ? (
                    <span>Outstanding! You are positioned for high honor distinctions with <strong className="text-emerald-400">Summa Cum Laude</strong> ranking.</span>
                  ) : calculatedCgpa >= 3.50 ? (
                    <span>Distinguished standing. Maintain this baseline to retain <strong className="text-indigo-400">Dean's List</strong> eligibility.</span>
                  ) : calculatedCgpa >= 2.00 ? (
                    <span>Satisfactory academic Standing. Clear credentials with satisfactory progress indexes.</span>
                  ) : (
                    <span>Satisfactory standing warning. Standard cumulative points are trending below target indices.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: UOG OFFICIAL GRADING POLICY TABLE */}
      {activeTab === 'scheme' && (
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 backdrop-blur-md space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
            <div className="flex items-center gap-2">
              <Percent className="w-5 h-5 text-indigo-400" />
              <div>
                <h2 className="text-base font-bold text-white">University of Gujrat (UOG) Grading Policy Table</h2>
                <p className="text-xs text-slate-400 font-light">Official Higher Education Commission (HEC) compliant GPA mapping thresholds</p>
              </div>
            </div>
            
            <div className="text-[11px] font-mono font-bold bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-xl text-indigo-300">
              Active: {policy === 'batch25' ? 'Batch 25 Onward Scheme' : 'Batches 22-24 Scheme'}
            </div>
          </div>

          <div className="max-h-[500px] overflow-y-auto pr-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 scrollbar-thin scrollbar-thumb-white/10">
            {(policy === 'batch25' ? BATCH25_GRADES : BATCH22_24_GRADES).map((s, idx) => {
              let rangeText = "";
              let remarksText = "";
              if (policy === 'batch22_24') {
                if (s.grade === 'A+') { rangeText = "≥ 85%"; remarksText = "Exceptional"; }
                else if (s.grade === 'A') { rangeText = "80-84%"; remarksText = "Outstanding"; }
                else if (s.grade === 'B+') { rangeText = "75-79%"; remarksText = "Excellent"; }
                else if (s.grade === 'B') { rangeText = "70-74%"; remarksText = "Very Good"; }
                else if (s.grade === 'B-') { rangeText = "65-69%"; remarksText = "Good"; }
                else if (s.grade === 'C+') { rangeText = "60-64%"; remarksText = "Average"; }
                else if (s.grade === 'C') { rangeText = "55-59%"; remarksText = "Satisfactory"; }
                else if (s.grade === 'D') { rangeText = "50-54%"; remarksText = "Pass"; }
                else { rangeText = "< 50%"; remarksText = "Fail"; }
              } else {
                if (s.points === 4.00) { rangeText = "≥ 85%"; remarksText = "Excellent"; }
                else if (s.points === 3.93) { rangeText = "84%"; remarksText = "Excellent"; }
                else if (s.points === 3.87) { rangeText = "83%"; remarksText = "Excellent"; }
                else if (s.points === 3.80) { rangeText = "82%"; remarksText = "Excellent"; }
                else if (s.points === 3.73) { rangeText = "81%"; remarksText = "Excellent"; }
                else if (s.points === 3.67) { rangeText = "80%"; remarksText = "Excellent"; }
                else if (s.points === 3.60) { rangeText = "79%"; remarksText = "Very Good"; }
                else if (s.points === 3.53) { rangeText = "78%"; remarksText = "Very Good"; }
                else if (s.points === 3.47) { rangeText = "77%"; remarksText = "Very Good"; }
                else if (s.points === 3.40) { rangeText = "76%"; remarksText = "Very Good"; }
                else if (s.points === 3.33) { rangeText = "75%"; remarksText = "Very Good"; }
                else if (s.points === 3.27) { rangeText = "74%"; remarksText = "Very Good"; }
                else if (s.points === 3.20) { rangeText = "73%"; remarksText = "Very Good"; }
                else if (s.points === 3.13) { rangeText = "72%"; remarksText = "Very Good"; }
                else if (s.points === 3.07) { rangeText = "71%"; remarksText = "Very Good"; }
                else if (s.points === 3.00) { rangeText = "70%"; remarksText = "Very Good"; }
                else if (s.points === 2.90) { rangeText = "69%"; remarksText = "Very Good"; }
                else if (s.points === 2.80) { rangeText = "68%"; remarksText = "Very Good"; }
                else if (s.points === 2.70) { rangeText = "67%"; remarksText = "Very Good"; }
                else if (s.points === 2.60) { rangeText = "66%"; remarksText = "Very Good"; }
                else if (s.points === 2.50) { rangeText = "65%"; remarksText = "Very Good"; }
                else if (s.points === 2.40) { rangeText = "64%"; remarksText = "Good"; }
                else if (s.points === 2.30) { rangeText = "63%"; remarksText = "Good"; }
                else if (s.points === 2.20) { rangeText = "62%"; remarksText = "Good"; }
                else if (s.points === 2.10) { rangeText = "61%"; remarksText = "Good"; }
                else if (s.points === 2.00) { rangeText = "60%"; remarksText = "Good"; }
                else if (s.points === 1.90) { rangeText = "59%"; remarksText = "Good"; }
                else if (s.points === 1.80) { rangeText = "58%"; remarksText = "Good"; }
                else if (s.points === 1.70) { rangeText = "57%"; remarksText = "Good"; }
                else if (s.points === 1.60) { rangeText = "56%"; remarksText = "Pass"; }
                else if (s.points === 1.50) { rangeText = "55%"; remarksText = "Pass"; }
                else if (s.points === 1.40) { rangeText = "54%"; remarksText = "Low Pass"; }
                else if (s.points === 1.30) { rangeText = "53%"; remarksText = "Low Pass"; }
                else if (s.points === 1.20) { rangeText = "52%"; remarksText = "Low Pass"; }
                else if (s.points === 1.10) { rangeText = "51%"; remarksText = "Low Pass"; }
                else if (s.points === 1.00) { rangeText = "50%"; remarksText = "Low Pass"; }
                else { rangeText = "< 50%"; remarksText = "Fail"; }
              }
              
              let colorBg = "from-indigo-500/10 to-indigo-500/5 border-indigo-500/10 text-indigo-200";
              if (s.grade.startsWith('A')) colorBg = "from-emerald-500/10 to-emerald-500/5 border-emerald-500/10 text-emerald-200";
              else if (s.grade.startsWith('B')) colorBg = "from-indigo-500/10 to-indigo-500/5 border-indigo-500/10 text-indigo-200";
              else if (s.grade.startsWith('C')) colorBg = "from-cyan-500/10 to-cyan-500/5 border-cyan-500/10 text-cyan-200";
              else if (s.grade.startsWith('D')) colorBg = "from-yellow-500/10 to-yellow-500/5 border-yellow-500/10 text-yellow-200";
              else colorBg = "from-rose-500/10 to-rose-500/5 border-rose-500/10 text-rose-200";

              return (
                <div 
                  key={idx}
                  className={`bg-gradient-to-b ${colorBg} border p-4 rounded-2xl flex flex-col justify-between h-28`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-bold font-mono tracking-wider">{rangeText}</span>
                    <span className="px-2 py-0.5 rounded-md bg-white/10 text-xs font-mono font-bold">{s.grade}</span>
                  </div>
                  
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-[9px] block uppercase font-mono tracking-widest text-slate-500 dark:text-slate-400">GPA Points</span>
                      <span className="text-xl font-extrabold font-mono leading-none">{s.points.toFixed(2)}</span>
                    </div>
                    <span className="text-[11px] font-medium opacity-80">{remarksText}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-start gap-2.5 rounded-2xl leading-relaxed">
            <Info className="w-4 h-4 flex-shrink-0 text-indigo-400 mt-0.5" />
            <div>
              <p className="font-semibold">Grading Calculation Note:</p>
              <p className="text-slate-400 mt-0.5 font-light">
                Individual subject GPA points are allocated as singular thresholds mapping directly from percentage of obtained marks out of total marks. The final Semester GPA (SGPA) and Cumulative GPA (CGPA) are computed by taking the weighted sum of grade points (GradePoints × CreditHours) and dividing by the total completed credit hours.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
