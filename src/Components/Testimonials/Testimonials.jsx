import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { FaStar } from 'react-icons/fa';
import 'swiper/css';
import 'swiper/css/pagination';
import { getTestimonials, getImageUrl } from '../../api/catalog';

const StarRow = ({ value = 0, size = 14 }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map(star => (
      <FaStar
        key={star}
        size={size}
        className={
          star <= Math.round(value) ? 'text-[#FFAD33]' : 'text-gray-300'
        }
      />
    ))}
  </div>
);

const formatReviewDate = value => {
  if (!value) return '';
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const Testimonials = ({
  title = 'What Our Customers Say',
  subtitle = 'Real reviews from verified buyers',
  className = '',
}) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const data = await getTestimonials({ limit: 9, minRating: 4 });
      if (!active) return;
      setReviews(data);
      setLoading(false);
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  if (loading || reviews.length === 0) return null;

  return (
    <section className={`container mx-auto font-poppins ${className}`}>
      <div className="mb-10 flex items-center gap-4">
        <div className="h-10 w-5 rounded-sm bg-[#DB4444]"></div>
        <div>
          <h3 className="text-lg font-semibold text-[#121212] font-poppins">
            {title}
          </h3>
          <p className="text-sm text-black/50">{subtitle}</p>
        </div>
      </div>

      <Swiper
        modules={[Autoplay, Pagination]}
        spaceBetween={24}
        loop={reviews.length > 3}
        autoplay={{ delay: 3500, disableOnInteraction: false }}
        pagination={{
          clickable: true,
          el: '.testimonial-pagination',
          renderBullet: (index, className) =>
            `<span class="${className} custom-dot"></span>`,
        }}
        breakpoints={{
          0: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
        className="pb-4"
      >
        {reviews.map(review => {
          const productImage = getImageUrl(
            review.product?.images?.[0] || review.product?.image,
          );
          const productTitle =
            review.product?.title || review.product?.name || 'Product';
          const productId = review.product?._id;
          const reviewDate = formatReviewDate(review.createdAt);

          const productContent = (
            <>
              {productImage ? (
                <img
                  src={productImage}
                  alt={productTitle}
                  className="h-9 w-9 flex-shrink-0 rounded-sm border border-gray-100 object-cover"
                />
              ) : (
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-sm border border-gray-100 bg-gray-100 text-[10px] font-semibold text-gray-400">
                  N/A
                </div>
              )}
              <span className="min-w-0 truncate text-xs font-medium text-gray-600">
                {productTitle}
              </span>
            </>
          );

          return (
            <SwiperSlide key={review._id} className="h-auto">
              <div className="flex h-full flex-col rounded-lg border border-gray-100 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-shadow duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.10)]">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <StarRow value={review.rating} />
                    <span className="text-xs font-semibold text-gray-500">
                      {Number(review.rating || 0).toFixed(1)}
                    </span>
                  </div>
                  <span
                    aria-hidden="true"
                    className="-mt-3 select-none font-serif text-5xl leading-none text-[#DB4444]/15"
                  >
                    &ldquo;
                  </span>
                </div>

                {review.title && (
                  <h4 className="mb-1 font-semibold text-black">
                    {review.title}
                  </h4>
                )}

                <p className="flex-1 text-sm italic leading-relaxed text-gray-600 line-clamp-6">
                  "{review.comment}"
                </p>

                {Array.isArray(review.images) && review.images.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {review.images.slice(0, 3).map((src, i) => (
                      <img
                        key={`${src}-${i}`}
                        src={src}
                        alt={`Review ${i + 1}`}
                        className="h-14 w-14 rounded-sm border border-gray-100 object-cover"
                      />
                    ))}
                  </div>
                )}

                <div className="mt-5 border-t border-gray-200 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#DB4444]/10 font-semibold text-[#DB4444]">
                      {(review.user?.name || 'C').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-black">
                        {review.user?.name || 'Customer'}
                      </p>
                      {reviewDate && (
                        <p className="text-[11px] text-gray-400">
                          {reviewDate}
                        </p>
                      )}
                    </div>
                    {review.verifiedPurchase && (
                      <span className="whitespace-nowrap rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-600">
                        ✓ Verified
                      </span>
                    )}
                  </div>

                  {productId ? (
                    <Link
                      to={`/product/${productId}`}
                      className="mt-3 flex items-center gap-2 rounded-sm bg-gray-50 p-2 transition-colors duration-200 hover:bg-gray-200"
                    >
                      {productContent}
                    </Link>
                  ) : (
                    <div className="mt-3 flex items-center gap-2 rounded-sm bg-gray-50 p-2">
                      {productContent}
                    </div>
                  )}
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      <div className="testimonial-pagination mt-8 flex justify-center gap-3"></div>
    </section>
  );
};

export default Testimonials;
