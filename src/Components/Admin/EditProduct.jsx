import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
  getProductById,
  updateProduct,
  getCategories,
} from '../../api/catalog';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    price: '',
    discountPrice: '',
    category: '',
    stock: '',
    description: '',
  });

  const [imageFile, setImageFile] = useState(null);

  // ক্যাটাগরি এবং প্রোডাক্টের আগের ডেটা লোড করা
  useEffect(() => {
    const fetchData = async () => {
      try {
        const catData = await getCategories();
        setCategories(catData);

        const productData = await getProductById(id);
        setFormData({
          title: productData.title || '',
          price: productData.price || '',
          discountPrice: productData.discountPrice || '',
          category: productData.category?._id || productData.category || '',
          stock: productData.stock || '',
          description: productData.description || '',
        });

        // আগের ছবি প্রভিউতে দেখানো
        if (productData.img) {
          setPreview(productData.img);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        Swal.fire('Error', 'Failed to load product details.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // ইনপুট চেঞ্জ হ্যান্ডেলার
  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ইমেজ চেঞ্জ হ্যান্ডেলার
  const handleImageChange = e => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // ফর্ম সাবমিট করা
  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);

    const submitData = new FormData();
    submitData.append('title', formData.title);
    submitData.append('price', formData.price);
    if (formData.discountPrice)
      submitData.append('discountPrice', formData.discountPrice);
    submitData.append('category', formData.category);
    submitData.append('stock', formData.stock || 0);
    submitData.append('description', formData.description);

    if (imageFile) {
      submitData.append('image', imageFile);
    }

    try {
      await updateProduct(id, submitData);
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Product updated successfully.',
        timer: 2000,
        showConfirmButton: false,
      });
      navigate('/admin/products'); // আপডেট শেষে লিস্ট পেজে পাঠিয়ে দেওয়া
    } catch (error) {
      console.error('Update failed:', error);
      Swal.fire('Error', 'Failed to update product.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20 text-xl font-poppins">
        Loading product data...
      </div>
    );
  }

  return (
    <section className="py-10 mx-4 xl:mx-0">
      <div className="container mx-auto max-w-3xl bg-white p-8 shadow-sm rounded-sm border border-gray-200">
        <h2 className="text-2xl md:text-3xl font-bold font-inter text-black mb-8 border-b pb-4">
          Edit Product
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6 font-poppins">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:border-[#DB4444]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Regular Price (৳) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:border-[#DB4444]"
              />
            </div>

            {/* Discount Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount Price (৳)
              </label>
              <input
                type="number"
                name="discountPrice"
                value={formData.discountPrice}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:border-[#DB4444]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:border-[#DB4444] capitalize"
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Stock */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Quantity
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:border-[#DB4444]"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:border-[#DB4444]"
            ></textarea>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Update Product Image (Optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full border border-gray-300 rounded p-2"
            />
            {preview && (
              <div className="mt-4 w-32 h-32 border p-1 rounded">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/admin/products')}
              className="px-8 py-3 bg-gray-200 text-gray-700 rounded font-medium hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-[#DB4444] text-white rounded font-medium hover:bg-[#b80808] transition-colors disabled:opacity-50"
            >
              {saving ? 'Updating...' : 'Update Product'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default EditProduct;