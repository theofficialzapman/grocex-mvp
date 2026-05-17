import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Trash2, Database, AlertTriangle, UserPlus, X } from 'lucide-react';
import { StaffMember } from '../types';

export default function Settings() {
  const { clearAllData, loadDemoData, isDemoMode, items, tasks, staff, addStaff, removeStaff } = useData();
  const navigate = useNavigate();
  const [confirmClear, setConfirmClear] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');

  const handleClearData = () => {
    if (!confirmClear) { setConfirmClear(true); return; }
    clearAllData();
    setConfirmClear(false);
    toast.success('All data cleared');
    navigate('/');
  };

  const handleResetDemo = () => {
    if (!confirmReset) { setConfirmReset(true); return; }
    loadDemoData();
    setConfirmReset(false);
    toast.success('Reset to sample data');
    navigate('/app/dashboard');
  };

  const handleAddStaff = () => {
    if (!newName.trim() || !newEmail.trim()) {
      toast.error('Please enter both a name and email');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail.trim())) {
      toast.error('Please enter a valid email address');
      return;
    }
    const member: StaffMember = {
      id: `staff_${Date.now()}`,
      name: newName.trim(),
      email: newEmail.trim(),
    };
    addStaff(member);
    setNewName('');
    setNewEmail('');
    toast.success(`${member.name} added to staff list`);
  };

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your Grocex data and preferences</p>
      </div>

      {/* Data status */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Data</h2>
        <div className="flex gap-8 mb-4">
          <div>
            <p className="text-sm text-gray-500">Items tracked</p>
            <p className="text-2xl font-bold text-gray-900">{items.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Tasks</p>
            <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Mode</p>
            <p className="text-2xl font-bold text-gray-900">{isDemoMode ? 'Demo' : 'Live'}</p>
          </div>
        </div>
        <p className="text-xs text-gray-400">All data is stored locally in your browser (localStorage).</p>
      </div>

      {/* Staff management */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <UserPlus className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">Staff Members</h3>
            <p className="text-sm text-gray-600 mb-4">
              Add staff names and emails so you can assign tasks to the right person.
            </p>

            {staff.length > 0 && (
              <div className="mb-4 space-y-2">
                {staff.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{member.name}</p>
                      <p className="text-xs text-gray-500">{member.email}</p>
                    </div>
                    <button
                      onClick={() => removeStaff(member.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Staff name"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Email address"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                onClick={handleAddStaff}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors whitespace-nowrap"
              >
                Add Staff
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reset to sample data */}
      <div className={`bg-white rounded-lg shadow p-6 mb-6 border-2 ${confirmReset ? 'border-amber-300' : 'border-transparent'}`}>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Database className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">Reset to Sample Data</h3>
            <p className="text-sm text-gray-600 mb-4">
              Replace the inventory items, tasks, and upload history saved in this browser with sample data for testing or staff training.
            </p>

            {confirmReset && (
              <div className="flex items-center gap-2 mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <p className="text-sm text-amber-700">
                  <strong>Reset to sample data?</strong> This cannot be undone.
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleResetDemo}
                className={`px-5 py-2 rounded-lg font-medium transition-colors ${
                  confirmReset
                    ? 'bg-amber-500 text-white hover:bg-amber-600'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {confirmReset ? 'Yes, reset to sample data' : 'Reset to Sample Data'}
              </button>
              {confirmReset && (
                <button
                  onClick={() => setConfirmReset(false)}
                  className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Clear all data */}
      <div className={`bg-white rounded-lg shadow p-6 border-2 ${confirmClear ? 'border-red-300' : 'border-transparent'}`}>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Trash2 className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">Clear All Data</h3>
            <p className="text-sm text-gray-600 mb-4">
              Permanently removes all items, tasks, and upload history from this browser.
              You will be redirected to the start screen.
            </p>

            {confirmClear && (
              <div className="flex items-center gap-2 mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-700">
                  <strong>Are you sure?</strong> This cannot be undone.
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleClearData}
                className={`px-5 py-2 rounded-lg font-medium transition-colors ${
                  confirmClear
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-red-50 text-red-600 border border-red-300 hover:bg-red-100'
                }`}
              >
                {confirmClear ? 'Yes, clear everything' : 'Clear all data'}
              </button>
              {confirmClear && (
                <button
                  onClick={() => setConfirmClear(false)}
                  className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


