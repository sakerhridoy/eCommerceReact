import React, { useEffect, useState } from 'react';
import { FaStar, FaRegHeart } from 'react-icons/fa6';
import { GoArrowLeft, GoArrowRight } from 'react-icons/go';
import { IoEyeOutline } from 'react-icons/io5';

import { useCountdown } from '../../contexts/CountDownContext/CountDownContextProvider';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { Link } from 'react-router-dom';
import { useShop } from '../../contexts/ShopContext';
import { getHomeData } from '../../api/catalog';

const FlashSales = () => {
  const { seconds, minutes, hours, days } = useCountdown();
  const { addToCart, wishlist, addToWishlist, removeFromWishlist } = useShop();
  const [flashItems, setFlashItems] = useState([]);

  useEffect(() => {
    let active = true;
    getHomeData()
      .then(data => {
        if (active) setFlashItems(data.discountProducts);
      })
      .catch(error => console.error('Failed to load sale products:', error));
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="pt-10 lg:pt-24 mx-4 xl:mx-0">
      <div className="container">
        <div className="section-title mb-7.75">
          <div className="mb-3.25 relative after:absolute after:w-5 after:h-full after:bg-[#DB4444] after:left-0 after:top-0 after:rounded-sm ps-9">
            <h4 className="font-poppins font-semibold text-base text-[#DB4444] leading-10">
              Today’s
            </h4>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex sm:gap-6.25 lg:gap-21.75 items-center">
              <h2 className="font-inter font-semibold text-2xl sm:text-3xl md:text-4xl text-black">
                Flash Sales
              </h2>

              <div className="flex gap-4.25 items-center">
                {[
                  { label: 'Days', value: days },
                  { label: 'Hours', value: hours },
                  { label: 'Minutes', value: minutes },
                  { label: 'Seconds', value: seconds },
                ].map((t, i) => (
                  <React.Fragment key={i}>
                    <div>
                      <h4 className="text-xs pb-1">{t.label}</h4>
                      <h3 className="text-[32px] font-bold">
                        {t.value >= 10 ? t.value : `0${t.value}`}
                      </h3>
                    </div>
                    {i !== 3 && (
                      <span className="text-xl text-[#E07575]">:</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="hidden sm:inline-block">
              <div className="flex gap-2">
                <div className="flash-prev bg-[#F5F5F5] p-4 rounded-full cursor-pointer">
                  <GoArrowLeft />
                </div>
                <div className="flash-next bg-[#F5F5F5] p-4 rounded-full cursor-pointer">
                  <GoArrowRight />
                </div>
              </div>
            </div>
          </div>
        </div>

        <Swiper
          modules={[Navigation, Autoplay]}
          loop
          autoplay={{ delay: 2500, disableOnInteraction: false }}
          navigation={{
            nextEl: '.flash-next',
            prevEl: '.flash-prev',
          }}
          spaceBetween={30}
          slidesPerView={4}
          breakpoints={{
            0: {
              slidesPerView: 1,
              spaceBetween: 16,
            },
            640: {
              slidesPerView: 2,
            },
            1024: {
              slidesPerView: 3,
            },
            1280: {
              slidesPerView: 4,
            },
          }}
        >
          {flashItems.map(item => {
            const isWished = wishlist.some(w => w.id === item.id);

            const isOutOfStock = item.stock <= 0;

            let discountPercentage = 0;
            if (item.mPrice && item.dPrice && item.mPrice > item.dPrice) {
              discountPercentage = Math.round(
                ((item.mPrice - item.dPrice) / item.mPrice) * 100,
              );
            } else if (item.dis) {
              discountPercentage = item.dis;
            }

            return (
              <SwiperSlide key={item.id}>
                <div className="group">
                  <div
                    className={`bg-[#F5F5F5] py-8.75 relative overflow-hidden flex items-center justify-center h-64 rounded-sm ${isOutOfStock ? 'opacity-60' : ''}`}
                  >
                    <Link
                      to={isOutOfStock ? '#' : `/product/${item.id}`}
                      onClick={e => isOutOfStock && e.preventDefault()}
                      className={`w-full h-full flex items-center justify-center p-4 ${isOutOfStock ? 'cursor-not-allowed' : ''}`}
                    >
                      <img
                        src={item.img ? item.img : null}
                        alt={item.name || 'Product'}
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
                        <p className="text-xs text-white">Out of Stock</p>
                      </div>
                    ) : discountPercentage > 0 ? (
                      <div className="absolute top-3 left-3 bg-[#DB4444] px-3 py-1 rounded-sm z-10">
                        <p className="text-xs text-white">
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
                          className="bg-white p-1.25 rounded-full shadow-sm hover:bg-gray-100 transition"
                        >
                          <FaRegHeart
                            className={`${
                              isWished ? 'text-red-500' : 'text-black'
                            }`}
                          />
                        </button>
                        <Link
                          to={`/product/${item.id}`}
                          className="bg-white p-1.25 rounded-full flex justify-center shadow-sm hover:bg-gray-100 transition"
                        >
                          <IoEyeOutline />
                        </Link>
                      </div>
                    )}

                    {!isOutOfStock && (
                      <div
                        onClick={() => addToCart(item)}
                        className="absolute bottom-0 left-0 w-full bg-black py-2 text-center opacity-0 group-hover:opacity-100 duration-300 cursor-pointer z-10"
                      >
                        <p className="text-white">Add To Cart</p>
                      </div>
                    )}
                  </div>

                  <div className={`pt-4 ${isOutOfStock ? 'opacity-60' : ''}`}>
                    <h3 className="font-medium text-base line-clamp-1">
                      {item.name}
                    </h3>
                    <p className="py-2 flex gap-3">
                      <span className="text-[#DB4444]">৳{item.dPrice}</span>
                      {item.dPrice < item.mPrice && (
                        <del className="opacity-50">৳{item.mPrice}</del>
                      )}
                    </p>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={`text-[16px] ${
                            i < Math.floor(item.ratingStars || 4)
                              ? 'text-[#FFAD33]'
                              : 'text-[rgba(0,0,0,0.25)]'
                          }`}
                        />
                      ))}
                      <span className="text-sm opacity-50">
                        ({item.rating || 0})
                      </span>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>

        <div className="text-center pt-24">
          <Link
            to="/shop"
            className="bg-[#DB4444] py-4 px-12 text-white rounded-sm hover:bg-red-600 transition"
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FlashSales;