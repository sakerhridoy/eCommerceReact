import React, { useEffect, useState } from 'react';
import { FiEye, FiSearch, FiX } from 'react-icons/fi';
import { getRecentOrders, updateAdminOrderStatus } from '../../api/catalog';
import api from '../../api/client';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getRecentOrders(50);
        setOrders(data);
      } catch (error) {
        console.error('Failed to load orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      await updateAdminOrderStatus(orderId, newStatus);

      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === orderId ? { ...order, orderStatus: newStatus } : order,
        ),
      );

      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(prev => ({ ...prev, orderStatus: newStatus }));
      }

      alert('Order status updated successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update order status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handlePaymentStatusChange = async (orderId, newPaymentStatus) => {
    try {
      setUpdatingId(orderId);

      await api.put(`/orders/${orderId}/payment-status`, {
        paymentStatus: newPaymentStatus,
      });

      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === orderId
            ? { ...order, paymentStatus: newPaymentStatus }
            : order,
        ),
      );

      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(prev => ({
          ...prev,
          paymentStatus: newPaymentStatus,
        }));
      }

      alert('Payment status updated successfully!');
    } catch (error) {
      alert(
        error.response?.data?.message || 'Failed to update payment status.',
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColor = status => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-700';
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-700';
      case 'DELIVERED':
      case 'PAID':
        return 'bg-green-100 text-green-700';
      case 'CANCELLED':
      case 'UNPAID':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleViewDetails = order => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  if (loading)
    return (
      <div className="text-center py-20 font-poppins">Loading orders...</div>
    );

  return (
    <div className="bg-white p-6 shadow-sm border border-gray-100 rounded-sm font-poppins relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold font-inter text-black">
          Order Management
        </h2>
        <div className="flex items-center bg-gray-50 border border-gray-200 px-4 py-2 rounded-md w-full md:w-64">
          <FiSearch className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search orders..."
            className="bg-transparent outline-none w-full text-sm"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-[#F8F9FA] text-gray-600 border-b border-gray-200 text-sm">
              <th className="p-4 font-medium">Order ID</th>
              <th className="p-4 font-medium">Customer</th>
              <th className="p-4 font-medium">Date</th>
              <th className="p-4 font-medium">Total Amount</th>
              <th className="p-4 font-medium">Order Status</th>
              <th className="p-4 font-medium">Payment Status</th>
              <th className="p-4 font-medium text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-gray-500">
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map(order => (
                <tr
                  key={order._id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors text-sm text-black"
                >
                  <td className="p-4 font-semibold">
                    {order.orderNumber || order._id.slice(-6).toUpperCase()}
                  </td>
                  <td className="p-4">{order.user?.name || 'Guest'}</td>
                  <td className="p-4 text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 font-semibold text-[#DB4444]">
                    ৳{order.total}
                  </td>
                  <td className="p-4">
                    <select
                      value={order.orderStatus}
                      onChange={e =>
                        handleStatusChange(order._id, e.target.value)
                      }
                      disabled={updatingId === order._id}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium outline-none cursor-pointer border border-gray-200 ${getStatusColor(
                        order.orderStatus,
                      )}`}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="PROCESSING">PROCESSING</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>

                  <td className="p-4">
                    <select
                      value={order.paymentStatus || 'PENDING'}
                      onChange={e =>
                        handlePaymentStatusChange(order._id, e.target.value)
                      }
                      disabled={updatingId === order._id}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium outline-none cursor-pointer border border-gray-200 ${getStatusColor(
                        order.paymentStatus,
                      )}`}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="PAID">PAID</option>
                      <option value="FAILED">FAILED</option>
                    </select>
                  </td>

                  <td className="p-4 text-center">
                    <div className="flex justify-center items-center gap-2">
                      <button
                        onClick={() => handleViewDetails(order)}
                        className="p-2 bg-gray-100 text-gray-600 hover:bg-[#DB4444] hover:text-white rounded transition-colors"
                        title="View Details"
                      >
                        <FiEye size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-md w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-5 border-b flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-black font-inter">
                Order Details
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 bg-gray-200 hover:bg-red-100 hover:text-red-600 rounded-full transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h4 className="text-sm text-gray-500 font-medium mb-1">
                    Order ID
                  </h4>
                  <p className="font-semibold text-black">
                    {selectedOrder.orderNumber || selectedOrder._id}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm text-gray-500 font-medium mb-1">
                    Order Date
                  </h4>
                  <p className="font-semibold text-black">
                    {new Date(selectedOrder.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm text-gray-500 font-medium mb-1">
                    Payment Method
                  </h4>
                  <p className="font-semibold text-black uppercase">
                    {selectedOrder.paymentMethod || 'COD'}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm text-gray-500 font-medium mb-1">
                    Order Status Update
                  </h4>
                  <select
                    value={selectedOrder.orderStatus}
                    onChange={e =>
                      handleStatusChange(selectedOrder._id, e.target.value)
                    }
                    className={`px-3 py-1.5 rounded-md text-xs font-medium outline-none cursor-pointer border border-gray-200 mt-1 ${getStatusColor(
                      selectedOrder.orderStatus,
                    )}`}
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="PROCESSING">PROCESSING</option>
                    <option value="SHIPPED">SHIPPED</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
                <div>
                  <h4 className="text-sm text-gray-500 font-medium mb-1">
                    Payment Status Update
                  </h4>
                  <select
                    value={selectedOrder.paymentStatus || 'PENDING'}
                    onChange={e =>
                      handlePaymentStatusChange(
                        selectedOrder._id,
                        e.target.value,
                      )
                    }
                    className={`px-3 py-1.5 rounded-md text-xs font-medium outline-none cursor-pointer border border-gray-200 mt-1 ${getStatusColor(
                      selectedOrder.paymentStatus,
                    )}`}
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="PAID">PAID</option>
                    <option value="FAILED">FAILED</option>
                  </select>
                </div>
              </div>

              <div className="mb-8 p-4 bg-gray-50 rounded-sm border border-gray-100">
                <h4 className="font-bold text-black mb-2">
                  Shipping Information
                </h4>
                <p className="text-sm text-gray-700">
                  <strong>Name:</strong> {selectedOrder.user?.name}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Phone:</strong> {selectedOrder.shippingAddress?.phone}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Address:</strong>{' '}
                  {selectedOrder.shippingAddress?.street},{' '}
                  {selectedOrder.shippingAddress?.city},{' '}
                  {selectedOrder.shippingAddress?.state}{' '}
                  {selectedOrder.shippingAddress?.zipCode},{' '}
                  {selectedOrder.shippingAddress?.country}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-black mb-4 border-b pb-2">
                  Products Purchased
                </h4>
                <div className="space-y-4">
                  {selectedOrder.items?.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between border-b pb-4 last:border-0"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={
                            item.product?.image ||
                            item.product?.images?.[0] ||
                            'https://via.placeholder.com/60'
                          }
                          alt="product"
                          className="w-16 h-16 object-cover rounded border"
                        />
                        <div>
                          <p className="font-medium text-black line-clamp-1">
                            {item.product?.name ||
                              item.product?.title ||
                              'Product Name'}
                          </p>
                          <p className="text-sm text-gray-500">
                            Qty: {item.quantity}
                          </p>
                          {item.variant && (
                            <p className="text-xs text-gray-400 mt-1">
                              Variant:{' '}
                              {typeof item.variant === 'object'
                                ? Object.values(item.variant).join(', ')
                                : item.variant}
                            </p>
                          )}
                        </div>
                      </div>
                      <p className="font-semibold text-black">
                        ৳{item.price * item.quantity}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-5 border-t bg-gray-50 flex flex-col items-end">
              <div className="w-full md:w-1/2 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal:</span>
                  <span>৳{selectedOrder.subtotal || selectedOrder.total}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping:</span>
                  <span>৳{selectedOrder.shippingCost || 0}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-sm text-[#DB4444]">
                    <span>Discount:</span>
                    <span>-৳{selectedOrder.discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold text-black border-t pt-2 mt-2">
                  <span>Total:</span>
                  <span>৳{selectedOrder.total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;