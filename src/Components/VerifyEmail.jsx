import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/client';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('Verifying your email…');

  useEffect(() => {
    let isMounted = true;

    const verify = async () => {
      if (!token) {
        if (!isMounted) return;
        setStatus('error');
        setMessage('Missing verification token.');
        return;
      }

      try {
        const res = await api.get(`/auth/verify-email/${encodeURIComponent(token)}`);
        if (!isMounted) return;
        setStatus('success');
        setMessage(res?.data?.message || 'Email verified successfully.');
      } catch (error) {
        if (!isMounted) return;
        setStatus('error');
        setMessage(
          error?.response?.data?.message ||
            error?.message ||
            'Verification failed.',
        );
      }
    };

    verify();

    return () => {
      isMounted = false;
    };
  }, [token]);

  return (
    <section className="min-h-[70vh] flex items-center justify-center px-4 py-14">
      <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">Email Verification</h1>

        <div className="mt-6 flex items-start gap-4">
          {status === 'loading' ? (
            <div className="mt-1 h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
          ) : status === 'success' ? (
            <div className="mt-1 h-5 w-5 rounded-full bg-emerald-500" />
          ) : (
            <div className="mt-1 h-5 w-5 rounded-full bg-red-500" />
          )}

          <div className="flex-1">
            <p
              className={`text-sm leading-6 ${
                status === 'success'
                  ? 'text-emerald-700'
                  : status === 'error'
                    ? 'text-red-600'
                    : 'text-gray-600'
              }`}
            >
              {message}
            </p>

            {status === 'success' ? (
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="mt-6 inline-flex w-full items-center justify-center rounded-md bg-[#DB4444] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#c0392b]"
              >
                Go to Login
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
};

export default VerifyEmail;
