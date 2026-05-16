import { Category, Item, Task } from '../types';
import { calculateDaysToExpiry, calculateRiskScore, getStatus, getRecommendedAction } from './scoring';

// Flexible column aliases: canonical name → accepted header variants (lowercased + underscored)
const COL_ALIASES: Record<string, string[]> = {
  name: ['name', 'product_name', 'item_name', 'productname', 'itemname', 'product name', 'item name', 'description'],
  category: ['category', 'catagory', 'dept', 'department', 'cat', 'type', 'section'],
  quantity: ['quantity', 'qty', 'stock', 'quantity_in_stock', 'stock_quantity', 'on_hand', 'quantity on hand', 'qty_on_hand', 'available'],
  expiryDate: ['expiry_date', 'expirydate', 'expiry', 'expiration', 'expiration_date', 'best_before', 'best before', 'use_by', 'use by', 'sell_by', 'sell by'],
  sku: ['sku', 'product_id', 'barcode', 'item_id', 'upc', 'code', 'item_code'],
  receivedDate: ['received_date', 'date_received', 'last_restocked', 'received', 'arrival_date', 'last_received', 'date received'],
  movementPerDay: ['movement_per_day', 'units_per_day', 'sales_per_day', 'daily_sales', 'avg_daily_sales', 'avg_movement', 'daily movement'],
};

function normalizeKey(header: string): string {
  return header.trim().toLowerCase().replace(/\s+/g, '_');
}

// Map CSV headers to canonical column indices
function normalizeHeaders(headers: string[]): Record<string, number> {
  const result: Record<string, number> = {};
  headers.forEach((header, idx) => {
    const normalized = normalizeKey(header);
    for (const [canonical, aliases] of Object.entries(COL_ALIASES)) {
      if (canonical in result) continue;
      if (aliases.includes(normalized) || aliases.includes(header.trim().toLowerCase())) {
        result[canonical] = idx;
      }
    }
  });
  return result;
}

// Parse date strings into YYYY-MM-DD. Handles ISO, DD/MM/YYYY, MM/DD/YYYY, named months.
function parseDate(raw: string): string | null {
  if (!raw) return null;
  const s = raw.trim();
  if (!s) return null;

  // Already ISO: 2026-05-01
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    const parsed = new Date(s.substring(0, 10));
    return isNaN(parsed.getTime()) ? null : s.substring(0, 10);
  }

  // Slash formats: MM/DD/YYYY or DD/MM/YYYY
  const slashMatch = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (slashMatch) {
    const [, a, b, y] = slashMatch;
    const year = y.length === 2 ? `20${y}` : y;
    // If first part > 12, it must be DD/MM; otherwise assume MM/DD (US default)
    const isDD = parseInt(a) > 12;
    const month = (isDD ? b : a).padStart(2, '0');
    const day = (isDD ? a : b).padStart(2, '0');
    const candidate = `${year}-${month}-${day}`;
    const parsed = new Date(candidate);
    return isNaN(parsed.getTime()) ? null : candidate;
  }

  // Dot format: DD.MM.YYYY
  const dotMatch = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (dotMatch) {
    const [, d, m, y] = dotMatch;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // Fallback to JS Date parsing (handles "Jan 1, 2026", etc.)
  const parsed = new Date(s);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().substring(0, 10);
  }

  return null;
}

// Map raw category string to our Category enum
const CATEGORY_MAP: Record<string, Category> = {
  'produce': 'Produce',
  'fruit': 'Produce',
  'fruits': 'Produce',
  'vegetables': 'Produce',
  'fruits & vegetables': 'Produce',
  'fruits and vegetables': 'Produce',
  'fresh produce': 'Produce',
  'dairy': 'Dairy',
  'dairy & eggs': 'Dairy',
  'dairy and eggs': 'Dairy',
  'milk': 'Dairy',
  'cheese': 'Dairy',
  'meat': 'Meat',
  'poultry': 'Meat',
  'seafood': 'Meat',
  'fish': 'Meat',
  'meat & seafood': 'Meat',
  'meat and seafood': 'Meat',
  'deli': 'Meat',
  'bakery': 'Bakery',
  'bread': 'Bakery',
  'pastry': 'Bakery',
  'baked goods': 'Bakery',
  'canned': 'Canned',
  'canned goods': 'Canned',
  'pantry': 'Canned',
  'dry goods': 'Canned',
  'grocery': 'Canned',
  'beverages': 'Canned',
  'frozen': 'Frozen',
  'frozen foods': 'Frozen',
  'frozen food': 'Frozen',
  'oils & fats': 'Other',
  'oils and fats': 'Other',
  'condiments': 'Other',
  'snacks': 'Other',
};

