import React from 'react';
import fSales1 from '../../assets/images/fSales1.png';
import fSales2 from '../../assets/images/fSales2.png';
import fSales3 from '../../assets/images/fSales3.png';
import fSales4 from '../../assets/images/fSales4.png';

import { FaStar, FaRegHeart } from 'react-icons/fa6';
import { GoArrowLeft, GoArrowRight } from 'react-icons/go';
import { IoEyeOutline } from 'react-icons/io5';

import { useCountdown } from '../../Context/Provider/CountDownContextProvider';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { Link } from 'react-router';
import { useShop } from '../../Context/ShopContext/ShopContext';

const FlashSales = () => {
  const { seconds, minutes, hours, days } = useCountdown();
  const { addToCart, wishlist, addToWishlist, removeFromWishlist } = useShop();

  const flashItems = [
    {
      id: 1,
      img: fSales1,
      dis: 40,
      heartIcn: FaRegHeart,
      eyeIcn: IoEyeOutline,
      cart: 'Add To Cart',
      name: 'HAVIT HV-G92 Gamepad',
      dPrice: 120,
      mPrice: 160,
      ratingStar: FaStar,
      rating: 88,
    },
    {
      id: 2,
      img: fSales2,
      dis: 35,
      heartIcn: FaRegHeart,
      eyeIcn: IoEyeOutline,
      cart: 'Add To Cart',
      name: 'AK-900 Wired Keyboard',
      dPrice: 960,
      mPrice: 1160,
      ratingStar: FaStar,
      rating: 75,
    },
    {
      id: 3,
      img: fSales3,
      dis: 30,
      heartIcn: FaRegHeart,
      eyeIcn: IoEyeOutline,
      cart: 'Add To Cart',
      name: 'IPS LCD Gaming Monitor',
      dPrice: 370,
      mPrice: 400,
      ratingStar: FaStar,
      rating: 99,
    },
    {
      id: 4,
      img: fSales4,
      dis: 25,
      heartIcn: FaRegHeart,
      eyeIcn: IoEyeOutline,
      cart: 'Add To Cart',
      name: 'S-Series Comfort Chair',
      dPrice: 375,
      mPrice: 400,
      ratingStar: FaStar,
      rating: 99,
    },
    {
      id: 5,
      img: fSales1,
      dis: 40,
      heartIcn: FaRegHeart,
      eyeIcn: IoEyeOutline,
      cart: 'Add To Cart',
      name: 'HAVIT HV-G92 Gamepad',
      dPrice: 120,
      mPrice: 160,
      ratingStar: FaStar,
      rating: 88,
    },
    {
      id: 6,
      img: fSales2,
      dis: 35,
      heartIcn: FaRegHeart,
      eyeIcn: IoEyeOutline,
      cart: 'Add To Cart',
      name: 'AK-900 Wired Keyboard',
      dPrice: 960,
      mPrice: 1160,
      ratingStar: FaStar,
      rating: 75,
    },
  ];
  return (
    <section className="pt-24">
      <div className="container">
        <div className="section-title mb-[31px]">
          <div className="mb-[13px] relative after:absolute after:content-[''] after:w-5 after:h-full after:bg-[#DB4444] after:left-0 after:top-0 after:rounded-sm ps-9">
            <h4 className="font-poppins font-semibold text-base text-[#DB4444] leading-10">
              Today’s
            </h4>
          </div>

          <div className="flex justify-between items-center gap-[470px]">
            <div className="flex gap-[87px] items-center">
              <h2 className="font-inter font-semibold text-4xl text-black leading-12 tracking-[4%]">
                Flash Sales
              </h2>

              <div className="flex gap-[17px] items-center">
                <div>
                  <h4 className="text-xs pb-1">Days</h4>
                  <h3 className="text-[32px] font-bold">
                    {days >= 10 ? days : `0${days}`}
                  </h3>
                </div>
                <span className="text-xl text-[#E07575]">:</span>

                <div>
                  <h4 className="text-xs pb-1">Hours</h4>
                  <h3 className="text-[32px] font-bold">
                    {hours >= 10 ? hours : `0${hours}`}
                  </h3>
                </div>
                <span className="text-xl text-[#E07575]">:</span>

                <div>
                  <h4 className="text-xs pb-1">Minutes</h4>
                  <h3 className="text-[32px] font-bold">
                    {minutes >= 10 ? minutes : `0${minutes}`}
                  </h3>
                </div>
                <span className="text-xl text-[#E07575]">:</span>

                <div>
                  <h4 className="text-xs pb-1">Seconds</h4>
                  <h3 className="text-[32px] font-bold">
                    {seconds >= 10 ? seconds : `0${seconds}`}
                  </h3>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <div className="flash-prev bg-[#F5F5F5] hover:bg-[rgba(174,171,171,0.5)] duration-300 p-4 rounded-full cursor-pointer">
                <GoArrowLeft className="text-base" />
              </div>
              <div className="flash-next bg-[#F5F5F5] hover:bg-[rgba(174,171,171,0.5)] p-4 rounded-full cursor-pointer duration-300">
                <GoArrowRight className="text-base" />
              </div>
            </div>
          </div>
        </div>

        <div className="pb-[118px]">
          <Swiper
            modules={[Navigation, Autoplay]}
            slidesPerView={4}
            spaceBetween={30}
            autoplay={{
              delay: 2500,
              disableOnInteraction: false,
            }}
            navigation={{
              nextEl: '.flash-next',
              prevEl: '.flash-prev',
            }}
            loop={true}
            className="flash-swiper"
          >
            {flashItems.map(fItems => {
              const isWished = wishlist.some(w => w.id === fItems.id);

              const handleToggleWishlist = () => {
                if (isWished) {
                  removeFromWishlist(fItems.id);
                } else {
                  addToWishlist(fItems);
                }
              };

              return (
                <SwiperSlide key={fItems.id}>
                  <div className="item group">
                    <div className="bg-[#F5F5F5] py-[35px] rounded-sm relative overflow-hidden">
                      <Link to={`/product/${fItems.id}`}>
                        <img
                          className="mx-auto w-[172px] transition-transform duration-300 group-hover:scale-90"
                          src={fItems.img}
                          alt=""
                        />
                      </Link>

                      {/* Discount Badge */}
                      <div className="absolute top-3 left-3 bg-[#DB4444] py-1 px-3 rounded-sm">
                        <p className="text-xs text-white">- {fItems.dis}%</p>
                      </div>

                      <div className="absolute top-3 right-3">
                        <button
                          onClick={handleToggleWishlist}
                          className="bg-white p-[5px] rounded-full mb-2 cursor-pointer"
                          aria-label={
                            isWished ? 'Remove from wishlist' : 'Add to wishlist'
                          }
                        >
                          <fItems.heartIcn
                            className={`text-base ${
                              isWished ? 'text-red-500' : 'text-black'
                            }`}
                          />
                        </button>
                        <Link
                          to={`/product/${fItems.id}`}
                          className="bg-white p-[5px] rounded-full cursor-pointer flex items-center justify-center"
                          aria-label="View details"
                        >
                          <fItems.eyeIcn className="text-base" />
                        </Link>
                      </div>

                    <div
                      onClick={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        addToCart(fItems);
                      }}
                      className="py-2 bg-black text-center rounded-b-sm absolute -bottom-[26px] left-0 w-full opacity-0
                    group-hover:opacity-100 transition-all duration-300 group-hover:bottom-0"
                    >
                      <p className="text-white cursor-pointer">
                        <a>{fItems.cart}</a>
                      </p>
                    </div>
                  </div>

                  <Link to={`/product/${fItems.id}`}>
                    <div className="pt-4">
                      <h3 className="font-medium text-base">{fItems.name}</h3>

                      <p className="py-2 flex items-center gap-3 text-base font-medium">
                        <span className="text-[#DB4444]">${fItems.dPrice}</span>
                        <del className="text-[rgba(0,0,0,0.5)]">
                          ${fItems.mPrice}
                        </del>
                      </p>

                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((_, i) => (
                          <fItems.ratingStar
                            key={i}
                            className="text-[#FFAD33] text-lg"
                          />
                        ))}
                        <span className="text-sm text-[rgba(0,0,0,0.5)] ps-1">
                          ({fItems.rating})
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>

        <div className="text-center pb-[102px]">
          <Link
            to="/shop"
            className="bg-[#DB4444] hover:bg-[#b80808] transition-all duration-300 py-4 px-12 rounded-sm text-white font-medium text-base"
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FlashSales;