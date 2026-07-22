import { useState, useEffect } from 'react';
import { Clock, MapPin, User, ArrowRight, Compass } from 'lucide-react';
import { Course, Semester } from '../types';

interface TimetableViewProps {
  currentSemester: Semester | null;
  courses: Course[];
  onNavigate: (tab: string) => void;
}

export default function TimetableView({ currentSemester, courses, onNavigate }: TimetableViewProps) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;
  const [selectedMobileDay, setSelectedMobileDay] = useState<typeof days[number]>('Monday');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  const currentSemId = currentSemester?.id;
  const semCourses = courses.filter(c => c.semesterId === currentSemId);

  // Group schedules by day
  const getSchedulesForDay = (day: typeof days[number]) => {
    return semCourses.flatMap(course => 
      course.schedules
        .filter(s => s.day === day)
        .map(s => ({ ...s, course }))
    ).sort((a, b) => a.startTime.localeCompare(b.startTime));
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

  // Helper to determine active class based on current time
  const getClassStatus = (day: string, start: string, end: string) => {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = daysOfWeek[currentTime.getDay()];
    
    if (today !== day) return 'inactive';

    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    const nowMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    if (nowMinutes >= startMinutes && nowMinutes <= endMinutes) return 'live';
    if (nowMinutes > endMinutes) return 'completed';
    return 'upcoming';
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Weekly Timetable</h1>
          <p className="text-slate-400 text-sm font-light">
            Your structured course matrix for <span className="text-indigo-300 font-semibold">{currentSemester?.name || 'N/A'}</span>
          </p>
        </div>
        
        <button
          onClick={() => onNavigate('courses')}
          className="px-5 py-2.5 bg-white/5 border border-white/10 hover:border-indigo-500/30 text-white rounded-2xl text-xs font-semibold uppercase tracking-wider font-mono flex items-center gap-2 transition-all active:scale-95"
        >
          <span>Modify Lectures Slots</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Mobile Day Selector Tabs (Shown on small screens only) */}
      <div className="block lg:hidden bg-white/[0.02] border border-white/10 p-2 rounded-2xl backdrop-blur-md">
        <div className="flex overflow-x-auto gap-1 no-scrollbar py-1">
          {days.map(day => (
            <button
              key={day}
              onClick={() => setSelectedMobileDay(day)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 font-mono transition-all ${
                selectedMobileDay === day 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Weekly Column Grid Layout */}
      <div className="hidden lg:grid lg:grid-cols-5 gap-4 items-start">
        {days.map(day => {
          const slots = getSchedulesForDay(day);

          return (
            <div key={day} className="space-y-4">
              {/* Column Header */}
              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl text-center font-mono text-xs">
                <div className="font-bold text-white uppercase tracking-wider">{day}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{slots.length} Lectures</div>
              </div>

              {/* Day slots list */}
              <div className="space-y-3">
                {slots.map(slot => {
                  const status = getClassStatus(day, slot.startTime, slot.endTime);
                  
                  return (
                    <div 
                      key={slot.id}
                      className={`p-3.5 rounded-2xl backdrop-blur-md border text-left transition-all relative overflow-hidden flex flex-col justify-between min-h-[140px] group ${
                        status === 'live' 
                          ? 'bg-emerald-500/[0.03] border-emerald-500/40 shadow-md shadow-emerald-500/5' 
                          : status === 'completed'
                            ? 'bg-slate-950/25 border-white/5 opacity-55'
                            : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                      }`}
                    >
                      {/* Course Accent Indicator */}
                      <div className="absolute top-0 left-0 bottom-0 w-1" style={{ backgroundColor: slot.course.color }} />

                      <div className="space-y-1.5 pl-2.5">
                        {/* Course Code and Status Pill */}
                        <div className="flex justify-between items-center gap-1.5">
                          <span className="text-[9px] font-mono tracking-wider font-semibold uppercase text-slate-400 truncate max-w-[60px]">
                            {slot.course.code}
                          </span>
                          {status === 'live' && (
                            <span className="text-[8px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.5 rounded-full uppercase animate-pulse border border-emerald-500/20 shrink-0">
                              LIVE
                            </span>
                          )}
                          {status === 'completed' && (
                            <span className="text-[8px] bg-slate-500/10 text-slate-500 px-1.5 py-0.5 rounded-full uppercase shrink-0">
                              DONE
                            </span>
                          )}
                        </div>

                        {/* Course Name */}
                        <h4 className="text-xs font-bold text-white line-clamp-2 leading-tight group-hover:text-indigo-300 transition-colors">
                          {slot.course.name}
                        </h4>
                      </div>

                      {/* Schedule metadata footer */}
                      <div className="space-y-1 pt-3 border-t border-white/5 pl-2.5 text-[10px] text-slate-300 font-light font-mono">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{formatTimeSlot(slot.startTime, slot.endTime)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{slot.course.room}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {slots.length === 0 && (
                  <div className="py-8 text-center text-slate-500 text-[11px] italic border border-dashed border-white/5 rounded-2xl p-4 bg-slate-900/5">
                    No classes
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile single day list timeline (Shown on small screens only) */}
      <div className="block lg:hidden space-y-4">
        <div className="p-4 bg-white/[0.03] border border-white/10 rounded-2xl flex justify-between items-center text-xs">
          <span className="font-mono text-slate-400 uppercase font-semibold">DAY TIMELINE SCHEDULE:</span>
          <span className="font-bold text-indigo-300">{selectedMobileDay}</span>
        </div>

        <div className="space-y-4">
          {getSchedulesForDay(selectedMobileDay).length > 0 ? (
            getSchedulesForDay(selectedMobileDay).map(slot => {
              const status = getClassStatus(selectedMobileDay, slot.startTime, slot.endTime);

              return (
                <div 
                  key={slot.id}
                  className={`p-4 rounded-2xl backdrop-blur-md border flex gap-4 transition-all relative overflow-hidden ${
                    status === 'live' 
                      ? 'bg-emerald-500/[0.03] border-emerald-500/40' 
                      : status === 'completed'
                        ? 'bg-slate-950/25 border-white/5 opacity-55'
                        : 'bg-white/[0.02] border-white/10'
                  }`}
                >
                  {/* Left Color strip */}
                  <div className="w-1.5 rounded-full shrink-0" style={{ backgroundColor: slot.course.color }} />

                  {/* Body details */}
                  <div className="flex-grow space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono tracking-wider font-semibold text-slate-400">{slot.course.code}</span>
                          <span className="text-[9px] bg-white/5 border border-white/5 px-2 py-0.5 rounded text-slate-300 font-mono">
                            {slot.course.credits} Credits
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-white mt-1">{slot.course.name}</h3>
                      </div>

                      {status === 'live' && (
                        <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full uppercase animate-pulse border border-emerald-500/20 shrink-0">
                          LIVE NOW
                        </span>
                      )}
                      {status === 'completed' && (
                        <span className="text-[9px] bg-slate-500/10 text-slate-500 px-2 py-0.5 rounded-full uppercase shrink-0">
                          COMPLETED
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-slate-300 pt-1 border-t border-white/5 font-light">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatTimeSlot(slot.startTime, slot.endTime)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{slot.course.room}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{slot.course.instructor}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center border border-dashed border-white/10 rounded-2xl bg-slate-900/10 p-6 text-slate-400 font-light">
              <Compass className="w-10 h-10 text-slate-500 mx-auto mb-3 stroke-[1.5]" />
              <p className="font-semibold text-white text-sm">No lectures scheduled</p>
              <p className="text-xs text-slate-400 mt-1">Enjoy your study break on {selectedMobileDay}!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
