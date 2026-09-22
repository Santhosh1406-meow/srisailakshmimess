const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect, adminOnly, optionalAuth } = require('../middleware/authMiddleware');

// GET /api/analytics/profit-loss — Get profit & loss time-series bar chart data and KPIs
router.get('/profit-loss', optionalAuth, analyticsController.getProfitLoss);

// POST /api/analytics/profit-loss/reset — Reset Profit & Loss and expense data in database
router.post('/profit-loss/reset', optionalAuth, analyticsController.resetProfitLoss);

// GET /api/analytics/ai-insights — Automated AI financial analysis & recommendations
router.get('/ai-insights', optionalAuth, analyticsController.getAiInsights);

// POST /api/analytics/ai-advisor — Ask AI Financial Advisor interactive questions
router.post('/ai-advisor', optionalAuth, analyticsController.askAiAdvisor);

// GET /api/analytics/expenses — List logged operational expenses
router.get('/expenses', optionalAuth, analyticsController.getExpenses);

// POST /api/analytics/expenses — Add new operational expense (Admin)
router.post('/expenses', protect, adminOnly, analyticsController.createExpense);

// DELETE /api/analytics/expenses/:id — Delete recorded expense (Admin)
router.delete('/expenses/:id', protect, adminOnly, analyticsController.deleteExpense);

module.exports = router;
