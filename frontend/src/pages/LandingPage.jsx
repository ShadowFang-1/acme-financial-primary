import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  ChevronRight, 
  ArrowRight, 
  CreditCard, 
  Globe, 
  Lock, 
  Users, 
  Mail, 
  Phone, 
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Rocket,
  Target,
  Zap,
  Landmark,
  User
} from 'lucide-react';
import Logo from '../components/Logo';


const Nav = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-xl border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Logo />
        <div className="hidden lg:flex items-center gap-10">
          <a href="#about" className="font-semibold text-slate-600 hover:text-primary transition-colors">About Us</a>
          <a href="#team" className="font-semibold text-slate-600 hover:text-primary transition-colors">Our Team</a>
          <a href="#mission" className="font-semibold text-slate-600 hover:text-primary transition-colors">Mission</a>
          <a href="#contact" className="font-semibold text-slate-600 hover:text-primary transition-colors">Contact</a>
        </div>
        <div className="hidden lg:flex items-center gap-4">
          <Link to="/login" className="px-6 py-2.5 rounded-xl font-bold text-primary hover:bg-slate-50 transition-all border border-transparent">Log In</Link>
          <Link to="/register" className="btn-secondary">Open Account</Link>
        </div>
        
        {/* Mobile Toggle */}
        <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden p-2 text-primary hover:bg-slate-50 rounded-xl transition-all">
          <Zap size={24} className={isOpen ? 'rotate-90 text-secondary' : ''} />
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-white border-b border-slate-100 p-6 space-y-4 animate-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col gap-4">
            <a href="#about" onClick={() => setIsOpen(false)} className="px-4 py-2 font-black text-slate-800 uppercase tracking-widest text-xs">About Us</a>
            <a href="#team" onClick={() => setIsOpen(false)} className="px-4 py-2 font-black text-slate-800 uppercase tracking-widest text-xs">Our Team</a>
            <a href="#mission" onClick={() => setIsOpen(false)} className="px-4 py-2 font-black text-slate-800 uppercase tracking-widest text-xs">Mission</a>
            <a href="#contact" onClick={() => setIsOpen(false)} className="px-4 py-2 font-black text-slate-800 uppercase tracking-widest text-xs">Contact</a>
            <div className="h-px bg-slate-100 my-2"></div>
            <Link to="/login" className="px-4 py-4 rounded-xl font-black text-primary text-xs uppercase tracking-widest text-center border-2 border-primary">Log In</Link>
            <Link to="/register" className="btn-secondary py-4 text-xs uppercase tracking-widest text-center">Open Account</Link>
          </div>
        </div>
      )}
    </nav>
  );
};

const Hero = () => (
  <section className="relative pt-32 pb-20 overflow-hidden min-h-[95vh] flex items-center bg-[#f8fafc]">
    <div className="absolute inset-0 z-0 text-slate-100">
      <div className="absolute top-0 right-0 w-full h-[800px] opacity-25 bg-[url('https://images.unsplash.com/photo-1639762681485-074b7f938ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2832&q=80')] bg-cover bg-center"></div>
      <div className="absolute top-0 right-0 w-[400px] sm:w-[800px] h-[400px] sm:h-[800px] bg-secondary/10 blur-[100px] sm:blur-[150px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-primary/5 blur-[100px] sm:blur-[150px] rounded-full -translate-x-1/2 translate-y-1/2"></div>
    </div>
    
    <div className="max-w-7xl mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
      <div className="animate-slide-left text-center lg:text-left">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 text-secondary font-black text-[10px] sm:text-xs tracking-widest mb-6 lg:mb-8 mx-auto lg:mx-0 uppercase">
          <Shield size={16} /> SECURE & TRUSTED BANKING
        </div>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black font-poppins leading-[1.1] mb-6 lg:mb-8 text-primary tracking-tighter italic">
          Banking for the <br className="hidden sm:block" /> <span className="text-gradient">Future Generation.</span>
        </h1>
        <p className="text-base sm:text-lg lg:text-xl text-slate-600 mb-8 lg:mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0">
          Experience seamless, digital-first banking with ACME FINANCIAL. Manage your wealth, transfer globally, and grow your savings with our state-of-the-art platform.
        </p>
        <div className="flex flex-col sm:flex-row flex-wrap justify-center lg:justify-start gap-4">
          <Link to="/register" className="btn-primary py-4 px-8 text-sm sm:text-lg uppercase tracking-widest font-black">
            Get Started Now <ArrowRight size={20} className="hidden sm:block" />
          </Link>
        </div>
      </div>
      
      <div className="relative animate-slide-right mt-12 lg:mt-0">
        <div className="relative z-10 card aspect-video bg-gradient-to-br from-primary to-primary-light flex items-center justify-center p-0 overflow-hidden shadow-2xl animate-float rounded-[2rem] sm:rounded-[4rem]">
          <img 
            src="https://images.unsplash.com/photo-1563986768609-322da13575f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80" 
            className="w-full h-full object-cover opacity-60 mix-blend-overlay" 
            alt="Hero Graphic" 
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white scale-75 sm:scale-100">
            <Landmark size={80} className="text-secondary mb-4" />
            <p className="font-black text-2xl sm:text-4xl tracking-[0.3em] uppercase italic drop-shadow-2xl">ACME CORE</p>
            <div className="mt-2 w-32 h-1 bg-secondary rounded-full"></div>
          </div>
          <div className="absolute top-4 right-4 sm:top-8 sm:right-8 bg-white/10 border border-white/20 p-4 rounded-3xl backdrop-blur-xl hidden sm:block">
             <div className="w-12 h-2 bg-secondary rounded-full mb-2 shadow-lg"></div>
             <div className="w-8 h-2 bg-white/30 rounded-full"></div>
          </div>
        </div>
        <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-secondary rounded-[3rem] -z-10 blur-2xl opacity-30 hidden sm:block"></div>
      </div>
    </div>
  </section>
);


