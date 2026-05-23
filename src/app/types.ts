export type ItemStatus = 'green' | 'yellow' | 'orange' | 'red' | 'blue';
export type ActionType = 'move-to-front' | 'markdown' | 'donate' | 'dispose';
export type Category = 'Produce' | 'Dairy' | 'Meat' | 'Bakery' | 'Canned' | 'Frozen' | 'Other';

export interface StaffMember {
  id: string;
  name: string;
  email: string;
}

export interface Item {
  id: string;
  name: string;
  category: Category;
  sku?: string;
  quantity: number;
  expiryDate: string;
  receivedDate?: string;
  movementPerDay?: number;
  riskScore: number;
  status: ItemStatus;
  recommendedAction: string;
  daysToExpiry: number;
}

export interface Task {
  id: string;
  itemId: string;
  itemName: string;
  action: ActionType;
  assignee?: string;
  assigneeId?: string;
  assigneeEmail?: string;
  dueDate: string;
  notes?: string;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
}

export interface UploadStatus {
  skuList: 'not-uploaded' | 'uploaded' | 'error';
  inventory: 'not-uploaded' | 'uploaded' | 'error';
  movement: 'not-uploaded' | 'uploaded' | 'error';
  waste: 'not-uploaded' | 'uploaded' | 'error';
}
