const analyticsService = require('../services/analyticsService');

/**
 * GET /api/analytics/profit-loss
 * Retrieves Profit & Loss metrics, time series for bar charts, and category breakdowns
 */
exports.getProfitLoss = async (req, res, next) => {
  try {
    const timeframe = req.query.timeframe || '6months';
    const data = await analyticsService.getProfitLossMetrics(timeframe);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/analytics/ai-insights
 * Generates automated AI financial audit, strengths, margin leakages & recommendations
 */
exports.getAiInsights = async (req, res, next) => {
  try {
    const data = await analyticsService.getAiInsights();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/analytics/ai-advisor
 * Answers restaurant financial queries with context-aware AI
 */
exports.askAiAdvisor = async (req, res, next) => {
  try {
    const { question } = req.body;
    if (!question || typeof question !== 'string' || !question.trim()) {
      return res.status(400).json({ success: false, message: 'Question string is required.' });
    }
    const result = await analyticsService.askAiAdvisor(question.trim());
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/analytics/expenses
 * Lists recorded expenses
 */
exports.getExpenses = async (req, res, next) => {
  try {
    const expenses = await analyticsService.getAllExpenses();
    return res.status(200).json({ success: true, count: expenses.length, data: expenses });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/analytics/expenses
 * Records a new restaurant expense
 */
exports.createExpense = async (req, res, next) => {
  try {
    const { title, category, amount, date, notes, paymentMethod } = req.body;
    if (!title || !amount || isNaN(Number(amount))) {
      return res.status(400).json({ success: false, message: 'Title and a valid numeric amount are required.' });
    }
    const newExpense = await analyticsService.addExpense({
      title,
      category: category || 'Raw Materials',
      amount: Number(amount),
      date: date || new Date().toISOString().split('T')[0],
      notes,
      paymentMethod
    });
    return res.status(201).json({ success: true, message: 'Expense recorded successfully.', data: newExpense });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/analytics/expenses/:id
 * Removes an expense
 */
exports.deleteExpense = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await analyticsService.deleteExpense(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Expense not found.' });
    }
    return res.status(200).json({ success: true, message: 'Expense deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
