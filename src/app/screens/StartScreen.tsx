import { useNavigate } from 'react-router';
import { useData } from '../context/DataContext';
import { Database, Upload, PlusCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function StartScreen() {
  const navigate = useNavigate();
  const { loadDemoData } = useData();

  const handleStartDemo = () => {
    loadDemoData();
    toast.success('Demo data loaded. Replace with your store data anytime.');
    navigate('/app/dashboard');
  };

  const handleManualEntry = () => {
    navigate('/app/add-items');
  };

  const handleUploadCSV = () => {
    navigate('/app/upload-data');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">Grocex</h1>
          <p className="text-xl text-gray-600">
            Reduce expiry waste with simple tracking and action tasks.
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
            onClick={handleManualEntry}
            className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-blue-500 group"
          >
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-500 transition-colors">
              <PlusCircle className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Add Items Manually</h3>
            <p className="text-gray-600 text-sm">Quick manual entry</p>
          </button>

          <button
            onClick={handleUploadCSV}
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
              <span className="text-gray-700">At-risk list with color status</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-6 h-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">Tasks for staff actions</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-6 h-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">Weekly summary report</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
