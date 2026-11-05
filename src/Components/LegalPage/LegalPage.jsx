import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSiteSettings } from '../../api/catalog';

const FALLBACK = {
  privacyPolicy: {
    title: 'Privacy Policy',
    content:
      'We respect your privacy and are committed to protecting your personal data. This policy explains what information we collect, how we use it, and the choices you have.',
  },
  termsOfUse: {
    title: 'Terms of Use',
    content:
      'By using this website you agree to comply with our terms and conditions. Please read them carefully before placing an order.',
  },
};

const LegalPage = ({ pageKey, breadcrumb }) => {
  const [page, setPage] = useState(
    FALLBACK[pageKey] || { title: '', content: '' },
  );

  useEffect(() => {
    let active = true;

    const fetchContent = async () => {
      const settings = await getSiteSettings();
      if (!active) return;

      const data = settings?.[pageKey];
      if (data && (data.title || data.content)) {
        setPage({
          title: data.title || FALLBACK[pageKey]?.title || '',
          content: data.content ?? '',
        });
      }
    };

    fetchContent();

    return () => {
      active = false;
    };
  }, [pageKey]);

  return (
    <section className="pb-25 md:pb-35 font-poppins">
      <div className="container mx-auto px-4">
        <div className="py-10 md:py-20">
          <p className="text-sm text-black/50 font-poppins font-normal leading-5.25">
            <Link to="/">Home</Link> /{' '}
            <span className="text-black">{breadcrumb}</span>
          </p>
        </div>

        <h1 className="text-3xl md:text-4xl font-semibold text-black pb-8 font-inter">
          {page.title}
        </h1>

        <div className="text-black/80 font-normal text-base leading-7 whitespace-pre-line">
          {page.content}
        </div>
      </div>
    </section>
  );
};

export default LegalPage;
