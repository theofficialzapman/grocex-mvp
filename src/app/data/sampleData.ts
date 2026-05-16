import { Item, Task } from '../types';
import { calculateDaysToExpiry, calculateRiskScore, getStatus, getRecommendedAction } from '../utils/scoring';

function futureDate(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().substring(0, 10);
}

function pastDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().substring(0, 10);
}

function createItem(
  id: string,
  name: string,
  category: Item['category'],
  quantity: number,
  expiryDaysFromNow: number,
  options: {
    sku?: string;
    receivedDaysAgo?: number;
    movementPerDay?: number;
  } = {}
): Item {
  const expiryDate = futureDate(expiryDaysFromNow);
  const daysToExpiry = calculateDaysToExpiry(expiryDate);
  const riskScore = calculateRiskScore(daysToExpiry, category, options.movementPerDay, quantity);
  const status = getStatus(riskScore, daysToExpiry);
  const recommendedAction = getRecommendedAction(riskScore, daysToExpiry, category);

  return {
    id,
    name,
    category,
    quantity,
    expiryDate,
    sku: options.sku,
    receivedDate: options.receivedDaysAgo !== undefined ? pastDate(options.receivedDaysAgo) : undefined,
    movementPerDay: options.movementPerDay,
    daysToExpiry,
    riskScore,
    status,
    recommendedAction,
  };
}

export const sampleItems: Item[] = [
  createItem('1', 'Organic Strawberries', 'Produce', 24, 1, { sku: 'PRD-001', receivedDaysAgo: 4, movementPerDay: 3.2 }),
  createItem('2', 'Whole Milk (1 Gallon)', 'Dairy', 18, 2, { sku: 'DRY-023', receivedDaysAgo: 10, movementPerDay: 5.1 }),
  createItem('3', 'Fresh Ground Beef', 'Meat', 12, 1, { sku: 'MT-045', receivedDaysAgo: 2, movementPerDay: 2.8 }),
  createItem('4', 'Spinach Bunch', 'Produce', 30, 3, { sku: 'PRD-089', receivedDaysAgo: 2, movementPerDay: 4.5 }),
  createItem('5', 'Greek Yogurt 4-pack', 'Dairy', 36, 6, { sku: 'DRY-102', receivedDaysAgo: 5, movementPerDay: 6.2 }),
  createItem('6', 'Artisan Sourdough', 'Bakery', 8, 2, { sku: 'BKY-012', receivedDaysAgo: 1, movementPerDay: 1.5 }),
  createItem('7', 'Cherry Tomatoes', 'Produce', 20, 4, { sku: 'PRD-034', receivedDaysAgo: 3, movementPerDay: 3.8 }),
  createItem('8', 'Salmon Fillets', 'Meat', 10, 2, { sku: 'MT-078', receivedDaysAgo: 2, movementPerDay: 2.1 }),
  createItem('9', 'Blueberries', 'Produce', 15, 5, { sku: 'PRD-056', receivedDaysAgo: 2, movementPerDay: 2.9 }),
  createItem('10', 'Mozzarella Cheese', 'Dairy', 22, 9, { sku: 'DRY-145', receivedDaysAgo: 6, movementPerDay: 4.3 }),
  createItem('11', 'Romaine Lettuce', 'Produce', 28, 3, { sku: 'PRD-067', receivedDaysAgo: 2, movementPerDay: 5.6 }),
  createItem('12', 'Croissants 6-pack', 'Bakery', 12, 3, { sku: 'BKY-034', receivedDaysAgo: 1, movementPerDay: 2.4 }),
  createItem('13', 'Chicken Breast', 'Meat', 16, 4, { sku: 'MT-023', receivedDaysAgo: 2, movementPerDay: 4.2 }),
  createItem('14', 'Avocados', 'Produce', 40, 2, { sku: 'PRD-012', receivedDaysAgo: 4, movementPerDay: 7.8 }),
  createItem('15', 'Cheddar Cheese Block', 'Dairy', 14, 14, { sku: 'DRY-089', receivedDaysAgo: 14, movementPerDay: 3.1 }),
];

export const sampleTasks: Task[] = [
  {
    id: 't1',
    itemId: '1',
    itemName: 'Organic Strawberries',
    action: 'move-to-front',
    assignee: 'Sarah M.',
    dueDate: futureDate(0),
    notes: 'Place at end cap for visibility',
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 't2',
    itemId: '3',
    itemName: 'Fresh Ground Beef',
    action: 'markdown',
    assignee: 'Mike T.',
    dueDate: futureDate(0),
    notes: '20% off sticker',
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 't3',
    itemId: '6',
    itemName: 'Artisan Sourdough',
    action: 'move-to-front',
    assignee: 'Sarah M.',
    dueDate: futureDate(1),
    notes: '',
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 't4',
    itemId: '14',
    itemName: 'Avocados',
    action: 'move-to-front',
    assignee: 'James L.',
    dueDate: pastDate(1),
    notes: 'Moved to produce front display',
    completed: true,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    completedAt: new Date(Date.now() - 86400000).toISOString(),
  },
];
