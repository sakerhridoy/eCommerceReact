import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FiEye, FiX, FiTruck, FiCreditCard, FiPackage } from 'react-icons/fi';
import { FaFileExcel, FaFilePdf } from 'react-icons/fa';
import Swal from 'sweetalert2';
import {
  getAdminOrders,
  updateAdminOrderStatus,
  bulkUpdateOrderStatus,
  bulkUpdateOrderPaymentStatus,
} from '../../api/catalog';
import api from '../../api/client';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import DataTable, { buildQueryParams } from './DataTable';
import { useAuth } from '../../contexts/AuthContext';
import { can, PERMISSIONS } from '../../utils/permissions';

const DATE_PRESETS = [
  { value: '', label: 'All Time' },
  { value: 'TODAY', label: 'Today' },
  { value: 'WEEK', label: 'Last 7 Days' },
  { value: 'MONTH', label: 'Last 30 Days' },
];

const ORDER_STATUSES = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
const PAYMENT_STATUSES = ['PENDING', 'PAID', 'FAILED'];

const buildDateFilters = preset => {
  if (!preset) return {};
  const now = new Date();
  const to = now.toISOString();

  if (preset === 'TODAY') {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    return { createdFrom: start.toISOString(), createdTo: to };
  }
  if (preset === 'WEEK') {
    const start = new Date(now);
    start.setDate(start.getDate() - 7);
    return { createdFrom: start.toISOString(), createdTo: to };
  }
  if (preset === 'MONTH') {
    const start = new Date(now);
    start.setMonth(start.getMonth() - 1);
    return { createdFrom: start.toISOString(), createdTo: to };
  }
  return {};
};

const normalizeStatus = value => (value || '').toUpperCase();

