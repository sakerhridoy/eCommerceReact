import React, { useEffect, useState } from 'react';
import banner from '../../assets/Images/banner.png';
import iphone15 from '../../assets/Images/iphone15.png';
import iphone16 from '../../assets/Images/iphone16.png';
import iphone17 from '../../assets/Images/iphone17.png';
import apple from '../../assets/Images/appleLogo.png';
import { IoArrowForward } from 'react-icons/io5';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Slider from 'react-slick';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Banner = () => {
  /* ================= BANNER DATA ================= */
  const bannerItems = [
    {
      id: 1,
      logo: apple,
      series: 'iPhone 14 Series',
      voucher: 'Up to 10% off Voucher',
      btn: 'Shop Now',
      img: banner,
    },
    {
      id: 2,
      logo: apple,
      series: 'iPhone 15 Series',
      voucher: 'Up to 15% off Voucher',
      btn: 'Shop Now',
      img: iphone15,
    },
    {
      id: 3,
      logo: apple,
      series: 'iPhone 16 Series',
      voucher: 'Up to 20% off Voucher',
      btn: 'Shop Now',
      img: iphone16,
    }
  ];

  /* ================= STATE ================= */
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ================= FETCH CATEGORIES ================= */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(
          'https://dummyjson.com/products/categories',
        );

        if (Array.isArray(res.data)) {
          setCategories(res.data);
        } else {
          setCategories([]);
        }
      } catch (err) {
        setCategories([]);
        setError('Failed to load categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  /* ================= SLIDER SETTINGS ================= */
  const settings = {
    dots: true,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 2000,
    fade: true,
    cssEase: 'linear',
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
  };

  return (
    <section className="lg:mx-4 xl:mx-0">
      <div className="container">
        <div className="flex flex-col lg:flex-row gap-[45px] justify-between">
          {/* ================= CATEGORY SIDEBAR ================= */}
          <div className="hidden lg:flex w-[20%] flex-col gap-6 pt-10 border-r border-black/20">
            {loading ? (
              <div className="space-y-4">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="h-6 bg-gray-200 animate-pulse rounded"
                  ></div>
                ))}
              </div>
            ) : error ? (
              <p className="text-red-500 text-sm">{error}</p>
            ) : (
              categories.slice(0, 8).map((cate, index) => (
                <Link
                  key={cate.slug || index}
                  to={`/products/category/${cate.slug}`}
                  className="font-poppins text-base text-gray-700 hover:text-[#DB4444] transition capitalize"
                >
                  {cate.name}
                </Link>
              ))
            )}
          </div>

          {/* ================= BANNER SLIDER ================= */}
          <div className="w-full lg:w-[80%] pt-6 lg:pt-10">
            <Slider {...settings}>
              {bannerItems.map(item => (
                <div key={item.id}>
                  {/* FIXED HEIGHT SLIDE */}
                  <div className="bg-black h-[420px] lg:h-[420px] flex flex-col lg:flex-row gap-[38px] justify-center items-center lg:ps-16 pt-6 lg:pt-4 rounded-lg overflow-hidden">
                    {/* LEFT CONTENT */}
                    <div className="w-full lg:w-[40%] text-center lg:text-left">
                      <div className="flex gap-6 items-center justify-center lg:justify-start mb-4">
                        <img src={item.logo} alt="apple" className="w-10" />
                        <p className="font-poppins text-base text-[#fafafa]">
                          {item.series}
                        </p>
                      </div>

                      <h2 className="font-inter font-semibold text-[32px] lg:text-[38px] xl:text-[48px] leading-10 lg:leading-[60px] pb-[22px] text-[#fafafa] tracking-[0.04em] lg:pe-12">
                        {item.voucher}
                      </h2>

                      <Link
                        to="/shop"
                        className="flex gap-2 items-center justify-center lg:justify-start group"
                      >
                        <span className="font-poppins text-base text-[#fafafa] border-b border-[#fafafa] pb-1 group-hover:text-[#DB4444] group-hover:border-[#DB4444] transition">
                          {item.btn}
                        </span>
                        <IoArrowForward className="text-[#fafafa] text-xl group-hover:text-[#DB4444]" />
                      </Link>
                    </div>

                    {/* RIGHT IMAGE */}
                    <div className="w-full lg:w-[60%] flex justify-center lg:justify-end">
                      <img
                        src={item.img}
                        alt="banner"
                        className="w-[260px] sm:w-[320px] lg:w-[396px] h-auto lg:h-[352px] object-contain"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Banner;