import React, { useState, useEffect } from 'react';
import { FiTrash2, FiMessageSquare } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';
import api from '../../api/client';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAllReviews = async () => {
      try {
        const { data } = await api.get('/reviews');
        setReviews(data.data || []);
      } catch (err) {
        console.error('Failed to fetch reviews:', err);
        setError('Failed to load reviews. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllReviews();
  }, []);

  // Review Delete function
  const handleDeleteReview = async id => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this review?',
    );
    if (!confirmDelete) return;

    try {
      await api.delete(`/reviews/${id}`);
      setReviews(reviews.filter(review => review._id !== id));
      alert('Review deleted successfully!');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to delete review');
    }
  };

  return (
    <div className="font-poppins p-6 md:p-8 bg-gray-50 min-h-screen w-full">
      <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-6">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8 border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#DB4444] p-2.5 rounded text-white">
              <FiMessageSquare size={20} />
            </div>
            <h2 className="text-xl font-semibold text-black">
              Customer Reviews
            </h2>
          </div>
          <div className="text-sm font-medium bg-red-50 text-[#DB4444] px-4 py-1.5 rounded-full">
            Total Reviews: {reviews.length}
          </div>
        </div>

        {error && (
          <div className="p-4 mb-6 text-red-700 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-gray-500 text-lg">
            Loading reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded border border-dashed">
            <FiMessageSquare className="mx-auto text-gray-300 mb-4" size={40} />
            <p className="text-gray-500">No reviews found in the database.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-gray-100 text-gray-700 text-sm border-b border-gray-200">
                  <th className="p-4 font-medium rounded-tl-sm">Product</th>
                  <th className="p-4 font-medium">Customer</th>
                  <th className="p-4 font-medium">Rating</th>
                  <th className="p-4 font-medium w-1/3">Review Comment</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium text-center rounded-tr-sm">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {reviews.map(review => (
                  <tr
                    key={review._id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors text-sm"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            review.product?.image ||
                            review.product?.images?.[0]?.url ||
                            'https://via.placeholder.com/40'
                          }
                          alt="product"
                          className="w-10 h-10 object-cover rounded border bg-white"
                        />
                        <span
                          className="font-medium text-black line-clamp-1 max-w-[150px]"
                          title={review.product?.name}
                        >
                          {review.product?.name || 'Deleted Product'}
                        </span>
                      </div>
                    </td>

                    <td className="p-4">
                      <p className="font-medium text-black">
                        {review.user?.name || 'Unknown User'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {review.user?.email}
                      </p>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            size={14}
                            className={
                              i < review.rating
                                ? 'text-[#FFAD33]'
                                : 'text-gray-300'
                            }
                          />
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      <p
                        className="text-gray-600 truncate max-w-[250px]"
                        title={review.comment}
                      >
                        {review.comment || (
                          <span className="italic text-gray-400">
                            No comment
                          </span>
                        )}
                      </p>
                    </td>

                    <td className="p-4 text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </td>

                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleDeleteReview(review._id)}
                        className="p-2 text-red-500 hover:bg-red-50 hover:text-red-700 rounded transition-colors"
                        title="Delete Review"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReviews;