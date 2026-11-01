import React, { useState, useEffect } from 'react';
import { FiDollarSign, FiCalendar, FiBox, FiUser } from 'react-icons/fi';
import api from '../../api/client';

const SalesReport = () => {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    const fetchSalesReport = async () => {
      try {
        setLoading(true);

        const response = await api.get('/orders');
        console.log('Orders API Response:', response.data);

        const allOrders = response.data?.data || response.data?.orders || [];

        const paidOrders = Array.isArray(allOrders)
          ? allOrders.filter(
              order =>
                order.paymentStatus &&
                order.paymentStatus.toUpperCase() === 'PAID',
            )
          : [];

        setSalesData(paidOrders);

        const total = paidOrders.reduce(
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
        setTotalRevenue(total);
      } catch (error) {
        console.error('Error fetching sales report:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSalesReport();
  }, []);

  return (
    <div className="bg-white rounded-sm shadow-sm border border-gray-100 min-h-[500px] font-poppins relative">
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-black flex items-center gap-2">
            <FiDollarSign className="text-green-500" /> Sales Report (Paid
            Products)
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Details of all successfully paid orders and products.
          </p>
        </div>

        <div className="bg-green-50 border border-green-100 px-5 py-3 rounded-lg flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xl">
            <FiDollarSign />
          </div>
          <div>
            <p className="text-xs text-green-600 font-semibold uppercase tracking-wider">
              Total Verified Sales
            </p>
            <h3 className="text-xl font-bold text-green-700">
              ৳{totalRevenue.toLocaleString()}
            </h3>
          </div>
        </div>
      </div>

      <div className="p-0 overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center py-20 text-gray-500">
            Loading sales data...
          </div>
        ) : salesData.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            No paid sales found yet.
          </div>
        ) : (
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50 text-gray-700 text-sm border-b border-gray-100">
                <th className="p-4 font-medium">Order ID</th>
                <th className="p-4 font-medium">Customer Details</th>
                <th className="p-4 font-medium">Products Purchased</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium text-center">Payment Status</th>
              </tr>
            </thead>
            <tbody>
              {salesData.map((order, index) => {
                const orderId = order._id || order.id || order.orderId;
                const formattedId =
                  order.orderNumber ||
                  (orderId ? String(orderId).slice(-6).toUpperCase() : 'N/A');
                const customerName =
                  order.user?.name ||
                  order.shippingAddress?.fullName ||
                  order.shippingAddress?.name ||
                  order.customer?.name ||
                  'Valued Customer';
                const orderItems =
                  order.items || order.products || order.cartItems || [];
                const orderTotal = Number(
                  order.total ||
                    order.totalAmount ||
                    order.grandTotal ||
                    order.totalPrice ||
                    order.amount ||
                    0,
                );
                const orderDate =
                  order.createdAt || order.date || order.orderDate;
                const paymentStatus = order.paymentStatus || 'PAID';

                return (
                  <tr
                    key={orderId || index}
                    className="border-b border-gray-50 hover:bg-gray-50 text-sm transition-colors text-gray-800"
                  >
                    <td className="p-4 font-medium text-black">
                      #{formattedId}
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <FiUser className="text-gray-400" />
                        <span className="font-medium text-gray-700">
                          {customerName}
                        </span>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex flex-col gap-1 max-w-[250px]">
                        {orderItems.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 text-xs text-gray-600 bg-white border rounded px-2 py-1 truncate"
                          >
                            <FiBox className="text-blue-400 shrink-0" />
                            <span
                              className="truncate"
                              title={
                                item.product?.name || item.name || item.title
                              }
                            >
                              {item.product?.name ||
                                item.name ||
                                item.title ||
                                'Product'}
                            </span>
                            <span className="font-semibold text-black shrink-0">
                              x {item.quantity || item.qty || 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>

                    <td className="p-4 text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <FiCalendar className="text-gray-400" />
                        {orderDate
                          ? new Date(orderDate).toLocaleDateString()
                          : 'N/A'}
                      </div>
                    </td>

                    <td className="p-4 font-bold text-black">
                      ৳{orderTotal.toLocaleString()}
                    </td>

                    <td className="p-4 text-center">
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[11px] font-bold tracking-wide uppercase border border-green-200">
                        {paymentStatus}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SalesReport;