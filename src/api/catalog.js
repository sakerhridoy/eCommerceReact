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
    (key === 'products' || key === 'categories') &&
    Array.isArray(payload?.items)
  ) {
    return payload.items;
  }
  return [];
};

const getImageUrl = image => {
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
    ratingStars: Math.round(safeProduct.rating || 0),
    rating: safeProduct.reviewCount || safeProduct.rating || 0,
  };
};

export const getProducts = async params => {
  const response = await api.get('/products', { params });
  const products = getCollection(getResponseData(response), 'products');
  return Array.isArray(products) ? products.map(normalizeProduct) : [];
};

export const getCategories = async () => {
  const response = await api.get('/categories');
  return getCollection(getResponseData(response), 'categories');
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
  const homeData = payload?.home ?? payload ?? {};

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

    console.log('Raw Response from Backend:', response.data);
    return response.data.data || response.data || [];
  } catch (error) {
    console.error('Error fetching customers:', error);
    return [];
  }
};

export const getMyOrders = async () => {
  try {
    const response = await api.get('/orders');
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error('Error fetching my orders:', error);
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

export const getMyReviewData = async () => {
  try {
    const { data } = await api.get('/reviews/my-reviews');
    return data.data;
  } catch (error) {
    console.error('Error fetching review data:', error);
    return { pending: [], history: [] };
  }
};

export const submitProductReview = async reviewData => {
  const { data } = await api.post('/reviews', reviewData);
  return data;
};
