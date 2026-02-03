import { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import signupImg from '../../assets/Images/signup.png';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';

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

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(''); // clear error on typing
  };

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

      // Success popup
      await Swal.fire({
        title: 'Success!',
        text: 'Your account has been created successfully.',
        icon: 'success',
        confirmButtonColor: '#DB4444',
        confirmButtonText: 'Go to Login',
        timer: 2500, // auto close after 2.5s
        timerProgressBar: true,
        showConfirmButton: true,
      });

      // Redirect to login after popup
      navigate('/login');
    } catch (err) {
      // Error popup
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
    <section className="relative pt-[76px] pb-[140px]">
      <div className="hidden w-1/2 md:flex">
        <img src={signupImg} className="w-full h-full" alt="Signup" />
      </div>

      <div className="absolute inset-0">
        <div className="container h-full flex justify-end items-center">
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
                disabled={loading}
              />
              <input
                name="email"
                placeholder="Email or Phone Number"
                value={form.email}
                onChange={handleChange}
                className="w-full border-b outline-none"
                disabled={loading}
              />
              <input
                name="password"
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="w-full border-b outline-none"
                disabled={loading}
              />

              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-[#DB4444] py-4 text-white font-medium font-poppins rounded-sm transition ${
                  loading
                    ? 'opacity-70 cursor-not-allowed'
                    : 'hover:bg-[#c0392b]'
                }`}
              >
                {loading ? 'Creating...' : 'Create Account'}
              </button>

              <button
                type="button"
                className="w-full border border-black/20 py-4 flex items-center justify-center gap-2 font-normal text-base rounded-sm shadow-lg"
                disabled={loading}
              >
                <FcGoogle className="text-2xl" /> Sign up with Google
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