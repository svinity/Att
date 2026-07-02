import { useState } from 'react';
import { Worker, Attendance, AttendanceStatus } from '../types';
import { ChevronLeft, ChevronRight, Check, X, Clock, HelpCircle, CalendarRange } from 'lucide-react';
import EmptyState from './EmptyState';

interface AttendanceScreenProps {
  workers: Worker[];
  attendance: Attendance[];
  currentDate: string; // YYYY-MM-DD
  onSetCurrentDate: (date: string) => void;
  onUpdateAttendance: (workerId: string, status: AttendanceStatus) => void;
  onMarkAllPresent: () => void;
}

export default function AttendanceScreen({
  workers,
  attendance,
  currentDate,
  onSetCurrentDate,
  onUpdateAttendance,
  onMarkAllPresent,
}: AttendanceScreenProps) {
  const [viewTab, setViewTab] = useState<'Daily' | 'Monthly'>('Daily');

  const activeWorkers = workers.filter(w => w.status === 'Active');

  // Change date by offset in days
  const changeDate = (days: number) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + days);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    onSetCurrentDate(`${yyyy}-${mm}-${dd}`);
  };

  const formatDateFull = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Get current attendance status for a worker
  const getStatus = (workerId: string): AttendanceStatus | undefined => {
    const record = attendance.find(a => a.workerId === workerId && a.date === currentDate);
    return record?.status;
  };

  // Get Month Name for Monthly view
  const currentMonthName = new Date(currentDate).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  const currentMonthYearPrefix = currentDate.substring(0, 7); // "YYYY-MM"

  // Compute monthly stats for active workers
  const getMonthlyStats = (workerId: string) => {
    const monthlyRecords = attendance.filter(a => 
      a.workerId === workerId && a.date.startsWith(currentMonthYearPrefix)
    );

    const presentCount = monthlyRecords.filter(r => r.status === 'PRESENT').length;
    const absentCount = monthlyRecords.filter(r => r.status === 'ABSENT').length;
    const halfDayCount = monthlyRecords.filter(r => r.status === 'HALF_DAY').length;

    // Total working days in month so far with records
    const recordedDays = monthlyRecords.length;

    return { presentCount, absentCount, halfDayCount, recordedDays };
  };

  return (
    <div className="space-y-4">
      {/* Date & Mode selector at top */}
      <div className="space-y-3">
        {/* Daily vs Monthly Summary tab */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewTab('Daily')}
            className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${
              viewTab === 'Daily'
                ? 'bg-white text-[#1a56db] shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Daily View
          </button>
          <button
            onClick={() => setViewTab('Monthly')}
            className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${
              viewTab === 'Monthly'
                ? 'bg-white text-[#1a56db] shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Monthly Summary
          </button>
        </div>

        {/* Date / Month Selector */}
        <div className="flex items-center justify-between bg-white rounded-xl border border-gray-100 p-2 shadow-xs">
          <button
            onClick={() => changeDate(-1)}
            className="w-12 h-12 flex items-center justify-center text-gray-500 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all active:scale-90"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="text-center relative py-1 px-4 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
            {viewTab === 'Daily' ? (
              <>
                <input
                  type="date"
                  value={currentDate}
                  onChange={(e) => {
                    if (e.target.value) onSetCurrentDate(e.target.value);
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <h3 className="text-base font-extrabold text-gray-900 flex items-center justify-center gap-1.5 group-hover:text-[#1a56db] transition-colors">
                  <span>{formatDateFull(currentDate)}</span>
                  <CalendarRange className="w-4 h-4 text-[#1a56db]" />
                </h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tap to pick date</p>
              </>
            ) : (
              <>
                <input
                  type="month"
                  value={currentDate.substring(0, 7)}
                  onChange={(e) => {
                    if (e.target.value) {
                      const parts = currentDate.split('-');
                      const day = parts[2] || '01';
                      onSetCurrentDate(`${e.target.value}-${day}`);
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <h3 className="text-base font-extrabold text-gray-900 flex items-center justify-center gap-1.5 group-hover:text-[#1a56db] transition-colors">
                  <span>{currentMonthName}</span>
                  <CalendarRange className="w-4 h-4 text-[#1a56db]" />
                </h3>
                <p className="text-[10px] font-bold text-[#1a56db] uppercase tracking-wider">Tap to pick month</p>
              </>
            )}
          </div>

          <button
            onClick={() => changeDate(1)}
            className="w-12 h-12 flex items-center justify-center text-gray-500 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all active:scale-90"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {viewTab === 'Daily' ? (
        <div className="space-y-4">
          {/* Mark All Present full-width button */}
          {activeWorkers.length > 0 && (
            <button
              onClick={onMarkAllPresent}
              className="w-full h-12 bg-[#047857] hover:bg-[#047857]/90 text-white font-bold text-sm rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
            >
              <Check className="w-5 h-5" />
              <span>Mark All {activeWorkers.length} Workers Present</span>
            </button>
          )}

          {activeWorkers.length === 0 ? (
            <EmptyState
              title="No Active Workers"
              description="To mark attendance, please add workers or activate existing ones first."
            />
          ) : (
            <div className="space-y-3">
              {activeWorkers.map(worker => {
                const currentStatus = getStatus(worker.id);
                return (
                  <div
                    key={worker.id}
                    className="p-4 bg-white rounded-xl border border-gray-100 shadow-xs flex flex-col gap-3"
                  >
                    {/* Worker basic info */}
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-base font-extrabold text-gray-900">{worker.name}</h4>
                        <p className="text-xs text-gray-400">
                          {worker.designation} • Rs. {worker.dailyWage}/day
                        </p>
                      </div>
                      
                      {/* Current Status Badge */}
                      {currentStatus ? (
                        <span
                          className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase ${
                            currentStatus === 'PRESENT'
                              ? 'bg-emerald-50 text-[#047857] border border-emerald-100'
                              : currentStatus === 'ABSENT'
                              ? 'bg-red-50 text-[#dc2626] border border-red-100'
                              : 'bg-amber-50 text-amber-700 border border-amber-100'
                          }`}
                        >
                          {currentStatus.replace('_', ' ')}
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded text-[10px] font-bold bg-gray-50 text-gray-400 border border-gray-100 uppercase tracking-wider">
                          Unmarked
                        </span>
                      )}
                    </div>

                    {/* Big Side-by-Side Toggle Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onUpdateAttendance(worker.id, 'PRESENT')}
                        className={`h-12 rounded-lg font-bold text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                          currentStatus === 'PRESENT'
                            ? 'bg-[#047857] border-[#047857] text-white shadow-xs'
                            : 'bg-white border-gray-200 text-[#047857] hover:bg-emerald-50/50'
                        }`}
                      >
                        <Check className="w-4 h-4" />
                        <span>PRESENT</span>
                      </button>

                      <button
                        onClick={() => onUpdateAttendance(worker.id, 'ABSENT')}
                        className={`h-12 rounded-lg font-bold text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                          currentStatus === 'ABSENT'
                            ? 'bg-[#dc2626] border-[#dc2626] text-white shadow-xs'
                            : 'bg-white border-gray-200 text-[#dc2626] hover:bg-red-50/50'
                        }`}
                      >
                        <X className="w-4 h-4" />
                        <span>ABSENT</span>
                      </button>
                    </div>

                    {/* Half Day smaller button below */}
                    <button
                      onClick={() => onUpdateAttendance(worker.id, 'HALF_DAY')}
                      className={`h-10 rounded-lg font-bold text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                        currentStatus === 'HALF_DAY'
                          ? 'bg-amber-500 border-amber-500 text-white shadow-xs'
                          : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <Clock className="w-4 h-4" />
                      <span>HALF DAY</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Monthly summary table/cards */
        <div className="space-y-3">
          <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-xs">
            <h4 className="text-xs font-bold text-[#1a56db] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CalendarRange className="w-4 h-4" />
              <span>Month Summary: {currentMonthName}</span>
            </h4>
            <p className="text-xs text-gray-500">
              Shows aggregate attendance metrics for active workers during this month.
            </p>
          </div>

          {activeWorkers.length === 0 ? (
            <EmptyState title="No Active Workers" description="Add workers to view monthly trends." />
          ) : (
            <div className="space-y-2">
              {activeWorkers.map(worker => {
                const { presentCount, absentCount, halfDayCount, recordedDays } = getMonthlyStats(worker.id);
                return (
                  <div
                    key={worker.id}
                    className="p-4 bg-white rounded-xl border border-gray-100 shadow-xs flex items-center justify-between"
                  >
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-bold text-gray-900">{worker.name}</h4>
                      <p className="text-xs text-gray-400">{worker.designation}</p>
                      <p className="text-[10px] font-medium text-gray-400">
                        {recordedDays} days logged this month
                      </p>
                    </div>

                    {/* Metric pill layout */}
                    <div className="flex gap-1">
                      {/* Present Count */}
                      <div className="flex flex-col items-center justify-center bg-emerald-50 text-[#047857] border border-emerald-100/50 px-2 py-1 rounded min-w-[36px]">
                        <span className="text-xs font-bold">{presentCount}</span>
                        <span className="text-[8px] font-bold uppercase tracking-wider">PR</span>
                      </div>
                      {/* Half Day Count */}
                      <div className="flex flex-col items-center justify-center bg-amber-50 text-amber-700 border border-amber-100/50 px-2 py-1 rounded min-w-[36px]">
                        <span className="text-xs font-bold">{halfDayCount}</span>
                        <span className="text-[8px] font-bold uppercase tracking-wider">HD</span>
                      </div>
                      {/* Absent Count */}
                      <div className="flex flex-col items-center justify-center bg-red-50 text-[#dc2626] border border-red-100/50 px-2 py-1 rounded min-w-[36px]">
                        <span className="text-xs font-bold">{absentCount}</span>
                        <span className="text-[8px] font-bold uppercase tracking-wider">AB</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
