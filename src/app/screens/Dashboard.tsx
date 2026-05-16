import { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Item, ItemStatus } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { ItemDetailDrawer } from '../components/ItemDetailDrawer';
import { Package, AlertTriangle, XCircle, ClipboardList, DollarSign } from 'lucide-react';

export default function Dashboard() {
  const { items, tasks } = useData();
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [statusFilter, setStatusFilter] = useState<ItemStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [expiryFilter, setExpiryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'risk' | 'expiry'>('risk');

  const atRiskItems = items.filter((item) => item.riskScore >= 60);
  const expiredItems = items.filter((item) => item.daysToExpiry <= 0);
  const openTasks = tasks.filter((task) => !task.completed);

  const estimatedSavings = useMemo(() => {
    const actionsThisWeek = tasks.filter((task) => task.completed).length;
    return actionsThisWeek * 15;
  }, [tasks]);

  const categories = useMemo(() => {
    const cats = new Set(items.map((item) => item.category));
    return Array.from(cats);
  }, [items]);

  const filteredItems = useMemo(() => {
    let filtered = [...items];

    if (statusFilter !== 'all') {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter((item) => item.category === categoryFilter);
    }

    if (expiryFilter !== 'all') {
      const [min, max] = expiryFilter.split('-').map(Number);
      filtered = filtered.filter((item) => {
        if (max === undefined) {
          return item.daysToExpiry >= min;
        }
        return item.daysToExpiry >= min && item.daysToExpiry <= max;
      });
    }

    filtered.sort((a, b) => {
      if (sortBy === 'risk') {
        return b.riskScore - a.riskScore;
      }
      return a.daysToExpiry - b.daysToExpiry;
    });

    return filtered;
  }, [items, statusFilter, categoryFilter, expiryFilter, sortBy]);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Monitor at-risk items and track waste reduction</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Items</p>
              <p className="text-3xl font-bold text-gray-900">{items.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">At Risk</p>
              <p className="text-3xl font-bold text-orange-600">{atRiskItems.length}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Expired</p>
              <p className="text-3xl font-bold text-red-600">{expiredItems.length}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Open Tasks</p>
              <p className="text-3xl font-bold text-gray-900">{openTasks.length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Est. Savings</p>
              <p className="text-3xl font-bold text-green-600">${estimatedSavings}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">At-Risk Items</h2>

          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as ItemStatus | 'all')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All</option>
                <option value="red">Expired/Urgent</option>
                <option value="orange">At Risk</option>
                <option value="yellow">Warning</option>
                <option value="green">Good</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Window</label>
              <select
                value={expiryFilter}
                onChange={(e) => setExpiryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All</option>
                <option value="0-2">0-2 days</option>
                <option value="3-7">3-7 days</option>
                <option value="8-14">8-14 days</option>
                <option value="15">15+ days</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'risk' | 'expiry')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="risk">Risk Score</option>
                <option value="expiry">Days to Expiry</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Item Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Quantity</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Days to Expiry</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Risk Score</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Recommended Action</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.category}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.quantity}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.daysToExpiry}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.riskScore}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.recommendedAction}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedItem(item)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                    >
                      Create Task
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No items match your filters</p>
            </div>
          )}
        </div>
      </div>

      <ItemDetailDrawer item={selectedItem} onClose={() => setSelectedItem(null)} />
    </div>
  );
}
