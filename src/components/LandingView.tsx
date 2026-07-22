import React, { useState, FormEvent } from "react";
import { motion } from "motion/react";
import {
  Calendar,
  BookOpen,
  GraduationCap,
  CheckCircle,
  Shield,
  Compass,
  ArrowRight,
} from "lucide-react";

interface LandingViewProps {
  onGetStarted: (name?: string, department?: string) => void;
  hasData?: boolean;
}

export default function LandingView({
  onGetStarted,
  hasData,
}: LandingViewProps) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onGetStarted(name.trim(), department.trim() || undefined);
    }
  };

  return (
    <div className="relative min-h-screen text-slate-100 flex flex-col justify-between overflow-x-hidden">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 pt-16 pb-12 sm:pt-24 sm:pb-20 text-center relative z-10 flex-grow flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-xs sm:text-sm text-indigo-300 font-medium mb-6 mx-auto hover:bg-white/10 transition-colors"
        >
          <span>Your Ultimate Academic Planner</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6"
        >
          Plan smarter. <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Study better.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-light"
        >
          Ditch the fragmented apps. StudyFlow is a modern, unified semester
          workspace with an elegant glassmorphism dashboard, dynamic timetable,
          and GPA engine.
        </motion.p>

        {showForm ? (
          <motion.form
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto bg-white/[0.03] border border-white/10 p-6 rounded-3xl backdrop-blur-md"
            onSubmit={handleSubmit}
          >
            <h3 className="text-xl font-bold text-white mb-4">
              Let's get to know you
            </h3>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              required
              className="w-full px-4 py-3 bg-slate-900/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition-colors mb-3 placeholder:text-slate-500"
            />
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="Department Name (Optional)"
              className="w-full px-4 py-3 bg-slate-900/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition-colors mb-4 placeholder:text-slate-500"
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-medium hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-[2] px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/25 transition-all"
              >
                Launch Workspace
              </button>
            </div>
          </motion.form>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto"
          >
            <button
              onClick={() => {
                if (hasData) {
                  onGetStarted();
                } else {
                  setShowForm(true);
                }
              }}
              id="btn-get-started"
              className="group px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl font-medium shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => onGetStarted()}
              id="btn-continue-planning"
              className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-medium backdrop-blur-md hover:bg-white/10 transition-colors flex items-center justify-center gap-2 active:scale-95"
            >
              Continue Planning
            </button>
          </motion.div>
        )}

        {/* Visual Mockup Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 1,
            delay: 0.6,
            type: "spring",
            stiffness: 50,
          }}
          className="mt-16 relative mx-auto max-w-4xl rounded-2xl border border-white/15 bg-slate-950/40 p-3 backdrop-blur-xl shadow-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-transparent to-cyan-500/10 rounded-2xl pointer-events-none" />
          <div className="rounded-xl overflow-hidden bg-slate-900/60 p-5 border border-white/5 text-left">
            {/* Header Mockup */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-5">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-xs text-slate-400 font-mono ml-2">
                  studyflow.app / dashboard
                </span>
              </div>
              <div className="px-3 py-1 rounded bg-white/5 border border-white/5 text-[10px] font-mono text-cyan-400">
                Active: Fall Semester
              </div>
            </div>

            {/* Dashboard Mockup Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/5 border border-white/10 p-4 rounded-xl backdrop-blur-md">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs text-slate-400 font-medium">
                    Semester GPA
                  </span>
                  <GraduationCap className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl font-bold font-sans text-white">3.82 / 4.00</div>
                <div className="text-[10px] text-emerald-400 mt-1">
                  ▲ Projected Dean's List
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 p-4 rounded-xl backdrop-blur-md">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs text-slate-400 font-medium">
                    Pending Work
                  </span>
                  <CheckCircle className="w-4 h-4 text-rose-400" />
                </div>
                <div className="text-2xl font-bold font-sans text-white">
                  3 Assignments
                </div>
                <div className="text-[10px] text-indigo-400 mt-1">
                  1 due in next 48 hours
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 p-4 rounded-xl backdrop-blur-md">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs text-slate-400 font-medium">
                    Avg Attendance
                  </span>
                  <Compass className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold font-sans text-white">92.4 %</div>
                <div className="text-[10px] text-emerald-400 mt-1">
                  ● Above target threshold
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Features Grid Section */}
      <div className="bg-slate-950/20 py-20 border-t border-white/5 relative z-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              Everything you need for academic success
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto font-light">
              Crafted with a sleek interface so you can look forward to staying
              organized.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feat 1 */}
            <motion.div
              whileHover={{ y: -5 }}
              className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-md hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-4 border border-indigo-500/20">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Weekly Timetable
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed font-light">
                Visualize your week from 8 AM to 6 PM with custom subject colors
                and locations.
              </p>
            </motion.div>

            {/* Feat 2 */}
            <motion.div
              whileHover={{ y: -5 }}
              className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-md hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-4 border border-purple-500/20">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Course Vault
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed font-light">
                Store instructors, classrooms, materials, and track attendance
                levels interactively.
              </p>
            </motion.div>

            {/* Feat 3 */}
            <motion.div
              whileHover={{ y: -5 }}
              className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-md hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-4 border border-cyan-500/20">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Assignment Tracker
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed font-light">
                Set priorites, manage completion status, estimate work, and
                never miss late deadlines.
              </p>
            </motion.div>

            {/* Feat 4 */}
            <motion.div
              whileHover={{ y: -5 }}
              className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-md hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400 mb-4 border border-rose-500/20">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                GPA Simulator
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed font-light">
                Calculate real-time term GPA and simulate projected GPAs based
                on prospective course grades.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-xs text-slate-500 relative z-10 bg-slate-950/40">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© 2026 StudyFlow. Plan smarter. Study better.</p>
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <Shield className="w-3.5 h-3.5 text-indigo-400" />
            <span>Secure 100% Offline Browser Storage</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
