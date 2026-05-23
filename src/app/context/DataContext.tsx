import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Item, Task, UploadStatus, StaffMember } from '../types';
import { supabase } from '../lib/supabase';
import { sampleItems, sampleTasks } from '../data/sampleData';

interface DataContextType {
  items: Item[];
  tasks: Task[];
  uploadStatus: UploadStatus;
  isDemoMode: boolean;
  staff: StaffMember[];
  loading: boolean;
  addItem: (item: Item) => Promise<void>;
  addItems: (items: Item[]) => Promise<void>;
  updateItem: (id: string, updates: Partial<Item>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  addTask: (task: Task) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  loadDemoData: () => Promise<void>;
  updateUploadStatus: (key: keyof UploadStatus, status: UploadStatus[keyof UploadStatus]) => void;
  clearAllData: () => Promise<void>;
  addStaff: (member: StaffMember) => Promise<void>;
  removeStaff: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}

const toDbItem = (item: Item, isDemo = false) => ({
  id: item.id,
  name: item.name,
  category: item.category,
  quantity: item.quantity,
  expiry_date: item.expiryDate,
  days_to_expiry: item.daysToExpiry,
  risk_score: item.riskScore,
  status: item.status,
  sku: item.sku || null,
  received_date: item.receivedDate || null,
  movement_per_day: item.movementPerDay || null,
  recommended_action: item.recommendedAction || '',
  is_demo: isDemo,
});

const fromDbItem = (row: Record<string, unknown>): Item => ({
  id: row.id as string,
  name: row.name as string,
  category: row.category as string,
  quantity: row.quantity as number,
  expiryDate: row.expiry_date as string,
  daysToExpiry: row.days_to_expiry as number,
  riskScore: row.risk_score as number,
  status: row.status as Item['status'],
  sku: row.sku as string | undefined,
  receivedDate: row.received_date as string | undefined,
  movementPerDay: row.movement_per_day as number | undefined,
  recommendedAction: row.recommended_action as string,
});

const toDbTask = (task: Task) => ({
  id: task.id,
  item_id: task.itemId,
  item_name: task.itemName,
  action: task.action,
  assignee_id: task.assigneeId || null,
  assignee: task.assignee || null,
  assignee_email: task.assigneeEmail || null,
  due_date: task.dueDate || null,
  notes: task.notes || null,
  completed: task.completed,
  completed_at: task.completedAt || null,
});

const fromDbTask = (row: Record<string, unknown>): Task => ({
  id: row.id as string,
  itemId: row.item_id as string,
  itemName: row.item_name as string,
  action: row.action as Task['action'],
  assigneeId: row.assignee_id as string | undefined,
  assignee: row.assignee as string | undefined,
  assigneeEmail: row.assignee_email as string | undefined,
  dueDate: row.due_date as string | undefined,
  notes: row.notes as string | undefined,
  completed: row.completed as boolean,
  completedAt: row.completed_at as string | undefined,
  createdAt: row.created_at as string,
});

const UPLOAD_KEY = 'grocex_upload_status';
const STAFF_KEY = 'grocex_staff';

const defaultUpload: UploadStatus = {
  inventory: null, movement: null, waste: null, sku: null,
};

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>(() => {
    try { return JSON.parse(localStorage.getItem(UPLOAD_KEY) || 'null') || defaultUpload; }
    catch { return defaultUpload; }
  });
  const [staff, setStaff] = useState<StaffMember[]>(() => {
    try { return JSON.parse(localStorage.getItem(STAFF_KEY) || '[]'); }
    catch { return []; }
  });

  useEffect(() => { localStorage.setItem(UPLOAD_KEY, JSON.stringify(uploadStatus)); }, [uploadStatus]);
  useEffect(() => { localStorage.setItem(STAFF_KEY, JSON.stringify(staff)); }, [staff]);

  const fetchItems = async () => {
    const { data } = await supabase.from('items').select('*').order('risk_score', { ascending: false });
    if (data) {
      setItems(data.map(fromDbItem));
      const hasDemo = data.some((i: Record<string, unknown>) => i.is_demo);
      setIsDemoMode(hasDemo && data.length > 0);
    }
  };

