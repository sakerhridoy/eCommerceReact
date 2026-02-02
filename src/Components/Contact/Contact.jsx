import React, { useState } from 'react';
import { Link } from 'react-router';
import { FiPhone, FiMail } from 'react-icons/fi';

const Contact = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name) newErrors.name = 'Name is required';
    if (!form.email) newErrors.email = 'Email is required';
    if (!form.phone) newErrors.phone = 'Phone is required';
    if (!form.message) newErrors.message = 'Message is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!validate()) return;
    alert('Message sent successfully!');
    setForm({ name: '', email: '', phone: '', message: '' });
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
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    placeholder="Your Name "
                    value={form.name}
                    onChange={handleChange}
                    className="w-full bg-[#F5F5F5] p-3 outline-none font-poppins font-normal text-base leading-6 text-black/50"
                  />
                  <span className="absolute left-[47%] top-1/2 -translate-y-1/2 text-[rgba(219,68,68,0.5)] font-semibold">
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
                    name="email"
                    placeholder="Your Email "
                    value={form.email}
                    onChange={handleChange}
                    className="w-full bg-[#F5F5F5] p-3 outline-none font-poppins font-normal text-base leading-6 text-black/50"
                  />
                  <span className="absolute left-[45%] top-1/2 -translate-y-1/2 text-[rgba(219,68,68,0.5)] font-semibold">
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
                    type="text"
                    name="phone"
                    placeholder="Your Phone "
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full bg-[#F5F5F5] p-3 outline-none font-poppins font-normal text-base leading-6 text-black/50"
                  />
                  <span className="absolute left-[48%] top-1/2 -translate-y-1/2 text-[rgba(219,68,68,0.5)] font-semibold">
                    *
                  </span>
                  {errors.phone && (
                    <p className="text-red-500 text-xs font-poppins font-normal mt-1">
                      {errors.phone}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <textarea
                  name="message"
                  placeholder="Your Message"
                  rows="6"
                  value={form.message}
                  onChange={handleChange}
                  className="w-full bg-[#F5F5F5] p-3 outline-none font-poppins font-normal text-base leading-6 text-black/50 rounded-sm resize-none"
                ></textarea>
                {errors.message && (
                  <p className="text-red-500 text-xs font-poppins font-normal mt-1">
                    {errors.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-[#DB4444] text-[#FAFAFA] px-12 py-4 rounded-sm font-poppins font-normal text-base leading-6"
                >
                  Send Message
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
