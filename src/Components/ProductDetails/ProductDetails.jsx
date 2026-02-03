import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FaStar, FaRegHeart } from 'react-icons/fa';
import { FiMinus } from 'react-icons/fi';
import { FaPlus } from 'react-icons/fa6';
import { useShop } from '../../Context/ShopContext/ShopContext';
import { TbTruckDelivery } from 'react-icons/tb';
import { BsArrowRepeat } from 'react-icons/bs';
import { IoEyeOutline } from 'react-icons/io5';
import axios from 'axios';
import Swal from 'sweetalert2';

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

  // ================= SweetAlert2 Toast Config =================
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
        const response = await axios.get(
          `https://dummyjson.com/products/${id}`,
        );
        setProduct(response.data);

        const relatedResponse = await axios.get(
          `https://dummyjson.com/products/category/${response.data.category}?limit=8`,
        );
        setRelatedProducts(
          relatedResponse.data.products.filter(p => p.id !== response.data.id),
        );
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
      <div className="container py-40 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#DB4444] mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container py-40 text-center">
        <p className="text-2xl text-red-600">{error || 'Product not found'}</p>
        <Link to="/shop" className="text-[#DB4444] mt-4 inline-block">
          Continue Shopping
        </Link>
      </div>
    );
  }

  const isInCart = cart.some(c => c.id === product.id);
  const isInWishlist = wishlist.some(w => w.id === product.id);

  const handleAddToCart = () => {
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
      addToCart(cartItem);
      Toast.fire({
        icon: 'success',
        title: `${product.title} added to cart!`,
      });
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

  const mainImageSrc =
    mainImage ||
    product.thumbnail ||
    product.images?.[0] ||
    'https://via.placeholder.com/600x600?text=No+Image';

  const thumbnails =
    product.images?.slice(0, 4) ||
    [
      product.thumbnail,
      product.thumbnail,
      product.thumbnail,
      product.thumbnail,
    ].filter(Boolean);

  return (
    <section className="pb-[140px]">
      <div className="container max-w-7xl mx-auto px-4">
        <nav className="text-sm text-gray-500 py-20">
          <Link to="/" className="hover:text-black transition">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link to="/shop" className="hover:text-black transition">
            Shop
          </Link>
          <span className="mx-2">/</span>
          <span className="text-black font-medium">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-[70px]">
          <div className="lg:col-span-7 flex gap-6">
            <div className="flex flex-col gap-4">
              {thumbnails.map((thumb, index) => (
                <div
                  key={index}
                  onClick={() => setMainImage(thumb)}
                  className={`bg-[#F5F5F5] rounded-sm px-4 py-6 cursor-pointer transition-all ${
                    mainImageSrc === thumb
                      ? 'opacity-50 border-2 border-[#DB4444]'
                      : 'border-transparent hover:opacity-70'
                  }`}
                >
                  <img
                    src={thumb}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-21 h-22 object-contain mx-auto"
                    onError={e => {
                      e.target.src =
                        'https://via.placeholder.com/80x80?text=No+Image';
                    }}
                  />
                </div>
              ))}
            </div>

            <div className="flex-1 bg-[#F5F5F5] rounded-sm flex items-center justify-center p-10">
              <img
                src={mainImageSrc}
                alt={product.title}
                className="max-w-full max-h-[500px] object-contain"
                onError={e => {
                  e.target.src =
                    'https://via.placeholder.com/600x600?text=No+Image';
                }}
              />
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col justify-start">
            <h1 className="font-inter font-semibold text-2xl leading-6 tracking-[3%] mb-3">
              {product.title}
            </h1>

            <div className="flex items-center gap-3 mb-3">
              <div className="flex text-[#FFAD33]">
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.rating || 4)
                        ? 'text-[#FFAD33]'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-black/50 font-poppins font-normal leading-[21px] text-sm">
                ({product.rating || 0} Reviews)
              </span>
              <span className="text-[#00FF66] text-sm font-poppins font-normal leading-[21px]">
                | In Stock
              </span>
            </div>

            <div className="mb-4">
              <span className="text-2xl font-inter font-normal leading-6 text-black">
                ${product.price}
              </span>
              {product.discountPercentage > 0 && (
                <del className="text-gray-500 ml-3 text-xl">
                  $
                  {(
                    product.price /
                    (1 - product.discountPercentage / 100)
                  ).toFixed(2)}
                </del>
              )}
            </div>

            <p className="text-black font-poppins font-normal mb-2 border-b pb-2">
              {product.description}
            </p>

            {/* Colours – smaller buttons, same colors */}
            <div className="flex items-center gap-6 mb-4">
              <p className="text-black font-inter text-xl leading-5 font-normal">
                Colours:
              </p>
              <div className="flex items-center gap-6 mb-4">
                <p className="text-black font-inter text-xl leading-5 font-normal">
                  Colours:
                </p>
                <div className="flex gap-4 mt-1">
                  <button
                    onClick={() => setSelectedColor('blue')}
                    aria-label="Select Blue"
                    className={`w-6 h-6 rounded-full transition-all duration-300 shadow-sm hover:scale-110 ${
                      selectedColor === 'blue'
                        ? ' border-3 border-black scale-110'
                        : 'border-2 border-transparent hover:border-gray-300'
                    } bg-[#A0BCE0]`}
                  />
                  <button
                    onClick={() => setSelectedColor('red')}
                    aria-label="Select Red"
                    className={`w-6 h-6 rounded-full transition-all duration-300 shadow-sm hover:scale-110 ${
                      selectedColor === 'red'
                        ? ' border-3 border-black scale-110'
                        : 'border-2 border-transparent hover:border-gray-300'
                    } bg-[#E07575]`}
                  />
                </div>
              </div>
            </div>

            <div className="mb-6 flex items-center gap-6">
              <p className="text-black font-inter text-xl leading-5 font-normal">
                Size:
              </p>
              <div className="flex gap-4">
                {['XS', 'S', 'M', 'L', 'XL'].map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-sm border text-sm font-poppins font-medium transition ${
                      selectedSize === size
                        ? 'bg-[#DB4444] text-white border-[#DB4444]'
                        : 'bg-white text-black border-black/50 hover:border-black'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-6 mb-8">
              <div className="flex items-center rounded-sm">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-2.5 py-2 text-xl hover:bg-[#DB4444] hover:text-white transition rounded-l-sm border border-black/50 hover:border-0"
                >
                  <FiMinus className="w-5 h-5" />
                </button>
                <span className="px-[34px] py-1 text-lg font-poppins border-t border-b border-black/50 font-medium">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-2.5 py-2 text-xl hover:bg-[#DB4444] hover:text-white transition rounded-r-sm border border-black/50 hover:border-0"
                >
                  <FaPlus className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="bg-[#DB4444] font-poppins text-sm text-white px-12 py-2.5 rounded-sm font-medium hover:bg-[#db4444]/90 transition"
              >
                Add to Cart
              </button>

              <button
                onClick={handleAddToWishlist}
                className={`border border-black/50 p-2 rounded-sm transition ${
                  isInWishlist
                    ? 'bg-[#DB4444] text-white border-[#DB4444]'
                    : 'hover:bg-[#DB4444] hover:border-[#DB4444] hover:text-white'
                }`}
              >
                <FaRegHeart className="w-5 h-5" />
              </button>
            </div>

            <div className="border border-black/50 rounded-sm divide-y divide-black/50">
              <div className="flex items-center gap-4 px-4 pt-6 pb-4">
                <TbTruckDelivery className="w-10 h-10 text-black" />
                <div>
                  <p className="font-medium text-black font-poppins text-base leading-6">
                    Free Delivery
                  </p>
                  <p className="font-medium text-black font-poppins text-xs leading-[21px]">
                    Enter your postal code for Delivery Availability
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 px-4 pb-4 pt-6">
                <BsArrowRepeat className="w-10 h-10 text-black" />
                <div>
                  <p className="font-medium text-black font-poppins text-base leading-6">
                    Return Delivery
                  </p>
                  <p className="font-medium text-black font-poppins text-xs leading-[21px] pt-2">
                    Free 30 Days Delivery Returns. Details
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products – fully dynamic with toasts */}
        <div className="pt-[150px] pb-[70px]">
          <div className="relative after:absolute after:content-[''] after:w-5 after:h-full after:bg-[#DB4444] after:left-0 after:top-0 after:rounded-sm ps-9">
            <h4 className="text-xl font-normal font-poppins leading-10 text-[#db4444]">
              Related Items
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[30px] mt-8">
            {relatedProducts.slice(0, 4).map(item => {
              const isRelatedInCart = cart.some(c => c.id === item.id);
              const isRelatedInWishlist = wishlist.some(w => w.id === item.id);

              const handleRelatedAddToCart = () => {
                if (isRelatedInCart) {
                  Toast.fire({
                    icon: 'info',
                    title: `${item.title} is already in your cart!`,
                  });
                } else {
                  addToCart({ ...item, quantity: 1 });
                  Toast.fire({
                    icon: 'success',
                    title: `${item.title} added to cart!`,
                  });
                }
              };

              const handleRelatedWishlist = () => {
                if (isRelatedInWishlist) {
                  Toast.fire({
                    icon: 'info',
                    title: `${item.title} is already in your wishlist!`,
                  });
                } else {
                  addToWishlist(item);
                  Toast.fire({
                    icon: 'success',
                    title: `${item.title} added to wishlist! ❤️`,
                  });
                }
              };

              return (
                <div key={item.id} className="group">
                  <div className="bg-[#F5F5F5] py-10 relative overflow-hidden rounded-sm">
                    <Link to={`/product/${item.id}`}>
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="mx-auto w-40 h-40 object-contain cursor-pointer"
                        onError={e => {
                          e.target.src =
                            'https://via.placeholder.com/160x160?text=No+Image';
                        }}
                      />
                    </Link>

                    {item.discountPercentage > 0 && (
                      <span className="absolute top-3 left-3 bg-[#DB4444] text-white text-xs px-2 py-1 rounded">
                        -{item.discountPercentage}%
                      </span>
                    )}

                    <div className="absolute top-3 right-3 space-y-2 flex flex-col">
                      <button
                        onClick={handleRelatedWishlist}
                        className={`bg-white p-2 rounded-full transition ${
                          isRelatedInWishlist
                            ? 'text-red-500'
                            : 'hover:text-red-500'
                        }`}
                        aria-label="Add to wishlist"
                      >
                        <FaRegHeart />
                      </button>
                      <Link
                        to={`/product/${item.id}`}
                        className="bg-white p-2 rounded-full hover:text-black transition flex items-center justify-center"
                        aria-label="View details"
                      >
                        <IoEyeOutline />
                      </Link>
                    </div>

                    <button
                      onClick={handleRelatedAddToCart}
                      className="absolute left-0 bottom-[-45px] w-full bg-black text-white text-center py-2 cursor-pointer opacity-0 group-hover:bottom-0 group-hover:opacity-100 transition-all rounded-b-sm"
                    >
                      Add To Cart
                    </button>
                  </div>

                  <div className="pt-4">
                    <Link
                      to={`/product/${item.id}`}
                      className="font-medium hover:text-[#DB4444]"
                    >
                      {item.title}
                    </Link>

                    <p className="flex gap-3 py-2">
                      <span className="text-[#DB4444] font-medium">
                        ${item.price}
                      </span>
                      {item.discountPercentage > 0 && (
                        <del className="text-black/50">
                          $
                          {(
                            item.price /
                            (1 - item.discountPercentage / 100)
                          ).toFixed(2)}
                        </del>
                      )}
                    </p>

                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={`${
                            i < Math.floor(item.rating || 4)
                              ? 'text-[#FFAD33]'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="text-sm text-black/50">
                        ({item.rating || 0})
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductDetails;