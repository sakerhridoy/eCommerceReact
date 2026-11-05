import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiEye,
  FiPackage,
  FiTruck,
  FiX,
  FiCheck,
  FiDownload,
} from 'react-icons/fi';
import { getMyOrders, cancelMyOrder } from '../../api/catalog';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal States
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Track Order Modal State
  const [trackingOrder, setTrackingOrder] = useState(null);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);

  // Download PDF State
  const [downloadingOrderId, setDownloadingOrderId] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getMyOrders();
        if (Array.isArray(data)) {
          setOrders(data);
        } else {
          setOrders([]);
        }
      } catch (err) {
        setError('Failed to load your orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleCancelOrder = async orderId => {
    const confirmCancel = window.confirm(
      'Are you sure you want to cancel this order?',
    );
    if (!confirmCancel) return;

    try {
      await cancelMyOrder(orderId);
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === orderId
            ? { ...order, orderStatus: 'CANCELLED' }
            : order,
        ),
      );
      alert('Order cancelled successfully!');
    } catch (error) {
      alert(error || 'Something went wrong while cancelling the order.');
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
        return 'bg-green-100 text-green-700';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleViewDetails = order => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleTrackOrder = order => {
    setTrackingOrder(order);
    setIsTrackModalOpen(true);
  };

  const getStepStatus = (currentStatus, stepName) => {
    const statuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
    const currentIndex = statuses.indexOf(currentStatus?.toUpperCase());
    const stepIndex = statuses.indexOf(stepName);

    if (currentStatus?.toUpperCase() === 'CANCELLED') return 'cancelled';
    if (currentIndex >= stepIndex) return 'completed';
    return 'pending';
  };

  // Generate Professional PDF Receipt from My Orders Page
  const handleDownloadReceipt = order => {
    setDownloadingOrderId(order._id);

    try {
      const doc = new jsPDF();

      // Header - Store Name
      doc.setFontSize(24);
      doc.setTextColor(219, 68, 68); // Exclusive Red Color #DB4444
      doc.setFont('helvetica', 'bold');
      doc.text('EXCLUSIVE', 14, 22);

      // Invoice Title
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      doc.text('ORDER RECEIPT', 14, 32);

      // Order Info (Left Side)
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text(
        `Order No: ${order.orderNumber || order._id.slice(-6).toUpperCase()}`,
        14,
        42,
      );
      doc.text(
        `Date: ${new Date(order.createdAt).toLocaleDateString()}`,
        14,
        48,
      );
      doc.text(
        `Payment Method: ${order.paymentMethod?.toUpperCase() || 'COD'}`,
        14,
        54,
      );
      doc.text(
        `Payment Status: ${order.paymentStatus?.toUpperCase() || 'PENDING'}`,
        14,
        60,
      );

      // Customer Info (Right Side)
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text('Billed To:', 120, 32);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.text(
        `Name: ${order.user?.name || order.user?.firstName || 'Customer'}`,
        120,
        42,
      );
      doc.text(`Email: ${order.user?.email || 'N/A'}`, 120, 48);
      doc.text(`Phone: ${order.shippingAddress?.phone || 'N/A'}`, 120, 54);

      // Formatting Address
      const addressText = order.shippingAddress
        ? `${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.zipCode}`
        : 'Address Not Available';
      const splitAddress = doc.splitTextToSize(`Address: ${addressText}`, 80);
      doc.text(splitAddress, 120, 60);

      // Table Data Preparation
      const tableColumn = [
        'SL',
        'Product Name',
        'Variant',
        'Price',
        'Qty',
        'Total',
      ];
      const tableRows = [];

      order.items?.forEach((item, index) => {
        const productName =
          item.product?.title || item.product?.name || 'Product';
        const variant =
          item.variant && typeof item.variant === 'object'
            ? Object.values(item.variant).join(', ')
            : '-';
        const price = `Tk ${(item.price || 0).toFixed(2)}`;
        const qty = item.quantity;
        const total = `Tk ${((item.price || 0) * item.quantity).toFixed(2)}`;

        tableRows.push([index + 1, productName, variant, price, qty, total]);
      });

      // Generate Table
      autoTable(doc, {
        startY: 75,
        head: [tableColumn],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [219, 68, 68], textColor: [255, 255, 255] },
        styles: { fontSize: 9, cellPadding: 4 },
        columnStyles: {
          0: { cellWidth: 15 },
          4: { halign: 'center' },
          5: { halign: 'right' },
        },
      });

      const finalY = doc.lastAutoTable.finalY || 75;
      const subtotalAmount = order.subtotal || order.total;
      const discountAmount = order.discount || 0;

      // Pricing Summary
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`Subtotal:`, 140, finalY + 12);
      doc.text(`Tk ${subtotalAmount.toFixed(2)}`, 195, finalY + 12, {
        align: 'right',
      });

      let currentY = finalY + 12;

      if (discountAmount > 0) {
        currentY += 6;
        doc.setTextColor(0, 128, 0);
        doc.text(`Discount:`, 140, currentY);
        doc.text(`- Tk ${discountAmount.toFixed(2)}`, 195, currentY, {
          align: 'right',
        });
      }

      currentY += 6;
      doc.setTextColor(0, 0, 0);
      doc.text(`Shipping:`, 140, currentY);
      doc.text(`Tk 0.00`, 195, currentY, { align: 'right' });

      // Grand Total
      currentY += 8;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(219, 68, 68);
      doc.text(`Grand Total:`, 140, currentY);
      doc.text(`Tk ${order.total.toFixed(2)}`, 195, currentY, {
        align: 'right',
      });

      // Footer
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(150, 150, 150);
      doc.text('Thank you for shopping with Exclusive!', 105, 280, {
        align: 'center',
      });

      // Save PDF
      doc.save(`Invoice_${order.orderNumber || order._id}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Could not generate receipt. Please try again.');
    } finally {
      setDownloadingOrderId(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20 font-poppins text-lg">
        Loading your orders...
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 md:py-20 font-poppins relative">
      <div className="mb-10 text-sm text-black/50">
        <Link to="/" className="hover:text-[#DB4444] transition-colors">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-black">My Orders</span>
      </div>

      <div className="bg-white shadow-sm border border-gray-100 rounded-sm p-6 md:p-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-[#DB4444] p-3 rounded-full text-white">
            <FiPackage size={24} />
          </div>
          <h2 className="text-2xl font-medium font-inter text-black">
            My Order History
          </h2>
        </div>

        {error && (
          <div className="p-4 mb-6 text-red-700 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        {orders.length === 0 && !error ? (
          <div className="text-center py-16 bg-gray-50 rounded-sm border border-dashed border-gray-200">
            <FiPackage className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500 mb-6">
              You haven't placed any orders yet.
            </p>
            <Link
              to="/shop"
              className="inline-block bg-[#DB4444] text-white px-8 py-3 rounded-sm hover:bg-red-600 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-[#F8F9FA] text-gray-600 border-b border-gray-200 text-sm">
                  <th className="p-4 font-medium">Order ID</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Items</th>
                  <th className="p-4 font-medium">Total Amount</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr
                    key={order._id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors text-sm text-black"
                  >
                    <td className="p-4 font-medium">
                      {order.orderNumber || order._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="p-4 text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">{order.items?.length || 0} item(s)</td>
                    <td className="p-4 font-semibold text-[#DB4444]">
                      ৳{order.total?.toFixed(2) || '0.00'}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}
                      >
                        {order.orderStatus}
                      </span>
                    </td>

                    {/* Action Column */}
                    <td className="p-4 text-center">
                      <div className="flex justify-center items-center gap-2">
                        {/* Download Receipt Button */}
                        <button
                          onClick={() => handleDownloadReceipt(order)}
                          disabled={downloadingOrderId === order._id}
                          className={`p-2 rounded transition-colors ${
                            downloadingOrderId === order._id
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              : 'bg-green-50 text-green-600 hover:bg-green-600 hover:text-white'
                          }`}
                          title="Download Receipt"
                        >
                          <FiDownload size={16} />
                        </button>

                        {/* View Details Button */}
                        <button
                          onClick={() => handleViewDetails(order)}
                          className="p-2 bg-gray-100 text-gray-600 hover:bg-[#DB4444] hover:text-white rounded transition-colors"
                          title="View Order Details"
                        >
                          <FiEye size={16} />
                        </button>

                        {/* Track Order Button */}
                        <button
                          onClick={() => handleTrackOrder(order)}
                          className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded transition-colors"
                          title="Track Order"
                        >
                          <FiTruck size={16} />
                        </button>

                        {/* Cancel Button */}
                        {(order.orderStatus?.toUpperCase() === 'PENDING' ||
                          order.orderStatus?.toUpperCase() ===
                            'PROCESSING') && (
                          <button
                            onClick={() => handleCancelOrder(order._id)}
                            className="px-3 py-1.5 bg-red-50 text-[#DB4444] text-xs font-medium border border-red-100 hover:bg-[#DB4444] hover:text-white rounded transition-colors"
                            title="Cancel Order"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ================= Order Details Modal ================= */}
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
                    Status
                  </h4>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium inline-block mt-1 ${getStatusColor(selectedOrder.orderStatus)}`}
                  >
                    {selectedOrder.orderStatus}
                  </span>
                </div>
              </div>

              <div className="mb-8 p-4 bg-gray-50 rounded-sm border border-gray-100">
                <h4 className="font-bold text-black mb-2">
                  Shipping Information
                </h4>
                <p className="text-sm text-gray-700">
                  <strong>Name:</strong>{' '}
                  {selectedOrder.user?.name || 'Customer'}
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
                            item.product?.images?.[0]?.url ||
                            item.product?.images?.[0] ||
                            'https://via.placeholder.com/60'
                          }
                          alt="product"
                          className="w-16 h-16 object-cover rounded border bg-white"
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
                        </div>
                      </div>
                      <p className="font-semibold text-black">
                        ৳{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-5 border-t bg-gray-50 flex flex-col items-end">
              <div className="w-full md:w-1/2 space-y-2">
                <div className="flex justify-between text-lg font-bold text-black border-t pt-2">
                  <span>Total:</span>
                  <span>৳{(selectedOrder.total || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= Track Order Modal with Progress Bar ================= */}
      {isTrackModalOpen && trackingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-md w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="p-5 border-b flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-black font-inter flex items-center gap-2">
                <FiTruck className="text-[#DB4444]" /> Track Order #
                {trackingOrder.orderNumber ||
                  trackingOrder._id.slice(-6).toUpperCase()}
              </h3>
              <button
                onClick={() => setIsTrackModalOpen(false)}
                className="p-2 bg-gray-200 hover:bg-red-100 hover:text-red-600 rounded-full transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="p-8">
              {trackingOrder.orderStatus?.toUpperCase() === 'CANCELLED' ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded text-center text-red-600 font-medium">
                  This order has been cancelled.
                </div>
              ) : (
                <div className="py-6">
                  <div className="flex justify-between relative">
                    {/* Progress Line */}
                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 z-0"></div>

                    {/* Steps */}
                    {[
                      { title: 'Pending', key: 'PENDING' },
                      { title: 'Processing', key: 'PROCESSING' },
                      { title: 'Shipped', key: 'SHIPPED' },
                      { title: 'Delivered', key: 'DELIVERED' },
                    ].map((step, idx) => {
                      const status = getStepStatus(
                        trackingOrder.orderStatus,
                        step.key,
                      );
                      const isCompleted = status === 'completed';

                      return (
                        <div
                          key={idx}
                          className="relative z-10 flex flex-col items-center"
                        >
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                              isCompleted
                                ? 'bg-[#DB4444] text-white'
                                : 'bg-gray-200 text-gray-500'
                            }`}
                          >
                            {isCompleted ? <FiCheck size={18} /> : idx + 1}
                          </div>
                          <span
                            className={`text-xs mt-2 font-medium ${isCompleted ? 'text-[#DB4444]' : 'text-gray-500'}`}
                          >
                            {step.title}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-10 p-4 bg-gray-50 rounded border border-gray-100 text-center">
                    <p className="text-sm text-gray-600">
                      Current Order Status:
                    </p>
                    <p className="text-lg font-bold text-[#DB4444] uppercase mt-1">
                      {trackingOrder.orderStatus}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t bg-gray-50 text-right">
              <button
                onClick={() => setIsTrackModalOpen(false)}
                className="bg-gray-800 text-white px-6 py-2 rounded text-sm hover:bg-black transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;