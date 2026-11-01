import React, { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import {
  FiHome,
  FiBox,
  FiPlusCircle,
  FiShoppingCart,
  FiUsers,
  FiMenu,
  FiBell,
  FiSearch,
  FiUser,
  FiMessageSquare,
} from 'react-icons/fi';

const AdminDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [adminSearch, setAdminSearch] = useState('');
  const navigate = useNavigate();

  // Search Submit Handler
  const handleAdminSearch = e => {
    e.preventDefault();
    if (adminSearch.trim()) {
      navigate(
        `/admin/products?search=${encodeURIComponent(adminSearch.trim())}`,
      );
      setAdminSearch('');
    }
  };

  const menuItems = [
    { name: 'Dashboard', icon: <FiHome size={20} />, path: '/admin' },
    {
      name: 'Products List',
      icon: <FiBox size={20} />,
      path: '/admin/products',
    },
    {
      name: 'Upload Product',
      icon: <FiPlusCircle size={20} />,
      path: '/admin/add-product',
    },
    {
      name: 'Orders',
      icon: <FiShoppingCart size={20} />,
      path: '/admin/orders',
    },
    {
      name: 'Customers',
      icon: <FiUsers size={20} />,
      path: '/admin/customers',
    },
    {
      name: 'All Reviews',
      icon: <FiMessageSquare size={20} />,
      path: '/admin/reviews',
    },
  ];

  return (
    <div className="flex h-screen bg-[#F4F7FE] font-poppins overflow-hidden">
      {/* ================= LEFT SIDEBAR ================= */}
      <aside
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-white border-r border-gray-100 shadow-sm transition-all duration-300 flex flex-col hidden md:flex z-20`}
      >
        <div className="h-20 flex items-center justify-center border-b border-gray-100 px-6">
          <Link
            to="/"
            className="text-2xl font-bold font-inter text-black tracking-wider flex items-center gap-1"
          >
            {isSidebarOpen ? 'Exclusive' : 'Ex'}
            <span className="text-[#DB4444]">.</span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2.5">
          {menuItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-300 font-medium text-sm ${
                  isActive
                    ? 'bg-gradient-to-r from-[#DB4444] to-[#b80808] text-white shadow-md shadow-[#DB4444]/20'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-black'
                }`
              }
            >
              <div className="flex-shrink-0">{item.icon}</div>
              {isSidebarOpen && (
                <span className="whitespace-nowrap tracking-wide">
                  {item.name}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* ================= RIGHT SIDE CONTENT ================= */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 z-10 shadow-xs">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2.5 bg-gray-50 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-black transition-colors hidden md:flex items-center justify-center border border-gray-100"
            >
              <FiMenu size={20} />
            </button>

            <form
              onSubmit={handleAdminSearch}
              className="hidden lg:flex items-center bg-gray-50 border border-gray-200/60 px-4 py-2.5 rounded-xl w-80 focus-within:border-[#DB4444] focus-within:bg-white transition-all"
            >
              <button type="submit">
                <FiSearch className="text-gray-400 mr-2" size={18} />
              </button>
              <input
                type="text"
                value={adminSearch}
                onChange={e => setAdminSearch(e.target.value)}
                placeholder="Search products or orders..."
                className="bg-transparent outline-none w-full text-sm text-black placeholder-gray-400"
              />
            </form>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2.5 text-gray-500 hover:bg-gray-50 border border-gray-100 rounded-xl transition-colors">
              <FiBell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#DB4444] rounded-full ring-2 ring-white"></span>
            </button>
            <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 py-1.5 px-3 rounded-xl border border-transparent hover:border-gray-100 transition-all">
              <div className="w-9 h-9 bg-red-50 text-[#DB4444] rounded-xl flex items-center justify-center font-semibold overflow-hidden shadow-xs">
                <FiUser size={18} />
              </div>
              <div className="hidden sm:block text-left">
                <span className="text-sm font-semibold text-gray-800 block leading-tight">
                  Admin User
                </span>
                <span className="text-xs text-gray-400 block">Super Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* ================= MAIN OUTLET ================= */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#F4F7FE] p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;