import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  Palette, Download, Upload, CheckCircle2, 
  Sliders, AlertTriangle, User as UserIcon
} from 'lucide-react';
import { AppSettings, StudyFlowData, User } from '../types';
import ConfirmModal from './ui/ConfirmModal';

interface SettingsViewProps {
  settings: AppSettings;
  data: StudyFlowData;
  user: User;
  onUpdateSettings: (settings: AppSettings) => void;
  onImportData: (imported: StudyFlowData) => void;
  onResetData: () => void;
  onUpdateUser: (user: User) => void;
}

export default function SettingsView({
  settings,
  data,
  user,
  onUpdateSettings,
  onImportData,
  onResetData,
  onUpdateUser,
}: SettingsViewProps) {
  const [successMsg, setSuccessMsg] = useState('');
  const [profileName, setProfileName] = useState(user.name);
  const [departmentName, setDepartmentName] = useState(user.department || '');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const colors = [
    { name: 'Classic Indigo', hex: '#6366f1' },
    { name: 'Emerald Wave', hex: '#10b981' },
    { name: 'Cyan Spark', hex: '#06b6d4' },
    { name: 'Purple Dream', hex: '#a855f7' },
    { name: 'Rose Petal', hex: '#f43f5e' },
    { name: 'Orange Sunset', hex: '#f97316' },
  ];

  const handleAccentChange = (hex: string) => {
    onUpdateSettings({
      ...settings,
      accentColor: hex,
    });
    showSuccess('Accent color theme updated successfully.');
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (profileName.trim()) {
      onUpdateUser({ ...user, name: profileName.trim(), department: departmentName.trim() || undefined });
      showSuccess('Profile details updated successfully.');
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Export all application data to a single JSON file
  const handleExportData = () => {
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `studyflow_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showSuccess('StudyFlow database file generated and downloaded successfully.');
    } catch (e) {
      alert('Failed to compile data export.');
    }
  };

  // Trigger file browser for imports
  const handleImportTrigger = () => {
    fileInputRef.current?.click();
  };

  // Process selected file
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        
        // Basic structural validations
        if (!parsed.user || !parsed.semesters || !parsed.courses || !parsed.assignments) {
          throw new Error('Missing essential database attributes.');
        }

        onImportData(parsed);
        showSuccess('StudyFlow database successfully imported and loaded! Hot-reload complete.');
      } catch (err: any) {
        alert(`Failed to import backup file. Error: ${err.message || 'Invalid JSON format'}`);
      }
    };
    reader.readAsText(file);
  };

  const handleResetClick = () => {
    setShowResetConfirm(true);
  };

  const confirmReset = () => {
    onResetData();
    showSuccess('Application state reverted to original sample configurations.');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Title Header */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">System Settings</h1>
        <p className="text-slate-400 text-sm font-light">
          Personalize visual accent themes and manage secure offline browser databases
        </p>
      </div>

      {successMsg && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-center gap-2 font-mono"
        >
          <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          <span>{successMsg}</span>
        </motion.div>
      )}

      {/* Main Grid Content Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Card: Appearance Settings */}
        <div className="bg-white/[0.03] border border-white/10 p-6 rounded-3xl backdrop-blur-md space-y-6">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-white">Theme & Branding</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold tracking-widest text-slate-400 font-mono">ACCENT CHROMATIC COLOR</span>
              <p className="text-xs text-slate-400 font-light mb-3">Choose the primary visual tint used in backgrounds, countdowns, and details</p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {colors.map(col => {
                  const isActive = settings.accentColor === col.hex;
                  return (
                    <button
                      key={col.hex}
                      onClick={() => handleAccentChange(col.hex)}
                      className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                        isActive 
                          ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-lg' 
                          : 'bg-slate-950/20 border-white/5 text-slate-400 hover:text-white hover:border-white/10'
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full shrink-0 border border-white/10" style={{ backgroundColor: col.hex }} />
                      <span className="text-xs font-medium font-sans truncate">{col.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="h-[1px] bg-white/5 pt-2" />

            {/* Workspace Lighting Theme Selector */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold tracking-widest text-slate-400 font-mono">WORKSPACE LIGHTING</span>
              <p className="text-xs text-slate-400 font-light mb-3">Choose between a premium dark theme or a clean, elegant light-glass theme</p>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    onUpdateSettings({ ...settings, theme: 'dark' });
                    showSuccess('Workspace switched to Ambient Dark Mode.');
                  }}
                  className={`p-3.5 rounded-xl border text-left flex flex-col justify-between h-20 transition-all cursor-pointer ${
                    settings.theme === 'dark'
                      ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-lg'
                      : 'bg-slate-950/20 border-white/5 text-slate-400 hover:text-white hover:border-white/10'
                  }`}
                >
                  <span className="text-xs font-semibold">Ambient Dark</span>
                  <span className="text-[10px] text-slate-400 font-light mt-1">Late Night Study</span>
                </button>
                <button
                  onClick={() => {
                    onUpdateSettings({ ...settings, theme: 'light' });
                    showSuccess('Workspace switched to Elegant Light Mode.');
                  }}
                  className={`p-3.5 rounded-xl border text-left flex flex-col justify-between h-20 transition-all cursor-pointer ${
                    settings.theme === 'light'
                      ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-lg'
                      : 'bg-slate-950/20 border-white/5 text-slate-400 hover:text-white hover:border-white/10'
                  }`}
                >
                  <span className="text-xs font-semibold">Elegant Light</span>
                  <span className="text-[10px] text-slate-400 font-light mt-1">Bright & Clear Day</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column Container */}
        <div className="space-y-8">
          
          {/* Profile Settings Card */}
          <div className="bg-white/[0.03] border border-white/10 p-6 rounded-3xl backdrop-blur-md space-y-6">
            <div className="flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-indigo-400" />
              <h3 className="text-lg font-bold text-white">Profile Details</h3>
            </div>
            
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 font-mono">YOUR NAME</label>
                <input 
                  type="text" 
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900/40 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  required
                />
              </div>
              <div className="space-y-1.5 mt-4">
                <label className="text-xs font-semibold text-slate-300 font-mono">DEPARTMENT (OPTIONAL)</label>
                <input 
                  type="text" 
                  value={departmentName}
                  onChange={(e) => setDepartmentName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900/40 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-colors"
              >
                Save Profile
              </button>
            </form>
          </div>

          {/* Database Management Card */}
          <div className="bg-white/[0.03] border border-white/10 p-6 rounded-3xl backdrop-blur-md space-y-6">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-white">Local Database Control</h3>
          </div>

          <div className="space-y-4">
            <p className="text-xs text-slate-400 leading-relaxed font-light">
              StudyFlow is designed with 100% offline browser integrity. Your semesters, courses, assignments, and exam schedules reside fully on your device within Local Storage, bypassing any tracking databases.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Export backup */}
              <button
                onClick={handleExportData}
                className="p-4 rounded-2xl bg-white/[0.02] hover:bg-indigo-600/10 border border-white/10 hover:border-indigo-500/40 text-left space-y-2 group transition-all cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Download Backup</h4>
                  <p className="text-[10px] text-slate-400 font-light mt-0.5">Export database to a .json schema file</p>
                </div>
              </button>

              {/* Import restoration */}
              <button
                onClick={handleImportTrigger}
                className="p-4 rounded-2xl bg-white/[0.02] hover:bg-cyan-600/10 border border-white/10 hover:border-cyan-500/40 text-left space-y-2 group transition-all cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500/20 transition-colors">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Restore Backup</h4>
                  <p className="text-[10px] text-slate-400 font-light mt-0.5">Load an existing database file (.json)</p>
                </div>
              </button>
            </div>

            {/* Hidden Input File tag for loads */}
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleImportFile}
              accept=".json"
              className="hidden" 
            />

            <div className="h-[1px] bg-white/5 pt-2" />

            {/* Danger Zone: Reset configurations */}
            <div className="p-4 bg-rose-500/[0.03] border border-rose-500/20 rounded-2xl space-y-3">
              <div className="flex items-center gap-1.5 text-rose-400 text-xs font-bold font-mono">
                <AlertTriangle className="w-4.5 h-4.5" />
                <span>DANGER ZONE CONTROL</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed font-light">
                Performing a system reset deletes all customized semesters, lectures, logs, and homework, reverting the applet back to Muhammad's sample configuration.
              </p>
              <button
                onClick={handleResetClick}
                className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white rounded-xl text-xs font-semibold font-mono transition-colors border border-rose-500/20 cursor-pointer"
              >
                Reset StudyFlow Workspace
              </button>
            </div>

          </div>
          </div>
        </div>
      </div>
      
      <ConfirmModal
        isOpen={showResetConfirm}
        title="Factory Reset StudyFlow?"
        message="Are you absolutely sure you want to restore StudyFlow to default settings? This will clear all custom courses, assignments, and semester histories."
        confirmText="Yes, Factory Reset"
        onConfirm={confirmReset}
        onCancel={() => setShowResetConfirm(false)}
        isDestructive={true}
      />
    </div>
  );
}