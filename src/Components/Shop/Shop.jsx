import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FaStar, FaRegHeart } from 'react-icons/fa6';
import { IoEyeOutline } from 'react-icons/io5';
import axios from 'axios';
import { useShop } from '../../context/shopContext/ShopContext';
import Swal from 'sweetalert2';

const Shop = () => {
  const { addToCart, wishlist, addToWishlist, removeFromWishlist, cart } =
    useShop();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 9;

  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || '';
  const searchQuery = searchParams.get('search') || '';

  const [dropdownOpen, setDropdownOpen] = useState(false);

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

  // ================= FETCH CATEGORIES =================
  useEffect(() => {
    axios
      .get('https://dummyjson.com/products/categories')
      .then(res => {
        const cats = res.data.map(c =>
          typeof c === 'string' ? { name: c, slug: c } : c,
        );
        setCategories(cats);
      })
      .catch(() => setCategories([]));
  }, []);

  // ================= FETCH PRODUCTS =================
  useEffect(() => {
    setLoading(true);
    axios
      .get('https://dummyjson.com/products?limit=100')
      .then(res => {
        let items = res.data.products.map(p => ({
          ...p,
          img: p.thumbnail,
          name: p.title,
          dPrice: Math.round(p.price * (1 - (p.discountPercentage || 0) / 100)),
        }));

        if (categoryParam) {
          items = items.filter(p => p.category === categoryParam);
        }

        if (searchQuery) {
          items = items.filter(p =>
            p.title.toLowerCase().includes(searchQuery.toLowerCase()),
          );
        }

        setProducts(items);
      })
      .finally(() => setLoading(false));
  }, [categoryParam, searchQuery]);

  const indexOfLast = currentPage * productsPerPage;
  const currentProducts = products.slice(
    indexOfLast - productsPerPage,
    indexOfLast,
  );
  const totalPages = Math.ceil(products.length / productsPerPage);

  return (
    <section className="pt-10 md:pt-20 pb-10 md:pb-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* SIDEBAR / DROPDOWN */}
          <div className="lg:col-span-1">
            <h3 className="text-xl font-bold mb-4">Categories</h3>

            {/* MOBILE / TABLET DROPDOWN */}
            <div className="lg:hidden relative mb-4">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full p-2 border rounded bg-white text-black text-left"
              >
                {categoryParam ? categoryParam : 'All Categories'}
              </button>

              {dropdownOpen && (
                <ul className="absolute z-10 bg-white w-full mt-1 shadow-md rounded max-h-60 overflow-y-auto">
                  {/* ALL CATEGORIES */}
                  <Link
                    to={`/shop`}
                    className={`block p-2 ${
                      categoryParam === '' ? 'bg-gray-300 font-semibold' : ''
                    }`}
                    onClick={() => setDropdownOpen(false)}
                  >
                    All Categories
                  </Link>

                  {categories.map(c => (
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

            {/* DESKTOP SIDEBAR */}
            <ul className="hidden lg:block space-y-2">
              <Link
                to={`/shop`}
                className={`block p-2 rounded ${
                  categoryParam === ''
                    ? 'bg-gray-300 font-semibold'
                    : 'hover:bg-gray-200'
                }`}
              >
                All Categories
              </Link>

              {categories.map(c => (
                <Link
                  key={c.slug}
                  to={`/shop?category=${c.slug}`}
                  className={`block p-2 rounded ${
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

          {/* PRODUCTS */}
          <div className="lg:col-span-4">
            {loading ? (
              <p>Loading...</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                {currentProducts.map(item => {
                  const isWished = wishlist.some(w => w.id === item.id);
                  const isInCart = cart.some(c => c.id === item.id);

                  const handleAddToCart = () => {
                    if (isInCart) {
                      Toast.fire({
                        icon: 'info',
                        title: `${item.name} is already in your cart!`,
                      });
                    } else {
                      addToCart(item);
                      Toast.fire({
                        icon: 'success',
                        title: `${item.name} added to cart!`,
                      });
                    }
                  };

                  const handleToggleWishlist = () => {
                    if (isWished) {
                      removeFromWishlist(item.id);
                      Toast.fire({
                        icon: 'warning',
                        title: `${item.name} removed from wishlist`,
                      });
                    } else {
                      addToWishlist(item);
                      Toast.fire({
                        icon: 'success',
                        title: `${item.name} added to wishlist! ❤️`,
                      });
                    }
                  };

                  return (
                    <div key={item.id} className="group">
                      <div className="bg-[#F5F5F5] py-10 rounded relative overflow-hidden">
                        <Link to={`/product/${item.id}`}>
                          <img
                            src={item.img}
                            alt={item.name}
                            className="mx-auto w-40"
                          />
                        </Link>

                        {/* ICONS */}
                        <div className="absolute top-3 right-3 flex flex-col gap-2">
                          <button
                            onClick={handleToggleWishlist}
                            className={`bg-white p-2 rounded-full transition ${
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
                            to={`/product/${item.id}`}
                            className="bg-white p-2 rounded-full flex items-center justify-center"
                            aria-label="View details"
                          >
                            <IoEyeOutline />
                          </Link>
                        </div>

                        {/* ADD TO CART */}
                        <div
                          onClick={handleAddToCart}
                          className="absolute left-0 -bottom-11.25 w-full bg-black text-white text-center py-2 cursor-pointer opacity-0 group-hover:bottom-0 group-hover:opacity-100 transition-all"
                        >
                          Add To Cart
                        </div>
                      </div>

                      {/* DETAILS */}
                      <div className="p-4">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="py-2 flex gap-3">
                          <span className="text-[#DB4444]">${item.dPrice}</span>
                          <del className="text-black/50">${item.price}</del>
                        </p>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <FaStar key={i} className="text-[#FFAD33]" />
                          ))}
                          <span className="text-sm text-black/50">
                            ({item.rating})
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-3 mt-10 flex-wrap">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-4 py-2 rounded ${
                      currentPage === i + 1
                        ? 'bg-black text-white'
                        : 'bg-gray-200'
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
