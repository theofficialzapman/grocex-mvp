import { useRef, useState } from 'react';
import { useData } from '../context/DataContext';
import { Upload, Download, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { parseInventoryCSV, downloadCSV, generateInventoryTemplate, generateMovementTemplate, generateWasteTemplate, CSVImportResult } from '../utils/csvUtils';

type UploadKey = 'skuList' | 'inventory' | 'movement' | 'waste';

interface UploadResult {
  key: UploadKey;
  result: CSVImportResult;
}

interface UploadCardProps {
  title: string;
  description: string;
  exampleColumns: string[];
  status: 'not-uploaded' | 'uploaded' | 'error';
  onFileSelect: (file: File) => void;
  onDownload: () => void;
  isOptional?: boolean;
  isProcessing?: boolean;
}

function UploadCard({ title, description, exampleColumns, status, onFileSelect, onDownload, isOptional, isProcessing }: UploadCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const statusConfig = {
    'not-uploaded': { icon: AlertCircle, color: 'text-gray-400', bg: 'bg-gray-50', label: 'Not uploaded' },
    'uploaded': { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', label: 'Uploaded' },
    'error': { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Error' },
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {title}
            {isOptional && <span className="text-sm text-gray-500 ml-2">(Optional)</span>}
          </h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        <div className={`p-2 rounded-lg ${config.bg}`}>
          <StatusIcon className={`w-6 h-6 ${config.color}`} />
        </div>
      </div>

      <div className="mb-4">
        <p className="text-xs font-medium text-gray-700 mb-2">Expected columns:</p>
        <div className="flex flex-wrap gap-2">
          {exampleColumns.map((col, idx) => (
            <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-mono">
              {col}
            </span>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Status: <span className={`font-medium ${config.color}`}>{config.label}</span>
        </p>
      </div>

      <div className="flex gap-3">
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={e => {
            const file = e.target.files?.[0];
            if (file) { onFileSelect(file); e.target.value = ''; }
          }}
        />
        <button
          onClick={() => inputRef.current?.click()}
          disabled={isProcessing}
          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Upload className="w-4 h-4" />
          {isProcessing ? 'Processing…' : 'Upload CSV'}
        </button>
        <button
          onClick={onDownload}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Template
        </button>
      </div>
    </div>
  );
}

export default function UploadData() {
  const { uploadStatus, updateUploadStatus, addItems, items } = useData();
  const [processing, setProcessing] = useState<UploadKey | null>(null);
  const [lastResult, setLastResult] = useState<UploadResult | null>(null);

  const handleInventoryFile = async (file: File) => {
    setProcessing('inventory');
    setLastResult(null);
    try {
      const text = await file.text();
      const result = parseInventoryCSV(text, items);

      if (result.errors.length > 0 && result.items.length === 0) {
        // Hard error — missing required columns
        updateUploadStatus('inventory', 'error');
        setLastResult({ key: 'inventory', result });
        toast.error('Import failed — see errors below');
      } else {
        if (result.items.length > 0) {
          addItems(result.items);
        }
        updateUploadStatus('inventory', result.items.length > 0 || result.duplicates > 0 ? 'uploaded' : 'error');
        setLastResult({ key: 'inventory', result });
        const msg = [
          result.items.length > 0 ? `${result.items.length} item${result.items.length !== 1 ? 's' : ''} imported` : null,
          result.duplicates > 0 ? `${result.duplicates} duplicate${result.duplicates !== 1 ? 's' : ''} skipped` : null,
          result.skipped > 0 ? `${result.skipped} row${result.skipped !== 1 ? 's' : ''} skipped` : null,
        ].filter(Boolean).join(' · ');
        if (result.items.length > 0) {
          toast.success(msg || 'Import complete');
        } else {
          toast.warning(msg || 'No valid rows found');
        }
      }
    } catch (err) {
      updateUploadStatus('inventory', 'error');
      toast.error('Could not read file. Make sure it is a valid CSV.');
    } finally {
      setProcessing(null);
    }
  };

  const handleOptionalFile = async (file: File, key: 'skuList' | 'movement' | 'waste') => {
    setProcessing(key);
    try {
      await file.text(); // just validate it's readable
      updateUploadStatus(key, 'uploaded');
      toast.success(`${file.name} uploaded. Movement/waste data will be used in future scoring updates.`);
    } catch {
      updateUploadStatus(key, 'error');
      toast.error('Could not read file.');
    } finally {
      setProcessing(null);
    }
  };

  const downloadTemplate = (type: 'inventory' | 'movement' | 'waste') => {
    const map = {
      inventory: { fn: generateInventoryTemplate, name: 'grocex_inventory_template.csv' },
      movement: { fn: generateMovementTemplate, name: 'grocex_movement_template.csv' },
      waste: { fn: generateWasteTemplate, name: 'grocex_waste_template.csv' },
    };
    const { fn, name } = map[type];
    downloadCSV(fn(), name);
    toast.success(`Downloaded ${name}`);
  };

  const inventoryResult = lastResult?.key === 'inventory' ? lastResult.result : null;

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Data</h1>
        <p className="text-gray-600">Import inventory and tracking data via CSV files</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
        <p className="text-sm text-blue-900">
          <strong>Getting started:</strong> Start with the Inventory + Expiry file — it's the only required one.
          Column names are flexible: "Category", "Catagory", "Dept" all work. Dates can be ISO (2026-05-01) or MM/DD/YYYY.
          Duplicates are automatically skipped.
        </p>
      </div>

      {/* Validation errors / import summary */}
      {inventoryResult && (
        <div className={`rounded-lg border p-4 mb-6 ${inventoryResult.errors.length > 0 && inventoryResult.items.length === 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
          <p className="font-semibold text-sm mb-2">
            {inventoryResult.errors.length > 0 && inventoryResult.items.length === 0 ? '❌ Import failed' : '✅ Import complete'}
          </p>
          {inventoryResult.items.length > 0 && (
            <p className="text-sm text-green-800">
              {inventoryResult.items.length} item{inventoryResult.items.length !== 1 ? 's' : ''} imported
              {inventoryResult.duplicates > 0 ? ` · ${inventoryResult.duplicates} duplicate${inventoryResult.duplicates !== 1 ? 's' : ''} skipped` : ''}
              {inventoryResult.skipped > 0 ? ` · ${inventoryResult.skipped} row${inventoryResult.skipped !== 1 ? 's' : ''} had errors` : ''}
              {' '}of {inventoryResult.total} total rows
            </p>
          )}
          {inventoryResult.errors.length > 0 && (
            <ul className="mt-2 space-y-1">
              {inventoryResult.errors.map((e, i) => (
                <li key={i} className="text-sm text-red-800">• {e}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <UploadCard
          title="Inventory + Expiry CSV"
          description="Current stock with expiry dates. Category column optional — defaults to Other if missing."
          exampleColumns={['product_name', 'category', 'quantity', 'expiry_date', 'sku', 'received_date']}
          status={uploadStatus.inventory}
          onFileSelect={handleInventoryFile}
          onDownload={() => downloadTemplate('inventory')}
          isProcessing={processing === 'inventory'}
        />

        <UploadCard
          title="SKU List CSV"
          description="Product master data (optional — enriches inventory if uploaded first)"
          exampleColumns={['sku', 'product_name', 'category', 'unit_size']}
          status={uploadStatus.skuList}
          onFileSelect={f => handleOptionalFile(f, 'skuList')}
          onDownload={() => { downloadCSV('sku,product_name,category,unit_size\nPRD-001,Organic Strawberries,Produce,250g\n', 'grocex_sku_template.csv'); toast.success('Downloaded SKU template'); }}
          isOptional
          isProcessing={processing === 'skuList'}
        />

        <UploadCard
          title="Sales / Movement CSV"
          description="Historical sales data for better risk scoring (optional)"
          exampleColumns={['sku', 'date', 'quantity_sold', 'units_per_day']}
          status={uploadStatus.movement}
          onFileSelect={f => handleOptionalFile(f, 'movement')}
          onDownload={() => downloadTemplate('movement')}
          isOptional
          isProcessing={processing === 'movement'}
        />

        <UploadCard
          title="Waste Log CSV"
          description="Historical waste data for reporting accuracy (optional)"
          exampleColumns={['sku', 'date', 'quantity', 'reason', 'value_usd']}
          status={uploadStatus.waste}
          onFileSelect={f => handleOptionalFile(f, 'waste')}
          onDownload={() => downloadTemplate('waste')}
          isOptional
          isProcessing={processing === 'waste'}
        />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Accepted column name variations</h2>
        <p className="text-sm text-gray-600 mb-4">The importer recognises these common naming differences automatically:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {[
            { field: 'Product name', aliases: 'name, product_name, item_name' },
            { field: 'Category', aliases: 'category, catagory, dept, department, type' },
            { field: 'Quantity', aliases: 'quantity, qty, stock, quantity_in_stock, on_hand' },
            { field: 'Expiry date', aliases: 'expiry_date, expiration_date, best_before, use_by, sell_by' },
            { field: 'SKU', aliases: 'sku, product_id, barcode, item_id, upc' },
            { field: 'Received date', aliases: 'received_date, date_received, last_restocked' },
          ].map(({ field, aliases }) => (
            <div key={field} className="bg-gray-50 rounded p-3">
              <span className="font-medium text-gray-800">{field}:</span>{' '}
              <span className="text-gray-600 font-mono text-xs">{aliases}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
