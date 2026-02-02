import React, { useRef, useState } from 'react';
import explore from '../../assets/images/explore.png';
import explore1 from '../../assets/images/explore1.png';
import explore3 from '../../assets/images/explore3.png';
import explore4 from '../../assets/images/explore4.png';
import { FaStar, FaRegHeart } from 'react-icons/fa6';
import { GoArrowLeft, GoArrowRight } from 'react-icons/go';
import { IoEyeOutline } from 'react-icons/io5';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Grid, Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/grid';
import 'swiper/css/pagination';
import { Link } from 'react-router';
import { useShop } from '../../Context/ShopContext/ShopContext';

const Explore = () => {
  const swiperRef = useRef(null);

  const renderStars = count => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar
          key={i}
          className={
            i <= count
              ? 'text-[#FFAD33] text-lg' // filled star
              : 'text-[rgba(0,0,0,0.25)] text-lg' // empty star
          }
        />
      );
    }
    return stars;
  };

  const { addToCart, addToWishlist, wishlist, removeFromWishlist } = useShop();

  const exploreItems = [
    {
      id: 1,
      img: explore1,
      title: 'Breed Dry Dog Food',
      price: 100,
      ratingStars: 3,
      rating: 88,
    },
    {
      id: 2,
      img: explore,
      title: 'CANON EOS DSLR Camera',
      price: 360,
      ratingStars: 4,
      rating: 95,
    },
    {
      id: 3,
      img: explore3,
      title: 'CANON EOS DSLR Camera',
      price: 700,
      ratingStars: 5,
      rating: 325,
    },
    {
      id: 4,
      img: explore4,
      title: 'CANON EOS DSLR Camera',
      price: 500,
      ratingStars: 4,
      rating: 145,
    },
    {
      id: 5,
      img: explore1,
      title: 'Breed Dry Dog Food',
      price: 100,
      ratingStars: 3,
      rating: 88,
    },
    {
      id: 6,
      img: explore,
      title: 'CANON EOS DSLR Camera',
      price: 360,
      ratingStars: 4,
      rating: 95,
    },
    {
      id: 7,
      img: explore3,
      title: 'CANON EOS DSLR Camera',
      price: 700,
      ratingStars: 5,
      rating: 325,
    },
    {
      id: 8,
      img: explore4,
      title: 'CANON EOS DSLR Camera',
      price: 500,
      ratingStars: 4,
      rating: 145,
    },
    {
      id: 9,
      img: explore1,
      title: 'Breed Dry Dog Food',
      price: 100,
      ratingStars: 3,
      rating: 88,
    },
    {
      id: 10,
      img: explore,
      title: 'CANON EOS DSLR Camera',
      price: 360,
      ratingStars: 4,
      rating: 95,
    },
    {
      id: 11,
      img: explore3,
      title: 'CANON EOS DSLR Camera',
      price: 700,
      ratingStars: 5,
      rating: 325,
    },
    {
      id: 12,
      img: explore4,
      title: 'CANON EOS DSLR Camera',
      price: 500,
      ratingStars: 4,
      rating: 145,
    },
    
  ]

  const [visibleCount, setVisibleCount] = useState(4);

  return (
    <section className="pb-[168px]">
      <div className="container">
        {/* TOP HEADER */}
        <div className="section-title mb-[60px] pt-20">
          <div className="mb-[13px] relative after:absolute after:content-[''] after:w-5 after:h-full after:bg-[#DB4444] after:left-0 after:top-0 after:rounded-sm ps-9">
            <h4 className="font-poppins font-semibold text-base text-[#DB4444] leading-10">
              Our Products
            </h4>
          </div>

          <div className="flex justify-between items-center">
            <h2 className="font-inter font-semibold text-4xl text-black tracking-[4%]">
              Explore Our Products
            </h2>

            {/* ARROWS */}
            <div className="flex gap-2">
              <div
                onClick={() => swiperRef.current.slidePrev()}
                className="bg-[#F5F5F5] hover:bg-[rgba(174,171,171,0.5)] duration-300 p-4 rounded-full cursor-pointer"
              >
                <GoArrowLeft className="text-base text-black" />
              </div>

              <div
                onClick={() => swiperRef.current.slideNext()}
                className="bg-[#F5F5F5] hover:bg-[rgba(174,171,171,0.5)] duration-300 p-4 rounded-full cursor-pointer"
              >
                <GoArrowRight className="text-base  text-black" />
              </div>
            </div>
          </div>
        </div>

        {/* SWIPER GRID */}
        <Swiper
          modules={[Grid, Pagination]}
          spaceBetween={30}
          slidesPerView={4}
          grid={{ rows: 2, fill: 'row' }}
          pagination={false}
          slidesPerGroup={1}
          onSwiper={swiper => (swiperRef.current = swiper)}
        >
          {exploreItems.slice(0, visibleCount).map(expItem => {
            const isWished = wishlist.some(w => w.id === expItem.id);

            const handleToggleWishlist = () => {
              if (isWished) {
                removeFromWishlist(expItem.id);
              } else {
                addToWishlist(expItem);
              }
            };

            return (
              <SwiperSlide key={expItem.id}>
                <div className="item group">
                  <div className="bg-[#F5F5F5] py-[35px] rounded-sm relative overflow-hidden">
                    <Link to={`/product/${expItem.id}`}>
                      <img
                        className="mx-auto w-[172px] transition-transform duration-300 group-hover:scale-90"
                        src={expItem.img}
                        alt=""
                      />
                    </Link>

                    {/* HEART + EYE ICONS */}
                    <div className="absolute top-3 right-3 px-3">
                      <button
                        onClick={handleToggleWishlist}
                        className="bg-white p-[5px] rounded-full cursor-pointer mb-2"
                        aria-label={
                          isWished ? 'Remove from wishlist' : 'Add to wishlist'
                        }
                      >
                        <FaRegHeart
                          className={`text-base ${
                            isWished ? 'text-red-500' : 'text-black'
                          }`}
                        />
                      </button>
                      <Link
                        to={`/product/${expItem.id}`}
                        className="bg-white p-[5px] rounded-full cursor-pointer flex items-center justify-center"
                        aria-label="View details"
                      >
                        <IoEyeOutline className="text-base text-black" />
                      </Link>
                    </div>

                  {/* ADD TO CART */}
                  <div
                    onClick={() => addToCart(expItem)}
                    className="absolute left-0 bottom-[-45px] w-full bg-black text-white text-center py-2
                    cursor-pointer opacity-0 group-hover:bottom-0 group-hover:opacity-100 transition-all"
                  >
                    Add To Cart
                  </div>
                </div>

                {/* TEXT CONTENT */}
                <Link to={`/product/${expItem.id}`}>
                  <div className="pt-4">
                    <h3 className="font-poppins text-base text-black">
                      {expItem.title}
                    </h3>

                    <div className="flex items-center gap-1 py-2">
                      <p className="text-[#DB4444] font-poppins text-base">
                        ${expItem.price}
                      </p>

                      {/* DYNAMIC STARS HERE */}
                      {renderStars(expItem.ratingStars)}

                      <span className="font-poppins text-sm text-[rgba(0,0,0,0.5)] ps-1">
                        ({expItem.rating})
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            </SwiperSlide>
          );
        })}
        </Swiper>

        {/* VIEW ALL */}
        {visibleCount < exploreItems.length && (
          <div className="text-center mt-16">
            <a
              onClick={() => setVisibleCount(visibleCount + 4)}
              className="bg-[#DB4444] hover:bg-[#b80808] transition-all duration-300 py-4 px-12 rounded-sm font-poppins text-base text-white"
            >
              View More Products
            </a>
          </div>
        )}
      </div>
    </section>
  );
};

export default Explore;