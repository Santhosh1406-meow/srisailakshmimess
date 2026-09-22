import React, { useState, useEffect } from 'react';
import BarChart from './BarChart';
import {
  fetchProfitLossData, fetchAiInsights, askAiAdvisor,
  fetchExpenses, createExpense, deleteExpense, resetProfitLossData
} from '../../services/api';
import {
  TrendingUp, TrendingDown, DollarSign, BrainCircuit, Sparkles,
  RefreshCw, Plus, Trash2, Calendar, PieChart, ShieldAlert,
  CheckCircle2, ArrowUpRight, ArrowDownRight, Coffee, Utensils,
  Lightbulb, HelpCircle, Send, X, AlertTriangle, Layers, Award,
  RotateCcw, Database
} from 'lucide-react';

export default function ProfitLossAnalytics() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [timeframe, setTimeframe] = useState('monthly'); // 'monthly' | 'weekly'
  const [chartView, setChartView] = useState('all'); // 'all' | 'category' | 'expenses'

  // AI Chat Assistant State
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiChatHistory, setAiChatHistory] = useState([]);
  const [aiThinking, setAiThinking] = useState(false);

  // Add Expense Modal
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    title: '',
    category: 'Raw Materials',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    paymentMethod: 'UPI'
  });
  const [expenseSubmitting, setExpenseSubmitting] = useState(false);
  const [expenseError, setExpenseError] = useState('');

  // Reset P&L Modal & state
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetSuccessMsg, setResetSuccessMsg] = useState('');

  const loadAllAnalytics = async () => {
    try {
      setLoading(true);
      const [plData, insights, expList] = await Promise.all([
        fetchProfitLossData(timeframe),
        fetchAiInsights(),
        fetchExpenses()
      ]);
      setData(plData);
      setAiInsights(insights);
      setExpenses(expList);
    } catch (err) {
      console.error('[ProfitLossAnalytics] Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAnalytics();
  }, [timeframe]);

  const handleAskAi = async (customPrompt) => {
    const query = customPrompt || aiQuestion;
    if (!query || !query.trim() || aiThinking) return;

    const userMessage = { sender: 'user', text: query, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setAiChatHistory((prev) => [...prev, userMessage]);
    if (!customPrompt) setAiQuestion('');

    try {
      setAiThinking(true);
      const result = await askAiAdvisor(query);
      const botMessage = {
        sender: 'ai',
        text: result.answer,
        source: result.source || 'Mess AI Financial Engine',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setAiChatHistory((prev) => [...prev, botMessage]);
    } catch (err) {
      setAiChatHistory((prev) => [
        ...prev,
        { sender: 'ai', text: 'Apologies, could not process that question right now. Please try again.', timestamp: new Date().toLocaleTimeString() }
      ]);
    } finally {
      setAiThinking(false);
    }
  };

  const handleCreateExpense = async (e) => {
    e.preventDefault();
    if (!expenseForm.title.trim()) { setExpenseError('Title is required'); return; }
    if (!expenseForm.amount || isNaN(Number(expenseForm.amount))) { setExpenseError('Valid amount is required'); return; }

    try {
      setExpenseSubmitting(true);
      setExpenseError('');
      const created = await createExpense(expenseForm);
      setExpenses((prev) => [created, ...prev]);
      setShowExpenseModal(false);
      setExpenseForm({
        title: '',
        category: 'Raw Materials',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
        paymentMethod: 'UPI'
      });
      // Refresh metrics to include new expense
      loadAllAnalytics();
    } catch (err) {
      setExpenseError(err.message || 'Failed to record expense');
    } finally {
      setExpenseSubmitting(false);
    }
  };

  const handleDeleteExpense = async (id, title) => {
    if (!window.confirm(`Delete expense "${title}"?`)) return;
    try {
      await deleteExpense(id);
      setExpenses((prev) => prev.filter((item) => item.id !== id));
      loadAllAnalytics();
    } catch (err) {
      alert('Failed to delete expense: ' + err.message);
    }
  };

  const handleResetProfitLoss = async () => {
    try {
      setResetting(true);
      setResetSuccessMsg('');
      await resetProfitLossData();
      await loadAllAnalytics();
      setShowResetModal(false);
      setResetSuccessMsg('Profit & Loss and expenses data reset successfully in database!');
      setTimeout(() => setResetSuccessMsg(''), 6000);
    } catch (err) {
      alert('Failed to reset P&L data: ' + err.message);
    } finally {
      setResetting(false);
    }
  };

  const CARD_STYLE = {
    backgroundColor: '#121b2f',
    background: 'linear-gradient(145deg, rgba(22, 32, 54, 0.85), rgba(13, 20, 36, 0.95))',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    padding: '1.5rem',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.45)',
    backdropFilter: 'blur(10px)'
  };

  if (loading && !data) {
    return (
      <div style={{ padding: '4rem 1rem', textAlign: 'center', color: '#94a3b8' }}>
        <RefreshCw size={36} className="spin-slow" style={{ color: '#ea580c', marginBottom: '1rem' }} />
        <h3 style={{ color: '#ffffff', fontSize: '1.2rem', margin: '0 0 0.5rem 0' }}>Analyzing Restaurant Financials...</h3>
        <p style={{ margin: 0, fontSize: '0.9rem' }}>Compiling orders, cost calculations, and generating AI insights.</p>
      </div>
    );
  }

  const kpis = data?.kpis || {
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    profitMargin: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    breakEvenDaily: 0
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* ── Top Header & Actions ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', color: '#38bdf8', fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.25)', padding: '0.3rem 0.75rem', borderRadius: '20px' }}>
              <BrainCircuit size={15} />
              <span>AI Business Intelligence & Analytics</span>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.3rem 0.75rem', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', fontSize: '0.78rem', fontWeight: '700' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block', boxShadow: '0 0 10px #10b981' }} />
              <Database size={13} />
              <span>Neon PostgreSQL Synced</span>
            </div>
          </div>
          <h2 style={{ fontSize: '1.85rem', fontWeight: '800', color: '#ffffff', margin: '0 0 0.25rem 0', letterSpacing: '-0.02em' }}>
            Profit & Loss Financial Analysis
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
            Real-time profit margins, analytical bar charts, operational expenses, and AI recommendations for Sri Sai Lakshmi Mess.
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={() => setShowExpenseModal(true)}
            style={{
              background: 'linear-gradient(135deg, #f59e0b, #ea580c)',
              color: '#ffffff',
              border: 'none',
              padding: '0.6rem 1.15rem',
              borderRadius: '10px',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              boxShadow: '0 4px 15px rgba(234, 88, 12, 0.35)'
            }}
          >
            <Plus size={16} />
            <span>Record Expense</span>
          </button>

          <button
            onClick={() => setShowResetModal(true)}
            style={{
              backgroundColor: 'rgba(244, 63, 94, 0.12)',
              color: '#fb7185',
              border: '1px solid rgba(244, 63, 94, 0.35)',
              padding: '0.6rem 1.1rem',
              borderRadius: '10px',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              transition: 'all 0.2s'
            }}
            title="Reset P&L and expenses data in database"
          >
            <RotateCcw size={15} />
            <span>Reset P&L Data</span>
          </button>

          <button
            onClick={loadAllAnalytics}
            style={{
              backgroundColor: 'rgba(30, 41, 59, 0.8)',
              color: '#cbd5e1',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '0.6rem 1rem',
              borderRadius: '10px',
              fontWeight: '600',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem'
            }}
          >
            <RefreshCw size={15} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* ── Success Toast Alert on Reset ── */}
      {resetSuccessMsg && (
        <div style={{
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid #10b981',
          color: '#a7f3d0',
          padding: '0.85rem 1.25rem',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          fontWeight: '600',
          fontSize: '0.9rem',
          boxShadow: '0 4px 15px rgba(16,185,129,0.2)'
        }}>
          <CheckCircle2 size={18} style={{ color: '#10b981', flexShrink: 0 }} />
          <span>{resetSuccessMsg}</span>
        </div>
      )}

      {/* ── Key Financial KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem' }}>
        {/* Total Revenue */}
        <div style={{ ...CARD_STYLE, borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            <span>Total Sales Revenue</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16,185,129,0.15)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.02em' }}>
            ₹{kpis.totalRevenue.toLocaleString('en-IN')}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.4rem', fontSize: '0.78rem', color: '#34d399', fontWeight: '600' }}>
            <ArrowUpRight size={14} />
            <span>{kpis.growthVsLastMonth || '+7.2%'} vs previous month</span>
          </div>
        </div>

        {/* Operating Expenses */}
        <div style={{ ...CARD_STYLE, borderLeft: '4px solid #ef4444' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            <span>Operating Expenses</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(239,68,68,0.15)', color: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingDown size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.02em' }}>
            ₹{kpis.totalExpenses.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.4rem' }}>
            Groceries (48%) • Staff (22%) • LPG (12%)
          </div>
        </div>

        {/* Net Profit */}
        <div style={{ ...CARD_STYLE, borderLeft: `4px solid ${kpis.netProfit >= 0 ? '#06b6d4' : '#ef4444'}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            <span>Net Profit / (Loss)</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(6,182,212,0.15)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: '800', color: kpis.netProfit >= 0 ? '#38bdf8' : '#f87171', letterSpacing: '-0.02em' }}>
            ₹{kpis.netProfit.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '0.4rem', fontWeight: '600' }}>
            Net Profit Margin: <strong style={{ color: '#34d399' }}>{kpis.profitMargin}%</strong>
          </div>
        </div>

        {/* Break Even Benchmark */}
        <div style={{ ...CARD_STYLE, borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            <span>Daily Break-Even Target</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(245,158,11,0.15)', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.02em' }}>
            ₹{kpis.breakEvenDaily.toLocaleString('en-IN')} <span style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: '500' }}>/ day</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#34d399', marginTop: '0.4rem', fontWeight: '600' }}>
            Covered in ~17 orders/day (Avg ₹{kpis.avgOrderValue})
          </div>
        </div>
      </div>

      {/* ── Section: Interactive Analytical Bar Charts ── */}
      <div style={{ ...CARD_STYLE, padding: '1.75rem' }}>
        {/* Controls toolbar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid #334155', paddingBottom: '1rem' }}>
          <div>
            <h3 style={{ margin: '0 0 0.35rem 0', fontSize: '1.25rem', fontWeight: '800', color: '#ffffff' }}>
              Financial Comparison Bar Charts
            </h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
              Compare Revenue, Operating Costs, and Resulting Net Profit across chosen time horizons.
            </p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
            {/* View Switcher */}
            <div style={{ display: 'inline-flex', backgroundColor: '#0f172a', padding: '3px', borderRadius: '10px', border: '1px solid #334155' }}>
              <button
                type="button"
                onClick={() => setChartView('all')}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  backgroundColor: chartView === 'all' ? '#ea580c' : 'transparent',
                  color: chartView === 'all' ? '#ffffff' : '#94a3b8',
                  transition: 'all 0.15s ease'
                }}
              >
                P&L Trend
              </button>
              <button
                type="button"
                onClick={() => setChartView('category')}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  backgroundColor: chartView === 'category' ? '#ea580c' : 'transparent',
                  color: chartView === 'category' ? '#ffffff' : '#94a3b8',
                  transition: 'all 0.15s ease'
                }}
              >
                Menu Margins
              </button>
              <button
                type="button"
                onClick={() => setChartView('expenses')}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  backgroundColor: chartView === 'expenses' ? '#ea580c' : 'transparent',
                  color: chartView === 'expenses' ? '#ffffff' : '#94a3b8',
                  transition: 'all 0.15s ease'
                }}
              >
                Expense Distribution
              </button>
            </div>

            {/* Timeframe selector (when in P&L Trend) */}
            {chartView === 'all' && (
              <div style={{ display: 'inline-flex', backgroundColor: '#0f172a', padding: '3px', borderRadius: '10px', border: '1px solid #334155' }}>
                <button
                  type="button"
                  onClick={() => setTimeframe('monthly')}
                  style={{
                    padding: '0.4rem 0.75rem',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    backgroundColor: timeframe === 'monthly' ? '#334155' : 'transparent',
                    color: timeframe === 'monthly' ? '#ffffff' : '#94a3b8'
                  }}
                >
                  Last 6 Months
                </button>
                <button
                  type="button"
                  onClick={() => setTimeframe('weekly')}
                  style={{
                    padding: '0.4rem 0.75rem',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    backgroundColor: timeframe === 'weekly' ? '#334155' : 'transparent',
                    color: timeframe === 'weekly' ? '#ffffff' : '#94a3b8'
                  }}
                >
                  This Week (Daily)
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Main Bar Chart 1: P&L Trend (Revenue vs Expenses vs Profit) ── */}
        {chartView === 'all' && (
          <div>
            <BarChart
              data={timeframe === 'monthly' ? data?.monthlyData : data?.weeklyData}
              xKey="period"
              height={340}
              currency={true}
              title={timeframe === 'monthly' ? 'Monthly Profit & Loss Comparison (₹)' : 'Daily Profit & Loss (This Week) (₹)'}
              series={[
                { key: 'revenue', label: 'Revenue (Income)', color: '#10b981' },
                { key: 'expenses', label: 'Expenses (Costs)', color: '#ef4444' },
                { key: 'netProfit', label: 'Net Profit', color: '#06b6d4' }
              ]}
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'center', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #334155', fontSize: '0.8rem', color: '#94a3b8' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#10b981' }} />
                <span>Green Bars: Total Sales / Turnover</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#ef4444' }} />
                <span>Red Bars: Total Operating Costs & Ingredients</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#06b6d4' }} />
                <span>Cyan Bars: Net Cash Profit Retained</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Main Bar Chart 2: Category Margins ── */}
        {chartView === 'category' && (
          <div>
            <BarChart
              data={data?.categoryData || []}
              xKey="category"
              height={340}
              currency={true}
              title="Menu Categories — Sales Revenue vs. Direct Preparation Costs (₹)"
              series={[
                { key: 'revenue', label: 'Sales Revenue (₹)', color: '#10b981' },
                { key: 'cost', label: 'Ingredients & Preparation Cost (₹)', color: '#f97316' }
              ]}
            />
            {/* Category Margin Pill Badges */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
              {data?.categoryData?.map((cat, i) => (
                <div key={i} style={{ background: '#0f172a', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #334155' }}>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600' }}>{cat.category}</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#ffffff', margin: '0.2rem 0' }}>
                    ₹{cat.revenue.toLocaleString('en-IN')}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#cbd5e1' }}>
                    <span>Gross Margin:</span>
                    <strong style={{ color: cat.grossMargin >= 45 ? '#34d399' : '#fb923c' }}>{cat.grossMargin}%</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Main Bar Chart 3: Expense Breakdown ── */}
        {chartView === 'expenses' && (
          <div>
            <BarChart
              data={data?.expenseBreakdown || []}
              xKey="category"
              height={340}
              currency={true}
              title="Major Expense Categories (Monthly Total in ₹)"
              series={[
                { key: 'amount', label: 'Monthly Expense (₹)', color: '#f59e0b' }
              ]}
            />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginTop: '1.5rem' }}>
              {data?.expenseBreakdown?.map((exp, i) => (
                <div key={i} style={{ background: '#0f172a', padding: '0.85rem', borderRadius: '10px', border: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: '600' }}>{exp.category}</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#ffffff', marginTop: '0.15rem' }}>₹{exp.amount.toLocaleString('en-IN')}</div>
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '800', color: exp.color || '#38bdf8', background: 'rgba(255,255,255,0.05)', padding: '0.3rem 0.5rem', borderRadius: '6px' }}>
                    {exp.percent}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Section: AI Financial Analysis & Strategic Advisor ── */}
      <div style={{ ...CARD_STYLE, border: '1px solid rgba(56,189,248,0.3)', background: 'linear-gradient(135deg, rgba(30,41,59,0.98), rgba(15,23,42,0.98))' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid #334155', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #0284c7, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', boxShadow: '0 0 16px rgba(6,182,212,0.4)' }}>
              <BrainCircuit size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '800', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>Mess AI Financial Intelligence</span>
                <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.55rem', borderRadius: '20px', background: 'rgba(56,189,248,0.15)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.3)' }}>
                  ACTIVE
                </span>
              </h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
                Automated unit economics evaluation, margin leak detection, and profitability forecasting.
              </p>
            </div>
          </div>

          {/* Health Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', padding: '0.45rem 1rem', borderRadius: '30px' }}>
            <CheckCircle2 size={16} style={{ color: '#10b981' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#34d399' }}>
              Financial Status: {aiInsights?.status || 'HEALTHY'} ({kpis.profitMargin}% Margin)
            </span>
          </div>
        </div>

        {/* Executive AI Audit Summary Box */}
        <div style={{ backgroundColor: 'rgba(15,23,42,0.7)', border: '1px solid #334155', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.75rem', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#38bdf8', fontWeight: '700', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            <Sparkles size={16} />
            <span>AI Executive Financial Assessment</span>
          </div>
          <p style={{ margin: 0, color: '#e2e8f0', fontSize: '0.92rem', lineHeight: '1.65' }}>
            {aiInsights?.summary || `Sri Sai Lakshmi Mess is running at a healthy ${kpis.profitMargin}% net margin with ₹${kpis.netProfit.toLocaleString('en-IN')} net earnings this month. Tiffin & Filter Coffee drive superior unit margins, while weekend lunch meals maximize volume. Adjusting takeaway container policies and evening snack combos will unlock an estimated ₹19,000+ incremental monthly net profit.`}
          </p>
        </div>

        {/* Grid: Strengths, Leakages, and Forecast */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          {/* Column 1: Key Drivers & Strengths */}
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '14px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34d399', fontWeight: '700', fontSize: '0.9rem', marginBottom: '1rem' }}>
              <TrendingUp size={18} />
              <span>Key Profit Drivers & Strengths</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {aiInsights?.strengths?.map((str, idx) => (
                <div key={idx} style={{ padding: '0.75rem', backgroundColor: 'rgba(16,185,129,0.06)', borderLeft: '3px solid #10b981', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                    <strong style={{ color: '#ffffff', fontSize: '0.85rem' }}>{str.title}</strong>
                    <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: '700', background: 'rgba(16,185,129,0.15)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                      {str.impact}
                    </span>
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '0.78rem', lineHeight: '1.45' }}>{str.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Margin Leakages & Alerts */}
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '14px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f87171', fontWeight: '700', fontSize: '0.9rem', marginBottom: '1rem' }}>
              <AlertTriangle size={18} />
              <span>Cost Leakages & Vulnerability Alerts</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {aiInsights?.leakages?.map((leak, idx) => (
                <div key={idx} style={{ padding: '0.75rem', backgroundColor: 'rgba(239,68,68,0.06)', borderLeft: '3px solid #ef4444', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                    <strong style={{ color: '#ffffff', fontSize: '0.85rem' }}>{leak.title}</strong>
                    <span style={{ fontSize: '0.7rem', color: '#fca5a5', fontWeight: '700', background: 'rgba(239,68,68,0.15)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                      Potential: {leak.potentialSavings}
                    </span>
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '0.78rem', lineHeight: '1.45' }}>{leak.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: AI Forecast */}
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '14px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#a78bfa', fontWeight: '700', fontSize: '0.9rem', marginBottom: '1rem' }}>
              <Sparkles size={18} />
              <span>Next Month AI Predictive Forecast</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ padding: '0.75rem', backgroundColor: 'rgba(167,139,250,0.08)', borderRadius: '8px', border: '1px solid rgba(167,139,250,0.2)' }}>
                <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Projected Sales Revenue</div>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#ffffff' }}>
                  ₹{(aiInsights?.forecast?.projectedRevenue || 200725).toLocaleString('en-IN')}
                </div>
              </div>
              <div style={{ padding: '0.75rem', backgroundColor: 'rgba(167,139,250,0.08)', borderRadius: '8px', border: '1px solid rgba(167,139,250,0.2)' }}>
                <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Projected Net Profit</div>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#38bdf8' }}>
                  ₹{(aiInsights?.forecast?.projectedNetProfit || 79185).toLocaleString('en-IN')}
                  <span style={{ fontSize: '0.8rem', color: '#34d399', marginLeft: '0.5rem' }}>({aiInsights?.forecast?.projectedMargin || 39.4}%)</span>
                </div>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center', marginTop: '0.25rem' }}>
                Forecast Confidence: <strong style={{ color: '#ffffff' }}>{aiInsights?.forecast?.confidenceScore || '92%'}</strong> based on recent transaction velocity.
              </div>
            </div>
          </div>
        </div>

        {/* ── Strategic Recommendations with Estimated ₹ Gain ── */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.05rem', fontWeight: '800', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Lightbulb size={18} style={{ color: '#f59e0b' }} />
            <span>High-Priority AI Recommendations (Profit Optimization)</span>
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {aiInsights?.recommendations?.map((rec) => (
              <div
                key={rec.id}
                style={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.2s ease, border-color 0.2s ease'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: '700', padding: '0.2rem 0.5rem', borderRadius: '4px', backgroundColor: 'rgba(234,88,12,0.15)', color: '#ea580c' }}>
                      {rec.category}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{rec.urgency}</span>
                  </div>
                  <h5 style={{ margin: '0 0 0.5rem 0', color: '#ffffff', fontSize: '0.95rem', fontWeight: '700' }}>{rec.title}</h5>
                  <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.8rem', lineHeight: '1.5' }}>{rec.description}</p>
                </div>
                <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Est. Net Gain:</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#34d399' }}>{rec.estimatedBenefit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Interactive Ask AI Advisor Q&A System ── */}
        <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '14px', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <HelpCircle size={20} style={{ color: '#38bdf8' }} />
            <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#ffffff' }}>
              Ask AI Financial Advisor
            </h4>
          </div>
          <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: '#94a3b8' }}>
            Ask anything about food costing, daily break-even, pricing strategies, or ways to cut mess expenses.
          </p>

          {/* Quick Prompt Chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
            {[
              'How can I increase profit margins to 40%?',
              'Which dishes give the highest profit margin?',
              'What is our daily break-even sales target?',
              'How can I reduce kitchen LPG & grocery costs?',
              'Is our parcel delivery profitable vs dine-in?'
            ].map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAskAi(chip)}
                style={{
                  backgroundColor: 'rgba(30,41,59,0.9)',
                  border: '1px solid #475569',
                  color: '#cbd5e1',
                  borderRadius: '20px',
                  padding: '0.4rem 0.85rem',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#38bdf8'; e.currentTarget.style.color = '#ffffff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#475569'; e.currentTarget.style.color = '#cbd5e1'; }}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Conversation Stream */}
          {aiChatHistory.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '350px', overflowY: 'auto', marginBottom: '1.25rem', paddingRight: '0.5rem' }}>
              {aiChatHistory.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    backgroundColor: msg.sender === 'user' ? '#ea580c' : '#1e293b',
                    color: '#ffffff',
                    padding: '0.85rem 1.15rem',
                    borderRadius: msg.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                    border: msg.sender === 'user' ? 'none' : '1px solid #334155',
                    fontSize: '0.88rem',
                    lineHeight: '1.55'
                  }}
                >
                  <div style={{ fontSize: '0.7rem', opacity: 0.7, marginBottom: '0.3rem', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                    <span>{msg.sender === 'user' ? 'You' : (msg.source || 'AI Financial Advisor')}</span>
                    <span>{msg.timestamp}</span>
                  </div>
                  <div style={{ whiteSpace: 'pre-line' }}>{msg.text}</div>
                </div>
              ))}
              {aiThinking && (
                <div style={{ alignSelf: 'flex-start', backgroundColor: '#1e293b', color: '#94a3b8', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #334155', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <RefreshCw size={15} className="spin-slow" style={{ color: '#38bdf8' }} />
                  <span>Analyzing Sri Sai Lakshmi Mess figures...</span>
                </div>
              )}
            </div>
          )}

          {/* Custom Query Input Bar */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleAskAi(); }}
            style={{ display: 'flex', gap: '0.5rem' }}
          >
            <input
              type="text"
              placeholder="e.g. How much can I save by buying rice in bulk?"
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              disabled={aiThinking}
              style={{
                flex: 1,
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '10px',
                padding: '0.75rem 1rem',
                color: '#ffffff',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={!aiQuestion.trim() || aiThinking}
              style={{
                backgroundColor: '#38bdf8',
                color: '#0f172a',
                border: 'none',
                borderRadius: '10px',
                padding: '0 1.25rem',
                fontWeight: '700',
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                opacity: (!aiQuestion.trim() || aiThinking) ? 0.5 : 1
              }}
            >
              <Send size={16} />
              <span>Ask</span>
            </button>
          </form>
        </div>
      </div>

      {/* ── Section: Recorded Mess Expenses Table ── */}
      <div style={{ ...CARD_STYLE }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: '#ffffff' }}>
              Operational Expense Log
            </h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>
              Track daily grocery purchases, LPG gas refills, worker salaries, and shop upkeep.
            </p>
          </div>
          <button
            onClick={() => setShowExpenseModal(true)}
            style={{
              backgroundColor: '#334155',
              color: '#ffffff',
              border: 'none',
              padding: '0.45rem 0.9rem',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <Plus size={15} />
            <span>Add Expense</span>
          </button>
        </div>

        {expenses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
            No expenses logged yet. Click "Record Expense" to add one.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Date</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Expense Item</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Category</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Payment</th>
                  <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Amount</th>
                  <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp) => (
                  <tr key={exp.id} style={{ borderBottom: '1px solid #1e293b' }}>
                    <td style={{ padding: '0.75rem 0.5rem', color: '#cbd5e1', whiteSpace: 'nowrap' }}>{exp.date}</td>
                    <td style={{ padding: '0.75rem 0.5rem', color: '#ffffff', fontWeight: '600' }}>
                      {exp.title}
                      {exp.notes && <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '400' }}>{exp.notes}</div>}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <span style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(56,189,248,0.1)', color: '#38bdf8', fontWeight: '600' }}>
                        {exp.category}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', color: '#94a3b8' }}>{exp.paymentMethod || 'Cash'}</td>
                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontWeight: '700', color: '#ef4444' }}>
                      ₹{Number(exp.amount).toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>
                      <button
                        onClick={() => handleDeleteExpense(exp.id, exp.title)}
                        style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                        title="Delete Expense"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Record Expense Modal ── */}
      {showExpenseModal && (
        <div
          style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)',
            zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={(e) => e.target === e.currentTarget && setShowExpenseModal(false)}
        >
          <div
            style={{
              backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '16px',
              padding: '2rem', width: '100%', maxWidth: '500px', maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, color: '#ffffff', fontSize: '1.2rem', fontWeight: '800' }}>Record New Expense</h3>
              <button
                onClick={() => setShowExpenseModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {expenseError && (
              <div style={{ backgroundColor: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', color: '#fca5a5', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {expenseError}
              </div>
            )}

            <form onSubmit={handleCreateExpense} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                  Expense Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Commercial 19kg Gas Refill"
                  value={expenseForm.title}
                  onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
                  style={{ width: '100%', backgroundColor: '#0f172a', border: '1px solid #475569', borderRadius: '8px', padding: '0.65rem 0.9rem', color: '#ffffff', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                    Category
                  </label>
                  <select
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                    style={{ width: '100%', backgroundColor: '#0f172a', border: '1px solid #475569', borderRadius: '8px', padding: '0.65rem 0.9rem', color: '#ffffff', outline: 'none', boxSizing: 'border-box' }}
                  >
                    <option value="Raw Materials">Raw Materials / Groceries</option>
                    <option value="Utilities & LPG">Utilities & LPG Gas</option>
                    <option value="Staff Wages">Staff Wages & Cook</option>
                    <option value="Packaging">Packaging & Leaves</option>
                    <option value="Rent & Maintenance">Rent & Maintenance</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="1850"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                    style={{ width: '100%', backgroundColor: '#0f172a', border: '1px solid #475569', borderRadius: '8px', padding: '0.65rem 0.9rem', color: '#ffffff', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                    Date
                  </label>
                  <input
                    type="date"
                    value={expenseForm.date}
                    onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                    style={{ width: '100%', backgroundColor: '#0f172a', border: '1px solid #475569', borderRadius: '8px', padding: '0.65rem 0.9rem', color: '#ffffff', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                    Payment Method
                  </label>
                  <select
                    value={expenseForm.paymentMethod}
                    onChange={(e) => setExpenseForm({ ...expenseForm, paymentMethod: e.target.value })}
                    style={{ width: '100%', backgroundColor: '#0f172a', border: '1px solid #475569', borderRadius: '8px', padding: '0.65rem 0.9rem', color: '#ffffff', outline: 'none', boxSizing: 'border-box' }}
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI / GPay / PhonePe</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bought from Uzhavar Sandhai"
                  value={expenseForm.notes}
                  onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })}
                  style={{ width: '100%', backgroundColor: '#0f172a', border: '1px solid #475569', borderRadius: '8px', padding: '0.65rem 0.9rem', color: '#ffffff', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  style={{ backgroundColor: 'transparent', border: '1px solid #475569', color: '#cbd5e1', padding: '0.6rem 1.1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={expenseSubmitting}
                  style={{ backgroundColor: '#ea580c', border: 'none', color: '#ffffff', padding: '0.6rem 1.25rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }}
                >
                  {expenseSubmitting ? 'Recording...' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Reset P&L Confirmation Modal ── */}
      {showResetModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          backgroundColor: 'rgba(3, 7, 18, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div style={{
            maxWidth: '460px', width: '100%',
            backgroundColor: '#0f172a',
            background: 'linear-gradient(145deg, #131c2e, #0c1220)',
            border: '1px solid rgba(244, 63, 94, 0.4)',
            borderRadius: '18px', padding: '2rem',
            boxShadow: '0 20px 50px rgba(0,0,0,0.7), 0 0 30px rgba(244,63,94,0.15)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{
                width: '46px', height: '46px', borderRadius: '12px',
                backgroundColor: 'rgba(244, 63, 94, 0.15)', color: '#fb7185',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <ShieldAlert size={24} />
              </div>
              <div>
                <h3 style={{ margin: 0, color: '#ffffff', fontSize: '1.25rem', fontWeight: '800' }}>
                  Reset Profit & Loss Data?
                </h3>
                <p style={{ margin: '0.2rem 0 0 0', color: '#94a3b8', fontSize: '0.8rem' }}>
                  Neon PostgreSQL Database Sync
                </p>
              </div>
            </div>

            <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              This will wipe recorded expenses and reset the Profit & Loss records in your <strong>Neon PostgreSQL database</strong>. Future metrics will be calculated cleanly from live verified orders.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                disabled={resetting}
                onClick={() => setShowResetModal(false)}
                style={{
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                  color: '#cbd5e1', padding: '0.65rem 1.15rem', borderRadius: '10px',
                  fontWeight: '600', cursor: 'pointer', fontSize: '0.88rem'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={resetting}
                onClick={handleResetProfitLoss}
                style={{
                  background: 'linear-gradient(135deg, #f43f5e, #dc2626)',
                  border: 'none', color: '#ffffff', padding: '0.65rem 1.25rem', borderRadius: '10px',
                  fontWeight: '700', cursor: 'pointer', fontSize: '0.88rem',
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  boxShadow: '0 4px 15px rgba(244, 63, 94, 0.35)'
                }}
              >
                {resetting ? <RefreshCw size={16} className="spin-slow" /> : <RotateCcw size={16} />}
                <span>{resetting ? 'Resetting Database...' : 'Yes, Reset Data'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
