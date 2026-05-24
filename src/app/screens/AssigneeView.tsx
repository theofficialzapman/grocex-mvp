import { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router';
import { ClipboardList, CheckCircle, Clock, LogOut } from 'lucide-react';
import { toast } from 'sonner';

export default function AssigneeView() {
  const { tasks, updateTask, loading } = useData();
  const { profile, user, signOut } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'open' | 'completed'>('open');

  useEffect(() => {
    if (user?.user_metadata?.must_change_password) {
      navigate('/change-password');
    }
  }, [user]);

  const myTasks = tasks.filter(t =>
    t.assigneeEmail?.toLowerCase() === profile?.email?.toLowerCase() ||
    t.assigneeId === profile?.id
  );

  const filteredTasks = myTasks.filter(t =>
    filter === 'open' ? !t.completed : t.completed
  );

  const handleComplete = async (taskId: string) => {
    await updateTask(taskId, {
      completed: true,
      completedAt: new Date().toISOString(),
    });
    toast.success('Task marked as complete');
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const actionLabel: Record<string, string> = {
    'move-to-front': 'Move to Front',
    'markdown': 'Markdown',
    'donate': 'Donate / Repurpose',
    'dispose': 'Dispose',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg md:text-xl font-bold text-gray-900">Grocex</h1>
            <p className="text-xs md:text-sm text-gray-500">My Tasks</p>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{profile?.name}</p>
              <p className="text-xs text-gray-500">{profile?.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 md:p-6">
        {/* Mobile name display */}
        <div className="sm:hidden mb-4 p-3 bg-white rounded-lg border border-gray-100">
          <p className="text-sm font-medium text-gray-900">{profile?.name}</p>
          <p className="text-xs text-gray-500">{profile?.email}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <p className="text-xs md:text-sm text-gray-500">Open Tasks</p>
            <p className="text-2xl md:text-3xl font-bold text-orange-600">{myTasks.filter(t => !t.completed).length}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <p className="text-xs md:text-sm text-gray-500">Completed</p>
            <p className="text-2xl md:text-3xl font-bold text-green-600">{myTasks.filter(t => t.completed).length}</p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setFilter('open')}
            className={`flex-1 md:flex-none px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              filter === 'open' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            Open Tasks
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`flex-1 md:flex-none px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              filter === 'completed' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            Completed
          </button>
        </div>

        {/* Task list */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading tasks...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>{filter === 'open' ? 'No open tasks assigned to you.' : 'No completed tasks yet.'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map(task => (
              <div key={task.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{task.itemName}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                      {actionLabel[task.action] || task.action}
                    </span>
                    {task.dueDate && (
                      <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                        <Clock className="w-3 h-3 flex-shrink-0" />
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    )}
                    {task.notes && (
                      <p className="text-sm text-gray-600 mt-2 bg-gray-50 rounded p-2">{task.notes}</p>
                    )}
                  </div>
                  {!task.completed ? (
                    <button
                      onClick={() => handleComplete(task.id)}
                      className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors whitespace-nowrap flex-shrink-0"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span className="hidden sm:inline">Mark Done</span>
                      <span className="sm:hidden">Done</span>
                    </button>
                  ) : (
                    <span className="flex items-center gap-1 px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium flex-shrink-0">
                      <CheckCircle className="w-4 h-4" /> Done
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
