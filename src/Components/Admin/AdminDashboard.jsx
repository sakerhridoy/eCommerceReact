import React, { useState, useEffect, Suspense } from 'react';
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
  FiTag,
  FiStar,
  FiSettings,
  FiShield,
} from 'react-icons/fi';
import api from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import { getImageUrl } from '../../api/catalog';
import { can, PERMISSIONS, ROLE_LABELS, normalizeRole } from '../../utils/permissions';
import PageLoader from '../PageLoader';

const AdminDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [adminSearch, setAdminSearch] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch Notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get('/notifications');
        const notifs = response.data?.data || response.data || [];
        setNotifications(notifs);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleNotificationClick = async notif => {
    // 1. Dropdown sathe sathe bondho hobe
    setShowNotifications(false);

    // 2. ID ber kora (resilient extraction)
    let targetOrderId =
      typeof notif.orderId === 'object' ? notif.orderId?._id : notif.orderId;

    // Fallback: extract from message if orderId is missing
    if (!targetOrderId && notif.message) {
      const match = notif.message.match(/(ORD-[A-Z0-9]+|[0-9a-fA-F]{24})/i);
      if (match && match[0]) targetOrderId = match[0];
    }

    // 3. ID shoho Order page e pathiye dewa
    if (targetOrderId) {
      navigate(`/admin/orders?orderId=${targetOrderId}`);
    } else if (notif.type === 'ORDER') {
      navigate('/admin/orders');
    } else if (notif.type === 'REVIEW') {
      navigate('/admin/reviews');
    } else {
      navigate('/admin');
    }

    // 4. Background e read mark kora
    if (!notif.read) {
      setNotifications(prev =>
        prev.map(n => (n._id === notif._id ? { ...n, read: true } : n)),
      );
      try {
        await api.put(`/notifications/${notif._id}/read`);
      } catch (error) {
        console.error('Backend error:', error);
      }
    }
  };

  const menuItems = [
    {
      name: 'Dashboard',
      icon: <FiHome size={20} />,
      path: '/admin',
      permission: PERMISSIONS.DASHBOARD_VIEW,
    },
    {
      name: 'Products List',
      icon: <FiBox size={20} />,
      path: '/admin/products',
      permission: PERMISSIONS.PRODUCT_VIEW,
    },
    {
      name: 'Upload Product',
      icon: <FiPlusCircle size={20} />,
      path: '/admin/add-product',
      permission: PERMISSIONS.PRODUCT_CREATE,
    },
    {
      name: 'Orders',
      icon: <FiShoppingCart size={20} />,
      path: '/admin/orders',
      permission: PERMISSIONS.ORDER_VIEW,
    },
    {
      name: 'Customers',
      icon: <FiUsers size={20} />,
      path: '/admin/customers',
      permission: PERMISSIONS.CUSTOMER_VIEW,
    },
    {
      name: 'All Reviews',
      icon: <FiMessageSquare size={20} />,
      path: '/admin/reviews',
      permission: PERMISSIONS.REVIEW_VIEW,
    },
    {
      name: 'Manage Coupons',
      icon: <FiTag size={20} />,
      path: '/admin/coupons',
      permission: PERMISSIONS.COUPON_VIEW,
    },
    {
      name: 'Site Settings',
      icon: <FiSettings size={20} />,
      path: '/admin/site-settings',
      permission: PERMISSIONS.SETTINGS_MANAGE,
    },
    {
      name: 'Admin Users',
      icon: <FiShield size={20} />,
      path: '/admin/admin-users',
      permission: PERMISSIONS.USER_MANAGE,
    },
    {
      name: 'My Profile',
      icon: <FiUser size={20} />,
      path: '/admin/profile',
    },
  ];

  // Only render menus the current role has permission for.
  const visibleMenuItems = menuItems.filter(
    item => !item.permission || can(user, item.permission),
  );

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="flex h-screen bg-[#F4F7FE] font-poppins overflow-hidden">
      <aside
        className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-100 shadow-sm transition-all duration-300 flex flex-col hidden md:flex z-20`}
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
          {visibleMenuItems.map((item, index) => (
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

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-20 bg-white/90 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 z-50 shadow-xs relative">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2.5 bg-gray-50 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-black transition-colors hidden md:flex items-center justify-center border border-gray-100"
            >
              <FiMenu size={20} />
            </button>
          </div>
          <div className="flex items-center gap-4 relative">
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2.5 text-gray-500 hover:bg-gray-50 border border-gray-100 rounded-xl transition-colors cursor-pointer flex items-center justify-center"
              >
                <FiBell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-[#DB4444] rounded-full ring-2 ring-white animate-pulse"></span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 top-14 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 py-3 z-[99999] overflow-hidden">
                  <div className="px-4 pb-2 border-b border-gray-100 flex justify-between items-center">
                    <h4 className="font-bold text-sm text-gray-800">
                      Notifications
                    </h4>
                    <span className="text-xs text-[#DB4444] font-semibold bg-red-50 px-2 py-0.5 rounded-full">
                      {unreadCount} New
                    </span>
                  </div>
                  <div className="max-h-[350px] overflow-y-auto divide-y divide-gray-50">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-6">
                        No new notifications
                      </p>
                    ) : (
                      notifications.map(notif => (
                        <div
                          key={notif._id}
                          onClick={e => {
                            e.stopPropagation();
                            handleNotificationClick(notif);
                          }}
                          className={`p-3 transition-colors text-xs flex items-start gap-3 cursor-pointer pointer-events-auto ${notif.read ? 'bg-white text-gray-500' : 'bg-red-50/40 font-medium'}`}
                        >
                          <div className="p-2 bg-red-50 text-[#DB4444] rounded-lg flex-shrink-0">
                            {notif.type === 'ORDER' ? (
                              <FiShoppingCart size={14} />
                            ) : notif.type === 'REVIEW' ? (
                              <FiStar size={14} />
                            ) : (
                              <FiMessageSquare size={14} />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">
                              {notif.title}
                            </p>
                            <p className="text-gray-600 mt-0.5">
                              {notif.message}
                            </p>
                            <span className="text-[10px] text-gray-400 mt-1 block">
                              {new Date(notif.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <div
              onClick={() => navigate('/admin/profile')}
              className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 py-1.5 px-3 rounded-xl border border-transparent hover:border-gray-100 transition-all group"
            >
              <div className="w-9 h-9 bg-red-50 text-[#DB4444] rounded-xl flex items-center justify-center font-semibold overflow-hidden shadow-xs group-hover:scale-105 transition-transform">
                {user?.avatar?.url ? (
                  <img
                    src={getImageUrl(user.avatar)}
                    alt={user?.name || 'Admin'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FiUser size={18} />
                )}
              </div>
              <div className="hidden sm:block text-left">
                <span className="text-sm font-semibold text-gray-800 block leading-tight group-hover:text-[#DB4444] transition-colors">
                  {user?.name || 'Admin User'}
                </span>
                <span className="text-xs text-gray-400 block">
                  {ROLE_LABELS[normalizeRole(user?.role)] || 'Admin'}
                </span>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#F4F7FE] p-8">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
};
export default AdminDashboard;
