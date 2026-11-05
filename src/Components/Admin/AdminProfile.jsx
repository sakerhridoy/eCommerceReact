import React, { useEffect, useRef, useState } from 'react';
import { VscEye, VscEyeClosed } from 'react-icons/vsc';
import { FiUser, FiCamera } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { getImageUrl, updateMyProfile, uploadMyAvatar } from '../../api/catalog';
import api from '../../api/client';

const AdminProfile = () => {
  const { user, setUser } = useAuth();
  const avatarInputRef = useRef(null);

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setForm(prev => ({
      ...prev,
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    }));
  }, [user]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const trimmedName = form.name.trim();
      const trimmedPhone = form.phone.trim();
      const payload = {};
      if (trimmedName && trimmedName !== user?.name) payload.name = trimmedName;
      if (trimmedPhone !== (user?.phone || '')) payload.phone = trimmedPhone;

      if (Object.keys(payload).length > 0) {
        const updated = await updateMyProfile(payload);
        setUser(updated);
      }

      if (form.newPassword) {
        if (!form.currentPassword)
          throw new Error('Current password is required');
        if (form.newPassword.length < 6)
          throw new Error('New password must be at least 6 characters');
        if (form.newPassword !== form.confirmPassword)
          throw new Error('Passwords do not match');

        await api.post('/auth/change-password', {
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        });
      }

      setSuccess('Profile updated successfully ✓');
      setForm(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Something went wrong. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async e => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setSuccess('');
    setAvatarUploading(true);
    try {
      const updated = await uploadMyAvatar(file);
      setUser(updated);
      setSuccess('Avatar updated successfully ✓');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload avatar');
    } finally {
      setAvatarUploading(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Admin Profile</h1>
        <p className="text-sm text-gray-500 mt-1">
          Update your personal information and account security.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
        {/* Avatar */}
        <div className="flex items-center gap-5 mb-8">
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
              {user?.avatar?.url ? (
                <img
                  src={getImageUrl(user.avatar)}
                  alt={user?.name || 'Avatar'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <FiUser size={28} className="text-gray-400" />
              )}
            </div>
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              disabled={avatarUploading}
              className="absolute -bottom-1 -right-1 bg-[#DB4444] text-white p-2 rounded-full shadow hover:bg-red-600 transition-colors disabled:opacity-60"
              title="Change avatar"
            >
              <FiCamera size={14} />
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">
              Profile Photo
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {avatarUploading ? 'Uploading...' : 'JPG or PNG, up to 5MB'}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter full name"
                className="w-full bg-[#F4F7FE] border border-transparent focus:border-[#DB4444] rounded-xl px-4 py-3 outline-none transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                className="w-full bg-[#F4F7FE] border border-transparent focus:border-[#DB4444] rounded-xl px-4 py-3 outline-none transition-all text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              value={form.email}
              disabled
              className="w-full bg-[#F4F7FE] px-4 py-3 rounded-xl text-gray-500 cursor-not-allowed text-sm"
            />
          </div>

          <div className="space-y-6 pt-6 border-t border-gray-100">
            <h4 className="text-lg font-semibold text-gray-800">
              Change Password
            </h4>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <input
                type={showCurrent ? 'text' : 'password'}
                name="currentPassword"
                value={form.currentPassword}
                onChange={handleChange}
                placeholder="Current password"
                className="w-full bg-[#F4F7FE] border border-transparent focus:border-[#DB4444] rounded-xl px-4 py-3 outline-none transition-all pr-12 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-4 top-10 text-gray-500 hover:text-[#DB4444]"
              >
                {showCurrent ? <VscEyeClosed size={18} /> : <VscEye size={18} />}
              </button>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type={showNew ? 'text' : 'password'}
                name="newPassword"
                value={form.newPassword}
                onChange={handleChange}
                placeholder="New password (min 6 characters)"
                className="w-full bg-[#F4F7FE] border border-transparent focus:border-[#DB4444] rounded-xl px-4 py-3 outline-none transition-all pr-12 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-4 top-10 text-gray-500 hover:text-[#DB4444]"
              >
                {showNew ? <VscEyeClosed size={18} /> : <VscEye size={18} />}
              </button>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                type={showConfirm ? 'text' : 'password'}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm new password"
                className="w-full bg-[#F4F7FE] border border-transparent focus:border-[#DB4444] rounded-xl px-4 py-3 outline-none transition-all pr-12 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 top-10 text-gray-500 hover:text-[#DB4444]"
              >
                {showConfirm ? <VscEyeClosed size={18} /> : <VscEye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`bg-[#DB4444] text-white px-8 py-3 rounded-xl font-medium text-sm transition-colors ${
                loading
                  ? 'opacity-70 cursor-not-allowed'
                  : 'hover:bg-red-600'
              }`}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminProfile;
