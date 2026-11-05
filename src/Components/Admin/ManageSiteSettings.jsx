import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { getSiteSettings, updateSiteSettings } from '../../api/catalog';
import BannersImagesTab from './BannersImagesTab';

const TABS = [
  { id: 'general', label: 'General Settings' },
  { id: 'pages', label: 'Pages & Policies' },
  { id: 'banners', label: 'Banners & Images' },
];

const emptyFaq = () => ({ question: '', answer: '' });

const inputClass =
  'w-full border p-3 rounded-sm outline-none focus:border-[#DB4444] font-poppins text-sm';

const ManageSiteSettings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [form, setForm] = useState({
    websiteName: '',
    email: '',
    phone: '',
    address: '',
    supportHours: '',
    privacyPolicy: { title: 'Privacy Policy', content: '' },
    termsOfUse: { title: 'Terms of Use', content: '' },
    faqs: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    const fetchSettings = async () => {
      const data = await getSiteSettings();
      if (!active) return;

      setForm({
        websiteName: data.websiteName || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        supportHours: data.supportHours || '',
        privacyPolicy: {
          title: data.privacyPolicy?.title || 'Privacy Policy',
          content: data.privacyPolicy?.content || '',
        },
        termsOfUse: {
          title: data.termsOfUse?.title || 'Terms of Use',
          content: data.termsOfUse?.content || '',
        },
        faqs: Array.isArray(data.faqs)
          ? data.faqs.map(faq => ({
              question: faq.question || '',
              answer: faq.answer || '',
            }))
          : [],
      });
      setLoading(false);
    };

    fetchSettings();

    return () => {
      active = false;
    };
  }, []);

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePageChange = (pageKey, field, value) => {
    setForm(prev => ({
      ...prev,
      [pageKey]: { ...prev[pageKey], [field]: value },
    }));
  };

  const handleFaqChange = (index, field, value) => {
    setForm(prev => ({
      ...prev,
      faqs: prev.faqs.map((faq, i) =>
        i === index ? { ...faq, [field]: value } : faq,
      ),
    }));
  };

  const addFaq = () => {
    setForm(prev => ({ ...prev, faqs: [...prev.faqs, emptyFaq()] }));
  };

  const removeFaq = index => {
    setForm(prev => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      phone: form.phone,
      address: form.address,
      supportHours: form.supportHours,
      privacyPolicy: form.privacyPolicy,
      termsOfUse: form.termsOfUse,
      faqs: form.faqs.filter(faq => faq.question.trim() && faq.answer.trim()),
    };

    if (form.websiteName.trim()) payload.websiteName = form.websiteName.trim();
    if (form.email.trim()) payload.email = form.email.trim();

    try {
      await updateSiteSettings(payload);
      Swal.fire('Success', 'Site settings updated successfully!', 'success');
    } catch (error) {
      Swal.fire(
        'Error',
        error.response?.data?.message || 'Failed to update site settings',
        'error',
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="bg-white p-6 rounded-sm shadow-sm font-poppins">
      <h2 className="text-2xl font-bold mb-6">Site Settings</h2>

      {/* ---------- TABS ---------- */}
      <div className="flex flex-wrap gap-2 border-b mb-6">
        {TABS.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-3 text-sm font-medium -mb-px border-b-2 transition ${
              activeTab === tab.id
                ? 'border-[#DB4444] text-[#DB4444]'
                : 'border-transparent text-gray-500 hover:text-black'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'banners' ? (
        <BannersImagesTab />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
        {/* ================= GENERAL SETTINGS ================= */}
        {activeTab === 'general' && (
          <section className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">
              Contact Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Website Name
                </label>
                <input
                  type="text"
                  name="websiteName"
                  value={form.websiteName}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Support Hours
                </label>
                <input
                  type="text"
                  name="supportHours"
                  value={form.supportHours}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Address</label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </section>
        )}

        {/* ================= PAGES & POLICIES ================= */}
        {activeTab === 'pages' && (
          <div className="space-y-10">
            <section className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">
                Privacy Policy
              </h3>

              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={form.privacyPolicy.title}
                  onChange={e =>
                    handlePageChange('privacyPolicy', 'title', e.target.value)
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Content
                </label>
                <textarea
                  rows="8"
                  value={form.privacyPolicy.content}
                  onChange={e =>
                    handlePageChange('privacyPolicy', 'content', e.target.value)
                  }
                  className={inputClass}
                ></textarea>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">
                Terms Of Use
              </h3>

              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={form.termsOfUse.title}
                  onChange={e =>
                    handlePageChange('termsOfUse', 'title', e.target.value)
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Content
                </label>
                <textarea
                  rows="8"
                  value={form.termsOfUse.content}
                  onChange={e =>
                    handlePageChange('termsOfUse', 'content', e.target.value)
                  }
                  className={inputClass}
                ></textarea>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-lg font-semibold">FAQs</h3>
                <button
                  type="button"
                  onClick={addFaq}
                  className="flex items-center gap-2 text-sm bg-[#DB4444] text-white px-4 py-2 rounded-sm hover:bg-red-600 transition"
                >
                  <FiPlus /> Add FAQ
                </button>
              </div>

              {form.faqs.length === 0 ? (
                <p className="text-sm text-gray-400">
                  No FAQs yet. Click "Add FAQ" to create one.
                </p>
              ) : (
                <div className="space-y-4">
                  {form.faqs.map((faq, index) => (
                    <div
                      key={index}
                      className="border rounded-sm p-4 bg-gray-50 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-500">
                          FAQ #{index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFaq(index)}
                          className="text-red-500 hover:text-red-700 transition"
                          aria-label="Remove FAQ"
                        >
                          <FiTrash2 />
                        </button>
                      </div>

                      <input
                        type="text"
                        placeholder="Question"
                        value={faq.question}
                        onChange={e =>
                          handleFaqChange(index, 'question', e.target.value)
                        }
                        className={inputClass}
                      />

                      <textarea
                        rows="3"
                        placeholder="Answer"
                        value={faq.answer}
                        onChange={e =>
                          handleFaqChange(index, 'answer', e.target.value)
                        }
                        className={inputClass}
                      ></textarea>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* ---------- SETTINGS SAVE ---------- */}
          <button
            type="submit"
            disabled={saving}
            className="bg-[#DB4444] text-white px-8 py-3 rounded-sm hover:bg-red-600 transition disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      )}
    </div>
  );
};

export default ManageSiteSettings;
