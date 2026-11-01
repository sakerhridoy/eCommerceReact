import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { createProduct, getCategories } from '../../api/catalog';
import api from '../../api/client';

const AddProduct = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    discountPercentage: '',
    category: '',
    stock: '',
    featured: false,
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = () => {
    getCategories()
      .then(data => {
        const catList = Array.isArray(data)
          ? data
          : data.categories || data.data || [];
        setCategories(catList);
      })
      .catch(err => console.error('Failed to load categories:', err));
  };

  // ================= ADD NEW CATEGORY =================
  const handleAddNewCategory = async () => {
    const { value: categoryName } = await Swal.fire({
      title: 'Add New Category',
      input: 'text',
      inputLabel: 'Category Name',
      inputPlaceholder: 'e.g. Smart Watch, Headphone...',
      showCancelButton: true,
      confirmButtonText: 'Add',
      confirmButtonColor: '#DB4444',
      inputValidator: value => {
        if (!value) {
          return 'You need to write something!';
        }
      },
    });

    if (categoryName) {
      try {
        const res = await api.post('/categories', { name: categoryName });

        const newCategory = res.data?.data || res.data;

        setCategories(prev => [...prev, newCategory]);

        setFormData(prev => ({
          ...prev,
          category: newCategory._id || newCategory.slug,
        }));

        Swal.fire({
          icon: 'success',
          title: 'Added!',
          text: `${categoryName} has been added to categories.`,
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error(
          'Category Add Error:',
          error.response?.data || error.message,
        );
        Swal.fire(
          'Error',
          error.response?.data?.message ||
            'Failed to add category. Check console for details.',
          'error',
        );
      }
    }
  };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = e => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!imageFile) {
      Swal.fire({
        icon: 'warning',
        title: 'Image Required',
        text: 'Please select a product image',
      });
      return;
    }

    setLoading(true);

    try {
      const priceNum = Number(formData.price);
      const discountPct = Number(formData.discountPercentage) || 0;
      const discountPrice =
        discountPct > 0
          ? Number((priceNum - (priceNum * discountPct) / 100).toFixed(2))
          : priceNum;

      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('price', priceNum);
      data.append('discountPrice', discountPrice);
      data.append('category', formData.category);
      data.append('stock', Number(formData.stock) || 1);
      data.append('featured', formData.featured);
      data.append('image', imageFile);

      await createProduct(data);

      Swal.fire({
        icon: 'success',
        title: 'Product Uploaded!',
        text: 'Product added successfully.',
      });

      setFormData({
        title: '',
        description: '',
        price: '',
        discountPercentage: '',
        category: '',
        stock: '',
        featured: false,
      });
      setImageFile(null);
      setImagePreview(null);

      navigate('/admin/products');
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Failed to Upload',
        text: err.response?.data?.message || 'Something went wrong!',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6 sm:p-10">
        <h2 className="text-2xl sm:text-3xl font-semibold font-inter mb-6 text-black border-b pb-4">
          Add New Product
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Title *
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. iPhone 15 Pro Max"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#DB4444]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              name="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Write product specifications and details..."
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#DB4444]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (৳) *
              </label>
              <input
                type="number"
                name="price"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                placeholder="999"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#DB4444]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount (%)
              </label>
              <input
                type="number"
                name="discountPercentage"
                min="0"
                max="100"
                value={formData.discountPercentage}
                onChange={handleChange}
                placeholder="10"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#DB4444]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Quantity *
              </label>
              <input
                type="number"
                name="stock"
                required
                min="1"
                value={formData.stock}
                onChange={handleChange}
                placeholder="20"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#DB4444]"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Category *
              </label>
              <button
                type="button"
                onClick={handleAddNewCategory}
                className="text-xs font-semibold text-[#DB4444] hover:underline"
              >
                + Add New Category
              </button>
            </div>

            {categories.length > 0 ? (
              <select
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#DB4444] bg-white"
              >
                <option value="">Select a Category</option>
                {categories.map(cat => (
                  <option key={cat._id || cat.slug} value={cat._id || cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                placeholder="e.g. phone, computers, smartwatch"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#DB4444]"
              />
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="featured"
              name="featured"
              checked={formData.featured}
              onChange={handleChange}
              className="w-4 h-4 text-[#DB4444] focus:ring-[#DB4444] border-gray-300 rounded"
            />
            <label
              htmlFor="featured"
              className="text-sm font-medium text-gray-700"
            >
              Mark as Featured Product
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Image *
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-[#DB4444] file:text-white hover:file:bg-[#db4444]/90 cursor-pointer"
            />

            {imagePreview && (
              <div className="mt-4 border rounded-md p-2 w-36 h-36 flex items-center justify-center bg-gray-50">
                <img
                  src={imagePreview}
                  alt="Product Preview"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 bg-[#DB4444] text-white font-medium rounded-md hover:bg-[#db4444]/90 transition ${
              loading ? 'opacity-60 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Uploading Product...' : 'Upload Product'}
          </button>
        </form>
      </div>
    </div>
  );
};;

export default AddProduct;