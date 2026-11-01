import React, { useEffect, useState } from 'react';
import { FaStar, FaStarHalfAlt, FaRegHeart } from 'react-icons/fa';
import { IoEyeOutline } from 'react-icons/io5';
import { useShop } from '../../contexts/ShopContext';
import { Link } from 'react-router-dom';
import { getHomeData } from '../../api/catalog';

const BestSelling = () => {
  const [bestSellingItems, setBestSellingItems] = useState([]);
  const { addToWishlist, wishlist, removeFromWishlist, addToCart } = useShop();

  useEffect(() => {
    let active = true;
    getHomeData()
      .then(data => {
        if (active) {
          setBestSellingItems(
            Array.isArray(data?.bestSellers) ? data.bestSellers : [],
          );
        }
      })
      .catch(error => console.error('Failed to load best sellers:', error));
    return () => {
      active = false;
    };
  }, []);
  const safeBestSellingItems = Array.isArray(bestSellingItems)
    ? bestSellingItems
    : [];

  const renderStars = rating => {
    const stars = [];
    const fullStars = Math.floor(rating || 4);
    const hasHalfStar = (rating || 4) % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`full-${i}`} className="text-[#FFAD33]" />);
    }

    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half" className="text-[#FFAD33]" />);
    }

    return stars;
  };

  return (
    <section className="mx-4 xl:mx-0">
      <div className="container">
        <div className="section-title border-t border-[rgba(0,0,0,0.3)]">
          <div className="mb-7.75 pt-20">
            <div className="mb-3.25 relative after:absolute after:w-5 after:h-full after:bg-[#DB4444] after:left-0 after:top-0 after:rounded-sm ps-9">
              <h4 className="font-poppins font-semibold text-base text-[#DB4444] leading-10">
                This Month
              </h4>
            </div>

            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
              <h2 className="font-inter font-semibold text-4xl text-black">
                Best Selling Products
              </h2>

              <Link
                to="/shop"
                className="bg-[#DB4444] hover:bg-[#b80808] transition-all duration-300 text-center py-4 px-12 rounded-sm font-poppins font-medium text-base text-[#fafafa] w-max hidden lg:inline-block"
              >
                View All
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-7.5 pb-20 lg:pb-35">
          {safeBestSellingItems.map(item => {
            const isWished = wishlist.some(w => w.id === item.id);

            const handleToggleWishlist = () => {
              isWished ? removeFromWishlist(item.id) : addToWishlist(item);
            };

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
              <div
                key={item.id || item._id}
                className="item group flex flex-col justify-between"
              >
                <div
                  className={`bg-[#F5F5F5] py-8.75 rounded-sm relative overflow-hidden flex items-center justify-center h-64 ${isOutOfStock ? 'opacity-60' : ''}`}
                >
                  <Link
                    to={isOutOfStock ? '#' : `/product/${item.id || item._id}`}
                    onClick={e => isOutOfStock && e.preventDefault()}
                    className={`w-full h-full flex items-center justify-center p-4 ${isOutOfStock ? 'cursor-not-allowed' : ''}`}
                  >
                    <img
                      className={`max-h-full max-w-full object-contain duration-300 ${!isOutOfStock && 'group-hover:scale-90'}`}
                      src={item.img || item.thumbnail || item.image || null}
                      alt={item.name || item.title || 'Product'}
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
                    <div className="absolute top-3 right-3 px-3 flex flex-col gap-2 z-10">
                      <button
                        onClick={handleToggleWishlist}
                        className="bg-white p-2 rounded-full cursor-pointer shadow-sm hover:text-[#DB4444] transition-colors"
                      >
                        <FaRegHeart
                          className={`text-base ${
                            isWished ? 'text-red-500' : 'text-black'
                          }`}
                        />
                      </button>

                      <Link
                        to={`/product/${item.id || item._id}`}
                        className="bg-white p-2 rounded-full flex items-center justify-center shadow-sm hover:text-[#DB4444] transition-colors"
                      >
                        <IoEyeOutline className="text-base text-black hover:text-[#DB4444] transition-colors" />
                      </Link>
                    </div>
                  )}

                  {!isOutOfStock && (
                    <div
                      onClick={() => addToCart(item)}
                      className="absolute left-0 -bottom-11.25 w-full bg-black text-white text-center py-2
                      cursor-pointer opacity-0 group-hover:bottom-0 group-hover:opacity-100 transition-all z-10 font-medium font-poppins"
                    >
                      Add To Cart
                    </div>
                  )}
                </div>

                <div className={`pt-4 ${isOutOfStock ? 'opacity-60' : ''}`}>
                  <Link
                    to={isOutOfStock ? '#' : `/product/${item.id || item._id}`}
                    onClick={e => isOutOfStock && e.preventDefault()}
                    className={
                      isOutOfStock
                        ? 'cursor-not-allowed'
                        : 'hover:text-[#DB4444] transition-colors'
                    }
                  >
                    <h3 className="font-poppins font-medium text-base text-black line-clamp-1 transition-colors">
                      {item.name || item.title}
                    </h3>
                  </Link>

                  <p className="py-2 font-poppins font-medium text-base flex items-center gap-3 flex-wrap">
                    <span className="text-[#DB4444]">
                      ৳{item.dPrice || item.price}
                    </span>

                    {discountPercentage > 0 && (item.mPrice || item.price) && (
                      <del className="text-[rgba(0,0,0,0.5)] text-sm">
                        ৳
                        {item.mPrice ||
                          (item.price / (1 - discountPercentage / 100)).toFixed(
                            2,
                          )}
                      </del>
                    )}
                  </p>

                  <div className="flex items-center gap-1">
                    {renderStars(item.ratingStars || item.rating)}
                    <span className="font-poppins font-semibold text-sm text-[rgba(0,0,0,0.5)] ps-1 mt-0.5">
                      ({item.rating || 35})
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="block lg:hidden pb-15 text-center">
          <Link
            to="/shop"
            className="bg-[#DB4444] hover:bg-[#b80808] transition-all duration-300 inline-block py-4 px-12 rounded-sm font-poppins font-medium text-base text-[#fafafa]"
          >
            View All
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BestSelling;