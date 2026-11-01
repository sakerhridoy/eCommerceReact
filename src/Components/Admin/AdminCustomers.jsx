import React, { useEffect, useState } from 'react';
import { FiMail, FiPhone, FiTrash2, FiSearch } from 'react-icons/fi';
import { getAllCustomers } from '../../api/catalog'; 

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await getAllCustomers();
        console.log('Response from API:', response);

        const customerArray = response?.data ? response.data : response;

        if (Array.isArray(customerArray)) {
          setCustomers(customerArray);
        } else {
          console.error('Expected array but got:', customerArray);
          setCustomers([]);
        }
      } catch (error) {
        console.error('Failed to load customers:', error);
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(
    customer =>
      customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading)
    return (
      <div className="text-center py-20 font-poppins text-lg">
        Loading customers...
      </div>
    );

  return (
    <div className="bg-white p-6 shadow-sm border border-gray-100 rounded-sm font-poppins">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold font-inter text-black">
          Customer List
        </h2>

        <div className="flex items-center bg-gray-50 border border-gray-200 px-4 py-2 rounded-md w-full md:w-64">
          <FiSearch className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="bg-transparent outline-none w-full text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredCustomers.length === 0 ? (
          <div className="col-span-full text-center py-10 text-gray-500">
            No customers found.
          </div>
        ) : (
          filteredCustomers.map(customer => (
            <div
              key={customer._id}
              className="bg-white border border-gray-100 rounded-sm p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-[#F8F9FA] rounded-full flex items-center justify-center text-xl font-bold text-[#DB4444] uppercase">
                  {customer.name ? customer.name.charAt(0) : 'U'}
                </div>
                <div>
                  <h3 className="font-semibold text-black capitalize line-clamp-1">
                    {customer.name || 'Unknown User'}
                  </h3>
                  <p className="text-xs text-gray-400">
                    Joined: {new Date(customer.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <FiMail className="text-gray-400" />
                  <span className="truncate">{customer.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiPhone className="text-gray-400" />
                  <span>{customer.phone || 'N/A'}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <div className="text-sm">
                  <span className="text-gray-500 text-xs">Role: </span>
                  <span className="font-semibold text-black capitalize">
                    {customer.role || 'User'}
                  </span>
                </div>
                <button
                  className="text-red-500 hover:bg-red-50 p-2 rounded transition-colors"
                  title="Delete User"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminCustomers;