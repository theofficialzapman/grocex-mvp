import { useNavigate } from 'react-router';
import { useData } from '../context/DataContext';
import { Database, Upload, PlusCircle, CheckCircle, LayoutDashboard, ClipboardList, BarChart3, Settings } from 'lucide-react';
import { toast } from 'sonner';

export default function StartScreen() {
  const navigate = useNavigate();
  const { loadDemoData } = useData();

  const handleStartDemo = () => {
    loadDemoData();
    toast.success('Demo data loaded. Replace with your store data anytime.');
    navigate('/app/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">

      {/* Top nav bar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Grocex</h1>
          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => navigate('/app/dashboard')} className="flex items-center gap-2 text-sm text-gray-600 hover:text-green-700 transition-colors">
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </button>
            <button onClick={() => navigate('/app/add-items')} className="flex items-center gap-2 text-sm text-gray-600 hover:text-green-700 transition-colors">
              <PlusCircle className="w-4 h-4" /> Add Items
            </button>
            <button onClick={() => navigate('/app/upload-data')} className="flex items-center gap-2 text-sm text-gray-600 hover:text-green-700 transition-colors">
              <Upload className="w-4 h-4" /> Upload Data
            </button>
            <button onClick={() => navigate('/app/tasks')} className="flex items-center gap-2 text-sm text-gray-600 hover:text-green-700 transition-colors">
              <ClipboardList className="w-4 h-4" /> Tasks
            </button>
            <button onClick={() => navigate('/app/weekly-report')} className="flex items-center gap-2 text-sm text-gray-600 hover:text-green-700 transition-colors">
              <BarChart3 className="w-4 h-4" /> Weekly Report
            </button>
            <button onClick={() => navigate('/app/settings')} className="flex items-center gap-2 text-sm text-gray-600 hover:text-green-700 transition-colors">
              <Settings className="w-4 h-4" /> Settings
            </button>
          </div>
          <button
            onClick={handleStartDemo}
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
          >
            Start Demo
          </button>
        </div>

        {/* Mobile nav */}
        <div className="md:hidden mt-3 flex flex-wrap gap-3">
          {[
            { label: 'Dashboard', icon: LayoutDashboard, path: '/app/dashboard' },
            { label: 'Add Items', icon: PlusCircle, path: '/app/add-items' },
            { label: 'Upload', icon: Upload, path: '/app/upload-data' },
            { label: 'Tasks', icon: ClipboardList, path: '/app/tasks' },
            { label: 'Report', icon: BarChart3, path: '/app/weekly-report' },
            { label: 'Settings', icon: Settings, path: '/app/settings' },
          ].map(({ label, icon: Icon, path }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-lg text-xs text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
            >
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
        </div>
      </nav>

      {/* Hero */}
      <div className="flex items-center justify-center p-6 pt-12">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold text-gray-900 mb-4">Reduce food waste.<br />Save money.</h2>
            <p className="text-xl text-gray-600">
              Simple expiry tracking and action tasks for grocery stores.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <button
              onClick={handleStartDemo}
              className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-green-500 group"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-500 transition-colors">
                <Database className="w-8 h-8 text-green-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Start Demo</h3>
              <p className="text-gray-600 text-sm">Load sample data</p>
            </button>

            <button
              onClick={() => navigate('/app/add-items')}
              className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-blue-500 group"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-500 transition-colors">
                <PlusCircle className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Add Items Manually</h3>
              <p className="text-gray-600 text-sm">Quick manual entry</p>
            </button>

            <button
              onClick={() => navigate('/app/upload-data')}
              className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-purple-500 group"
            >
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-500 transition-colors">
                <Upload className="w-8 h-8 text-purple-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload CSV Files</h3>
              <p className="text-gray-600 text-sm">Bulk import option</p>
            </button>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-md">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">What you'll get</h2>
            <ul className="space-y-4">
              <li className="flex items-start">
                <CheckCircle className="w-6 h-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">At-risk list with colour status and risk scores</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-6 h-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Tasks assigned to staff with email notifications</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-6 h-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Weekly summary report with estimated savings</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}


