import { useState } from 'react';
import { useData } from '../context/DataContext';
import { toast } from 'sonner';
import { UserPlus, X, Mail, User, Eye, EyeOff } from 'lucide-react';
import { StaffMember } from '../types';

export default function Teams() {
  const { staff, addStaff, removeStaff } = useData();
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);

  const handleRemoveStaff = async (member: StaffMember) => {
    if (confirmRemove !== member.id) {
      setConfirmRemove(member.id);
      return;
    }
    setRemoving(true);
    try {
      const response = await fetch('/api/delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: member.id }),
      });
      const result = await response.json();
      if (!response.ok) {
        toast.error(result.error || 'Failed to remove staff member');
        setRemoving(false);
        return;
      }
      await removeStaff(member.id);
      toast.success(`${member.name} removed`);
      setConfirmRemove(null);
    } catch {
      toast.error('Something went wrong. Please try again.');
    }
    setRemoving(false);
  };

  const handleAddStaff = async () => {
    if (!newName.trim() || !newEmail.trim() || !newPassword.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail.trim())) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          email: newEmail.trim(),
          password: newPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || 'Failed to create account');
        setLoading(false);
        return;
      }

      const member: StaffMember = {
        id: result.userId,
        name: newName.trim(),
        email: newEmail.trim(),
      };
      await addStaff(member);
      setNewName('');
      setNewEmail('');
      setNewPassword('');
      toast.success(`${member.name} added. They must change their password on first login.`);
    } catch {
      toast.error('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="p-6 md:p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Teams</h1>
        <p className="text-gray-600">Manage staff members who can receive and action tasks.</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-1 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-green-600" />
          Add Staff Member
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Staff will be prompted to change their password when they first log in.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="John Smith"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
              placeholder="john@store.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Temporary Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="w-full px-3 py-2 pr-9 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={handleAddStaff}
          disabled={loading}
          className="px-5 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Creating account...' : 'Add Staff Member'}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Current Team ({staff.length})
        </h2>

        {staff.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <User className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No staff members added yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {staff.map(member => (
              <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-700 font-semibold text-sm">
                      {member.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{member.name}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Mail className="w-3 h-3" /> {member.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveStaff(member)}
                  disabled={removing}
                  className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                    confirmRemove === member.id
                      ? 'bg-red-500 text-white hover:bg-red-600 px-3 text-xs font-medium'
                      : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                  }`}
                >
                  {confirmRemove === member.id ? (removing ? 'Removing...' : 'Confirm remove') : <X className="w-4 h-4" />}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
