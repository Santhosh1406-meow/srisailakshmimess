/**
 * Profit & Loss Record Model
 * Represents periodic financial performance stored in Neon PostgreSQL
 */

class ProfitLossRecord {
  constructor({
    id,
    periodType = 'monthly', // 'monthly' | 'weekly' | 'daily'
    periodLabel = '',
    revenue = 0,
    expenses = 0,
    netProfit = 0,
    marginPercent = 0,
    ordersCount = 0,
    notes = '',
    createdAt = new Date().toISOString(),
    updatedAt = new Date().toISOString()
  }) {
    this.id = id || `PL-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    this.periodType = periodType;
    this.periodLabel = periodLabel;
    this.revenue = Number(revenue) || 0;
    this.expenses = Number(expenses) || 0;
    this.netProfit = Number(netProfit) || (this.revenue - this.expenses);
    this.marginPercent = this.revenue > 0 ? Number(((this.netProfit / this.revenue) * 100).toFixed(1)) : 0;
    this.ordersCount = Number(ordersCount) || 0;
    this.notes = notes || '';
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

module.exports = ProfitLossRecord;
