import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FaStar, FaRegHeart } from 'react-icons/fa6';
import { IoEyeOutline } from 'react-icons/io5';
import { useShop } from '../../contexts/ShopContext';
import Swal from 'sweetalert2';
import {
  getCategories,
  getCategoryBySlug,
  getProducts,
} from '../../api/catalog';

const Shop = () => {
  const { addToCart, wishlist, addToWishlist, removeFromWishlist, cart } =
    useShop();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || '';
  const searchQuery = searchParams.get('search') || '';

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const safeCategories = Array.isArray(categories) ? categories : [];
  const safeProducts = Array.isArray(products) ? products : [];

  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: toast => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    },
  });

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(error => {
        console.error('Failed to load categories:', error);
        setCategories([]);
      });
  }, []);

  useEffect(() => {
    setLoading(true);
    setCurrentPage(1);
    let active = true;
    const fetchProducts = async () => {
      try {
        const params = { limit: 100, search: searchQuery || undefined };
        if (categoryParam) {
          const category = await getCategoryBySlug(categoryParam);
          params.category = category?._id;
        }
        const items = await getProducts(params);
        if (active) setProducts(Array.isArray(items) ? items : []);
      } catch (error) {
        console.error('Failed to load products:', error);
        if (active) setProducts([]);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchProducts();
    return () => {
      active = false;
    };
  }, [categoryParam, searchQuery]);

  const indexOfLast = currentPage * productsPerPage;
  const currentProducts = safeProducts.slice(
    indexOfLast - productsPerPage,
    indexOfLast,
  );
  const totalPages = Math.ceil(safeProducts.length / productsPerPage);

  return (
    <section className="pt-10 md:pt-20 pb-10 md:pb-24 font-poppins">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-1">
            <h3 className="text-xl font-bold mb-4">Categories</h3>

            <div className="lg:hidden relative mb-4">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full p-2 border rounded bg-white text-black text-left"
              >
                {categoryParam ? categoryParam : 'All Categories'}
              </button>

              {dropdownOpen && (
                <ul className="absolute z-10 bg-white w-full mt-1 shadow-md rounded max-h-60 overflow-y-auto">
                  <Link
                    to={`/shop`}
                    className={`block p-2 ${
                      categoryParam === '' ? 'bg-gray-300 font-semibold' : ''
                    }`}
                    onClick={() => setDropdownOpen(false)}
                  >
                    All Categories
                  </Link>

                  {safeCategories.map(c => (
                    <Link
                      key={c.slug}
                      to={`/shop?category=${c.slug}`}
                      className={`block p-2 ${
                        categoryParam === c.slug
                          ? 'bg-gray-300 font-semibold'
                          : ''
                      }`}
                      onClick={() => setDropdownOpen(false)}
                    >
                      {c.name}
                    </Link>
                  ))}
                </ul>
              )}
            </div>

            <ul className="hidden lg:block space-y-2">
              <Link
                to={`/shop`}
                className={`block p-2 rounded transition-colors ${
                  categoryParam === ''
                    ? 'bg-gray-300 font-semibold'
                    : 'hover:bg-gray-200'
                }`}
              >
                All Categories
              </Link>

              {safeCategories.map(c => (
                <Link
                  key={c.slug}
                  to={`/shop?category=${c.slug}`}
                  className={`block p-2 rounded transition-colors ${
                    categoryParam === c.slug
                      ? 'bg-gray-300 font-semibold'
                      : 'hover:bg-gray-200'
                  }`}
                >
                  {c.name}
                </Link>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-4">
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#DB4444]"></div>
              </div>
            ) : currentProducts.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                No products found.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                {currentProducts.map(item => {
                  const isWished = wishlist.some(
                    w => w.id === item.id || w.id === item._id,
                  );
                  const isInCart = cart.some(
                    c => c.id === item.id || c.id === item._id,
                  );

                  
                  const isOutOfStock = item.stock <= 0;

                  let discountAmount = 0;
                  const originalPrice = item.mPrice || item.price;
                  const currentPrice = item.dPrice || item.price;

                  if (
                    originalPrice &&
                    currentPrice &&
                    originalPrice > currentPrice
                  ) {
                    discountAmount = Math.round(
                      ((originalPrice - currentPrice) / originalPrice) * 100,
                    );
                  } else if (item.discountPercentage) {
                    discountAmount = Math.round(item.discountPercentage);
                  } else if (item.dis) {
                    discountAmount = item.dis;
                  }

                  const handleAddToCart = async () => {
                    if (isInCart) {
                      Toast.fire({
                        icon: 'info',
                        title: `${item.name || item.title} is already in your cart!`,
                      });
                    } else {
                      const added = await addToCart(item);
                      if (added) {
                        Toast.fire({
                          icon: 'success',
                          title: `${item.name || item.title} added to cart!`,
                        });
                      }
                    }
                  };

                  const handleToggleWishlist = () => {
                    if (isWished) {
                      removeFromWishlist(item.id || item._id);
                      Toast.fire({
                        icon: 'warning',
                        title: `${item.name || item.title} removed from wishlist`,
                      });
                    } else {
                      addToWishlist(item);
                      Toast.fire({
                        icon: 'success',
                        title: `${item.name || item.title} added to wishlist! ❤️`,
                      });
                    }
                  };

                  return (
                    <div key={item.id || item._id} className="group">
                      <div
                        className={`bg-[#F5F5F5] py-10 rounded relative overflow-hidden flex items-center justify-center h-64 ${isOutOfStock ? 'opacity-60' : ''}`}
                      >
                        <Link
                          to={
                            isOutOfStock
                              ? '#'
                              : `/product/${item.id || item._id}`
                          }
                          onClick={e => isOutOfStock && e.preventDefault()}
                          className={`w-full h-full flex items-center justify-center ${isOutOfStock ? 'cursor-not-allowed' : ''}`}
                        >
                          <img
                            src={
                              item.img || item.thumbnail || item.image || null
                            }
                            alt={item.name || item.title}
                            className={`max-h-full max-w-full object-contain p-4 duration-300 ${!isOutOfStock && 'group-hover:scale-90'}`}
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
                        ) : discountAmount > 0 ? (
                          <div className="absolute top-3 left-3 bg-[#DB4444] px-3 py-1 rounded-sm z-10">
                            <p className="text-xs text-white">
                              - {discountAmount}%
                            </p>
                          </div>
                        ) : null}

                        {!isOutOfStock && (
                          <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
                            <button
                              onClick={handleToggleWishlist}
                              className={`bg-white p-2 rounded-full shadow-sm transition hover:text-[#DB4444] ${
                                isWished ? 'text-red-500' : 'text-black'
                              }`}
                              aria-label={
                                isWished
                                  ? 'Remove from wishlist'
                                  : 'Add to wishlist'
                              }
                            >
                              <FaRegHeart />
                            </button>
                            <Link
                              to={`/product/${item.id || item._id}`}
                              className="bg-white p-2 rounded-full flex items-center justify-center shadow-sm hover:text-[#DB4444] transition-colors"
                              aria-label="View details"
                            >
                              <IoEyeOutline />
                            </Link>
                          </div>
                        )}

                        {!isOutOfStock && (
                          <div
                            onClick={handleAddToCart}
                            className="absolute left-0 -bottom-11.25 w-full bg-black text-white text-center py-2 cursor-pointer opacity-0 group-hover:bottom-0 group-hover:opacity-100 transition-all z-10 font-medium"
                          >
                            Add To Cart
                          </div>
                        )}
                      </div>

                      <div
                        className={`p-4 ${isOutOfStock ? 'opacity-60' : ''}`}
                      >
                        <h3 className="font-medium line-clamp-1">
                          <Link
                            to={
                              isOutOfStock
                                ? '#'
                                : `/product/${item.id || item._id}`
                            }
                            onClick={e => isOutOfStock && e.preventDefault()}
                            className={
                              isOutOfStock
                                ? 'cursor-not-allowed'
                                : 'hover:text-[#DB4444] transition-colors'
                            }
                          >
                            {item.name || item.title}
                          </Link>
                        </h3>

                        <p className="py-2 flex gap-3 items-center flex-wrap">
                          <span className="text-[#DB4444] font-medium">
                            ৳{currentPrice}
                          </span>

                          {discountAmount > 0 &&
                            originalPrice > currentPrice && (
                              <del className="text-black/50 text-sm">
                                ৳{originalPrice}
                              </del>
                            )}
                        </p>

                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              className={`text-[16px] ${
                                i <
                                Math.floor(item.ratingStars || item.rating || 4)
                                  ? 'text-[#FFAD33]'
                                  : 'text-[rgba(0,0,0,0.25)]'
                              }`}
                            />
                          ))}
                          <span className="text-sm text-black/50 ps-1">
                            ({item.rating || 35})
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!loading && totalPages > 1 && (
              <div className="flex justify-center gap-3 mt-10 flex-wrap">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-4 py-2 rounded transition-colors ${
                      currentPage === i + 1
                        ? 'bg-[#DB4444] text-white' // Active page color updated to theme red
                        : 'bg-gray-200 hover:bg-gray-300 text-black'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Shop;