import { createBrowserRouter } from 'react-router';
import StartScreen from './screens/StartScreen';
import Dashboard from './screens/Dashboard';
import AddItems from './screens/AddItems';
import UploadData from './screens/UploadData';
import Tasks from './screens/Tasks';
import WeeklyReport from './screens/WeeklyReport';
import Settings from './screens/Settings';
import MainLayout from './layouts/MainLayout';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: StartScreen,
  },
  {
    path: '/app',
    Component: MainLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: 'dashboard', Component: Dashboard },
      { path: 'add-items', Component: AddItems },
      { path: 'upload-data', Component: UploadData },
      { path: 'tasks', Component: Tasks },
      { path: 'weekly-report', Component: WeeklyReport },
      { path: 'settings', Component: Settings },
    ],
  },
]);
