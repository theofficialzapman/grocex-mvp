import { useState } from 'react';
import { useData } from '../context/DataContext';
import { Category, Item } from '../types';
import { calculateDaysToExpiry, calculateRiskScore, getStatus, getRecommendedAction } from '../utils/scoring';
import { toast } from 'sonner';
import { Plus, Save } from 'lucide-react';

const categories: Category[] = ['Produce', 'Dairy', 'Meat', 'Bakery', 'Canned', 'Frozen', 'Other'];

export default function AddItems() {
  const { addItem } = useData();

  const [quickName, setQuickName] = useState('');
  const [quickQuantity, setQuickQuantity] = useState('');
  const [quickExpiry, setQuickExpiry] = useState('');
  const [quickCategory, setQuickCategory] = useState<Category>('Produce');

  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('Produce');
  const [sku, setSku] = useState('');
  const [quantity, setQuantity] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [receivedDate, setReceivedDate] = useState('');
  const [movementPerDay, setMovementPerDay] = useState('');

  const createItemFromData = (
    itemName: string,
    itemCategory: Category,
    itemQuantity: string,
    itemExpiry: string,
    itemSku?: string,
    itemReceived?: string,
    itemMovement?: string
  ): Item | null => {
    if (!itemName || !itemQuantity || !itemExpiry) {
      toast.error('Please fill in required fields');
      return null;
    }

    const qty = parseInt(itemQuantity);
    if (isNaN(qty) || qty <= 0) {
      toast.error('Please enter a valid quantity');
      return null;
    }

    const daysToExpiry = calculateDaysToExpiry(itemExpiry);
    const movement = itemMovement ? parseFloat(itemMovement) : undefined;
    const riskScore = calculateRiskScore(daysToExpiry, itemCategory, movement, qty);
    const status = getStatus(riskScore, daysToExpiry);
    const recommendedAction = getRecommendedAction(riskScore, daysToExpiry, itemCategory);

    return {
      id: `item-${Date.now()}-${Math.random()}`,
      name: itemName,
      category: itemCategory,
      sku: itemSku || undefined,
      quantity: qty,
      expiryDate: itemExpiry,
      receivedDate: itemReceived || undefined,
      movementPerDay: movement,
      daysToExpiry,
      riskScore,
      status,
      recommendedAction,
    };
  };

  const handleQuickAdd = () => {
    const item = createItemFromData(quickName, quickCategory, quickQuantity, quickExpiry);
    if (item) {
      addItem(item);
      toast.success(`Added ${item.name}`);
      setQuickName('');
      setQuickQuantity('');
      setQuickExpiry('');
    }
  };

  const handleSave = (addAnother: boolean) => {
    const item = createItemFromData(name, category, quantity, expiryDate, sku, receivedDate, movementPerDay);
    if (item) {
      addItem(item);
      toast.success(`Added ${item.name}`);

      if (addAnother) {
        setName('');
        setSku('');
        setQuantity('');
        setExpiryDate('');
        setReceivedDate('');
        setMovementPerDay('');
      } else {
        setName('');
        setCategory('Produce');
        setSku('');
        setQuantity('');
        setExpiryDate('');
        setReceivedDate('');
        setMovementPerDay('');
      }
    }
  };

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Add Items</h1>
        <p className="text-gray-600">Add inventory items manually for tracking</p>
      </div>

      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Quick Add</h2>
          <p className="text-sm text-gray-600">Add items quickly with minimal information</p>
        </div>

        <div className="p-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={quickName}
                onChange={(e) => setQuickName(e.target.value)}
                placeholder="e.g., Fresh Strawberries"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="w-40">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={quickCategory}
                onChange={(e) => setQuickCategory(e.target.value as Category)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="w-32">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={quickQuantity}
                onChange={(e) => setQuickQuantity(e.target.value)}
                placeholder="24"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="w-44">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={quickExpiry}
                onChange={(e) => setQuickExpiry(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <button
              onClick={handleQuickAdd}
              className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Full Item Entry</h2>
          <p className="text-sm text-gray-600">Add detailed information for better tracking</p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Organic Strawberries"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SKU/Barcode
              </label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="PRD-001"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity on Hand <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="24"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Received Date
              </label>
              <input
                type="date"
                value={receivedDate}
                onChange={(e) => setReceivedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Movement (units per day)
              </label>
              <input
                type="number"
                step="0.1"
                value={movementPerDay}
                onChange={(e) => setMovementPerDay(e.target.value)}
                placeholder="e.g., 3.2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Optional: Improves risk scoring accuracy
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => handleSave(false)}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              Save Item
            </button>
            <button
              onClick={() => handleSave(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Save and Add Another
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
