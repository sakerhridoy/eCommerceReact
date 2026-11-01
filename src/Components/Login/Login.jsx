import { useState } from 'react';
import signupImg from '../../assets/images/signup.png';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from '../../api/client';
import { useGoogleLogin } from '@react-oauth/google';
import { FcGoogle } from 'react-icons/fc';

const Login = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ================= Google Login Logic =================
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async tokenResponse => {
      setGoogleLoading(true);
      try {
        const { data } = await api.post('/auth/google', {
          token: tokenResponse.access_token,
        });

        localStorage.setItem('token', data.data.token);

        await Swal.fire({
          title: 'Welcome back!',
          text: 'Google Login Successful!',
          icon: 'success',
          confirmButtonColor: '#DB4444',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
        });

        window.location.href = '/';
      } catch (err) {
        Swal.fire({
          title: 'Error',
          text: err.response?.data?.message || 'Google login failed',
          icon: 'error',
          confirmButtonColor: '#DB4444',
        });
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: error => {
      console.error('Google Login Error:', error);
      Swal.fire({
        title: 'Error',
        text: 'Could not connect to Google.',
        icon: 'error',
        confirmButtonColor: '#DB4444',
      });
    },
  });

  const handleForgotPassword = async () => {
    setError('');
    setResetMessage('');
    if (!form.email.trim()) {
      setError('Enter your email address first.');
      return;
    }

    setResetLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', {
        email: form.email.trim(),
      });
      setResetMessage(data.message || 'Password reset email sent.');
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Could not send a password reset email.',
      );
    } finally {
      setResetLoading(false);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const authenticatedUser = await login(form.email, form.password);

      const userName =
        authenticatedUser?.name ||
        authenticatedUser?.email?.split('@')[0] ||
        user?.name ||
        'User';

      await Swal.fire({
        title: 'Welcome back!',
        text: `Login successful, ${userName}!`,
        icon: 'success',
        confirmButtonColor: '#DB4444',
        confirmButtonText: 'Continue',
        timer: 2500,
        timerProgressBar: true,
      });

      navigate('/');
    } catch (err) {
      setError('Invalid email or password');

      Swal.fire({
        title: 'Login Failed',
        text: err.message || 'Invalid email or password. Please try again.',
        icon: 'error',
        confirmButtonColor: '#DB4444',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative pt-10 md:pt-19 pb-25 md:pb-35 px-4 lg:px-0">
      <div className="hidden lg:flex w-1/2">
        <img
          src={signupImg}
          className="w-full h-full object-cover"
          alt="Login illustration"
        />
      </div>

      {/* FORM */}
      <div className="lg:absolute lg:inset-0">
        <div className="container h-full flex md:justify-end items-center">
          <div className="w-full max-w-md">
            <h2 className="text-4xl font-medium font-inter pb-6">
              Log in to Exclusive
            </h2>

            <div className="mb-4 min-h-5">
              {location.state?.message && (
                <p className="text-green-700">{location.state.message}</p>
              )}
              {resetMessage && <p className="text-green-700">{resetMessage}</p>}
              {error ? (
                <p className="text-red-500">{error}</p>
              ) : (
                <p className="text-black font-poppins text-base leading-6">
                  Enter your details below
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <input
                name="email"
                type="email"
                placeholder="Email or Phone Number"
                value={form.email}
                onChange={handleChange}
                className="w-full border-b outline-none py-2"
                required
                disabled={loading || googleLoading}
              />
              <input
                name="password"
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="w-full border-b outline-none py-2"
                required
                disabled={loading || googleLoading}
              />

              <div className="flex pt-4 md:pt-8 gap-10 md:gap-24 items-center">
                <button
                  type="submit"
                  disabled={loading || googleLoading}
                  className={`w-full bg-[#DB4444] py-3 md:py-4 text-white font-normal rounded-sm transition ${
                    loading || googleLoading
                      ? 'opacity-70 cursor-not-allowed'
                      : 'hover:bg-[#c0392b]'
                  }`}
                >
                  {loading ? 'Logging in...' : 'Log in'}
                </button>

                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={resetLoading || loading || googleLoading}
                  className="w-full text-[#DB4444] md:py-4 font-normal font-poppins hover:underline"
                >
                  {resetLoading ? 'Sending...' : 'Forgot Password?'}
                </button>
              </div>

              {/* Google Login Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleGoogleLogin()}
                  disabled={loading || googleLoading}
                  className={`w-full border border-black/20 py-3 md:py-4 flex items-center justify-center gap-2 font-normal text-base rounded-sm shadow-sm transition ${
                    loading || googleLoading
                      ? 'opacity-70 cursor-not-allowed'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <FcGoogle className="text-2xl" />
                  {googleLoading
                    ? 'Connecting to Google...'
                    : 'Log in with Google'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;