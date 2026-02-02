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
    },
    {
      id: 4,
      logo: apple,
      series: 'iPhone 17 Series',
      voucher: 'Up to 10% off Voucher',
      btn: 'Shop Now',
      img: iphone17,
    },
  ];

  /* ================= STATE ================= */
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ================= FETCH CATEGORIES ================= */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          'https://dummyjson.com/products/categories',
        );

        if (Array.isArray(res.data)) {
          setCategories(res.data);
        } else {
          setCategories([]);
          setError('No categories found');
        }
      } catch (err) {
        setError('Failed to load categories');
        setCategories([]);
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
    <section>
      <div className="container">
        <div className="flex gap-[45px] justify-between">
          {/* ================= CATEGORY SIDEBAR ================= */}
          <div className="w-[20%] flex flex-col gap-6 pt-10 border-r border-black/20">
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
            ) : categories.length > 0 ? (
              categories.slice(0, 8).map((cate, index) => (
                <Link
                  key={cate.slug || index}
                  to={`/products/category/${cate.slug}`}
                  className="font-poppins text-sm md:text-base text-gray-700 hover:text-[#DB4444] transition-colors duration-200 capitalize"
                >
                  {cate.name}
                </Link>
              ))
            ) : (
              <p className="text-gray-500">No categories available</p>
            )}
          </div>

          {/* ================= BANNER SLIDER ================= */}
          <div className="w-[80%] pt-10">
            <Slider {...settings}>
              {bannerItems.map(item => (
                <div key={item.id}>
                  <div className="bg-black flex gap-[38px] justify-center items-center ps-16 pt-4 rounded-lg overflow-hidden">
                    {/* LEFT CONTENT */}
                    <div className="w-[40%]">
                      <div className="flex gap-6 items-center mb-4">
                        <img src={item.logo} alt="apple" className="w-10" />
                        <p className="font-poppins text-base text-[#fafafa]">
                          {item.series}
                        </p>
                      </div>

                      <h2 className="font-inter font-semibold text-[48px] leading-[60px] pb-[22px] text-[#fafafa] tracking-[0.04em] pe-12">
                        {item.voucher}
                      </h2>

                      <Link
                        to="/shop"
                        className="flex gap-2 items-center group"
                      >
                        <span className="font-poppins text-base text-[#fafafa] border-b border-[#fafafa] pb-1 group-hover:text-[#DB4444] group-hover:border-[#DB4444] transition">
                          {item.btn}
                        </span>
                        <IoArrowForward className="text-[#fafafa] text-xl group-hover:text-[#DB4444]" />
                      </Link>
                    </div>

                    {/* RIGHT IMAGE */}
                    <div className="w-[60%] flex justify-end">
                      <img
                        src={item.img}
                        alt="banner"
                        className="w-[396px] h-[352px] object-contain"
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
