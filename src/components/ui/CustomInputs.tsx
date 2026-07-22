import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

function useOnClickOutside(ref: React.RefObject<HTMLElement | null>, handler: (event: MouseEvent) => void) {
  useEffect(() => {
    const listener = (event: MouseEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };
    document.addEventListener('mousedown', listener);
    return () => document.removeEventListener('mousedown', listener);
  }, [ref, handler]);
}

// ----------------------------------------------------------------------
// CUSTOM SELECT
// ----------------------------------------------------------------------
export interface CustomSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  className?: string;
  placeholder?: string;
}

export function CustomSelect({ value, onChange, options, className = "", placeholder }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOnClickOutside(ref, () => setIsOpen(false));

  const selectedOption = options.find(o => o.value === value);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white hover:border-indigo-500/50 transition-colors focus:outline-none focus:border-indigo-500 ${className}`}
      >
        <span className="truncate">{selectedOption ? selectedOption.label : (placeholder || 'Select...')}</span>
        <ChevronDown className={`w-4 h-4 shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute z-50 w-full mt-1 bg-dropdown border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto no-scrollbar"
          >
            <div className="p-1 flex flex-col gap-0.5">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors ${
                    option.value === value 
                      ? 'bg-indigo-500/20 text-indigo-300 font-medium' 
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ----------------------------------------------------------------------
// CUSTOM TIME PICKER
// ----------------------------------------------------------------------
export interface CustomTimePickerProps {
  value: string; // HH:mm (24 hour)
  onChange: (val: string) => void;
  className?: string;
}

export function CustomTimePicker({ value, onChange, className = "" }: CustomTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOnClickOutside(ref, () => setIsOpen(false));

  const parseTime = (timeStr: string) => {
    const [h, m] = (timeStr || "09:00").split(':').map(Number);
    const isPM = h >= 12;
    const hour12 = h % 12 || 12;
    return { h, m, isPM, hour12 };
  };

  const { m, isPM, hour12 } = parseTime(value);
  
  const formattedTime = `${hour12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${isPM ? 'PM' : 'AM'}`;

  const updateTime = (newH: number, newM: number, newIsPM: boolean) => {
    let finalH = newH;
    if (newIsPM && finalH < 12) finalH += 12;
    if (!newIsPM && finalH === 12) finalH = 0;
    
    const hStr = finalH.toString().padStart(2, '0');
    const mStr = newM.toString().padStart(2, '0');
    onChange(`${hStr}:${mStr}`);
  };

  // Generate lists
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white hover:border-indigo-500/50 transition-colors focus:outline-none focus:border-indigo-500 ${className}`}
      >
        <span className="truncate">{formattedTime}</span>
        <Clock className="w-4 h-4 shrink-0 text-slate-400" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute z-50 mt-1 right-0 w-64 bg-dropdown border border-white/10 rounded-xl shadow-2xl p-2 flex gap-2"
          >
            {/* Hours */}
            <div className="flex-1 flex flex-col items-center h-48 overflow-y-auto no-scrollbar gap-1">
              {hours.map((hr) => (
                <button
                  key={`h-${hr}`}
                  type="button"
                  onClick={() => updateTime(hr, m, isPM)}
                  className={`w-full py-1.5 text-xs rounded-lg transition-colors ${
                    hr === hour12 ? 'bg-indigo-500/20 text-indigo-300 font-medium' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {hr.toString().padStart(2, '0')}
                </button>
              ))}
            </div>
            
            {/* Minutes */}
            <div className="flex-1 flex flex-col items-center h-48 overflow-y-auto no-scrollbar gap-1 border-l border-white/5 pl-2">
              {minutes.map((min) => (
                <button
                  key={`m-${min}`}
                  type="button"
                  onClick={() => updateTime(hour12, min, isPM)}
                  className={`w-full py-1.5 text-xs rounded-lg transition-colors ${
                    min === m ? 'bg-indigo-500/20 text-indigo-300 font-medium' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {min.toString().padStart(2, '0')}
                </button>
              ))}
            </div>

            {/* AM/PM */}
            <div className="flex-1 flex flex-col items-center justify-center h-48 border-l border-white/5 pl-2 gap-2">
              <button
                type="button"
                onClick={() => updateTime(hour12, m, false)}
                className={`w-full py-3 text-xs rounded-lg transition-colors ${
                  !isPM ? 'bg-indigo-500/20 text-indigo-300 font-medium' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                AM
              </button>
              <button
                type="button"
                onClick={() => updateTime(hour12, m, true)}
                className={`w-full py-3 text-xs rounded-lg transition-colors ${
                  isPM ? 'bg-indigo-500/20 text-indigo-300 font-medium' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                PM
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ----------------------------------------------------------------------
// CUSTOM DATE PICKER
// ----------------------------------------------------------------------
export interface CustomDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (val: string) => void;
  className?: string;
}

export function CustomDatePicker({ value, onChange, className = "" }: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOnClickOutside(ref, () => setIsOpen(false));

  const selectedDate = value ? new Date(value) : new Date();
  
  // To avoid timezone issues, manually construct
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const handleSelectDate = (day: number) => {
    const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    onChange(`${yyyy}-${mm}-${dd}`);
    setIsOpen(false);
  };

  const daysList = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddingDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const formattedSelected = value ? new Date(value + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Select Date';

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white hover:border-indigo-500/50 transition-colors focus:outline-none focus:border-indigo-500 ${className}`}
      >
        <span className="truncate">{formattedSelected}</span>
        <Calendar className="w-4 h-4 shrink-0 text-slate-400" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute z-50 mt-1 right-0 w-64 bg-dropdown border border-white/10 rounded-xl shadow-2xl p-3"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3 text-slate-200">
              <button type="button" onClick={prevMonth} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="text-xs font-semibold">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </div>
              <button type="button" onClick={nextMonth} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Days of week */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="text-center text-[10px] font-medium text-slate-500">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {paddingDays.map(i => (
                <div key={`pad-${i}`} className="h-7" />
              ))}
              {daysList.map(day => {
                const isSelected = value === `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isToday = new Date().toDateString() === new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toDateString();
                
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleSelectDate(day)}
                    className={`h-7 w-full flex items-center justify-center text-[11px] rounded-md transition-colors
                      ${isSelected ? 'bg-indigo-500 text-white font-bold shadow-md shadow-indigo-500/20' 
                        : isToday ? 'bg-white/10 text-indigo-300 font-bold hover:bg-white/20'
                        : 'text-slate-300 hover:bg-white/10 hover:text-white'}
                    `}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
