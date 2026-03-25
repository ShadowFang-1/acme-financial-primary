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

  // System rates
  const RATES = {
    INVESTMENT: { MONTHLY: 5.0, ANNUALLY: 12.0 },
    LOAN: { MONTHLY: 8.0, ANNUALLY: 8.0 }
  };

  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [contributeGoalId, setContributeGoalId] = useState(null);
  const [contributeAmount, setContributeAmount] = useState('');

  const [showLoanModal, setShowLoanModal] = useState(false);
  const [loanAmount, setLoanAmount] = useState('');

  const [showInvestModal, setShowInvestModal] = useState(false);
  const [investAmount, setInvestAmount] = useState('');
  const [investInterval, setInvestInterval] = useState('MONTHLY');

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  
  const [showPayLoanModal, setShowPayLoanModal] = useState(false);
  const [payLoanAmount, setPayLoanAmount] = useState('');
  const [selectedLoanId, setSelectedLoanId] = useState(null);

  const [showAcademy, setShowAcademy] = useState(false);
  const [showTradeSandbox, setShowTradeSandbox] = useState(false);

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
      await axios.post('/api/v1/hub/loans/apply', null, { params: { amount: loanAmount, months: 12 } });
      fetchData(); setShowLoanModal(false); setLoanAmount('');
      showToast("Credit authorized and deposited to Savings!");
    } catch (err) { showToast(err.response?.data?.message || "Loan declined.", 'error'); }
    finally { setLoading(false); }
  };

  const handleInvest = async () => {
    if (!investAmount) return;
    setLoading(true);
    try {
      await axios.post('/api/v1/hub/invest', null, { params: { amount: investAmount, interval: investInterval } });
      fetchData(); setShowInvestModal(false); setInvestAmount('');
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

  // Growth Engine Calculator
  const handleCalculate = () => {
    const P = parseFloat(calcPrincipal);
    const r = RATES[calcMode][calcInterval] / 100;
    const t = parseFloat(calcYears);
    if (!P || !t) return;

    if (calcMode === 'INVESTMENT') {
      const n = calcInterval === 'MONTHLY' ? 12 : 1;
      const futureValue = P * Math.pow(1 + (r / n), n * t);
      const interest = futureValue - P;
      setCalcResult({ futureValue: futureValue.toFixed(2), interest: interest.toFixed(2), rate: r * 100, type: 'INVESTMENT' });
    } else {
      // Loan: total repayment with interest
      const monthlyRate = r / 12;
      const totalMonths = t * 12;
      const monthlyPayment = P * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
      const totalRepayment = monthlyPayment * totalMonths;
      const totalInterest = totalRepayment - P;
      setCalcResult({ totalRepayment: totalRepayment.toFixed(2), monthlyPayment: monthlyPayment.toFixed(2), totalInterest: totalInterest.toFixed(2), rate: r * 100, type: 'LOAN' });
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
    try {
      await axios.delete(`/api/v1/hub/allocations/${id}`);
      fetchData();
      showToast("Allocation removed.");
    } catch (err) { showToast("Delete failed.", 'error'); }
  };

  const pieData = hubData?.investments?.map((inv, idx) => ({
    name: inv.assetName || "Fund " + (idx+1),
    value: parseFloat(inv.amount || 0)
  })) || [{ name: 'Cash Reserve', value: 1000 }];

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

  const STOCKS = [
    { symbol: 'AAPL', name: 'Apple Inc', price: 189.45, trend: '+1.2%' },
    { symbol: 'BTC', name: 'Bitcoin (Spot)', price: 64230.10, trend: '-0.5%' },
    { symbol: 'TSLA', name: 'Tesla Corp', price: 172.10, trend: '+4.5%' }
  ];

  if (loading) return <Layout title="Loading Hub..."><div className="p-20 text-center animate-pulse italic font-black text-slate-300">Synchronizing Institutional Records...</div></Layout>;

  return (
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
           <button onClick={() => setShowAcademy(false)} className="absolute top-10 right-10 hover:rotate-90 transition-all"><X size={32}/></button>
           <div className="max-w-4xl text-left bg-slate-900/40 p-12 rounded-[3.5rem] border border-white/5 shadow-3xl">
              <h2 className="text-4xl font-black italic mb-4 text-center">ACME Academy: Asset Mastery</h2>
              <p className="text-center text-slate-400 text-xs uppercase tracking-[0.5em] mb-12 italic font-bold">Institutional Intelligence Engine</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="p-8 bg-white/5 rounded-3xl border border-white/10">
                    <Zap className="text-secondary mb-4" size={32} />
                    <h4 className="font-black italic mb-4 uppercase tracking-widest text-sm">1. Mastering APY</h4>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">
                       ACME provides tiered APY: <strong>5% Monthly</strong> compounding or <strong>12% Annual</strong> compounding on your investment portfolio. Use the Growth Engine to simulate returns before committing capital.
                    </p>
                 </div>
                 <div className="p-8 bg-white/5 rounded-3xl border border-white/10">
                    <ShieldCheck className="text-emerald-400 mb-4" size={32} />
                    <h4 className="font-black italic mb-4 uppercase tracking-widest text-sm">2. Auto-Allocations</h4>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">
                       Set up automatic recurring transfers from Savings to Investments, Goals, or Loan Payments. Choose daily, weekly, monthly, or yearly frequency and let ACME manage your wealth automatically.
                    </p>
                 </div>
              </div>
              <div className="mt-12 text-center">
                 <button onClick={() => setShowAcademy(false)} className="px-12 py-4 bg-white text-primary font-black uppercase text-[10px] tracking-widest rounded-2xl hover:scale-105 transition-all">Understood, Return to Hub</button>
              </div>
           </div>
        </div>
      )}

      {/* Trade Sandbox Overlay */}
      {showTradeSandbox && (
        <div className="fixed inset-0 bg-primary/40 backdrop-blur-xl z-[200] flex items-center justify-center p-6 animate-in fade-in">
           <div className="bg-white w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl relative">
              <button onClick={() => setShowTradeSandbox(false)} className="absolute top-8 right-8"><X size={24}/></button>
              <h3 className="text-2xl font-black italic mb-8 flex items-center gap-2"><TrendingUp className="text-secondary" /> Trading Sandbox</h3>
              <div className="space-y-4">
                 {STOCKS.map(s => (
                    <div key={s.symbol} className="flex justify-between items-center p-6 bg-slate-50 rounded-2xl hover:scale-[1.02] transition-all">
                       <div><p className="font-black">{s.symbol}</p><p className="text-[10px] text-slate-400 font-bold uppercase">{s.name}</p></div>
                       <div className="text-right"><p className="font-black">${s.price}</p><p className="text-[10px] font-black text-green-500">{s.trend}</p></div>
                    </div>
                 ))}
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
              <div className="flex gap-2 mb-4">
                 {['MONTHLY', 'ANNUALLY'].map(interval => (
                    <button key={interval} onClick={() => setInvestInterval(interval)} 
                       className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest border-2 transition-all ${
                          investInterval === interval ? 'bg-primary text-secondary border-primary' : 'bg-slate-50 text-slate-400 border-slate-100'
                       }`}>{interval}</button>
                 ))}
              </div>
              <p className="text-[10px] font-bold text-emerald-500 mb-6">APY: {investInterval === 'MONTHLY' ? '5%' : '12%'} compounding</p>
              <input type="number" value={investAmount} onChange={e => setInvestAmount(e.target.value)} className="w-full p-6 bg-slate-50 border-2 rounded-2xl text-3xl font-black text-center mb-8" placeholder="0.00" />
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
        <div className="fixed inset-0 bg-primary/20 backdrop-blur-md z-[200] flex items-center justify-center p-6">
           <div className="bg-white w-full max-w-md p-10 rounded-[2.5rem] shadow-2xl text-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6"><Banknote size={32}/></div>
              <h3 className="text-xl font-black mb-2 italic">Institutional Credit</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Request Unsecured Capital • 8% APR</p>
              <input type="number" value={loanAmount} onChange={e => setLoanAmount(e.target.value)} className="w-full p-6 bg-slate-50 border-2 rounded-2xl text-2xl font-black text-center mb-8" placeholder="Enter Amount" />
              <div className="grid grid-cols-2 gap-4">
                 <button onClick={() => setShowLoanModal(false)} className="py-4 bg-slate-100 rounded-xl font-black uppercase text-xs">Abort</button>
                 <button onClick={handleApplyLoan} className="py-4 bg-blue-500 text-white rounded-xl font-black uppercase text-xs">Submit Request</button>
              </div>
           </div>
        </div>
      )}

      {/* Create Auto-Allocation Modal */}
      {showAllocModal && (
        <div className="fixed inset-0 bg-indigo-500/10 backdrop-blur-md z-[200] flex items-center justify-center p-6">
           <div className="bg-white w-full max-w-lg p-10 rounded-[2.5rem] shadow-3xl">
              <div className="flex justify-between items-center mb-8">
                 <h3 className="text-xl font-black italic flex items-center gap-2"><Repeat className="text-indigo-500" size={24}/> New Auto-Allocation</h3>
                 <button onClick={() => setShowAllocModal(false)}><X size={20} className="text-slate-400"/></button>
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
         <div className="lg:col-span-8 space-y-10">
            <section className="bg-white p-10 rounded-[3rem] border-2 border-slate-50 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 p-10 opacity-[0.03]"><TrendingUp size={240}/></div>
               <div className="flex justify-between items-end mb-10 relative z-10">
                  <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Portfolio Allocation</p>
                     <h3 className="text-4xl font-black text-primary italic">Strategic Asset Map</h3>
                  </div>
                  <div className="flex gap-3">
                     {hubData?.investments?.length > 0 && (
                       <button onClick={() => setShowWithdrawModal(true)} className="px-6 py-3 bg-red-50 text-red-600 font-black rounded-2xl text-[10px] uppercase tracking-widest border border-red-100 hover:bg-red-100 transition-all">Liquify</button>
                     )}
                     <button onClick={() => setShowInvestModal(true)} className="px-8 py-3 bg-primary text-secondary font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all">Invest</button>
                  </div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="h-[280px]">
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
                  </div>
                  <div className="flex flex-col justify-center space-y-6">
                     {pieData.map((d, i) => (
                        <div key={d.name} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                           <div className="flex items-center gap-3">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                              <span className="text-xs font-black uppercase text-slate-800">{d.name}</span>
                           </div>
                           <span className="font-bold text-primary italic text-sm">GHS {d.value.toLocaleString()}</span>
                        </div>
                     ))}
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
                     {hubData?.savingsGoals?.map(goal => (
                        <div key={goal.id} className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-50 shadow-sm relative overflow-hidden group">
                           <div className="flex justify-between items-center mb-4">
                              <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center"><Target size={24}/></div>
                              <div className="flex items-center gap-3">
                                 <span className="text-xs font-black text-emerald-500 italic">{(goal.currentAmount / goal.targetAmount * 100).toFixed(0)}%</span>
                                 <button onClick={() => { setContributeGoalId(goal.id); setShowContributeModal(true); }}
                                   className="px-3 py-1.5 bg-emerald-500 text-white rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all">Fund</button>
                              </div>
                           </div>
                           <h4 className="font-black text-primary mb-1 uppercase text-sm">{goal.name}</h4>
                           <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                              <span>GHS {goal.currentAmount.toLocaleString()}</span>
                              <span>Target: {goal.targetAmount.toLocaleString()}</span>
                           </div>
                           <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${(goal.currentAmount / goal.targetAmount * 100)}%` }}></div>
                           </div>
                        </div>
                     ))}
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
                           <div className="flex justify-between items-start mb-6">
                              <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center font-black">L-{(loan.id % 1000)}</div>
                              <button onClick={() => { setSelectedLoanId(loan.id); setShowPayLoanModal(true); }}
                                 className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all">Clear Principal</button>
                           </div>
                           <h4 className="font-black text-primary mb-1 uppercase text-sm">Institutional Credit Line</h4>
                           <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              <span>Bal: GHS {loan.remainingBalance.toLocaleString()}</span>
                              <span className="text-amber-500">Rate: {loan.interestRate * 100}%</span>
                           </div>
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
               <div className="absolute top-0 right-0 p-8 opacity-10"><Calculator size={120}/></div>
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
               <div className="grid grid-cols-2 gap-2 mb-6">
                  {['MONTHLY', 'ANNUALLY'].map(interval => (
                     <button key={interval} onClick={() => { setCalcInterval(interval); setCalcResult(null); }}
                        className={`py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${
                           calcInterval === interval ? 'bg-secondary text-primary' : 'bg-white/5 text-slate-500 border border-white/10'
                        }`}>{interval}</button>
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
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Duration (Years)</label>
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
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Monthly Payment</span>
                                <span className="text-xl font-black text-amber-400">GHS {parseFloat(calcResult.monthlyPayment).toLocaleString()}</span>
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
    </Layout>
  );
};

export default FinancialHub;
