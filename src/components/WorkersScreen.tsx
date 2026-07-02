import { useState, FormEvent } from 'react';
import { Worker } from '../types';
import { Search, Edit, Plus, X, UserCheck, UserX, Phone, Calendar, IndianRupee } from 'lucide-react';
import EmptyState from './EmptyState';

interface WorkersScreenProps {
  workers: Worker[];
  onAddWorker: (worker: Omit<Worker, 'id'>) => void;
  onEditWorker: (id: string, updated: Partial<Worker>) => void;
}

export default function WorkersScreen({ workers, onAddWorker, onEditWorker }: WorkersScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeOnly, setActiveOnly] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formMobile, setFormMobile] = useState('');
  const [formDesignation, setFormDesignation] = useState('');
  const [formJoiningDate, setFormJoiningDate] = useState('');
  const [formMonthlySalary, setFormMonthlySalary] = useState(15000);
  const [formDailyWage, setFormDailyWage] = useState(500);
  const [formStatus, setFormStatus] = useState<'Active' | 'Inactive'>('Active');
  const [formRemarks, setFormRemarks] = useState('');

  // Open modal for adding
  const handleOpenAdd = () => {
    setEditingWorker(null);
    setFormName('');
    setFormMobile('');
    setFormDesignation('');
    
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    setFormJoiningDate(`${yyyy}-${mm}-${dd}`);
    
    setFormMonthlySalary(15000);
    setFormDailyWage(500);
    setFormStatus('Active');
    setFormRemarks('');
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEdit = (worker: Worker) => {
    setEditingWorker(worker);
    setFormName(worker.name);
    setFormMobile(worker.mobile);
    setFormDesignation(worker.designation);
    setFormJoiningDate(worker.joiningDate);
    setFormMonthlySalary(worker.monthlySalary);
    setFormDailyWage(worker.dailyWage);
    setFormStatus(worker.status);
    setFormRemarks(worker.remarks);
    setIsModalOpen(true);
  };

  // Submit form
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formMobile.trim() || !formDesignation.trim()) {
      alert('Please fill out Name, Mobile and Designation.');
      return;
    }

    const payload = {
      name: formName.trim(),
      mobile: formMobile.trim(),
      designation: formDesignation.trim(),
      joiningDate: formJoiningDate,
      monthlySalary: Number(formMonthlySalary),
      dailyWage: Number(formDailyWage),
      status: formStatus,
      remarks: formRemarks.trim(),
    };

    if (editingWorker) {
      onEditWorker(editingWorker.id, payload);
    } else {
      onAddWorker(payload);
    }
    setIsModalOpen(false);
  };

  // Filter workers based on query and status toggle
  const filteredWorkers = workers.filter(worker => {
    const matchesSearch = 
      worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.mobile.includes(searchQuery);
    
    const matchesStatus = activeOnly ? worker.status === 'Active' : true;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4 pb-20 relative">
      {/* Search & Filter section */}
      <div className="space-y-3">
        {/* Search bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search workers by name, role or mobile..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-11 pr-4 bg-white rounded-xl border border-gray-200 text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#1a56db] focus:ring-1 focus:ring-[#1a56db] shadow-xs"
          />
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
        </div>

        {/* Filter Chip and Add Worker Row */}
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => setActiveOnly(prev => !prev)}
            className={`flex items-center gap-1.5 h-10 px-4 rounded-full text-xs font-bold border transition-all cursor-pointer active:scale-95 ${
              activeOnly
                ? 'bg-[#1a56db]/10 border-[#1a56db]/20 text-[#1a56db]'
                : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
            }`}
          >
            {activeOnly ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
            <span>Active Workers Only</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 h-10 px-4 rounded-full text-xs font-bold bg-[#1a56db] hover:bg-[#1a56db]/90 text-white shadow-xs transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Worker</span>
          </button>
        </div>
      </div>

      {/* Workers List */}
      {filteredWorkers.length === 0 ? (
        <EmptyState
          title="No Workers Found"
          description="Try adjusting your search query, toggling the status filter, or add a new worker to the ledger."
          actionLabel="Add New Worker"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="space-y-3">
          {filteredWorkers.map(worker => (
            <div
              key={worker.id}
              className={`p-4 bg-white rounded-xl border shadow-xs relative flex flex-col gap-3 transition-all ${
                worker.status === 'Inactive' ? 'opacity-65 border-gray-100 bg-gray-50/50' : 'border-gray-100'
              }`}
            >
              {/* Edit Button top right */}
              <button
                onClick={() => handleOpenEdit(worker)}
                className="absolute top-4 right-4 p-2 bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-900 rounded-lg transition-all active:scale-90 cursor-pointer"
              >
                <Edit className="w-4 h-4" />
              </button>

              <div className="space-y-1 pr-10">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-extrabold text-gray-900">{worker.name}</h4>
                  {worker.status === 'Inactive' && (
                    <span className="bg-gray-100 text-gray-500 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                      Inactive
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 font-medium">
                  {worker.designation} • {worker.mobile}
                </p>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Daily Wage
                  </span>
                  <span className="text-xs font-bold text-gray-700">Rs. {worker.dailyWage}/day</span>
                </div>
                
                <div className="text-right">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Monthly base
                  </span>
                  <span className="text-sm font-extrabold text-[#1a56db]">
                    Rs. {worker.monthlySalary}/mo
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating Action Button (FAB) bottom right */}
      <button
        onClick={handleOpenAdd}
        className="fixed bottom-20 right-4 w-14 h-14 bg-[#1a56db] hover:bg-[#1a56db]/90 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer z-40"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
          <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto shadow-xl flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-base font-extrabold text-gray-900">
                {editingWorker ? 'Edit Worker Profile' : 'Register New Worker'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-900 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-4 space-y-4 flex-1">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full h-12 px-4 rounded-lg border border-gray-200 text-sm font-medium focus:outline-none focus:border-[#1a56db]"
                />
              </div>

              {/* Mobile Number */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Mobile Number</label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    value={formMobile}
                    onChange={(e) => setFormMobile(e.target.value.replace(/\D/g, ''))}
                    className="w-full h-12 pl-10 pr-4 rounded-lg border border-gray-200 text-sm font-medium focus:outline-none focus:border-[#1a56db]"
                  />
                  <Phone className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-400" />
                </div>
              </div>

              {/* Designation / Role */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Designation / Role</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mason, Supervisor, Carpenter, Helper"
                  value={formDesignation}
                  onChange={(e) => setFormDesignation(e.target.value)}
                  className="w-full h-12 px-4 rounded-lg border border-gray-200 text-sm font-medium focus:outline-none focus:border-[#1a56db]"
                />
              </div>

              {/* Grid: Joining Date & Status */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Joining Date</label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      value={formJoiningDate}
                      onChange={(e) => setFormJoiningDate(e.target.value)}
                      className="w-full h-12 pl-10 pr-3 rounded-lg border border-gray-200 text-xs font-medium focus:outline-none focus:border-[#1a56db]"
                    />
                    <Calendar className="absolute left-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as 'Active' | 'Inactive')}
                    className="w-full h-12 px-3 rounded-lg border border-gray-200 text-sm font-medium focus:outline-none focus:border-[#1a56db]"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Grid: Monthly Salary & Daily Wage */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Monthly Salary</label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min={0}
                      value={formMonthlySalary}
                      onChange={(e) => setFormMonthlySalary(Number(e.target.value))}
                      className="w-full h-12 pl-10 pr-4 rounded-lg border border-gray-200 text-sm font-medium focus:outline-none focus:border-[#1a56db]"
                    />
                    <span className="absolute left-3.5 top-3.5 text-xs font-bold text-gray-400">Rs.</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Daily Wage</label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min={0}
                      value={formDailyWage}
                      onChange={(e) => setFormDailyWage(Number(e.target.value))}
                      className="w-full h-12 pl-10 pr-4 rounded-lg border border-gray-200 text-sm font-medium focus:outline-none focus:border-[#1a56db]"
                    />
                    <span className="absolute left-3.5 top-3.5 text-xs font-bold text-gray-400">Rs.</span>
                  </div>
                </div>
              </div>

              {/* Remarks */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Remarks / Notes</label>
                <textarea
                  placeholder="Any additional notes about the worker..."
                  value={formRemarks}
                  onChange={(e) => setFormRemarks(e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-200 text-sm font-medium focus:outline-none focus:border-[#1a56db] h-20 resize-none"
                />
              </div>

              {/* Save Button */}
              <button
                type="submit"
                className="w-full h-12 bg-[#1a56db] hover:bg-[#1a56db]/90 text-white font-bold text-sm rounded-lg shadow-sm transition-all active:scale-98 cursor-pointer flex items-center justify-center"
              >
                {editingWorker ? 'Update Worker Profile' : 'Register Worker'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
