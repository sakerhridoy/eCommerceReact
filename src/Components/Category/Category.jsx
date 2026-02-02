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

  useEffect(() => {
    axios
      .get('https://dummyjson.com/products/categories')
      .then(result => setCategories(result.data));
  });

  return (
    <section className="pb-[120px]">
      <div className="container">
        <div className="section-title border-t border-[rgba(0,0,0,0.3)]">
          <div className="section-title mb-[31px] pt-20">
            <div className="mb-[13px] relative after:absolute after:content-[''] after:w-5 after:h-full after:bg-[#DB4444] after:left-0 after:top-0 after:rounded-sm ps-9">
              <h4 className="font-poppins font-semibold text-base text-[#DB4444] leading-10">
                Categories
              </h4>
            </div>

            <div className="flex justify-between items-center pb-10">
              <h2 className="font-inter font-semibold text-4xl text-black tracking-[4%]">
                Browse By Category
              </h2>

              {/* Buttons */}
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

          {/* SLIDER START */}
          <Swiper
            modules={[Navigation, Autoplay]}
            slidesPerView={6}
            spaceBetween={30}
            autoplay={{ delay: 2000, disableOnInteraction: false }}
            onInit={swiper => {
              swiper.params.navigation.prevEl = prevRef.current;
              swiper.params.navigation.nextEl = nextRef.current;
              swiper.navigation.init();
              swiper.navigation.update();
            }}
            className="pb-[130px] pt-[60px]"
          >
            {categories.map(item => (
              <SwiperSlide key={item.id}>
                <Link to={`/products/category/${item.slug}`}>
                  <div className="pt-[25px] pb-6 border border-[rgba(0,0,0,0.1)] rounded-sm text-center group hover:bg-[#DB4444] cursor-pointer transition-all duration-300">
                    <h3 className="font-poppins text-base text-black py-[22px] group-hover:text-white transition-colors duration-300">
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
