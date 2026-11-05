import React, { useState, useEffect } from 'react';
import {
  FiSearch,
  FiMail,
  FiCalendar,
  FiEye,
  FiEdit,
  FiUserX,
  FiUserCheck,
  FiX,
  FiShield,
} from 'react-icons/fi';
import api from '../../api/client';
import { getAllCustomers } from '../../api/catalog';
import { useAuth } from '../../contexts/AuthContext';
import { can, PERMISSIONS, isAdminRole } from '../../utils/permissions';

const Customers = () => {
  const { user } = useAuth();
  const canManage = can(user, PERMISSIONS.CUSTOMER_MANAGE);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCustomersData();
  }, []);

  const fetchCustomersData = async () => {
    try {
      setLoading(true);
      const data = await getAllCustomers();
      const customerList = data?.data || data?.customers || data || [];

      if (Array.isArray(customerList)) {
        setCustomers(customerList.filter(item => !isAdminRole(item.role)));
      } else {
        setCustomers([]);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(
    customer =>
      customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // === Action Handlers ===

  const handleView = customer => {
    setSelectedCustomer(customer);
    setIsViewModalOpen(true);
  };

  const handleEditOpen = customer => {
    setSelectedCustomer(customer);
    setEditName(customer.name || '');
    setEditRole(customer.role || 'user');
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      setCustomers(
        customers.map(c =>
          c._id === selectedCustomer._id
            ? { ...c, name: editName, role: editRole }
            : c,
        ),
      );

      alert('Customer updated successfully!');
      setIsEditModalOpen(false);
    } catch (error) {
      console.error(error);
      alert('Failed to update customer');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Ban / Unban User
  const handleBanToggle = async customer => {
    const isBanned = customer.isBanned || customer.status === 'banned';
    const actionText = isBanned ? 'UNBAN' : 'BAN';

    if (
      !window.confirm(`Are you sure you want to ${actionText} this customer?`)
    )
      return;

    try {
      setCustomers(
        customers.map(c =>
          c._id === customer._id
            ? {
                ...c,
                isBanned: !isBanned,
                status: isBanned ? 'active' : 'banned',
              }
            : c,
        ),
      );
    } catch (error) {
      console.error(error);
      alert(`Failed to ${actionText} customer`);
    }
  };

  return (
    <div className="bg-white rounded-sm shadow-sm border border-gray-100 min-h-[500px] relative font-poppins">
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-black">Customer List</h2>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#F5F5F5] border border-transparent focus:border-[#DB4444] rounded outline-none text-sm transition-colors"
          />
          <FiSearch
            className="absolute left-3.5 top-3 text-gray-400"
            size={18}
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="p-0 overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center py-20 text-gray-500">
            Loading customers...
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            No customers found.
          </div>
        ) : (
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50 text-gray-700 text-sm border-b border-gray-100">
                <th className="p-4 font-medium">Customer Name</th>
                <th className="p-4 font-medium">Email Address</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Joined Date</th>
                <th className="p-4 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer, index) => {
                const isBanned =
                  customer.isBanned || customer.status === 'banned';
                return (
                  <tr
                    key={customer._id || index}
                    className={`border-b border-gray-50 hover:bg-gray-50 text-sm transition-colors ${isBanned ? 'bg-red-50/30' : 'text-gray-800'}`}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold ${isBanned ? 'bg-gray-200 text-gray-500' : 'bg-red-100 text-[#DB4444]'}`}
                        >
                          {customer.name?.charAt(0).toUpperCase()}
                        </div>
                        <span
                          className={`font-medium ${isBanned ? 'text-gray-500 line-through' : 'text-black'}`}
                        >
                          {customer.name}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">{customer.email}</td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider border ${isBanned ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}
                      >
                        {isBanned ? 'Banned' : 'Active'}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500">
                      {new Date(customer.createdAt).toLocaleDateString()}
                    </td>

                    {/* === Action Buttons === */}
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-4 text-gray-500">
                        {/* View Button */}
                        <button
                          onClick={() => handleView(customer)}
                          className="hover:text-[#DB4444] transition-colors"
                          title="View Details"
                        >
                          <FiEye size={18} />
                        </button>

                        {/* Edit Button */}
                        {canManage && (
                          <button
                            onClick={() => handleEditOpen(customer)}
                            className="hover:text-blue-500 transition-colors"
                            title="Edit Customer"
                          >
                            <FiEdit size={18} />
                          </button>
                        )}

                        {/* Ban / Unban Button */}
                        {canManage && (
                          <button
                            onClick={() => handleBanToggle(customer)}
                            className={`transition-colors ${isBanned ? 'text-green-500 hover:text-green-600' : 'text-red-400 hover:text-red-600'}`}
                            title={isBanned ? 'Unban Customer' : 'Ban Customer'}
                          >
                            {isBanned ? (
                              <FiUserCheck size={18} />
                            ) : (
                              <FiUserX size={18} />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ================= MODALS ================= */}

      {isViewModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-md w-full max-w-md shadow-2xl overflow-hidden flex flex-col animate-fade-in">
            <div className="p-5 border-b flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-black flex items-center gap-2">
                <FiEye className="text-[#DB4444]" /> Customer Details
              </h3>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="p-2 bg-gray-200 hover:bg-red-100 hover:text-red-600 rounded-full transition-colors"
              >
                <FiX size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 border-b pb-4">
                <div className="w-16 h-16 rounded-full bg-red-100 text-[#DB4444] flex items-center justify-center font-bold text-2xl">
                  {selectedCustomer.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-semibold text-lg text-black">
                    {selectedCustomer.name}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {selectedCustomer.email}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm pt-2">
                <div>
                  <p className="text-gray-400 mb-1">User ID</p>
                  <p className="font-medium text-black text-xs break-all">
                    {selectedCustomer._id}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Role</p>
                  <p className="font-medium text-black capitalize">
                    {selectedCustomer.role || 'user'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Joined At</p>
                  <p className="font-medium text-black flex items-center gap-1">
                    <FiCalendar />{' '}
                    {new Date(selectedCustomer.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Status</p>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-semibold ${selectedCustomer.isBanned || selectedCustomer.status === 'banned' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}
                  >
                    {selectedCustomer.isBanned ||
                    selectedCustomer.status === 'banned'
                      ? 'BANNED'
                      : 'ACTIVE'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {isEditModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-md w-full max-w-md shadow-2xl overflow-hidden flex flex-col animate-fade-in">
            <div className="p-5 border-b flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-black flex items-center gap-2">
                <FiEdit className="text-[#DB4444]" /> Edit Customer
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 bg-gray-200 hover:bg-red-100 hover:text-red-600 rounded-full transition-colors"
              >
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full bg-[#F5F5F5] border border-transparent focus:border-[#DB4444] rounded p-3 outline-none text-sm transition-colors"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <FiShield /> Account Role
                </label>
                <select
                  value={editRole}
                  onChange={e => setEditRole(e.target.value)}
                  className="w-full bg-[#F5F5F5] border border-transparent focus:border-[#DB4444] rounded p-3 outline-none text-sm transition-colors"
                >
                  <option value="user">User / Customer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 rounded text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-2.5 rounded text-sm font-medium bg-[#DB4444] text-white hover:bg-red-600 transition-colors ${isSubmitting ? 'opacity-70' : ''}`}
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;