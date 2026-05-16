import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Trash2, Database, AlertTriangle } from 'lucide-react';

export default function Settings() {
  const { clearAllData, loadDemoData, isDemoMode, items, tasks } = useData();
  const navigate = useNavigate();
  const [confirmClear, setConfirmClear] = useState(false);

  const handleClearData = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    clearAllData();
    setConfirmClear(false);
    toast.success('All data cleared');
    navigate('/');
  };

  const handleLoadDemo = () => {
    loadDemoData();
    toast.success('Demo data loaded');
    navigate('/app/dashboard');
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

      {/* Demo mode */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Database className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">Load Demo Data</h3>
            <p className="text-sm text-gray-600 mb-4">
              Reset to sample inventory data. Useful for exploring the app or training staff.
              Your current data will be replaced.
            </p>
            <button
              onClick={handleLoadDemo}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Load Demo Data
            </button>
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