function normalizeCategory(raw?: string): Category {
  if (!raw || !raw.trim()) return 'Other';
  const k = raw.trim().toLowerCase();
  return CATEGORY_MAP[k] ?? 'Other';
}

// Parse a single CSV row, respecting quoted fields
function parseCSVRow(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (c === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += c;
    }
  }
  result.push(current);
  return result;
}

export interface CSVImportResult {
  items: Item[];
  skipped: number;
  errors: string[];
  duplicates: number;
  total: number;
}

export function parseInventoryCSV(csvText: string, existingItems: Item[]): CSVImportResult {
  const errors: string[] = [];
  const items: Item[] = [];
  let skipped = 0;
  let duplicates = 0;

  const lines = csvText.split(/\r?\n/);
  // Find first non-empty line as header
  const headerIdx = lines.findIndex(l => l.trim().length > 0);
  if (headerIdx === -1 || lines.length < headerIdx + 2) {
    return { items, skipped, errors: ['File appears to be empty or has no data rows'], duplicates, total: 0 };
  }

  const headers = parseCSVRow(lines[headerIdx]).map(h => h.replace(/^"|"$/g, '').trim());
  const colMap = normalizeHeaders(headers);

  // Validate required columns
  const required = ['name', 'quantity', 'expiryDate'];
  const missing = required.filter(c => !(c in colMap));
  if (missing.length > 0) {
    const labels: Record<string, string> = {
      name: 'product_name / name',
      quantity: 'quantity / qty',
      expiryDate: 'expiry_date / expiration_date',
    };
    return {
      items, skipped, duplicates, total: 0,
      errors: [
        `Missing required columns: ${missing.map(m => labels[m] || m).join('; ')}`,
        `Columns detected: ${headers.join(', ')}`,
        `Tip: rename your columns or use accepted aliases.`,
      ],
    };
  }

  // Dedup set: name+expiryDate combo
  const existingKeys = new Set(existingItems.map(i => `${i.name.toLowerCase()}|${i.expiryDate}`));
  const seenInFile = new Set<string>();

  let dataRowCount = 0;
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    dataRowCount++;

    const row = parseCSVRow(line);
    const get = (col: string): string => {
      const idx = colMap[col];
      if (idx === undefined || idx >= row.length) return '';
      return row[idx].replace(/^"|"$/g, '').trim();
    };

    const rawName = get('name');
    if (!rawName) { skipped++; continue; }

    const rawQty = get('quantity');
    const qty = parseInt(rawQty.replace(/[^0-9.-]/g, ''));
    if (isNaN(qty) || qty < 0) {
      errors.push(`Row ${i + 1} "${rawName}": invalid quantity "${rawQty}" — skipped`);
      skipped++;
      continue;
    }

    const rawExpiry = get('expiryDate');
    const expiryDate = parseDate(rawExpiry);
    if (!expiryDate) {
      errors.push(`Row ${i + 1} "${rawName}": unrecognised date "${rawExpiry}" — skipped`);
      skipped++;
      continue;
    }

    // Duplicate check (existing + within same import)
    const key = `${rawName.toLowerCase()}|${expiryDate}`;
    if (existingKeys.has(key) || seenInFile.has(key)) {
      duplicates++;
      continue;
    }
    existingKeys.add(key);
    seenInFile.add(key);

    const category = normalizeCategory(get('category'));
    const daysToExpiry = calculateDaysToExpiry(expiryDate);
    const rawMovement = get('movementPerDay');
    const movement = rawMovement ? parseFloat(rawMovement) : undefined;
    const safeMovement = movement !== undefined && !isNaN(movement) ? movement : undefined;
    const riskScore = calculateRiskScore(daysToExpiry, category, safeMovement, qty);
    const status = getStatus(riskScore, daysToExpiry);
    const recommendedAction = getRecommendedAction(riskScore, daysToExpiry, category);
    const rawReceived = get('receivedDate');
    const receivedDate = parseDate(rawReceived) ?? undefined;
    const rawSku = get('sku');

    items.push({
      id: `csv-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`,
      name: rawName,
      category,
      sku: rawSku || undefined,
      quantity: qty,
      expiryDate,
      receivedDate,
      movementPerDay: safeMovement,
      daysToExpiry,
      riskScore,
      status,
      recommendedAction,
    });
  }

  return { items, skipped, errors, duplicates, total: dataRowCount };
}

