import React, { useEffect, useState } from 'react';
import {
  FiDollarSign,
  FiBox,
  FiShoppingCart,
  FiUsers,
  FiTrendingUp,
  FiArrowRight,
  FiAlertTriangle,
  FiAlertCircle,
} from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import {
  getRecentOrders,
  getDashboardStats,
  getInventoryAlerts,
} from '../../api/catalog';
import api from '../../api/client';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

const DashboardOverview = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [inventoryAlerts, setInventoryAlerts] = useState({
    threshold: 10,
    lowStockCount: 0,
    outOfStockCount: 0,
    lowStock: [],
    outOfStock: [],
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [ordersRes, statsRes, alertsRes] = await Promise.all([
          getRecentOrders(100),
          getDashboardStats().catch(() => null),
          getInventoryAlerts().catch(() => null),
        ]);

        const orders = Array.isArray(ordersRes)
          ? ordersRes
          : ordersRes?.data || [];

        if (alertsRes) {
          setInventoryAlerts({
            threshold: alertsRes.threshold ?? 10,
            lowStockCount: alertsRes.lowStockCount || 0,
            outOfStockCount: alertsRes.outOfStockCount || 0,
            lowStock: alertsRes.lowStock || [],
            outOfStock: alertsRes.outOfStock || [],
          });
        }

        if (statsRes) {
          setStats({
            totalSales: statsRes.totalSales || 0,
            totalRevenue: statsRes.totalRevenue || 0,
            totalProducts: statsRes.totalProducts || 0,
            totalOrders: statsRes.totalOrders || 0,
            totalCustomers: statsRes.totalUsers || 0,
          });
        }

        setRecentOrders(orders.slice(0, 5));

        const validOrders = orders.filter(
          order => order.orderStatus?.toUpperCase() !== 'CANCELLED',
        );

        // Format data for Recharts (Group sales by date)
        const salesByDate = {};
        validOrders.forEach(order => {
          const date = new Date(order.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          });
          salesByDate[date] = (salesByDate[date] || 0) + (order.total || 0);
        });

        const formattedChartData = Object.keys(salesByDate)
          .map(date => ({
            date,
            sales: salesByDate[date],
          }))
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(-7);

        if (formattedChartData.length === 0) {
          formattedChartData.push({
            date: 'Today',
            sales: statsRes?.totalSales || 0,
          });
        }

        setChartData(formattedChartData);
      } catch (error) {
        console.error('Failed to load dashboard metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    {
      title: 'Total Sales',
      value: `৳${stats.totalSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: <FiDollarSign size={24} className="text-green-600" />,
      bg: 'bg-green-100',
      path: '/admin/orders',
    },
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: <FiBox size={24} className="text-blue-600" />,
      bg: 'bg-blue-100',
      path: '/admin/products',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: <FiShoppingCart size={24} className="text-orange-600" />,
      bg: 'bg-orange-100',
      path: '/admin/orders',
    },
    {
      title: 'Customers',
      value: stats.totalCustomers,
      icon: <FiUsers size={24} className="text-purple-600" />,
      bg: 'bg-purple-100',
      path: '/admin/customers',
    },
  ];

  const getStatusColor = status => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-700';
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-700';
      case 'DELIVERED':
        return 'bg-green-100 text-green-700';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] font-poppins text-gray-500">
        Loading dashboard analytics...
      </div>
    );
  }

  return (
    <div className="w-full font-poppins relative z-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-inter text-gray-800 tracking-tight">
          Dashboard Overview
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Welcome back to your store's analytics & management overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div
            key={index}
            onClick={() => navigate(stat.path)}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-5 hover:shadow-md hover:border-red-200 transition-all duration-300 cursor-pointer group"
          >
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center ${stat.bg} group-hover:scale-110 transition-transform`}
            >
              {stat.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1 group-hover:text-[#DB4444] transition-colors">
                {stat.title}
              </p>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Inventory Alerts (Low / Out of Stock) */}
      {(inventoryAlerts.outOfStockCount > 0 ||
        inventoryAlerts.lowStockCount > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {inventoryAlerts.outOfStockCount > 0 && (
            <div className="bg-red-50 rounded-2xl p-6 border border-red-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center">
                    <FiAlertTriangle className="text-red-600" size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 font-inter">
                      Out of Stock
                    </h3>
                    <p className="text-xs text-red-600">
                      {inventoryAlerts.outOfStockCount} product(s) need
                      restocking
                    </p>
                  </div>
                </div>
                <Link
                  to="/admin/products?stockStatus=OUT"
                  className="text-xs font-semibold text-red-700 hover:underline whitespace-nowrap"
                >
                  View all
                </Link>
              </div>
              <ul className="space-y-2">
                {inventoryAlerts.outOfStock.slice(0, 5).map(product => (
                  <li
                    key={product._id}
                    className="flex items-center justify-between text-sm bg-white/70 rounded-lg px-3 py-2"
                  >
                    <span className="text-gray-700 truncate pr-3">
                      {product.title}
                    </span>
                    <span className="shrink-0 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 text-red-700">
                      0 left
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {inventoryAlerts.lowStockCount > 0 && (
            <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-amber-100 flex items-center justify-center">
                    <FiAlertCircle className="text-amber-600" size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 font-inter">
                      Low Stock
                    </h3>
                    <p className="text-xs text-amber-700">
                      {inventoryAlerts.lowStockCount} product(s) at or below{' '}
                      {inventoryAlerts.threshold}
                    </p>
                  </div>
                </div>
                <Link
                  to="/admin/products?stockStatus=LOW"
                  className="text-xs font-semibold text-amber-700 hover:underline whitespace-nowrap"
                >
                  View all
                </Link>
              </div>
              <ul className="space-y-2">
                {inventoryAlerts.lowStock.slice(0, 5).map(product => (
                  <li
                    key={product._id}
                    className="flex items-center justify-between text-sm bg-white/70 rounded-lg px-3 py-2"
                  >
                    <span className="text-gray-700 truncate pr-3">
                      {product.title}
                    </span>
                    <span className="shrink-0 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-700">
                      {product.stock} left
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Analytics & Recent Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Performance Recharts Visual Card */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm lg:col-span-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold font-inter text-gray-800">
                Sales Analytics
              </h3>
              <FiTrendingUp className="text-[#DB4444]" size={20} />
            </div>
            <p className="text-xs text-gray-400 mb-4">
              Revenue trend over recent days
            </p>
          </div>

          {/* Recharts Line Chart */}
          <div className="w-full h-44 my-2 overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={10} />
                <YAxis stroke="#9ca3af" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    fontSize: '12px',
                  }}
                  formatter={value => [`৳${value.toFixed(2)}`, 'Sales']}
                />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#DB4444"
                  strokeWidth={2.5}
                  dot={{ fill: '#DB4444', r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div
            onClick={() => navigate('/admin/orders')}
            className="bg-red-50 p-4 rounded-xl border border-red-100 text-center cursor-pointer hover:bg-red-100/60 transition-colors mt-4"
          >
            <span className="text-xs font-semibold uppercase tracking-wider text-[#DB4444] block mb-0.5">
              Total Revenue
            </span>
            <h2 className="text-xl font-extrabold text-gray-900">
              ৳
              {stats.totalRevenue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </h2>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm lg:col-span-2 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold font-inter text-gray-800">
              Recent Orders
            </h3>
            <Link
              to="/admin/orders"
              className="text-xs font-semibold text-[#DB4444] hover:underline flex items-center gap-1 cursor-pointer"
            >
              View All <FiArrowRight size={14} />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="flex-1 flex items-center justify-center py-12 text-gray-400 text-sm">
              No recent orders found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                    <th className="p-3 font-medium">Order ID</th>
                    <th className="p-3 font-medium">Customer</th>
                    <th className="p-3 font-medium">Amount</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3 font-medium text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {recentOrders.map(order => (
                    <tr
                      key={order._id}
                      className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors"
                    >
                      <td className="p-3 font-medium text-gray-800">
                        {order.orderNumber || order._id.slice(-6).toUpperCase()}
                      </td>
                      <td className="p-3 text-gray-600">
                        {order.user?.name || 'Guest'}
                      </td>
                      <td className="p-3 font-semibold text-[#DB4444]">
                        ৳{order.total?.toFixed(2)}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}
                        >
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => navigate('/admin/orders')}
                          className="px-3 py-1 bg-gray-100 hover:bg-[#DB4444] hover:text-white text-xs font-medium rounded transition-colors cursor-pointer"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
