import { useState } from 'react';
import { X, MoveRight, Tag, Gift, Trash2 } from 'lucide-react';
import { Item, Task, ActionType } from '../types';
import { useData } from '../context/DataContext';
import { StatusBadge } from './StatusBadge';
import { getRiskExplanation } from '../utils/scoring';
import { sendTaskAssignmentEmail } from '../utils/emailUtils';
import { toast } from 'sonner';

interface ItemDetailDrawerProps {
  item: Item | null;
  onClose: () => void;
}

export function ItemDetailDrawer({ item, onClose }: ItemDetailDrawerProps) {
  const { addTask, staff } = useData();
  const [assignee, setAssignee] = useState('');
  const [assigneeEmail, setAssigneeEmail] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedAction, setSelectedAction] = useState<ActionType | null>(null);

  if (!item) return null;

  const handleStaffSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === '') {
      setAssignee('');
      setAssigneeEmail('');
    } else if (value === '__manual__') {
      setAssignee('');
      setAssigneeEmail('');
    } else {
      const member = staff.find(m => m.id === value);
      if (member) {
        setAssignee(member.name);
        setAssigneeEmail(member.email);
      }
    }
  };

  const handleCreateTask = () => {
    if (!selectedAction) {
      toast.error('Please select an action');
      return;
    }

    const task: Task = {
      id: `t${Date.now()}`,
      itemId: item.id,
      itemName: item.name,
      action: selectedAction,
      assignee: assignee || undefined,
      assigneeEmail: assigneeEmail || undefined,
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      notes: notes || undefined,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    addTask(task);

    if (assigneeEmail) {
      sendTaskAssignmentEmail({
        assignee_name: assignee || 'Team Member',
        assignee_email: assigneeEmail,
        task_item: item.name,
        task_action: selectedAction.replace(/-/g, ' '),
        task_due_date: task.dueDate,
        task_notes: notes || '',
        store_name: 'Grocex Store',
      }).then(sent => {
        if (sent) toast.success(`Task created and email sent to ${assigneeEmail}`);
        else toast.success(`Task created for ${item.name}`);
      });
    } else {
      toast.success(`Task created for ${item.name}`);
    }
    setAssignee('');
    setAssigneeEmail('');
    setDueDate('');
    setNotes('');
    setSelectedAction(null);
    onClose();
  };

  const riskExplanation = getRiskExplanation(
    item.daysToExpiry,
    item.category,
    item.movementPerDay,
    item.quantity
  );

  const actions: { type: ActionType; label: string; icon: typeof MoveRight; selectedClass: string; defaultClass: string }[] = [
    { type: 'move-to-front', label: 'Move to Front', icon: MoveRight, selectedClass: 'bg-blue-500 border-blue-500 text-white', defaultClass: 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700' },
    { type: 'markdown', label: 'Markdown Suggestion', icon: Tag, selectedClass: 'bg-purple-500 border-purple-500 text-white', defaultClass: 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700' },
    { type: 'donate', label: 'Donate/Repurpose', icon: Gift, selectedClass: 'bg-green-500 border-green-500 text-white', defaultClass: 'bg-green-50 hover:bg-green-100 border-green-200 text-green-700' },
    { type: 'dispose', label: 'Dispose', icon: Trash2, selectedClass: 'bg-red-500 border-red-500 text-white', defaultClass: 'bg-red-50 hover:bg-red-100 border-red-200 text-red-700' },
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900">Item Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.name}</h3>
            <div className="flex items-center gap-3">
              <StatusBadge status={item.status} />
              <span className="text-sm text-gray-600">Risk Score: {item.riskScore}/100</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Category</p>
              <p className="text-gray-900 font-medium">{item.category}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Quantity</p>
              <p className="text-gray-900 font-medium">{item.quantity} units</p>
            </div>
            {item.sku && (
              <div>
                <p className="text-sm text-gray-500 mb-1">SKU</p>
                <p className="text-gray-900 font-medium">{item.sku}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500 mb-1">Days to Expiry</p>
              <p className="text-gray-900 font-medium">{item.daysToExpiry} days</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Expiry Date</p>
              <p className="text-gray-900 font-medium">{new Date(item.expiryDate).toLocaleDateString()}</p>
            </div>
            {item.movementPerDay !== undefined && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Movement</p>
                <p className="text-gray-900 font-medium">{item.movementPerDay.toFixed(1)} units/day</p>
              </div>
            )}
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Risk Analysis</h4>
            <p className="text-sm text-gray-700">{riskExplanation}</p>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Recommended Action</h4>
            <p className="text-sm text-gray-700">{item.recommendedAction}</p>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h4 className="font-semibold text-gray-900 mb-4">Create Task</h4>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Action</label>
              <div className="grid grid-cols-2 gap-3">
                {actions.map((action) => (
                  <button
                    key={action.type}
                    onClick={() => setSelectedAction(action.type)}
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      selectedAction === action.type
                        ? action.selectedClass
                        : action.defaultClass
                    }`}
                  >
                    <action.icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assignee (optional)
                </label>
                {staff.length > 0 ? (
                  <select
                    onChange={handleStaffSelect}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select staff member...</option>
                    {staff.map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({m.email})</option>
                    ))}
                    <option value="__manual__">Type manually...</option>
                  </select>
                ) : (
                  <p className="text-xs text-gray-500 mb-2">No staff added yet. Add staff in Settings or type a name below.</p>
                )}
                {(staff.length === 0 || assignee === '') && (
                  <input
                    type="text"
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                    placeholder="Staff name"
                    className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assignee Email (optional)
                </label>
                <input
                  type="email"
                  value={assigneeEmail}
                  onChange={(e) => setAssigneeEmail(e.target.value)}
                  placeholder="staff@store.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Additional instructions..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <button
                onClick={handleCreateTask}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Create Task
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


