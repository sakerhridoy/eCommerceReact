import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import {
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiX,
  FiEye,
  FiEyeOff,
  FiShield,
} from 'react-icons/fi';
import {
  getAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
} from '../../api/catalog';
import { useAuth } from '../../contexts/AuthContext';
import {
  ASSIGNABLE_ROLES,
  ROLE_LABELS,
  normalizeRole,
  getPermissionsForRole,
} from '../../utils/permissions';

const inputClass =
  'w-full border p-3 rounded-sm outline-none focus:border-[#DB4444] font-poppins text-sm';

const emptyForm = {
  name: '',
  email: '',
  password: '',
  phone: '',
  role: ASSIGNABLE_ROLES[0],
};

const AdminUsers = () => {
  const { user: currentUser } = useAuth();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadStaff = async () => {
    setLoading(true);
    try {
      const list = await getAdminUsers();
      setStaff(list);
    } catch (error) {
      Swal.fire(
        'Error',
        error.response?.data?.message || 'Failed to load staff members',
        'error',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = member => {
    setEditingId(member._id || member.id);
    setForm({
      name: member.name || '',
      email: member.email || '',
      password: '',
      phone: member.phone || '',
      role: normalizeRole(member.role),
    });
    setShowForm(true);
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!form.name.trim()) {
      Swal.fire('Error', 'Name is required', 'error');
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await updateAdminUser(editingId, {
          name: form.name,
          phone: form.phone,
          role: form.role,
        });
      } else {
        if (!form.email.trim()) {
          Swal.fire('Error', 'Email is required', 'error');
          setSaving(false);
          return;
        }
        if (form.password.length < 6) {
          Swal.fire('Error', 'Password must be at least 6 characters', 'error');
          setSaving(false);
          return;
        }
        await createAdminUser({
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone,
          role: form.role,
        });
      }

      Swal.fire(
        'Success',
        editingId
          ? 'Staff member updated successfully!'
          : 'Staff member created successfully!',
        'success',
      );
      resetForm();
      loadStaff();
    } catch (error) {
      Swal.fire(
        'Error',
        error.response?.data?.message || 'Failed to save staff member',
        'error',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async member => {
    const id = member._id || member.id;
    try {
      await updateAdminUser(id, { isActive: !member.isActive });
      loadStaff();
    } catch (error) {
      Swal.fire(
        'Error',
        error.response?.data?.message || 'Failed to update staff member',
        'error',
      );
    }
  };

  const handleDelete = async member => {
    const id = member._id || member.id;
    const result = await Swal.fire({
      title: 'Delete this staff member?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DB4444',
      confirmButtonText: 'Delete',
    });

    if (!result.isConfirmed) return;

    try {
      await deleteAdminUser(id);
      Swal.fire('Deleted', 'Staff member deleted successfully.', 'success');
      if (editingId === id) resetForm();
      loadStaff();
    } catch (error) {
      Swal.fire(
        'Error',
        error.response?.data?.message || 'Failed to delete staff member',
        'error',
      );
    }
  };

  const currentId = currentUser?._id || currentUser?.id;
  const selectedRolePermissions = getPermissionsForRole(form.role);

  return (
    <div className="space-y-6 font-poppins">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FiShield className="text-[#DB4444]" /> Admin Users
          </h2>
          <p className="text-sm text-gray-500">
            Staff account তৈরি করুন, role assign করুন এবং permission নিয়ন্ত্রণ
            করুন।
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (showForm) {
              resetForm();
            } else {
              setForm(emptyForm);
              setEditingId(null);
              setShowForm(true);
            }
          }}
          className="flex items-center gap-2 bg-[#DB4444] text-white px-5 py-2.5 rounded-sm hover:bg-red-600 transition text-sm"
        >
          {showForm ? <FiX /> : <FiPlus />}
          {showForm ? 'Close' : 'Add Staff'}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="border rounded-sm p-5 bg-white space-y-4"
        >
          <p className="text-sm font-semibold">
            {editingId ? 'Edit Staff Member' : 'Add New Staff Member'}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1">Name *</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Phone</label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">
                Email {editingId ? '' : '*'}
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                disabled={Boolean(editingId)}
                className={`${inputClass} ${editingId ? 'bg-gray-100 text-gray-500' : ''}`}
              />
            </div>
            {!editingId && (
              <div>
                <label className="block text-xs font-medium mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium mb-1">Role *</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className={inputClass}
              >
                {ASSIGNABLE_ROLES.map(role => (
                  <option key={role} value={role}>
                    {ROLE_LABELS[role] || role}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-gray-50 border rounded-sm p-3">
            <p className="text-xs font-medium text-gray-600 mb-2">
              এই role যে permissions পাবে:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {selectedRolePermissions.length === 0 ? (
                <span className="text-xs text-gray-400">No permissions</span>
              ) : (
                selectedRolePermissions.map(permission => (
                  <span
                    key={permission}
                    className="text-[11px] bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full"
                  >
                    {permission}
                  </span>
                ))
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-[#DB4444] text-white px-6 py-2.5 rounded-sm hover:bg-red-600 transition disabled:opacity-60 text-sm"
            >
              {editingId ? <FiEdit2 /> : <FiPlus />}
              {saving
                ? 'Saving...'
                : editingId
                  ? 'Update Staff'
                  : 'Add Staff'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="flex items-center gap-2 border px-4 py-2.5 rounded-sm text-sm hover:bg-gray-50"
              >
                <FiX /> Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : staff.length === 0 ? (
        <p className="text-sm text-gray-400">No staff members yet.</p>
      ) : (
        <div className="bg-white border rounded-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {staff.map(member => {
                  const id = member._id || member.id;
                  const isSelf = String(id) === String(currentId);

                  return (
                    <tr key={id} className="hover:bg-gray-50/60">
                      <td className="px-4 py-3">
                        <span className="font-medium text-gray-800">
                          {member.name}
                        </span>
                        {isSelf && (
                          <span className="ml-2 text-[11px] text-[#DB4444]">
                            (You)
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{member.email}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-red-50 text-[#DB4444] px-2 py-1 rounded-full">
                          {ROLE_LABELS[normalizeRole(member.role)] ||
                            member.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded-full ${
                            member.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {member.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => handleToggleActive(member)}
                            disabled={isSelf}
                            className="text-gray-500 hover:text-[#DB4444] disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Toggle active"
                          >
                            {member.isActive ? <FiEye /> : <FiEyeOff />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEdit(member)}
                            className="text-gray-500 hover:text-blue-600"
                            title="Edit"
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(member)}
                            disabled={isSelf}
                            className="text-gray-500 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Delete"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