const Team = () => (
  <section id="team" className="py-24 bg-slate-50">
    <div className="max-w-7xl mx-auto px-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8 text-center md:text-left">
        <div className="max-w-2xl">
            <h1 className="text-5xl md:text-7xl lg:text-[6rem] font-black leading-[0.9] text-primary mb-8 tracking-tighter italic animate-in slide-in-from-left-4 duration-700">
              ACME <br />
              <span className="text-secondary">FINANCIAL</span> <br />
              SYSTEMS.
            </h1>
            <p className="text-lg md:text-xl text-slate-500 max-w-xl font-medium leading-relaxed mb-10 animate-in slide-in-from-left-4 duration-1000">
              Institutional wealth management for the next generation of financial pioneers. 
              The ACME Engine powers high-velocity capital operations worldwide.
            </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
        {[
          { name: "Samuel Obeng", role: "Chief Executive Officer", bio: "Sam is a visionary leader with an intense focus on digital sovereignty and inclusive capital.", img: "https://images.unsplash.com/photo-1531384441138-203d9ef0cb05?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80" },
          { name: "Amina Mensah", role: "Head of Operations", bio: "Amina ensures our systems run with military precision and world-class customer excellence.", img: "https://images.unsplash.com/photo-1531123414780-f74242c2b052?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80" },
          { name: "David Tetteh", role: "Chief Technology Officer", bio: "David leads our engineering team, architecting the most secure digital banking infrastructure on the continent.", img: "https://images.unsplash.com/photo-1506272517358-ee351decf626?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80" }
        ].map((member, i) => (
          <div key={i} className="group">
            <div className="relative overflow-hidden rounded-[2.5rem] lg:rounded-[50px] mb-8 h-[400px] lg:h-[450px] bg-slate-200">
              <img 
                src={member.img} 
                className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" 
                alt={member.name} 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute inset-x-0 bottom-0 p-6 lg:p-8 glass m-4 rounded-[2rem] translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                <p className="text-xs lg:text-sm text-slate-600 leading-relaxed font-bold italic tracking-tight">"{member.bio}"</p>
              </div>
            </div>
            <h3 className="text-2xl lg:text-3xl font-black text-primary tracking-tighter italic uppercase">{member.name}</h3>
            <div className="flex items-center gap-3 mt-1">
              <div className="w-8 h-1 bg-secondary rounded-full"></div>
              <p className="text-secondary font-black tracking-[0.2em] text-[10px] sm:text-xs uppercase">{member.role}</p>
            </div>
          </div>
        ))}


      </div>
    </div>
  </section>
);



