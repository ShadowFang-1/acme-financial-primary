import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Zap, 
  Droplet, 
  Wifi, 
  Tv, 
  CreditCard, 
  ArrowLeft, 
  CheckCircle2, 
  Loader2, 
  Smartphone,
  ChevronRight,
  ShieldCheck,
  Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

const BILL_CATEGORIES = [
  { id: 'UTILITIES', name: 'Utilities', icon: Zap, color: 'text-amber-500 bg-amber-50', providers: ['ECG (Electricity)', 'GWCL (Water)', 'Pura Water', 'Solar-X'] },
  { id: 'INTERNET', name: 'Internet & Data', icon: Wifi, color: 'text-blue-500 bg-blue-50', providers: ['MTN Fiber', 'Telecel Broadband', 'Busy Internet', 'Surfline', 'Starlink'] },
  { id: 'ENTERTAINMENT', name: 'Subscriptions', icon: Tv, color: 'text-purple-500 bg-purple-50', providers: ['Netflix Premium', 'DSTV', 'GOtv', 'Spotify Family', 'Apple Music', 'Disney+', 'Canal+'] },
  { id: 'MOBILE', name: 'Mobile Top-up', icon: Smartphone, color: 'text-green-500 bg-green-50', providers: ['MTN (Ghana) Airtime', 'Telecel Airtime', 'AT (AirtelTigo) Airtime'] }
];

const BillPayment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [step, setStep] = useState('category'); // category, details, success
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    fromAccountNumber: '',
    provider: '',
    amount: '',
    customerID: ''
  });
  const [loading, setLoading] = useState(false);
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

  const handlePay = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Simulate a bill payment using the withdraw logic (since money leaves the account)
      await axios.post('/api/v1/banking/withdraw', null, {
        params: {
           accountNumber: formData.fromAccountNumber,
           amount: formData.amount,
           description: `Bill Pay: ${formData.provider} (Ref: ${formData.customerID})`
        }
      });
      setStep('success');
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="ACME Easy-Pay" subtitle="Automated Bill & Subscription Management" hideSearch hideBell>
      <div className="max-w-4xl mx-auto py-8 px-4">
        
        {step === 'success' ? (
          <div className="card text-center p-12 bg-white rounded-[3rem] shadow-2xl border-2 border-green-100 italic animate-in zoom-in-95">
             <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                <CheckCircle2 size={48} />
             </div>
             <h2 className="text-3xl font-black text-primary mb-4 italic">Settlement Confirmed!</h2>
             <p className="text-slate-500 mb-8 font-bold uppercase tracking-widest text-xs">Your payment of ${formData.amount} to {formData.provider} was successful.</p>
             <button onClick={() => navigate('/hub')} className="bg-primary text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-105 transition-all">Return to Hub</button>
          </div>
        ) : step === 'category' ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {BILL_CATEGORIES.map(cat => (
                   <button 
                     key={cat.id}
                     onClick={() => { setSelectedCategory(cat); setStep('details'); }}
                     className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-50 shadow-sm hover:border-primary transition-all group text-left"
                   >
                      <div className={`w-14 h-14 ${cat.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                         <cat.icon size={28} />
                      </div>
                      <p className="font-black text-primary uppercase tracking-tight mb-1">{cat.name}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Instant Settlement</p>
                   </button>
                ))}
             </div>
             
             {/* Dynamic Subscriptions */}
             <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-10 opacity-10"><CreditCard size={150} /></div>
                <h3 className="text-xl font-black italic mb-6 relative z-10 flex items-center gap-3">
                   <ShieldCheck className="text-secondary" /> Institutional Subscriptions
                </h3>
                <div className="space-y-4 relative z-10">
                   {['ACME Prime', 'Bloomberg Terminal (LITE)', 'Vault Protection'].map(sub => (
                      <div key={sub} className="flex justify-between items-center bg-white/5 p-5 rounded-2xl hover:bg-white/10 transition-colors">
                         <span className="font-black uppercase tracking-widest text-xs">{sub}</span>
                         <span className="text-[10px] font-bold text-secondary px-3 py-1 bg-secondary/10 rounded-full border border-secondary/20">Active</span>
                      </div>
                   ))}
                </div>
             </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto animate-in slide-in-from-right-8 duration-500">
             <button onClick={() => setStep('category')} className="flex items-center gap-2 text-slate-400 hover:text-primary mb-6 font-black uppercase tracking-widest text-xs transition-all">
                <ArrowLeft size={16} /> Change Category
             </button>
             
             <div className="card shadow-2xl p-8 sm:p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                
                <h3 className="text-xl font-black text-primary uppercase tracking-tight italic mb-8 flex items-center gap-3">
                   {selectedCategory?.icon && <selectedCategory.icon className="text-secondary" />} Pay {selectedCategory?.name}
                </h3>
                
                <form onSubmit={handlePay} className="space-y-6">
                   {error && <div className="p-4 bg-red-50 text-red-500 rounded-2xl text-xs font-bold border border-red-100">{error}</div>}
                   
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Source Account</label>
                     <select className="input-field bg-slate-50 font-bold" value={formData.fromAccountNumber} onChange={(e) => setFormData({...formData, fromAccountNumber: e.target.value})}>
                        {accounts.map(acc => (
                           <option key={acc.id} value={acc.accountNumber}>{acc.type} - GHS {acc.balance.toLocaleString()}</option>
                        ))}
                     </select>
                   </div>

                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Service Provider</label>
                        <select 
                           className="input-field bg-slate-50 font-bold" 
                           required 
                           value={formData.provider} 
                           onChange={(e) => setFormData({...formData, provider: e.target.value})}
                        >
                           <option value="">Select Provider...</option>
                           {selectedCategory?.providers?.map(p => <option key={p} value={p}>{p}</option>)}
                           <option value="OTHER">Other Institution...</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Customer/Meter ID</label>
                        <input type="text" className="input-field font-mono" placeholder="Account/ID Number" required value={formData.customerID} onChange={(e) => setFormData({...formData, customerID: e.target.value})} />
                      </div>
                   </div>

                   {formData.provider === 'OTHER' && (
                      <div className="space-y-2 animate-in slide-in-from-top-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Manual Institution Name</label>
                        <input type="text" className="input-field" placeholder="Enter provider name..." required onChange={(e) => setFormData({...formData, provider: e.target.value})} />
                      </div>
                   )}

                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Amount to Pay</label>
                     <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black">GHS</span>
                        <input type="number" step="0.01" className="input-field pl-16 text-3xl font-black text-primary" placeholder="0.00" required value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} />
                     </div>
                   </div>

                   <button disabled={loading} className="w-full bg-primary text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                      {loading ? <Loader2 className="animate-spin" /> : <>Complete Settlement</>}
                   </button>
                </form>
             </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BillPayment;
