import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Inbox, 
  CheckCircle2, 
  Trash2, 
  Info, 
  AlertCircle,
  Bell,
  Clock,
  ArrowRight
} from 'lucide-react';
import Layout from '../components/Layout';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotif, setSelectedNotif] = useState(null);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/api/v1/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllRead = async () => {
    try {
      await axios.post('/api/v1/notifications/read-all');
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const markRead = async (id) => {
    try {
      await axios.post(`/api/v1/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotifClick = (notif) => {
    setSelectedNotif(notif);
    if (!notif.read) {
      markRead(notif.id);
    }
  };

  return (
    <Layout 
      title="Notifications & Activity" 
      subtitle="Real-time alerts and flags for your account transactions"
      hideSearch
      hideBell
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center mb-8">
           <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20">
                 <Inbox size={24} />
              </div>
              <h2 className="text-2xl font-black text-primary tracking-tighter uppercase">Recent Alerts</h2>
           </div>
           {notifications.length > 0 && (
             <button 
               onClick={markAllRead}
               className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-slate-100 rounded-2xl text-slate-500 font-black text-xs uppercase tracking-widest hover:border-primary hover:text-primary transition-all shadow-sm"
             >
                <CheckCircle2 size={16} /> Mark All as Read
             </button>
           )}
        </div>

        {loading ? (
          <div className="card p-20 text-center border-none shadow-2xl shadow-slate-200/50">
             <div className="animate-spin inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
             <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Accessing Secure Logs...</p>
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-4">
             {notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  onClick={() => handleNotifClick(notif)}
                  className={`card relative overflow-hidden flex items-start gap-6 transition-all border-none shadow-xl hover:scale-[1.01] hover:shadow-2xl cursor-pointer active:scale-[0.99] ${
                    !notif.read ? 'bg-white ring-2 ring-primary/5' : 'bg-slate-50/50 opacity-80'
                  }`}
                >
                   {!notif.read && (
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-primary"></div>
                   )}
                   <div className={`w-14 h-14 rounded-3xl flex items-center justify-center shrink-0 shadow-lg ${
                      notif.title.includes('Received') ? 'bg-green-500 text-white' : 
                      notif.title.includes('Sent') ? 'bg-primary text-white' : 'bg-blue-500 text-white'
                   }`}>
                      {notif.title.includes('Successful') ? <CheckCircle2 size={24} /> : <Info size={24} />}
                   </div>
                   <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                         <h4 className={`text-lg font-black tracking-tight ${!notif.read ? 'text-primary' : 'text-slate-700'}`}>
                           {notif.title}
                         </h4>
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-1">
                            <Clock size={12} /> {new Date(notif.createdAt).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                         </span>
                      </div>
                      <p className="text-slate-500 font-medium line-clamp-2">{notif.message}</p>
                   </div>
                </div>
             ))}
          </div>
        ) : (
          <div className="card p-24 text-center border-none shadow-2xl shadow-slate-200/50">
             <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                <Inbox size={48} className="text-slate-200" />
             </div>
             <h3 className="text-2xl font-black text-slate-800 mb-2 font-outfit uppercase tracking-tighter">Your Inbox is Calm</h3>
             <p className="text-slate-500 max-w-sm mx-auto font-medium">Any new activity or transaction flags will appear here in real-time. Stay secure with ACME.</p>
          </div>
        )}

        {/* DETAIL POPUP MODAL */}
        {selectedNotif && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
              <div className={`p-10 text-center ${
                selectedNotif.title.includes('Received') ? 'bg-green-50' : 
                selectedNotif.title.includes('Sent') ? 'bg-blue-50' : 'bg-slate-50'
              }`}>
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ${
                   selectedNotif.title.includes('Received') ? 'bg-green-500 text-white' : 
                   selectedNotif.title.includes('Sent') ? 'bg-primary text-white' : 'bg-secondary text-primary'
                }`}>
                   {selectedNotif.title.includes('Successful') ? <CheckCircle2 size={40} /> : <Bell size={40} />}
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">{selectedNotif.title}</h3>
                <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.3em]">ACME Secure Flag</p>
              </div>
              
              <div className="p-10 space-y-8">
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                   <p className="text-slate-600 font-medium text-lg leading-relaxed text-center italic">
                     "{selectedNotif.message}"
                   </p>
                </div>

                <div className="flex items-center justify-between py-4 border-y border-slate-50">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock size={16} />
                    <span className="text-xs font-bold font-mono tracking-tighter">
                      {new Date(selectedNotif.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="px-3 py-1 bg-primary/5 text-primary text-[10px] font-black rounded-lg uppercase tracking-widest flex items-center gap-1">
                    <CheckCircle2 size={12} /> Verified
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedNotif(null)}
                  className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-[0.98]"
                >
                  Confirm & Clear
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Notifications;
