import React, { useState, useEffect, useCallback } from 'react';
import {
  FiTrash2,
  FiMessageSquare,
  FiCheck,
  FiX,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';
import {
  getAdminReviews,
  moderateReview,
  deleteReview,
  getImageUrl,
} from '../../api/catalog';
import { useAuth } from '../../contexts/AuthContext';
import { can, PERMISSIONS } from '../../utils/permissions';

const STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-600 border-amber-200',
  approved: 'bg-green-50 text-green-600 border-green-200',
  rejected: 'bg-red-50 text-red-600 border-red-200',
};

const FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
];

const AdminReviews = () => {
  const { user } = useAuth();
  const canModerate = can(user, PERMISSIONS.REVIEW_MODERATE);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [processingId, setProcessingId] = useState(null);

  const loadReviews = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { reviews: list, meta: pageMeta } = await getAdminReviews({
        status: statusFilter,
        page,
        limit: 10,
      });
      setReviews(list);
      setMeta(pageMeta);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
      setError('Failed to load reviews. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleFilterChange = value => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleModerate = async (id, status) => {
    setProcessingId(id);
    try {
      await moderateReview(id, status);
      await loadReviews();
    } catch (err) {
      alert(err?.response?.data?.message || `Failed to ${status} review`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteReview = async id => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this review?',
    );
    if (!confirmDelete) return;

    setProcessingId(id);
    try {
      await deleteReview(id);
      await loadReviews();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || 'Failed to delete review');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="font-poppins p-6 md:p-8 bg-gray-50 min-h-screen w-full">
      <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-6">
        {/* Header Section */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8 border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#DB4444] p-2.5 rounded text-white">
              <FiMessageSquare size={20} />
            </div>
            <h2 className="text-xl font-semibold text-black">
              Customer Reviews
            </h2>
          </div>
          <div className="text-sm font-medium bg-red-50 text-[#DB4444] px-4 py-1.5 rounded-full">
            Total Reviews: {meta.total}
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {FILTERS.map(filter => (
            <button
              key={filter.value}
              type="button"
              onClick={() => handleFilterChange(filter.value)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium border transition-colors ${
                statusFilter === filter.value
                  ? 'bg-[#DB4444] text-white border-[#DB4444]'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-[#DB4444] hover:text-[#DB4444]'
              }`}
            >
              {filter.label}
            </button>
          ))}
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
            <p className="text-gray-500">No reviews found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-gray-100 text-gray-700 text-sm border-b border-gray-200">
                  <th className="p-4 font-medium rounded-tl-sm">Product</th>
                  <th className="p-4 font-medium">Customer</th>
                  <th className="p-4 font-medium">Rating</th>
                  <th className="p-4 font-medium w-1/3">Review</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Date</th>
                  {canModerate && (
                    <th className="p-4 font-medium text-center rounded-tr-sm">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {reviews.map(review => (
                  <tr
                    key={review._id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors text-sm align-top"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            getImageUrl(
                              review.product?.images?.[0] ||
                                review.product?.image,
                            ) || 'https://via.placeholder.com/40'
                          }
                          alt="product"
                          className="w-10 h-10 object-cover rounded border bg-white"
                        />
                        <span
                          className="font-medium text-black line-clamp-1 max-w-[150px]"
                          title={review.product?.title || review.product?.name}
                        >
                          {review.product?.title ||
                            review.product?.name ||
                            'Deleted Product'}
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
                      {review.verifiedPurchase && (
                        <span className="mt-1 inline-block rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-600">
                          ✓ Verified Purchase
                        </span>
                      )}
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

                    <td className="p-4 whitespace-normal">
                      {review.title && (
                        <p className="mb-1 font-medium text-black">
                          {review.title}
                        </p>
                      )}
                      <p
                        className="text-gray-600 line-clamp-3 max-w-[280px]"
                        title={review.comment}
                      >
                        {review.comment || (
                          <span className="italic text-gray-400">
                            No comment
                          </span>
                        )}
                      </p>
                      {Array.isArray(review.images) &&
                        review.images.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {review.images.map((src, i) => (
                              <img
                                key={`${src}-${i}`}
                                src={src}
                                alt={`Review ${i + 1}`}
                                className="h-12 w-12 rounded border border-gray-100 object-cover"
                              />
                            ))}
                          </div>
                        )}
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-block rounded-full border px-3 py-1 text-xs font-semibold capitalize ${
                          STATUS_STYLES[review.status] ||
                          'bg-gray-50 text-gray-600 border-gray-200'
                        }`}
                      >
                        {review.status}
                      </span>
                    </td>

                    <td className="p-4 text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </td>

                    {canModerate && (
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-1">
                          {review.status !== 'approved' && (
                            <button
                              onClick={() =>
                                handleModerate(review._id, 'approved')
                              }
                              disabled={processingId === review._id}
                              className="p-2 text-green-600 hover:bg-green-50 hover:text-green-700 rounded transition-colors disabled:opacity-40"
                              title="Approve Review"
                            >
                              <FiCheck size={18} />
                            </button>
                          )}
                          {review.status !== 'rejected' && (
                            <button
                              onClick={() =>
                                handleModerate(review._id, 'rejected')
                              }
                              disabled={processingId === review._id}
                              className="p-2 text-amber-600 hover:bg-amber-50 hover:text-amber-700 rounded transition-colors disabled:opacity-40"
                              title="Reject Review"
                            >
                              <FiX size={18} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteReview(review._id)}
                            disabled={processingId === review._id}
                            className="p-2 text-red-500 hover:bg-red-50 hover:text-red-700 rounded transition-colors disabled:opacity-40"
                            title="Delete Review"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {meta.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                <span className="text-sm text-gray-500">
                  Page {meta.page || page} of {meta.totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="flex items-center gap-1 rounded-sm border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:border-[#DB4444] hover:text-[#DB4444] disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-gray-600"
                  >
                    <FiChevronLeft size={16} /> Prev
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setPage(p => Math.min(meta.totalPages, p + 1))
                    }
                    disabled={page >= meta.totalPages}
                    className="flex items-center gap-1 rounded-sm border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:border-[#DB4444] hover:text-[#DB4444] disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-gray-600"
                  >
                    Next <FiChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReviews;
