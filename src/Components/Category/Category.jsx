import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaStar, FaRegHeart } from 'react-icons/fa';
import { IoEyeOutline } from 'react-icons/io5';
import { getProducts } from '../../api/catalog';
import { useShop } from '../../contexts/ShopContext';
import Swal from 'sweetalert2';

const getImageUrl = imagePath => {
  if (!imagePath) {
    return 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400';
  }

  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  const backendBaseUrl =
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;

  if (!cleanPath.startsWith('/uploads')) {
    return `${backendBaseUrl}/uploads${cleanPath}`;
  }

  return `${backendBaseUrl}${cleanPath}`;
};

const Category = () => {
  const { category } = useParams();
  const { addToCart, addToWishlist, cart, wishlist } = useShop();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true,
  });

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      setLoading(true);
      try {
        const res = await getProducts({ category });
        setProducts(
          Array.isArray(res)
            ? res
            : Array.isArray(res?.products)
              ? res.products
              : [],
        );
      } catch (err) {
        console.error('Failed to load category products:', err);
        setError('Failed to load products');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryProducts();
  }, [category]);

  if (loading) {
    return (
      <div className="container max-w-7xl mx-auto py-32 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#DB4444] mx-auto"></div>
        <p className="mt-4 text-gray-500 font-poppins">Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-7xl mx-auto py-32 text-center">
        <p className="text-xl text-red-500 font-poppins">{error}</p>
        <Link
          to="/shop"
          className="text-[#DB4444] mt-4 inline-block font-medium"
        >
          Go to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-5 h-10 bg-[#DB4444] rounded-sm"></div>
          <span className="text-[#DB4444] font-semibold text-sm">Category</span>
        </div>
        <h1 className="text-3xl font-semibold capitalize tracking-wide text-black">
          {category}
        </h1>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">
            No products found in this category.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(item => {
            const isItemInCart = cart.some(
              c => c.id === item.id || c._id === item._id,
            );
            const isItemInWishlist = wishlist.some(
              w => w.id === item.id || w._id === item._id,
            );
            const resolvedImg = getImageUrl(
              item.thumbnail || item.image || item.images?.[0],
            );

            const isOutOfStock = item.stock <= 0;

            const discountAmount = item.discountPercentage
              ? Math.round(item.discountPercentage)
              : 0;

            const handleAddToCart = () => {
              if (isItemInCart) {
                Toast.fire({
                  icon: 'info',
                  title: `${item.title || item.name} is already in your cart!`,
                });
              } else {
                addToCart({
                  id: item.id || item._id,
                  name: item.title || item.name,
                  price: item.price,
                  image: resolvedImg,
                  quantity: 1,
                });
                Toast.fire({
                  icon: 'success',
                  title: 'Added to cart!',
                });
              }
            };

            const handleAddToWishlist = () => {
              if (isItemInWishlist) {
                Toast.fire({
                  icon: 'info',
                  title: 'Already in your wishlist!',
                });
              } else {
                addToWishlist(item);
                Toast.fire({
                  icon: 'success',
                  title: 'Added to wishlist! ❤️',
                });
              }
            };

            return (
              <div
                key={item.id || item._id}
                className="group flex flex-col justify-between"
              >
                <div
                  className={`bg-[#F5F5F5] h-64 relative overflow-hidden rounded-sm flex items-center justify-center p-4 ${isOutOfStock ? 'opacity-60' : ''}`}
                >
                  <Link
                    to={isOutOfStock ? '#' : `/product/${item.id || item._id}`}
                    onClick={e => isOutOfStock && e.preventDefault()}
                    className={`w-full h-full flex items-center justify-center ${isOutOfStock ? 'cursor-not-allowed' : ''}`}
                  >
                    <img
                      src={resolvedImg}
                      alt={item.title || item.name}
                      className={`max-h-full max-w-full object-contain transition-transform duration-300 ${!isOutOfStock && 'group-hover:scale-105'}`}
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
                      <p className="text-xs text-white">- {discountAmount}%</p>
                    </div>
                  ) : null}

                  {!isOutOfStock && (
                    <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
                      <button
                        onClick={handleAddToWishlist}
                        className={`p-2 rounded-full bg-white shadow-sm transition ${
                          isItemInWishlist
                            ? 'text-red-500'
                            : 'text-black hover:text-red-500'
                        }`}
                        aria-label="Wishlist"
                      >
                        <FaRegHeart className="w-4 h-4" />
                      </button>
                      <Link
                        to={`/product/${item.id || item._id}`}
                        className="p-2 rounded-full bg-white shadow-sm text-black hover:text-[#DB4444] transition flex items-center justify-center"
                        aria-label="Details"
                      >
                        <IoEyeOutline className="w-4 h-4" />
                      </Link>
                    </div>
                  )}

                  {!isOutOfStock && (
                    <button
                      onClick={handleAddToCart}
                      className="absolute bottom-0 left-0 w-full bg-black text-white py-2 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
                    >
                      Add To Cart
                    </button>
                  )}
                </div>

                <div className={`pt-4 ${isOutOfStock ? 'opacity-60' : ''}`}>
                  <Link
                    to={isOutOfStock ? '#' : `/product/${item.id || item._id}`}
                    onClick={e => isOutOfStock && e.preventDefault()}
                    className={`font-medium text-black line-clamp-1 ${isOutOfStock ? 'cursor-not-allowed' : 'hover:text-[#DB4444]'}`}
                  >
                    {item.title || item.name}
                  </Link>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[#DB4444] font-semibold">
                      ৳{item.price}
                    </span>
                    {discountAmount > 0 && (
                      <del className="text-gray-400 text-sm">
                        ৳{(item.price / (1 - discountAmount / 100)).toFixed(2)}
                      </del>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-[#FFAD33]">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < Math.floor(item.rating || 4)
                            ? 'text-[#FFAD33]'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="text-xs text-gray-400 ml-1">
                      ({item.rating || 35})
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Category;
