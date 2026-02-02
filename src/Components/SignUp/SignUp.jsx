import { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import signupImg from '../../assets/Images/signup.png';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const SignUp = () => {
  const { signup } = useAuth(); // 🔥 only signup
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    if (!form.name || !form.email || !form.password) {
      return setError('All fields are required');
    }
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    try {
      await signup(form.email, form.password, form.name);
      navigate('/login'); // ✅ signup → login
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="relative pt-[76px] pb-[140px]">
      <div className="hidden w-1/2 md:flex">
        <img src={signupImg} className="w-full h-full" />
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
                onChange={handleChange}
                className="w-full border-b outline-none"
              />
              <input
                name="email"
                placeholder="Email"
                onChange={handleChange}
                className="w-full border-b outline-none"
              />
              <input
                name="password"
                type="password"
                placeholder="Password"
                onChange={handleChange}
                className="w-full border-b outline-none"
              />

              <button className="w-full bg-[#DB4444] py-4 text-white">
                Create Account
              </button>

              <button
                type="button"
                className="w-full border py-4 flex items-center justify-center gap-2"
              >
                <FcGoogle /> Sign up with Google
              </button>
            </form>

            <p className="text-center mt-6">
              Already have account?{' '}
              <Link to="/login" className="font-medium underline">
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