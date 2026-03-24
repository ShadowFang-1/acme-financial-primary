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
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import Skeleton from '../components/Skeleton';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip, 
  Legend 
} from 'recharts';

const FinancialHub = () => {
  const { user } = useAuth();
  const [hubData, setHubData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isCalcOpen, setIsCalcOpen] = useState(false);
  
  // Calculator state
  const [calcInputs, setCalcInputs] = useState({ principal: 1000, rate: 0.1, years: 5 });
  const [calcResult, setCalcResult] = useState(null);

  const fetchData = async () => {
    try {
      const res = await axios.get('/api/v1/hub/summary');
      setHubData(res.data);
    } catch (err) {
      console.error("Hub Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculate = async () => {
    try {
      const res = await axios.get('/api/v1/hub/calculator/compound', { params: calcInputs });
      setCalcResult(res.data.futureValue);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const investmentData = hubData?.investments?.map(inv => ({
    name: inv.assetName,
    value: parseFloat(inv.quantity) * parseFloat(inv.avgPurchasePrice)
  })) || [];

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

  return (
    <Layout 
      title="Zenith Financial Hub" 
      subtitle="Institutional Wealth Management & Intelligence"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Big Stats & Goals */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Portfolio Hero */}
          <div className="relative overflow-hidden bg-primary rounded-[2.5rem] p-8 lg:p-12 text-white shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-secondary opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
              <div>
                <p className="text-secondary font-black text-xs uppercase tracking-[0.2em] mb-4">Net Wealth Index</p>
                <h2 className="text-5xl lg:text-6xl font-black tracking-tighter italic mb-2">Portfolio Total</h2>
                <div className="flex items-baseline gap-2">
                   <p className="text-4xl font-light opacity-60">$</p>
                   <p className="text-4xl font-black">---</p>
                   <span className="ml-4 px-3 py-1 bg-green-500/20 text-green-300 text-[10px] font-black rounded-full border border-green-500/30">+12.4% YTD</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                 <button className="bg-secondary text-primary px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-xl shadow-secondary/20 flex items-center gap-2">
                    <TrendingUp size={18} /> Manage Assets
                 </button>
              </div>
            </div>
          </div>

          {/* Savings Goals Buckets */}
          <section>
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-xl font-black text-primary uppercase tracking-tight italic flex items-center gap-3">
                 <Target className="text-secondary" /> Savings Goals
               </h3>
               <button onClick={() => setIsGoalModalOpen(true)} className="p-2 bg-white border-2 border-slate-100 rounded-xl hover:border-primary transition-all text-primary">
                  <Plus size={20} />
               </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {loading ? [1,2].map(i => <div key={i} className="h-48 bg-slate-100 animate-pulse rounded-3xl" />) : (
                hubData?.savingsGoals?.length > 0 ? hubData.savingsGoals.map(goal => (
                  <div key={goal.id} className="bg-white p-6 rounded-3xl border-2 border-slate-50 shadow-sm group hover:border-primary transition-all">
                    <div className="flex justify-between items-start mb-6">
                       <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
                          <Zap size={24} />
                       </div>
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">Automated</span>
                    </div>
                    <p className="font-black text-primary uppercase tracking-tight mb-1">{goal.name}</p>
                    <div className="flex justify-between items-end mb-4 text-xs font-bold text-slate-400">
                       <p><span className="text-primary">${goal.currentAmount}</span> / ${goal.targetAmount}</p>
                       <p>{Math.round((goal.currentAmount / goal.targetAmount) * 100)}%</p>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                       <div className="h-full bg-secondary transition-all duration-1000" style={{ width: `${(goal.currentAmount / goal.targetAmount) * 100}%` }}></div>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-full py-12 text-center bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                     <Target className="mx-auto text-slate-300 mb-4" size={48} />
                     <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No active savings buckets</p>
                     <button onClick={() => setIsGoalModalOpen(true)} className="mt-4 text-primary font-black text-[10px] uppercase tracking-widest hover:opacity-70 transition-opacity">Start Saving Now</button>
                  </div>
                )
              )}
            </div>
          </section>

          {/* Institutional Loans */}
          <section>
             <h3 className="text-xl font-black text-primary uppercase tracking-tight italic mb-6 flex items-center gap-3">
               <Banknote className="text-secondary" /> ACTIVE CREDIT LINES
             </h3>
             <div className="bg-white border-2 border-slate-50 rounded-[2.5rem] overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                   <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Outstanding</p>
                      <p className="text-3xl font-black text-primary">$0.00</p>
                   </div>
                   <button className="px-6 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 transition-all">Apply for Funding</button>
                </div>
                <div className="p-8 flex items-center justify-center min-h-[150px]">
                   <p className="text-slate-300 font-black text-[9px] uppercase tracking-widest">No active debt exposure found in current credit report</p>
                </div>
             </div>
          </section>

          {/* Zenith Academy & Venture Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-1/2 -translate-y-1/2"></div>
                <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-4">Zenith Academy</h4>
                <p className="text-2xl font-black tracking-tight mb-4 italic">Mastering Digital Assets</p>
                <p className="text-xs text-white/80 leading-relaxed mb-6">Learn why institutional investors use Zenith for high-liquidity operations.</p>
                <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-white/20 hover:bg-white/30 px-6 py-3 rounded-xl transition-all">
                   Start Learning <ArrowRight size={14} />
                </button>
             </div>

             <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 shadow-sm group hover:border-secondary transition-all">
                <div className="flex gap-2 mb-4">
                   <span className="px-3 py-1 bg-amber-100 text-amber-600 text-[8px] font-black rounded-full uppercase tracking-widest">Startup Concept</span>
                   <span className="px-3 py-1 bg-blue-100 text-blue-600 text-[8px] font-black rounded-full uppercase tracking-widest">Beta</span>
                </div>
                <h4 className="text-xl font-black text-primary tracking-tight mb-2 italic flex items-center gap-2">
                   Zenith Trade <TrendingUp size={20} className="text-secondary" />
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed mb-6">Experience the next generation of social trading. Connect your Zenith account to fractional equity markets.</p>
                <button className="w-full flex items-center justify-between text-primary font-black text-[10px] uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">
                   Explore the Pitch <ChevronRight size={16} />
                </button>
             </div>
          </div>

        </div>

        {/* Right Column: Visualization & Tools */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Portfolio Analysis */}
          <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-50 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <h3 className="text-sm font-black text-primary uppercase tracking-widest mb-8 flex items-center gap-2">
              <PieChartIcon size={18} className="text-secondary" /> Asset Distribution
            </h3>
            
            <div className="h-[250px] w-full mb-8">
              {investmentData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={investmentData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {investmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 text-center px-6">
                   <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                      <Briefcase size={32} />
                   </div>
                   <p className="text-[9px] font-black uppercase tracking-[0.2em]">Purchase assets to visualize Portfolio</p>
                </div>
              )}
            </div>

            <button className="w-full py-4 border-2 border-slate-100 rounded-2xl text-[10px] font-black text-primary uppercase tracking-widest hover:bg-slate-50 transition-colors">
               Examine Allocation Details
            </button>
          </div>

          {/* Expert Tools */}
          <div className="space-y-4">
             <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Expert Utilities</div>
             
             <button onClick={() => setIsCalcOpen(true)} className="w-full p-6 bg-gradient-to-r from-primary to-slate-800 rounded-3xl text-left text-white group hover:scale-[1.02] transition-all shadow-xl shadow-primary/10">
                <div className="flex justify-between items-center mb-4">
                   <Calculator className="text-secondary" size={24} />
                   <ChevronRight size={18} className="text-white/20 group-hover:text-white transition-colors" />
                </div>
                <p className="font-black uppercase tracking-tight mb-1">Growth Projector</p>
                <p className="text-[10px] text-white/50 uppercase font-bold tracking-widest">Calculate Compound Future Value</p>
             </button>

             <div className="w-full p-6 bg-white border-2 border-slate-50 rounded-3xl text-left group hover:border-primary transition-all shadow-sm">
                <div className="flex justify-between items-center mb-4">
                   <ShieldCheck className="text-blue-500" size={24} />
                </div>
                <p className="font-black text-primary uppercase tracking-tight mb-1">Audit Ledger</p>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Review {hubData?.auditLogs?.length || 0} Security Events</p>
             </div>
          </div>

          {/* Easy Pay Quick Actions */}
          <div className="bg-secondary/10 p-8 rounded-[2.5rem] border border-secondary/20">
             <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-6 italic">Zenith Easy-Pay Center</h4>
             <div className="space-y-4">
                <Link to="/bill-pay" className="w-full flex items-center justify-between p-4 bg-white/80 backdrop-blur-md rounded-2xl hover:bg-white transition-colors group/link">
                   <span className="text-xs font-black text-primary tracking-tight uppercase">Bill Payment</span>
                   <ArrowRight size={14} className="text-primary/30 group-hover/link:translate-x-1 transition-transform" />
                </Link>
                <Link to="/bill-pay" className="w-full flex items-center justify-between p-4 bg-white/80 backdrop-blur-md rounded-2xl hover:bg-white transition-colors group/link">
                   <span className="text-xs font-black text-primary tracking-tight uppercase">Subscription Manager</span>
                   <ArrowRight size={14} className="text-primary/30 group-hover/link:translate-x-1 transition-transform" />
                </Link>
                <Link to="/transfer" className="w-full flex items-center justify-between p-4 bg-white/80 backdrop-blur-md rounded-2xl hover:bg-white transition-colors group/link">
                   <span className="text-xs font-black text-primary tracking-tight uppercase">Recurring Transfers</span>
                   <ArrowRight size={14} className="text-primary/30 group-hover/link:translate-x-1 transition-transform" />
                </Link>
             </div>
          </div>

        </div>
      </div>

      {/* Calculator Modal */}
      {isCalcOpen && (
        <div className="fixed inset-0 bg-primary/40 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in">
           <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center mb-8">
                 <h2 className="text-xl font-black text-primary tracking-tighter uppercase italic flex items-center gap-2">
                    <Calculator className="text-secondary" /> Growth Projector
                 </h2>
                 <button onClick={() => setIsCalcOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X size={20} /></button>
              </div>

              <div className="space-y-6 mb-8">
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Initial Principal ($)</label>
                    <input 
                      type="number" 
                      className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-secondary transition-all font-bold"
                      value={calcInputs.principal}
                      onChange={(e) => setCalcInputs({...calcInputs, principal: e.target.value})}
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Rate (e.g. 0.08)</label>
                       <input 
                        type="number" 
                        step="0.01"
                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-secondary transition-all font-bold"
                        value={calcInputs.rate}
                        onChange={(e) => setCalcInputs({...calcInputs, rate: e.target.value})}
                      />
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Time (Years)</label>
                       <input 
                        type="number" 
                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-secondary transition-all font-bold"
                        value={calcInputs.years}
                        onChange={(e) => setCalcInputs({...calcInputs, years: e.target.value})}
                      />
                    </div>
                 </div>
              </div>

              {calcResult && (
                 <div className="p-6 bg-secondary/10 rounded-3xl mb-8 animate-in slide-in-from-bottom-2">
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1 opacity-60">Projected Future Value</p>
                    <p className="text-3xl font-black text-primary">${Math.round(calcResult).toLocaleString()}</p>
                 </div>
              )}

              <button onClick={handleCalculate} className="w-full py-5 bg-primary text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all">Run Intelligence Model</button>
           </div>
        </div>
      )}

      {/* Audit Ledger Modal */}
      {hubData?.auditLogs && (
        <div className="fixed inset-0 bg-primary/40 backdrop-blur-md z-[100] hidden group-hover:flex items-center justify-center p-6 animate-in fade-in">
           {/* This would be triggered by clicking the Audit card */}
        </div>
      )}

      {/* Institutional Audit Ledger (Visible in Hub) */}
      <section className="mt-12">
         <h3 className="text-xl font-black text-primary uppercase tracking-tight italic mb-6 flex items-center gap-3">
            <ShieldCheck className="text-blue-500" /> Operational Audit Trail
         </h3>
         <div className="bg-white border-2 border-slate-50 rounded-[2.5rem] overflow-hidden shadow-sm">
            <table className="w-full text-left">
               <thead className="bg-slate-50/50 border-b border-slate-50">
                  <tr>
                     <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                     <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Event</th>
                     <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actor</th>
                     <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Detail Summary</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {hubData?.auditLogs?.slice(0, 5).map(log => (
                     <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-6 text-xs font-bold text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                        <td className="p-6">
                           <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                              log.action.includes('LOGIN') ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'
                           }`}>{log.action}</span>
                        </td>
                        <td className="p-6 text-xs font-black text-primary uppercase tracking-tight">{log.username}</td>
                        <td className="p-6 text-xs text-slate-500">{log.details}</td>
                     </tr>
                  ))}
               </tbody>
            </table>
            <div className="p-6 bg-slate-50/30 text-center border-t border-slate-50">
               <button className="text-[10px] font-black text-primary uppercase tracking-[0.2em] hover:opacity-70 transition-opacity">Request Full Compliance Log</button>
            </div>
         </div>
      </section>
    </Layout>
  );
};

export default FinancialHub;
