import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  CreditCard, 
  Plus, 
  ShieldCheck,
  Send,
  History,
  TrendingUp,
  TrendingDown,
  Settings,
  X,
  Lock,
  Unlock,
  Wallet,
  Search,
  AlertCircle,
  CheckCircle2,
  Clock,
  Download,
  Inbox,
  Printer,
  ChevronRight,
  Briefcase,
  Copy,
  Eye,
  EyeOff,
  Heart,
  ShoppingCart,
  Zap,
  Smartphone,
  Banknote,
  Globe
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import Skeleton from '../components/Skeleton';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [activeAccountIndex, setActiveAccountIndex] = useState(0);
  
  // Modal States
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [step, setStep] = useState('input'); // input, confirm, success
  const [amount, setAmount] = useState('');
  const [selectedPurpose, setSelectedPurpose] = useState('');
  const [customPurpose, setCustomPurpose] = useState('');
  const [paymentChannel, setPaymentChannel] = useState('MOBILE_MONEY');
  const [txDetails, setTxDetails] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showBalance, setShowBalance] = useState(true);

  const depositChannels = [
    { id: 'MOBILE_MONEY', name: 'Mobile Money', icon: Smartphone, color: 'text-amber-500 bg-amber-50' },
    { id: 'BANK_CARD', name: 'Debit/Credit Card', icon: CreditCard, color: 'text-blue-500 bg-blue-50' },
    { id: 'WIRE', name: 'Bank Wire', icon: Globe, color: 'text-primary text-white bg-primary' }
  ];

  const withdrawalPurposes = [
    { id: 'PERSONAL', name: 'Personal Use', icon: Heart },
    { id: 'BUSINESS', name: 'Business Expense', icon: Briefcase },
    { id: 'SHOPPING', name: 'Shopping & Retail', icon: ShoppingCart },
    { id: 'BILLS', name: 'Emergency/Bills', icon: Zap }
  ];

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async () => {
    try {
      const accRes = await axios.get('/api/v1/banking/accounts');
      setAccounts(accRes.data);
      
      if (accRes.data.length > 0) {
        const activeAcc = accRes.data[activeAccountIndex] || accRes.data[0];
        const trans = await axios.get(`/api/v1/banking/accounts/${activeAcc.accountNumber}/transactions?size=5`);
        const txList = trans.data.content || trans.data;
        setRecentTransactions(Array.isArray(txList) ? txList : []);
      }
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeAccountIndex]);

  const [showNewAccountModal, setShowNewAccountModal] = useState(false);

  const handleCreateAccount = async (type = 'SAVINGS') => {
    try {
      await axios.post(`/api/v1/banking/accounts?type=${type}`);
      showToast(`New ${type} Account opened successfully!`);
      setShowNewAccountModal(false);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to open account', 'error');
    }
  };

  const handleDeposit = async () => {
    if (!amount || accounts.length === 0) return;
    setSubmitting(true);
    try {
      const activeAcc = accounts[activeAccountIndex];
      const desc = depositChannels.find(c => c.id === paymentChannel)?.name;
      await axios.post(`/api/v1/banking/deposit?accountNumber=${activeAcc.accountNumber}&amount=${amount}&description=${desc}`);
      
      setTxDetails({
        type: 'DEPOSIT',
        amount: amount,
        account: activeAcc.accountNumber,
        channel: paymentChannel,
        reference: 'DEP-' + Math.random().toString(36).substring(7).toUpperCase(),
        date: new Date().toLocaleString()
      });
      setStep('success');
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Deposit failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    if (!amount || accounts.length === 0) return;
    setSubmitting(true);
    try {
      const activeAcc = accounts[activeAccountIndex];
      const desc = selectedPurpose === 'OTHER' ? customPurpose : selectedPurpose;
      await axios.post(`/api/v1/banking/withdraw?accountNumber=${activeAcc.accountNumber}&amount=${amount}&description=${desc}`);
      
      setTxDetails({
        type: 'WITHDRAWAL',
        amount: amount,
        account: activeAcc.accountNumber,
        purpose: selectedPurpose === 'OTHER' ? customPurpose : selectedPurpose,
        reference: 'WTH-' + Math.random().toString(36).substring(7).toUpperCase(),
        date: new Date().toLocaleString()
      });
      setStep('success');
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Withdrawal failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById('receipt-area').innerHTML;
    const printWindow = window.open('', '_blank', 'height=600,width=800');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>ACME Ledger Receipt</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; color: #333; margin: 0; padding: 20px; }
            .receipt-container { max-width: 500px; margin: auto; padding: 30px; border: 2px solid #EEE; position: relative; }
            .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 60px; color: rgba(0,0,0,0.03); font-weight: 900; pointer-events: none; z-index: 0; }
            h1, h2 { font-family: 'Outfit', sans-serif; margin: 0; }
            @media print { .no-print { display: none; } }
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@900&display=swap');
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <div class="watermark">ACME SECURE</div>
            ${printContent}
          </div>
          <div class="no-print" style="text-align: center; margin-top: 30px;">
            <button onclick="window.print()" style="padding: 15px 30px; background: #0F172A; color: white; border: none; border-radius: 10px; font-weight: bold; cursor: pointer;">Finalize Print / Save as PDF</button>
          </div>
          <script>
            window.onload = () => {
              if (window.innerWidth < 1024) {
                 // On mobile, give the user a button to trigger the OS dialog, or try to auto-trigger
                 setTimeout(() => window.print(), 500);
              } else {
                 window.print();
              }
            }
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  const resetModals = () => {
    setIsDepositModalOpen(false);
    setIsWithdrawModalOpen(false);
    setStep('input');
    setAmount('');
    setSelectedPurpose('');
    setCustomPurpose('');
    setTxDetails(null);
  };

  const currentAcc = (accounts && accounts.length > 0) ? (accounts[activeAccountIndex] || accounts[0]) : { type: 'SAVINGS', accountNumber: '...', balance: 0, frozen: false };
  const filteredTransactions = (recentTransactions || []).filter(tx => 
    tx.description?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    tx.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.amount?.toString().includes(searchTerm)
  );

  const getChartData = () => {
    const categories = {
      Deposits: 0,
      Withdrawals: 0,
      Transfers: 0,
      Investments: 0
    };

    (recentTransactions || []).forEach(tx => {
       const desc = tx.description?.toLowerCase() || '';
       const isInvestment = desc.includes('invest') || tx.type === 'INVESTMENT';
       
       if (isInvestment) {
          categories.Investments += tx.amount;
       } else if (tx.type === 'DEPOSIT') {
          categories.Deposits += tx.amount;
       } else if (tx.type === 'WITHDRAWAL') {
          categories.Withdrawals += tx.amount;
       } else if (tx.type === 'TRANSFER') {
          categories.Transfers += tx.amount;
       }
    });

    const data = Object.keys(categories).map(key => ({
      name: key,
      value: categories[key]
    })).filter(item => item.value > 0);

    return data.length > 0 ? data : [
      { name: 'Deposits', value: 1 },
      { name: 'Withdrawals', value: 0 },
      { name: 'Transfers', value: 0 },
      { name: 'Investments', value: 0 }
    ];
  };

  const chartData = getChartData();
  const CHART_COLORS = ['#fbbf24', '#ef4444', '#3b82f6', '#10b981'];


  // Verification & Auth Guard
  if (!user) return null;

  return (
    <Layout 
      title={`Welcome, ${user?.username || 'User'}!`} 
      subtitle="Monitor your assets and recent activities"
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      hideBell
    >
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 animate-pulse">
           <div className="col-span-1 lg:col-span-8 space-y-10">
              <Skeleton className="h-10 w-48 mb-6" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                 <Skeleton className="h-64 rounded-[2.5rem]" />
                 <Skeleton className="h-64 rounded-[2.5rem]" />
              </div>
           </div>
           <div className="col-span-1 lg:col-span-4">
              <Skeleton className="h-[400px] rounded-[2.5rem]" />
           </div>
        </div>
      ) : (
        <>
          {toast && (
            <div className={`fixed top-8 right-8 z-[100] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${
              toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
            }`}>
              <ShieldCheck size={20} />
              <span className="font-bold">{toast.message}</span>
            </div>
          )}

      {/* 🧾 Hidden Receipt Display for Printing */}
      <div id="receipt-area" className="hidden">
        <div style={{ padding: '40px', background: 'white', color: 'black', fontFamily: 'serif', maxWidth: '600px', margin: 'auto', border: '2px solid #EEE' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px', borderBottom: '2px solid #0F172A', paddingBottom: '20px' }}>
            <h1 style={{ margin: '0', fontSize: '28px', color: '#0F172A' }}>ACME FINANCIAL</h1>
            <p style={{ margin: '5px', fontSize: '12px', letterSpacing: '2px' }}>OFFICIAL LEDGER RECEIPT</p>
          </div>
          
          <div style={{ marginBottom: '30px' }}>
             <p><strong>REFERENCE:</strong> {txDetails?.reference}</p>
             <p><strong>DATE:</strong> {txDetails?.date}</p>
             <p><strong>SENDER/SOURCE:</strong> {user?.username}</p>
             <p><strong>ACCOUNT:</strong> {txDetails?.account}</p>
             <p><strong>ACTION:</strong> {txDetails?.type}</p>
             {txDetails?.purpose && <p><strong>PURPOSE:</strong> {txDetails.purpose}</p>}
             {txDetails?.channel && <p><strong>CHANNEL:</strong> {txDetails.channel}</p>}
          </div>

          <div style={{ textAlign: 'center', background: '#F8FAFC', padding: '30px', borderRadius: '15px', border: '1px solid #E2E8F0' }}>
            <p style={{ margin: '0', fontSize: '12px', color: '#64748B', textTransform: 'uppercase', fontWeight: 'bold' }}>Transaction Value</p>
            <h2 style={{ margin: '10px 0', fontSize: '40px', color: '#0F172A' }}>GHS {txDetails?.amount}</h2>
            <p style={{ margin: '0', fontSize: '12px', color: '#22C55E', fontWeight: 'bold' }}>✓ DEPOSITED & SETTLED</p>
          </div>
          
          <div style={{ marginTop: '40px', textAlign: 'center', opacity: '0.4', fontSize: '10px' }}>
            <p>This is a system generated document. End-to-End Encrypted Verification.</p>
            <p>© 2026 ACME FINANCIAL GROUP</p>
          </div>
        </div>
      </div>

      {/* 💰 Modern Top-Up (Deposit) Modal */}
      {isDepositModalOpen && (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 max-w-xl w-full shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden relative max-h-[90vh] overflow-y-auto">
        <button onClick={resetModals} className="absolute top-6 sm:top-8 right-6 sm:right-10 p-2 hover:bg-slate-100 rounded-full transition-colors z-10">
          <X size={20} className="text-slate-400" />
        </button>

            {step === 'input' && (
              <div className="animate-in slide-in-from-right-4 duration-300">
                <div className="mb-10 text-center">
                  <div className="w-16 h-16 bg-secondary text-primary rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-secondary/20">
                    <TrendingUp size={32} />
                  </div>
                  <h3 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic">Inject Capital</h3>
                  <p className="text-slate-500 font-medium">Top up your {currentAcc?.type || 'active'} account instantly</p>

                </div>
                
            <div className="space-y-6 sm:space-y-8">
              <div className="p-4 sm:p-5 bg-slate-50 rounded-[1.5rem] sm:rounded-3xl border-2 border-slate-100/50">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Pay With</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {depositChannels.map(ch => (
                        <button 
                          key={ch.id}
                          onClick={() => setPaymentChannel(ch.id)}
                          className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all ${
                            paymentChannel === ch.id ? 'border-primary bg-primary text-white shadow-lg' : 'border-white bg-white hover:border-slate-200 text-slate-500'
                          }`}
                        >
                          <ch.icon size={20} className="mb-2" />
                          <span className="text-[9px] font-black uppercase tracking-tighter">{ch.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="relative">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Enter Amount (GHS)</label>
                    <input 
                      type="number" 
                      autoFocus
                      required
                      placeholder="0.00"
                      className="w-full text-2xl sm:text-3xl lg:text-4xl font-black bg-white border-b-4 border-slate-100 focus:border-secondary outline-none py-4 transition-all tracking-tighter text-primary"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                  
              <button 
                onClick={() => setStep('confirm')} 
                disabled={!amount}
                className="w-full btn-primary py-4 sm:py-5 text-base sm:text-lg font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-transform"
              >
                Review Deposit <ChevronRight size={18} />
              </button>
            </div>
              </div>
            )}

            {step === 'confirm' && (
               <div className="animate-in slide-in-from-right-4 duration-300">
                  <div className="mb-8 items-center flex gap-4">
                     <button onClick={() => setStep('input')} className="p-2 hover:bg-slate-100 rounded-full"><History size={20} className="text-slate-400" /></button>
                     <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Review Deposit</h3>
                  </div>

                  <div className="space-y-4 mb-10">
                    <div className="p-6 bg-slate-50 rounded-[2rem] border-2 border-slate-100 flex justify-between items-center">
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Injection Value</p>
                          <p className="text-2xl font-black text-primary">GHS {parseFloat(amount).toLocaleString()}</p>
                       </div>
                       <div className="w-12 h-12 bg-secondary/20 text-primary rounded-2xl flex items-center justify-center shadow-inner">
                          <TrendingUp size={24} />
                       </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-5 bg-white border-2 border-slate-100 rounded-[1.5rem]">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Account</p>
                          <p className="font-black text-slate-800 truncate">{currentAcc.accountNumber}</p>
                       </div>
                       <div className="p-5 bg-white border-2 border-slate-100 rounded-[1.5rem]">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Payment Method</p>
                          <p className="font-black text-slate-800">{depositChannels.find(c => c.id === paymentChannel)?.name}</p>
                       </div>
                    </div>
                  </div>

                  <button 
                    onClick={handleDeposit} 
                    disabled={submitting}
                    className="w-full btn-primary py-5 text-lg font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl shadow-primary/20 bg-secondary text-primary hover:bg-secondary/80"
                  >
                    {submitting ? <History className="animate-spin" /> : <>Complete Deposit ✓</>}
                  </button>
               </div>
            )}

            {step === 'success' && (
              <div className="animate-in zoom-in duration-500 text-center">
                <div className="w-24 h-24 bg-green-500 text-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-green-200">
                  <CheckCircle2 size={56} />
                </div>
                <h3 className="text-4xl font-black text-slate-800 tracking-tighter uppercase italic mb-2">Deposit Successful!</h3>
                <p className="text-slate-500 font-bold mb-10 tracking-tight">Your deposit of GHS {parseFloat(amount).toLocaleString()} was successful.</p>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                   <button onClick={handlePrint} className="flex items-center justify-center gap-2 p-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-widest hover:scale-[1.05] transition-all">
                      <Printer size={18} /> Print Receipt
                   </button>
                   <button onClick={resetModals} className="flex items-center justify-center gap-2 p-5 bg-slate-100 text-slate-800 rounded-[1.5rem] font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-all">
                      Dashboard
                   </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 💸 Modern Withdrawal Modal */}
    {isWithdrawModalOpen && (
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 max-w-xl w-full shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden relative max-h-[90vh] overflow-y-auto">
          <button onClick={resetModals} className="absolute top-6 sm:top-8 right-6 sm:right-10 p-2 hover:bg-slate-100 rounded-full transition-colors z-10">
            <X size={20} className="text-slate-400" />
          </button>

            {step === 'input' && (
              <div className="animate-in slide-in-from-right-4 duration-300">
                <div className="mb-10 text-center">
                  <div className="w-16 h-16 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-red-50">
                    <Wallet size={32} />
                  </div>
                  <h3 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic">Withdraw Money</h3>
                  <p className="text-slate-500 font-medium">Transfer funds to your mobile money or bank account</p>
                </div>
                
                <div className="space-y-8">
                  <div className="p-6 bg-red-50/50 rounded-3xl border-2 border-red-100/50 flex justify-between items-center group">
                    <div>
                      <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Available Balance</p>
                      <p className="font-black text-xl text-red-600 tracking-tight">GHS {currentAcc.balance.toLocaleString()}</p>
                    </div>
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-red-400 shadow-sm border border-red-50">
                       <Lock size={20} />
                    </div>
                  </div>

                  <div className="relative">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Withdrawal Value (GHS)</label>
                    <input 
                      type="number" 
                      autoFocus
                      required
                      placeholder="0.00"
                      className="w-full text-2xl sm:text-3xl lg:text-4xl font-black bg-white border-b-4 border-slate-100 focus:border-red-500 outline-none py-4 transition-all tracking-tighter text-slate-800"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                  
                  <button 
                    onClick={() => setStep('confirm')} 
                    disabled={!amount || parseFloat(amount) > currentAcc.balance}
                    className="w-full btn-primary bg-slate-900 border-none py-5 text-lg font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl shadow-slate-200 hover:scale-[1.02] transition-transform"
                  >
                    Select Purpose <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            )}

            {step === 'confirm' && (
               <div className="animate-in slide-in-from-right-4 duration-300">
                  <div className="mb-8 items-center flex gap-4">
                     <button onClick={() => setStep('input')} className="p-2 hover:bg-slate-100 rounded-full"><History size={20} className="text-slate-400" /></button>
                     <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter italic">Reason for Outflow</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-8">
                     {withdrawalPurposes.map(p => (
                        <button 
                           key={p.id}
                           onClick={() => setSelectedPurpose(p.name)}
                           className={`p-5 rounded-[1.5rem] border-2 transition-all flex items-center gap-4 group ${
                              selectedPurpose === p.name ? 'border-red-500 bg-red-50 text-red-700' : 'border-slate-100 bg-white hover:border-slate-200 text-slate-500'
                           }`}
                        >
                           <p.icon size={20} className={selectedPurpose === p.name ? 'text-red-600' : 'text-slate-300 group-hover:text-slate-400'} />
                           <span className="text-xs font-black uppercase tracking-tighter">{p.name}</span>
                        </button>
                     ))}
                     <button 
                        onClick={() => setSelectedPurpose('OTHER')}
                        className={`p-5 rounded-[1.5rem] border-2 transition-all flex items-center gap-4 ${
                           selectedPurpose === 'OTHER' ? 'border-red-500 bg-red-50 text-red-700' : 'border-slate-100 bg-white hover:border-slate-200 text-slate-500'
                        }`}
                     >
                        <Plus size={20} className={selectedPurpose === 'OTHER' ? 'text-red-600' : 'text-slate-300'} />
                        <span className="text-xs font-black uppercase tracking-tighter">Other Reason</span>
                     </button>
                  </div>

                  {selectedPurpose === 'OTHER' && (
                     <input 
                        placeholder="Specify reason..." 
                        className="w-full input-field border-2 border-red-100 bg-red-50/20 mb-8 font-bold"
                        autoFocus
                        value={customPurpose}
                        onChange={(e) => setCustomPurpose(e.target.value)}
                     />
                  )}

                  <div className="bg-slate-900 rounded-[2rem] p-8 text-white mb-8 border border-white/10 shadow-2xl relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Wallet size={80} />
                     </div>
                     <div className="relative z-10 flex justify-between items-end">
                        <div className="space-y-1">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Withdrawal Summary</p>
                           <p className="text-3xl font-black tracking-tighter">GHS {parseFloat(amount).toLocaleString()}</p>
                           <p className="text-[10px] font-bold text-red-400 tracking-widest">NEW BALANCE: GHS {(currentAcc.balance - amount).toLocaleString()}</p>
                        </div>
                        <CheckCircle2 className="text-green-500" />
                     </div>
                  </div>

                  <button 
                    onClick={handleWithdraw} 
                    disabled={submitting || !selectedPurpose || (selectedPurpose === 'OTHER' && !customPurpose)}
                    className="w-full btn-primary bg-red-600 py-5 text-lg font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl shadow-red-200 transition-all hover:bg-red-700 active:scale-95"
                  >
                    {submitting ? <History className="animate-spin" /> : <>Finalize Withdrawal ✓</>}
                  </button>
               </div>
            )}

            {step === 'success' && (
              <div className="animate-in zoom-in duration-500 text-center">
                <div className="w-24 h-24 bg-slate-900 text-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-slate-200">
                  <Banknote size={56} />
                </div>
                <h3 className="text-4xl font-black text-slate-800 tracking-tighter uppercase italic mb-2">Withdrawal Complete</h3>
                <p className="text-slate-500 font-bold mb-10 tracking-tight">Your withdrawal request has been processed successfully.</p>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                   <button onClick={handlePrint} className="flex items-center justify-center gap-2 p-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-widest hover:scale-[1.05] transition-all">
                      <Printer size={18} /> Print Receipt
                   </button>
                   <button onClick={resetModals} className="flex items-center justify-center gap-2 p-5 bg-slate-100 text-slate-800 rounded-[1.5rem] font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-all">
                      Dashboard
                   </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Open New Account Modal */}
      {showNewAccountModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] p-8 sm:p-10 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
               <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter italic">Open New Account</h3>
               <button onClick={() => setShowNewAccountModal(false)} className="p-2 hover:bg-slate-100 rounded-full"><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-4">
               <button 
                 onClick={() => handleCreateAccount('SAVINGS')}
                 className="w-full flex items-center gap-5 p-6 bg-slate-50 rounded-2xl border-2 border-slate-100 hover:border-primary hover:bg-primary/5 transition-all group"
               >
                 <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                   <Wallet size={24} />
                 </div>
                 <div className="text-left">
                   <p className="font-black text-primary text-sm uppercase tracking-widest">Savings Account</p>
                   <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Standard deposit & withdrawal</p>
                 </div>
               </button>
               <button 
                 onClick={() => handleCreateAccount('INVESTMENT')}
                 className="w-full flex items-center gap-5 p-6 bg-slate-50 rounded-2xl border-2 border-slate-100 hover:border-secondary hover:bg-secondary/5 transition-all group"
               >
                 <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                   <TrendingUp size={24} />
                 </div>
                 <div className="text-left">
                   <p className="font-black text-primary text-sm uppercase tracking-widest">Investment Account</p>
                   <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">High-yield portfolio vault</p>
                 </div>
               </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Account Cards (Section 1) */}
        <div className="col-span-1 lg:col-span-8 space-y-6 sm:space-y-10">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 px-1">
            <h3 className="text-lg lg:text-2xl font-black text-primary uppercase tracking-tighter italic">Your Accounts</h3>
            <button 
              onClick={() => setShowNewAccountModal(true)}
              className="px-6 py-2.5 bg-primary/5 text-[10px] font-black text-primary rounded-xl flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-all group tracking-widest uppercase shadow-sm"
            >
              <Plus size={16} className="group-hover:rotate-90 transition-transform" /> <span className="sm:hidden">New Account</span><span className="hidden sm:inline">Open New Account</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-8">
            {accounts.map((account, idx) => (
              <div 
                key={account.id} 
                onClick={() => setActiveAccountIndex(idx)}
                className={`relative overflow-hidden card p-5 sm:p-8 min-h-[220px] sm:min-h-[250px] flex flex-col justify-between group cursor-pointer transition-all duration-500 border-2 ${
                  activeAccountIndex === idx 
                    ? 'bg-primary text-white border-primary ring-4 sm:ring-8 ring-primary/5 scale-[1.02] sm:scale-[1.03] shadow-xl' 
                    : 'bg-white text-slate-800 border-slate-100 hover:border-primary/20 bg-gradient-to-br from-white to-slate-50'
                }`}
              >
                <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-700 ${activeAccountIndex === idx ? 'text-white' : 'text-primary'}`}>
                  <ShieldCheck size={180} />
                </div>
                <div className="flex justify-between items-start z-10">
                  <div>
                    <p className={`text-[10px] sm:text-[11px] font-black uppercase tracking-[0.25em] mb-1 ${activeAccountIndex === idx ? 'text-secondary' : 'text-primary opacity-60'}`}>{account.type} ACCOUNT</p>
                    <div className="flex items-center gap-3">
                      <p className="font-mono text-base sm:text-xl font-black tracking-[0.2em]">{account.accountNumber}</p>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(account.accountNumber);
                          showToast('Account Number Copied');
                        }}
                        className={`p-1.5 sm:p-2 rounded-xl transition-all ${activeAccountIndex === idx ? 'bg-white/10 hover:bg-white/20' : 'bg-slate-100 hover:bg-slate-200'}`}
                      >
                        <Copy size={14} className="opacity-70" />
                      </button>
                    </div>
                  </div>
                  <div className={`p-2.5 sm:p-3 rounded-2xl shadow-inner ${activeAccountIndex === idx ? 'bg-white/10' : 'bg-primary/5 text-primary'}`}>
                     <CreditCard size={20} className="sm:size-6" />
                  </div>
                </div>
                
                <div className="z-10">
                  <div className="flex items-center justify-between mb-1">
                    <p className={activeAccountIndex === idx ? 'text-white/60 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em]' : 'text-slate-400 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em]'}>Account Balance</p>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowBalance(!showBalance);
                      }}
                      className={`p-1 rounded-md transition-all ${activeAccountIndex === idx ? 'hover:bg-white/20 text-white' : 'hover:bg-slate-100 text-slate-400'}`}
                    >
                      {showBalance ? <Eye size={12} /> : <EyeOff size={12} />}
                    </button>
                  </div>
                  <p className={`text-2xl lg:text-3xl font-black font-outfit tracking-tighter transition-all duration-300 ${activeAccountIndex === idx ? 'text-white' : 'text-slate-900'} ${!showBalance ? 'blur-md select-none' : ''}`}>
                    <span className="text-lg lg:text-xl font-bold opacity-60 mr-1">GHS</span>
                    {showBalance ? account.balance.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '•••••••'}
                  </p>
                </div>
                
                <div className="z-10 flex justify-between items-center pt-4 sm:pt-6 border-t border-white/10">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-black uppercase text-[8px] sm:text-[9px] tracking-widest ${account.frozen ? 'bg-red-500 text-white shadow-lg' : 'bg-green-500 text-white shadow-lg'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full bg-white ${account.frozen ? '' : 'animate-pulse'}`}></div>
                    {account.frozen ? 'LOCKED' : 'ACTIVE'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions (Section 2 - Master Control) */}
        <div className="col-span-1 lg:col-span-4 space-y-8 lg:space-y-10">
          <div className="card bg-slate-900 text-white border-none p-6 sm:p-10 overflow-hidden relative shadow-2xl rounded-[1.5rem] sm:rounded-[2.5rem]">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
            
            <h3 className="text-lg sm:text-xl font-black mb-8 sm:mb-10 z-10 relative uppercase tracking-widest italic flex items-center gap-3">
               <Zap size={20} className="text-secondary" /> Master Control
            </h3>
            
            <div className="grid grid-cols-2 gap-4 sm:gap-5 relative z-10">
              <Link to="/transfer" className="flex flex-col items-center justify-center p-4 sm:p-6 bg-white/5 rounded-[1.5rem] sm:rounded-[2rem] hover:bg-white/10 transition-all group border border-white/5 shadow-inner">
                <div className="w-10 sm:w-14 h-10 sm:h-14 rounded-2xl bg-primary text-white flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 group-hover:-rotate-12 transition-all shadow-xl shadow-primary/20">
                  <Send size={18} className="sm:size-6" />
                </div>
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-white transition-colors text-center">Fast Pay</span>
              </Link>
              
              <button 
                onClick={() => { setAmount(''); setStep('input'); setIsDepositModalOpen(true); }}
                className="flex flex-col items-center justify-center p-4 sm:p-6 bg-white/10 rounded-[1.5rem] sm:rounded-[2rem] hover:bg-white/20 transition-all group border border-white/10 shadow-inner"
              >
                <div className="w-10 sm:w-14 h-10 sm:h-14 rounded-2xl bg-secondary text-primary flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all shadow-xl shadow-secondary/20">
                  <TrendingUp size={18} className="sm:size-6" />
                </div>
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-slate-200 group-hover:text-white text-center">Deposit</span>
              </button>
              
              <button 
                onClick={() => { setAmount(''); setStep('input'); setIsWithdrawModalOpen(true); }}
                className="flex flex-col items-center justify-center p-4 sm:p-6 bg-white/5 rounded-[1.5rem] sm:rounded-[2rem] hover:bg-white/10 transition-all group border border-white/5 shadow-inner"
              >
                <div className="w-10 sm:w-14 h-10 sm:h-14 rounded-2xl bg-red-500/20 text-red-500 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 group-hover:-rotate-12 transition-all shadow-xl shadow-red-500/10">
                  <Wallet size={18} className="sm:size-6" />
                </div>
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-white text-center">Withdraw</span>
              </button>
              
              <div className="flex flex-col items-center justify-center p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] bg-white/5 border border-white/5 shadow-inner opacity-40 grayscale">
                <div className="w-10 sm:w-14 h-10 sm:h-14 rounded-2xl bg-slate-700 text-white flex items-center justify-center mb-3 sm:mb-4 transition-all shadow-xl">
                  <ShieldCheck size={18} className="sm:size-6" />
                </div>
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Support</span>
              </div>
            </div>
          </div>
        </div>

        {/* Latest Operations (Section 3) */}
        <div className="col-span-1 lg:col-span-8 space-y-8 lg:space-y-10">
          <div className="card !p-5 sm:!p-10 border-none shadow-2xl bg-white/80 backdrop-blur-xl rounded-[1.5rem] sm:rounded-[2.5rem]">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6 mb-8 lg:mb-12">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-[1.5rem] bg-secondary flex items-center justify-center text-primary shadow-xl shadow-secondary/10 shrink-0">
                    <History size={20} className="lg:size-6" />
                 </div>
                 <div>
                    <h3 className="text-lg lg:text-xl font-black text-slate-800 uppercase tracking-tighter italic">Latest Operations</h3>
                    <p className="text-[9px] lg:text-[10px] text-slate-400 font-bold uppercase tracking-widest">Real-time Node Ledger</p>
                 </div>
              </div>
              <Link to="/transactions" className="w-full sm:w-auto text-center px-6 py-2.5 bg-slate-50 text-[10px] font-black text-slate-500 hover:bg-primary hover:text-white rounded-xl transition-all uppercase tracking-widest shadow-inner">View Full Ledger</Link>
            </div>
            
            <div className="space-y-3 sm:space-y-5">
              {filteredTransactions.length > 0 ? filteredTransactions.map(tx => {
                const isDebit = tx.senderAccount?.accountNumber === currentAcc.accountNumber;
                return (
                  <div key={tx.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 hover:bg-slate-50/80 rounded-2xl lg:rounded-[2rem] transition-all border border-slate-50 group hover:shadow-xl gap-4">
                    <div className="flex items-center gap-4 sm:gap-6">
                      <div className={`w-10 h-10 sm:w-16 sm:h-16 rounded-xl sm:rounded-[1.5rem] flex items-center justify-center shadow-lg shrink-0 ${
                        isDebit ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'
                      }`}>
                        {tx.type === 'DEPOSIT' ? <TrendingUp size={20} className="sm:size-7" /> : 
                         tx.type === 'WITHDRAWAL' ? <TrendingDown size={20} className="sm:size-7" /> :
                         (isDebit ? <ArrowUpRight size={20} className="sm:size-7" /> : <ArrowDownLeft size={20} className="sm:size-7" />)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-slate-900 text-sm sm:text-lg group-hover:text-primary transition-colors tracking-tight truncate">{tx.description || tx.type}</p>
                        <p className="text-[8px] sm:text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1 opacity-70 flex items-center gap-2">
                           <Clock size={10} className="sm:size-3" /> {new Date(tx.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • {tx.type}
                        </p>
                      </div>
                    </div>
                    <div className="flex sm:flex-col justify-between items-center sm:items-end border-t sm:border-t-0 mt-3 sm:mt-0 pt-3 sm:pt-0 border-slate-100">
                      <p className={`font-black text-xl lg:text-2xl font-outfit tracking-tighter ${isDebit ? 'text-slate-800' : 'text-green-600'}`}>
                        {isDebit ? `-` : `+`} GHS {tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                      <div className="flex items-center justify-end gap-1.5 mt-1">
                         <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                         <p className="text-[9px] lg:text-[10px] text-green-500 font-black uppercase tracking-widest">Settled</p>
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div className="text-center py-12 bg-slate-50/40 rounded-3xl border-2 border-dashed border-slate-100">
                   <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Empty Ledger</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Financial Intel (Section 4) */}
        <div className="col-span-1 lg:col-span-4 space-y-8 lg:space-y-10">
          <div className="card shadow-xl border-none bg-white rounded-[1.5rem] sm:rounded-[2.5rem] p-8">
            <h4 className="font-black text-slate-800 uppercase tracking-tighter text-lg mb-6 flex items-center gap-2">
               <TrendingDown size={20} className="text-secondary" /> Spending Intel
            </h4>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-4 text-center italic">Monthly Outflow breakdown</p>
          </div>

          <div className="card overflow-hidden !p-0 shadow-xl border-none bg-white rounded-[1.5rem] sm:rounded-[2.5rem]">
            <div className="p-8 bg-slate-50 border-b border-slate-100">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-[1.5rem] bg-green-500/10 flex items-center justify-center text-green-600 shadow-inner">
                  <ShieldCheck size={28} />
                </div>
                <div>
                  <h4 className="font-black text-slate-800 uppercase tracking-tighter text-lg">Defense Matrix</h4>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">E2E Cryptographic Guard</p>
                </div>
              </div>
            </div>
            <div className="p-10 space-y-8">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Account Status</span>
                <span className={`font-black px-4 py-1.5 rounded-xl text-[10px] uppercase tracking-[0.2em] border-2 ${currentAcc?.frozen ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                  {currentAcc?.frozen ? 'LOCKED' : 'READY'}
                </span>
              </div>
              <div className="flex items-center justify-between pt-8 border-t border-slate-50">
                <span className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Spending Limit</span>
                <div className="text-right">
                   <span className="font-black text-slate-800 text-lg tracking-tighter">GHS 50K</span>
                   <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest">Daily Limit</p>
                </div>
              </div>
            </div>
          </div>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
};

export default Dashboard;
