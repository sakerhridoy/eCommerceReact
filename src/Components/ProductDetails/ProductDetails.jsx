import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FaStar, FaRegHeart } from 'react-icons/fa';
import { FiMinus } from 'react-icons/fi';
import { FaPlus } from 'react-icons/fa6';
import { useShop } from '../../contexts/ShopContext';
import { TbTruckDelivery } from 'react-icons/tb';
import { BsArrowRepeat } from 'react-icons/bs';
import { IoEyeOutline } from 'react-icons/io5';
import Swal from 'sweetalert2';
import { getProductById, getProducts } from '../../api/catalog';

const getImageUrl = imagePath => {
  if (!imagePath) return 'https://via.placeholder.com/600x600?text=No+Image';

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

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart, addToWishlist, cart, wishlist } = useShop();

  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedColor, setSelectedColor] = useState('blue');
  const [selectedSize, setSelectedSize] = useState('M');
  const [relatedProducts, setRelatedProducts] = useState([]);

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
    if (!id) return;

    const fetchProduct = async () => {
      setLoading(true);
      try {
        const loadedProduct = await getProductById(id);
        setProduct(loadedProduct);
        const categoryId =
          typeof loadedProduct.category === 'object'
            ? loadedProduct.category?._id
            : loadedProduct.category;
        const products = categoryId
          ? await getProducts({ category: categoryId, limit: 8 })
          : [];
        setRelatedProducts(products.filter(p => p.id !== loadedProduct.id));
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto py-40 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#DB4444] mx-auto"></div>
        <p className="mt-4 text-gray-600 font-poppins">
          Loading product details...
        </p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto py-40 text-center font-poppins">
        <p className="text-2xl text-red-600">{error || 'Product not found'}</p>
        <Link
          to="/shop"
          className="text-[#DB4444] mt-4 inline-block font-medium hover:underline"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  const isInCart = cart.some(c => c.id === product.id);
  const isInWishlist = wishlist.some(w => w.id === product.id);

  const handleAddToCart = async () => {
    if (isInCart) {
      Toast.fire({
        icon: 'info',
        title: `${product.title} is already in your cart!`,
      });
    } else {
      const cartItem = {
        id: product.id,
        name: product.title,
        price: product.price,
        image: product.thumbnail || product.images?.[0],
        quantity: quantity,
        color: selectedColor,
        size: selectedSize,
      };
      const added = await addToCart(cartItem);
      if (added) {
        Toast.fire({
          icon: 'success',
          title: `${product.title} added to cart!`,
        });
      }
    }
  };

  const handleAddToWishlist = () => {
    if (isInWishlist) {
      Toast.fire({
        icon: 'info',
        title: `${product.title} is already in your wishlist!`,
      });
    } else {
      addToWishlist(product);
      Toast.fire({
        icon: 'success',
        title: `${product.title} added to wishlist! ❤️`,
      });
    }
  };

  const rawMainImage =
    mainImage || product.thumbnail || product.images?.[0] || null;

  const mainImageSrc = getImageUrl(rawMainImage);

  const thumbnails =
    product.images?.slice(0, 4) ||
    [
      product.thumbnail,
      product.thumbnail,
      product.thumbnail,
      product.thumbnail,
    ].filter(Boolean);

  return (
    <section className="pb-20 lg:pb-32 font-poppins">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="text-sm text-gray-500 py-10 flex items-center flex-wrap gap-2">
          <Link to="/" className="hover:text-black transition">
            Home
          </Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-black transition">
            Shop
          </Link>
          <span>/</span>
          <span className="text-black font-medium">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          {/* ================= LEFT COLUMN: IMAGES ================= */}
          <div className="lg:col-span-7 flex flex-col sm:flex-row gap-4 sm:gap-6">
            <div className="flex flex-row sm:flex-col gap-4 w-full sm:w-auto overflow-x-auto sm:overflow-visible no-scrollbar pb-2 sm:pb-0">
              {thumbnails.map((thumb, index) => {
                const resolvedThumbUrl = getImageUrl(thumb);
                return (
                  <div
                    key={index}
                    onClick={() => setMainImage(thumb)}
                    className={`bg-[#F5F5F5] rounded-sm p-3 sm:p-4 cursor-pointer transition-all flex items-center justify-center min-w-[80px] sm:min-w-[120px] sm:h-[138px] ${
                      rawMainImage === thumb
                        ? 'border-2 border-[#DB4444] opacity-70'
                        : 'border-2 border-transparent hover:opacity-80'
                    }`}
                  >
                    <img
                      src={resolvedThumbUrl}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-contain mix-blend-multiply"
                      onError={e => {
                        e.target.onerror = null;
                        e.target.src =
                          'https://via.placeholder.com/120x120?text=No+Image';
                      }}
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex-1 bg-[#F5F5F5] rounded-sm flex items-center justify-center p-8 sm:p-12 min-h-[300px] sm:min-h-[500px]">
              <img
                src={mainImageSrc}
                alt={product.title}
                className="max-w-full max-h-full object-contain mix-blend-multiply drop-shadow-sm"
                onError={e => {
                  e.target.onerror = null;
                  e.target.src =
                    'https://via.placeholder.com/600x600?text=No+Image';
                }}
              />
            </div>
          </div>

          {/* ================= RIGHT COLUMN ================= */}
          <div className="lg:col-span-5 flex flex-col justify-start">
            <h1 className="font-inter font-semibold text-2xl sm:text-3xl leading-tight mb-4 text-black">
              {product.title}
            </h1>

            <div className="flex items-center flex-wrap gap-3 mb-4">
              <div className="flex text-[#FFAD33]">
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating || 4)
                        ? 'text-[#FFAD33]'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-gray-400 text-sm">
                ({product.rating || 0} Reviews)
              </span>
              <span className="text-gray-300">|</span>
              <span className="text-[#00FF66] text-sm font-medium">
                In Stock
              </span>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl font-inter font-normal text-black">
                ৳{product.price}
              </span>
              {product.discountPercentage > 0 && (
                <del className="text-gray-500 text-lg ml-2">
                  {/* Changed $ to ৳ */}৳
                  {(
                    product.price /
                    (1 - product.discountPercentage / 100)
                  ).toFixed(2)}
                </del>
              )}
            </div>

            <p className="text-black/80 font-normal text-sm leading-relaxed mb-6 border-b border-gray-200 pb-6">
              {product.description}
            </p>

            <div className="flex items-center gap-4 mb-6">
              <span className="text-black font-inter text-lg font-normal w-16">
                Colours:
              </span>
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedColor('blue')}
                  className={`w-6 h-6 rounded-full transition-all shadow-sm ${
                    selectedColor === 'blue'
                      ? 'border-[3px] border-black scale-110'
                      : 'border-2 border-transparent hover:border-gray-400'
                  } bg-[#A0BCE0]`}
                />
                <button
                  onClick={() => setSelectedColor('red')}
                  className={`w-6 h-6 rounded-full transition-all shadow-sm ${
                    selectedColor === 'red'
                      ? 'border-[3px] border-black scale-110'
                      : 'border-2 border-transparent hover:border-gray-400'
                  } bg-[#E07575]`}
                />
              </div>
            </div>

            {/* Size */}
            <div className="flex items-center gap-4 mb-8">
              <span className="text-black font-inter text-lg font-normal w-16">
                Size:
              </span>
              <div className="flex gap-3 flex-wrap">
                {['XS', 'S', 'M', 'L', 'XL'].map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-8 h-8 flex items-center justify-center rounded-sm border text-sm font-medium transition ${
                      selectedSize === size
                        ? 'bg-[#DB4444] text-white border-[#DB4444]'
                        : 'bg-white text-black border-gray-300 hover:border-black'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* =================Quantity, Cart, Wishlist ================= */}
            <div className="flex flex-wrap items-center gap-4 mb-10">
              {/* Quantity Selector */}
              <div className="flex items-center h-12 border border-gray-400 rounded-sm">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 h-full flex items-center justify-center hover:bg-[#DB4444] hover:text-white hover:border-[#DB4444] transition-colors rounded-l-sm"
                >
                  <FiMinus className="w-5 h-5" />
                </button>
                <span className="w-14 h-full flex items-center justify-center border-l border-r border-gray-400 font-medium text-lg">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 h-full flex items-center justify-center hover:bg-[#DB4444] hover:text-white hover:border-[#DB4444] transition-colors rounded-r-sm"
                >
                  <FaPlus className="w-5 h-5" />
                </button>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                className="h-12 flex-1 sm:flex-none px-8 sm:px-12 bg-[#DB4444] text-white font-medium rounded-sm hover:bg-red-600 transition shadow-sm flex items-center justify-center whitespace-nowrap"
              >
                Add to Cart
              </button>

              {/* Wishlist */}
              <button
                onClick={handleAddToWishlist}
                className={`h-12 w-12 flex items-center justify-center border rounded-sm transition shadow-sm ${
                  isInWishlist
                    ? 'bg-[#DB4444] text-white border-[#DB4444]'
                    : 'bg-white text-black border-gray-400 hover:bg-[#DB4444] hover:text-white hover:border-[#DB4444]'
                }`}
              >
                <FaRegHeart className="w-5 h-5" />
              </button>
            </div>

            {/* ================= INFO BOX ================= */}
            <div className="border border-gray-300 rounded-sm">
              <div className="flex items-center gap-4 p-4 sm:p-6 border-b border-gray-300">
                <TbTruckDelivery className="w-10 h-10 text-black flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-black text-base">
                    Free Delivery
                  </h4>
                  <p className="text-xs font-medium text-gray-500 mt-1 hover:underline cursor-pointer">
                    Enter your postal code for Delivery Availability
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 sm:p-6">
                <BsArrowRepeat className="w-10 h-10 text-black flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-black text-base">
                    Return Delivery
                  </h4>
                  <p className="text-xs font-medium text-gray-500 mt-1">
                    Free 30 Days Delivery Returns.{' '}
                    <span className="hover:underline cursor-pointer">
                      Details
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= RELATED PRODUCTS ================= */}
        {relatedProducts.length > 0 && (
          <div className="mt-24 mb-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-5 h-10 bg-[#DB4444] rounded-sm"></div>
              <h3 className="text-[#DB4444] font-semibold text-lg font-poppins">
                Related Item
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {relatedProducts.slice(0, 4).map(item => {
                const isRelatedInCart = cart.some(c => c.id === item.id);
                const isRelatedInWishlist = wishlist.some(
                  w => w.id === item.id,
                );
                const relatedThumbUrl = getImageUrl(
                  item.thumbnail || item.images?.[0],
                );

                return (
                  <div key={item.id} className="group flex flex-col">
                    <div className="bg-[#F5F5F5] pt-10 pb-8 px-4 relative overflow-hidden rounded-sm flex items-center justify-center h-[250px]">
                      <Link to={`/product/${item.id}`}>
                        <img
                          src={relatedThumbUrl}
                          alt={item.title}
                          className="w-40 h-40 object-contain mix-blend-multiply cursor-pointer hover:scale-110 transition-transform duration-300"
                          onError={e => {
                            e.target.onerror = null;
                            e.target.src =
                              'https://via.placeholder.com/160x160?text=No+Image';
                          }}
                        />
                      </Link>

                      {item.discountPercentage > 0 && (
                        <span className="absolute top-3 left-3 bg-[#DB4444] text-white text-xs font-medium px-3 py-1 rounded">
                          -{item.discountPercentage}%
                        </span>
                      )}

                      <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            isRelatedInWishlist
                              ? Toast.fire({
                                  icon: 'info',
                                  title: 'Already in wishlist!',
                                })
                              : addToWishlist(item) ||
                                Toast.fire({
                                  icon: 'success',
                                  title: 'Added to wishlist!',
                                });
                          }}
                          className={`bg-white w-8 h-8 flex items-center justify-center rounded-full shadow-sm hover:bg-[#DB4444] hover:text-white transition-colors ${
                            isRelatedInWishlist
                              ? 'text-[#DB4444]'
                              : 'text-black'
                          }`}
                        >
                          <FaRegHeart className="w-4 h-4" />
                        </button>
                        <Link
                          to={`/product/${item.id}`}
                          className="bg-white w-8 h-8 flex items-center justify-center rounded-full shadow-sm hover:bg-[#DB4444] hover:text-white transition-colors text-black"
                        >
                          <IoEyeOutline className="w-5 h-5" />
                        </Link>
                      </div>

                      <button
                        onClick={() => {
                          isRelatedInCart
                            ? Toast.fire({
                                icon: 'info',
                                title: 'Already in cart!',
                              })
                            : addToCart({ ...item, quantity: 1 }) ||
                              Toast.fire({
                                icon: 'success',
                                title: 'Added to cart!',
                              });
                        }}
                        className="absolute left-0 -bottom-12 w-full bg-black text-white py-2.5 font-medium text-sm group-hover:bottom-0 transition-all duration-300"
                      >
                        Add To Cart
                      </button>
                    </div>

                    <div className="mt-4 flex flex-col gap-1">
                      <Link
                        to={`/product/${item.id}`}
                        className="font-medium text-black hover:text-[#DB4444] transition-colors truncate"
                      >
                        {item.title}
                      </Link>
                      <div className="flex items-center gap-3">
                        <span className="text-[#DB4444] font-medium">
                          ৳{item.price}
                        </span>
                        {item.discountPercentage > 0 && (
                          <del className="text-gray-400 text-sm">
                            ৳
                            {(
                              item.price /
                              (1 - item.discountPercentage / 100)
                            ).toFixed(2)}
                          </del>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex">
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
                        </div>
                        <span className="text-gray-400 text-xs font-medium">
                          ({item.rating || 0})
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductDetails;