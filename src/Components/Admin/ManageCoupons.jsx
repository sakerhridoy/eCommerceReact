import React, { useState, useEffect } from 'react';
import {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from '../../api/catalog';
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiX,
  FiTag,
  FiAlertCircle,
  FiCheck,
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { can, PERMISSIONS } from '../../utils/permissions';

const ManageCoupons = () => {
  const { user } = useAuth();
  const canManage = can(user, PERMISSIONS.COUPON_MANAGE);
  const [coupons, setCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Initial Form State (discountType lowercase kore dewa holo backend validation er jonno)
  const initialFormState = {
    code: '',
    discountType: 'percentage',
    discountValue: '',
    maxDiscountAmount: '',
    minimumPurchase: '',
    expiryDate: '',
    usageLimit: '',
    perCustomerLimit: 1,
    isFirstOrderOnly: false,
    active: true,
  };

  const [formData, setFormData] = useState(initialFormState);

  const fetchCoupons = async () => {
    setIsLoading(true);
    try {
      const data = await getCoupons();
      setCoupons(data || []);
    } catch (error) {
      console.error('Failed to fetch coupons:', error);
      showMessage('error', 'Failed to load coupons.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const handleInputChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const normalizeNumber = value => {
    if (value === '' || value === null || value === undefined) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const openModalForCreate = () => {
    setFormData(initialFormState);
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openModalForEdit = coupon => {
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType
        ? coupon.discountType.toLowerCase()
        : 'percentage',
      discountValue: coupon.discountValue,
      maxDiscountAmount: coupon.maxDiscountAmount || '',
      minimumPurchase: coupon.minimumPurchase || '',
      expiryDate: new Date(coupon.expiryDate).toISOString().split('T')[0],
      usageLimit: coupon.usageLimit || '',
      perCustomerLimit: coupon.perCustomerLimit || 1,
      isFirstOrderOnly: coupon.isFirstOrderOnly || false,
      active: coupon.active,
    });
    setEditingId(coupon._id);
    setIsModalOpen(true);
  };

  // Handle Submit (Create/Update)
  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const discountValue = Number(formData.discountValue);
      const minimumPurchase = normalizeNumber(formData.minimumPurchase) ?? 0;
      const perCustomerLimit = normalizeNumber(formData.perCustomerLimit) ?? 1;

      const payload = {
        code: String(formData.code).trim().toUpperCase(),
        discountType: String(formData.discountType).toLowerCase(), // Always lowercase for backend Zod validation
        discountValue,
        maxDiscountAmount:
          String(formData.discountType).toLowerCase() === 'percentage'
            ? normalizeNumber(formData.maxDiscountAmount)
            : null,
        minimumPurchase,
        expiryDate: formData.expiryDate,
        usageLimit: normalizeNumber(formData.usageLimit),
        perCustomerLimit,
        isFirstOrderOnly: Boolean(formData.isFirstOrderOnly),
        active: Boolean(formData.active),
      };

      if (
        !payload.code ||
        !payload.expiryDate ||
        !Number.isFinite(discountValue)
      ) {
        showMessage('error', 'Please fill in all required coupon fields.');
        return;
      }

      if (editingId) {
        await updateCoupon(editingId, payload);
        showMessage('success', 'Coupon updated successfully!');
      } else {
        await createCoupon(payload);
        showMessage('success', 'Coupon created successfully!');
      }

      setIsModalOpen(false);
      fetchCoupons();
    } catch (error) {
      showMessage(
        'error',
        error?.response?.data?.message ||
          error?.message ||
          'Something went wrong',
      );
    }
  };

  // Handle Delete
  const handleDelete = async id => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    try {
      await deleteCoupon(id);
      showMessage('success', 'Coupon deleted successfully!');
      fetchCoupons();
    } catch (error) {
      showMessage(
        'error',
        error?.response?.data?.message || 'Failed to delete coupon.',
      );
    }
  };

  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
            Manage Coupons
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Create and manage your discount codes
          </p>
        </div>
        {canManage && (
          <button
            onClick={openModalForCreate}
            className="flex items-center gap-2 bg-gradient-to-r from-[#DB4444] to-[#b80808] text-white px-5 py-2.5 rounded-xl font-medium shadow-md shadow-[#DB4444]/20 hover:shadow-lg hover:shadow-[#DB4444]/30 transition-all duration-300"
          >
            <FiPlus size={18} />
            Add New Coupon
          </button>
        )}
      </div>

      {/* Messages */}
      {message.text && (
        <div
          className={`p-4 mb-6 rounded-xl flex items-center gap-3 text-sm font-medium ${message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}
        >
          <FiAlertCircle size={18} />
          {message.text}
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-500 uppercase tracking-wider">
                <th className="p-5 font-medium">Coupon Code</th>
                <th className="p-5 font-medium">Discount</th>
                <th className="p-5 font-medium">Expiry Date</th>
                <th className="p-5 font-medium">Usage</th>
                <th className="p-5 font-medium">Status</th>
                {canManage && (
                  <th className="p-5 font-medium text-right">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={canManage ? 6 : 5}
                    className="p-8 text-center text-gray-400"
                  >
                    Loading coupons...
                  </td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={canManage ? 6 : 5} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <FiTag size={48} className="mb-4 text-gray-200" />
                      <p className="text-base font-medium text-gray-600">
                        No coupons found
                      </p>
                      {canManage && (
                        <p className="text-sm mt-1">
                          Click "Add New Coupon" to create one.
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                coupons.map(coupon => (
                  <tr
                    key={coupon._id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="p-5">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-semibold bg-gray-100 text-gray-800 tracking-widest">
                        {coupon.code}
                      </span>
                    </td>
                    <td className="p-5 text-sm text-gray-700 font-medium">
                      {coupon.discountType &&
                      coupon.discountType.toLowerCase() === 'percentage'
                        ? `${coupon.discountValue}% OFF`
                        : `৳${coupon.discountValue} OFF`}
                    </td>
                    <td className="p-5 text-sm text-gray-600">
                      {new Date(coupon.expiryDate).toLocaleDateString('en-GB')}
                    </td>
                    <td className="p-5 text-sm text-gray-600">
                      {coupon.usedCount}{' '}
                      {coupon.usageLimit
                        ? `/ ${coupon.usageLimit}`
                        : ' (Unlimited)'}
                    </td>
                    <td className="p-5">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${coupon.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                      >
                        {coupon.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    {canManage && (
                      <td className="p-5 text-right space-x-3">
                        <button
                          onClick={() => openModalForEdit(coupon)}
                          className="p-2 text-gray-400 hover:text-[#DB4444] hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <FiEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(coupon._id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Premium Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-800">
                {editingId ? 'Edit Coupon' : 'Create New Coupon'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <form
                id="couponForm"
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                {/* Row 1 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Coupon Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. SUMMER50"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#DB4444] focus:ring-1 focus:ring-[#DB4444] transition-all uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Discount Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="discountType"
                      value={formData.discountType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#DB4444] focus:ring-1 focus:ring-[#DB4444] transition-all"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (৳)</option>
                    </select>
                  </div>
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Discount Value <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="discountValue"
                      value={formData.discountValue}
                      onChange={handleInputChange}
                      required
                      min="0"
                      placeholder={
                        formData.discountType === 'percentage'
                          ? 'e.g. 20'
                          : 'e.g. 500'
                      }
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#DB4444] focus:ring-1 focus:ring-[#DB4444] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Max Discount (৳){' '}
                      <span className="text-xs text-gray-400 font-normal">
                        (Optional)
                      </span>
                    </label>
                    <input
                      type="number"
                      name="maxDiscountAmount"
                      value={formData.maxDiscountAmount}
                      onChange={handleInputChange}
                      min="0"
                      placeholder="e.g. 1000"
                      disabled={formData.discountType === 'fixed'}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#DB4444] focus:ring-1 focus:ring-[#DB4444] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Row 3 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Minimum Purchase (৳){' '}
                      <span className="text-xs text-gray-400 font-normal">
                        (Optional)
                      </span>
                    </label>
                    <input
                      type="number"
                      name="minimumPurchase"
                      value={formData.minimumPurchase}
                      onChange={handleInputChange}
                      min="0"
                      placeholder="e.g. 2000"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#DB4444] focus:ring-1 focus:ring-[#DB4444] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Expiry Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#DB4444] focus:ring-1 focus:ring-[#DB4444] transition-all"
                    />
                  </div>
                </div>

                {/* Row 4 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Total Usage Limit{' '}
                      <span className="text-xs text-gray-400 font-normal">
                        (Optional)
                      </span>
                    </label>
                    <input
                      type="number"
                      name="usageLimit"
                      value={formData.usageLimit}
                      onChange={handleInputChange}
                      min="1"
                      placeholder="e.g. 100 (Leave empty for unlimited)"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#DB4444] focus:ring-1 focus:ring-[#DB4444] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Per Customer Limit <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="perCustomerLimit"
                      value={formData.perCustomerLimit}
                      onChange={handleInputChange}
                      min="1"
                      required
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#DB4444] focus:ring-1 focus:ring-[#DB4444] transition-all"
                    />
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="flex flex-col sm:flex-row gap-6 pt-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        name="isFirstOrderOnly"
                        checked={formData.isFirstOrderOnly}
                        onChange={handleInputChange}
                        className="peer sr-only"
                      />
                      <div className="w-5 h-5 border-2 border-gray-300 rounded-md peer-checked:bg-[#DB4444] peer-checked:border-[#DB4444] transition-all"></div>
                      <FiCheck
                        size={14}
                        className="absolute left-0.5 top-0.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                      />
                    </div>
                    <span className="text-sm text-gray-700 group-hover:text-black transition-colors">
                      First Order Only
                    </span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        name="active"
                        checked={formData.active}
                        onChange={handleInputChange}
                        className="peer sr-only"
                      />
                      <div className="w-5 h-5 border-2 border-gray-300 rounded-md peer-checked:bg-green-500 peer-checked:border-green-500 transition-all"></div>
                      <FiCheck
                        size={14}
                        className="absolute left-0.5 top-0.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                      />
                    </div>
                    <span className="text-sm text-gray-700 group-hover:text-black transition-colors">
                      Active Status
                    </span>
                  </label>
                </div>
              </form>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                form="couponForm"
                type="submit"
                className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#DB4444] to-[#b80808] rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                {editingId ? 'Update Coupon' : 'Save Coupon'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCoupons;