import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiMinus } from 'react-icons/fi';
import { getSiteSettings } from '../../api/catalog';
import SEO from '../SEO';

const FAQ = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState(0);

  useEffect(() => {
    let active = true;

    const fetchFaqs = async () => {
      const settings = await getSiteSettings();
      if (!active) return;
      setFaqs(Array.isArray(settings?.faqs) ? settings.faqs : []);
      setLoading(false);
    };

    fetchFaqs();

    return () => {
      active = false;
    };
  }, []);

  const toggle = index => {
    setOpenIndex(prev => (prev === index ? -1 : index));
  };

  return (
    <section className="pb-25 md:pb-35 font-poppins">
      <SEO
        title="Frequently Asked Questions"
        description="Answers to the most common questions about orders, shipping, payments, and returns at Exclusive."
      />
      <div className="container mx-auto px-4">
        <div className="py-10 md:py-20">
          <p className="text-sm text-black/50 font-poppins font-normal leading-5.25">
            <Link to="/">Home</Link> / <span className="text-black">FAQ</span>
          </p>
        </div>

        <h1 className="text-3xl md:text-4xl font-semibold text-black pb-10 font-inter">
          Frequently Asked Questions
        </h1>

        {loading ? (
          <p className="text-black/60">Loading...</p>
        ) : faqs.length === 0 ? (
          <p className="text-black/60">
            No FAQs available right now. Please check back later.
          </p>
        ) : (
          <div className="flex flex-col gap-4 max-w-3xl">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={index}
                  className="border border-black/10 rounded-sm overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => toggle(index)}
                    className="w-full flex items-center justify-between gap-4 text-left px-5 py-4 bg-[#F5F5F5] hover:bg-[#ebebeb] transition-colors"
                  >
                    <span className="font-medium text-base text-black">
                      {faq.question}
                    </span>
                    <span className="text-lg text-black shrink-0">
                      {isOpen ? <FiMinus /> : <FiPlus />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-5 py-4 text-black/80 text-sm leading-7 whitespace-pre-line">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default FAQ;
