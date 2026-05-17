import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { Item, Task, UploadStatus, StaffMember } from '../types';
import { sampleItems, sampleTasks } from '../data/sampleData';

// --- localStorage helpers ---
const KEYS = {
  ITEMS: 'grocex_items',
  TASKS: 'grocex_tasks',
  UPLOAD_STATUS: 'grocex_upload_status',
  IS_DEMO: 'grocex_is_demo',
  USER_CLEARED: 'grocex_user_cleared',
  STAFF: 'grocex_staff',
};

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or unavailable — silent fail
  }
}

const defaultUploadStatus: UploadStatus = {
  skuList: 'not-uploaded',
  inventory: 'not-uploaded',
  movement: 'not-uploaded',
  waste: 'not-uploaded',
};

// --- Initialise state from localStorage (lazy) ---
function initState(): { items: Item[]; tasks: Task[]; isDemoMode: boolean; uploadStatus: UploadStatus } {
  const userCleared = load<boolean>(KEYS.USER_CLEARED, false);
  const savedItems = load<Item[]>(KEYS.ITEMS, []);
  const savedTasks = load<Task[]>(KEYS.TASKS, []);
  const savedUploadStatus = load<UploadStatus>(KEYS.UPLOAD_STATUS, defaultUploadStatus);
  const savedIsDemo = load<boolean>(KEYS.IS_DEMO, false);

  // First visit or no data: default to demo
  if (savedItems.length === 0 && !userCleared) {
    save(KEYS.ITEMS, sampleItems);
    save(KEYS.TASKS, sampleTasks);
    save(KEYS.IS_DEMO, true);
    save(KEYS.USER_CLEARED, false);
    return { items: sampleItems, tasks: sampleTasks, isDemoMode: true, uploadStatus: defaultUploadStatus };
  }

  return { items: savedItems, tasks: savedTasks, isDemoMode: savedIsDemo, uploadStatus: savedUploadStatus };
}

// --- Context type ---
interface DataContextType {
  items: Item[];
  tasks: Task[];
  uploadStatus: UploadStatus;
  isDemoMode: boolean;
  staff: StaffMember[];
  addItem: (item: Item) => void;
  addItems: (items: Item[]) => void;
  updateItem: (id: string, updates: Partial<Item>) => void;
  deleteItem: (id: string) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  loadDemoData: () => void;
  updateUploadStatus: (key: keyof UploadStatus, status: UploadStatus[keyof UploadStatus]) => void;
  clearAllData: () => void;
  addStaff: (member: StaffMember) => void;
  removeStaff: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const initial = useRef(initState());
  const [items, setItems] = useState<Item[]>(initial.current.items);
  const [tasks, setTasks] = useState<Task[]>(initial.current.tasks);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(initial.current.isDemoMode);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>(initial.current.uploadStatus);
  const [staff, setStaff] = useState<StaffMember[]>(() => load<StaffMember[]>(KEYS.STAFF, []));

  // Persist whenever state changes (skip very first render — already saved in initState)
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return; }
    save(KEYS.ITEMS, items);
  }, [items]);

  useEffect(() => {
    if (!mounted.current) return;
    save(KEYS.TASKS, tasks);
  }, [tasks]);

  useEffect(() => {
    if (!mounted.current) return;
    save(KEYS.IS_DEMO, isDemoMode);
  }, [isDemoMode]);

  useEffect(() => {
    if (!mounted.current) return;
    save(KEYS.UPLOAD_STATUS, uploadStatus);
  }, [uploadStatus]);

  useEffect(() => {
    save(KEYS.STAFF, staff);
  }, [staff]);

  const addStaff = useCallback((member: StaffMember) => {
    setStaff(prev => [...prev, member]);
  }, []);

  const removeStaff = useCallback((id: string) => {
    setStaff(prev => prev.filter(m => m.id !== id));
  }, []);

  const loadDemoData = useCallback(() => {
    const fresh = sampleItems; // recompute relative dates
    const freshTasks = sampleTasks;
    setItems(fresh);
    setTasks(freshTasks);
    setIsDemoMode(true);
    setUploadStatus(defaultUploadStatus);
    save(KEYS.ITEMS, fresh);
    save(KEYS.TASKS, freshTasks);
    save(KEYS.IS_DEMO, true);
    save(KEYS.USER_CLEARED, false);
  }, []);

  const clearAllData = useCallback(() => {
    setItems([]);
    setTasks([]);
    setIsDemoMode(false);
    setUploadStatus(defaultUploadStatus);
    save(KEYS.ITEMS, []);
    save(KEYS.TASKS, []);
    save(KEYS.IS_DEMO, false);
    save(KEYS.UPLOAD_STATUS, defaultUploadStatus);
    save(KEYS.USER_CLEARED, true);
  }, []);

  const addItem = useCallback((item: Item) => {
    setItems(prev => [...prev, item]);
  }, []);

  const addItems = useCallback((newItems: Item[]) => {
    setItems(prev => [...prev, ...newItems]);
    setIsDemoMode(false);
    save(KEYS.IS_DEMO, false);
    save(KEYS.USER_CLEARED, false);
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<Item>) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  }, []);

  const deleteItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const addTask = useCallback((task: Task) => {
    setTasks(prev => [...prev, task]);
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => task.id === id ? { ...task, ...updates } : task));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  }, []);

  const updateUploadStatus = useCallback((key: keyof UploadStatus, status: UploadStatus[keyof UploadStatus]) => {
    setUploadStatus(prev => ({ ...prev, [key]: status }));
  }, []);

  return (
    <DataContext.Provider
      value={{
        items,
        tasks,
        uploadStatus,
        isDemoMode,
        staff,
        addItem,
        addItems,
        updateItem,
        deleteItem,
        addTask,
        updateTask,
        deleteTask,
        loadDemoData,
        updateUploadStatus,
        clearAllData,
        addStaff,
        removeStaff,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
}
