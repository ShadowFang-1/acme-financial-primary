import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  Filter, 
  Download, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  History,
  TrendingUp,
  TrendingDown,
  Info
} from 'lucide-react';
import Layout from '../components/Layout';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await axios.get('/api/v1/banking/accounts');
        setAccounts(res.data);
        if (res.data.length > 0) {
          setSelectedAccount(res.data[0].accountNumber);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (selectedAccount) {
      const fetchTransactions = async () => {
        setLoading(true);
        try {
          const res = await axios.get(`/api/v1/banking/accounts/${selectedAccount}/transactions?page=${page}&size=10`);
          setTransactions(res.data.content || []);
          setTotalPages(res.data.totalPages || 0);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchTransactions();
    }
  }, [selectedAccount, page]);

  // Local filtering logic
  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = 
      (tx.description?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tx.type?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tx.amount?.toString().includes(searchTerm));
    
    const matchesFilter = filterType === 'ALL' || tx.type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) return;
    
    const headers = ['ID', 'Date', 'Description', 'Type', 'Amount (GHS)'];
    const csvRows = [
      headers.join(','),
      ...filteredTransactions.map(tx => [
        tx.id,
        new Date(tx.createdAt).toLocaleDateString(),
        `"${tx.description || ''}"`,
        tx.type,
        tx.amount
      ].join(','))
    ];
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `acme_ledger_${selectedAccount}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Layout 
      title="Transaction History" 
      subtitle="Detailed log of all your banking activities"
      hideSearch // Global search hidden as per request
      hideBell
    >
      <div className="mb-8 lg:mb-12 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-secondary text-primary rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg shadow-secondary/20 shrink-0">
              <History size={20} className="lg:size-6" />
           </div>
           <div>
              <h2 className="text-lg lg:text-xl font-black text-primary uppercase tracking-tighter italic">Activity History</h2>
              <p className="text-[9px] lg:text-[10px] text-slate-400 font-bold uppercase tracking-widest hidden sm:block">Full Transaction Log</p>
           </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExportCSV}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 lg:py-4 border-2 border-slate-100 rounded-2xl bg-white text-slate-700 hover:border-primary hover:text-primary transition-all font-black text-[10px] uppercase tracking-widest shadow-sm"
          >
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      <div className="card mb-8 sm:mb-12 border-none shadow-2xl shadow-slate-200/40 p-6 sm:p-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-6 items-end">
          <div className="lg:col-span-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Viewing Account</label>
            <select
              className="input-field bg-slate-50 border-2 border-transparent focus:border-primary font-bold text-slate-700"
              value={selectedAccount}
              onChange={(e) => {
                setSelectedAccount(e.target.value);
                setPage(0);
              }}
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.accountNumber}>
                  {acc.type} • {acc.accountNumber}
                </option>
              ))}
            </select>
          </div>
          
          <div className="lg:col-span-5 relative">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Local Search</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="text" 
                placeholder="Search remark..." 
                className="input-field pl-12 bg-slate-50 border-2 border-transparent focus:border-primary font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="sm:col-span-2 lg:col-span-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Type Filter</label>
            <select 
              className="input-field bg-slate-50 border-2 border-transparent focus:border-primary font-bold text-slate-700"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
               <option value="ALL">All Operations</option>
               <option value="TRANSFER">Transfers</option>
               <option value="DEPOSIT">Deposits</option>
               <option value="WITHDRAWAL">Withdrawals</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card !p-0 overflow-hidden shadow-2xl shadow-slate-200/50 border-none">
        {loading ? (
          <div className="p-20 text-center">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs tracking-widest">Compiling Records...</p>
          </div>
        ) : filteredTransactions.length > 0 ? (
          <div>
            {/* Desktop View (Table) */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Transaction / Remark</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Time & Date</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Category</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Value (GHS)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 bg-white">
                  {filteredTransactions.map(tx => {
                    const isDebit = tx.senderAccount?.accountNumber === selectedAccount;
                    const isWithDrawal = tx.type === 'WITHDRAWAL';
                    const isDeposit = tx.type === 'DEPOSIT';
                    
                    return (
                      <tr key={tx.id} className="hover:bg-slate-50/50 transition-all group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-5">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-transform group-hover:scale-110 duration-300 ${
                              isDeposit ? 'bg-green-500 text-white shadow-green-500/20' :
                              isWithDrawal ? 'bg-red-500 text-white shadow-red-500/20' :
                              isDebit ? 'bg-primary text-white shadow-primary/20' : 'bg-green-500 text-white shadow-green-500/20'
                            }`}>
                              {isDeposit ? <TrendingUp size={24} /> :
                               isWithDrawal ? <TrendingDown size={24} /> :
                               isDebit ? <ArrowUpRight size={24} /> : <ArrowDownLeft size={24} />}
                            </div>
                            <div>
                              <p className="font-black text-slate-900 group-hover:text-primary transition-colors text-lg tracking-tight">{tx.description || tx.type}</p>
                              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1 italic opacity-60">ID: TXN-{(tx.id + 10000).toString()}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <div className="bg-slate-50 inline-block px-4 py-2 rounded-2xl border border-slate-100">
                            <p className="font-black text-slate-800 text-xs">{new Date(tx.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">{new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 ${
                            isDeposit ? 'bg-green-50 text-green-700 border-green-100' :
                            isWithDrawal ? 'bg-red-50 text-red-700 border-red-100' :
                            isDebit ? 'bg-slate-50 text-slate-600 border-slate-100' : 'bg-green-50 text-green-700 border-green-100'
                          }`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <p className={`font-black text-xl font-outfit ${isDebit || isWithDrawal ? 'text-slate-900' : 'text-green-600'}`}>
                            {isDebit || isWithDrawal ? `- GHS ${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : `+ GHS ${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                          </p>
                          <p className="text-[9px] text-slate-300 font-black uppercase tracking-widest mt-1">Settled & Confirmed</p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile/Tablet View (Cards) */}
            <div className="lg:hidden divide-y divide-slate-100 bg-white">
              {filteredTransactions.map(tx => {
                 const isDebit = tx.senderAccount?.accountNumber === selectedAccount;
                 const isWithDrawal = tx.type === 'WITHDRAWAL';
                 const isDeposit = tx.type === 'DEPOSIT';
                 return (
                    <div key={tx.id} className="p-5 sm:p-6 flex flex-col gap-4">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                             <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${
                               isDeposit ? 'bg-green-500 text-white' :
                               isWithDrawal ? 'bg-red-500 text-white' :
                               isDebit ? 'bg-primary text-white' : 'bg-green-500 text-white'
                             }`}>
                               {isDeposit ? <TrendingUp size={20} /> :
                                isWithDrawal ? <TrendingDown size={20} /> :
                                isDebit ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                             </div>
                             <div>
                                <p className="font-black text-slate-900 text-base tracking-tight">{tx.description || tx.type}</p>
                                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest italic">{new Date(tx.createdAt).toLocaleDateString()} • {new Date(tx.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                             </div>
                          </div>
                          <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${
                            isDeposit ? 'bg-green-50 text-green-700 border-green-200' :
                            isWithDrawal ? 'bg-red-50 text-red-700 border-red-200' :
                            isDebit ? 'bg-slate-50 text-slate-600 border-slate-200' : 'bg-green-50 text-green-700 border-green-200'
                          }`}>
                            {tx.type}
                          </span>
                       </div>
                       <div className="flex justify-between items-end bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                          <div>
                             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Reference</p>
                             <p className="text-[10px] font-mono font-black text-slate-600">TXN-{(tx.id + 10000).toString()}</p>
                          </div>
                          <div className="text-right">
                             <p className={`font-black text-lg font-outfit ${isDebit || isWithDrawal ? 'text-slate-900' : 'text-green-600'}`}>
                                {isDebit || isWithDrawal ? `- GHS ${tx.amount.toLocaleString()}` : `+ GHS ${tx.amount.toLocaleString()}`}
                             </p>
                          </div>
                       </div>
                    </div>
                 );
              })}
            </div>
          </div>
        ) : (
          <div className="p-24 text-center">
            <div className="w-24 h-24 rounded-[2.5rem] bg-slate-50 flex items-center justify-center mx-auto mb-8 shadow-inner">
               {searchTerm ? <Search size={48} className="text-slate-200" /> : <History size={48} className="text-slate-200" />}
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-3 font-outfit uppercase tracking-tighter">
               {searchTerm ? "No Matches Found" : "Ledger is Empty"}
            </h3>
            <p className="text-slate-500 max-w-sm mx-auto font-medium">
               {searchTerm ? "We couldn't find any transactions matching your current search criteria. Try a different amount or description." : "Start exploring ACME's features to populate your history with secure transaction logs."}
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && !searchTerm && (
          <div className="px-6 p:8 lg:px-12 lg:py-8 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
            <span className="text-[9px] lg:text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] text-center sm:text-left">Observation Block <span className="text-primary">{page + 1}</span> of {totalPages}</span>
            <div className="flex gap-4 w-full sm:w-auto">
              <button 
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="flex-1 sm:flex-none flex items-center justify-center p-3 lg:p-4 rounded-2xl border-2 border-transparent bg-white text-slate-600 disabled:opacity-30 hover:border-primary hover:text-primary transition-all shadow-xl shadow-slate-200/50 group"
              >
                <ChevronLeft size={20} className="lg:size-6 lg:group-hover:-translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
                className="flex-1 sm:flex-none flex items-center justify-center p-3 lg:p-4 rounded-2xl border-2 border-transparent bg-white text-slate-600 disabled:opacity-30 hover:border-primary hover:text-primary transition-all shadow-xl shadow-slate-200/50 group"
              >
                <ChevronRight size={20} className="lg:size-6 lg:group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Transactions;
