import { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import signupImg from '../../assets/images/signup.png';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Swal from 'sweetalert2';
import { useGoogleLogin } from '@react-oauth/google';
import api from '../../api/client';

const SignUp = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  // ================= Google Signup/Login Logic =================
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async tokenResponse => {
      setGoogleLoading(true);
      try {
        const { data } = await api.post('/auth/google', {
          token: tokenResponse.access_token,
        });
        
        localStorage.setItem('token', data.data.token);

        await Swal.fire({
          title: 'Success!',
          text: 'Google Authentication Successful!',
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
          text: err.response?.data?.message || 'Google authentication failed',
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

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    if (!form.name || !form.email || !form.password) {
      setError('All fields are required');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await signup(form.email, form.password, form.name);

      await Swal.fire({
        title: 'Success!',
        text: 'Your account has been created successfully.',
        icon: 'success',
        confirmButtonColor: '#DB4444',
        confirmButtonText: 'Go to Login',
        timer: 2500,
        timerProgressBar: true,
        showConfirmButton: true,
      });

      navigate('/');
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: err.message || 'Failed to create account. Please try again.',
        icon: 'error',
        confirmButtonColor: '#DB4444',
      });

      setError(err.message || 'Something went wrong');
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
          alt="Signup"
        />
      </div>

      {/* FORM */}
      <div className="lg:absolute lg:inset-0 ">
        <div className="container h-full flex md:justify-end items-center">
          <div className="w-full max-w-md">
            <h2 className="text-4xl font-medium pb-6">Create an account</h2>
            <p className="pb-8">Enter your details below</p>

            {error && <p className="text-red-500 mb-4">{error}</p>}

            <form onSubmit={handleSubmit} className="space-y-8">
              <input
                name="name"
                placeholder="Name"
                value={form.name}
                onChange={handleChange}
                className="w-full border-b outline-none"
                disabled={loading || googleLoading}
              />
              <input
                name="email"
                placeholder="Email or Phone Number"
                value={form.email}
                onChange={handleChange}
                className="w-full border-b outline-none"
                disabled={loading || googleLoading}
              />
              <input
                name="password"
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="w-full border-b outline-none"
                disabled={loading || googleLoading}
              />

              <button
                type="submit"
                disabled={loading || googleLoading}
                className={`w-full bg-[#DB4444] py-4 text-white font-medium font-poppins rounded-sm transition ${
                  loading || googleLoading
                    ? 'opacity-70 cursor-not-allowed'
                    : 'hover:bg-[#c0392b]'
                }`}
              >
                {loading ? 'Creating...' : 'Create Account'}
              </button>

              <button
                type="button"
                onClick={() => handleGoogleLogin()}
                disabled={loading || googleLoading}
                className={`w-full border border-black/20 py-4 flex items-center justify-center gap-2 font-normal text-base rounded-sm shadow-sm transition ${
                  loading || googleLoading
                    ? 'opacity-70 cursor-not-allowed'
                    : 'hover:bg-gray-50'
                }`}
              >
                <FcGoogle className="text-2xl" />
                {googleLoading
                  ? 'Connecting to Google...'
                  : 'Sign up with Google'}
              </button>
            </form>

            <p className="text-center mt-6">
              Already have account?
              <Link
                to="/login"
                className="ms-4 font-medium font-poppins text-base underline hover:text-[#DB4444]"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SignUp;