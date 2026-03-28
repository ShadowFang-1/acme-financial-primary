import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  Shield, 
  Search, 
  MoreVertical, 
  Mail, 
  Activity,
  AlertTriangle,
  Landmark,
  LayoutDashboard,
  ArrowRight,
  X,
  TrendingUp,
  Wallet,
  UserCheck,
  ArrowUpRight,
  ArrowDownLeft,
  Edit,
  Trash2,
  Lock,
  Unlock,
  ToggleLeft,
  Filter,
  Clock,
  History,
  User as UserIcon,
  CreditCard as CardIcon,
  Loader2
} from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

const AdminDashboard = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editUser, setEditUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUserStats, setSelectedUserStats] = useState(null);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [userTransactions, setUserTransactions] = useState([]);
  const [toast, setToast] = useState(null);
  const [showConfirm, setShowConfirm] = useState(null); // { title: '', message: '', onConfirm: fn }

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchData = async () => {
    try {
      const [userRes, accRes] = await Promise.all([
        axios.get('/api/v1/admin/users'),
        axios.get('/api/v1/admin/accounts')
      ]);
      setUsers(userRes.data);
      setAccounts(accRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFreeze = async (accountNumber, currentFrozen) => {
    try {
      const endpoint = currentFrozen ? 'unfreeze' : 'freeze';
      await axios.patch(`/api/v1/admin/accounts/${accountNumber}/${endpoint}`);
      fetchData();
      if (selectedUserStats) fetchUserTransactions(selectedUserStats.id);
    } catch (err) {
      showToast('Action failed: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  const handleDeleteUser = async (id) => {
    setShowConfirm({
      title: "Purge Node Registry",
      message: "CRITICAL ACTION: Are you sure you want to PERMANENTLY delete this user? This will recursively wipe all connected financial nodes and history. This action is IRREVERSIBLE.",
      onConfirm: async () => {
        try {
          await axios.delete(`/api/v1/admin/users/${id}`);
          fetchData();
          showToast("Node successfully purged from registry.");
        } catch (err) {
          showToast('Deletion failed: ' + (err.response?.data?.message || err.message), 'error');
        } finally {
          setShowConfirm(null);
        }
      }
    });
  };

  const handleUpdateUserDetails = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/v1/admin/users/${editUser.id}`, editUser);
      setIsEditModalOpen(false);
      fetchData();
    } catch (err) {
      alert('Update failed');
    }
  };

  const handleDeleteAccount = async (id) => {
    setShowConfirm({
      title: "Decommission Account",
      message: "WARNING: Are you sure you want to PERMANENTLY delete this specific account and all its transaction history? This vault cannot be recovered.",
      onConfirm: async () => {
        try {
          await axios.delete(`/api/v1/admin/accounts/${id}`);
          fetchData();
          if (selectedUserStats) fetchUserTransactions(selectedUserStats.id);
          showToast("Account decommissioned.");
        } catch (err) {
          showToast('Account deletion failed', 'error');
        } finally {
          setShowConfirm(null);
        }
      }
    });
  };

  const fetchUserTransactions = async (userId) => {
    setStatsLoading(true);
    try {
      const res = await axios.get(`/api/v1/admin/users/${userId}/transactions`);
      setUserTransactions(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleShowStats = (user) => {
    setSelectedUserStats(user);
    setIsStatsModalOpen(true);
    fetchUserTransactions(user.id);
  };

  const handleExportPDF = () => {
    const reportWindow = window.open('', '_blank', 'height=800,width=1000');
    const tableRows = filteredUsers.map(user => {
      const uAccs = accounts.filter(a => a.userId === user.id);
      const total = uAccs.reduce((sum, a) => sum + parseFloat(a.balance), 0);
      return `
        <tr>
          <td>${user.username}</td>
          <td>${user.email}</td>
          <td>${user.role}</td>
          <td>${uAccs.length}</td>
          <td>GHS ${total.toLocaleString()}</td>
          <td style="color: ${user.enabled ? 'green' : 'red'}">${user.enabled ? 'Active' : 'Locked'}</td>
        </tr>
      `;
    }).join('');

    reportWindow.document.write(`
      <html>
        <head>
          <title>ACME - Master User Registry</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; }
            .header { border-bottom: 4px solid #0f172a; padding-bottom: 20px; margin-bottom: 40px; display: flex; justify-content: space-between; align-items: flex-end; }
            h1 { margin: 0; font-weight: 900; letter-spacing: -0.05em; text-transform: uppercase; color: #0f172a; }
            .meta { text-align: right; color: #64748b; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { text-align: left; padding: 12px; background: #f8fafc; border-bottom: 2px solid #e2e8f0; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; }
            td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 12px; font-weight: 500; }
            .footer { margin-top: 80px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8; text-align: center; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <p style="font-weight: 900; color: #fbbf24; margin-bottom: 4px; letter-spacing: 0.2em; font-size: 10px;">MASTER REGISTRY REPORT</p>
              <h1>ACME FINANCIAL</h1>
            </div>
            <div class="meta">
              Generated: ${new Date().toLocaleString()}<br>
              Status: OFFICIAL AUDIT COPY
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Email Address</th>
                <th>Level</th>
                <th>Accounts</th>
                <th>Total Balance</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>
          <div class="footer">
            ACME Cryptographic Ledger System • Internal Use Only • Page 1 of 1
          </div>
          <div class="no-print" style="position: fixed; bottom: 40px; left: 50%; transform: translateX(-50%);">
            <button onclick="window.print()" style="padding: 16px 32px; background: #0f172a; color: white; border-radius: 12px; border: none; font-weight: 900; cursor: pointer; box-shadow: 0 20px 40px rgba(0,0,0,0.2);">FINALIZE PDF DOWNLOAD</button>
          </div>
          <script>
            window.onload = () => {
              setTimeout(() => {
                if(window.innerWidth > 1024) window.print();
              }, 500);
            }
          </script>
        </body>
      </html>
    `);
    reportWindow.document.close();
  };

  const calculateUserTotal = (userId) => {
    return accounts
      .filter(acc => acc.userId === userId)
      .reduce((sum, acc) => sum + parseFloat(acc.balance), 0);
  };

  const filteredUsers = users.filter(u => 
    (u.username || '').toLowerCase().includes(search.toLowerCase()) || 
    (u.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout 
      title="Admin Management" 
      subtitle="Monitor users, accounts, and system security"
      searchValue={search}
      onSearchChange={setSearch}
    >
      <div className="grid grid-cols-12 gap-8">
        {/* Stats */}
        <div className="col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          { [
            { label: 'Total Users', value: users.length, icon: Users, color: 'bg-blue-50 text-blue-600' },
            { label: 'Total Accounts', value: accounts.length, icon: Landmark, color: 'bg-indigo-50 text-indigo-600' },
            { label: 'Active Sessions', value: '12', icon: Activity, color: 'bg-green-50 text-green-600', desc: 'Logged-in members currently interacting with the system ledger.' },
            { label: 'Security Alerts', value: '0', icon: Shield, color: 'bg-red-50 text-red-600', desc: 'Real-time flags for suspicious activity or abnormal patterns.' }
          ].map((stat, i) => (
            <div key={i} className="card group flex items-center gap-4 sm:gap-6 !p-4 sm:!p-8 relative">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 ${stat.color}`}>
                <stat.icon size={20} className="sm:size-6 lg:size-7" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-slate-400 text-[10px] lg:text-xs font-bold uppercase tracking-wider">{stat.label}</p>
                  {stat.desc && (
                    <div className="group/info relative">
                      <div className="w-3.5 h-3.5 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center cursor-help">
                        <Activity size={10} />
                      </div>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-slate-900 text-[10px] text-white rounded-xl opacity-0 group-hover/info:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl font-medium leading-relaxed">
                        {stat.desc}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-xl lg:text-3xl font-black text-primary">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* User Card Grid */}
        <div className="col-span-12">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6 mb-8 mt-4 lg:mt-8">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
                <UserCheck size={20} className="lg:size-6" />
              </div>
              <div>
                <h3 className="text-xl lg:text-2xl font-black text-slate-800 uppercase tracking-tighter italic">User Registry</h3>
                <p className="text-[9px] lg:text-[10px] text-slate-400 font-bold uppercase tracking-widest">Active System Members ({filteredUsers.length})</p>
              </div>
            </div>
            <div className="flex gap-3">
               <button onClick={() => alert('Filter engine initialized')} className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-primary transition-all shadow-sm"><Filter size={18} /></button>
               <button onClick={handleExportPDF} className="flex-1 sm:flex-none px-6 py-3 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl shadow-primary/10">Export Registry</button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredUsers.map(user => {
              const userAccounts = accounts.filter(a => a.userId === user.id);
              const totalBalance = calculateUserTotal(user.id);
              
              return (
                <div key={user.id} className="card group hover:shadow-[0_40px_80px_-20px_rgba(15,23,42,0.1)] hover:border-primary/20 transition-all duration-500 border-2 border-slate-50 relative overflow-hidden flex flex-col min-h-[420px]">
                  {/* Status Overlay */}
                  <div className={`absolute top-0 right-0 px-6 py-2 rounded-bl-3xl font-black text-[10px] uppercase tracking-widest z-10 ${
                    user.enabled ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                  }`}>
                    {user.enabled ? 'Verified' : 'Flagged'}
                  </div>

                  {/* Card Header */}
                  <div className="flex items-start gap-6 mb-8 pt-4">
                    <div className="relative">
                      <img 
                        src={user.imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} 
                        className="w-20 h-20 rounded-3xl object-cover ring-4 ring-slate-50 shadow-xl group-hover:scale-110 transition-transform duration-700" 
                        alt={user.username} 
                      />
                    </div>
                    <div>
                       <h4 className="font-black text-xl sm:text-2xl text-slate-800 tracking-tighter group-hover:text-primary transition-colors cursor-pointer" onClick={() => handleShowStats(user)}>
                         {user.username}
                       </h4>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-3">{user.role}</p>
                       <div className="flex gap-1.5 overflow-hidden">
                          {userAccounts.slice(0, 3).map(acc => (
                             <div key={acc.id} className={`w-3 h-3 rounded-md shadow-sm ${acc.frozen ? 'bg-red-400' : 'bg-green-400'}`} title={acc.accountNumber}></div>
                          ))}
                          {userAccounts.length > 3 && <span className="text-[9px] font-black text-slate-300">+{userAccounts.length - 3}</span>}
                       </div>
                    </div>
                  </div>

                  {/* Financial Pulse */}
                  <div className="flex-1 space-y-6">
                    <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100 group-hover:bg-slate-50 transition-colors">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex justify-between">
                         Aggregate Capital <span>GHS</span>
                       </p>
                       <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tighter">
                          {totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                       </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                       <div className="p-4 bg-white border border-slate-100 rounded-2xl">
                          <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Accounts</p>
                          <p className="font-black text-slate-800">{userAccounts.length} Nodes</p>
                       </div>
                       <div className="p-4 bg-white border border-slate-100 rounded-2xl">
                          <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Reliability</p>
                          <p className="font-black text-green-600 flex items-center gap-1.5">
                             <TrendingUp size={14} /> 94%
                          </p>
                       </div>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="mt-8 pt-8 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleShowStats(user)}
                        className="p-3 bg-slate-50 text-slate-400 hover:bg-primary hover:text-white rounded-xl transition-all shadow-sm"
                        title="View Intelligence"
                      >
                        <Activity size={18} />
                      </button>
                      <button 
                        onClick={() => { setEditUser(user); setIsEditModalOpen(true); }}
                        className="p-3 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm border border-blue-100/50"
                        title="Edit Node"
                      >
                        <Edit size={18} />
                      </button>
                    </div>

                    <div className="flex gap-2">
                       {userAccounts.length > 0 && (
                          <button 
                            onClick={() => handleFreeze(userAccounts[0].accountNumber, userAccounts[0].frozen)}
                            className={`p-3 rounded-xl border transition-all shadow-sm ${
                              userAccounts[0].frozen 
                                ? 'bg-green-50 text-green-600 border-green-100 hover:bg-green-600 hover:text-white' 
                                : 'bg-red-50 text-red-600 border-red-100 hover:bg-red-600 hover:text-white'
                            }`}
                            title={userAccounts[0].frozen ? 'Unfreeze Master' : 'Freeze Master'}
                          >
                            {userAccounts[0].frozen ? <Unlock size={18} /> : <Lock size={18} />}
                          </button>
                       )}
                       <button 
                         onClick={() => handleDeleteUser(user.id)}
                         className="p-3 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-sm border border-red-100/50"
                         title="Purge Node"
                       >
                         <Trash2 size={18} />
                       </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
            {filteredUsers.length === 0 && (
              <div className="py-20 text-center">
                <Search size={48} className="mx-auto text-slate-200 mb-4" />
                <p className="text-slate-400 font-medium">No users found matching your search</p>
              </div>
            )}
        </div>

      {isEditModalOpen && editUser && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in-95 max-h-[95vh] overflow-y-auto">
            <div className="p-6 sm:p-10 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h3 className="text-xl lg:text-3xl font-black text-slate-800 uppercase tracking-tighter italic">Edit User Profile</h3>
                <p className="text-[9px] lg:text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">System Override Mode</p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
                <X size={24} className="text-slate-400" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateUserDetails} className="p-6 sm:p-10 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 font-inter">Username</label>
                  <input 
                    className="input-field" 
                    value={editUser.username} 
                    onChange={e => setEditUser({...editUser, username: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Role</label>
                  <select 
                    className="input-field"
                    value={editUser.role} 
                    onChange={e => setEditUser({...editUser, role: e.target.value})}
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Contact Email</label>
                <input 
                  className="input-field" 
                  value={editUser.email} 
                  onChange={e => setEditUser({...editUser, email: e.target.value})} 
                />
              </div>

              <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border-2 border-slate-100">
                <div>
                   <p className="font-bold text-slate-800 uppercase tracking-widest text-[10px]">Account Access Status</p>
                   <p className="text-[11px] text-slate-400 font-medium">Toggle user authentication permission</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setEditUser({...editUser, enabled: !editUser.enabled})}
                  className={`flex items-center gap-3 px-4 py-2 rounded-xl border-2 transition-all font-black text-[10px] uppercase tracking-widest ${
                    editUser.enabled ? 'bg-green-50 border-green-200 text-green-600' : 'bg-red-50 border-red-200 text-red-600'
                  }`}
                >
                  <ToggleLeft className={editUser.enabled ? 'rotate-180' : ''} />
                  {editUser.enabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>

              <button type="submit" className="w-full btn-primary py-5 text-sm font-black uppercase tracking-widest mt-4">
                Push Changes to Core
              </button>
            </form>
          </div>
        </div>
      )}      {isStatsModalOpen && selectedUserStats && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
           <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 max-h-[92vh] flex flex-col">
              <div className="p-5 sm:p-10 border-b border-slate-100 bg-primary text-white flex justify-between items-center relative overflow-hidden shrink-0">
                 <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Activity size={180} />
                 </div>
                 <div className="relative z-10">
                    <h3 className="text-2xl lg:text-3xl font-black uppercase tracking-tighter italic">User Intelligence</h3>
                    <p className="text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">Deep Audit: {selectedUserStats.username}</p>
                 </div>
                 <button onClick={() => setIsStatsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full relative z-10">
                    <X size={20} className="lg:size-6" />
                 </button>
              </div>

              <div className="p-5 sm:p-10 overflow-y-auto custom-scrollbar space-y-8 flex-1">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-5 sm:p-6 bg-slate-50 rounded-[1.5rem] sm:rounded-3xl border-2 border-slate-100">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Aggregate Balance</p>
                       <p className="text-2xl sm:text-3xl font-black text-primary tracking-tighter">GHS {calculateUserTotal(selectedUserStats.id).toLocaleString()}</p>
                    </div>
                    <div className="p-5 sm:p-6 bg-slate-50 rounded-[1.5rem] sm:rounded-3xl border-2 border-slate-100">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Managed Nodes</p>
                       <p className="text-2xl sm:text-3xl font-black text-primary tracking-tighter">
                          {accounts.filter(a => a.userId === selectedUserStats.id).length} <span className="text-sm opacity-40">Accounts</span>
                       </p>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Account Distribution</h4>
                    <div className="space-y-3">
                       {accounts.filter(a => a.userId === selectedUserStats.id).map(acc => (
                          <div key={acc.id} className="p-5 flex items-center justify-between bg-white border-2 border-slate-50 hover:border-primary/20 rounded-3xl transition-all group">
                             <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-2xl ${acc.frozen ? 'bg-red-50 text-red-500' : 'bg-primary/5 text-primary'}`}>
                                   <CardIcon size={20} />
                                </div>
                                <div className="flex-1">
                                   <p className="font-black text-slate-800 tracking-tight">{acc.accountNumber}</p>
                                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{acc.type} • {acc.frozen ? 'Locked' : 'Active'}</p>
                                </div>
                             </div>
                             <div className="flex items-center gap-4">
                                <div className="text-right">
                                   <p className="font-black text-lg text-primary tracking-tighter">GHS {parseFloat(acc.balance).toLocaleString()}</p>
                                </div>
                                <div className="flex gap-2">
                                   <button 
                                     onClick={() => handleFreeze(acc.accountNumber, acc.frozen)}
                                     className={`p-2 rounded-xl border transition-all ${acc.frozen ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}
                                     title={acc.frozen ? 'Safe Unlock' : 'Safe Lock'}
                                   >
                                      {acc.frozen ? <Unlock size={16} /> : <Lock size={16} />}
                                   </button>
                                   <button 
                                     onClick={() => handleDeleteAccount(acc.id)}
                                     className="p-2 rounded-xl bg-slate-50 text-slate-400 border border-slate-100 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all"
                                     title="Purge Account"
                                   >
                                      <Trash2 size={16} />
                                   </button>
                                </div>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div className="flex justify-between items-center px-2">
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Forensic Activity Timeline</h4>
                       <History size={14} className="text-slate-300" />
                    </div>
                    <div className="space-y-2 bg-slate-50 rounded-[2rem] p-4 border-2 border-slate-100">
                       {statsLoading ? (
                          <div className="py-10 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></div>
                       ) : userTransactions.length > 0 ? (
                          userTransactions.map(t => (
                             <div key={t.id} className="p-4 bg-white rounded-2xl border border-slate-100 flex justify-between items-center group hover:border-primary/20 transition-all">
                                <div className="flex items-center gap-4">
                                   <div className={`p-2 rounded-lg ${t.type === 'DEPOSIT' ? 'bg-green-50 text-green-500' : t.type === 'WITHDRAWAL' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                                      {t.type === 'DEPOSIT' ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                                   </div>
                                   <div>
                                      <p className="font-black text-slate-800 text-xs tracking-tight">{t.description || t.type}</p>
                                      <p className="text-[9px] text-slate-400 font-bold uppercase">{new Date(t.createdAt).toLocaleString()}</p>
                                   </div>
                                </div>
                                <p className={`font-black text-sm ${t.type === 'DEPOSIT' ? 'text-green-600' : 'text-slate-800'}`}>
                                   {t.type === 'DEPOSIT' ? '+' : '-'} GHS {t.amount.toLocaleString()}
                                </p>
                             </div>
                          ))
                       ) : (
                          <div className="py-10 text-center text-slate-300 italic text-[10px] uppercase font-bold tracking-widest">No Recent Chain Evidence</div>
                       )}
                    </div>
                 </div>

                 <div className="p-8 bg-slate-900 rounded-[2rem] text-white">
                    <div className="flex items-center gap-4 mb-6">
                       <TrendingUp className="text-secondary" />
                       <h5 className="font-black uppercase italic tracking-tighter">System Reliability Score</h5>
                    </div>
                    <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden mb-2">
                       <div className="h-full bg-secondary w-[92%]"></div>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                       <span className="text-secondary">92% Operational</span>
                       <span>Tier 1 Node</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {toast && (
        <div className={`fixed top-8 right-8 z-[300] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 max-w-md ${
          toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'
        }`}>
          <Activity size={20} />
          <span className="font-bold text-sm">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 opacity-70 hover:opacity-100"><X size={16}/></button>
        </div>
      )}

       {showConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[500] flex items-center justify-center p-4 sm:p-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white max-w-md w-full rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 shadow-3xl text-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
               <AlertTriangle size={32}/>
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
    </Layout>
  );
};

export default AdminDashboard;