  const fetchTasks = async () => {
    const { data } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
    if (data) setTasks(data.map(fromDbTask));
  };

  const refreshData = async () => {
    setLoading(true);
    await Promise.all([fetchItems(), fetchTasks()]);
    setLoading(false);
  };

  useEffect(() => { refreshData(); }, []);

  const addItem = useCallback(async (item: Item) => {
    const { data } = await supabase.from('items').insert(toDbItem(item)).select().single();
    if (data) setItems(prev => [fromDbItem(data), ...prev]);
  }, []);

  const addItems = useCallback(async (newItems: Item[]) => {
    const chunks = [];
    for (let i = 0; i < newItems.length; i += 100) chunks.push(newItems.slice(i, i + 100));
    for (const chunk of chunks) {
      await supabase.from('items').upsert(chunk.map(i => toDbItem(i)), { onConflict: 'id' });
    }
    await fetchItems();
  }, []);

  const updateItem = useCallback(async (id: string, updates: Partial<Item>) => {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;
    if (updates.expiryDate !== undefined) dbUpdates.expiry_date = updates.expiryDate;
    if (updates.daysToExpiry !== undefined) dbUpdates.days_to_expiry = updates.daysToExpiry;
    if (updates.riskScore !== undefined) dbUpdates.risk_score = updates.riskScore;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    await supabase.from('items').update(dbUpdates).eq('id', id);
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  }, []);

  const deleteItem = useCallback(async (id: string) => {
    await supabase.from('items').delete().eq('id', id);
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const addTask = useCallback(async (task: Task) => {
    const { data } = await supabase.from('tasks').insert(toDbTask(task)).select().single();
    if (data) setTasks(prev => [fromDbTask(data), ...prev]);
  }, []);

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.completed !== undefined) dbUpdates.completed = updates.completed;
    if (updates.completedAt !== undefined) dbUpdates.completed_at = updates.completedAt;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    if (updates.assignee !== undefined) dbUpdates.assignee = updates.assignee;
    if (updates.assigneeEmail !== undefined) dbUpdates.assignee_email = updates.assigneeEmail;
    if (updates.assigneeId !== undefined) dbUpdates.assignee_id = updates.assigneeId;
    await supabase.from('tasks').update(dbUpdates).eq('id', id);
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    await supabase.from('tasks').delete().eq('id', id);
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const loadDemoData = useCallback(async () => {
    await supabase.from('tasks').delete().neq('id', '');
    await supabase.from('items').delete().neq('id', '');
    const demoItems = sampleItems.map(i => toDbItem(i, true));
    await supabase.from('items').insert(demoItems);
    const demoTasks = sampleTasks.map(toDbTask);
    await supabase.from('tasks').insert(demoTasks);
    await refreshData();
    setIsDemoMode(true);
  }, []);

  const clearAllData = useCallback(async () => {
    await supabase.from('tasks').delete().neq('id', '');
    await supabase.from('items').delete().neq('id', '');
    setItems([]);
    setTasks([]);
    setIsDemoMode(false);
    setUploadStatus(defaultUpload);
    localStorage.removeItem(UPLOAD_KEY);
  }, []);

  const updateUploadStatus = useCallback((key: keyof UploadStatus, status: UploadStatus[keyof UploadStatus]) => {
    setUploadStatus(prev => ({ ...prev, [key]: status }));
  }, []);

  const addStaff = useCallback(async (member: StaffMember) => {
    setStaff(prev => [...prev, member]);
  }, []);

  const removeStaff = useCallback(async (id: string) => {
    setStaff(prev => prev.filter(m => m.id !== id));
  }, []);

  return (
    <DataContext.Provider value={{
      items, tasks, uploadStatus, isDemoMode, staff, loading,
      addItem, addItems, updateItem, deleteItem,
      addTask, updateTask, deleteTask,
      loadDemoData, updateUploadStatus, clearAllData,
      addStaff, removeStaff, refreshData,
    }}>
      {children}
    </DataContext.Provider>
  );
}
