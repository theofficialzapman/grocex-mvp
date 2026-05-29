import { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { ActionType } from '../types';
import { MoveRight, Tag, Gift, Trash2, Check, ClipboardList } from 'lucide-react';
import { toast } from 'sonner';

const actionConfig: Record<ActionType, { label: string; icon: typeof MoveRight; color: string }> = {
  'move-to-front': { label: 'Move to Front', icon: MoveRight, color: 'bg-blue-100 text-blue-700' },
  'markdown': { label: 'Markdown', icon: Tag, color: 'bg-purple-100 text-purple-700' },
  'donate': { label: 'Donate/Repurpose', icon: Gift, color: 'bg-green-100 text-green-700' },
  'dispose': { label: 'Dispose', icon: Trash2, color: 'bg-red-100 text-red-700' },
};

export default function Tasks() {
  const { tasks, updateTask } = useData();
  const [activeTab, setActiveTab] = useState<'open' | 'completed'>('open');
  const [filterAction, setFilterAction] = useState<ActionType | 'all'>('all');

  const filteredTasks = useMemo(() => {
    let filtered = tasks.filter((task) =>
      activeTab === 'open' ? !task.completed : task.completed
    );

    if (filterAction !== 'all') {
      filtered = filtered.filter((task) => task.action === filterAction);
    }

    return filtered.sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }, [tasks, activeTab, filterAction]);

  const handleMarkComplete = (taskId: string) => {
    updateTask(taskId, {
      completed: true,
      completedAt: new Date().toISOString(),
    });
    toast.success('Task marked as complete');
  };

  const handleMarkIncomplete = (taskId: string) => {
    updateTask(taskId, {
      completed: false,
      completedAt: undefined,
    });
    toast.success('Task marked as incomplete');
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tasks</h1>
        <p className="text-gray-600">Manage action tasks for at-risk items</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <div className="flex items-center justify-between p-6">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab('open')}
                className={`px-6 py-2 font-medium rounded-lg transition-colors ${
                  activeTab === 'open'
                    ? 'bg-green-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Open Tasks
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`px-6 py-2 font-medium rounded-lg transition-colors ${
                  activeTab === 'completed'
                    ? 'bg-green-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Completed Tasks
              </button>
            </div>

            <div>
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value as ActionType | 'all')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Actions</option>
                <option value="move-to-front">Move to Front</option>
                <option value="markdown">Markdown</option>
                <option value="donate">Donate/Repurpose</option>
                <option value="dispose">Dispose</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-6">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {activeTab === 'open' ? 'No open tasks' : 'No completed tasks'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTasks.map((task) => {
                const config = actionConfig[task.action] || {
                  label: task.action || 'Task',
                  icon: ClipboardList,
                  color: 'bg-gray-100 text-gray-700',
                };
                const ActionIcon = config.icon;

                return (
                  <div
                    key={task.id}
                    className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
                            <ActionIcon className="w-4 h-4" />
                            {config.label}
                          </span>
                          {task.completed && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                              <Check className="w-4 h-4" />
                              Completed
                            </span>
                          )}
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {task.itemName}
                        </h3>

                        <div className="flex items-center gap-6 text-sm text-gray-600 mb-2">
                          {task.assignee && (
                            <span>
                              <span className="font-medium">Assignee:</span> {task.assignee}
                            </span>
                          )}
                          {task.dueDate && (
                            <span>
                              <span className="font-medium">Due:</span>{' '}
                              {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>

                        {task.notes && (
                          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                            {task.notes}
                          </p>
                        )}

                        {task.completedAt && (
                          <p className="text-xs text-gray-500 mt-2">
                            Completed on {new Date(task.completedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>

                      <div className="ml-4">
                        {!task.completed ? (
                          <button
                            onClick={() => handleMarkComplete(task.id)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                          >
                            Mark Complete
                          </button>
                        ) : (
                          <button
                            onClick={() => handleMarkIncomplete(task.id)}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                          >
                            Reopen
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