// Build real weekly report CSV
export function exportWeeklyReportCSV(items: Item[], tasks: Task[]): string {
  const now = new Date().toISOString().substring(0, 10);
  const flagged = items.filter(i => i.riskScore >= 60);
  const completed = tasks.filter(t => t.completed);

  const e = (v: string | number) => {
    const s = String(v);
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
  };

  const lines: string[] = [];

  // Summary block
  lines.push('GROCEX WEEKLY REPORT');
  lines.push(`Generated,${e(now)}`);
  lines.push('');
  lines.push('SUMMARY');
  lines.push(`Total Items,${e(items.length)}`);
  lines.push(`At-Risk Items (score ≥60),${e(flagged.length)}`);
  lines.push(`Tasks Completed,${e(completed.length)}`);
  lines.push(`Estimated Savings ($),${e(completed.length * 15)}`);
  lines.push('');

  // Inventory detail
  lines.push('INVENTORY DETAIL');
  const invHeader = ['Item Name', 'Category', 'SKU', 'Quantity', 'Expiry Date', 'Days to Expiry', 'Risk Score', 'Status', 'Recommended Action'];
  lines.push(invHeader.map(e).join(','));
  items
    .sort((a, b) => b.riskScore - a.riskScore)
    .forEach(item => {
      lines.push([
        item.name,
        item.category,
        item.sku || '',
        item.quantity,
        item.expiryDate,
        item.daysToExpiry,
        item.riskScore,
        item.status,
        item.recommendedAction,
      ].map(v => e(String(v))).join(','));
    });

  lines.push('');

  // Tasks detail
  lines.push('TASKS DETAIL');
  const taskHeader = ['Item Name', 'Action', 'Assignee', 'Due Date', 'Completed', 'Completed At', 'Notes'];
  lines.push(taskHeader.map(e).join(','));
  tasks.forEach(task => {
    lines.push([
      task.itemName,
      task.action,
      task.assignee || '',
      task.dueDate,
      task.completed ? 'Yes' : 'No',
      task.completedAt || '',
      task.notes || '',
    ].map(v => e(String(v))).join(','));
  });

  return lines.join('\n');
}

export function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// CSV templates for download
export function generateInventoryTemplate(): string {
  const header = 'product_name,category,quantity,expiry_date,received_date,sku,movement_per_day';
  const rows = [
    'Organic Strawberries,Produce,24,2026-06-01,2026-05-16,PRD-001,3.2',
    'Whole Milk 1L,Dairy,12,2026-05-25,2026-05-10,DRY-023,5.1',
    'Chicken Breast,Meat,8,2026-05-20,2026-05-14,MT-001,2.8',
  ];
  return [header, ...rows].join('\n');
}

export function generateMovementTemplate(): string {
  const header = 'sku,product_name,date,quantity_sold,units_per_day';
  const rows = [
    'PRD-001,Organic Strawberries,2026-05-15,10,3.2',
    'DRY-023,Whole Milk 1L,2026-05-15,15,5.1',
  ];
  return [header, ...rows].join('\n');
}

export function generateWasteTemplate(): string {
  const header = 'sku,product_name,date,quantity,reason,value_usd';
  const rows = [
    'PRD-001,Organic Strawberries,2026-05-15,5,Expired,12.50',
    'BKY-034,Croissants,2026-05-15,3,Damaged,7.20',
  ];
  return [header, ...rows].join('\n');
}
