import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // ← react-router-dom import করা উচিত
import { FiPhone, FiMail } from 'react-icons/fi';

const Contact = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: '', message: '' }); // success / error
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'name':
        if (!value.trim()) error = 'Name is required';
        break;
      case 'email':
        if (!value.trim()) error = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          error = 'Invalid email format';
        break;
      case 'phone':
        if (!value.trim()) error = 'Phone is required';
        else if (!/^(01[3-9]\d{8}|\+8801[3-9]\d{8})$/.test(value))
          error = 'Invalid BD phone (01XXXXXXXXX or +8801XXXXXXXXX)';
        break;
      case 'message':
        if (!value.trim()) error = 'Message is required';
        else if (value.trim().length < 10)
          error = 'Message must be at least 10 characters';
        break;
      default:
        break;
    }

    return error;
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    // Live validation on change (phone & email)
    if (['phone', 'email'].includes(name)) {
      const err = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: err }));
    }

    // Clear status when user starts typing again
    if (status.message) setStatus({ type: '', message: '' });
  };

  const handleBlur = e => {
    const { name, value } = e.target;
    const err = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: err }));
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(form).forEach(field => {
      const err = validateField(field, form[field]);
      if (err) newErrors[field] = err;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    // Simulate API call (এখানে পরে Firebase / EmailJS / backend call দিবে)
    try {
      // await sendContactForm(form);  // ← future real API call

      await new Promise(resolve => setTimeout(resolve, 1200)); // fake delay

      setStatus({
        type: 'success',
        message: 'Thank you! Your message has been sent successfully.',
      });

      setForm({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      setStatus({
        type: 'error',
        message: 'Something went wrong. Please try again later.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="pb-[140px]">
      <div className="container">
        {/* Breadcrumb */}
        <div className="py-20">
          <p className="text-sm text-black/50 font-poppins font-normal leading-[21px]">
            <Link to="/">Home</Link> /{' '}
            <span className="text-black">Contact</span>
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* ================= LEFT INFO ================= */}
          <div className="rounded-sm px-[35px] pt-10 pb-[50px] shadow-sm">
            {/* Call */}
            <div>
              <div className="flex items-center gap-4 mb-6">
                <span className="w-10 h-10 bg-[#DB4444] text-white rounded-full flex items-center justify-center">
                  <FiPhone />
                </span>
                <h4 className="font-medium font-poppins text-base leading-6">
                  Call To Us
                </h4>
              </div>
              <p className="text-sm font-poppins font-normal leading-[21px] text-black mb-4">
                We are available 24/7, 7 days a week.
              </p>
              <p className="text-sm font-poppins font-normal leading-[21px] text-black pb-8">
                Phone: +880161112222
              </p>
            </div>

            <hr />

            {/* Write */}
            <div className="mt-8">
              <div className="flex items-center gap-4 mb-6">
                <span className="w-10 h-10 bg-[#DB4444] text-white rounded-full flex items-center justify-center">
                  <FiMail />
                </span>
                <h4 className="font-medium font-poppins text-base leading-6">
                  Write To Us
                </h4>
              </div>
              <p className="text-sm font-poppins font-normal leading-[21px] text-black mb-4 pr-5">
                Fill out our form and we will contact you within 24 hours.
              </p>
              <p className="text-sm font-poppins font-normal leading-[21px] text-black mb-4">
                Emails: customer@exclusive.com
              </p>
              <p className="text-sm font-poppins font-normal leading-[21px] text-black">
                Emails: support@exclusive.com
              </p>
            </div>
          </div>

          {/* ================= RIGHT FORM ================= */}
          <div className="lg:col-span-2 rounded-sm shadow-sm px-8 py-10">
            {status.message && (
              <div
                className={`mb-6 p-4 rounded-sm text-center font-poppins text-sm ${
                  status.type === 'success'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {status.message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="relative">
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Your Name "
                    value={form.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    className="w-full bg-[#F5F5F5] p-3 outline-none font-poppins font-normal text-base leading-6 text-black/50"
                  />
                  <span className="absolute left-[47%] top-5 -translate-y-1/2 text-[rgba(219,68,68,0.5)] font-semibold">
                    *
                  </span>
                  {errors.name && (
                    <p className="text-red-500 text-xs font-poppins font-normal mt-1">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Your Email "
                    value={form.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    className="w-full bg-[#F5F5F5] p-3 outline-none font-poppins font-normal text-base leading-6 text-black/50"
                  />
                  <span className="absolute left-[47%] top-5 -translate-y-1/2 text-[rgba(219,68,68,0.5)] font-semibold">
                    *
                  </span>
                  {errors.email && (
                    <p className="text-red-500 text-xs font-poppins font-normal mt-1">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder="Your Phone "
                    value={form.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    className="w-full bg-[#F5F5F5] p-3 outline-none font-poppins font-normal text-base leading-6 text-black/50"
                  />
                  <span className="absolute left-[47%] top-5 -translate-y-1/2 text-[rgba(219,68,68,0.5)] font-semibold">
                    *
                  </span>
                  {errors.phone && (
                    <p className="text-red-500 text-xs font-poppins font-normal mt-1">
                      {errors.phone}
                    </p>
                  )}
                </div>
              </div>

              <div className="relative">
                <textarea
                  id="message"
                  name="message"
                  placeholder="Your Message "
                  rows="6"
                  value={form.message}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  className="w-full bg-[#F5F5F5] p-3 outline-none font-poppins font-normal text-base leading-6 text-black/50 rounded-sm resize-none"
                ></textarea>
                <span className="absolute left-[18%] top-2.5 text-[rgba(219,68,68,0.5)] font-semibold">
                  *
                </span>
                {errors.message && (
                  <p className="text-red-500 text-xs font-poppins font-normal mt-1">
                    {errors.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`bg-[#DB4444] text-[#FAFAFA] px-12 py-4 rounded-sm font-poppins font-normal text-base leading-6 ${
                    isSubmitting
                      ? 'opacity-70 cursor-not-allowed'
                      : 'hover:bg-[#c0392b]'
                  } transition-colors`}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;