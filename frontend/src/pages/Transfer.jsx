import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Send, Search, AlertCircle, CheckCircle2, Loader2, Landmark, ArrowLeft, ShieldCheck, User, Download, Home, RefreshCcw, Printer, Tag, Edit3, PlusCircle, Phone } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

const PRESET_DESCRIPTIONS = [
  "Food & Groceries", "Monthly Rent", "Utility Bills", "Savings & Investment", 
  "Family Support", "Gift / Donation", "Business Payment", "Emergency Funds"
];

const Transfer = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [step, setStep] = useState('input'); // 'input', 'confirm', 'success'
  const [searchType, setSearchType] = useState('ACCOUNT'); // 'ACCOUNT' or 'PHONE'
  const [recipient, setRecipient] = useState(null);
  const [refNumber, setRefNumber] = useState('');
  const [showCustomDesc, setShowCustomDesc] = useState(false);
  const [formData, setFormData] = useState({
    fromAccountNumber: '',
    toAccountNumber: '',
    amount: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await axios.get('/api/v1/banking/accounts');
        setAccounts(res.data);
        if (res.data.length > 0) {
          setFormData(prev => ({ ...prev, fromAccountNumber: res.data[0].accountNumber }));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchAccounts();
  }, []);

  const handleProceed = async (e) => {
    e.preventDefault();
    if (formData.fromAccountNumber === formData.toAccountNumber) {
      setError("You cannot transfer to the same account.");
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      const endpoint = searchType === 'ACCOUNT' 
        ? `/api/v1/banking/accounts/search/${formData.toAccountNumber}`
        : `/api/v1/banking/accounts/search-phone/${formData.toAccountNumber}`;

      const res = await axios.get(endpoint);
      
      if (res.data.isFrozen === 'true') {
        setError("Security Block: This recipient's account is currently under 'Lock Safe' protection and cannot receive funds.");
        setLoading(false);
        return;
      }

      // If search was by phone, update formData with the real account number for the transfer
      if (searchType === 'PHONE') {
        setFormData(prev => ({ ...prev, toAccountNumber: res.data.accountNumber }));
      }

      setRecipient(res.data);
      setStep('confirm');
    } catch (err) {
      setError(err.response?.data?.message || `Recipient ${searchType.toLowerCase()} not found. Please verify and try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalConfirm = async () => {
    if (!formData.description) {
      setError("Please select a purpose for the transfer.");
      // Scroll to purpose section or similar? For now just set error.
      return;
    }
    setLoading(true);
    setError('');
    try {
      await axios.post('/api/v1/banking/transfer', formData);
      const generatedRef = "ACME-" + Math.random().toString(36).substring(7).toUpperCase() + "-" + Date.now().toString().slice(-4);
      setRefNumber(generatedRef);
      setSuccess(true);
      setStep('success');
    } catch (err) {
      setError(err.response?.data?.message || 'Transfer failed. Transaction could not be completed.');
      setStep('input');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const selectedAcc = accounts.find(a => a.accountNumber === formData.fromAccountNumber);

  return (
    <Layout title="Transfer Funds" subtitle="Instant and secure money transfers across the network" hideSearch hideBell>
      <style>{`
        @media print {
          body * { visibility: hidden; background: white !important; }
          .receipt-print-area, .receipt-print-area * { visibility: visible; }
          .receipt-print-area { position: fixed; left: 0; top: 0; width: 100%; height: 100%; padding: 40px; background: white !important; margin: 0 !important; border: none !important; box-shadow: none !important; z-index: 9999; display: flex !important; flex-direction: column; }
          header, nav, footer, .sidebar, .no-print, button, .lucide { display: none !important; }
        }
      `}</style>

      <div className="max-w-4xl mx-auto py-8 px-4">
        
        {step === 'success' ? (
          <>
            <div className="card text-center p-8 md:p-12 animate-in zoom-in-95 duration-500 shadow-2xl shadow-green-100 border-green-100 border-2 print:hidden no-print">
              <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner no-print">
                <CheckCircle2 size={48} />
              </div>
              <h2 className="text-3xl font-black text-slate-800 mb-2">Transfer Successful!</h2>
              <p className="text-slate-500 mb-8 font-medium">Your GHS {parseFloat(formData.amount).toLocaleString()} has been sent to {recipient?.ownerName}.</p>
              
              <div className="bg-slate-50 p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] mb-8 lg:mb-10 space-y-4 border border-slate-100">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-sm">
                  <span className="text-slate-400 font-bold uppercase tracking-tighter">Reference Number</span>
                  <span className="font-mono font-black text-primary bg-white px-3 py-1 rounded-lg border border-slate-200 tracking-wider text-xs md:text-sm truncate max-w-full text-center sm:text-left">{refNumber}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-sm border-t border-slate-100 pt-4">
                  <span className="text-slate-400 font-bold uppercase tracking-tighter">Date & Time</span>
                  <span className="font-bold text-slate-800 text-center sm:text-right">{new Date().toLocaleString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button onClick={handlePrintReceipt} className="flex items-center justify-center gap-3 bg-white border-2 border-primary text-primary py-4 px-6 rounded-2xl font-black hover:bg-primary hover:text-white transition-all hover:scale-[1.02] group no-print">
                  <Printer size={22} className="group-hover:text-white" /> Print PDF Receipt
                </button>
                <button onClick={() => navigate('/dashboard')} className="flex items-center justify-center gap-3 bg-primary text-white py-4 px-6 rounded-2xl font-black shadow-xl shadow-primary/20 hover:bg-primary-light transition-all hover:scale-[1.02] no-print">
                  <Home size={22} /> Dashboard Home
                </button>
                <button onClick={() => { setStep('input'); setSuccess(false); setFormData({...formData, toAccountNumber: '', amount: '', description: ''}); setShowCustomDesc(false); }} className="md:col-span-2 flex items-center justify-center gap-2 text-slate-400 font-bold hover:text-primary transition-colors py-2 no-print">
                  <RefreshCcw size={16} /> Another Transfer
                </button>
              </div>
            </div>

            <div className="hidden print:flex receipt-print-area p-6 sm:p-12 bg-white text-slate-900 font-sans max-w-[800px] mx-auto border-[6px] sm:border-[10px] border-slate-900 rounded-[2rem] sm:rounded-[3rem] flex-col">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8 lg:mb-12">
                <div className="h-12 w-12 sm:h-16 sm:w-16 shrink-0"><Landmark size={48} className="text-primary lg:size-16" /></div>
                <div className="sm:text-right">
                  <h1 className="text-2xl sm:text-4xl font-black text-primary mb-1">ACME FINANCIAL</h1>
                  <p className="text-[10px] sm:text-sm font-black text-slate-400 tracking-[0.2em] sm:tracking-[0.3em] uppercase">Security Engine Receipt</p>
                </div>
              </div>
              <div className="border-y-2 border-slate-100 py-6 sm:py-8 mb-8 lg:mb-12">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 lg:gap-12">
                   <div className="space-y-1">
                      <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Sender Account (From)</p>
                      <p className="text-xl sm:text-2xl font-black text-slate-900">{currentUser?.username || "Account Owner"}</p>
                   </div>
                   <div className="space-y-1 sm:text-right">
                      <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Recipient Name (To)</p>
                      <p className="text-xl sm:text-2xl font-black text-primary">{recipient?.ownerName}</p>
                   </div>
                 </div>
              </div>
              <div className="space-y-6 sm:space-y-8 mb-8 lg:mb-12 flex-1">
                 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-4 border-b border-slate-50">
                    <div>
                       <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Settled Amount</p>
                       <p className="text-3xl sm:text-5xl font-black text-slate-900 font-outfit">GHS {parseFloat(formData.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div className="sm:text-right shrink-0"><span className="px-4 sm:px-6 py-2 bg-green-500 text-white font-black rounded-lg text-xs sm:text-sm uppercase tracking-widest">Successful</span></div>
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 pt-4">
                    <div className="p-4 sm:p-6 bg-slate-50 rounded-2xl">
                       <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Transaction Details</p>
                       <div className="space-y-2 lg:space-y-3">
                          <div className="flex justify-between text-[10px] sm:text-xs"><span className="text-slate-400 font-bold">Ref:</span><span className="font-mono font-black text-slate-700 truncate ml-2">{refNumber}</span></div>
                          <div className="flex justify-between text-[10px] sm:text-xs"><span className="text-slate-400 font-bold">Date:</span><span className="font-black text-slate-700">{new Date().toLocaleDateString()}</span></div>
                       </div>
                    </div>
                    <div className="p-4 sm:p-6 bg-slate-50 rounded-2xl">
                       <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Description / Remark</p>
                       <p className="text-xs sm:text-sm font-medium text-slate-600 italic">"{formData.description}"</p>
                    </div>
                 </div>
              </div>
              <div className="mt-12 sm:mt-20 pt-8 sm:pt-10 border-t-4 border-primary text-center relative shrink-0">
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-6 shrink-0"><ShieldCheck size={28} className="text-primary" /></div>
                 <p className="text-[9px] sm:text-xs font-black text-primary uppercase tracking-[0.2em] sm:tracking-[0.4em] mb-3">Verified by ACME Secure Ledger</p>
                 <Logo /><p className="text-[8px] sm:text-[10px] text-slate-400 italic">This is an electronically generated receipt.</p>
              </div>
            </div>
          </>
        ) : step === 'input' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="col-span-1 lg:col-span-12">
              <div className="card shadow-2xl border-none p-6 sm:p-10">
                <h3 className="text-xl font-black text-primary mb-6 flex items-center gap-2">
                  <Send size={24} className="text-secondary" /> Initiate Transfer
                </h3>
                <form onSubmit={handleProceed} className="space-y-6">
                  {error && (
                    <div className="bg-red-50 text-red-500 p-4 rounded-2xl flex items-center gap-3 border border-red-100 italic text-sm"><AlertCircle size={20} className="shrink-0" /><span className="font-bold">{error}</span></div>
                  )}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Select Source Account</label>
                    <select className="input-field bg-slate-50 font-bold text-slate-800" value={formData.fromAccountNumber} onChange={(e) => setFormData({ ...formData, fromAccountNumber: e.target.value })}>
                      {accounts.map(acc => (
                        <option key={acc.id} value={acc.accountNumber}>{acc.type} ({acc.accountNumber}) - GHS {acc.balance.toLocaleString()}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
                      <button 
                        type="button" 
                        onClick={() => { setSearchType('ACCOUNT'); setFormData({...formData, toAccountNumber: ''}); }}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${searchType === 'ACCOUNT' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-primary'}`}
                      >
                        Account No.
                      </button>
                      <button 
                        type="button" 
                        onClick={() => { setSearchType('PHONE'); setFormData({...formData, toAccountNumber: ''}); }}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${searchType === 'PHONE' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-primary'}`}
                      >
                        Phone Number
                      </button>
                    </div>

                    <div className="space-y-2">
                       <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                         {searchType === 'ACCOUNT' ? "Recipient's Account Number" : "Recipient's Phone Number"}
                       </label>
                       <div className="relative">
                         {searchType === 'ACCOUNT' ? (
                           <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                         ) : (
                           <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                         )}
                         <input 
                           type="text" 
                           className="input-field pl-11 font-mono tracking-widest" 
                           placeholder={searchType === 'ACCOUNT' ? "Enter 10-digit account number" : "e.g. 054XXXXXXX"} 
                           required 
                           value={formData.toAccountNumber} 
                           onChange={(e) => setFormData({ ...formData, toAccountNumber: e.target.value })} 
                         />
                       </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Amount to Send</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black">GHS</span><input type="number" step="0.01" className="input-field pl-16 text-3xl font-black text-primary" placeholder="0.00" required value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} />
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="w-full btn-primary py-4 text-lg shadow-xl shadow-primary/20 flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="animate-spin" /> : <><Search size={20} /> Verify Recipient</>}
                  </button>
                </form>
              </div>
            </div>
            
            <div className="col-span-1 lg:col-span-12 space-y-6">
              <div className="card bg-slate-900 text-white p-6 sm:p-10 relative overflow-hidden rounded-[2rem]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <h3 className="text-lg font-bold mb-4 relative z-10 font-outfit uppercase tracking-widest text-secondary">Transfer Limits</h3>
                <div className="space-y-6 relative z-10">
                  <div className="flex justify-between border-b border-white/5 pb-2"><span className="text-slate-400 text-sm font-bold">Daily Balance</span><span className="font-bold">GHS 50,000.00</span></div>
                  <div className="flex justify-between border-b border-white/5 pb-2"><span className="text-slate-400 text-sm font-bold">Transaction Limit</span><span className="font-bold text-secondary">GHS 10,000.00</span></div>
                  <div className="p-4 bg-white/5 rounded-2xl flex items-center gap-3"><ShieldCheck size={20} className="text-green-400" /><span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Transaction is encrypted</span></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Confirmation Step with PURPOSE SELECTION */
          <div className="max-w-2xl mx-auto animate-in slide-in-from-right-12 duration-500">
            <button onClick={() => setStep('input')} className="flex items-center gap-2 text-slate-400 hover:text-primary mb-6 font-bold transition-all group no-print">
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Modify Details
            </button>

            <div className="card shadow-2xl border-none overflow-hidden !p-0">
              <div className="bg-primary p-8 text-white relative">
                 <div className="absolute top-0 right-0 p-8 opacity-10"><Send size={120} /></div>
                 <h2 className="text-2xl font-black mb-1 relative z-10">Review Transaction</h2>
                 <p className="text-primary-light/80 font-medium text-sm relative z-10">Confirm the details and select a purpose</p>
              </div>
              
              <div className="p-8 space-y-8">
                {error && (
                   <div className="bg-red-50 text-red-500 p-3 rounded-xl flex items-center gap-2 border border-red-100 font-bold text-xs"><AlertCircle size={16} /> {error}</div>
                )}

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Source</p>
                    <p className="font-bold text-slate-800">{selectedAcc?.type} Acc</p>
                    <p className="text-xs font-mono text-slate-400">{selectedAcc?.accountNumber}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</p>
                    <p className="text-2xl font-black text-primary font-outfit">GHS {parseFloat(formData.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>

                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center gap-6">
                  <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center text-primary shadow-inner overflow-hidden">
                    {recipient?.imageUrl ? (
                      <img src={recipient.imageUrl} alt="Recipient" className="w-full h-full object-cover" />
                    ) : (
                      <User size={32} />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">To (Recipient)</p>
                    <h4 className="text-xl font-black text-primary">{recipient?.ownerName}</h4>
                    <span className="text-xs font-mono font-bold text-slate-600 tracking-wider group flex items-center gap-1">{recipient?.accountNumber} <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[8px] font-black rounded uppercase">Verified</span></span>
                  </div>
                </div>

                {/* Purpose Selection Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-800">
                    <Tag size={18} className="text-primary" />
                    <h3 className="font-black text-sm uppercase tracking-widest">Select Purpose</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PRESET_DESCRIPTIONS.map(desc => (
                      <button
                        key={desc}
                        onClick={() => { setFormData({...formData, description: desc}); setShowCustomDesc(false); }}
                        className={`text-left p-4 rounded-2xl border-2 transition-all font-bold text-xs ${
                          formData.description === desc 
                            ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' 
                            : 'bg-white text-slate-600 border-slate-100 hover:border-primary/20 hover:bg-slate-50'
                        }`}
                      >
                        {desc}
                      </button>
                    ))}
                    <button
                      onClick={() => { setShowCustomDesc(true); setFormData({...formData, description: ''}); }}
                      className={`text-left p-4 rounded-2xl border-2 transition-all font-bold text-xs flex items-center justify-between ${
                        showCustomDesc 
                          ? 'bg-secondary text-primary border-secondary shadow-lg shadow-secondary/20' 
                          : 'bg-white text-slate-600 border-slate-100 hover:border-secondary/30'
                      }`}
                    >
                      Other Purpose <PlusCircle size={18} />
                    </button>
                  </div>

                  {showCustomDesc && (
                     <div className="animate-in slide-in-from-top-2 duration-300">
                        <textarea
                          className="input-field min-h-[80px] py-3 text-sm font-medium"
                          placeholder="Type your custom reason here..."
                          autoFocus
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                     </div>
                  )}
                </div>

                <div className="pt-4 space-y-4">
                  <button 
                    onClick={handleFinalConfirm}
                    disabled={loading}
                    className="w-full btn-secondary py-5 text-xl font-black flex items-center justify-center gap-3 shadow-2xl shadow-secondary/30 hover:scale-[1.02] active:scale-[0.98] transition-all no-print"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : <>Confirm & Authorize</>}
                  </button>
                  <p className="text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest pt-2">Securely processed by ACME Financial Engine</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Transfer;
