import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { LuStar } from 'react-icons/lu';
import { FaStar } from 'react-icons/fa';
import { FiUpload, FiX } from 'react-icons/fi';
import { getMyReviewData, submitProductReview } from '../../api/catalog';

const STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-600 border-amber-200',
  approved: 'bg-green-50 text-green-600 border-green-200',
  rejected: 'bg-red-50 text-red-600 border-red-200',
};

const ReviewFormCard = ({ product, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const urls = images.map(file => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach(URL.revokeObjectURL);
  }, [images]);

  const handleImageChange = e => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setImages(prev => [...prev, ...files].slice(0, 5));
    e.target.value = '';
  };

  const removeImage = index => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (rating === 0) {
      alert('Please select a star rating!');
      return;
    }

    setSubmitting(true);

    try {
      await submitProductReview({
        productId: product._id,
        rating: rating,
        title: title,
        comment: reviewText,
        images: images,
      });
      await onSubmit();
    } catch (error) {
      alert(error?.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-sm p-6 bg-gray-50/50">
      <div className="flex flex-col md:flex-row gap-6 mb-6 pb-6 border-b border-gray-200">
        <img
          src={
            product.image?.url ||
            product.image ||
            'https://via.placeholder.com/100'
          }
          alt={product.name}
          className="w-24 h-24 object-cover rounded-sm border border-gray-200 bg-white"
        />
        <div>
          <h3 className="text-lg font-medium text-black mb-1">
            {product.name}
          </h3>
          <p className="text-sm text-gray-500 mb-3">
            Purchased: {new Date(product.purchasedDate).toLocaleDateString()}
          </p>
          <p className="text-sm font-medium text-[#DB4444]">
            Rate this product to help others!
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="mb-4">
          <label className="block text-sm font-medium text-black mb-2">
            Your Rating <span className="text-[#DB4444]">*</span>
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(star => (
              <FaStar
                key={star}
                size={24}
                className={`cursor-pointer transition-colors ${
                  star <= (hoverRating || rating)
                    ? 'text-[#FFAD33]'
                    : 'text-gray-300'
                }`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
              />
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-black mb-2">
            Review Title (Optional)
          </label>
          <input
            type="text"
            maxLength={120}
            placeholder="Summarize your experience"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full bg-white border border-gray-300 focus:border-[#DB4444] rounded-sm px-4 py-3 outline-none transition-all text-sm"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-black mb-2">
            Your Review (Optional)
          </label>
          <textarea
            rows="4"
            placeholder="What did you like or dislike about this product?"
            value={reviewText}
            onChange={e => setReviewText(e.target.value)}
            className="w-full bg-white border border-gray-300 focus:border-[#DB4444] rounded-sm px-4 py-3 outline-none transition-all resize-none text-sm"
          ></textarea>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-black mb-2">
            Add Photos (Optional, up to 5)
          </label>
          <div className="flex flex-wrap items-center gap-3">
            {previews.map((src, index) => (
              <div
                key={src}
                className="relative h-20 w-20 rounded-sm border border-gray-200 overflow-hidden group"
              >
                <img
                  src={src}
                  alt={`Preview ${index + 1}`}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  aria-label="Remove image"
                  className="absolute top-0 right-0 bg-black/60 text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <FiX size={14} />
                </button>
              </div>
            ))}

            {images.length < 5 && (
              <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-sm border border-dashed border-gray-300 text-gray-400 hover:border-[#DB4444] hover:text-[#DB4444] transition-colors">
                <FiUpload size={18} />
                <span className="text-[10px] font-medium">Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className={`bg-[#DB4444] text-white px-8 py-3 rounded-sm font-medium hover:bg-red-600 transition-colors ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {submitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
};

const MyReviews = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [loading, setLoading] = useState(true);

  const [pendingReviews, setPendingReviews] = useState([]);

  const [pastReviews, setPastReviews] = useState([]);

  const loadReviews = useCallback(async () => {
    try {
      const data = await getMyReviewData();
      setPendingReviews(data?.pending || []);
      setPastReviews(data?.history || []);
    } catch (error) {
      console.error('Failed to load reviews', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleReviewSubmit = async () => {
    await loadReviews();
    setActiveTab('history');
  };

  if (loading) {
    return (
      <div className="text-center py-20 font-poppins text-lg">
        Loading your products...
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 md:py-20 font-poppins">
      <div className="mb-10 text-sm text-black/50">
        <Link to="/" className="hover:text-[#DB4444] transition-colors">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-black">My Reviews</span>
      </div>

      <div className="bg-white shadow-sm border border-gray-100 rounded-sm p-6 md:p-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-[#DB4444] p-3 rounded-full text-white">
            <LuStar size={24} />
          </div>
          <h2 className="text-2xl font-medium font-inter text-black">
            My Reviews
          </h2>
        </div>

        <div className="flex border-b border-gray-200 mb-8 text-base md:text-lg">
          <button
            className={`pb-4 px-4 md:px-6 font-medium transition-colors ${
              activeTab === 'pending'
                ? 'text-[#DB4444] border-b-2 border-[#DB4444]'
                : 'text-gray-500 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('pending')}
          >
            To Be Reviewed ({pendingReviews.length})
          </button>
          <button
            className={`pb-4 px-4 md:px-6 font-medium transition-colors ${
              activeTab === 'history'
                ? 'text-[#DB4444] border-b-2 border-[#DB4444]'
                : 'text-gray-500 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('history')}
          >
            History ({pastReviews.length})
          </button>
        </div>

        <div className="min-h-[300px]">
          {activeTab === 'pending' && (
            <div>
              {pendingReviews.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-sm border border-dashed border-gray-200">
                  <FaStar className="mx-auto text-gray-300 mb-4" size={48} />
                  <p className="text-gray-500 mb-2 font-medium">
                    No pending reviews!
                  </p>
                  <p className="text-gray-400 text-sm mb-6">
                    Buy products and they will appear here for review.
                  </p>
                  <Link
                    to="/shop"
                    className="inline-block bg-[#DB4444] text-white px-8 py-3 rounded-sm hover:bg-red-600 transition-colors"
                  >
                    Continue Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-8">
                  {pendingReviews.map(product => (
                    <ReviewFormCard
                      key={product._id}
                      product={product}
                      onSubmit={handleReviewSubmit}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              {pastReviews.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-sm border border-dashed border-gray-200">
                  <LuStar className="mx-auto text-gray-300 mb-4" size={48} />
                  <p className="text-gray-500 mb-2 font-medium">
                    You haven't written any reviews yet.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {pastReviews.map(review => (
                    <div
                      key={review._id}
                      className="border border-gray-100 shadow-sm rounded-sm p-6 bg-white"
                    >
                      <div className="flex gap-4 mb-4">
                        <img
                          src={
                            review.image ||
                            'https://via.placeholder.com/64?text=No+Image'
                          }
                          alt={review.productName}
                          className="w-16 h-16 object-cover rounded-sm border border-gray-100"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-black line-clamp-1">
                            {review.productName}
                          </h4>
                          <p className="text-xs text-gray-400 mb-1">
                            {review.date
                              ? new Date(review.date).toLocaleDateString()
                              : ''}
                          </p>
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="flex gap-1 text-[#FFAD33]">
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
                            {review.status && (
                              <span
                                className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize ${
                                  STATUS_STYLES[review.status] ||
                                  'bg-gray-50 text-gray-600 border-gray-200'
                                }`}
                              >
                                {review.status}
                              </span>
                            )}
                            {review.verifiedPurchase && (
                              <span className="rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-600">
                                ✓ Verified Purchase
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {review.title && (
                        <p className="mb-1 text-sm font-semibold text-black">
                          {review.title}
                        </p>
                      )}
                      <p className="text-sm text-gray-600 italic">
                        "{review.reviewText || review.comment}"
                      </p>

                      {Array.isArray(review.images) &&
                        review.images.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {review.images.map((src, i) => (
                              <img
                                key={`${src}-${i}`}
                                src={src}
                                alt={`Review ${i + 1}`}
                                className="h-16 w-16 rounded-sm border border-gray-100 object-cover"
                              />
                            ))}
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyReviews;