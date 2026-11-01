import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import Swal from 'sweetalert2';

const ManageAbout = () => {
  const [formData, setFormData] = useState({
    title: '',
    paragraph1: '',
    paragraph2: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const { data } = await api.get('/about');
        if (data?.data) {
          setFormData({
            title: data.data.title || '',
            paragraph1: data.data.paragraph1 || '',
            paragraph2: data.data.paragraph2 || '',
          });
        }
      } catch (error) {
        console.error('Error fetching about data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAboutData();
  }, []);

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = e => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);

    // Image soho data pathanor jonno FormData use kora holo
    const submitData = new FormData();
    submitData.append('title', formData.title);
    submitData.append('paragraph1', formData.paragraph1);
    submitData.append('paragraph2', formData.paragraph2);
    if (imageFile) {
      submitData.append('image', imageFile);
    }

    try {
      // Content-Type multipart/form-data hobe image er jonno
      await api.put('/about', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      Swal.fire(
        'Success',
        'About page content updated successfully!',
        'success',
      );
    } catch (error) {
      Swal.fire('Error', 'Failed to update content', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="bg-white p-6 rounded-sm shadow-sm font-poppins">
      <h2 className="text-2xl font-bold mb-6">Manage About Page</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full border p-3 rounded-sm outline-none focus:border-[#DB4444]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Paragraph 1</label>
          <textarea
            name="paragraph1"
            rows="4"
            value={formData.paragraph1}
            onChange={handleChange}
            className="w-full border p-3 rounded-sm outline-none focus:border-[#DB4444]"
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Paragraph 2</label>
          <textarea
            name="paragraph2"
            rows="4"
            value={formData.paragraph2}
            onChange={handleChange}
            className="w-full border p-3 rounded-sm outline-none focus:border-[#DB4444]"
          ></textarea>
        </div>

        <div className="bg-gray-50 p-4 border rounded-sm">
          <label className="block text-sm font-medium mb-2">
            About Page Image (Banner)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 cursor-pointer"
          />
          <p className="text-xs text-gray-400 mt-2">
            Upload a new image to replace the current one.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-[#DB4444] text-white px-8 py-3 rounded-sm hover:bg-red-600 transition"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default ManageAbout;