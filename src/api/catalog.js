import api from './client';

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
  const thumbnail =
    getImageUrl(product.thumbnail) ||
    getImageUrl(product.images?.[0]) ||
    getImageUrl(product.img) ||
    getImageUrl(product.image) ||
    '';
  const price = Number(product.price || 0);
  const discountPrice = Number(product.discountPrice ?? price);

  return {
    ...product,
    id: String(product._id || product.id),
    name: product.title || product.name || 'Product',
    title: product.title || product.name || 'Product',
    img: thumbnail,
    thumbnail,
    images:
      product.images?.map(getImageUrl).filter(Boolean) ||
      (thumbnail ? [thumbnail] : []),
    dPrice: discountPrice,
    oldPrice: price,
    mPrice: price,
    discountPercentage:
      product.discountPercentage ||
      (price > 0 && discountPrice < price
        ? Math.round(((price - discountPrice) / price) * 100)
        : 0),
    ratingStars: Math.round(product.rating || 0),
    rating: product.reviewCount || product.rating || 0,
  };
};

export const getProducts = async params => {
  const { data } = await api.get('/products', { params });
  return data.data.map(normalizeProduct);
};

export const getCategories = async () => {
  const { data } = await api.get('/categories');
  return data.data;
};

export const getCategoryBySlug = async slug => {
  const { data } = await api.get(
    `/categories/slug/${encodeURIComponent(slug)}`,
  );
  return data.data;
};

export const getProductById = async id => {
  const { data } = await api.get(`/products/${encodeURIComponent(id)}`);
  return normalizeProduct(data.data);
};

export const getHomeData = async () => {
  const { data } = await api.get('/home');
  return {
    ...data.data,
    featured: data.data.featured.map(normalizeProduct),
    bestSellers: data.data.bestSellers.map(normalizeProduct),
    newArrivals: data.data.newArrivals.map(normalizeProduct),
    discountProducts: data.data.discountProducts.map(normalizeProduct),
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
