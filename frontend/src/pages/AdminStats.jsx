import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownLeft,
  Calendar,
  Filter,
  Loader2
} from 'lucide-react';
import axios from 'axios';

const AdminStats = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVolume: 0,
    avgTransaction: 0,
    growth: 12.5,
    activeUsers: 84
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/v1/admin/stats/transactions');
      setData(res.data);
      
      const total = res.data.reduce((acc, curr) => acc + (curr.total || 0), 0);
      setStats(prev => ({
        ...prev,
        totalVolume: total,
        avgTransaction: res.data.length > 0 ? total / res.data.length : 0
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#0F172A', '#FBBF24', '#22C55E', '#3B82F6'];

  if (loading) {
    return (
      <Layout title="System Analytics" subtitle="Crunching real-time ledger data...">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="animate-spin text-primary" size={40} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="System Analytics" subtitle="Real-time transaction volume and growth monitoring">
      <div className="space-y-8">
        {/* Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Volume', value: `GHS ${stats.totalVolume.toLocaleString()}`, icon: DollarSign, trend: '+14%', color: 'bg-primary text-white' },
            { label: 'Avg Ticket', value: `GHS ${stats.avgTransaction.toFixed(2)}`, icon: Activity, trend: '+5%', color: 'bg-white text-slate-800' },
            { label: 'Active Nodes', value: stats.activeUsers, icon: TrendingUp, trend: '+8%', color: 'bg-white text-slate-800' },
            { label: 'Growth', value: `${stats.growth}%`, icon: ArrowUpRight, trend: 'Stable', color: 'bg-secondary text-primary' }
          ].map((stat, i) => (
            <div key={i} className={`card p-6 flex flex-col justify-between min-h-[160px] shadow-xl ${stat.color}`}>
              <div className="flex justify-between items-start">
                <div className={`p-3 rounded-xl ${stat.color.includes('white') ? 'bg-slate-50' : 'bg-white/10'}`}>
                  <stat.icon size={20} />
                </div>
                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${stat.color.includes('white') ? 'bg-green-50 text-green-600' : 'bg-white/20'}`}>
                  {stat.trend}
                </span>
              </div>
              <div>
                <p className={`text-[10px] font-black uppercase tracking-widest opacity-60 mb-1`}>{stat.label}</p>
                <p className="text-2xl font-black tracking-tighter">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-8 card p-8 h-[500px] flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter italic">Volume Analysis</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Daily progression of settlement value</p>
              </div>
              <div className="flex gap-2">
                <button className="p-2 bg-slate-50 rounded-lg hover:bg-slate-100"><Filter size={16} /></button>
                <button className="p-2 bg-slate-50 rounded-lg hover:bg-slate-100"><Calendar size={16} /></button>
              </div>
            </div>
            
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorDeposit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22C55E" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorWithdrawal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorTransfer" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorInvestment" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 800, fill: '#94A3B8' }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 800, fill: '#94A3B8' }}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', fontWeight: 800 }}
                  />
                  <Area type="monotone" dataKey="DEPOSIT" stackId="1" stroke="#22C55E" strokeWidth={3} fillOpacity={1} fill="url(#colorDeposit)" />
                  <Area type="monotone" dataKey="WITHDRAWAL" stackId="1" stroke="#EF4444" strokeWidth={3} fillOpacity={1} fill="url(#colorWithdrawal)" />
                  <Area type="monotone" dataKey="TRANSFER" stackId="1" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorTransfer)" />
                  <Area type="monotone" dataKey="INVESTMENT" stackId="1" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorInvestment)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4 card p-8 flex flex-col h-[500px]">
             <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter italic mb-8">Asset Distribution</h3>
             <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Savings', value: data.reduce((acc, curr) => acc + (curr.DEPOSIT || 0), 0) },
                        { name: 'Withdrawals', value: data.reduce((acc, curr) => acc + (curr.WITHDRAWAL || 0), 0) },
                        { name: 'Transfers', value: data.reduce((acc, curr) => acc + (curr.TRANSFER || 0), 0) },
                        { name: 'Investments', value: data.reduce((acc, curr) => acc + (curr.INVESTMENT || 0), 0) }
                      ]}
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {[0,1,2,3].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
             </div>
             <div className="space-y-4 mt-8">
                {['Savings', 'Withdrawals', 'Transfers', 'Investments'].map((label, i) => {
                   const total = data.reduce((acc, curr) => acc + (curr.DEPOSIT || 0) + (curr.WITHDRAWAL || 0) + (curr.TRANSFER || 0) + (curr.INVESTMENT || 0), 0);
                   const val = label === 'Savings' ? data.reduce((acc, curr) => acc + (curr.DEPOSIT || 0), 0) :
                               label === 'Withdrawals' ? data.reduce((acc, curr) => acc + (curr.WITHDRAWAL || 0), 0) :
                               label === 'Transfers' ? data.reduce((acc, curr) => acc + (curr.TRANSFER || 0), 0) :
                               data.reduce((acc, curr) => acc + (curr.INVESTMENT || 0), 0);
                   const pct = total > 0 ? (val / total * 100).toFixed(1) : 0;
                   return (
                   <div key={label} className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                         <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                         <span className="font-bold text-slate-500 uppercase tracking-widest">{label}</span>
                      </div>
                      <span className="font-black text-primary">{pct}%</span>
                   </div>
                   );
                })}
             </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminStats;
