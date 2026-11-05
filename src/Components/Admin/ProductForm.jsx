import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
  FiPlus,
  FiTrash2,
  FiUploadCloud,
  FiStar,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';
import {
  createProduct,
  updateProduct,
  getCategories,
  getBrands,
} from '../../api/catalog';
import api from '../../api/client';

const MAX_IMAGES = 8;

const inputClass =
  'w-full rounded-md border border-gray-300 px-3.5 py-2.5 text-sm text-gray-800 outline-none transition focus:border-[#DB4444] focus:ring-2 focus:ring-[#DB4444]/20';

const EMPTY_FORM = {
  title: '',
  sku: '',
  barcode: '',
  shortDescription: '',
  description: '',
  category: '',
  brand: '',
  price: '',
  discountPrice: '',
  stock: '',
  warranty: '',
  tags: '',
  status: 'active',
  featured: false,
  bestSeller: false,
};

const emptySpec = () => ({ key: '', value: '' });
const emptyVariant = () => ({
  color: '',
  size: '',
  weight: '',
  price: '',
  discountPrice: '',
  stock: '',
});

const Field = ({ label, hint, required, children }) => (
  <div>
    <label className="mb-1.5 block text-sm font-medium text-gray-700">
      {label} {required && <span className="text-[#DB4444]">*</span>}
    </label>
    {children}
    {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
  </div>
);

const Section = ({ title, description, children }) => (
  <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
    <header className="mb-5 border-b border-gray-100 pb-3">
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      {description && (
        <p className="mt-1 text-xs text-gray-400">{description}</p>
      )}
    </header>
    <div className="space-y-5">{children}</div>
  </section>
);

const Toggle = ({ id, name, label, description, checked, onChange }) => (
  <label
    htmlFor={id}
    className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-4 transition hover:border-[#DB4444]/40"
  >
    <input
      type="checkbox"
      id={id}
      name={name || id}
      checked={checked}
      onChange={onChange}
      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#DB4444] focus:ring-[#DB4444]"
    />
    <span>
      <span className="block text-sm font-medium text-gray-800">{label}</span>
      {description && (
        <span className="mt-0.5 block text-xs text-gray-400">
          {description}
        </span>
      )}
    </span>
  </label>
);

const ProductForm = ({ product = null, mode = 'create' }) => {
  const navigate = useNavigate();
  const isEdit = mode === 'edit';

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [specifications, setSpecifications] = useState([emptySpec()]);
  const [variants, setVariants] = useState([]);
  const [seo, setSeo] = useState({ title: '', description: '', keywords: '' });
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const idCounter = useRef(0);
  const imagesRef = useRef(images);
  const nextImageId = () => `img-${Date.now()}-${idCounter.current++}`;

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(
    () => () => {
      imagesRef.current.forEach(item => {
        if (item.preview) URL.revokeObjectURL(item.preview);
      });
    },
    [],
  );

  useEffect(() => {
    const loadLookups = async () => {
      try {
        const [categoryList, brandList] = await Promise.all([
          getCategories(),
          getBrands(),
        ]);
        setCategories(Array.isArray(categoryList) ? categoryList : []);
        setBrands(Array.isArray(brandList) ? brandList : []);
      } catch {
        setCategories([]);
        setBrands([]);
      }
    };
    loadLookups();
  }, []);

  // Hydrate the form from an existing product (edit mode).
  useEffect(() => {
    if (!product) return;

    setFormData({
      title: product.title || '',
      sku: product.sku || '',
      barcode: product.barcode || '',
      shortDescription: product.shortDescription || '',
      description: product.description || '',
      category: product.category?._id || product.category || '',
      brand: product.brand?._id || product.brand || '',
      price: product.price ?? '',
      discountPrice: product.discountPrice ?? '',
      stock: product.stock ?? '',
      warranty: product.warranty || '',
      tags: Array.isArray(product.tags) ? product.tags.join(', ') : '',
      status: product.status || 'active',
      featured: Boolean(product.featured),
      bestSeller: Boolean(product.bestSeller),
    });

    setSpecifications(
      Array.isArray(product.specifications) && product.specifications.length
        ? product.specifications.map(spec => ({
            key: spec.key || '',
            value: spec.value || '',
          }))
        : [emptySpec()],
    );

    setVariants(
      Array.isArray(product.variants) && product.variants.length
        ? product.variants.map(variant => ({
            color: variant.color || '',
            size: variant.size || '',
            weight: variant.weight || '',
            price: variant.price ?? '',
            discountPrice: variant.discountPrice ?? '',
            stock: variant.stock ?? '',
          }))
        : [],
    );

    const seoData = product.seo || {};
    setSeo({
      title: seoData.title || '',
      description: seoData.description || '',
      keywords: Array.isArray(seoData.keywords)
        ? seoData.keywords.join(', ')
        : '',
    });

    const existing = Array.isArray(product.images)
      ? product.images.filter(Boolean)
      : [];
    const ordered = existing.length
      ? existing
      : product.thumbnail
        ? [product.thumbnail]
        : [];
    const primary = product.thumbnail || ordered[0];
    const items = ordered.map((url, index) => ({
      id: `existing-${index}`,
      url,
      isPrimary: url === primary,
    }));
    if (items.length && !items.some(item => item.isPrimary)) {
      items[0].isPrimary = true;
    }
    setImages(items);
  }, [product]);

  const handleChange = event => {
    const { name, value, type, checked } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAddNewCategory = async () => {
    const { value: categoryName } = await Swal.fire({
      title: 'Add New Category',
      input: 'text',
      inputLabel: 'Category Name',
      inputPlaceholder: 'e.g. Smart Watch, Headphone...',
      showCancelButton: true,
      confirmButtonText: 'Add',
      confirmButtonColor: '#DB4444',
      inputValidator: value => (!value ? 'You need to write something!' : null),
    });

    if (!categoryName) return;

    try {
      const res = await api.post('/categories', { name: categoryName });
      const newCategory = res.data?.data || res.data;
      setCategories(prev => [...prev, newCategory]);
      setFormData(prev => ({
        ...prev,
        category: newCategory._id || newCategory.slug || categoryName,
      }));
      Swal.fire({
        icon: 'success',
        title: 'Added!',
        text: `${categoryName} has been added to categories.`,
        timer: 2000,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire('Error', 'Failed to add category.', 'error');
    }
  };

  const handleAddNewBrand = async () => {
    const { value: brandName } = await Swal.fire({
      title: 'Add New Brand',
      input: 'text',
      inputLabel: 'Brand Name',
      inputPlaceholder: 'e.g. Apple, Samsung, Sony...',
      showCancelButton: true,
      confirmButtonText: 'Add',
      confirmButtonColor: '#DB4444',
      inputValidator: value => (!value ? 'You need to write something!' : null),
    });

    if (!brandName) return;

    try {
      const res = await api.post('/brands', { name: brandName });
      const newBrand = res.data?.data || res.data;
      setBrands(prev => [...prev, newBrand]);
      setFormData(prev => ({
        ...prev,
        brand: newBrand._id || newBrand.slug || brandName,
      }));
      Swal.fire({
        icon: 'success',
        title: 'Added!',
        text: `${brandName} has been added to brands.`,
        timer: 2000,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire('Error', 'Failed to add brand.', 'error');
    }
  };

  // ================= IMAGE MANAGEMENT =================
  const handleSelectImages = event => {
    const selected = Array.from(event.target.files || []);
    event.target.value = '';
    if (!selected.length) return;

    setImages(prev => {
      const room = MAX_IMAGES - prev.length;
      if (room <= 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Image limit reached',
          text: `You can upload up to ${MAX_IMAGES} images.`,
        });
        return prev;
      }

      const accepted = selected.slice(0, room);
      if (selected.length > room) {
        Swal.fire({
          icon: 'info',
          title: 'Some images were skipped',
          text: `Only ${MAX_IMAGES} images are allowed per product.`,
        });
      }

      const items = accepted.map(file => ({
        id: nextImageId(),
        file,
        preview: URL.createObjectURL(file),
        isPrimary: false,
      }));

      const combined = [...prev, ...items];
      if (!combined.some(item => item.isPrimary)) {
        combined[0] = { ...combined[0], isPrimary: true };
      }
      return combined;
    });
  };

  const removeImage = id => {
    setImages(prev => {
      const target = prev.findIndex(item => item.id === id);
      if (target === -1) return prev;
      if (prev[target].preview) URL.revokeObjectURL(prev[target].preview);
      const filtered = prev.filter(item => item.id !== id);
      if (filtered.length && !filtered.some(item => item.isPrimary)) {
        filtered[0] = { ...filtered[0], isPrimary: true };
      }
      return filtered;
    });
  };

  const setPrimaryImage = id => {
    setImages(prev => prev.map(item => ({ ...item, isPrimary: item.id === id })));
  };

  const moveImage = (index, direction) => {
    setImages(prev => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  // ================= SPECIFICATIONS =================
  const updateSpec = (index, field, value) =>
    setSpecifications(prev =>
      prev.map((spec, idx) =>
        idx === index ? { ...spec, [field]: value } : spec,
      ),
    );

  // ================= VARIANTS =================
  const updateVariant = (index, field, value) =>
    setVariants(prev =>
      prev.map((variant, idx) =>
        idx === index ? { ...variant, [field]: value } : variant,
      ),
    );

  const buildFormData = () => {
    const data = new FormData();

    data.append('title', formData.title.trim());
    data.append('sku', formData.sku.trim());
    data.append('barcode', formData.barcode.trim());
    data.append('shortDescription', formData.shortDescription.trim());
    data.append('description', formData.description.trim());
    data.append('category', formData.category);
    if (formData.brand) data.append('brand', formData.brand);
    data.append('warranty', formData.warranty.trim());

    data.append('price', String(Number(formData.price) || 0));
    data.append('discountPrice', String(Number(formData.discountPrice) || 0));
    data.append('stock', String(Number(formData.stock) || 0));

    data.append('featured', String(formData.featured));
    data.append('bestSeller', String(formData.bestSeller));
    data.append('status', formData.status);

    const tags = formData.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(Boolean);
    data.append('tags', JSON.stringify(tags));

    const cleanSpecs = specifications
      .map(spec => ({ key: spec.key.trim(), value: spec.value.trim() }))
      .filter(spec => spec.key && spec.value);
    data.append('specifications', JSON.stringify(cleanSpecs));

    const cleanVariants = variants
      .map(variant => ({
        color: variant.color.trim(),
        size: variant.size.trim(),
        weight: variant.weight.trim(),
        price: variant.price === '' ? undefined : Number(variant.price),
        discountPrice:
          variant.discountPrice === ''
            ? undefined
            : Number(variant.discountPrice),
        stock: variant.stock === '' ? undefined : Number(variant.stock),
      }))
      .filter(variant => variant.color || variant.size || variant.weight);
    data.append('variants', JSON.stringify(cleanVariants));

    const keywords = seo.keywords
      .split(',')
      .map(keyword => keyword.trim())
      .filter(Boolean);
    data.append(
      'seo',
      JSON.stringify({
        title: seo.title.trim(),
        description: seo.description.trim(),
        keywords,
      }),
    );

    const meta = [];
    const newFiles = [];
    images.forEach(item => {
      if (item.file) {
        meta.push({ newIndex: newFiles.length, primary: Boolean(item.isPrimary) });
        newFiles.push(item.file);
      } else if (item.url) {
        meta.push({ url: item.url, primary: Boolean(item.isPrimary) });
      }
    });
    data.append('imageMeta', JSON.stringify(meta));
    newFiles.forEach(file => data.append('images', file));

    return data;
  };

  const handleSubmit = async event => {
    event.preventDefault();

    if (!formData.title.trim()) {
      Swal.fire({ icon: 'warning', title: 'Title is required' });
      return;
    }
    if (!formData.category) {
      Swal.fire({ icon: 'warning', title: 'Please select a category' });
      return;
    }
    if (images.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Image required',
        text: 'Please add at least one product image.',
      });
      return;
    }

    setSubmitting(true);
    try {
      const data = buildFormData();
      if (isEdit) {
        await updateProduct(product._id || product.id, data);
      } else {
        await createProduct(data);
      }

      Swal.fire({
        icon: 'success',
        title: isEdit ? 'Product Updated!' : 'Product Published!',
        text: isEdit
          ? 'Product updated successfully.'
          : 'Product added successfully.',
        timer: 1800,
        showConfirmButton: false,
      });

      navigate('/admin/products');
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: isEdit ? 'Update Failed' : 'Upload Failed',
        text:
          error.response?.data?.message ||
          error.message ||
          'Something went wrong!',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 font-poppins">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h2>
          <p className="mt-1 text-sm text-gray-400">
            Fill in the premium product details below.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/admin/products')}
          className="rounded-md border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
        >
          Back to list
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Section
          title="Basic Information"
          description="Core product identity and description."
        >
          <Field label="Product Title" required>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="e.g. iPhone 15 Pro Max"
              className={inputClass}
            />
          </Field>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="SKU" hint="Unique stock keeping unit code.">
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                placeholder="e.g. APL-IP15PM-256"
                className={inputClass}
              />
            </Field>
            <Field label="Barcode" hint="EAN / UPC barcode number.">
              <input
                type="text"
                name="barcode"
                value={formData.barcode}
                onChange={handleChange}
                placeholder="e.g. 8901234567890"
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Short Description" hint="Shown in listings and cards.">
            <input
              type="text"
              name="shortDescription"
              value={formData.shortDescription}
              onChange={handleChange}
              placeholder="One-line summary of the product"
              className={inputClass}
            />
          </Field>

          <Field label="Full Description">
            <textarea
              name="description"
              rows={5}
              value={formData.description}
              onChange={handleChange}
              placeholder="Write detailed product information..."
              className={inputClass}
            />
          </Field>
        </Section>

        <Section
          title="Pricing & Inventory"
          description="Set price, discount, stock and availability."
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <Field label="Regular Price (৳)" required>
              <input
                type="number"
                name="price"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                required
                placeholder="999"
                className={inputClass}
              />
            </Field>
            <Field label="Discount Price (৳)">
              <input
                type="number"
                name="discountPrice"
                min="0"
                step="0.01"
                value={formData.discountPrice}
                onChange={handleChange}
                placeholder="799"
                className={inputClass}
              />
            </Field>
            <Field label="Stock Quantity" required>
              <input
                type="number"
                name="stock"
                min="0"
                value={formData.stock}
                onChange={handleChange}
                required
                placeholder="20"
                className={inputClass}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Warranty">
              <input
                type="text"
                name="warranty"
                value={formData.warranty}
                onChange={handleChange}
                placeholder="e.g. 1 Year Official Warranty"
                className={inputClass}
              />
            </Field>
            <Field label="Status">
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </Field>
          </div>
        </Section>

        <Section
          title="Organization"
          description="Category, brand and tags."
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Category" required>
              <div className="flex items-center gap-3">
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className={inputClass}
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat._id || cat.slug} value={cat._id || cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleAddNewCategory}
                  title="Add new category"
                  className="flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-md border border-[#DB4444] text-[#DB4444] transition hover:bg-[#DB4444] hover:text-white"
                >
                  <FiPlus />
                </button>
              </div>
            </Field>

            <Field label="Brand">
              <div className="flex items-center gap-3">
                <select
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">Select a brand</option>
                  {brands.map(brand => (
                    <option key={brand._id} value={brand._id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleAddNewBrand}
                  title="Add new brand"
                  className="flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-md border border-[#DB4444] text-[#DB4444] transition hover:bg-[#DB4444] hover:text-white"
                >
                  <FiPlus />
                </button>
              </div>
            </Field>
          </div>

          <Field label="Tags" hint="Comma separated, e.g. phone, apple, 5g">
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="phone, apple, 5g"
              className={inputClass}
            />
          </Field>
        </Section>

        <Section
          title="Highlights"
          description="Control where this product appears across the store."
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Toggle
              id="featured"
              name="featured"
              label="Featured Product"
              description="Show in the featured section on the homepage."
              checked={formData.featured}
              onChange={handleChange}
            />
            <Toggle
              id="bestSeller"
              name="bestSeller"
              label="Best Seller"
              description="Highlight this product as a best seller."
              checked={formData.bestSeller}
              onChange={handleChange}
            />
          </div>
        </Section>

        <Section
          title="Product Images"
          description={`Upload up to ${MAX_IMAGES} images. Click the star to set the primary image.`}
        >
          <div className="flex flex-wrap gap-4">
            {images.map((item, index) => (
              <div
                key={item.id}
                className={`group relative h-32 w-32 overflow-hidden rounded-lg border-2 bg-gray-50 ${
                  item.isPrimary ? 'border-[#DB4444]' : 'border-gray-200'
                }`}
              >
                <img
                  src={item.preview || item.url}
                  alt={`Product ${index + 1}`}
                  className="h-full w-full object-contain"
                />

                {item.isPrimary && (
                  <span className="absolute left-1.5 top-1.5 rounded bg-[#DB4444] px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    PRIMARY
                  </span>
                )}

                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/60 px-1 py-1 opacity-0 transition group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => moveImage(index, -1)}
                    disabled={index === 0}
                    className="p-1 text-white disabled:opacity-30"
                  >
                    <FiChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrimaryImage(item.id)}
                    title="Set as primary"
                    className={`p-1 ${
                      item.isPrimary ? 'text-[#FFAD33]' : 'text-white'
                    }`}
                  >
                    <FiStar size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveImage(index, 1)}
                    disabled={index === images.length - 1}
                    className="p-1 text-white disabled:opacity-30"
                  >
                    <FiChevronRight size={16} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => removeImage(item.id)}
                  title="Remove image"
                  className="absolute right-1.5 top-1.5 hidden rounded-full bg-white p-1 text-[#DB4444] shadow group-hover:block"
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            ))}

            {images.length < MAX_IMAGES && (
              <label className="flex h-32 w-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 text-gray-400 transition hover:border-[#DB4444] hover:text-[#DB4444]">
                <FiUploadCloud size={26} />
                <span className="text-xs font-medium">Add images</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleSelectImages}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </Section>

        <Section
          title="Variants"
          description="Optional. Add colour / size / weight combinations with their own pricing."
        >
          {variants.map((variant, index) => (
            <div
              key={index}
              className="grid grid-cols-1 gap-3 rounded-lg border border-gray-200 p-4 sm:grid-cols-3 lg:grid-cols-7"
            >
              <input
                type="text"
                value={variant.color}
                onChange={e => updateVariant(index, 'color', e.target.value)}
                placeholder="Color"
                className={inputClass}
              />
              <input
                type="text"
                value={variant.size}
                onChange={e => updateVariant(index, 'size', e.target.value)}
                placeholder="Size"
                className={inputClass}
              />
              <input
                type="text"
                value={variant.weight}
                onChange={e => updateVariant(index, 'weight', e.target.value)}
                placeholder="Weight"
                className={inputClass}
              />
              <input
                type="number"
                value={variant.price}
                onChange={e => updateVariant(index, 'price', e.target.value)}
                placeholder="Price"
                className={inputClass}
              />
              <input
                type="number"
                value={variant.discountPrice}
                onChange={e =>
                  updateVariant(index, 'discountPrice', e.target.value)
                }
                placeholder="Discount price"
                className={inputClass}
              />
              <input
                type="number"
                value={variant.stock}
                onChange={e => updateVariant(index, 'stock', e.target.value)}
                placeholder="Stock"
                className={inputClass}
              />
              <button
                type="button"
                onClick={() =>
                  setVariants(prev => prev.filter((_, idx) => idx !== index))
                }
                className="flex items-center justify-center gap-1 rounded-md border border-red-200 px-3 py-2.5 text-sm text-red-500 transition hover:bg-red-50"
              >
                <FiTrash2 size={14} /> Remove
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => setVariants(prev => [...prev, emptyVariant()])}
            className="inline-flex items-center gap-2 rounded-md border border-dashed border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:border-[#DB4444] hover:text-[#DB4444]"
          >
            <FiPlus /> Add Variant
          </button>
        </Section>

        <Section
          title="Custom Specifications"
          description="Add dynamic key/value specs. These appear on the product details page."
        >
          {specifications.map((spec, index) => (
            <div key={index} className="flex items-center gap-3">
              <input
                type="text"
                value={spec.key}
                onChange={e => updateSpec(index, 'key', e.target.value)}
                placeholder="e.g. Display"
                className={inputClass}
              />
              <input
                type="text"
                value={spec.value}
                onChange={e => updateSpec(index, 'value', e.target.value)}
                placeholder="e.g. OLED"
                className={inputClass}
              />
              <button
                type="button"
                onClick={() =>
                  setSpecifications(prev => {
                    const filtered = prev.filter((_, idx) => idx !== index);
                    return filtered.length ? filtered : [emptySpec()];
                  })
                }
                className="flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-md border border-red-200 text-red-500 transition hover:bg-red-50"
              >
                <FiTrash2 size={16} />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => setSpecifications(prev => [...prev, emptySpec()])}
            className="inline-flex items-center gap-2 rounded-md border border-dashed border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:border-[#DB4444] hover:text-[#DB4444]"
          >
            <FiPlus /> Add Specification
          </button>
        </Section>

        <Section
          title="SEO"
          description="Search engine optimisation metadata."
        >
          <Field label="SEO Title">
            <input
              type="text"
              value={seo.title}
              onChange={e => setSeo({ ...seo, title: e.target.value })}
              placeholder="Meta title for search engines"
              className={inputClass}
            />
          </Field>
          <Field label="SEO Description">
            <textarea
              rows={3}
              value={seo.description}
              onChange={e => setSeo({ ...seo, description: e.target.value })}
              placeholder="Meta description for search engines"
              className={inputClass}
            />
          </Field>
          <Field label="SEO Keywords" hint="Comma separated keywords.">
            <input
              type="text"
              value={seo.keywords}
              onChange={e => setSeo({ ...seo, keywords: e.target.value })}
              placeholder="iphone, apple, smartphone"
              className={inputClass}
            />
          </Field>
        </Section>

        <div className="flex flex-wrap gap-4 pb-14">
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="rounded-md bg-gray-200 px-8 py-3 font-medium text-gray-700 transition hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 rounded-md bg-[#DB4444] px-8 py-3 font-medium text-white transition hover:bg-[#b80808] disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
          >
            {submitting
              ? 'Saving...'
              : isEdit
                ? 'Update Product'
                : 'Publish Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
