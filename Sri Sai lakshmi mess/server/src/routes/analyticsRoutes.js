const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect, adminOnly, optionalAuth } = require('../middleware/authMiddleware');

// GET /api/analytics/profit-loss — Get profit & loss time-series bar chart data and KPIs
router.get('/profit-loss', protect, adminOnly, analyticsController.getProfitLoss);

// POST /api/analytics/profit-loss/reset — Reset Profit & Loss and expense data in database
router.post('/profit-loss/reset', protect, adminOnly, analyticsController.resetProfitLoss);

// GET /api/analytics/ai-insights — Automated AI financial analysis & recommendations
router.get('/ai-insights', protect, adminOnly, analyticsController.getAiInsights);

// POST /api/analytics/ai-advisor — Ask AI Financial Advisor interactive questions
router.post('/ai-advisor', protect, adminOnly, analyticsController.askAiAdvisor);

// GET /api/analytics/expenses — List logged operational expenses
router.get('/expenses', protect, adminOnly, analyticsController.getExpenses);

// POST /api/analytics/expenses — Add new operational expense (Admin)
router.post('/expenses', protect, adminOnly, analyticsController.createExpense);

// DELETE /api/analytics/expenses/:id — Delete recorded expense (Admin)
router.delete('/expenses/:id', protect, adminOnly, analyticsController.deleteExpense);

module.exports = router;
