import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FaStar, FaRegHeart } from 'react-icons/fa';
import { FiMinus } from 'react-icons/fi';
import { FaPlus } from 'react-icons/fa6';
import { useShop } from '../../contexts/ShopContext';
import { TbTruckDelivery } from 'react-icons/tb';
import { BsArrowRepeat } from 'react-icons/bs';
import { IoEyeOutline } from 'react-icons/io5';
import Swal from 'sweetalert2';
import {
  getProductById,
  getProducts,
  getProductReviews,
} from '../../api/catalog';
import SEO from '../SEO';

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

const COLOR_MAP = {
  red: '#FF0000',
  blue: '#0000FF',
  green: '#008000',
  black: '#000000',
  white: '#FFFFFF',
  yellow: '#FFFF00',
  pink: '#FFC0CB',
  purple: '#800080',
  orange: '#FFA500',
  brown: '#A52A2A',
  gray: '#808080',
  grey: '#808080',
  silver: '#C0C0C0',
  gold: '#FFD700',
  navy: '#000080',
  teal: '#008080',
  olive: '#808000',
  maroon: '#800000',
  lime: '#00FF00',
  aqua: '#00FFFF',
  cyan: '#00FFFF',
  magenta: '#FF00FF',
  fuchsia: '#FF00FF',
  violet: '#EE82EE',
  indigo: '#4B0082',
  sky: '#87CEEB',
  skyBlue: '#87CEEB',
  beige: '#F5F5DC',
  lavender: '#E6E6FA',
  crimson: '#DC143C',
  charcoal: '#36454F',
};

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, addToWishlist, cart, wishlist } = useShop();

  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0, show: false });

  const mainImageRef = useRef(null);

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
      setMainImage(null);
      setIsDescExpanded(false);
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
        setRelatedProducts(
          Array.isArray(products)
            ? products.filter(p => p.id !== loadedProduct.id)
            : [],
        );
      } catch {
        setError('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Handle Recently Viewed
  useEffect(() => {
    if (product) {
      const stored = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      const filtered = stored.filter(item => item.id !== product.id);
      const updated = [
        {
          id: product.id,
          title: product.title,
          price: product.price,
          discountPrice: product.discountPrice,
          thumbnail: product.thumbnail || product.images?.[0],
          rating: product.rating,
        },
        ...filtered,
      ].slice(0, 4);
      localStorage.setItem('recentlyViewed', JSON.stringify(updated));
      setRecentlyViewed(updated);
    }
  }, [product]);

  // Initialise the colour / size selection from the product's variants.
  useEffect(() => {
    const list = Array.isArray(product?.variants) ? product.variants : [];
    const colors = [...new Set(list.map(v => v.color).filter(Boolean))];
    const sizes = [...new Set(list.map(v => v.size).filter(Boolean))];
    setSelectedColor(colors[0] || '');
    setSelectedSize(sizes[0] || '');
  }, [product]);

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
        <SEO title="Product Not Found" noIndex />
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

  const variants = Array.isArray(product.variants) ? product.variants : [];
  const colorOptions = [...new Set(variants.map(v => v.color).filter(Boolean))];
  const sizeOptions = [...new Set(variants.map(v => v.size).filter(Boolean))];

  const activeVariant = variants.find(
    v =>
      (colorOptions.length === 0 || v.color === selectedColor) &&
      (sizeOptions.length === 0 || v.size === selectedSize),
  );

  const basePrice = Number(activeVariant?.price ?? product.price) || 0;
  const salePrice = Number(
    activeVariant?.discountPrice ?? product.discountPrice ?? 0,
  );
  const finalPrice = salePrice > 0 && salePrice < basePrice ? salePrice : basePrice;
  const originalPrice =
    salePrice > 0 && salePrice < basePrice ? basePrice : null;

  const stockCount = Number(activeVariant?.stock ?? product.stock ?? 0);
  const inStock = stockCount > 0;

  const discountPercent = originalPrice
    ? Math.round(((basePrice - finalPrice) / basePrice) * 100)
    : 0;

  const brandName =
    typeof product.brand === 'object' ? product.brand?.name || '' : '';

  const categoryName =
    typeof product.category === 'object'
      ? product.category?.name || ''
      : product.categoryName || '';

  const specRows = (
    Array.isArray(product.specifications) ? product.specifications : []
  ).filter(spec => spec?.key && spec?.value);

  const specItems = [
    brandName && { key: 'Brand', value: brandName },
    categoryName && { key: 'Category', value: categoryName },
    product.sku && { key: 'SKU', value: product.sku },
    product.barcode && { key: 'Barcode', value: product.barcode },
    product.warranty && { key: 'Warranty', value: product.warranty },
    ...specRows,
  ].filter(Boolean);

  const thumbnails =
    Array.isArray(product.images) && product.images.length
      ? product.images.filter(Boolean)
      : [product.thumbnail].filter(Boolean);

  const handleAddToCart = async () => {
    if (!inStock) {
      Toast.fire({
        icon: 'error',
        title: 'This product is currently out of stock!',
      });
      return;
    }
    if (isInCart) {
      Toast.fire({
        icon: 'info',
        title: `${product.title} is already in your cart!`,
      });
    } else {
      const cartItem = {
        id: product.id,
        name: product.title,
        price: finalPrice,
        image: product.thumbnail || product.images?.[0],
        quantity: quantity,
        color: selectedColor || undefined,
        size: selectedSize || undefined,
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

  const handleBuyNow = async () => {
    if (!inStock) return;
    const cartItem = {
      id: product.id,
      name: product.title,
      price: finalPrice,
      image: product.thumbnail || product.images?.[0],
      quantity: quantity,
      color: selectedColor || undefined,
      size: selectedSize || undefined,
    };
    await addToCart(cartItem);
    navigate('/checkout');
  };

  const handleMouseMove = e => {
    if (!mainImageRef.current) return;
    const { left, top, width, height } =
      mainImageRef.current.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;
    setZoomPos({ x, y, show: true });
  };

  const rawMainImage =
    mainImage || product.thumbnail || product.images?.[0] || null;

  const mainImageSrc = getImageUrl(rawMainImage);

  const seoTitle = product.seo?.title || product.title;
  const seoDescription = (
    product.seo?.description ||
    product.shortDescription ||
    product.description ||
    `Buy ${product.title} online at Exclusive. Genuine product, best price, and fast delivery.`
  ).slice(0, 155);
  const seoKeywords = product.seo?.keywords?.length
    ? product.seo.keywords
    : [
        product.title,
        product.brand?.name || product.brand,
        product.category?.name || product.category,
        'Exclusive',
      ].filter(Boolean);

  return (
    <section className="pb-20 lg:pb-32 font-poppins">
      <SEO
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords}
        image={rawMainImage ? getImageUrl(rawMainImage) : undefined}
        type="product"
      />
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
          <div className="flex flex-col-reverse gap-4 sm:flex-row sm:gap-6 lg:col-span-7">
            <div className="no-scrollbar flex w-full gap-3 overflow-x-auto pb-1 sm:w-[104px] sm:flex-shrink-0 sm:flex-col sm:overflow-y-auto sm:overflow-x-visible sm:pb-0">
              {thumbnails.map((thumb, index) => {
                const resolvedThumbUrl = getImageUrl(thumb);
                const isActive = rawMainImage === thumb;
                return (
                  <button
                    key={`${thumb}-${index}`}
                    type="button"
                    onClick={() => setMainImage(thumb)}
                    aria-label={`View image ${index + 1}`}
                    className={`group relative flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#F5F5F5] p-2 transition-all sm:h-[104px] sm:w-full ${
                      isActive
                        ? 'ring-2 ring-[#DB4444]'
                        : 'ring-1 ring-transparent hover:ring-gray-300'
                    }`}
                  >
                    <img
                      src={resolvedThumbUrl}
                      alt={`Thumbnail ${index + 1}`}
                      className="h-full w-full object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
                      onError={e => {
                        e.target.onerror = null;
                        e.target.src =
                          'https://via.placeholder.com/120x120?text=No+Image';
                      }}
                    />
                  </button>
                );
              })}
            </div>

            <div className="relative flex flex-1 items-center justify-center rounded-xl bg-[#F5F5F5] p-4 sm:min-h-[520px] sm:p-8 overflow-hidden group/zoom">
              {discountPercent > 0 && (
                <span className="absolute left-4 top-4 z-10 rounded-full bg-[#DB4444] px-3 py-1 text-xs font-semibold text-white shadow-sm">
                  -{discountPercent}%
                </span>
              )}
              <div
                ref={mainImageRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setZoomPos(prev => ({ ...prev, show: false }))}
                className="relative h-full w-full flex items-center justify-center cursor-zoom-in"
              >
                <img
                  src={mainImageSrc}
                  alt={product.title}
                  className="max-h-[350px] w-auto object-contain mix-blend-multiply drop-shadow-sm sm:max-h-[500px] sm:max-w-full"
                  onError={e => {
                    e.target.onerror = null;
                    e.target.src =
                      'https://via.placeholder.com/600x600?text=No+Image';
                  }}
                />
                {zoomPos.show && (
                  <div
                    className="pointer-events-none absolute inset-0 z-20 hidden sm:block overflow-hidden rounded-xl bg-[#F5F5F5]"
                    style={{
                      backgroundImage: `url(${mainImageSrc})`,
                      backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                      backgroundSize: '250%',
                      backgroundRepeat: 'no-repeat',
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN ================= */}
          <div className="lg:col-span-5 flex flex-col justify-start">
            {brandName && (
              <span className="mb-2 inline-flex w-fit items-center rounded-full bg-[#DB4444]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#DB4444]">
                {brandName}
              </span>
            )}
            <h1 className="font-inter font-semibold text-2xl sm:text-3xl leading-tight mb-4 text-black">
              {product.title}
            </h1>

            <div className="flex items-center flex-wrap gap-3 mb-4">
              <div className="flex text-[#FFAD33]">
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.round(product.rating || 0)
                        ? 'text-[#FFAD33]'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-gray-400 text-sm">
                ({product.reviewCount || 0}{' '}
                {product.reviewCount === 1 ? 'Review' : 'Reviews'})
              </span>
              <span className="text-gray-300">|</span>
              <span
                className={`text-sm font-medium ${
                  inStock ? 'text-[#00FF66]' : 'text-[#DB4444]'
                }`}
              >
                {inStock
                  ? stockCount > 0
                    ? `In Stock (${stockCount})`
                    : 'In Stock'
                  : 'Out of Stock'}
              </span>
            </div>

            <div className="mb-6 flex flex-wrap items-center gap-3">
              <span className="font-inter text-3xl font-semibold text-[#DB4444]">
                ৳{finalPrice}
              </span>
              {originalPrice ? (
                <>
                  <del className="text-lg text-gray-400">৳{originalPrice}</del>
                  <span className="rounded-full bg-[#DB4444]/10 px-2.5 py-0.5 text-xs font-semibold text-[#DB4444]">
                    Save {discountPercent}%
                  </span>
                </>
              ) : (
                product.discountPercentage > 0 && (
                  <del className="text-lg text-gray-400">
                    ৳
                    {(
                      finalPrice /
                      (1 - product.discountPercentage / 100)
                    ).toFixed(2)}
                  </del>
                )
              )}
            </div>

            <div className="mb-6 space-y-2 border-b border-gray-200 pb-6">
              {product.shortDescription && (
                <p className="text-sm font-medium text-black">
                  {product.shortDescription}
                </p>
              )}
              {product.description && (
                <div className="relative">
                  <p
                    className={`whitespace-pre-line text-sm leading-relaxed text-black/70 ${
                      !isDescExpanded ? 'line-clamp-3' : ''
                    }`}
                  >
                    {product.description}
                  </p>
                  {product.description.length > 150 && (
                    <button
                      type="button"
                      onClick={() => setIsDescExpanded(!isDescExpanded)}
                      className="mt-1 text-xs font-semibold text-[#DB4444] hover:underline"
                    >
                      {isDescExpanded ? 'Read Less' : 'Read More...'}
                    </button>
                  )}
                </div>
              )}
            </div>

            {colorOptions.length > 0 && (
              <div className="mb-6">
                <span className="mb-3 block text-sm font-semibold text-black">
                  Colour:{' '}
                  <span className="font-normal text-gray-500">
                    {selectedColor}
                  </span>
                </span>
                <div className="flex flex-wrap gap-3">
                  {colorOptions.map(color => {
                    const normalizedColor = color.toLowerCase().trim();
                    const hexColor = COLOR_MAP[normalizedColor];

                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        title={color}
                        className={`group relative flex h-8 w-8 items-center justify-center rounded-full transition-all ${
                          selectedColor === color
                            ? 'ring-2 ring-[#DB4444] ring-offset-2'
                            : 'hover:ring-2 hover:ring-gray-300 hover:ring-offset-2'
                        }`}
                      >
                        {hexColor ? (
                          <span
                            className="h-full w-full rounded-full border border-gray-200 shadow-inner"
                            style={{ backgroundColor: hexColor }}
                          />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center rounded-full border border-gray-300 bg-gray-100 text-[10px] font-bold uppercase text-gray-600 shadow-inner">
                            {color.slice(0, 2)}
                          </span>
                        )}
                        {/* Tooltip on hover */}
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 scale-0 rounded bg-black px-2 py-1 text-[10px] text-white opacity-0 transition-all group-hover:scale-100 group-hover:opacity-100">
                          {color}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size */}
            {sizeOptions.length > 0 && (
              <div className="mb-6">
                <span className="mb-2 block text-sm font-semibold text-black">
                  Size:{' '}
                  <span className="font-normal text-gray-500">
                    {selectedSize}
                  </span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {sizeOptions.map(size => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`flex h-9 min-w-11 items-center justify-center rounded-md border px-4 text-sm font-medium transition ${
                        selectedSize === size
                          ? 'border-[#DB4444] bg-[#DB4444] text-white shadow-sm'
                          : 'border-gray-300 bg-white text-black hover:border-black'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeVariant?.weight && (
              <p className="mb-6 text-sm text-gray-600">
                <span className="font-semibold text-black">Weight:</span>{' '}
                {activeVariant.weight}
              </p>
            )}

            {/* ================= Quantity, Cart, Wishlist ================= */}
            <div className="mb-10 flex flex-wrap items-center gap-4">
              <div className="flex h-12 items-center overflow-hidden rounded-md border border-gray-300">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                  className="flex h-full items-center justify-center px-4 transition-colors hover:bg-[#DB4444] hover:text-white disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-transparent disabled:hover:text-gray-300"
                >
                  <FiMinus className="h-4 w-4" />
                </button>
                <span className="flex h-full w-14 items-center justify-center border-x border-gray-300 text-lg font-medium">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setQuantity(prev =>
                      Math.min(prev + 1, Math.max(1, stockCount)),
                    )
                  }
                  disabled={quantity >= stockCount}
                  aria-label="Increase quantity"
                  className="flex h-full items-center justify-center px-4 transition-colors hover:bg-[#DB4444] hover:text-white disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-transparent disabled:hover:text-gray-300"
                >
                  <FaPlus className="h-4 w-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!inStock}
                className="flex h-12 flex-1 items-center justify-center whitespace-nowrap rounded-md bg-[#DB4444] px-8 font-medium text-white shadow-sm transition hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 disabled:hover:bg-gray-300 sm:flex-none sm:px-10"
              >
                {inStock ? 'Add to Cart' : 'Out of Stock'}
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                disabled={!inStock}
                className="flex h-12 flex-1 items-center justify-center whitespace-nowrap rounded-md bg-black px-8 font-medium text-white shadow-sm transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 disabled:hover:bg-gray-300 sm:flex-none sm:px-10"
              >
                Buy Now
              </button>

              <button
                type="button"
                onClick={handleAddToWishlist}
                aria-label="Add to wishlist"
                className={`flex h-12 w-12 items-center justify-center rounded-md border transition ${
                  isInWishlist
                    ? 'border-[#DB4444] bg-[#DB4444] text-white'
                    : 'border-gray-300 bg-white text-black hover:border-[#DB4444] hover:bg-[#DB4444] hover:text-white'
                }`}
              >
                <FaRegHeart className="h-5 w-5" />
              </button>
            </div>

            {/* ================= INFO HUB ================= */}
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <div className="flex items-center gap-4 border-b border-gray-200 p-4 sm:p-5 transition-colors hover:bg-gray-50">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DB4444]/10">
                  <TbTruckDelivery className="h-6 w-6 text-[#DB4444]" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-black">
                    Free & Fast Delivery
                  </h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Free shipping on orders over ৳5000. Delivered in 2-4 days.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 sm:p-5 transition-colors hover:bg-gray-50">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/5">
                  <BsArrowRepeat className="h-6 w-6 text-black" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-black">
                    Easy Returns
                  </h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Free 30 days return policy. No questions asked.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= SPECIFICATIONS ================= */}
        {specItems.length > 0 && (
          <div className="mt-20">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-5 h-10 bg-[#DB4444] rounded-sm"></div>
              <h3 className="text-[#DB4444] font-semibold text-lg font-poppins">
                Specifications
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {specItems.map((spec, index) => (
                <div
                  key={`${spec.key}-${index}`}
                  className="flex items-start justify-between gap-4 rounded-lg border border-gray-200 bg-gray-50/60 px-5 py-3.5"
                >
                  <span className="text-sm font-medium text-gray-500">
                    {spec.key}
                  </span>
                  <span className="text-right text-sm font-medium text-gray-900">
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= CUSTOMER REVIEWS ================= */}
        <ProductReviewsSection productId={product.id} />

        {/* ================= RELATED PRODUCTS ================= */}
        {Array.isArray(relatedProducts) && relatedProducts.length > 0 && (
          <div className="mt-24">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-5 h-10 bg-[#DB4444] rounded-sm"></div>
              <h3 className="text-[#DB4444] font-semibold text-lg font-poppins">
                Related Products
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {(Array.isArray(relatedProducts) ? relatedProducts : [])
                .slice(0, 4)
                .map(item => (
                  <ProductCard key={item.id} item={item} />
                ))}
            </div>
          </div>
        )}

        {/* ================= RECENTLY VIEWED ================= */}
        {recentlyViewed.length > 1 && (
          <div className="mt-24 mb-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-5 h-10 bg-[#DB4444] rounded-sm"></div>
              <h3 className="text-[#DB4444] font-semibold text-lg font-poppins">
                Recently Viewed
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {recentlyViewed
                .filter(item => item.id !== product.id)
                .map(item => (
                  <ProductCard key={item.id} item={item} />
                ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

const ProductCard = ({ item }) => {
  const { cart, wishlist, addToCart, addToWishlist } = useShop();
  const isItemInCart = cart.some(c => c.id === item.id);
  const isItemInWishlist = wishlist.some(w => w.id === item.id);
  const thumbUrl = getImageUrl(item.thumbnail || item.images?.[0]);

  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2000,
  });

  return (
    <div className="group flex flex-col">
      <div className="bg-[#F5F5F5] pt-10 pb-8 px-4 relative overflow-hidden rounded-sm flex items-center justify-center h-[250px]">
        <Link to={`/product/${item.id}`}>
          <img
            src={thumbUrl}
            alt={item.title}
            className="w-40 h-40 object-contain mix-blend-multiply cursor-pointer hover:scale-110 transition-transform duration-300"
            onError={e => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/160x160?text=No+Image';
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
              isItemInWishlist
                ? Toast.fire({ icon: 'info', title: 'Already in wishlist!' })
                : addToWishlist(item) ||
                  Toast.fire({ icon: 'success', title: 'Added to wishlist!' });
            }}
            className={`bg-white w-8 h-8 flex items-center justify-center rounded-full shadow-sm hover:bg-[#DB4444] hover:text-white transition-colors ${
              isItemInWishlist ? 'text-[#DB4444]' : 'text-black'
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
            isItemInCart
              ? Toast.fire({ icon: 'info', title: 'Already in cart!' })
              : addToCart({ ...item, quantity: 1 }) ||
                Toast.fire({ icon: 'success', title: 'Added to cart!' });
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
          <span className="text-[#DB4444] font-medium">৳{item.price}</span>
          {item.discountPercentage > 0 && (
            <del className="text-gray-400 text-sm">
              ৳{(item.price / (1 - item.discountPercentage / 100)).toFixed(2)}
            </del>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <FaStar
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < Math.round(item.rating || 0)
                    ? 'text-[#FFAD33]'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-gray-400 text-xs font-medium">
            ({item.reviewCount || 0})
          </span>
        </div>
      </div>
    </div>
  );
};

const StarRow = ({ value, size = 14 }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map(star => (
      <FaStar
        key={star}
        size={size}
        className={
          star <= Math.round(value) ? 'text-[#FFAD33]' : 'text-gray-300'
        }
      />
    ))}
  </div>
);

const EMPTY_REVIEW_SUMMARY = {
  average: 0,
  total: 0,
  breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
};

const ProductReviewsSection = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState(EMPTY_REVIEW_SUMMARY);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState('all');

  useEffect(() => {
    if (!productId) return;
    let active = true;

    const loadReviews = async () => {
      setLoading(true);
      const params = { limit: 50 };
      if (ratingFilter !== 'all') params.rating = ratingFilter;

      const data = await getProductReviews(productId, params);
      if (!active) return;

      setReviews(data.reviews || []);
      setSummary(data.summary || EMPTY_REVIEW_SUMMARY);
      setLoading(false);
    };

    loadReviews();
    return () => {
      active = false;
    };
  }, [productId, ratingFilter]);

  const handleFilterToggle = star => {
    const value = String(star);
    setRatingFilter(prev => (prev === value ? 'all' : value));
  };

  return (
    <div className="mt-24">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-5 h-10 bg-[#DB4444] rounded-sm"></div>
        <h3 className="text-[#DB4444] font-semibold text-lg font-poppins">
          Customer Reviews
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Rating summary */}
        <div className="lg:col-span-1 rounded-lg border border-gray-200 bg-gray-50/60 p-6">
          <div className="flex items-end gap-3 mb-4">
            <span className="font-inter text-5xl font-semibold text-black">
              {(Number(summary.average) || 0).toFixed(1)}
            </span>
            <div className="pb-1">
              <StarRow value={summary.average} size={16} />
              <p className="mt-1 text-xs text-gray-500">
                Based on {summary.total || 0} review
                {summary.total === 1 ? '' : 's'}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map(star => {
              const count = Number(summary.breakdown?.[star]) || 0;
              const percent = summary.total
                ? Math.round((count / summary.total) * 100)
                : 0;
              const isActive = ratingFilter === String(star);

              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleFilterToggle(star)}
                  className="flex w-full items-center gap-3 text-xs"
                >
                  <span
                    className={`w-12 text-left ${
                      isActive ? 'font-semibold text-[#DB4444]' : 'text-gray-500'
                    }`}
                  >
                    {star} star
                  </span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                    <span
                      className="block h-full rounded-full bg-[#FFAD33]"
                      style={{ width: `${percent}%` }}
                    />
                  </span>
                  <span className="w-6 text-right text-gray-500">{count}</span>
                </button>
              );
            })}
          </div>

          {ratingFilter !== 'all' && (
            <button
              type="button"
              onClick={() => setRatingFilter('all')}
              className="mt-4 text-xs font-semibold text-[#DB4444] hover:underline"
            >
              Clear filter
            </button>
          )}
        </div>

        {/* Review list */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="py-16 text-center text-gray-500">
              Loading reviews...
            </div>
          ) : reviews.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 py-16 text-center">
              <FaStar className="mx-auto mb-3 text-gray-300" size={40} />
              <p className="text-gray-500">
                {ratingFilter === 'all'
                  ? 'No reviews yet. Be the first to review this product!'
                  : 'No reviews match this filter.'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map(review => (
                <div
                  key={review._id}
                  className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm"
                >
                  <div className="mb-2 flex items-start gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#DB4444]/10 font-semibold text-[#DB4444]">
                      {(review.user?.name || 'C').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-black">
                        {review.user?.name || 'Customer'}
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <StarRow value={review.rating} size={12} />
                        <span className="text-xs text-gray-400">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    {review.verifiedPurchase && (
                      <span className="rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-600">
                        ✓ Verified Purchase
                      </span>
                    )}
                  </div>

                  {review.title && (
                    <p className="mb-1 text-sm font-semibold text-black">
                      {review.title}
                    </p>
                  )}
                  {review.comment && (
                    <p className="text-sm leading-relaxed text-gray-600">
                      {review.comment}
                    </p>
                  )}

                  {Array.isArray(review.images) && review.images.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {review.images.map((src, i) => (
                        <img
                          key={`${src}-${i}`}
                          src={src}
                          alt={`Review ${i + 1}`}
                          className="h-16 w-16 rounded-sm border border-gray-100 object-cover"
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;