import api from './client';

const getResponseData = response => {
  let payload = response?.data ?? response;

  while (
    payload &&
    !Array.isArray(payload) &&
    typeof payload === 'object' &&
    payload.data !== undefined
  ) {
    payload = payload.data;
  }

  return payload;
};

const getCollection = (payload, key) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.[key])) return payload[key];
  if (
    (key === 'products' || key === 'categories' || key === 'coupons') &&
    Array.isArray(payload?.items)
  ) {
    return payload.items;
  }
  return [];
};

export const getImageUrl = image => {
  if (!image) return '';
  const rawPath = typeof image === 'string' ? image : image?.url || '';
  if (!rawPath) return '';

  if (rawPath.startsWith('http://') || rawPath.startsWith('https://')) {
    return rawPath;
  }

  const backendBaseUrl =
    import.meta.env.VITE_API_BASE_URL?.replace('/api', '') ||
    'http://localhost:5000';
  const cleanPath = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;

  if (!cleanPath.startsWith('/uploads')) {
    return `${backendBaseUrl}/uploads${cleanPath}`;
  }

  return `${backendBaseUrl}${cleanPath}`;
};

const normalizeReviewImages = images => {
  if (!Array.isArray(images)) return [];
  return images
    .map(image => (typeof image === 'string' ? image : image?.url))
    .filter(Boolean)
    .map(getImageUrl);
};

const normalizeReview = review => ({
  ...review,
  images: normalizeReviewImages(review?.images),
  user: review?.user
    ? { ...review.user, name: review.user.name || 'Customer' }
    : { name: 'Customer' },
});

export const normalizeProduct = product => {
  const safeProduct = product || {};
  const thumbnail =
    getImageUrl(safeProduct.thumbnail) ||
    getImageUrl(Array.isArray(safeProduct.images) && safeProduct.images[0]) ||
    getImageUrl(safeProduct.img) ||
    getImageUrl(safeProduct.image) ||
    '';
  const price = Number(safeProduct.price || 0);
  const discountPrice = Number(safeProduct.discountPrice ?? price);
  const averageRating = Number(safeProduct.rating) || 0;
  const reviewCount =
    Number(safeProduct.reviewCount ?? safeProduct.numReviews ?? 0) || 0;

  return {
    ...safeProduct,
    id: String(safeProduct._id || safeProduct.id || ''),
    name: safeProduct.title || safeProduct.name || 'Product',
    title: safeProduct.title || safeProduct.name || 'Product',
    img: thumbnail,
    thumbnail,
    images:
      Array.isArray(safeProduct.images) && safeProduct.images.length
        ? safeProduct.images.map(getImageUrl).filter(Boolean)
        : thumbnail
          ? [thumbnail]
          : [],
    dPrice: discountPrice,
    oldPrice: price,
    mPrice: price,
    discountPercentage:
      safeProduct.discountPercentage ||
      (price > 0 && discountPrice < price
        ? Math.round(((price - discountPrice) / price) * 100)
        : 0),
    ratingStars: averageRating,
    rating: averageRating,
    reviewCount,
  };
};

export const getProducts = async params => {
  const response = await api.get('/products', { params });
  const rawData = getResponseData(response);
  const products = getCollection(rawData, 'products');
  return Array.isArray(products) ? products.map(normalizeProduct) : [];
};

export const getCategories = async () => {
  const response = await api.get('/categories');
  const rawData = getResponseData(response);
  return getCollection(rawData, 'categories');
};

export const getBrands = async () => {
  const response = await api.get('/brands');
  const rawData = getResponseData(response);
  return getCollection(rawData, 'brands');
};

export const getCategoryBySlug = async slug => {
  const response = await api.get(
    `/categories/slug/${encodeURIComponent(slug)}`,
  );
  const payload = getResponseData(response);
  return payload?.category ?? payload ?? {};
};

export const getProductById = async id => {
  const response = await api.get(`/products/${encodeURIComponent(id)}`);
  const payload = getResponseData(response);
  return normalizeProduct(payload?.product ?? payload);
};

export const getHomeData = async () => {
  const response = await api.get('/home');
  const payload = getResponseData(response);
  const homeData = payload?.data || payload || {};

  return {
    ...homeData,
    featured: getCollection(homeData, 'featured').map(normalizeProduct),
    bestSellers: getCollection(homeData, 'bestSellers').map(normalizeProduct),
    newArrivals: getCollection(homeData, 'newArrivals').map(normalizeProduct),
    discountProducts: getCollection(homeData, 'discountProducts').map(
      normalizeProduct,
    ),
  };
};

