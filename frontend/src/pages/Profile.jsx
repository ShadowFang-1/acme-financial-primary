import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Mail, 
  Shield, 
  Key, 
  Bell, 
  Globe, 
  Phone,
  Camera,
  CheckCircle2,
  ChevronRight,
  Loader2,
  X,
  Save,
  AlertCircle,
  Upload,
  Eye,
  Maximize2,
  Image as ImageIcon
} from 'lucide-react';
import Layout from '../components/Layout';
import axios from 'axios';
import ImageEditor from '../components/ImageEditor';
import CameraCapture from '../components/CameraCapture';

const Profile = () => {
  const { user, updateUser, logout } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [passModalOpen, setPassModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

  // Advanced Image states
  const [selectedImage, setSelectedImage] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [fullImageOpen, setFullImageOpen] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [userAvatars, setUserAvatars] = useState([]);

  // Form states
  const [editForm, setEditForm] = useState({ 
    username: '', 
    email: '',
    phoneNumber: '', 
    country: '', 
    imageUrl: '',
    pushNotifications: true,
    emailAlerts: true,
    loginNotifications: true,
    dateOfBirth: ''
  });
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const premiumAvatars = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Aria',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Leo',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Iris'
  ];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get('/api/v1/users/me');
      setProfileData(res.data);
      setEditForm({
        username: res.data.username || '',
        email: res.data.email || '',
        phoneNumber: res.data.phoneNumber || '',
        country: res.data.country || '',
        imageUrl: res.data.imageUrl || '',
        pushNotifications: res.data.pushNotifications ?? true,
        emailAlerts: res.data.emailAlerts ?? true,
        loginNotifications: res.data.loginNotifications ?? true,
        dateOfBirth: res.data.dateOfBirth || ''
      });
      setLoading(false);
      fetchUserAvatars();
    } catch (err) {
      setError('Failed to load profile data');
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError('');
    setSuccess('');
    try {
      const res = await axios.put('/api/v1/users/me', editForm);
      setProfileData(res.data);
      updateUser({ ...user, username: res.data.username, email: res.data.email, imageUrl: res.data.imageUrl });
      setSuccess('Profile updated successfully!');
      setEditModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    setUpdating(true);
    setError('');
    setSuccess('');
    try {
      await axios.post('/api/v1/users/change-password', {
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword
      });
      setSuccess('Password changed successfully!');
      setPassModalOpen(false);
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setUpdating(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.addEventListener('load', () => {
      setSelectedImage(reader.result);
      setShowEditor(true);
    });
    reader.readAsDataURL(file);
  };

  const handleCameraCapture = (imageSrc) => {
    setSelectedImage(imageSrc);
    setShowCamera(false);
    setShowEditor(true);
  };

  const handleEditorComplete = async (croppedImageData) => {
    setUpdating(true);
    setShowEditor(false);
    setError('');
    
    const formData = new FormData();
    formData.append('file', croppedImageData.file, 'avatar.jpg');

    try {
      const res = await axios.post('/api/v1/users/upload-avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const newUrl = res.data.imageUrl;
      setProfileData({ ...profileData, imageUrl: newUrl });
      updateUser({ ...user, imageUrl: newUrl });
      setEditForm({ ...editForm, imageUrl: newUrl });
      setSuccess('High-definition portrait updated!');
    } catch (err) {
      setError('System rejected the image payload. Verify formatting.');
    } finally {
      setUpdating(false);
      setSelectedImage(null);
    }
  };

  const handleSelectFromGallery = async (url) => {
    setUpdating(true);
    setShowGallery(false);
    setError('');
    try {
      const res = await axios.put('/api/v1/users/me', { ...editForm, imageUrl: url });
      setProfileData(res.data);
      updateUser({ ...user, imageUrl: url });
      setEditForm({ ...editForm, imageUrl: url });
      setSuccess('Vault portrait restored successfully!');
    } catch (err) {
      setError('Could not restore from vault.');
    } finally {
      setUpdating(false);
    }
  };

  const fetchUserAvatars = async () => {
    try {
      const res = await axios.get('/api/v1/users/my-avatars');
      setUserAvatars(res.data);
    } catch (err) {
      console.error("Gallery Fetch Error:", err);
    }
  };

  const handleDeactivate = async () => {
    if (!window.confirm('CRITICAL ACTION: Are you sure you want to deactivate your account? You will be logged out and cannot re-access your funds until re-enabled by admin.')) return;
    setUpdating(true);
    try {
      await axios.post('/api/v1/users/deactivate');
      logout();
    } catch (err) {
      setError('System rejection during deactivation protocol.');
    } finally {
      setUpdating(false);
    }
  };

  const handleTogglePreference = async (key) => {
    const newVal = !editForm[key];
    const updatedForm = { ...editForm, [key]: newVal };
    setEditForm(updatedForm);
    try {
      await axios.put('/api/v1/users/me', updatedForm);
      updateUser({ ...user, [key]: newVal });
      setSuccess(`${key.replace(/([A-Z])/g, ' $1')} preference updated.`);
    } catch (err) {
      setError('Failed to update preference.');
    }
  };

  if (loading) {
    return (
      <Layout title="Profile">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="animate-spin text-primary" size={40} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Account Settings" subtitle="Manage your personal information and security preferences" hideSearch hideBell>
      <div className="max-w-5xl mx-auto space-y-6">
        
        {success && (
          <div className="bg-green-50 text-green-600 p-4 rounded-2xl flex items-center gap-3 border border-green-100 animate-in slide-in-from-top-2">
            <CheckCircle2 size={20} />
            <span className="font-bold">{success}</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-3 border border-red-100 animate-in slide-in-from-top-2">
            <AlertCircle size={20} />
            <span className="font-bold">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-12 gap-8">
          {/* Left Column - Main Info */}
          <div className="col-span-12 lg:col-span-8 space-y-8">
            <div className="card relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-primary to-primary-light"></div>
               <div className="relative pt-12 pb-6 px-4 flex flex-col items-center sm:flex-row sm:items-end gap-6">
                 <div className="relative">
                    <div 
                      className="w-32 h-32 rounded-3xl bg-white p-1 shadow-xl cursor-zoom-in group/img"
                      onClick={() => profileData?.imageUrl && setFullImageOpen(true)}
                    >
                      <div className="w-full h-full rounded-2xl bg-gradient-to-tr from-primary to-primary-light flex items-center justify-center text-white text-4xl font-bold font-outfit uppercase overflow-hidden relative">
                        {profileData?.imageUrl ? (
                          <>
                            <img src={profileData.imageUrl} alt="Avatar" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                              <Maximize2 size={24} className="text-white" />
                            </div>
                          </>
                        ) : (
                          profileData?.username?.[0]
                        )}
                      </div>
                    </div>
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center justify-center gap-1.5 p-1 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 z-20 shadow-xl">
                        <button 
                            onClick={() => setShowCamera(true)}
                            className="p-2.5 bg-primary text-secondary rounded-xl hover:scale-110 transition-transform flex items-center justify-center border border-white/10 shadow-lg"
                            title="Live Capture"
                        >
                            <Camera size={16} />
                        </button>
                        <button 
                            onClick={() => fileInputRef.current.click()}
                            className="p-2.5 bg-secondary text-primary rounded-xl hover:scale-110 transition-transform flex items-center justify-center border border-white/10 shadow-lg"
                            title="Local File"
                        >
                            {updating ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                        </button>
                        <button 
                            onClick={() => { fetchUserAvatars(); setShowGallery(true); }}
                            className="p-2.5 bg-white text-primary rounded-xl hover:scale-110 transition-transform flex items-center justify-center border border-slate-100 shadow-lg"
                            title="Personal Portrait Vault"
                        >
                            <ImageIcon size={16} />
                        </button>
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                 </div>
                 <div className="flex-1 pb-2">
                   <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                     {profileData?.username} <CheckCircle2 size={20} className="text-blue-500" />
                   </h2>
                   <p className="text-slate-500 font-medium">{profileData?.role?.replace('ROLE_', '')} Account</p>
                 </div>
                 <div className="pb-2">
                   <button 
                      onClick={() => setEditModalOpen(true)}
                      className="btn-primary flex items-center gap-2"
                    >
                      Edit Profile
                    </button>
                 </div>
               </div>

               <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-8 px-4 pb-4">
                 <div className="space-y-1">
                   <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <Mail size={20} className="text-primary" />
                      <span className="font-semibold text-slate-700">{profileData?.email}</span>
                    </div>
                 </div>
                 <div className="space-y-1">
                   <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone Number</label>
                   <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                     <Phone size={20} className="text-slate-400" />
                     <span className="font-semibold text-slate-700">{profileData?.phoneNumber || 'Not provided'}</span>
                   </div>
                 </div>
                 <div className="space-y-1">
                   <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Country/Region</label>
                   <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                     <Globe size={20} className="text-slate-400" />
                     <span className="font-semibold text-slate-700">{profileData?.country || 'Not provided'}</span>
                   </div>
                 </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Date of Birth</label>
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <Shield size={20} className="text-slate-400" />
                      <span className="font-semibold text-slate-700">{profileData?.dateOfBirth || 'Not provided'}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Customer ID</label>
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <Shield size={20} className="text-slate-400" />
                      <span className="font-semibold text-slate-700">ACME-{1000 + (profileData?.id || 0)}</span>
                    </div>
                  </div>
                </div>
            </div>

            <div className="card">
              <h3 className="text-xl font-bold text-slate-800 mb-6">Security & Privacy</h3>
              <div className="space-y-4">
                <button 
                  onClick={() => setPassModalOpen(true)}
                  className="w-full flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl border border-slate-100 transition-all group text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                      <Key size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">Change Password</p>
                      <p className="text-xs text-slate-500">Update your account password regularly.</p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-slate-300 group-hover:text-primary transition-colors" />
                </button>

                <div className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
                      <Shield size={20} />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-slate-800">Two-Factor Authentication</p>
                      <p className="text-xs text-slate-500">Extra security for your peace of mind.</p>
                    </div>
                  </div>
                  <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase">Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Preferences */}
          <div className="col-span-12 lg:col-span-4 space-y-8">
            <div className="card">
              <h3 className="text-lg font-bold text-slate-800 mb-6">Preferences</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell size={20} className="text-slate-400 hidden sm:block" />
                    <span className="font-medium text-slate-700">Push Notifications</span>
                  </div>
                  <button 
                    onClick={() => handleTogglePreference('pushNotifications')}
                    className={`w-12 h-6 rounded-full relative transition-all ${editForm.pushNotifications ? 'bg-primary' : 'bg-slate-200'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${editForm.pushNotifications ? 'right-1' : 'left-1'}`}></div>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail size={20} className="text-slate-400" />
                    <span className="font-medium text-slate-700">Email Alerts</span>
                  </div>
                  <button 
                    onClick={() => handleTogglePreference('emailAlerts')}
                    className={`w-12 h-6 rounded-full relative transition-all ${editForm.emailAlerts ? 'bg-primary' : 'bg-slate-200'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${editForm.emailAlerts ? 'right-1' : 'left-1'}`}></div>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield size={20} className="text-slate-400" />
                    <span className="font-medium text-slate-700">Login Activity Alerts</span>
                  </div>
                  <button 
                    onClick={() => handleTogglePreference('loginNotifications')}
                    className={`w-12 h-6 rounded-full relative transition-all ${editForm.loginNotifications ? 'bg-primary' : 'bg-slate-200'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${editForm.loginNotifications ? 'right-1' : 'left-1'}`}></div>
                  </button>
                </div>
              </div>
            </div>

            <div className="card bg-red-50 border-red-100">
               <h3 className="text-lg font-bold text-red-600 mb-4">Danger Zone</h3>
               <p className="text-sm text-red-500 mb-6 leading-relaxed">
                 Account deactivation will immediately stop your banking access. Re-verification will be required to restore.
               </p>
                <button 
                  onClick={handleDeactivate}
                  disabled={updating}
                  className="w-full py-3 border-2 border-red-200 text-red-600 rounded-xl font-bold hover:bg-red-600 hover:text-white hover:border-red-600 transition-all uppercase text-xs disabled:opacity-50"
                >
                  {updating ? 'Processing...' : 'Deactivate Account'}
                </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-2xl font-black text-slate-800">Edit Personal Information</h3>
              <button onClick={() => setEditModalOpen(false)} className="p-2 hover:bg-white rounded-xl transition-colors">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleUpdateProfile} className="p-8 space-y-6">
              <div className="space-y-4">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Select an Avatar</label>
                <div className="grid grid-cols-6 gap-3">
                  {premiumAvatars.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setEditForm({...editForm, imageUrl: url})}
                      className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all ${editForm.imageUrl === url ? 'border-primary ring-2 ring-primary/20 scale-110' : 'border-transparent hover:border-slate-200'}`}
                    >
                      <img src={url} alt={`Avatar ${i}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
                <div className="pt-2">
                   <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Or Use Custom Image URL</label>
                   <input 
                    type="text" 
                    className="input-field text-xs py-2"
                    placeholder="https://example.com/image.jpg"
                    value={editForm.imageUrl}
                    onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Display Name</label>
                  <input 
                    type="text" 
                    className="input-field"
                    required
                    value={editForm.username}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Email Address</label>
                  <input 
                    type="email" 
                    className="input-field"
                    required
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Phone Number</label>
                  <input 
                    type="tel" 
                    className="input-field"
                    value={editForm.phoneNumber}
                    onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                    placeholder="+233..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Country</label>
                  <input 
                    type="text" 
                    className="input-field"
                    value={editForm.country}
                    onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                    placeholder="e.g. Ghana"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Date of Birth</label>
                <input 
                  type="date" 
                  className="input-field"
                  value={editForm.dateOfBirth}
                  onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })}
                  required
                />
              </div>
              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={updating}
                  className="w-full btn-primary py-4 flex items-center justify-center gap-3 text-lg font-black"
                >
                  {updating ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Save Changes</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {passModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-2xl font-black text-slate-800">Update Password</h3>
              <button onClick={() => setPassModalOpen(false)} className="p-2 hover:bg-white rounded-xl transition-colors">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleChangePassword} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Current Password</label>
                <input 
                   type="password" 
                   className="input-field"
                   required
                   value={passForm.currentPassword}
                   onChange={(e) => setPassForm({ ...passForm, currentPassword: e.target.value })}
                />
              </div>
              <div className="space-y-2 pt-4 border-t border-slate-100">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">New Password</label>
                <input 
                   type="password" 
                   className="input-field"
                   required
                   value={passForm.newPassword}
                   onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Confirm New Password</label>
                <input 
                   type="password" 
                   className="input-field"
                   required
                   value={passForm.confirmPassword}
                   onChange={(e) => setPassForm({ ...passForm, confirmPassword: e.target.value })}
                />
              </div>
              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={updating}
                  className="w-full btn-primary py-4 flex items-center justify-center gap-3 text-lg font-black"
                >
                  {updating ? <Loader2 className="animate-spin" /> : <><Key size={20} /> Update Password</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditor && (
        <ImageEditor 
          image={selectedImage} 
          onCropComplete={handleEditorComplete}
          onCancel={() => { setShowEditor(false); setSelectedImage(null); }}
        />
      )}

      {showCamera && (
        <CameraCapture 
          onCapture={handleCameraCapture}
          onCancel={() => setShowCamera(false)}
        />
      )}

      {fullImageOpen && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/95 backdrop-blur-2xl p-4 sm:p-20 transition-all animate-in fade-in"
          onClick={() => setFullImageOpen(false)}
        >
          <button className="absolute top-8 right-8 p-4 text-white/60 hover:text-white transition-colors">
            <X size={32} />
          </button>
          <div className="max-w-4xl w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img 
              src={profileData.imageUrl} 
              alt="Full Preview" 
              className="max-w-full max-h-full rounded-3xl shadow-[0_0_100px_rgba(0,0,0,0.5)] border-4 border-white/10 object-contain"
            />
          </div>
        </div>
      )}

      {showGallery && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter italic">Personal Portrait Vault</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Select from your previous uploads</p>
              </div>
              <button onClick={() => setShowGallery(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <X size={24} className="text-slate-400" />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
              {userAvatars.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                  {userAvatars.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelectFromGallery(url)}
                      className="relative aspect-square rounded-2xl overflow-hidden group hover:ring-4 hover:ring-primary transition-all shadow-md"
                    >
                      <img src={url} alt={`Past Avatar ${i}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <span className="text-[9px] font-black text-white uppercase tracking-widest bg-primary px-2 py-1 rounded-lg">RESTORE</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center space-y-4">
                  <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto text-slate-300">
                    <ImageIcon size={40} />
                  </div>
                  <p className="text-slate-400 font-bold text-sm uppercase tracking-tighter">Your vault is empty</p>
                  <p className="text-[10px] text-slate-300 px-12 italic">Upload images to automatically save them into your personal vault for quick access.</p>
                </div>
              )}
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
                <button 
                  onClick={() => { setShowGallery(false); fileInputRef.current.click(); }}
                  className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
                >
                    + Add New Portrait
                </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};


export default Profile;
