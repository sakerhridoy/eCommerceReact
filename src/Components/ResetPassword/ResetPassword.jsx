import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api/client';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async event => {
    event.preventDefault();
    setError('');

    if (!token) {
      setError('This password reset link is invalid.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${encodeURIComponent(token)}`, {
        password,
        confirmPassword,
      });
      navigate('/login', {
        state: { message: 'Your password has been reset. Please log in.' },
      });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Could not reset your password. Request a new reset link.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="container mx-auto max-w-lg px-4 py-20">
      <h1 className="mb-6 text-3xl font-semibold">Reset password</h1>
      {error && (
        <p className="mb-4 text-red-600" role="alert">
          {error}
        </p>
      )}
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-1 block">New password</span>
          <input
            type="password"
            autoComplete="new-password"
            minLength={6}
            required
            value={password}
            onChange={event => setPassword(event.target.value)}
            className="w-full rounded border p-3"
          />
        </label>
        <label className="block">
          <span className="mb-1 block">Confirm new password</span>
          <input
            type="password"
            autoComplete="new-password"
            minLength={6}
            required
            value={confirmPassword}
            onChange={event => setConfirmPassword(event.target.value)}
            className="w-full rounded border p-3"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-[#DB4444] px-6 py-3 text-white disabled:opacity-60"
        >
          {loading ? 'Updating...' : 'Update password'}
        </button>
      </form>
      <Link to="/login" className="mt-6 inline-block text-[#DB4444]">
        Back to login
      </Link>
    </section>
  );
};

export default ResetPassword;