const Mission = () => (
  <section id="mission" className="py-24 bg-primary text-white overflow-hidden relative">
    <div className="absolute top-0 right-0 w-[400px] sm:w-[800px] h-[400px] sm:h-[800px] bg-secondary/10 blur-[100px] sm:blur-[150px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
    <div className="max-w-7xl mx-auto px-6 relative z-10">
      <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        <div>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black mb-10 leading-tight tracking-tighter italic">Our Mission & <br className="hidden sm:block" /><span className="text-secondary">Way Forward</span></h2>
          <div className="space-y-10">
            {[
              { icon: Target, title: "Financial Inclusion", desc: "Our goal is to bring secure, affordable banking to every corner of the globe, breaking down the barriers of traditional finance." },
              { icon: Rocket, title: "Constant Innovation", desc: "We are committed to iterating our platform daily, ensuring we always offer the best tools and security in the market." }
            ].map((item, i) => (
              <div key={i} className="flex flex-col sm:flex-row gap-6 text-center sm:text-left items-center sm:items-start">
                <div className="w-14 h-14 shrink-0 rounded-2xl bg-white/10 flex items-center justify-center text-secondary border border-white/5">
                  <item.icon size={28} />
                </div>
                <div>
                  <h3 className="text-xl lg:text-2xl font-black mb-3 italic tracking-tight">{item.title}</h3>
                  <p className="text-slate-400 leading-relaxed text-base lg:text-lg font-medium">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card bg-white/5 border-white/10 backdrop-blur-sm p-8 sm:p-12 rounded-[2rem] sm:rounded-[3rem]">
          <h3 className="text-2xl sm:text-3xl font-black mb-8 tracking-tight uppercase italic text-secondary">Strategic Roadmap 2026</h3>
          <div className="space-y-8">
            {[
              { year: "Q1 2026", goal: "Expansion into East African markets" },
              { year: "Q2 2026", goal: "Launch of AI-driven wealth management" },
              { year: "Q3 2026", goal: "Crypto-fiat bridge integration" },
              { year: "Q4 2026", goal: "Carbon neutral infrastructure achievement" }
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-6 group">
                <div className="w-2.5 h-2.5 rounded-full bg-secondary group-hover:scale-150 transition-transform shrink-0"></div>
                <div>
                  <p className="text-secondary font-black text-[10px] uppercase tracking-widest">{step.year}</p>
                  <p className="text-lg lg:text-xl font-black tracking-tight">{step.goal}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer id="contact" className="bg-white pt-24 pb-12 border-t border-slate-100">
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 mb-20 text-center sm:text-left">
        <div className="col-span-1 lg:col-span-1 border-b sm:border-b-0 border-slate-50 pb-12 sm:pb-0">
          <div className="flex justify-center sm:justify-start">
             <Logo className="mb-8" />
          </div>
          <p className="text-slate-500 leading-relaxed mb-8 font-medium">
            Empowering your financial journey with technology you can trust and a team that cares.
          </p>
          <div className="flex justify-center sm:justify-start gap-4">
            {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
              <a key={i} href="https://linkedin.com/company/acme-financial-hub" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white hover:border-primary transition-all">
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="font-black text-primary mb-6 lg:mb-8 uppercase tracking-[0.2em] text-[10px] sm:text-xs">Intelligence Products</h4>
          <ul className="space-y-4 text-slate-500 font-bold text-xs uppercase tracking-tight">
            <li><a href="#about" className="hover:text-primary transition-colors">Digital Banking</a></li>
            <li><a href="#mission" className="hover:text-primary transition-colors">Global Transfers</a></li>
            <li><a href="#about" className="hover:text-primary transition-colors">Wealth Management</a></li>
            <li><a href="#mission" className="hover:text-primary transition-colors">Business Accounts</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-black text-primary mb-6 lg:mb-8 uppercase tracking-[0.2em] text-[10px] sm:text-xs">The Collective</h4>
          <ul className="space-y-4 text-slate-500 font-bold text-xs uppercase tracking-tight">
            <li><a href="#about" className="hover:text-primary transition-colors">About Us</a></li>
            <li><a href="#team" className="hover:text-primary transition-colors">Careers</a></li>
            <li><a href="#mission" className="hover:text-primary transition-colors">Legal & Privacy</a></li>
            <li><Link to="/register" className="hover:text-primary transition-colors">Contact Us</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-black text-primary mb-6 lg:mb-8 uppercase tracking-[0.2em] text-[10px] sm:text-xs">Signal Source</h4>
          <ul className="space-y-6 text-slate-500 font-bold text-xs uppercase tracking-tight">
            <li className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4">
              <MapPin size={18} className="text-secondary shrink-0" />
              <span>Financial District, Floor 22,<br className="hidden sm:block" /> Accra, Ghana</span>
            </li>
            <li className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4">
              <Phone size={18} className="text-secondary shrink-0" />
              <span>+233 59 234 2323</span>
            </li>
            <li className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4">
              <Mail size={18} className="text-secondary shrink-0" />
              <span className="truncate max-w-full"><a href="mailto:hello@acmefinancial.com">hello@acmefinancial.com</a></span>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="border-t border-slate-100 pt-12 flex flex-col md:flex-row justify-between items-center gap-8">
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest text-center">© 2026 ACME Financial Systems. All rights reserved.</p>
        <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-slate-400">
          <a href="#mission" className="hover:text-primary transition-colors">Policy</a>
          <a href="#mission" className="hover:text-primary transition-colors">Terms</a>
          <a href="#mission" className="hover:text-primary transition-colors">Cookies</a>
        </div>
      </div>
    </div>
  </footer>
);

const About = () => (
  <section id="about" className="py-24 border-b border-slate-100 overflow-hidden">
    <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
       <div className="relative animate-in fade-in slide-in-from-left-8 duration-1000">
          <div className="absolute top-0 left-0 w-64 h-64 bg-secondary/20 blur-[100px] rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <p className="text-[10px] font-black text-secondary uppercase tracking-[0.4em] mb-4 italic">The ACME Standard</p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-primary mb-8 tracking-tighter leading-tight italic">
            Defining the <span className="text-gradient">Next Era</span> of Capital Management.
          </h2>
          <div className="space-y-6 text-slate-600 font-medium text-lg leading-relaxed">
            <p>
              ACME Financial Systems was born from a singular vision: to unify institutional-grade security with the agility of digital-native finance. We provide our partners with a hardened, scalable foundation for wealth orchestration.
            </p>
            <p>
              Our platform is more than just a ledger; it is an intelligence layer that optimizes liquidity, automates allocation, and secures the future of sovereign capital for individuals and enterprises alike.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 mt-12 bg-white p-8 rounded-[2.5rem] border-2 border-slate-50 shadow-sm relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full translate-x-1/2 -translate-y-1/2 transition-transform group-hover:scale-150 duration-700"></div>
             <div>
                <p className="text-3xl font-black text-primary mb-1">99.9%</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Integrity</p>
             </div>
             <div>
                <p className="text-3xl font-black text-primary mb-1">256-bit</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">End-to-End Vaulting</p>
             </div>
          </div>
       </div>

       <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-right-8 duration-1000">
          <div className="space-y-4">
             <div className="h-48 bg-slate-900 rounded-3xl p-8 flex flex-col justify-end text-white relative overflow-hidden group">
                <Globe className="absolute top-6 right-6 text-secondary/40 group-hover:scale-125 transition-transform" size={40} />
                <p className="font-black text-xs uppercase tracking-widest">Global Reach</p>
                <p className="text-[10px] text-slate-400">140+ Corridors</p>
             </div>
             <div className="h-64 bg-secondary rounded-3xl p-8 flex flex-col justify-end text-primary relative overflow-hidden group">
                <Lock className="absolute top-6 right-6 text-primary/20 group-hover:rotate-12 transition-transform" size={40} />
                <p className="font-black text-xs uppercase tracking-widest">Vault Security</p>
                <p className="text-[10px] text-primary/60">Biometric Guard</p>
             </div>
          </div>
          <div className="space-y-4 mt-8">
             <div className="h-64 bg-primary text-white rounded-3xl p-8 flex flex-col justify-end relative overflow-hidden group">
                <Zap className="absolute top-6 right-6 text-secondary group-hover:scale-150 transition-transform" size={40} />
                <p className="font-black text-xs uppercase tracking-widest">Instant Pay</p>
                <p className="text-[10px] text-slate-400">Zero-Latency</p>
             </div>
             <div className="h-48 bg-white border-2 border-slate-100 rounded-3xl p-8 flex flex-col justify-end relative overflow-hidden group">
                <Users className="absolute top-6 right-6 text-primary/10 group-hover:translate-x-2 transition-transform" size={40} />
                <p className="font-black text-xs text-primary uppercase tracking-widest">Institutional</p>
                <p className="text-[10px] text-slate-400">Tier-1 Access</p>
             </div>
          </div>
       </div>
    </div>
  </section>
);

const LandingPage = () => {
  return (
    <div className="bg-[#f8fafc]">
      <Nav />
      <Hero />
      <About />
      <Team />
      <Mission />
      <Footer />
    </div>
  );
};

export default LandingPage;
