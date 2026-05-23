import { useState } from 'react';
import { Outlet, NavLink } from 'react-router';
import { LayoutDashboard, PlusCircle, Upload, ClipboardList, BarChart3, Settings, Menu, X } from 'lucide-react';
import { useData } from '../context/DataContext';

const navItems = [
  { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/app/add-items', icon: PlusCircle, label: 'Add Items' },
  { to: '/app/upload-data', icon: Upload, label: 'Upload Data' },
  { to: '/app/tasks', icon: ClipboardList, label: 'Tasks' },
  { to: '/app/weekly-report', icon: BarChart3, label: 'Weekly Report' },
  { to: '/app/settings', icon: Settings, label: 'Settings' },
];

export default function MainLayout() {
  const { isDemoMode } = useData();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const SidebarContent = () => (
    <>
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Grocex</h1>
          {isDemoMode && (
            <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-medium">
              ⚡ Demo Mode
            </span>
          )}
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden p-1 rounded hover:bg-gray-100"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map(item => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-green-50 text-green-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {isDemoMode && (
        <div className="p-4 border-t border-gray-200">
          <p className="text-xs text-gray-400 leading-snug">
            Using sample data. Go to <strong>Settings</strong> to load your own inventory or clear demo data.
          </p>
        </div>
      )}
    </>
  );

  return (
    <div className="flex h-screen bg-gray-50">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — hidden on mobile unless open */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-white border-r border-gray-200 flex flex-col
        transform transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <SidebarContent />
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto min-w-0">
        {/* Top bar with hamburger on mobile */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1 rounded hover:bg-gray-100"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Grocex</h1>
          {isDemoMode && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-medium ml-auto">
              ⚡ Demo
            </span>
          )}
        </div>

        {isDemoMode && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-2 flex items-center gap-2">
            <span className="text-xs font-medium text-amber-700">
              ⚡ Demo Mode — sample data is shown. Upload your own CSV or add items manually to go live.
            </span>
            <NavLink to="/app/settings" className="text-xs text-amber-700 underline ml-auto">
              Settings
            </NavLink>
          </div>
        )}
        <Outlet />
      </main>
    </div>
  );
}


