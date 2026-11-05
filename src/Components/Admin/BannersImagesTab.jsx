import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import {
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiX,
  FiEye,
  FiEyeOff,
} from 'react-icons/fi';
import {
  getAdminBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  getAbout,
  updateAbout,
  getImageUrl,
} from '../../api/catalog';

const inputClass =
  'w-full border p-3 rounded-sm outline-none focus:border-[#DB4444] font-poppins text-sm';

const emptyBannerForm = {
  title: '',
  label: '',
  subtitle: '',
  buttonText: '',
  link: '',
  order: 0,
  active: true,
};

// Banner object -> multipart FormData (image file alada vabe add korte hoy)
const bannerToFormData = (data, overrides = {}) => {
  const merged = { ...data, ...overrides };
  const fd = new FormData();
  fd.append('title', merged.title || '');
  if (merged.type) fd.append('type', merged.type);
  if (merged.label) fd.append('label', merged.label);
  if (merged.subtitle) fd.append('subtitle', merged.subtitle);
  if (merged.buttonText) fd.append('buttonText', merged.buttonText);
  if (merged.link) fd.append('link', merged.link);
  fd.append('order', String(merged.order ?? 0));
  fd.append('active', String(merged.active ?? true));
  return fd;
};

const BannerSection = ({ type, heading, description }) => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyBannerForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadBanners = async () => {
    setLoading(true);
    try {
      const list = await getAdminBanners({ type });
      setBanners(list);
    } catch (error) {
      console.error('Failed to load banners:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const resetForm = () => {
    setForm(emptyBannerForm);
    setImageFile(null);
    setImagePreview('');
    setEditingId(null);
  };

  const handleChange = e => {
    const { name, value, type: inputType, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: inputType === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleEdit = banner => {
    setEditingId(banner.id);
    setForm({
      title: banner.title || '',
      label: banner.label || '',
      subtitle: banner.subtitle || '',
      buttonText: banner.buttonText || '',
      link: banner.link || '',
      order: banner.order ?? 0,
      active: banner.active ?? true,
    });
    setImageFile(null);
    setImagePreview(banner.image || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!form.title.trim()) {
      Swal.fire('Error', 'Title is required', 'error');
      return;
    }

    if (!editingId && !imageFile) {
      Swal.fire('Error', 'Image is required', 'error');
      return;
    }

    setSaving(true);
    try {
      const fd = bannerToFormData({ ...form, type });
      if (imageFile) fd.append('image', imageFile);

      if (editingId) {
        await updateBanner(editingId, fd);
      } else {
        await createBanner(fd);
      }

      Swal.fire(
        'Success',
        editingId ? 'Banner updated successfully!' : 'Banner added successfully!',
        'success',
      );
      resetForm();
      loadBanners();
    } catch (error) {
      Swal.fire(
        'Error',
        error.response?.data?.message || 'Failed to save banner',
        'error',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async banner => {
    try {
      await updateBanner(
        banner.id,
        bannerToFormData(banner, { active: !banner.active }),
      );
      loadBanners();
    } catch (error) {
      Swal.fire(
        'Error',
        error.response?.data?.message || 'Failed to update banner',
        'error',
      );
    }
  };

  const handleDelete = async banner => {
    const result = await Swal.fire({
      title: 'Delete this banner?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DB4444',
      confirmButtonText: 'Delete',
    });

    if (!result.isConfirmed) return;

    try {
      await deleteBanner(banner.id);
      Swal.fire('Deleted', 'Banner deleted successfully.', 'success');
      if (editingId === banner.id) resetForm();
      loadBanners();
    } catch (error) {
      Swal.fire(
        'Error',
        error.response?.data?.message || 'Failed to delete banner',
        'error',
      );
    }
  };

  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">{heading}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>

      {/* ---------- EXISTING LIST ---------- */}
      {loading ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : banners.length === 0 ? (
        <p className="text-sm text-gray-400">No banners yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {banners.map(banner => (
            <div
              key={banner.id}
              className="border rounded-sm p-3 flex gap-3 bg-gray-50"
            >
              <img
                src={banner.image}
                alt={banner.title}
                className="w-24 h-24 object-cover rounded-sm bg-white shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{banner.title}</p>
                {banner.label && (
                  <p className="text-xs text-gray-500 truncate">
                    {banner.label}
                  </p>
                )}
                <p className="text-xs text-gray-400 truncate">
                  {banner.buttonText || 'Shop Now'}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full ${
                      banner.active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {banner.active ? 'Active' : 'Inactive'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggle(banner)}
                    className="text-gray-500 hover:text-[#DB4444]"
                    title="Toggle active"
                  >
                    {banner.active ? <FiEye /> : <FiEyeOff />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEdit(banner)}
                    className="text-gray-500 hover:text-blue-600"
                    title="Edit"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(banner)}
                    className="text-gray-500 hover:text-red-600"
                    title="Delete"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ---------- FORM ---------- */}
      <form
        onSubmit={handleSubmit}
        className="border rounded-sm p-4 bg-white space-y-3"
      >
        <p className="text-sm font-semibold">
          {editingId ? 'Edit Banner' : 'Add New Banner'}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1">Title *</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Label</label>
            <input
              type="text"
              name="label"
              value={form.label}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Subtitle</label>
            <input
              type="text"
              name="subtitle"
              value={form.subtitle}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">
              Button Text
            </label>
            <input
              type="text"
              name="buttonText"
              value={form.buttonText}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Link</label>
            <input
              type="text"
              name="link"
              value={form.link}
              onChange={handleChange}
              placeholder="/shop"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Order</label>
            <input
              type="number"
              name="order"
              value={form.order}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id={`${type}-active`}
            name="active"
            checked={form.active}
            onChange={handleChange}
            className="accent-[#DB4444]"
          />
          <label htmlFor={`${type}-active`} className="text-sm">
            Active
          </label>
        </div>

        <div className="bg-gray-50 p-3 border rounded-sm flex items-center gap-4">
          {imagePreview && (
            <img
              src={imagePreview}
              alt="preview"
              className="w-20 h-20 object-cover rounded-sm bg-white"
            />
          )}
          <div className="flex-1">
            <label className="block text-xs font-medium mb-1">
              Banner Image {editingId ? '' : '*'}
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 cursor-pointer"
            />
            {editingId && (
              <p className="text-xs text-gray-400 mt-1">
                Leave empty to keep the current image.
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-[#DB4444] text-white px-6 py-2.5 rounded-sm hover:bg-red-600 transition disabled:opacity-60 text-sm"
          >
            {editingId ? <FiEdit2 /> : <FiPlus />}
            {saving ? 'Saving...' : editingId ? 'Update Banner' : 'Add Banner'}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="flex items-center gap-2 border px-4 py-2.5 rounded-sm text-sm hover:bg-gray-50"
            >
              <FiX /> Cancel
            </button>
          )}
        </div>
      </form>
    </section>
  );
};

const AboutSection = () => {
  const [form, setForm] = useState({
    title: '',
    paragraph1: '',
    paragraph2: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    const fetchAbout = async () => {
      try {
        const data = await getAbout();
        if (!active) return;
        setForm({
          title: data.title || '',
          paragraph1: data.paragraph1 || '',
          paragraph2: data.paragraph2 || '',
        });
        setImagePreview(getImageUrl(data.imageUrl));
      } catch (error) {
        console.error('Failed to load about data:', error);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchAbout();

    return () => {
      active = false;
    };
  }, []);

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);

    const fd = new FormData();
    fd.append('title', form.title);
    fd.append('paragraph1', form.paragraph1);
    fd.append('paragraph2', form.paragraph2);
    if (imageFile) fd.append('image', imageFile);

    try {
      await updateAbout(fd);
      Swal.fire('Success', 'About page updated successfully!', 'success');
    } catch (error) {
      Swal.fire(
        'Error',
        error.response?.data?.message || 'Failed to update About page',
        'error',
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-sm text-gray-400">Loading...</p>;

  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">About Page</h3>
        <p className="text-sm text-gray-500">
          About page-er text ar banner image ekhane theke control korun.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="border rounded-sm p-4 bg-white space-y-3"
      >
        <div>
          <label className="block text-xs font-medium mb-1">Title</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1">Paragraph 1</label>
          <textarea
            name="paragraph1"
            rows="4"
            value={form.paragraph1}
            onChange={handleChange}
            className={inputClass}
          ></textarea>
        </div>

        <div>
          <label className="block text-xs font-medium mb-1">Paragraph 2</label>
          <textarea
            name="paragraph2"
            rows="4"
            value={form.paragraph2}
            onChange={handleChange}
            className={inputClass}
          ></textarea>
        </div>

        <div className="bg-gray-50 p-3 border rounded-sm flex items-center gap-4">
          {imagePreview && (
            <img
              src={imagePreview}
              alt="about preview"
              className="w-28 h-20 object-cover rounded-sm bg-white"
            />
          )}
          <div className="flex-1">
            <label className="block text-xs font-medium mb-1">
              About Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 cursor-pointer"
            />
            <p className="text-xs text-gray-400 mt-1">
              Upload a new image to replace the current one.
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-[#DB4444] text-white px-8 py-3 rounded-sm hover:bg-red-600 transition disabled:opacity-60 text-sm"
        >
          {saving ? 'Saving...' : 'Save About Page'}
        </button>
      </form>
    </section>
  );
};

const BannersImagesTab = () => {
  return (
    <div className="space-y-10">
      <BannerSection
        type="hero"
        heading="Home Hero Banners"
        description="Home page-er main slider banner gulo manage korun."
      />

      <div className="border-t pt-8">
        <BannerSection
          type="category"
          heading="Category Banner"
          description="Category promo banner (image + text) manage korun."
        />
      </div>

      <div className="border-t pt-8">
        <AboutSection />
      </div>
    </div>
  );
};

export default BannersImagesTab;
