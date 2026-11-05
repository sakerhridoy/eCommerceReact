import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaFilePdf } from 'react-icons/fa';
import { MdOutlineRemoveShoppingCart } from 'react-icons/md';

// API import - If this still shows error, try changing to '../../api/client'
import api from '../../api/client';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const OrderSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const navigate = useNavigate();

  const [countdown, setCountdown] = useState(30);
  const [orderDetails, setOrderDetails] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [fetchError, setFetchError] = useState('');

  // Fetch full order details for the PDF Receipt
  useEffect(() => {
    if (orderId) {
      const fetchOrderDetails = async () => {
        try {
          const cleanId = orderId.trim();

          // FIX: Safety Check for Vite ESM/CommonJS default export glitch
          const apiClient = api.default || api;

          // If the import path is completely wrong, throw a clear warning
          if (typeof apiClient.get !== 'function') {
            throw new Error(
              "API import path mismatch. Change '../../api/client' to '../../api/client' at the top of the file.",
            );
          }

          const res = await apiClient.get(`/orders/${cleanId}`);
          setOrderDetails(res.data.data);
          setFetchError('');
        } catch (error) {
          console.error('Failed to fetch order details for receipt:', error);
          setFetchError(
            error.response?.data?.message ||
              error.message ||
              'Could not load receipt data.',
          );
        }
      };
      fetchOrderDetails();
    }
  }, [orderId]);

  // Countdown timer
  useEffect(() => {
    if (orderId) {
      const timer = setInterval(() => {
        setCountdown(prev => Math.max(0, prev - 1));
      }, 1000);

      if (countdown === 0) {
        navigate('/my-orders', { replace: true });
      }

      return () => clearInterval(timer);
    }
  }, [orderId, countdown, navigate]);

  // Generate Professional PDF Receipt
  const handleDownloadReceipt = () => {
    if (!orderDetails) return;
    setIsDownloading(true);

    try {
      const doc = new jsPDF();
      const order = orderDetails;

      doc.setFontSize(24);
      doc.setTextColor(219, 68, 68);
      doc.setFont('helvetica', 'bold');
      doc.text('EXCLUSIVE', 14, 22);

      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      doc.text('ORDER RECEIPT', 14, 32);

      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text(`Order No: ${order.orderNumber}`, 14, 42);
      doc.text(
        `Date: ${new Date(order.createdAt).toLocaleDateString()}`,
        14,
        48,
      );
      doc.text(`Payment Method: ${order.paymentMethod?.toUpperCase()}`, 14, 54);
      doc.text(`Payment Status: ${order.paymentStatus?.toUpperCase()}`, 14, 60);

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

      const addressText = `${order.shippingAddress?.street}, ${order.shippingAddress?.city}, ${order.shippingAddress?.state} - ${order.shippingAddress?.zipCode}`;
      const splitAddress = doc.splitTextToSize(`Address: ${addressText}`, 80);
      doc.text(splitAddress, 120, 60);

      const tableColumn = [
        'SL',
        'Product Name',
        'Variant',
        'Price',
        'Qty',
        'Total',
      ];
      const tableRows = [];

      order.items.forEach((item, index) => {
        const productName =
          item.product?.title || item.product?.name || 'Product';
        const variant = item.variant
          ? Object.values(item.variant).join(', ')
          : '-';
        const price = `Tk ${item.price.toFixed(2)}`;
        const qty = item.quantity;
        const total = `Tk ${(item.price * item.quantity).toFixed(2)}`;

        tableRows.push([index + 1, productName, variant, price, qty, total]);
      });

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

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`Subtotal:`, 140, finalY + 12);
      doc.text(`Tk ${order.subtotal.toFixed(2)}`, 195, finalY + 12, {
        align: 'right',
      });

      let currentY = finalY + 12;

      if (order.discount > 0) {
        currentY += 6;
        doc.setTextColor(0, 128, 0);
        doc.text(`Discount:`, 140, currentY);
        doc.text(`- Tk ${order.discount.toFixed(2)}`, 195, currentY, {
          align: 'right',
        });
      }

      currentY += 6;
      doc.setTextColor(0, 0, 0);
      doc.text(`Shipping:`, 140, currentY);
      doc.text(`Tk 0.00`, 195, currentY, { align: 'right' });

      currentY += 8;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(219, 68, 68);
      doc.text(`Grand Total:`, 140, currentY);
      doc.text(`Tk ${order.total.toFixed(2)}`, 195, currentY, {
        align: 'right',
      });

      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(150, 150, 150);
      doc.text('Thank you for shopping with Exclusive!', 105, 280, {
        align: 'center',
      });

      doc.save(`Invoice_${order.orderNumber}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(
        'Could not generate receipt. Please try again from My Orders page.',
      );
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <section className="py-20 md:py-32 font-poppins bg-gray-50/30 min-h-[60vh] flex items-center">
      <div className="container mx-auto px-4 text-center">
        {orderId ? (
          <div className="max-w-2xl mx-auto bg-white p-8 md:p-12 rounded-sm shadow-[0px_0px_20px_rgba(0,0,0,0.05)] border border-gray-100">
            <FaCheckCircle className="text-6xl md:text-7xl text-green-500 mx-auto mb-6 drop-shadow-sm animate-bounce" />

            <h2 className="text-3xl md:text-4xl font-inter font-semibold mb-4 text-black">
              Order Successful!
            </h2>

            <p className="text-gray-600 mb-6 text-sm md:text-base leading-relaxed">
              Thank you for your purchase. Your order has been placed
              successfully and is currently being processed.
            </p>

            <div className="bg-[#F5F5F5] p-5 rounded-sm mb-8 inline-block w-full max-w-md border border-gray-200">
              <p className="text-sm text-gray-500 mb-1 font-medium">
                Transaction / Order ID:
              </p>
              <p className="text-lg font-semibold text-black break-all tracking-wide">
                {orderDetails?.orderNumber || orderId}
              </p>
            </div>

            {/* ERROR DISPLAY AREA */}
            {fetchError && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-sm text-sm font-medium">
                Warning: {fetchError}
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link
                to="/my-orders"
                className="bg-[#DB4444] text-white px-8 py-3.5 rounded-sm font-medium hover:bg-red-600 transition-colors shadow-sm w-full sm:w-auto"
              >
                View My Orders
              </Link>

              <button
                onClick={handleDownloadReceipt}
                disabled={!orderDetails || isDownloading}
                className="flex items-center justify-center gap-2 bg-gray-900 text-white px-8 py-3.5 rounded-sm font-medium hover:bg-black transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
              >
                <FaFilePdf className="text-lg" />
                {!orderDetails && !fetchError
                  ? 'Loading Data...'
                  : isDownloading
                    ? 'Generating...'
                    : 'Download Receipt'}
              </button>
            </div>

            <p className="text-xs text-gray-400 mt-10 font-medium">
              Redirecting to your account in{' '}
              <span className="text-[#DB4444] text-sm">{countdown}</span>{' '}
              seconds...
            </p>
          </div>
        ) : (
          /* ================= ERROR ================= */
          <div className="max-w-lg mx-auto bg-white p-8 md:p-12 rounded-sm shadow-[0px_0px_20px_rgba(0,0,0,0.05)] border border-gray-100">
            <MdOutlineRemoveShoppingCart className="text-6xl md:text-7xl text-[#DB4444] mx-auto mb-6 opacity-80" />

            <h2 className="text-2xl md:text-3xl font-inter font-semibold mb-4 text-black">
              No recent order found
            </h2>

            <p className="text-gray-500 mb-8 text-sm md:text-base">
              We couldn't find any valid order details in this link. Please
              check your account or continue shopping.
            </p>

            <Link
              to="/shop"
              className="bg-[#DB4444] text-white px-8 py-3.5 rounded-sm font-medium hover:bg-red-600 transition-colors inline-block shadow-sm"
            >
              Back to Shop
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default OrderSuccess;