import { Category, ItemStatus } from '../types';

const categorySensitivity: Record<Category, number> = {
  'Produce': 1.5,
  'Dairy': 1.3,
  'Meat': 1.4,
  'Bakery': 1.2,
  'Frozen': 0.8,
  'Canned': 0.6,
  'Other': 1.0,
};

export function calculateDaysToExpiry(expiryDate: string): number {
  try {
    const expiry = new Date(expiryDate);
    if (isNaN(expiry.getTime())) return -1;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch {
    return -1;
  }
}

export function calculateRiskScore(
  daysToExpiry: number,
  category?: Category,
  movementPerDay?: number,
  quantity?: number
): number {
  try {
    let score = 0;

    if (daysToExpiry <= 0) {
      score = 100;
    } else if (daysToExpiry <= 2) {
      score = 85;
    } else if (daysToExpiry <= 7) {
      score = 60;
    } else if (daysToExpiry <= 14) {
      score = 35;
    } else {
      score = 15;
    }

    const safeCategory: Category = category && category in categorySensitivity ? category : 'Other';
    const sensitivity = categorySensitivity[safeCategory];
    score *= sensitivity;

    if (movementPerDay !== undefined && movementPerDay !== null && !isNaN(movementPerDay) &&
        quantity !== undefined && quantity !== null && !isNaN(quantity)) {
      const daysToSellOut = quantity / Math.max(movementPerDay, 0.1);
      if (daysToSellOut > daysToExpiry) {
        score += 20;
      } else if (daysToSellOut > daysToExpiry * 0.7) {
        score += 10;
      }
    }

    return Math.min(Math.round(score), 100);
  } catch {
    return 50; // neutral fallback
  }
}

export function getStatus(riskScore: number, daysToExpiry: number): ItemStatus {
  try {
    if (daysToExpiry <= 0) return 'red';
    if (riskScore >= 80) return 'red';
    if (riskScore >= 60) return 'orange';
    if (riskScore >= 35) return 'yellow';
    return 'green';
  } catch {
    return 'yellow';
  }
}

export function getRecommendedAction(riskScore: number, daysToExpiry: number, category?: Category): string {
  try {
    const safeCategory: Category = category && category in categorySensitivity ? category : 'Other';
    if (daysToExpiry <= 0) return 'Dispose or donate immediately';
    if (daysToExpiry <= 1) return 'Urgent: Move to front';
    if (daysToExpiry <= 3) return 'Move to front, consider markdown';
    if (daysToExpiry <= 7) {
      if (safeCategory === 'Produce' || safeCategory === 'Dairy' || safeCategory === 'Meat') {
        return 'Consider markdown';
      }
      return 'Monitor closely';
    }
    return 'Monitor';
  } catch {
    return 'Monitor';
  }
}

export function getRiskExplanation(
  daysToExpiry: number,
  category?: Category,
  movementPerDay?: number,
  quantity?: number
): string {
  try {
    const safeCategory: Category = category && category in categorySensitivity ? category : 'Other';
    const parts: string[] = [];

    if (daysToExpiry <= 0) {
      parts.push('Item has expired');
    } else if (daysToExpiry <= 3) {
      parts.push(`Expiring very soon (${daysToExpiry} day${daysToExpiry === 1 ? '' : 's'})`);
    } else if (daysToExpiry <= 7) {
      parts.push(`Expiring soon (${daysToExpiry} days)`);
    }

    const sensitivity = categorySensitivity[safeCategory];
    if (sensitivity > 1.2) {
      parts.push(`${safeCategory} is a high-sensitivity category`);
    }

    if (movementPerDay === undefined || movementPerDay === null || isNaN(movementPerDay)) {
      parts.push('Movement data not provided');
    } else if (quantity !== undefined && quantity !== null && !isNaN(quantity)) {
      const daysToSellOut = quantity / Math.max(movementPerDay, 0.1);
      if (daysToSellOut > daysToExpiry) {
        parts.push(`Low movement (${movementPerDay.toFixed(1)} units/day, will not sell before expiry)`);
      } else if (movementPerDay < 1) {
        parts.push('Low movement rate');
      }
    }

    return parts.length > 0
      ? `High risk because: ${parts.join(' + ')}.`
      : 'Low risk. Standard monitoring recommended.';
  } catch {
    return 'Risk explanation unavailable.';
  }
}
