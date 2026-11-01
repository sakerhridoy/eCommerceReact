import React, { useEffect, useRef, useState } from 'react';

import { FaStar, FaRegHeart } from 'react-icons/fa6';
import { GoArrowLeft, GoArrowRight } from 'react-icons/go';
import { IoEyeOutline } from 'react-icons/io5';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Grid, Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/grid';
import 'swiper/css/pagination';

import { Link } from 'react-router-dom';
import { useShop } from '../../contexts/ShopContext';
import { getProducts } from '../../api/catalog';

const Explore = () => {
  const swiperRef = useRef(null);
  const { addToCart, addToWishlist, wishlist, removeFromWishlist } = useShop();
  const [visibleCount, setVisibleCount] = useState(4);
  const [exploreItems, setExploreItems] = useState([]);

  useEffect(() => {
    let active = true;
    getProducts({ limit: 12 })
      .then(products => {
        if (active) setExploreItems(Array.isArray(products) ? products : []);
      })
      .catch(error => console.error('Failed to load products:', error));
    return () => {
      active = false;
    };
  }, []);
  const safeExploreItems = Array.isArray(exploreItems) ? exploreItems : [];

  const renderStars = count =>
    Array.from({ length: 5 }, (_, i) => (
      <FaStar
        key={i}
        className={
          i < Math.floor(count || 4)
            ? 'text-[#FFAD33] text-[16px]'
            : 'text-[rgba(0,0,0,0.25)] text-[16px]'
        }
      />
    ));

  return (
    <section className="pb-42 mx-4 xl:mx-0">
      <div className="container">
        
        <div className="section-title mb-15 pt-20">
          <div className="mb-3.25 relative after:absolute after:w-5 after:h-full after:bg-[#DB4444] after:left-0 after:top-0 after:rounded-sm ps-9">
            <h4 className="font-poppins font-semibold text-base text-[#DB4444] leading-10">
              Our Products
            </h4>
          </div>

          <div className="flex justify-between items-center">
            <h2 className="font-inter font-semibold text-4xl text-black tracking-[4%]">
              Explore Our Products
            </h2>

            <div className="flex gap-2">
              <div
                onClick={() => swiperRef.current?.slidePrev()}
                className="bg-[#F5F5F5] hover:bg-[rgba(174,171,171,0.5)] p-4 rounded-full cursor-pointer transition"
              >
                <GoArrowLeft />
              </div>
              <div
                onClick={() => swiperRef.current?.slideNext()}
                className="bg-[#F5F5F5] hover:bg-[rgba(174,171,171,0.5)] p-4 rounded-full cursor-pointer transition"
              >
                <GoArrowRight />
              </div>
            </div>
          </div>
        </div>

        <Swiper
          modules={[Grid, Pagination]}
          spaceBetween={30}
          onSwiper={swiper => (swiperRef.current = swiper)}
          pagination={false}
          breakpoints={{
            0: {
              slidesPerView: 1,
              grid: {
                rows: 1,
                fill: 'row',
              },
            },
            640: {
              slidesPerView: 2,
              grid: {
                rows: 2,
                fill: 'row',
              },
            },
            1024: {
              slidesPerView: 4,
              grid: {
                rows: 2,
                fill: 'row',
              },
            },
          }}
          slidesPerGroup={1}
        >
          {safeExploreItems.slice(0, visibleCount).map(item => {
            const isWished = wishlist.some(w => w.id === item.id);

            const isOutOfStock = item.stock <= 0;

            let discountPercentage = 0;
            if (item.mPrice && item.dPrice && item.mPrice > item.dPrice) {
              discountPercentage = Math.round(
                ((item.mPrice - item.dPrice) / item.mPrice) * 100,
              );
            } else if (item.discountPercentage) {
              discountPercentage = Math.round(item.discountPercentage);
            } else if (item.dis) {
              discountPercentage = item.dis;
            }

            return (
              <SwiperSlide key={item.id || item._id}>
                <div className="group">
                  <div
                    className={`bg-[#F5F5F5] py-8.75 rounded-sm relative overflow-hidden flex items-center justify-center h-64 ${isOutOfStock ? 'opacity-60' : ''}`}
                  >
                    <Link
                      to={
                        isOutOfStock ? '#' : `/product/${item.id || item._id}`
                      }
                      onClick={e => isOutOfStock && e.preventDefault()}
                      className={`w-full h-full flex items-center justify-center p-4 ${isOutOfStock ? 'cursor-not-allowed' : ''}`}
                    >
                      <img
                        src={item.img || item.thumbnail || item.image || null}
                        alt={item.title || 'Product'}
                        className={`max-h-full max-w-full object-contain duration-300 ${!isOutOfStock && 'group-hover:scale-90'}`}
                        onError={e => {
                          e.target.onerror = null;
                          e.target.src =
                            'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400';
                        }}
                      />
                    </Link>

                    {isOutOfStock ? (
                      <div className="absolute top-3 left-3 bg-gray-800 px-3 py-1 rounded-sm z-10">
                        <p className="text-xs text-white font-poppins">
                          Out of Stock
                        </p>
                      </div>
                    ) : discountPercentage > 0 ? (
                      <div className="absolute top-3 left-3 bg-[#DB4444] px-3 py-1 rounded-sm z-10">
                        <p className="text-xs text-white font-poppins">
                          - {discountPercentage}%
                        </p>
                      </div>
                    ) : null}

                    {!isOutOfStock && (
                      <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
                        <button
                          onClick={() =>
                            isWished
                              ? removeFromWishlist(item.id)
                              : addToWishlist(item)
                          }
                          className="bg-white p-1.25 rounded-full shadow-sm hover:text-[#DB4444] transition-colors"
                        >
                          <FaRegHeart
                            className={isWished ? 'text-red-500' : 'text-black'}
                          />
                        </button>

                        <Link
                          to={`/product/${item.id}`}
                          className="bg-white p-1.25 rounded-full flex justify-center shadow-sm hover:text-[#DB4444] transition-colors"
                        >
                          <IoEyeOutline />
                        </Link>
                      </div>
                    )}

                    {!isOutOfStock && (
                      <div
                        onClick={() => addToCart(item)}
                        className="absolute left-0 -bottom-11.25 w-full bg-black text-white text-center py-2
                        cursor-pointer opacity-0 group-hover:bottom-0 group-hover:opacity-100 transition-all z-10 font-medium"
                      >
                        Add To Cart
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className={`pt-4 ${isOutOfStock ? 'opacity-60' : ''}`}>
                    <Link
                      to={
                        isOutOfStock ? '#' : `/product/${item.id || item._id}`
                      }
                      onClick={e => isOutOfStock && e.preventDefault()}
                      className={
                        isOutOfStock
                          ? 'cursor-not-allowed'
                          : 'hover:text-[#DB4444] transition-colors'
                      }
                    >
                      <h3 className="font-poppins text-base text-black line-clamp-1 transition-colors">
                        {item.title || item.name}
                      </h3>
                    </Link>

                    <div className="flex items-center gap-2 py-2 flex-wrap">
                      <p className="text-[#DB4444] font-poppins text-base font-medium">
                        ৳{item.dPrice || item.price}
                      </p>

                      {discountPercentage > 0 &&
                        (item.mPrice || item.price) && (
                          <del className="text-gray-400 text-sm font-poppins">
                            ৳
                            {item.mPrice ||
                              (
                                item.price /
                                (1 - discountPercentage / 100)
                              ).toFixed(2)}
                          </del>
                        )}

                      <div className="flex items-center gap-1 ml-1">
                        {renderStars(item.ratingStars || item.rating)}
                      </div>
                      <span className="font-poppins text-sm text-[rgba(0,0,0,0.5)] ps-1 mt-0.5">
                        ({item.rating || 35})
                      </span>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>

        {visibleCount < exploreItems.length && (
          <div className="text-center mt-16">
            <button
              onClick={() => setVisibleCount(v => v + 4)}
              className="bg-[#DB4444] hover:bg-[#b80808] py-4 px-12 rounded-sm font-poppins text-base text-white transition duration-300"
            >
              View More Products
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Explore;