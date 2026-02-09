import React, { useEffect, useRef, useState } from 'react';
import { GoArrowLeft, GoArrowRight } from 'react-icons/go';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import axios from 'axios';
import { Link } from 'react-router';

const Category = () => {
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  const [categories, setCategories] = useState([]);

  // ✅ FIX: dependency array added
  useEffect(() => {
    axios
      .get('https://dummyjson.com/products/categories')
      .then(res => setCategories(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <section className="pb-30 pt-15 mx-4 xl:mx-0">
      <div className="container">
        <div className="section-title border-t border-[rgba(0,0,0,0.3)]">
          <div className="section-title mb-7.75 pt-20">
            <div className="mb-3.25 relative after:absolute after:w-5 after:h-full after:bg-[#DB4444] after:left-0 after:top-0 after:rounded-sm ps-9">
              <h4 className="font-poppins font-semibold text-base text-[#DB4444] leading-10">
                Categories
              </h4>
            </div>

            <div className="flex justify-between items-center pb-10">
              <h2 className="font-inter font-semibold text-4xl text-black tracking-[4%]">
                Browse By Category
              </h2>

              {/* Arrows (UNCHANGED UI) */}
              <div className="flex gap-2">
                <div
                  ref={prevRef}
                  className="bg-[#F5F5F5] hover:bg-[rgba(174,171,171,0.5)] duration-300 p-4 rounded-full cursor-pointer"
                >
                  <GoArrowLeft className="text-black" />
                </div>

                <div
                  ref={nextRef}
                  className="bg-[#F5F5F5] hover:bg-[rgba(174,171,171,0.5)] duration-300 p-4 rounded-full cursor-pointer"
                >
                  <GoArrowRight className="text-black" />
                </div>
              </div>
            </div>
          </div>

          {/* ================= SLIDER ================= */}
          <Swiper
            modules={[Navigation, Autoplay]}
            autoplay={{ delay: 2000, disableOnInteraction: false }}
            spaceBetween={30}
            slidesPerView={6}
            breakpoints={{
              0: {
                slidesPerView: 2,
                spaceBetween: 12,
              },
              640: {
                slidesPerView: 3,
              },
              768: {
                slidesPerView: 4,
              },
              1024: {
                slidesPerView: 5,
              },
              1280: {
                slidesPerView: 6,
              },
            }}
            onInit={swiper => {
              swiper.params.navigation.prevEl = prevRef.current;
              swiper.params.navigation.nextEl = nextRef.current;
              swiper.navigation.init();
              swiper.navigation.update();
            }}
            className="pb-32.5 pt-15"
          >
            {categories.map(item => (
              <SwiperSlide key={item.slug}>
                <Link to={`/products/category/${item.slug}`}>
                  <div className="pt-6.25 pb-6 border border-[rgba(0,0,0,0.1)] rounded-sm text-center group hover:bg-[#DB4444] cursor-pointer transition-all duration-300">
                    <h3 className="font-poppins text-base text-black py-5.5 group-hover:text-white transition-colors duration-300">
                      {item.name}
                    </h3>
                  </div>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default Category;
