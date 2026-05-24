import { createBrowserRouter, Navigate } from 'react-router';
import { useAuth } from './context/AuthContext';
import StartScreen from './screens/StartScreen';
import LoginScreen from './screens/LoginScreen';
import Dashboard from './screens/Dashboard';
import AddItems from './screens/AddItems';
import UploadData from './screens/UploadData';
import Tasks from './screens/Tasks';
import WeeklyReport from './screens/WeeklyReport';
import Settings from './screens/Settings';
import Teams from './screens/Teams';
import AssigneeView from './screens/AssigneeView';
import ChangePassword from './screens/ChangePassword';
import MainLayout from './layouts/MainLayout';

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen text-gray-400">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (profile && profile.role !== 'admin') return <Navigate to="/assignee/tasks" replace />;
  return <>{children}</>;
}

function AssigneeRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen text-gray-400">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (profile && profile.role === 'admin') return <Navigate to="/app/dashboard" replace />;
  return <>{children}</>;
}

export const router = createBrowserRouter([
  { path: '/', Component: StartScreen },
  { path: '/login', Component: LoginScreen },
  {
    path: '/app',
    element: <AdminRoute><MainLayout /></AdminRoute>,
    children: [
      { index: true, Component: Dashboard },
      { path: 'dashboard', Component: Dashboard },
      { path: 'add-items', Component: AddItems },
      { path: 'upload-data', Component: UploadData },
      { path: 'tasks', Component: Tasks },
      { path: 'weekly-report', Component: WeeklyReport },
      { path: 'settings', Component: Settings },
      { path: 'teams', Component: Teams },
    ],
  },
  {
    path: '/assignee/tasks',
    element: <AssigneeRoute><AssigneeView /></AssigneeRoute>,
  },
  {
    path: '/change-password',
    Component: ChangePassword,
  },
]);
