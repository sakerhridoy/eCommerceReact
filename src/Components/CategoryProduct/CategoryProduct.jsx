import React, { useEffect, useState } from 'react';
import { FaStar, FaRegHeart } from 'react-icons/fa';
import { IoEyeOutline } from 'react-icons/io5';
import { Link, useParams } from 'react-router-dom';
import { getCategoryBySlug, getProducts } from '../../api/catalog';
import { useShop } from '../../contexts/ShopContext';

const CategoryProduct = () => {
  const { addToCart, addToWishlist } = useShop();
  const [cateProducts, setCateProducts] = useState([]);
  const { slug } = useParams();

  useEffect(() => {
    let active = true;
    const fetchCategoryProducts = async () => {
      try {
        const category = await getCategoryBySlug(slug);
        const products = await getProducts({
          category: category._id,
          limit: 100,
        });
        if (active) setCateProducts(products);
      } catch (error) {
        console.error('Failed to load category products:', error);
        if (active) setCateProducts([]);
      }
    };
    fetchCategoryProducts();
    return () => {
      active = false;
    };
  }, [slug]);

  const [visibleCount, setVisibleCount] = useState(4);

  return (
    <section className="pt-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pb-15">
          <h4 className='font-inter font-semibold text-[16px] leading-5 text-[#DB4444] pl-8.5 relative after:w-5 after:h-10 after:absolute after:content-[""] after:-top-2.5 after:left-0 after:bg-red-500 after:rounded-sm'>
            Category
          </h4>
          <h2 className="pt-8.5 font-inter font-semibold text-[36px] leading-12 text-[#DB4444] capitalize">
            {slug}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 pb-19 gap-x-7.5 gap-y-15">
          {cateProducts.slice(0, visibleCount).map((product, index) => {
            const isOutOfStock = product.stock <= 0;
            const discountAmount = product.discountPercentage
              ? Math.round(product.discountPercentage)
              : 0;

            return (
              <div key={product.id || index}>
                <div
                  className={`bg-[#F5F5F5] py-8.75 group rounded-sm mb-4 relative overflow-hidden flex items-center justify-center h-64 ${isOutOfStock ? 'opacity-60' : ''}`}
                >
                  <Link
                    to={isOutOfStock ? '#' : `/product/${product.id}`}
                    onClick={e => isOutOfStock && e.preventDefault()}
                    className={`w-full h-full flex items-center justify-center p-4 ${isOutOfStock ? 'cursor-not-allowed' : ''}`}
                  >
                    <img
                      src={
                        product.thumbnail || product.img || product.image
                          ? product.thumbnail || product.img || product.image
                          : null
                      }
                      alt={product.title || product.name || 'Product'}
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
                  ) : discountAmount > 0 ? (
                    <div className="absolute top-3 left-3 bg-[#DB4444] px-3 py-1 rounded-sm z-10">
                      <p className="text-xs text-white font-poppins">
                        - {discountAmount}%
                      </p>
                    </div>
                  ) : null}

                  {!isOutOfStock && (
                    <button
                      onClick={() => addToCart(product)}
                      className="bg-black absolute left-0 -bottom-10 w-full py-2 font-poppins font-medium text-[16px] leading-6 text-white text-center rounded-b-sm group-hover:bottom-0 duration-300 z-10"
                    >
                      Add To Cart
                    </button>
                  )}

                  {/* Actions (Wishlist & View) - Hide if out of stock */}
                  {!isOutOfStock && (
                    <div className="absolute top-3 right-3 z-10">
                      <button
                        onClick={() => addToWishlist(product)}
                        className="w-8.5 h-8.5 bg-white rounded-full flex justify-center items-center mb-2 shadow-sm hover:text-[#DB4444] transition-colors"
                        aria-label="Add to wishlist"
                      >
                        <FaRegHeart />
                      </button>
                      <Link
                        to={`/product/${product.id}`}
                        className="w-8.5 h-8.5 bg-white rounded-full flex justify-center items-center shadow-sm hover:text-[#DB4444] transition-colors"
                        aria-label="View details"
                      >
                        <IoEyeOutline />
                      </Link>
                    </div>
                  )}
                </div>

                <div className={`${isOutOfStock ? 'opacity-60' : ''}`}>
                  <h3 className="font-poppins font-medium text-black text-[16px] leading-6 pb-2 line-clamp-1">
                    <Link
                      to={isOutOfStock ? '#' : `/product/${product.id}`}
                      onClick={e => isOutOfStock && e.preventDefault()}
                      className={`${isOutOfStock ? 'cursor-not-allowed' : 'hover:text-[#DB4444]'}`}
                    >
                      {product.title || product.name}
                    </Link>
                  </h3>

                  <div className="flex gap-2 items-center flex-wrap">
                    <p className="font-poppins font-medium text-[#DB4444] text-[16px] leading-6">
                      ৳{product.price}
                    </p>

                    {discountAmount > 0 && (
                      <del className="text-gray-400 text-sm font-poppins">
                        ৳
                        {(product.price / (1 - discountAmount / 100)).toFixed(
                          2,
                        )}
                      </del>
                    )}

                    <div className="flex gap-1 items-center ml-2">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={`text-[16px] ${
                            i <
                            Math.floor(
                              product.ratingStars || product.rating || 4,
                            )
                              ? 'text-[#FFAD33]'
                              : 'text-[rgba(0,0,0,0.25)]'
                          }`}
                        />
                      ))}
                    </div>

                    <span className="font-poppins font-semibold text-[rgba(0,0,0,0.5)] text-[14px] leading-5">
                      ({product.rating || 35})
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {visibleCount < cateProducts.length && (
          <div className="pb-22.75 text-center">
            <button
              onClick={() => setVisibleCount(visibleCount + 4)}
              className="px-12 py-4 bg-[#DB4444] text-[#fafafa] text-[16px] leading-6 font-poppins font-medium rounded-sm hover:bg-red-600 transition-colors"
            >
              View More Products
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default CategoryProduct;