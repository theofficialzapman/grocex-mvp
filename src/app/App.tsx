import { RouterProvider } from 'react-router';
import { router } from './routes';
import { DataProvider } from './context/DataContext';
import { Toaster } from 'sonner';

export default function App() {
  return (
    <DataProvider>
      <RouterProvider router={router} />
      <Toaster position="top-right" />
    </DataProvider>
  );
}