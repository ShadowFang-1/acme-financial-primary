import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  Target, 
  Banknote, 
  Calculator, 
  Plus, 
  ChevronRight, 
  PieChart as PieChartIcon, 
  ShieldCheck,
  ArrowRight,
  Zap,
  Clock,
  Briefcase,
  X,
  CreditCard,
  RefreshCw,
  Trash2,
  Pause,
  Play,
  Repeat
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import Layout from '../components/Layout';

const STOCKS = [
  { symbol: 'MTNG', name: 'Scancom PLC (MTN Ghana)', price: 1.55, trend: '+2.4%' },
  { symbol: 'GCB', name: 'GCB Bank Limited', price: 5.20, trend: '+0.8%' },
  { symbol: 'SCB', name: 'Standard Chartered', price: 18.50, trend: '-1.2%' },
  { symbol: 'EGL', name: 'Enterprise Group', price: 2.80, trend: '+0.5%' },
  { symbol: 'BTC', name: 'Bitcoin (Global)', price: 72400.00, trend: '+4.1%' },
  { symbol: 'AAPL', name: 'Apple Inc.', price: 185.20, trend: '+0.4%' }
];

const FinancialHub = () => {
  const [hubData, setHubData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Toast notification system
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Growth Engine Calculator
  const [calcMode, setCalcMode] = useState('INVESTMENT'); // INVESTMENT or LOAN
  const [calcInterval, setCalcInterval] = useState('MONTHLY');
  const [calcPrincipal, setCalcPrincipal] = useState('1000');
  const [calcYears, setCalcYears] = useState('5');
  const [calcResult, setCalcResult] = useState(null);

  // System rates (periodic)
  const RATES = {
    INVESTMENT: { DAILY: 0.5, WEEKLY: 1.0, MONTHLY: 5.0, ANNUALLY: 12.0 },
    LOAN: { DAILY: 0.5, WEEKLY: 1.0, MONTHLY: 5.0, ANNUALLY: 12.0 }
  };

  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [contributeGoalId, setContributeGoalId] = useState(null);
  const [contributeAmount, setContributeAmount] = useState('');

  const [showLoanModal, setShowLoanModal] = useState(false);
  const [loanAmount, setLoanAmount] = useState('');
  const [loanMonths, setLoanMonths] = useState('12');
  const [loanRepayFreq, setLoanRepayFreq] = useState('MONTHLY');

  const [showInvestModal, setShowInvestModal] = useState(false);
  const [investAmount, setInvestAmount] = useState('');
  const [investInterval, setInvestInterval] = useState('MONTHLY');
  const [investTarget, setInvestTarget] = useState('');

  const [showGrowthGraph, setShowGrowthGraph] = useState(null); // stores investment object

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  
  const [showPayLoanModal, setShowPayLoanModal] = useState(false);
  const [payLoanAmount, setPayLoanAmount] = useState('');
  const [selectedLoanId, setSelectedLoanId] = useState(null);

  const [showAcademy, setShowAcademy] = useState(false);
  const [showTradeSandbox, setShowTradeSandbox] = useState(false);
  const [sandboxBalance, setSandboxBalance] = useState(250000);
  const [sandboxPortfolio, setSandboxPortfolio] = useState([]);
  const [showConfirm, setShowConfirm] = useState(null); // { title: '', message: '', onConfirm: fn }

  // Auto-Allocation
  const [showAllocModal, setShowAllocModal] = useState(false);
  const [allocDestType, setAllocDestType] = useState('INVESTMENT');
  const [allocDestId, setAllocDestId] = useState('');
  const [allocAmount, setAllocAmount] = useState('');
  const [allocFrequency, setAllocFrequency] = useState('MONTHLY');
  const [allocLabel, setAllocLabel] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get('/api/v1/hub/summary');
      setHubData(res.data);
    } catch (err) {
      console.error("Hub Error:", err);
      showToast(err.response?.data?.message || "Hub data unavailable. Please check your session.", 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async () => {
    if (!goalName || !goalTarget) return;
    setLoading(true);
    try {
      await axios.post('/api/v1/hub/savings/create', null, { params: { name: goalName, target: goalTarget } });
      fetchData(); setShowGoalModal(false); setGoalName(''); setGoalTarget('');
      showToast('Wealth accumulation target established!');
    } catch (err) { showToast(err.response?.data?.message || "Goal creation failed.", 'error'); }
    finally { setLoading(false); }
  };

  const handleApplyLoan = async () => {
    if (!loanAmount) return;
    setLoading(true);
    try {
      await axios.post('/api/v1/hub/loans/apply', null, { params: { amount: loanAmount, months: loanMonths || 12, repaymentFrequency: loanRepayFreq } });
      fetchData(); setShowLoanModal(false); setLoanAmount('');
      showToast(`Credit authorized! Auto-repayment: ${loanRepayFreq.toLowerCase()}.`);
    } catch (err) { showToast(err.response?.data?.message || "Loan declined.", 'error'); }
    finally { setLoading(false); }
  };

  const handleWithdrawGoal = async (goalId) => {
    setLoading(true);
    try {
      await axios.post('/api/v1/hub/savings/withdraw', null, { params: { goalId } });
      fetchData();
      showToast('Goal funds withdrawn to Savings!');
    } catch (err) { showToast(err.response?.data?.message || 'Withdrawal failed.', 'error'); }
    finally { setLoading(false); }
  };

  const handleInvest = async () => {
    if (!investAmount) return;
    setLoading(true);
    try {
      await axios.post('/api/v1/hub/invest', null, { 
        params: { 
          amount: investAmount, 
          interval: investInterval,
          targetAmount: investTarget || undefined
        } 
      });
      fetchData(); setShowInvestModal(false); setInvestAmount(''); setInvestTarget('');
      showToast(`Investment successful! Growing ${investInterval.toLowerCase()}.`);
    } catch (err) { showToast(err.response?.data?.message || "Investment failed.", 'error'); }
    finally { setLoading(false); }
  };

  const handleWithdrawInvestment = async () => {
    if (!withdrawAmount) return;
    setLoading(true);
    try {
      await axios.post('/api/v1/hub/invest/withdraw', null, { params: { amount: withdrawAmount } });
      fetchData(); setShowWithdrawModal(false); setWithdrawAmount('');
      showToast("Capital liquefied back to Savings!");
    } catch (err) { showToast(err.response?.data?.message || "Withdrawal failed.", 'error'); }
    finally { setLoading(false); }
  };

  const handlePayLoan = async () => {
    if (!payLoanAmount || !selectedLoanId) return;
    setLoading(true);
    try {
      await axios.post('/api/v1/hub/loans/pay', null, { params: { loanId: selectedLoanId, amount: payLoanAmount } });
      fetchData(); setShowPayLoanModal(false); setPayLoanAmount('');
      showToast("Debt repayment executed successfully!");
    } catch (err) { showToast(err.response?.data?.message || "Payment failed.", 'error'); }
    finally { setLoading(false); }
  };

  const handleCancelInvestment = async (investmentId, amount) => {
    setShowConfirm({
      title: "Institutional Alert",
      message: "Are you sure you want to fully cancel and liquify this asset? This action will immediately return all balanced capital to your primary Savings vault.",
      onConfirm: async () => {
        setLoading(true);
        try {
          await axios.post('/api/v1/hub/invest/withdraw', null, { params: { investmentId, amount } });
          fetchData();
          showToast("Asset fully liquidated. Capital returned to Savings.");
        } catch (err) { showToast(err.response?.data?.message || "Cancellation failed.", 'error'); }
        finally { setLoading(false); setShowConfirm(null); }
      }
    });
  };

  const handleContributeToGoal = async () => {
    if (!contributeAmount || !contributeGoalId) return;
    setLoading(true);
    try {
      await axios.post('/api/v1/hub/savings/contribute', null, { params: { goalId: contributeGoalId, amount: contributeAmount } });
      fetchData(); setShowContributeModal(false); setContributeAmount('');
      showToast("Funds contributed to your savings goal!");
    } catch (err) { showToast(err.response?.data?.message || "Contribution failed.", 'error'); }
    finally { setLoading(false); }
  };
  const handleCalculate = () => {
    const P = parseFloat(calcPrincipal);
    const periodicRate = RATES[calcMode][calcInterval] / 100;
    const t = parseFloat(calcYears); // Now represents number of selected periods
    if (!P || !t) return;

    if (calcMode === 'INVESTMENT') {
      const futureValue = P * Math.pow(1 + periodicRate, t);
      const interest = futureValue - P;
      setCalcResult({ futureValue: futureValue.toFixed(2), interest: interest.toFixed(2), rate: periodicRate * 100, type: 'INVESTMENT' });
    } else {
      // Loan: total repayment with interest
      const totalPeriods = t;
      const periodicInterest = periodicRate;
      const payment = P * (periodicInterest * Math.pow(1 + periodicInterest, totalPeriods)) / (Math.pow(1 + periodicInterest, totalPeriods) - 1);
      const totalRepayment = payment * totalPeriods;
      const totalInterest = totalRepayment - P;
      setCalcResult({ totalRepayment: totalRepayment.toFixed(2), periodicPayment: payment.toFixed(2), totalInterest: totalInterest.toFixed(2), rate: periodicRate * 100, type: 'LOAN' });
    }
  };

  // Auto-Allocation handlers
  const handleCreateAllocation = async () => {
    if (!allocAmount) return;
    setLoading(true);
    try {
      await axios.post('/api/v1/hub/allocations', null, { 
        params: { 
          destinationType: allocDestType, 
          destinationId: allocDestId || undefined,
          amount: allocAmount, 
          frequency: allocFrequency,
          label: allocLabel || undefined
        } 
      });
      fetchData(); setShowAllocModal(false); setAllocAmount(''); setAllocLabel('');
      showToast(`Auto-allocation created! Runs ${allocFrequency.toLowerCase()}.`);
    } catch (err) { showToast(err.response?.data?.message || "Allocation failed.", 'error'); }
    finally { setLoading(false); }
  };

  const handleToggleAllocation = async (id) => {
    try {
      await axios.post(`/api/v1/hub/allocations/${id}/toggle`);
      fetchData();
      showToast("Allocation toggled.");
    } catch (err) { showToast("Toggle failed.", 'error'); }
  };

  const handleDeleteAllocation = async (id) => {
    setShowConfirm({
      title: "Decommission Rule",
      message: "Are you sure you want to permanently remove this auto-allocation rule?",
      onConfirm: async () => {
        try {
          await axios.delete(`/api/v1/hub/allocations/${id}`);
          fetchData();
          showToast("Allocation removed.");
        } catch (err) { showToast("Delete failed.", 'error'); }
        finally { setShowConfirm(null); }
      }
    });
  };

  const handleSandboxBuy = (stock) => {
    const exchangeRate = 15; // Simulated Local FX
    const price = stock.price * (stock.symbol === 'BTC' || stock.symbol === 'AAPL' ? exchangeRate : 1);
    
    if (sandboxBalance < price) {
       showToast("Sandbox Exception: Insufficient Capital.", "error");
       return;
    }
    setSandboxBalance(prev => prev - price);
    setSandboxPortfolio(prev => {
       const existing = prev.find(p => p.symbol === stock.symbol);
       if (existing) {
          return prev.map(p => p.symbol === stock.symbol ? { ...p, qty: p.qty + 1, avgPrice: (p.avgPrice + price) / 2 } : p);
       }
       return [...prev, { symbol: stock.symbol, name: stock.name, qty: 1, avgPrice: price }];
    });
    showToast(`Order Confirmed: 1 Unit ${stock.symbol} at ${price.toFixed(2)}`, 'success');
  };

  const simulateMarketRefresh = () => {
     showToast("Market Intelligence: Fetching Live Assets...", "success");
     // Visual refresh effect
  };

  const pieData = (hubData?.investments || [])
    .filter(inv => inv.amount > 0 && inv.status !== 'LIQUIDATED')
    .map((inv, idx) => ({
      name: inv.assetName || "Fund " + (idx+1),
      value: parseFloat(inv.amount || 0)
    }));

  if (pieData.length === 0) pieData.push({ name: 'Cash Reserve', value: 1000 });

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

  const STOCKS = [
    { symbol: 'AAPL', name: 'Apple Inc', price: 189.45, trend: '+1.2%' },
    { symbol: 'BTC', name: 'Bitcoin (Spot)', price: 64230.10, trend: '-0.5%' },
    { symbol: 'TSLA', name: 'Tesla Corp', price: 172.10, trend: '+4.5%' }
  ];

  if (loading) return <Layout title="Loading Hub..."><div className="p-20 text-center animate-pulse italic font-black text-slate-300">Synchronizing Institutional Records...</div></Layout>;

  return (
    <>
      <Layout title="ACME Financial Hub" subtitle="Institutional Wealth Management & Intelligence">

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-8 right-8 z-[300] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 max-w-md ${
          toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'
        }`}>
          <ShieldCheck size={20} />
          <span className="font-bold text-sm">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 opacity-70 hover:opacity-100"><X size={16}/></button>
        </div>
      )}
      
      {/* Academy Overlay */}
      {showAcademy && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-xl z-[200] flex items-center justify-center p-6 text-white animate-in zoom-in-95">
           <button onClick={() => setShowAcademy(false)} className="absolute top-6 right-6 sm:top-10 sm:right-10 hover:rotate-90 transition-all z-50 text-white/50 hover:text-white"><X size={24} sm:size={32}/></button>
           <div className="max-w-4xl w-full text-left bg-slate-900/40 p-6 sm:p-12 rounded-[2rem] sm:rounded-[3.5rem] border border-white/5 shadow-3xl overflow-y-auto max-h-[90vh]">
              <h2 className="text-2xl sm:text-4xl font-black italic mb-4 text-center">ACME Academy: Asset Mastery</h2>
              <p className="text-center text-slate-400 text-[10px] uppercase tracking-[0.3em] sm:tracking-[0.5em] mb-8 sm:mb-12 italic font-bold">Institutional Intelligence Engine</p>
              
              <div className="grid grid-cols-1 gap-8">
                 <div className="p-8 bg-white/5 rounded-3xl border border-white/10">
                    <Zap className="text-secondary mb-4" size={32} />
                    <h4 className="font-black italic mb-4 uppercase tracking-widest text-lg">1. The Power of Compounding (Periodic Yield)</h4>
                    <p className="text-sm text-slate-300 leading-relaxed font-medium mb-4">
                       ACME's Investment Hub utilizes a unique periodic yield system designed for rapid capital acceleration. Unlike traditional annual-only compounding, we offer multi-frequency intervals:
                    </p>
                    <ul className="space-y-3 text-xs text-slate-400 list-disc pl-5">
                       <li><strong>Daily (0.5%):</strong> Ideal for high-liquidity capital rotation. Capital grows every 24 hours.</li>
                       <li><strong>Weekly (1.0%):</strong> A balanced approach for medium-term treasury management.</li>
                       <li><strong>Monthly (5.0%):</strong> Historical institutional standard for wealth accumulation.</li>
                       <li><strong>Annually (12.0%):</strong> Strategic long-term holding with our highest single-interval rate.</li>
                    </ul>
                 </div>

                 <div className="p-8 bg-white/5 rounded-3xl border border-white/10">
                    <ShieldCheck className="text-emerald-400 mb-4" size={32} />
                    <h4 className="font-black italic mb-4 uppercase tracking-widest text-lg">2. Strategic Debt Management</h4>
                    <p className="text-sm text-slate-300 leading-relaxed font-medium">
                       Loans at ACME Financial are structured as "Closed-End Obligations." When you request credit, a closing date is calculated. The system performs automatic deductions from your primary Savings vault based on your selected frequency. If capital is insufficient on the closing date, the system will attempt to clear the remaining balance from all connected liquidity sources to maintain your credit score.
                    </p>
                 </div>

                 <div className="p-8 bg-white/5 rounded-3xl border border-white/10">
                    <Briefcase className="text-blue-400 mb-4" size={32} />
                    <h4 className="font-black italic mb-4 uppercase tracking-widest text-lg">3. Target-Based Wealth Tracking</h4>
                    <p className="text-sm text-slate-300 leading-relaxed font-medium">
                       Successful wealth management requires measurable targets. By setting an **Investment Target**, you activate our AI monitoring agents. Once your portfolio valuation hits the threshold, you will receive real-time internal notifications and institutional alerts, allowing you to reallocate capital or liquefy assets at peak efficiency.
                    </p>
                 </div>
              </div>

              <div className="mt-12 text-center">
                 <button onClick={() => setShowAcademy(false)} className="px-12 py-4 bg-white text-primary font-black uppercase text-[10px] tracking-widest rounded-2xl hover:scale-105 transition-all">Exit Academy</button>
              </div>
           </div>
        </div>
      )}

      {/* Trade Sandbox Overlay */}
      {showTradeSandbox && (
        <div className="fixed inset-0 bg-primary/40 backdrop-blur-xl z-[200] flex items-center justify-center p-6 animate-in fade-in">
           <div className="bg-white w-full max-w-4xl rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-12 shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto">
              <button onClick={() => setShowTradeSandbox(false)} className="absolute top-6 right-6 text-slate-300 hover:text-primary transition-colors z-50"><X size={20}/></button>
              
              <div className="flex items-center justify-between mb-10">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-secondary"><TrendingUp size={24}/></div>
                    <div>
                       <h3 className="text-2xl font-black italic">Trading Sandbox</h3>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Real-Time Simulation Environment</p>
                    </div>
                 </div>
                 <button onClick={simulateMarketRefresh} className="p-3 bg-slate-100 rounded-xl hover:bg-primary hover:text-white transition-all"><RefreshCw size={18}/></button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 <div className="lg:col-span-2 space-y-6">
                    <div>
                       <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Market Assets</h5>
                       <div className="space-y-3">
                        {STOCKS.map(s => (
                           <div key={s.symbol} className="flex justify-between items-center p-6 bg-slate-50 border border-slate-100 rounded-3xl hover:bg-white hover:shadow-xl hover:border-transparent transition-all group">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-xs border border-slate-100">{s.symbol[0]}</div>
                                 <div>
                                    <p className="font-black text-sm">{s.symbol}</p>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase">{s.name}</p>
                                 </div>
                              </div>
                              <div className="flex items-center gap-6">
                                 <div className="text-right">
                                    <p className="font-black text-sm">GHS {(s.price * 15).toLocaleString()}</p>
                                    <p className={`text-[9px] font-black ${s.trend.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>{s.trend}</p>
                                 </div>
                                 <button onClick={() => handleSandboxBuy(s)} 
                                    className="px-5 py-2.5 bg-primary text-secondary rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all">Buy</button>
                              </div>
                           </div>
                        ))}
                       </div>
                    </div>

                    {sandboxPortfolio.length > 0 && (
                       <div className="animate-in fade-in slide-in-from-bottom-2">
                          <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Your Sandbox Portfolio</h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             {sandboxPortfolio.map(p => (
                                <div key={p.symbol} className="p-5 bg-blue-50 border border-blue-100 rounded-3xl">
                                   <div className="flex justify-between mb-2">
                                      <span className="font-black text-xs">{p.symbol}</span>
                                      <span className="text-[10px] font-bold text-blue-600 bg-white px-2 py-0.5 rounded-full">{p.qty} Units</span>
                                   </div>
                                   <div className="flex justify-between items-end">
                                      <div>
                                         <p className="text-[8px] font-black text-slate-400 uppercase">Avg Price</p>
                                         <p className="text-sm font-black">GHS {p.avgPrice.toLocaleString()}</p>
                                      </div>
                                      <div className={`text-[10px] font-black italic text-emerald-500`}>PROFIT: +5.2%</div>
                                   </div>
                                </div>
                             ))}
                          </div>
                       </div>
                    )}
                 </div>

                 <div className="space-y-4">
                  <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative h-fit">
                      <div className="absolute top-0 right-0 p-6 opacity-10"><ShieldCheck size={100}/></div>
                      <h4 className="text-xs font-black uppercase tracking-widest mb-6 italic text-secondary">Guidelines</h4>
                      <div className="space-y-6">
                         <div className="flex gap-4">
                            <div className="w-6 h-6 bg-white/10 rounded-lg flex items-center justify-center text-xs font-black">1</div>
                            <p className="text-[10px] text-slate-400 leading-relaxed font-medium">Select high-liquidity assets (AAPL, BTC) for stable portfolio rotation.</p>
                         </div>
                         <div className="flex gap-4">
                            <div className="w-6 h-6 bg-white/10 rounded-lg flex items-center justify-center text-xs font-black">2</div>
                            <p className="text-[10px] text-slate-400 leading-relaxed font-medium">Observe trends; buy during high-trend momentum for simulated gains.</p>
                         </div>
                         <div className="flex gap-4">
                            <div className="w-6 h-6 bg-white/10 rounded-lg flex items-center justify-center text-xs font-black">3</div>
                            <p className="text-[10px] text-slate-400 leading-relaxed font-medium">Use 'Trade' to execute simulated orders instantly with zero slippage.</p>
                         </div>
                      </div>
                      <div className="mt-8 pt-8 border-t border-white/5">
                         <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">Sandbox Balance</p>
                         <p className="text-2xl font-black italic">GHS {sandboxBalance.toLocaleString()}</p>
                      </div>
                  </div>
                  
                  <div className="p-8 bg-emerald-50 border-2 border-emerald-100 rounded-[2.5rem]">
                     <h4 className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-2">Educational Goal</h4>
                     <p className="text-xs font-bold text-emerald-800 leading-relaxed italic">
                        "The goal of this sandbox is to teach capital allocation and market sentiment without real financial risk. Practice here before moving capital into ACME High-Yield Assets."
                     </p>
                  </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Invest Modal */}
      {showInvestModal && (
        <div className="fixed inset-0 bg-primary/20 backdrop-blur-md z-[200] flex items-center justify-center p-6">
           <div className="bg-white w-full max-w-md p-10 rounded-[2.5rem] text-center shadow-3xl">
              <h3 className="text-xl font-black mb-2 italic">Acquire High-Yield Assets</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Move Capital from Savings</p>
              
              <div className="grid grid-cols-2 gap-2 mb-4">
                 {['DAILY', 'WEEKLY', 'MONTHLY', 'ANNUALLY'].map(interval => (
                    <button key={interval} onClick={() => setInvestInterval(interval)} 
                       className={`py-3 rounded-xl font-black text-[9px] uppercase tracking-widest border-2 transition-all ${
                          investInterval === interval ? 'bg-primary text-secondary border-primary' : 'bg-slate-50 text-slate-400 border-slate-100'
                       }`}>{interval}</button>
                 ))}
              </div>
              
              <p className="text-[10px] font-bold text-emerald-500 mb-6 flex justify-between px-2 italic">
                 <span>Periodic Yield:</span>
                 <span>{RATES.INVESTMENT[investInterval]}%</span>
              </p>

              <div className="space-y-4 mb-8">
                 <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2 text-left">Investment Amount (GHS)</label>
                    <input type="number" value={investAmount} onChange={e => setInvestAmount(e.target.value)} className="w-full p-4 bg-slate-50 border-2 rounded-2xl text-2xl font-black text-center" placeholder="0.00" />
                 </div>
                 <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2 text-left">Target Amount (Optional)</label>
                    <input type="number" value={investTarget} onChange={e => setInvestTarget(e.target.value)} className="w-full p-4 bg-slate-50 border-2 rounded-2xl text-sm font-black text-center" placeholder="Infinite Growth Target" />
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <button onClick={() => setShowInvestModal(false)} className="py-4 bg-slate-100 font-black rounded-xl uppercase text-xs">Cancel</button>
                 <button onClick={handleInvest} className="py-4 bg-primary text-white font-black rounded-xl uppercase text-xs">Invest Now</button>
              </div>
           </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-red-500/10 backdrop-blur-md z-[200] flex items-center justify-center p-6">
           <div className="bg-white w-full max-w-md p-10 rounded-[2.5rem] text-center shadow-3xl">
              <h3 className="text-xl font-black mb-2 italic">Liquify Assets</h3>
              <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-8">Move Capital to Savings</p>
              <input type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} className="w-full p-6 bg-slate-50 border-2 rounded-2xl text-3xl font-black text-center mb-8" placeholder="0.00" />
              <div className="grid grid-cols-2 gap-4">
                 <button onClick={() => setShowWithdrawModal(false)} className="py-4 bg-slate-100 font-black rounded-xl uppercase text-xs">Cancel</button>
                 <button onClick={handleWithdrawInvestment} className="py-4 bg-red-500 text-white font-black rounded-xl uppercase text-xs">Withdraw</button>
              </div>
           </div>
        </div>
      )}

      {/* Pay Loan Modal */}
      {showPayLoanModal && (
        <div className="fixed inset-0 bg-emerald-500/10 backdrop-blur-md z-[200] flex items-center justify-center p-6">
           <div className="bg-white w-full max-w-md p-10 rounded-[2.5rem] text-center shadow-3xl">
              <h3 className="text-xl font-black mb-2 italic">Clear Institutional Debt</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Repay from Savings Account</p>
              <input type="number" value={payLoanAmount} onChange={e => setPayLoanAmount(e.target.value)} className="w-full p-6 bg-slate-50 border-2 rounded-2xl text-3xl font-black text-center mb-8" placeholder="0.00" />
              <div className="grid grid-cols-2 gap-4">
                 <button onClick={() => setShowPayLoanModal(false)} className="py-4 bg-slate-100 font-black rounded-xl uppercase text-xs">Abort</button>
                 <button onClick={handlePayLoan} className="py-4 bg-emerald-600 text-white font-black rounded-xl uppercase text-xs">Execute Payment</button>
              </div>
           </div>
        </div>
      )}

      {/* Goal Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-primary/10 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
           <div className="bg-white w-full max-w-md p-10 rounded-[2.5rem] shadow-2xl">
              <h3 className="text-xl font-black mb-6 italic text-center">Set Institutional Goal</h3>
              <input type="text" placeholder="Goal Name (e.g. Asset Accumulation)" value={goalName} onChange={e => setGoalName(e.target.value)} className="w-full p-4 bg-slate-50 rounded-xl mb-4 text-sm font-bold" />
              <input type="number" placeholder="Target GHS" value={goalTarget} onChange={e => setGoalTarget(e.target.value)} className="w-full p-4 bg-slate-50 rounded-xl mb-8 text-sm font-bold" />
              <div className="grid grid-cols-2 gap-4">
                 <button onClick={() => setShowGoalModal(false)} className="py-4 bg-slate-100 rounded-xl font-black uppercase text-xs">Cancel</button>
                 <button onClick={handleCreateGoal} className="py-4 bg-emerald-500 text-white rounded-xl font-black uppercase text-xs">Establish</button>
              </div>
           </div>
        </div>
      )}

      {/* Contribute to Goal Modal */}
      {showContributeModal && (
        <div className="fixed inset-0 bg-emerald-500/10 backdrop-blur-md z-[200] flex items-center justify-center p-6">
           <div className="bg-white w-full max-w-md p-10 rounded-[2.5rem] text-center shadow-3xl">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6"><Target size={32}/></div>
              <h3 className="text-xl font-black mb-2 italic">Fund Your Goal</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Transfer from Savings to Goal</p>
              <input type="number" value={contributeAmount} onChange={e => setContributeAmount(e.target.value)} className="w-full p-6 bg-slate-50 border-2 rounded-2xl text-3xl font-black text-center mb-8" placeholder="0.00" />
              <div className="grid grid-cols-2 gap-4">
                 <button onClick={() => setShowContributeModal(false)} className="py-4 bg-slate-100 font-black rounded-xl uppercase text-xs">Cancel</button>
                 <button onClick={handleContributeToGoal} className="py-4 bg-emerald-500 text-white font-black rounded-xl uppercase text-xs">Contribute</button>
              </div>
           </div>
        </div>
      )}

      {/* Loan Modal */}
      {showLoanModal && (
        <div className="fixed inset-0 bg-primary/20 backdrop-blur-md z-[200] flex items-center justify-center p-4 sm:p-6">
           <div className="bg-white w-full max-w-md p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl text-center max-h-[90vh] overflow-y-auto">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6"><Banknote size={28}/></div>
              <h3 className="text-lg sm:text-xl font-black mb-2 italic">Institutional Credit</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">8% APR • Auto-Repayment from Savings</p>
              
              <input type="number" value={loanAmount} onChange={e => setLoanAmount(e.target.value)} className="w-full p-5 bg-slate-50 border-2 rounded-2xl text-2xl font-black text-center mb-4" placeholder="Loan Amount (GHS)" />
              
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 text-left">Duration (Months)</label>
              <div className="grid grid-cols-4 gap-2 mb-4">
                 {['6', '12', '24', '36'].map(m => (
                    <button key={m} onClick={() => setLoanMonths(m)}
                       className={`py-2.5 rounded-xl font-black text-[10px] uppercase border-2 transition-all ${
                          loanMonths === m ? 'bg-blue-500 text-white border-blue-500' : 'bg-slate-50 text-slate-400 border-slate-100'
                       }`}>{m} mo</button>
                 ))}
              </div>

              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 text-left">Repayment Frequency</label>
              <div className="grid grid-cols-4 gap-2 mb-6">
                 {['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'].map(f => (
                    <button key={f} onClick={() => setLoanRepayFreq(f)}
                       className={`py-2.5 rounded-xl font-black text-[9px] uppercase border-2 transition-all ${
                          loanRepayFreq === f ? 'bg-amber-500 text-white border-amber-500' : 'bg-slate-50 text-slate-400 border-slate-100'
                       }`}>{f}</button>
                 ))}
              </div>

              {loanAmount && (
                <div className="bg-slate-50 rounded-2xl p-4 mb-6 text-left">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Estimated Repayment</p>
                   <p className="text-lg font-black text-primary">
                     GHS {(() => {
                       const amt = parseFloat(loanAmount);
                       const months = parseInt(loanMonths) || 12;
                       const total = amt * (1 + 0.08 * months / 12);
                       const ppyMap = { DAILY: 365, WEEKLY: 52, MONTHLY: 12, YEARLY: 1 };
                       const periods = Math.ceil((months / 12) * (ppyMap[loanRepayFreq] || 12));
                       return (total / Math.max(periods, 1)).toFixed(2);
                     })()} <span className="text-[10px] text-slate-400">/ {loanRepayFreq.toLowerCase()}</span>
                   </p>
                   <p className="text-[9px] text-slate-400 mt-1">Closing: {new Date(Date.now() + (parseInt(loanMonths) || 12) * 30.44 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                 <button onClick={() => setShowLoanModal(false)} className="py-4 bg-slate-100 rounded-xl uppercase text-xs">Abort</button>
                 <button onClick={handleApplyLoan} className="py-4 bg-blue-500 text-white rounded-xl uppercase text-xs">Submit Request</button>
              </div>
           </div>
        </div>
      )}

      {/* Create Auto-Allocation Modal */}
      {showAllocModal && (
        <div className="fixed inset-0 bg-indigo-500/10 backdrop-blur-md z-[200] flex items-center justify-center p-4 sm:p-6">
           <div className="bg-white w-full max-w-lg p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] shadow-3xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-8">
                 <h3 className="text-lg sm:text-xl font-black italic flex items-center gap-2"><Repeat className="text-indigo-500" size={20}/> New Auto-Allocation</h3>
                 <button onClick={() => setShowAllocModal(false)}><X size={18} className="text-slate-400"/></button>
              </div>

              {/* Destination Type */}
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Where to Allocate</label>
              <div className="grid grid-cols-3 gap-3 mb-6">
                 {[
                    { key: 'INVESTMENT', label: 'Investment', icon: TrendingUp, color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
                    { key: 'SAVINGS_GOAL', label: 'Goal', icon: Target, color: 'bg-blue-50 text-blue-600 border-blue-200' },
                    { key: 'LOAN_PAYMENT', label: 'Loan', icon: Banknote, color: 'bg-amber-50 text-amber-600 border-amber-200' }
                 ].map(d => (
                    <button key={d.key} onClick={() => setAllocDestType(d.key)}
                       className={`p-4 rounded-2xl border-2 text-center transition-all ${
                          allocDestType === d.key ? d.color + ' scale-105 shadow-lg' : 'bg-slate-50 text-slate-400 border-slate-100'
                       }`}>
                       <d.icon size={20} className="mx-auto mb-2" />
                       <span className="text-[9px] font-black uppercase tracking-widest">{d.label}</span>
                    </button>
                 ))}
              </div>

              {/* Destination ID for Goals/Loans */}
              {allocDestType === 'SAVINGS_GOAL' && hubData?.savingsGoals?.length > 0 && (
                 <div className="mb-6">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Select Goal</label>
                    <select value={allocDestId} onChange={e => setAllocDestId(e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm border-2 border-slate-100">
                       <option value="">Choose a goal...</option>
                       {hubData.savingsGoals.map(g => <option key={g.id} value={g.id}>{g.name} (GHS {g.currentAmount}/{g.targetAmount})</option>)}
                    </select>
                 </div>
              )}
              {allocDestType === 'LOAN_PAYMENT' && hubData?.loans?.filter(l => l.status === 'ACTIVE').length > 0 && (
                 <div className="mb-6">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Select Loan</label>
                    <select value={allocDestId} onChange={e => setAllocDestId(e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm border-2 border-slate-100">
                       <option value="">Choose a loan...</option>
                       {hubData.loans.filter(l => l.status === 'ACTIVE').map(l => <option key={l.id} value={l.id}>L-{l.id % 1000} (GHS {l.remainingBalance})</option>)}
                    </select>
                 </div>
              )}

              {/* Frequency */}
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Frequency</label>
              <div className="grid grid-cols-4 gap-2 mb-6">
                 {['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'].map(f => (
                    <button key={f} onClick={() => setAllocFrequency(f)}
                       className={`py-3 rounded-xl font-black text-[9px] uppercase tracking-widest border-2 transition-all ${
                          allocFrequency === f ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-slate-50 text-slate-400 border-slate-100'
                       }`}>{f}</button>
                 ))}
              </div>

              {/* Amount & Label */}
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Amount (GHS)</label>
              <input type="number" value={allocAmount} onChange={e => setAllocAmount(e.target.value)} className="w-full p-4 bg-slate-50 border-2 rounded-xl text-xl font-black text-center mb-4" placeholder="0.00" />
              
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Label (optional)</label>
              <input type="text" value={allocLabel} onChange={e => setAllocLabel(e.target.value)} className="w-full p-3 bg-slate-50 border-2 rounded-xl text-sm font-bold mb-8" placeholder="e.g. Monthly Investment Fund" />

              <div className="grid grid-cols-2 gap-4">
                 <button onClick={() => setShowAllocModal(false)} className="py-4 bg-slate-100 font-black rounded-xl uppercase text-xs">Cancel</button>
                 <button onClick={handleCreateAllocation} className="py-4 bg-indigo-500 text-white font-black rounded-xl uppercase text-xs">Activate</button>
              </div>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
         {/* Portfolio Performance */}
         <div className="lg:col-span-8 space-y-8 sm:space-y-10">
            <section className="bg-white p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] border-2 border-slate-50 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 p-6 sm:p-10 opacity-[0.03]"><TrendingUp size={160} sm:size={240}/></div>
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-8 sm:mb-10 relative z-10">
                  <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 sm:mb-2">Portfolio Allocation</p>
                     <h3 className="text-2xl sm:text-4xl font-black text-primary italic">Strategic Asset Map</h3>
                  </div>
                  <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                     {hubData?.investments?.length > 0 && (
                       <button onClick={() => setShowWithdrawModal(true)} className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 bg-red-50 text-red-600 font-black rounded-xl sm:rounded-2xl text-[10px] uppercase tracking-widest border border-red-100 hover:bg-red-100 transition-all">Liquify</button>
                     )}
                     <button onClick={() => setShowInvestModal(true)} className="flex-1 sm:flex-none px-6 sm:px-8 py-2.5 sm:py-3 bg-primary text-secondary font-black rounded-xl sm:rounded-2xl text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all">Invest</button>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="h-[200px] sm:h-[280px]">
                    {hubData?.investments?.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                         <PieChart>
                            <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                               {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <RechartsTooltip />
                         </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full w-full bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-10 text-center">
                         <ShieldCheck className="text-slate-200 mb-4" size={48} />
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-loose">No active investments.<br/>Click "Invest" to begin.</p>
                      </div>
                    )}
                  </div>                   <div className="flex flex-col justify-center space-y-4">
                      {(hubData?.investments || [])
                        .filter(inv => inv.amount > 0 && inv.status !== 'LIQUIDATED')
                        .map((inv, i) => {
                         const growth = inv.amount - (inv.initialAmount || inv.amount);
                         const progress = inv.targetAmount ? (inv.amount / inv.targetAmount * 100) : 0;
                         return (
                         <div key={inv.id} className="p-5 bg-slate-50 rounded-3xl border border-slate-100 group">
                           <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                 <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                                 <span className="text-[11px] font-black uppercase text-slate-800 tracking-tight">{inv.assetName}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                 <button onClick={() => setShowGrowthGraph(inv)} className="p-2 bg-white text-primary rounded-xl opacity-0 group-hover:opacity-100 transition-all shadow-sm border border-slate-100"><TrendingUp size={14}/></button>
                                 <button onClick={() => handleCancelInvestment(inv.id, inv.amount)} className="p-2 bg-white text-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition-all shadow-sm border border-slate-100 hover:bg-red-50" title="Cancel & Liquidate">
                                    <Trash2 size={14}/>
                                 </button>
                              </div>
                           </div>
                           <div className="flex justify-between items-end">
                              <div>
                                 <p className="font-black text-primary italic text-lg leading-none">GHS {inv.amount.toLocaleString()}</p>
                                 <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mt-1">+{growth.toFixed(2)} Growth</p>
                              </div>
                              <div className="text-right">
                                 <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{inv.growthInterval}</p>
                                 <p className="text-[10px] font-black text-primary">{inv.interestRate}%</p>
                              </div>
                           </div>
                           {inv.targetAmount && (
                              <div className="mt-3 h-1 bg-slate-200 rounded-full overflow-hidden">
                                 <div className="h-full bg-emerald-500" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                              </div>
                           )}
                        </div>
                        );
                     })}
                     {(!hubData?.investments || hubData.investments.length === 0) && (
                        <div className="flex flex-col justify-center items-center h-full text-slate-300">
                           <PieChartIcon size={48} className="opacity-20 mb-4" />
                           <p className="text-[10px] font-black uppercase tracking-widest">No Asset Detail</p>
                        </div>
                     )}
                  </div>
               </div>
            </section>

            {/* Savings Goals & Active Loans */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-12">
               <div>
                  <div className="flex justify-between items-center mb-6 px-4">
                     <h3 className="text-xl font-black text-primary italic flex items-center gap-2"><Target className="text-secondary"/> Wealth Accumulation</h3>
                     <button onClick={() => setShowGoalModal(true)} className="p-2 bg-secondary/10 text-primary rounded-xl hover:bg-secondary/20 transition-all"><Plus size={20}/></button>
                  </div>
                  <div className="space-y-6">
                     {hubData?.savingsGoals?.map(goal => {
                        const pct = (goal.currentAmount / goal.targetAmount * 100);
                        const isFunded = pct >= 100;
                        return (
                        <div key={goal.id} className={`bg-white p-8 rounded-[2.5rem] border-2 shadow-sm relative overflow-hidden group ${isFunded ? 'border-emerald-200' : 'border-slate-50'}`}>
                           {isFunded && <div className="absolute top-4 right-4 px-3 py-1 bg-emerald-500 text-white text-[8px] font-black uppercase tracking-widest rounded-full">Fully Funded</div>}
                           <div className="flex justify-between items-center mb-4">
                              <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center"><Target size={24}/></div>
                              <div className="flex items-center gap-2">
                                 <span className="text-xs font-black text-emerald-500 italic">{pct.toFixed(0)}%</span>
                                 {isFunded ? (
                                    <button onClick={() => handleWithdrawGoal(goal.id)}
                                      className="px-3 py-1.5 bg-amber-500 text-white rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-amber-600 transition-all">Withdraw</button>
                                 ) : (
                                    <button onClick={() => { setContributeGoalId(goal.id); setShowContributeModal(true); }}
                                      className="px-3 py-1.5 bg-emerald-500 text-white rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all">Fund</button>
                                 )}
                              </div>
                           </div>
                           <h4 className="font-black text-primary mb-1 uppercase text-sm">{goal.name}</h4>
                           <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                              <span>GHS {goal.currentAmount.toLocaleString()}</span>
                              <span>Target: {goal.targetAmount.toLocaleString()}</span>
                           </div>
                           <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div className={`h-full transition-all duration-1000 ${isFunded ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(pct, 100)}%` }}></div>
                           </div>
                        </div>
                        );
                     })}
                     {(!hubData?.savingsGoals || hubData.savingsGoals.length === 0) && (
                        <div className="p-10 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-center">
                           <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No active accumulation targets.</p>
                        </div>
                     )}
                  </div>
               </div>

               <div>
                  <div className="flex justify-between items-center mb-6 px-4">
                     <h3 className="text-xl font-black text-primary italic flex items-center gap-2"><Banknote className="text-amber-500"/> Active Obligations</h3>
                     <button onClick={() => setShowLoanModal(true)} className="p-2 bg-amber-500/10 text-amber-600 rounded-xl hover:bg-amber-500/20 transition-all"><Plus size={20}/></button>
                  </div>
                  <div className="space-y-6">
                     {hubData?.loans?.filter(l => l.status === 'ACTIVE').map(loan => (
                        <div key={loan.id} className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-50 shadow-sm relative overflow-hidden group">
                           <div className="flex justify-between items-start mb-4">
                              <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center font-black">L-{(loan.id % 1000)}</div>
                              <button onClick={() => { setSelectedLoanId(loan.id); setShowPayLoanModal(true); }}
                                 className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all">Pay Now</button>
                           </div>
                           <h4 className="font-black text-primary mb-2 uppercase text-sm">Institutional Credit Line</h4>
                           <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                              <span>Bal: GHS {loan.remainingBalance?.toLocaleString()}</span>
                              <span className="text-amber-500">Rate: {loan.interestRate * 100}%</span>
                           </div>
                           {loan.repaymentFrequency && (
                              <div className="mt-3 pt-3 border-t border-slate-100 space-y-1">
                                 <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                    <span>Auto-Pay: GHS {loan.repaymentAmount?.toLocaleString()} / {loan.repaymentFrequency?.toLowerCase()}</span>
                                 </div>
                                 {loan.nextRepaymentDate && (
                                    <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest">
                                       <span className="text-blue-500">Next: {new Date(loan.nextRepaymentDate).toLocaleDateString()}</span>
                                       {loan.closingDate && <span className="text-red-400">Closes: {new Date(loan.closingDate).toLocaleDateString()}</span>}
                                    </div>
                                 )}
                              </div>
                           )}
                        </div>
                     ))}
                     {(!hubData?.loans || hubData.loans.filter(l => l.status === 'ACTIVE').length === 0) && (
                        <div className="p-10 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-center">
                           <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No outstanding debts.</p>
                        </div>
                     )}
                  </div>
               </div>
            </section>

            {/* Auto-Allocations Section */}
            <section className="bg-white p-10 rounded-[3rem] border-2 border-slate-50 shadow-sm">
               <div className="flex justify-between items-center mb-8">
                  <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Automation Engine</p>
                     <h3 className="text-2xl font-black text-primary italic flex items-center gap-3"><Repeat className="text-indigo-500" size={28}/> Auto-Allocations</h3>
                  </div>
                  <button onClick={() => setShowAllocModal(true)} className="px-6 py-3 bg-indigo-500 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-indigo-200 flex items-center gap-2">
                     <Plus size={16}/> New Rule
                  </button>
               </div>

               {hubData?.allocations?.length > 0 ? (
                  <div className="space-y-4">
                     {hubData.allocations.map(alloc => (
                        <div key={alloc.id} className={`flex items-center justify-between p-6 rounded-2xl border-2 transition-all ${alloc.active ? 'bg-white border-slate-100 hover:border-indigo-200' : 'bg-slate-50 border-slate-100 opacity-50'}`}>
                           <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                 alloc.destinationType === 'INVESTMENT' ? 'bg-emerald-50 text-emerald-500' :
                                 alloc.destinationType === 'SAVINGS_GOAL' ? 'bg-blue-50 text-blue-500' :
                                 'bg-amber-50 text-amber-500'
                              }`}>
                                 {alloc.destinationType === 'INVESTMENT' ? <TrendingUp size={18}/> :
                                  alloc.destinationType === 'SAVINGS_GOAL' ? <Target size={18}/> :
                                  <Banknote size={18}/>}
                              </div>
                              <div>
                                 <p className="font-black text-sm text-slate-800">{alloc.label || alloc.destinationType}</p>
                                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                    GHS {alloc.amount} • {alloc.frequency} • {alloc.active ? 'Active' : 'Paused'}
                                    {alloc.nextExecutionDate && ` • Next: ${new Date(alloc.nextExecutionDate).toLocaleDateString()}`}
                                 </p>
                              </div>
                           </div>
                           <div className="flex items-center gap-2">
                              <button onClick={() => handleToggleAllocation(alloc.id)} className={`p-2 rounded-xl transition-all ${alloc.active ? 'bg-amber-50 text-amber-500 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-500 hover:bg-emerald-100'}`}>
                                 {alloc.active ? <Pause size={14}/> : <Play size={14}/>}
                              </button>
                              <button onClick={() => handleDeleteAllocation(alloc.id)} className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-all">
                                 <Trash2 size={14}/>
                              </button>
                           </div>
                        </div>
                     ))}
                  </div>
               ) : (
                  <div className="p-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-center">
                     <Repeat className="text-slate-200 mx-auto mb-4" size={48}/>
                     <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">No active auto-allocations</p>
                     <p className="text-[10px] text-slate-400">Set up automatic recurring transfers to investments, goals, or loan payments.</p>
                  </div>
               )}
            </section>
         </div>

         {/* Right Column: Intelligence & Actions */}
         <div className="lg:col-span-4 space-y-10">
            {/* Quick Actions */}
            <section className="bg-secondary/10 p-8 rounded-[3rem] border border-secondary/20">
               <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-6 italic text-center">Institutional Credit Hub</h4>
               <div className="grid grid-cols-1 gap-4">
                  <Link to="/bill-pay" className="flex items-center justify-between p-5 bg-white/80 rounded-2xl hover:bg-white transition-all shadow-sm border border-secondary/10 group">
                     <div>
                        <p className="font-black italic text-xs mb-1">Easy-Pay Subscriptions</p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase">Manage Direct Debits</p>
                     </div>
                     <ArrowRight size={16} className="text-primary group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <button onClick={() => setShowLoanModal(true)} className="flex items-center justify-between p-6 bg-primary text-secondary rounded-2xl hover:scale-[1.02] transition-all shadow-xl shadow-primary/20 group">
                     <div>
                        <p className="font-black italic text-xs mb-1 uppercase tracking-widest">Request Unsecured Capital</p>
                        <p className="text-[8px] font-black text-secondary/60 uppercase">8% APR • 12 Month Term</p>
                     </div>
                     <Banknote size={20} className="group-hover:rotate-12 transition-transform"/>
                  </button>
               </div>
            </section>

            {/* Redesigned Growth Engine */}
            <section className="bg-slate-900 p-10 rounded-[3rem] text-white overflow-hidden relative shadow-2xl">
               <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none"><Calculator size={120}/></div>
               <h3 className="text-lg font-black italic mb-6 flex items-center gap-3"><Zap className="text-secondary"/> Growth Engine</h3>
               
               {/* Mode Selection */}
               <div className="grid grid-cols-2 gap-2 mb-6">
                  {['INVESTMENT', 'LOAN'].map(mode => (
                     <button key={mode} onClick={() => { setCalcMode(mode); setCalcResult(null); }}
                        className={`py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                           calcMode === mode ? (mode === 'INVESTMENT' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white') : 'bg-white/5 text-slate-400 border border-white/10'
                        }`}>{mode === 'INVESTMENT' ? '📈 Investment' : '💰 Loan'}</button>
                  ))}
               </div>

               {/* Interval Selection */}
               <div className="grid grid-cols-4 gap-1.5 mb-6">
                  {['DAILY', 'WEEKLY', 'MONTHLY', 'ANNUALLY'].map(interval => (
                     <button key={interval} onClick={() => { setCalcInterval(interval); setCalcResult(null); }}
                        className={`py-2 rounded-xl font-black text-[8px] uppercase tracking-widest transition-all ${
                           calcInterval === interval ? 'bg-secondary text-primary' : 'bg-white/5 text-slate-500 border border-white/10'
                        }`}>{interval.slice(0, 3)}</button>
                  ))}
               </div>

               {/* Rate Display */}
               <div className="bg-white/5 rounded-2xl p-4 mb-6 border border-white/10 text-center">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">System Rate</p>
                  <p className="text-2xl font-black text-secondary">{RATES[calcMode][calcInterval]}% <span className="text-xs text-slate-400">{calcMode === 'INVESTMENT' ? 'APY' : 'APR'}</span></p>
               </div>

               <div className="space-y-4 relative z-10">
                  <div>
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">{calcMode === 'INVESTMENT' ? 'Investment Amount' : 'Loan Amount'} (GHS)</label>
                     <input type="number" value={calcPrincipal} onChange={e => setCalcPrincipal(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 font-bold text-sm text-white" />
                  </div>
                  <div>
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">
                        Duration ({calcInterval === 'DAILY' ? 'Days' : calcInterval === 'WEEKLY' ? 'Weeks' : calcInterval === 'MONTHLY' ? 'Months' : 'Years'})
                     </label>
                     <input type="number" value={calcYears} onChange={e => setCalcYears(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 font-bold text-sm text-white" />
                  </div>
                  <button onClick={handleCalculate} className={`w-full py-4 font-black rounded-xl text-xs uppercase transition-all hover:scale-[1.02] ${
                     calcMode === 'INVESTMENT' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                  }`}>{calcMode === 'INVESTMENT' ? 'Calculate Returns' : 'Calculate Repayment'}</button>
                  
                  {calcResult && (
                    <div className="pt-6 border-t border-white/10 animate-in slide-in-from-top-4 space-y-3">
                       {calcResult.type === 'INVESTMENT' ? (
                          <>
                             <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Future Value</span>
                                <span className="text-xl font-black text-emerald-400">GHS {parseFloat(calcResult.futureValue).toLocaleString()}</span>
                             </div>
                             <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Returns</span>
                                <span className="text-sm font-black text-emerald-300">+GHS {parseFloat(calcResult.interest).toLocaleString()}</span>
                             </div>
                          </>
                       ) : (
                          <>
                             <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{calcInterval.charAt(0) + calcInterval.slice(1).toLowerCase()} Repayment</span>
                                <span className="text-xl font-black text-amber-400">GHS {parseFloat(calcResult.periodicPayment).toLocaleString()}</span>
                             </div>
                             <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Repayment</span>
                                <span className="text-sm font-black text-slate-300">GHS {parseFloat(calcResult.totalRepayment).toLocaleString()}</span>
                             </div>
                             <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Interest</span>
                                <span className="text-sm font-black text-red-400">+GHS {parseFloat(calcResult.totalInterest).toLocaleString()}</span>
                             </div>
                          </>
                       )}
                       <p className="text-[9px] font-bold text-slate-500 text-center mt-2">Rate: {calcResult.rate}% {calcResult.type === 'INVESTMENT' ? 'APY' : 'APR'}</p>
                    </div>
                  )}
               </div>
            </section>

            {/* Learning */}
            <section className="space-y-6">
               <div onClick={() => setShowAcademy(true)} className="bg-gradient-to-br from-emerald-500 to-teal-600 p-8 rounded-[2.5rem] text-white shadow-xl cursor-pointer hover:scale-[1.02] transition-all group">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-4">ACME Academy</h4>
                  <p className="text-xl font-black italic leading-tight">Master Institutional Strategy</p>
               </div>
               <div onClick={() => setShowTradeSandbox(true)} className="bg-white border-2 border-slate-50 p-8 rounded-[2.5rem] shadow-sm cursor-pointer hover:border-blue-100 hover:scale-[1.02] transition-all group">
                  <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-4">Trade Sandbox</h4>
                  <p className="text-xl font-black text-primary italic leading-tight">Teaching Social Equity</p>
               </div>
            </section>
         </div>
      </div>

      {/* Audit Ledger */}
      <section className="mt-16">
         <h4 className="text-xl font-black text-primary italic mb-8 flex items-center gap-2"><ShieldCheck size={24}/> Operational Audit Trail</h4>
         <div className="bg-white rounded-[2.5rem] border-2 border-slate-50 overflow-hidden">
            <table className="w-full text-left text-xs">
               <thead className="bg-slate-50">
                  <tr>
                     <th className="p-6 font-black uppercase text-slate-400 tracking-widest">Time</th>
                     <th className="p-6 font-black uppercase text-slate-400 tracking-widest">Event</th>
                     <th className="p-6 font-black uppercase text-slate-400 tracking-widest">Context</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {hubData?.auditLogs?.slice(0, 5).map(log => (
                     <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-6 text-slate-500 font-bold">{new Date(log.timestamp).toLocaleTimeString()}</td>
                        <td className="p-6"><span className="px-3 py-1 bg-primary/5 text-primary rounded-full font-black uppercase text-[10px] tracking-widest">{log.action}</span></td>
                        <td className="p-6 font-medium text-slate-600">{log.details}</td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </section>

      {/* Growth Graph Modal */}
      {showGrowthGraph && (
         <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xl z-[250] flex items-center justify-center p-6 animate-in zoom-in-95">
            <div className="bg-white w-full max-w-4xl rounded-[3rem] p-12 shadow-3xl relative">
               <button onClick={() => setShowGrowthGraph(null)} className="absolute top-10 right-10 text-slate-300 hover:text-primary transition-all"><X size={28}/></button>
               <div className="mb-10">
                  <h3 className="text-2xl font-black italic mb-2 tracking-tight">{showGrowthGraph.assetName}</h3>
                  <div className="flex gap-4">
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Yield: {showGrowthGraph.interestRate}% {showGrowthGraph.growthInterval}</span>
                     <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Current: GHS {showGrowthGraph.amount?.toLocaleString()}</span>
                  </div>
               </div>
               
               <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={(() => {
                        const history = [];
                        const start = showGrowthGraph.initialAmount || (showGrowthGraph.amount * 0.9);
                        const end = showGrowthGraph.amount;
                        const steps = 10;
                        for (let i = 0; i <= steps; i++) {
                           history.push({
                              period: i === steps ? 'Today' : `T-${steps-i}`,
                              value: (start + (end - start) * (i/steps)).toFixed(2)
                           });
                        }
                        if (showGrowthGraph.targetAmount) {
                            const target = showGrowthGraph.targetAmount;
                            if (target > end) {
                                for (let i = 1; i <= 5; i++) {
                                    history.push({
                                        period: `P+${i}`,
                                        value: (end + (target - end) * (i/10)).toFixed(2),
                                        isFuture: true
                                    });
                                }
                            }
                        }
                        return history;
                     })()}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }} hide />
                        <RechartsTooltip 
                           contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)' }}
                           itemStyle={{ fontWeight: 900, fontSize: '12px' }}
                        />
                        <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                           {(() => {
                              const history = [];
                              const start = showGrowthGraph.initialAmount || (showGrowthGraph.amount * 0.9);
                              const end = showGrowthGraph.amount;
                              const steps = 10;
                              for (let i = 0; i <= steps; i++) history.push(i);
                              if (showGrowthGraph.targetAmount && showGrowthGraph.targetAmount > end) {
                                  for (let i = 1; i <= 5; i++) history.push(i + 100);
                              }
                              return history.map((e, idx) => (
                                 <Cell key={`cell-${idx}`} fill={idx > 10 ? '#3b82f6' : '#10b981'} fillOpacity={idx > 10 ? 0.3 : 1} />
                              ));
                           })()}
                        </Bar>
                     </BarChart>
                  </ResponsiveContainer>
               </div>
               <div className="mt-8 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <div className="flex gap-4">
                     <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Historical Growth</span>
                     <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500/30"></div> Target Projection</span>
                  </div>
                  {showGrowthGraph.targetAmount && <span>Target: GHS {showGrowthGraph.targetAmount.toLocaleString()}</span>}
               </div>
            </div>
         </div>
      )}
    </Layout>

    {showConfirm && (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[500] flex items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-white max-w-md w-full rounded-[3rem] p-10 shadow-3xl text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
             <Trash2 size={32}/>
          </div>
          <h3 className="text-xl font-black italic text-primary mb-4">{showConfirm.title}</h3>
          <p className="text-sm text-slate-500 font-bold leading-relaxed mb-8">{showConfirm.message}</p>
          <div className="flex gap-4">
             <button onClick={() => setShowConfirm(null)} className="flex-1 py-4 bg-slate-100 text-slate-500 font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all">Abort Action</button>
             <button onClick={showConfirm.onConfirm} className="flex-1 py-4 bg-red-500 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-red-600 transition-all shadow-xl shadow-red-200">Yes, Confirm</button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default FinancialHub;
