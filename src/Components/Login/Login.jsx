import { useState } from 'react';
import signupImg from '../../assets/Images/signup.png';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router';

const Login = () => {
  const { login } = useAuth(); // login function context theke
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  // input change handle
  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // form submit handle
  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    try {
      await login(form.email, form.password); // correct login function
      navigate('/'); // login successful hole home page e jabe
    } catch (err) {
      console.log(err);
      setError('Invalid email or password'); // error message
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
            <h2 className="text-4xl font-medium pb-6">Log in to Exclusive</h2>

            {error && <p className="text-red-500 mb-4">{error}</p>}

            <form onSubmit={handleSubmit} className="space-y-8">
              <input
                name="email"
                type="email"
                placeholder="Email"
                onChange={handleChange}
                className="w-full border-b outline-none py-2"
                required
              />
              <input
                name="password"
                type="password"
                placeholder="Password"
                onChange={handleChange}
                className="w-full border-b outline-none py-2"
                required
              />

              <button className="w-full bg-[#DB4444] py-4 text-white">
                Log in
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