export const createProduct = async formData => {
  const { data } = await api.post('/products', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};

export const updateProduct = async (id, formData) => {
  const { data } = await api.put(
    `/products/${encodeURIComponent(id)}`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );
  return data;
};

export const deleteProduct = async id => {
  const { data } = await api.delete(`/products/${encodeURIComponent(id)}`);
  return data;
};

export const getDashboardStats = async () => {
  const { data } = await api.get('/dashboard/stats');
  return data.data;
};

export const getRecentOrders = async (limit = 10) => {
  const { data } = await api.get(`/dashboard/recent-orders?limit=${limit}`);
  return data.data;
};

export const getInventoryAlerts = async () => {
  const { data } = await api.get('/dashboard/inventory-alerts');
  return data.data;
};

// ==========================================
// ADMIN DATA TABLE (server-side) SERVICES
// ==========================================

export const getAdminProducts = async (params = {}) => {
  const { data } = await api.get('/products/admin/list', { params });
  return {
    products: Array.isArray(data?.data) ? data.data : [],
    meta: data?.meta || { total: 0, page: 1, limit: 10, totalPages: 0 },
  };
};

export const bulkUpdateProducts = async (ids, payload = {}) => {
  const { data } = await api.patch('/products/admin/bulk', { ids, ...payload });
  return data;
};

export const getAdminOrders = async (params = {}) => {
  const { data } = await api.get('/orders/admin/list', { params });
  return {
    orders: Array.isArray(data?.data) ? data.data : [],
    meta: data?.meta || { total: 0, page: 1, limit: 10, totalPages: 0 },
  };
};

export const bulkUpdateOrderStatus = async (ids, orderStatus) => {
  const { data } = await api.patch('/orders/admin/bulk/status', {
    ids,
    orderStatus,
  });
  return data;
};

export const bulkUpdateOrderPaymentStatus = async (ids, paymentStatus) => {
  const { data } = await api.patch('/orders/admin/bulk/payment-status', {
    ids,
    paymentStatus,
  });
  return data;
};

export const updateAdminOrderStatus = async (orderId, status) => {
  try {
    const response = await api.put(`/orders/${orderId}/status`, {
      orderStatus: status ? status.toLowerCase() : status,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to update order status';
  }
};

export const getAllCustomers = async () => {
  try {
    const response = await api.get('/dashboard/customers');
    return response.data.data || response.data || [];
  } catch {
    return [];
  }
};

export const getMyOrders = async () => {
  try {
    const response = await api.get('/orders');
    return response.data?.data || response.data || [];
  } catch (error) {
    throw error;
  }
};

export const cancelMyOrder = async orderId => {
  try {
    const response = await api.put(`/orders/${orderId}/cancel`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to cancel order';
  }
};

export const updateMyProfile = async data => {
  const response = await api.put('/auth/profile', data);
  return response.data.data;
};

export const uploadMyAvatar = async file => {
  const formData = new FormData();
  formData.append('avatar', file);
  const response = await api.post('/auth/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data;
};

export const getMyAddresses = async () => {
  const response = await api.get('/auth/addresses');
  return response.data.data || [];
};

export const addMyAddress = async data => {
  const response = await api.post('/auth/addresses', data);
  return response.data.data || [];
};

export const updateMyAddress = async (id, data) => {
  const response = await api.put(`/auth/addresses/${id}`, data);
  return response.data.data || [];
};

export const deleteMyAddress = async id => {
  const response = await api.delete(`/auth/addresses/${id}`);
  return response.data.data || [];
};

export const setDefaultMyAddress = async id => {
  const response = await api.patch(`/auth/addresses/${id}/default`);
  return response.data.data || [];
};

export const sendAiMessage = async ({ message, history = [] }) => {
  const { data } = await api.post('/ai/chat', { message, history });
  const payload = data?.data || {};

  return {
    reply: payload.reply || '',
    products: (payload.products || []).map(product => ({
      ...product,
      image: getImageUrl(product.image),
    })),
  };
};

export const getMyReviewData = async () => {
  try {
    const { data } = await api.get('/reviews/my-reviews');
    const payload = data.data || { pending: [], history: [] };

    return {
      pending: (payload.pending || []).map(item => ({
        ...item,
        name: item.name || item.title,
        image: getImageUrl(item.image),
      })),
      history: (payload.history || []).map(review => ({
        ...review,
        image: getImageUrl(review.image),
        images: normalizeReviewImages(review.images),
      })),
    };
  } catch {
    return { pending: [], history: [] };
  }
};

export const submitProductReview = async ({
  productId,
  rating,
  title,
  comment,
  images = [],
}) => {
  const formData = new FormData();
  formData.append('productId', productId);
  formData.append('rating', rating);
  if (title) formData.append('title', title);
  if (comment) formData.append('comment', comment);
  (images || []).forEach(file => formData.append('images', file));

  const { data } = await api.post('/reviews', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const getProductReviews = async (productId, params = {}) => {
  const fallbackSummary = {
    average: 0,
    total: 0,
    breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  };

  try {
    const { data, meta } = await api.get(
      `/reviews/product/${encodeURIComponent(productId)}`,
      { params },
    );
    const payload = data.data || {};

    return {
      reviews: (payload.reviews || []).map(normalizeReview),
      summary: payload.summary || fallbackSummary,
      meta: meta || {},
    };
  } catch {
    return { reviews: [], summary: fallbackSummary, meta: {} };
  }
};

export const getTestimonials = async (params = {}) => {
  try {
    const { data } = await api.get('/reviews/testimonials', { params });
    const payload = data.data || {};
    return (payload.reviews || []).map(normalizeReview);
  } catch {
    return [];
  }
};

export const getAdminReviews = async (params = {}) => {
  const { data, meta } = await api.get('/reviews', { params });
  return {
    reviews: (Array.isArray(data?.data) ? data.data : []).map(normalizeReview),
    meta: meta || { total: 0, page: 1, limit: 10, totalPages: 0 },
  };
};

export const moderateReview = async (id, status) => {
  const { data } = await api.patch(
    `/reviews/${encodeURIComponent(id)}/moderate`,
    { status },
  );
  return data;
};

export const deleteReview = async id => {
  const { data } = await api.delete(`/reviews/${encodeURIComponent(id)}`);
  return data;
};

// ==========================================
// COUPON API SERVICES (Phase 1 Integration)
// ==========================================

export const getCoupons = async () => {
  try {
    const response = await api.get('/coupons');
    const rawData = getResponseData(response);
    return getCollection(rawData, 'coupons');
  } catch {
    return [];
  }
};

export const createCoupon = async couponData => {
  try {
    const response = await api.post('/coupons', couponData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to create coupon';
  }
};

export const updateCoupon = async (id, couponData) => {
  try {
    const response = await api.put(
      `/coupons/${encodeURIComponent(id)}`,
      couponData,
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to update coupon';
  }
};

export const deleteCoupon = async id => {
  try {
    const response = await api.delete(`/coupons/${encodeURIComponent(id)}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to delete coupon';
  }
};

export const validateCoupon = async (code, subtotal, cartItems = []) => {
  try {
    const response = await api.post('/coupons/validate', {
      code,
      subtotal,
      cartItems,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Invalid or expired coupon';
  }
};

// ==========================================
// WEBSITE / SITE SETTINGS API SERVICES
// ==========================================

export const getSiteSettings = async () => {
  try {
    const { data } = await api.get('/settings');
    return data?.data || {};
  } catch {
    return {};
  }
};

export const updateSiteSettings = async payload => {
  const { data } = await api.put('/settings', payload);
  return data?.data || {};
};

// ==========================================
// BANNER API SERVICES
// ==========================================

const normalizeBanner = banner => ({
  ...banner,
  id: String(banner?._id || banner?.id || ''),
  image: getImageUrl(banner?.image),
});

export const getBanners = async (params = {}) => {
  try {
    const { data } = await api.get('/banners', { params });
    return Array.isArray(data?.data) ? data.data.map(normalizeBanner) : [];
  } catch {
    return [];
  }
};

export const getAdminBanners = async (params = {}) => {
  const { data } = await api.get('/banners/admin/list', { params });
  return Array.isArray(data?.data) ? data.data.map(normalizeBanner) : [];
};

export const createBanner = async formData => {
  const { data } = await api.post('/banners', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data?.data;
};

export const updateBanner = async (id, formData) => {
  const { data } = await api.put(
    `/banners/${encodeURIComponent(id)}`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return data?.data;
};

export const deleteBanner = async id => {
  const { data } = await api.delete(`/banners/${encodeURIComponent(id)}`);
  return data?.data;
};

// ==========================================
// ABOUT PAGE API SERVICES
// ==========================================

export const getAbout = async () => {
  const { data } = await api.get('/about');
  return data?.data || {};
};

export const updateAbout = async formData => {
  const { data } = await api.put('/about', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data?.data || {};
};

// ==========================================
// ADMIN USERS / STAFF API SERVICES (RBAC)
// ==========================================

export const getAdminUsers = async () => {
  const { data } = await api.get('/admin/users');
  return Array.isArray(data?.data) ? data.data : [];
};

export const createAdminUser = async payload => {
  const { data } = await api.post('/admin/users', payload);
  return data?.data;
};

export const updateAdminUser = async (id, payload) => {
  const { data } = await api.put(
    `/admin/users/${encodeURIComponent(id)}`,
    payload,
  );
  return data?.data;
};

export const deleteAdminUser = async id => {
  const { data } = await api.delete(`/admin/users/${encodeURIComponent(id)}`);
  return data?.data;
};
