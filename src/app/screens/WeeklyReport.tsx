import { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Download, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { exportWeeklyReportCSV, downloadCSV } from '../utils/csvUtils';

export default function WeeklyReport() {
  const { items, tasks } = useData();
  const [selectedWeek, setSelectedWeek] = useState('current');

  const weekData = useMemo(() => {
    const totalItems = items.length;
    const flaggedItems = items.filter(item => item.riskScore >= 60).length;
    const actionedItems = tasks.filter(task => task.completed).length;
    const wasteLogged = 0;
    const estimatedSavings = actionedItems * 15;
    return { totalItems, flaggedItems, actionedItems, wasteLogged, estimatedSavings };
  }, [items, tasks]);

  const chartData = [
    { name: 'Items Flagged', value: weekData.flaggedItems },
    { name: 'Items Actioned', value: weekData.actionedItems },
    { name: 'Waste Logged', value: weekData.wasteLogged },
  ];

  const categoryBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {};
    items.forEach(item => {
      if (item.riskScore >= 60) {
        breakdown[item.category] = (breakdown[item.category] || 0) + 1;
      }
    });
    return Object.entries(breakdown).map(([name, value]) => ({ name, value }));
  }, [items]);

  const handleDownloadCSV = () => {
    if (items.length === 0 && tasks.length === 0) {
      toast.warning('No data to export yet');
      return;
    }
    const csv = exportWeeklyReportCSV(items, tasks);
    const date = new Date().toISOString().substring(0, 10);
    downloadCSV(csv, `grocex-weekly-report-${date}.csv`);
    toast.success('Report downloaded');
  };

  const isEmpty = items.length === 0 && tasks.length === 0;

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Weekly Report</h1>
            <p className="text-gray-600">Track waste reduction performance and savings</p>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-500" />
            <select
              value={selectedWeek}
              onChange={e => setSelectedWeek(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="current">Current Week</option>
              <option value="last">Last Week</option>
              <option value="two-weeks">2 Weeks Ago</option>
              <option value="three-weeks">3 Weeks Ago</option>
            </select>
          </div>
        </div>
      </div>

      {isEmpty && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <p className="text-sm text-yellow-800">
            No inventory data yet. Add items manually or upload a CSV to see your report.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Items Flagged</p>
          <p className="text-4xl font-bold text-orange-600 mb-2">{weekData.flaggedItems}</p>
          <p className="text-xs text-gray-500">At-risk items identified</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Items Actioned</p>
          <p className="text-4xl font-bold text-green-600 mb-2">{weekData.actionedItems}</p>
          <p className="text-xs text-gray-500">Tasks completed</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Waste Logged</p>
          <p className="text-4xl font-bold text-gray-900 mb-2">{weekData.wasteLogged}</p>
          <p className="text-xs text-gray-500">Items disposed</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Estimated Savings</p>
          <p className="text-4xl font-bold text-green-600 mb-2">${weekData.estimatedSavings}</p>
          <p className="text-xs text-gray-500">Based on actioned items</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">How savings are estimated</h3>
        <p className="text-sm text-blue-800">
          Each completed task is valued at ~$15 (average wholesale value of rescued inventory). Actual savings may vary. 
          When waste log data is uploaded, reporting will be more accurate.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Weekly Overview</h2>
          {weekData.flaggedItems === 0 && weekData.actionedItems === 0 ? (
            <div className="flex items-center justify-center h-[300px] text-gray-400 text-sm">
              No data for this week
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">At-Risk by Category</h2>
          {categoryBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryBreakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              No at-risk items this week
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Export Report</h2>
        <p className="text-sm text-gray-600 mb-6">
          Download this week's report as CSV — includes summary, full inventory detail, and task log.
        </p>
        <button
          onClick={handleDownloadCSV}
          className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <Download className="w-5 h-5" />
          Download Report (CSV)
        </button>
      </div>
    </div>
  );
}
