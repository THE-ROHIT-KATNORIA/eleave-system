import { calculateMonthlyImpact, formatDateForAPI } from '../utils/calendarUtils';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import axios from 'axios';

/**
 * Leave Balance Service
 * Manages leave balance calculations and previews for calendar selections
 */
class LeaveBalanceService {
  constructor() {
    this.apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    this.monthlyLimit = 3; // Default monthly limit
    this.balanceCache = new Map();
    this.cacheExpiry = 2 * 60 * 1000; // 2 minutes cache
  }

  /**
   * Get current monthly leave balance for user
   */
  async getCurrentBalance(userId, month = new Date()) {
    const monthKey = format(month, 'yyyy-MM');
    const cacheKey = `balance-${userId}-${monthKey}`;
    
    // Check cache first
    const cached = this.balanceCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < this.cacheExpiry) {
      return cached.data;
    }

    try {
      // In a real implementation, this would fetch from API
      // For now, we'll simulate the API call
      const response = await this.simulateBalanceAPI(userId, month);
      
      const balance = {
        userId,
        month: monthKey,
        monthLabel: format(month, 'MMMM yyyy'),
        used: response.used,
        remaining: this.monthlyLimit - response.used,
        limit: this.monthlyLimit,
        approvedLeaves: response.approvedLeaves || [],
        lastUpdated: new Date()
      };

      // Cache the result
      this.balanceCache.set(cacheKey, {
        data: balance,
        timestamp: Date.now()
      });

      return balance;

    } catch (error) {
      console.error('Error fetching balance:', error);
      
      // Return default balance on error
      return {
        userId,
        month: monthKey,
        monthLabel: format(month, 'MMMM yyyy'),
        used: 0,
        remaining: this.monthlyLimit,
        limit: this.monthlyLimit,
        approvedLeaves: [],
        lastUpdated: new Date(),
        error: error.message
      };
    }
  }

  /**
   * Calculate balance impact of selected dates
   */
  calculateBalanceImpact(selectedDates, currentBalances = {}) {
    const monthlyImpact = calculateMonthlyImpact(selectedDates);
    const balanceImpact = new Map();

    monthlyImpact.forEach((impact, monthKey) => {
      const currentBalance = currentBalances[monthKey] || {
        used: 0,
        remaining: this.monthlyLimit,
        limit: this.monthlyLimit
      };

      const newUsed = currentBalance.used + impact.count;
      const newRemaining = Math.max(0, this.monthlyLimit - newUsed);
      const exceeds = newUsed > this.monthlyLimit;
      const overage = exceeds ? newUsed - this.monthlyLimit : 0;

      balanceImpact.set(monthKey, {
        monthKey,
        monthLabel: impact.monthLabel,
        currentUsed: currentBalance.used,
        currentRemaining: currentBalance.remaining,
        selectedCount: impact.count,
        selectedDates: impact.dates,
        newUsed,
        newRemaining,
        exceeds,
        overage,
        limit: this.monthlyLimit,
        utilizationPercentage: (newUsed / this.monthlyLimit) * 100
      });
    });

    return balanceImpact;
  }

  /**
   * Get balance preview for selected dates
   */
  async getBalancePreview(userId, selectedDates) {
    try {
      // Get current balances for all affected months
      const monthlyImpact = calculateMonthlyImpact(selectedDates);
      const currentBalances = {};
      
      // Fetch current balance for each affected month
      for (const [monthKey] of monthlyImpact) {
        const [year, month] = monthKey.split('-');
        const monthDate = new Date(parseInt(year), parseInt(month) - 1, 1);
        const balance = await this.getCurrentBalance(userId, monthDate);
        currentBalances[monthKey] = balance;
      }

      // Calculate impact
      const balanceImpact = this.calculateBalanceImpact(selectedDates, currentBalances);
      
      // Generate summary
      const summary = this.generateBalanceSummary(balanceImpact);

      return {
        success: true,
        selectedDatesCount: selectedDates.length,
        affectedMonths: balanceImpact.size,
        balanceImpact: Object.fromEntries(balanceImpact),
        summary,
        warnings: this.generateWarnings(balanceImpact),
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Error generating balance preview:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  /**
   * Generate balance summary
   */
  generateBalanceSummary(balanceImpact) {
    let totalSelected = 0;
    let totalExceeded = 0;
    let monthsExceeded = 0;
    let monthsAtLimit = 0;

    balanceImpact.forEach(impact => {
      totalSelected += impact.selectedCount;
      
      if (impact.exceeds) {
        totalExceeded += impact.overage;
        monthsExceeded++;
      } else if (impact.newRemaining === 0) {
        monthsAtLimit++;
      }
    });

    return {
      totalSelected,
      totalExceeded,
      monthsExceeded,
      monthsAtLimit,
      affectedMonths: balanceImpact.size,
      hasExceeded: totalExceeded > 0,
      hasWarnings: monthsAtLimit > 0 || monthsExceeded > 0
    };
  }

  /**
   * Generate warnings for balance impact
   */
  generateWarnings(balanceImpact) {
    const warnings = [];

    balanceImpact.forEach(impact => {
      if (impact.exceeds) {
        warnings.push({
          type: 'LIMIT_EXCEEDED',
          severity: 'error',
          monthKey: impact.monthKey,
          monthLabel: impact.monthLabel,
          message: `Exceeds monthly limit for ${impact.monthLabel} by ${impact.overage} day${impact.overage !== 1 ? 's' : ''}`,
          overage: impact.overage
        });
      } else if (impact.newRemaining === 0) {
        warnings.push({
          type: 'LIMIT_REACHED',
          severity: 'warning',
          monthKey: impact.monthKey,
          monthLabel: impact.monthLabel,
          message: `Will reach monthly limit for ${impact.monthLabel}`,
          remaining: 0
        });
      } else if (impact.newRemaining <= 1) {
        warnings.push({
          type: 'LOW_BALANCE',
          severity: 'info',
          monthKey: impact.monthKey,
          monthLabel: impact.monthLabel,
          message: `Only ${impact.newRemaining} leave${impact.newRemaining !== 1 ? 's' : ''} remaining for ${impact.monthLabel}`,
          remaining: impact.newRemaining
        });
      }
    });

    return warnings.sort((a, b) => {
      const severityOrder = { error: 0, warning: 1, info: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }

  /**
   * Check if selection is allowed based on balance
   */
  async isSelectionAllowed(userId, selectedDates, allowOverage = false) {
    const preview = await this.getBalancePreview(userId, selectedDates);
    
    if (!preview.success) {
      return {
        allowed: false,
        reason: 'Unable to calculate balance',
        error: preview.error
      };
    }

    if (preview.summary.hasExceeded && !allowOverage) {
      return {
        allowed: false,
        reason: 'Selection exceeds monthly limits',
        exceededMonths: preview.summary.monthsExceeded,
        totalExceeded: preview.summary.totalExceeded
      };
    }

    return {
      allowed: true,
      warnings: preview.warnings.filter(w => w.severity !== 'error')
    };
  }

  /**
   * Get balance status for UI display
   */
  getBalanceStatus(balanceImpact) {
    const impact = Array.from(balanceImpact.values())[0]; // Current month
    
    if (!impact) {
      return {
        status: 'normal',
        color: '#10b981',
        message: 'No dates selected'
      };
    }

    if (impact.exceeds) {
      return {
        status: 'exceeded',
        color: '#ef4444',
        message: `Exceeds limit by ${impact.overage}`,
        severity: 'error'
      };
    }

    if (impact.newRemaining === 0) {
      return {
        status: 'at-limit',
        color: '#f59e0b',
        message: 'At monthly limit',
        severity: 'warning'
      };
    }

    if (impact.newRemaining <= 1) {
      return {
        status: 'low',
        color: '#f59e0b',
        message: `${impact.newRemaining} remaining`,
        severity: 'warning'
      };
    }

    return {
      status: 'normal',
      color: '#10b981',
      message: `${impact.newRemaining} remaining`,
      severity: 'info'
    };
  }

  /**
   * Simulate API call for balance (replace with real API)
   */
  async simulateBalanceAPI(userId, month) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Simulate some used leaves (in real app, this comes from database)
    const mockUsage = Math.floor(Math.random() * 3); // 0-2 used leaves
    
    return {
      used: mockUsage,
      approvedLeaves: [] // Would contain actual leave records
    };
  }

  /**
   * Clear balance cache
   */
  clearCache() {
    this.balanceCache.clear();
  }

  /**
   * Set monthly limit
   */
  setMonthlyLimit(limit) {
    this.monthlyLimit = limit;
    this.clearCache(); // Clear cache when limit changes
  }

  /**
   * Get configuration
   */
  getConfiguration() {
    return {
      monthlyLimit: this.monthlyLimit,
      cacheExpiry: this.cacheExpiry,
      apiBaseUrl: this.apiBaseUrl
    };
  }

  /**
   * Update balance after leave approval/rejection
   */
  async updateBalanceAfterStatusChange(userId, leaveId, newStatus, affectedDates) {
    try {
      // Clear cache for affected months
      const monthlyImpact = calculateMonthlyImpact(affectedDates);
      
      monthlyImpact.forEach((_, monthKey) => {
        const cacheKey = `balance-${userId}-${monthKey}`;
        this.balanceCache.delete(cacheKey);
      });

      // Optionally refresh balance immediately
      for (const [monthKey] of monthlyImpact) {
        const [year, month] = monthKey.split('-');
        const monthDate = new Date(parseInt(year), parseInt(month) - 1, 1);
        await this.getCurrentBalance(userId, monthDate);
      }

      return true;

    } catch (error) {
      console.error('Error updating balance after status change:', error);
      return false;
    }
  }
}

// Create singleton instance
const leaveBalanceService = new LeaveBalanceService();

export default leaveBalanceService;
export { LeaveBalanceService };