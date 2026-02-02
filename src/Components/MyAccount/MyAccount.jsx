import React, { useState } from 'react';
import { Link } from 'react-router';

const MyAccount = () => {
  const [form, setForm] = useState({
    firstName: 'Md',
    lastName: 'Rimel',
    email: 'rimelll@gmail.com',
    address: 'Kingston, 5236, United State',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = e => {
    e.preventDefault();
    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      alert('Password does not match');
      return;
    }
    alert('Profile updated successfully!');
  };

  return (
    <section className="pb-[140px]">
      <div className="container">
        {/* Breadcrumb */}
        <div className="flex justify-between items-center py-20">
          <p className="font-poppins font-normal leading-[21px] text-sm text-black/50">
            <Link to="/">Home</Link> /{' '}
            <span className="text-black">My Account</span>
          </p>
          <p className="font-poppins font-normal leading-[21px] text-sm text-black">
            Welcome! <span className="text-[#DB4444]">Md Rimel</span>
          </p>
        </div>

        <div className="flex gap-16">
          {/* ================= LEFT SIDEBAR ================= */}
          <aside className="w-[25%]">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium font-poppins text-base leading-6 mb-4">
                  Manage My Account
                </h4>
                <div className="space-y-2 text-black/50  flex flex-col ps-[35px]">
                  <a className="hover:text-[#DB4444] font-poppins font-normal text-base leading-6">
                    My Profile
                  </a>
                  <a className="hover:text-[#DB4444] font-poppins font-normal text-base leading-6">
                    Address Book
                  </a>
                  <a className="hover:text-[#DB4444] font-poppins font-normal text-base leading-6">
                    My Payment Options
                  </a>
                </div>
              </div>
              <div>
                <h4 className="font-medium font-poppins text-base leading-6 mb-4">
                  My Orders
                </h4>
                <div className="space-y-2 text-black/50  flex flex-col ps-[35px]">
                  <a className="hover:text-[#DB4444] font-poppins font-normal text-base leading-6">
                    My Returns
                  </a>
                  <a className="hover:text-[#DB4444] font-poppins font-normal text-base leading-6">
                    My Cancellations
                  </a>
                </div>
              </div>
              <div>
                <h4 className="font-medium font-poppins text-base leading-6 mb-4">
                  My WishList
                </h4>
              </div>
            </div>
          </aside>

          {/* ================= RIGHT CONTENT ================= */}
          <div className="w-[75%] bg-white shadow-sm py-10 px-20 rounded-sm">
            <h3 className="text-[#DB4444] font-medium font-poppins text-xl leading-7 mb-4">
              Edit Your Profile
            </h3>

            <form onSubmit={handleSave} className="space-y-6">
              {/* Name */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="font-normal font-poppins text-base leading-6">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    className="w-full bg-[#F5F5F5] px-4 py-3 mt-2 outline-none font-normal font-poppins text-base leading-6 text-black/50"
                  />
                </div>
                <div>
                  <label className="font-normal font-poppins text-base leading-6">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    className="w-full bg-[#F5F5F5] px-4 py-3 mt-2 outline-none font-normal font-poppins text-base leading-6 text-black/50"
                  />
                </div>
              </div>

              {/* Email + Address */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="font-normal font-poppins text-base leading-6">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full bg-[#F5F5F5] px-4 py-3 mt-2 outline-none font-normal font-poppins text-base leading-6 text-black/50"
                  />
                </div>
                <div>
                  <label className="font-normal font-poppins text-base leading-6">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    className="w-full bg-[#F5F5F5] px-4 py-3 mt-2 outline-none font-normal font-poppins text-base leading-6 text-black/50"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="font-normal font-poppins text-base leading-6">
                  Password Changes
                </label>
                <div className="space-y-4 mt-4">
                  <input
                    type="password"
                    name="currentPassword"
                    placeholder="Current Password"
                    value={form.currentPassword}
                    onChange={handleChange}
                    className="w-full bg-[#F5F5F5] px-4 py-3 mt-2 outline-none font-normal font-poppins text-base leading-6 text-black/50"
                  />
                  <input
                    type="password"
                    name="newPassword"
                    placeholder="New Password"
                    value={form.newPassword}
                    onChange={handleChange}
                    className="w-full bg-[#F5F5F5] px-4 py-3 mt-2 outline-none font-normal font-poppins text-base leading-6 text-black/50"
                  />
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm New Password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className="w-full bg-[#F5F5F5] px-4 py-3 mt-2 outline-none font-normal font-poppins text-base leading-6 text-black/50"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-6 pt-6">
                <button
                  type="button"
                  className="font-normal font-poppins text-base leading-6 py-4 bg-transparent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#DB4444] font-normal font-poppins text-base leading-6 text-white px-12 py-4 rounded-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MyAccount;
