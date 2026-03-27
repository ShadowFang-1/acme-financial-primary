import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Send, 
  History, 
  User, 
  LogOut, 
  Shield,
  Bell,
  Search,
  ChevronRight,
  Clock,
  Info,
  CheckCircle2,
  AlertTriangle,
  Inbox,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  MoreHorizontal,
  BarChart3,
  Users2,
  TrendingUp
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import Logo from './Logo';

const SidebarLink = ({ to, icon: Icon, label, active, badge }) => (
  <Link
    to={to}
    className={`flex items-center justify-between px-6 py-4 rounded-2xl transition-all duration-300 group shrink-0 ${
      active 
        ? 'bg-secondary text-primary font-bold shadow-xl shadow-secondary/20 scale-[1.02]' 
        : 'text-slate-400 hover:bg-white/5 hover:text-white'
    }`}
  >
    <div className="flex items-center gap-4">
      <Icon size={22} className={active ? 'text-primary' : 'group-hover:text-secondary transition-colors'} />
      <span className="font-semibold tracking-tight">{label}</span>
    </div>
    <div className="flex items-center gap-2">
      {badge > 0 && (
         <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${active ? 'bg-primary text-white' : 'bg-red-500 text-white animate-pulse'}`}>
            {badge}
         </span>
      )}
      {active && <ChevronRight size={18} />}
    </div>
  </Link>
);

const Layout = ({ children, title, subtitle, searchValue, onSearchChange, hideSearch, hideBell }) => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [sidebarIndex, setSidebarIndex] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notificationRef = useRef(null);

  const userMenuItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/hub', icon: TrendingUp, label: 'Financial Hub' },
    { to: '/transfer', icon: Send, label: 'Transfer' },
    { to: '/transactions', icon: History, label: 'History' },
    { to: '/notifications', icon: Inbox, label: 'Notifications', badge: true },
    { to: '/profile', icon: User, label: 'My Profile' }
  ];

  const adminMenuItems = [
    { to: '/admin', icon: Users2, label: 'User Management' },
    { to: '/admin/stats', icon: BarChart3, label: 'Statistics' }
  ];

  const menuItems = user?.role === 'ADMIN' ? adminMenuItems : userMenuItems;

  const visibleItems = menuItems.slice(sidebarIndex, sidebarIndex + 4);

  const fetchUnread = async () => {
    try {
      const resCount = await axios.get('/api/v1/notifications/unread-count');
      setUnreadCount(resCount.data);
      if (showNotifications) {
         const resList = await axios.get('/api/v1/notifications');
         setNotifications(resList.data.slice(0, 5));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    try {
      await axios.post('/api/v1/notifications/read-all');
      fetchUnread();
    } catch (err) {
      console.error(err);
    }
  };

  const markRead = async (id) => {
    try {
      await axios.post(`/api/v1/notifications/${id}/read`);
      fetchUnread();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 10000);
    return () => clearInterval(interval);
  }, [showNotifications]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const SidebarContent = () => (
    <>
      <Link to="/" className="mb-12 lg:mb-16 block hover:opacity-80 transition-opacity">
        <Logo iconSize={22} textColor="text-white" />
      </Link>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-4 px-6 shrink-0">Main Menu</div>
        
        {/* Navigation - No longer paginated, now scrollable for better UX */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="flex flex-col gap-3 pb-8 animate-in fade-in slide-in-from-bottom-2">
            {menuItems.map((item) => (
              <SidebarLink 
                key={item.to}
                to={item.to} 
                icon={item.icon} 
                label={item.label} 
                active={location.pathname === item.to}
                badge={item.badge && user?.pushNotifications ? unreadCount : 0}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-auto pt-8 border-t border-white/10 shrink-0">
        <div className="bg-white/5 rounded-3xl p-6 mb-6 group hover:bg-white/10 transition-colors">
          <Link to="/profile" className="flex items-center gap-4 mb-4 group/profile">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-secondary to-amber-300 flex items-center justify-center text-primary font-black text-xl group-hover/profile:scale-105 transition-transform shadow-xl shadow-secondary/10 overflow-hidden shrink-0">
              {user?.imageUrl ? (
                <img src={user.imageUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                user?.username?.[0]?.toUpperCase() 
              )}
            </div>
            <div className="overflow-hidden">
              <p className="font-extrabold truncate group-hover/profile:text-secondary transition-colors text-sm uppercase tracking-tight">{user?.username || 'User Account'}</p>
              <p className="text-[9px] text-slate-400 truncate opacity-60 uppercase font-black tracking-widest group-hover/profile:opacity-100 transition-opacity">{user?.role} ACCESS</p>
            </div>
          </Link>
          <button onClick={logout} className="flex items-center gap-3 w-full py-3 px-4 rounded-xl text-red-100 font-bold bg-red-500/20 hover:bg-red-500/30 transition-all group/btn">
            <LogOut size={18} className="group-hover/btn:-translate-x-1 transition-transform shrink-0" />
            <span className="text-sm font-black uppercase tracking-widest">Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-inter overflow-x-hidden">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`w-72 lg:w-80 bg-primary text-white flex flex-col p-8 fixed inset-y-0 z-[70] shadow-[10px_0_60px_rgba(0,0,0,0.1)] transition-transform duration-500 lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full lg:ml-80 min-h-screen flex flex-col pb-24 lg:pb-0">
        {/* Mobile Header - Minimalist Profile Access */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-primary text-white sticky top-0 z-[50]">
          <Link to="/" className="opacity-80 hover:opacity-100 transition-opacity">
             <Logo iconSize={18} textColor="text-white" hideTextOnMobile />
          </Link>
          <div className="flex items-center gap-3">
             {!hideBell && unreadCount > 0 && user?.pushNotifications && (
               <Link to="/notifications" className="relative p-2 bg-white/10 rounded-xl">
                  <Bell size={18} />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-primary"></span>
               </Link>
             )}
             
             {/* Profile Quick Access */}
             <div className="relative" ref={notificationRef}>
                <button 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="w-10 h-10 rounded-full bg-gradient-to-tr from-secondary to-amber-300 flex items-center justify-center text-primary font-black text-xs shadow-lg border-2 border-white/20 active:scale-95 transition-all overflow-hidden"
                >
                  {user?.imageUrl ? (
                    <img src={user.imageUrl} alt="P" className="w-full h-full object-cover" />
                  ) : (
                    user?.username?.[0]?.toUpperCase() 
                  )}
                </button>
                
                {isMobileMenuOpen && (
                  <div className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-[100] animate-in slide-in-from-top-2">
                    <div className="px-4 py-3 border-b border-slate-50 mb-1">
                      <p className="font-black text-[10px] text-slate-400 uppercase tracking-widest leading-none mb-1">Signed in as</p>
                      <p className="font-bold text-slate-900 text-xs truncate">{user?.username}</p>
                    </div>
                    <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-[11px] font-black text-slate-600 hover:bg-slate-50 uppercase tracking-widest transition-colors">
                      <User size={14} /> My Profile
                    </Link>
                    <button onClick={logout} className="flex items-center gap-3 px-4 py-2.5 text-[11px] font-black text-red-500 hover:bg-red-50 uppercase tracking-widest w-full text-left transition-colors">
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                )}
             </div>
          </div>
        </div>

        <div className="flex-1 p-4 sm:p-6 lg:p-12 max-w-7xl mx-auto w-full">
          <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6 mb-8 lg:mb-12">
            <div className="animate-in slide-in-from-left-4 duration-700">
              <h1 className="text-3xl lg:text-4xl font-black text-primary mb-1 tracking-tighter uppercase italic">{title}</h1>
              <p className="text-slate-400 text-sm font-bold uppercase tracking-widest opacity-60 font-inter">{subtitle}</p>
            </div>
            
            <div className="flex items-center gap-3 sm:gap-6">
              {!hideSearch && (
                <div className="relative group flex-1 sm:flex-none">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                    <input 
                      placeholder="Search Intelligence..." 
                      className="bg-white border-2 border-slate-100 rounded-2xl pl-12 pr-6 py-3 lg:py-4 outline-none focus:border-primary w-full sm:w-64 lg:w-72 shadow-sm transition-all text-sm font-semibold hover:border-slate-200"
                      value={searchValue || ''}
                      onChange={(e) => onSearchChange?.(e.target.value)}
                    />
                  </div>
                  <p className="hidden lg:block absolute top-full left-4 mt-2 text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-0 group-focus-within:opacity-100 transition-opacity">
                    Remarks • Accounts • Values
                  </p>
                </div>
              )}
              
              {!hideBell && user?.role !== 'ADMIN' && (
                <div className="relative flex-shrink-0" ref={notificationRef}>
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className={`relative p-3 lg:p-4 rounded-2xl border-2 transition-all shadow-sm group ${
                      showNotifications ? 'bg-primary text-white border-primary' : 'bg-white text-slate-400 border-slate-100 hover:text-primary hover:border-primary'
                    }`}
                  >
                    <Bell size={20} className="lg:size-[22px]" />
                    {unreadCount > 0 && user?.pushNotifications && (
                       <span className={`absolute top-3 right-3 lg:top-4 lg:right-4 w-2 h-2 lg:w-2.5 lg:h-2.5 bg-red-500 rounded-full border-2 border-white ${showNotifications ? 'hidden' : ''}`}></span>
                    )}
                  </button>

                  {/* Notifications Dropdown (Responsive) */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-4 w-[calc(100vw-2rem)] sm:w-[400px] bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.1)] border border-slate-100 z-[100] animate-in slide-in-from-top-4 duration-300 overflow-hidden">
                      <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                        <h4 className="font-black text-lg text-primary tracking-tighter uppercase italic">Notifications</h4>
                        {unreadCount > 0 && user?.pushNotifications && (
                           <span className="px-2 py-0.5 bg-red-500 text-white text-[9px] font-black rounded-lg animate-pulse">{unreadCount} NEW FLAG</span>
                        )}
                      </div>
                      <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-black text-xs uppercase tracking-widest text-slate-800">Recent Alerts</h3>
                    <button onClick={markAllRead} className="text-[10px] font-black text-primary uppercase hover:opacity-70 transition-opacity">Mark All</button>
                  </div>
                  <div className="max-h-[400px] lg:max-h-[450px] overflow-y-auto custom-scrollbar">
                    {notifications.length > 0 ? (
                      <div className="divide-y divide-slate-100">
                        {notifications.map((notif) => (
                          <div key={notif.id} className={`p-4 lg:p-5 flex items-start gap-4 hover:bg-slate-50 transition-colors group relative ${!notif.read ? 'bg-white' : 'bg-slate-50/30'}`}>
                            <div className={`w-9 h-9 lg:w-10 lg:h-10 rounded-xl lg:rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                               notif.title.includes('Received') ? 'bg-green-100 text-green-600' : 
                               notif.title.includes('Sent') ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'
                            }`}>
                               <Bell size={16} className="lg:size-[18px]" />
                            </div>
                            <div className="flex-1">
                              <p className={`text-xs lg:text-sm font-black mb-0.5 ${!notif.read ? 'text-slate-900' : 'text-slate-500'}`}>{notif.title}</p>
                              <p className="text-[10px] lg:text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-1 lg:mb-2">{notif.message}</p>
                              <span className="text-[8px] lg:text-[9px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-1">
                                 <Clock size={8} className="lg:size-[10px]" /> {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            {!notif.read && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); markRead(notif.id); }}
                                className="p-2 bg-slate-100 text-slate-400 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-primary hover:text-white transition-all shadow-sm"
                                title="Mark as Read"
                              >
                                <CheckCircle2 size={12} className="lg:size-[14px]" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                       <div className="p-10 lg:p-16 text-center">
                          <Inbox className="mx-auto text-slate-200 mb-4" size={48} />
                          <p className="text-slate-400 font-black text-[9px] lg:text-[10px] uppercase tracking-[0.2em]">Channel Secure & Clear</p>
                       </div>
                    )}
                  </div>
                      <div className="p-4 bg-slate-50 text-center">
                         <Link to="/notifications" onClick={() => setShowNotifications(false)} className="text-[9px] lg:text-[10px] font-black text-primary uppercase tracking-[0.2em] hover:opacity-70 transition-opacity flex items-center justify-center gap-2">View Transaction Log <ChevronRight size={14} /></Link>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </header>

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {children}
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation - Centered Dashboard */}
      <nav className="lg:hidden fixed bottom-1 left-0 right-0 px-4 py-2 z-[80] animate-in slide-in-from-bottom-4">
         <div className="bg-white/95 backdrop-blur-md border border-slate-200/50 rounded-[2rem] px-6 py-3 flex items-center justify-between shadow-[0_10px_40px_rgba(0,0,0,0.1)]">
            {(() => {
               // Reorder: Hub, Transfer, Dashboard, History, Notifications
               const orderedItems = [
                  userMenuItems[1], // Hub
                  userMenuItems[2], // Transfer
                  userMenuItems[0], // Dashboard (Middle)
                  userMenuItems[3], // History
                  userMenuItems[4]  // Notifications
               ];
               
               return orderedItems.map((item, index) => {
                  const active = location.pathname === item.to;
                  const isMain = index === 2; // Dashboard
                  
                  return (
                     <Link key={item.to} to={item.to} className={`flex flex-col items-center transition-all ${active ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}`}>
                        <div className={`p-2 rounded-2xl transition-all duration-300 ${
                           isMain 
                              ? (active ? 'bg-primary text-secondary -translate-y-4 scale-125 shadow-xl shadow-primary/20 border-4 border-slate-50' : 'bg-primary/10 text-primary -translate-y-2') 
                              : (active ? 'bg-secondary text-primary shadow-lg shadow-secondary/10' : 'bg-transparent')
                        }`}>
                           <item.icon size={isMain ? 24 : 20} />
                        </div>
                        {!isMain && <span className={`text-[8px] font-black uppercase tracking-[0.1em] mt-1 transition-opacity ${active ? 'opacity-100' : 'opacity-0'}`}>{item.label.split(' ')[0]}</span>}
                        {isMain && active && <span className="text-[7px] font-black uppercase tracking-[0.2em] transform -translate-y-2 text-primary">Live</span>}
                     </Link>
                  );
               });
            })()}
         </div>
      </nav>
    </div>
  );
};

export default Layout;
