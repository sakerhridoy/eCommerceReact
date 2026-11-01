import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiDollarSign,
  FiPackage,
  FiShoppingCart,
  FiUsers,
  FiFileText,
} from 'react-icons/fi';
import api from '../../api/client';

const DashboardOverview = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalProducts: 16,
    newOrders: 0,
    customers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);

        const [statsRes, ordersRes] = await Promise.all([
          api.get('/dashboard/stats').catch(() => ({ data: {} })),
          api.get('/orders').catch(() => ({ data: { data: [] } })),
        ]);

        const dashboardData = statsRes.data?.data || statsRes.data || {};
        const allOrders = ordersRes.data?.data || ordersRes.data?.orders || [];

        const paidOrders = Array.isArray(allOrders)
          ? allOrders.filter(
              order =>
                order.paymentStatus &&
                order.paymentStatus.toUpperCase() === 'PAID',
            )
          : [];

        const calculatedTotalSales = paidOrders.reduce(
          (acc, order) =>
            acc +
            Number(
              order.total ||
                order.totalAmount ||
                order.grandTotal ||
                order.totalPrice ||
                order.amount ||
                0,
            ),
          0,
        );

        setStats({
          totalSales:
            calculatedTotalSales > 0
              ? calculatedTotalSales
              : dashboardData?.totalRevenue || 0,
          totalProducts: dashboardData?.totalProducts || 16,
          newOrders: dashboardData?.totalOrders || allOrders.length || 0,
          customers: dashboardData?.totalUsers || 0,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="font-poppins">
      <h2 className="text-2xl font-bold text-black mb-6">Dashboard Overview</h2>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading Stats...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            to="/admin/sales-report"
            className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-green-500 text-2xl">
              <FiDollarSign />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Sales</p>
              <h3 className="text-2xl font-bold text-black">
                ৳{stats.totalSales.toLocaleString()}
              </h3>
            </div>
          </Link>

          <Link
            to="/admin/products"
            className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 text-2xl">
              <FiPackage />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">
                Total Products
              </p>
              <h3 className="text-2xl font-bold text-black">
                {stats.totalProducts}
              </h3>
            </div>
          </Link>

          <Link
            to="/admin/orders"
            className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 text-2xl">
              <FiShoppingCart />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">New Orders</p>
              <h3 className="text-2xl font-bold text-black">
                {stats.newOrders}
              </h3>
            </div>
          </Link>

          <Link
            to="/admin/customers"
            className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center text-purple-500 text-2xl">
              <FiUsers />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Customers</p>
              <h3 className="text-2xl font-bold text-black">
                {stats.customers}
              </h3>
            </div>
          </Link>

          {/* ================= MANAGE ABOUT PAGE CARD ================= */}
          <Link
            to="/admin/manage-about"
            className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 text-2xl">
              <FiFileText />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Manage CMS</p>
              <h3 className="text-xl font-bold text-black">About Page</h3>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
};

export default DashboardOverview;