const getStatusColor = status => {
  switch (normalizeStatus(status)) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'PROCESSING':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'SHIPPED':
      return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'DELIVERED':
    case 'PAID':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'CANCELLED':
    case 'FAILED':
    case 'UNPAID':
      return 'bg-red-100 text-red-700 border-red-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const AdminOrders = () => {
  const { user } = useAuth();
  const canUpdate = can(user, PERMISSIONS.ORDER_UPDATE);
  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState(null);
  const [datePreset, setDatePreset] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const location = useLocation();
  const handledOrderIdRef = useRef(null);

  const extraFilters = useMemo(
    () => buildDateFilters(datePreset),
    [datePreset],
  );

  const reload = useCallback(() => setReloadKey(key => key + 1), []);

  // ---- Server-side data fetching ----
  useEffect(() => {
    if (!query) return;
    let cancelled = false;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const { orders: list, meta: responseMeta } = await getAdminOrders(
          buildQueryParams(query),
        );
        if (cancelled) return;
        setOrders(list);
        setMeta(responseMeta);
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to load orders:', err);
        setError('Failed to load orders. Please try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchOrders();
    return () => {
      cancelled = true;
    };
  }, [query, reloadKey]);

  // ---- Notification deep-link: open the matching order's modal ----
  useEffect(() => {
    const orderIdFromUrl = new URLSearchParams(location.search).get('orderId');
    if (!orderIdFromUrl || orders.length === 0) return;

    const normalizeId = value =>
      String(value ?? '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');
    const stripOrderPrefix = value =>
      value.startsWith('ord') ? value.slice(3) : value;

    const target = normalizeId(orderIdFromUrl);
    if (!target) return;
    if (handledOrderIdRef.current === target) return;

    const targetNoPrefix = stripOrderPrefix(target);

    const foundOrder = orders.find(order => {
      const candidates = [order._id, order.orderNumber]
        .map(normalizeId)
        .filter(Boolean);

      return candidates.some(candidate => {
        if (candidate === target) return true;
        const candidateNoPrefix = stripOrderPrefix(candidate);
        if (candidateNoPrefix && candidateNoPrefix === targetNoPrefix) return true;
        return (
          targetNoPrefix.length >= 4 &&
          candidateNoPrefix.length >= 4 &&
          (candidateNoPrefix.includes(targetNoPrefix) ||
            targetNoPrefix.includes(candidateNoPrefix))
        );
      });
    });

    if (foundOrder) {
      handledOrderIdRef.current = target;
      setSelectedOrder(foundOrder);
      setIsModalOpen(true);
      return;
    }

    // Not on the current page — fetch it directly by id / order number.
    const fetchSingleOrder = async () => {
      try {
        const response = await api.get(`/orders/${orderIdFromUrl}`);
        const order = response.data?.data || response.data;
        if (order) {
          handledOrderIdRef.current = target;
          setSelectedOrder(order);
          setIsModalOpen(true);
        }
      } catch (err) {
        console.error('Failed to fetch specific order:', err);
      }
    };
    fetchSingleOrder();
  }, [location.search, orders]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      await updateAdminOrderStatus(orderId, newStatus);
      setOrders(prev =>
        prev.map(o =>
          o._id === orderId ? { ...o, orderStatus: newStatus } : o,
        ),
      );
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(prev => ({ ...prev, orderStatus: newStatus }));
      }
    } catch (err) {
      console.error('Failed to update order status:', err);
      Swal.fire('Error', 'Failed to update order status.', 'error');
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
      setOrders(prev =>
        prev.map(o =>
          o._id === orderId ? { ...o, paymentStatus: newPaymentStatus } : o,
        ),
      );
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(prev => ({ ...prev, paymentStatus: newPaymentStatus }));
      }
    } catch (err) {
      console.error('Failed to update payment status:', err);
      Swal.fire('Error', 'Failed to update payment status.', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const runBulk = async (ids, runner, successText) => {
    const result = await Swal.fire({
      title: 'Apply bulk action?',
      text: `${successText} for ${ids.length} order(s)?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#DB4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, apply',
    });
    if (!result.isConfirmed) return;

    try {
      const response = await runner(ids);
      Swal.fire(
        'Success',
        response?.message || `${ids.length} order(s) updated.`,
        'success',
      );
      reload();
    } catch (err) {
      console.error('Bulk action failed:', err);
      Swal.fire('Error', 'Bulk action failed. Please try again.', 'error');
    }
  };

  const handleExportExcel = async () => {
    try {
      const response = await api.get('/orders/export/excel', {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `Admin_Orders_${new Date().toLocaleDateString()}.xlsx`;
      link.click();
    } catch (err) {
      Swal.fire('Error', 'Failed to download excel from server.', 'error');
    }
  };

  const handleExportPDF = () => {
    if (orders.length === 0) {
      Swal.fire('Empty', 'No data to export on this page.', 'info');
      return;
    }
    const doc = new jsPDF('landscape');
    doc.setFontSize(20);
    doc.setTextColor(219, 68, 68);
    doc.setFont('helvetica', 'bold');
    doc.text('EXCLUSIVE - Order Report', 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
    doc.text(`Filters: ${datePreset || 'ALL'}`, 14, 34);
    doc.text(`Records on page: ${orders.length}`, 14, 40);

    autoTable(doc, {
      startY: 45,
      head: [
        [
          'SL',
          'Order ID',
          'Customer',
          'Date',
          'Items',
          'Status',
          'Payment',
          'Total (Tk)',
        ],
      ],
      body: orders.map((order, index) => [
        index + 1,
        order.orderNumber || order._id.slice(-6).toUpperCase(),
        order.user?.name || 'Guest',
        new Date(order.createdAt).toLocaleDateString(),
        order.items?.length || 0,
        normalizeStatus(order.orderStatus),
        normalizeStatus(order.paymentStatus || 'PENDING'),
        Number(order.total || 0).toFixed(2),
      ]),
      theme: 'grid',
      headStyles: { fillColor: [219, 68, 68] },
      styles: { fontSize: 9 },
    });
    doc.save(`Orders_Report_${datePreset || 'ALL'}_${Date.now()}.pdf`);
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'orderNumber',
        header: 'Order ID',
        cell: ({ row }) => (
          <span className="font-semibold text-gray-800">
            {row.original.orderNumber ||
              row.original._id.slice(-6).toUpperCase()}
          </span>
        ),
      },
      {
        id: 'customer',
        header: 'Customer',
        enableSorting: false,
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-gray-800">
              {row.original.user?.name || 'Guest'}
            </p>
            <p className="text-xs text-gray-400">
              {row.original.user?.email || ''}
            </p>
          </div>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Date',
        cell: ({ getValue }) => (
          <span className="text-gray-500">
            {new Date(getValue()).toLocaleDateString()}
          </span>
        ),
      },
      {
        id: 'items',
        header: 'Items',
        enableSorting: false,
        cell: ({ row }) => (
          <span className="inline-flex items-center gap-1.5 text-gray-600">
            <FiPackage size={14} className="text-gray-400" />
            {row.original.items?.length || 0}
          </span>
        ),
      },
      {
        accessorKey: 'total',
        header: 'Total',
        cell: ({ getValue }) => (
          <span className="font-semibold text-[#DB4444]">
            ৳{Number(getValue() || 0).toFixed(2)}
          </span>
        ),
      },
      {
        accessorKey: 'orderStatus',
        header: 'Order Status',
        meta: {
          filterKey: 'orderStatus',
          filterLabel: 'All Status',
          filterOptions: ORDER_STATUSES.map(s => ({ value: s, label: s })),
        },
        cell: ({ row }) =>
          canUpdate ? (
            <select
              value={normalizeStatus(row.original.orderStatus)}
              onChange={e =>
                handleStatusChange(row.original._id, e.target.value)
              }
              disabled={updatingId === row.original._id}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border outline-none cursor-pointer disabled:opacity-60 ${getStatusColor(
                row.original.orderStatus,
              )}`}
            >
              {ORDER_STATUSES.map(status => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          ) : (
            <span
              className={`inline-block px-2.5 py-1.5 rounded-lg text-xs font-semibold border ${getStatusColor(
                row.original.orderStatus,
              )}`}
            >
              {normalizeStatus(row.original.orderStatus)}
            </span>
          ),
      },
      {
        accessorKey: 'paymentStatus',
        header: 'Payment',
        meta: {
          filterKey: 'paymentStatus',
          filterLabel: 'All Payment',
          filterOptions: PAYMENT_STATUSES.map(s => ({ value: s, label: s })),
        },
        cell: ({ row }) =>
          canUpdate ? (
            <select
              value={normalizeStatus(row.original.paymentStatus || 'PENDING')}
              onChange={e =>
                handlePaymentStatusChange(row.original._id, e.target.value)
              }
              disabled={updatingId === row.original._id}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border outline-none cursor-pointer disabled:opacity-60 ${getStatusColor(
                row.original.paymentStatus,
              )}`}
            >
              {PAYMENT_STATUSES.map(status => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          ) : (
            <span
              className={`inline-block px-2.5 py-1.5 rounded-lg text-xs font-semibold border ${getStatusColor(
                row.original.paymentStatus || 'PENDING',
              )}`}
            >
              {normalizeStatus(row.original.paymentStatus || 'PENDING')}
            </span>
          ),
      },
      {
        id: 'actions',
        header: 'View',
        enableSorting: false,
        cell: ({ row }) => (
          <button
            onClick={() => {
              setSelectedOrder(row.original);
              setIsModalOpen(true);
            }}
            className="p-2 bg-gray-100 text-gray-600 hover:bg-[#DB4444] hover:text-white rounded-lg transition-colors"
            title="View Details"
          >
            <FiEye size={16} />
          </button>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [updatingId, selectedOrder, canUpdate],
  );

  return (
    <div className="font-poppins">
      <div className="mb-6">
        <h2 className="text-2xl font-bold font-inter text-black">
          Order Management
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Track, filter and update orders with server-side power.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={orders}
        loading={loading}
        error={error}
        meta={meta}
        enableSelection={canUpdate}
        extraFilters={extraFilters}
        onQueryChange={setQuery}
        onRetry={reload}
        getRowId={row => row._id}
        searchPlaceholder="Search by order ID, customer name or email..."
        emptyTitle="No orders found"
        emptyDescription="Try changing the search term or filters."
        toolbar={
          <>
            <select
              value={datePreset}
              onChange={e => setDatePreset(e.target.value)}
              className="bg-gray-50 border border-gray-200 px-3.5 py-2.5 rounded-xl text-sm outline-none cursor-pointer text-gray-600"
            >
              {DATE_PRESETS.map(preset => (
                <option key={preset.value} value={preset.value}>
                  {preset.label}
                </option>
              ))}
            </select>
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              <FaFileExcel /> Excel
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 bg-[#DB4444] hover:bg-red-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              <FaFilePdf /> PDF
            </button>
          </>
        }
        bulkActions={
          canUpdate
            ? ({ selectedIds, clearSelection }) => (
                <>
                  <div className="flex items-center gap-1.5">
                    <FiTruck size={14} className="text-gray-500" />
                    {['PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(
                      status => (
                        <button
                          key={status}
                          type="button"
                          onClick={() =>
                            runBulk(
                              selectedIds,
                              ids => bulkUpdateOrderStatus(ids, status),
                              `Set order status to ${status}`,
                            ).then(clearSelection)
                          }
                          className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold rounded-lg transition-colors"
                        >
                          {status}
                        </button>
                      ),
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 sm:border-l sm:border-red-200 sm:pl-3">
                    <FiCreditCard size={14} className="text-gray-500" />
                    {['PAID', 'PENDING', 'FAILED'].map(status => (
                      <button
                        key={status}
                        type="button"
                        onClick={() =>
                          runBulk(
                            selectedIds,
                            ids => bulkUpdateOrderPaymentStatus(ids, status),
                            `Set payment status to ${status}`,
                          ).then(clearSelection)
                        }
                        className="px-2.5 py-1.5 bg-gray-700 hover:bg-gray-800 text-white text-[11px] font-semibold rounded-lg transition-colors"
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </>
              )
            : undefined
        }
      />

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
                    Order Status
                  </h4>
                  <p className="font-semibold text-black">
                    {normalizeStatus(selectedOrder.orderStatus)}
                  </p>
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
                  {selectedOrder.shippingAddress?.city}
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
                            {item.product?.name || item.product?.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            Qty: {item.quantity}
                          </p>
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