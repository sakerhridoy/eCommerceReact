import { useState } from 'react';
import signupImg from '../../assets/Images/signup.png';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const Login = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(form.email, form.password);

      const userName =
        user?.displayName || user?.email?.split('@')[0] || 'User';

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
      {/* IMAGE – DESKTOP ONLY */}
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
                disabled={loading}
              />
              <input
                name="password"
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="w-full border-b outline-none py-2"
                required
                disabled={loading}
              />

              <div className="flex pt-8 gap-20 md:gap-24">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full bg-[#DB4444] py-3 md:py-4 text-white font-normal rounded-sm transition ${
                    loading
                      ? 'opacity-70 cursor-not-allowed'
                      : 'hover:bg-[#c0392b]'
                  }`}
                >
                  {loading ? 'Logging in...' : 'Log in'}
                </button>

                <button
                  type="button"
                  className="w-full text-[#DB4444] md:py-4 font-normal font-poppins"
                >
                  Forget Password?
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