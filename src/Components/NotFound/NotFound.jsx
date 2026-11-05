import React from 'react';
import { Link } from 'react-router';
import SEO from '../SEO';

const NotFound = () => {
  return (
    <section className="flex min-h-screen items-center justify-center bg-white px-4 py-24 font-poppins">
      <SEO title="404 - Page Not Found" noIndex />
      <div className="w-full max-w-xl text-center">
        <p className="mb-10 text-sm font-normal text-black/50">
          <Link to="/" className="transition hover:text-black">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-black">404 Error</span>
        </p>

        <h1 className="font-inter text-[96px] font-medium leading-none text-[#DB4444] sm:text-[120px]">
          404
        </h1>

        <h2 className="mt-6 font-inter text-2xl font-medium text-gray-900 sm:text-3xl">
          Page Not Found
        </h2>

        <p className="mx-auto mt-4 max-w-md text-base leading-6 text-black/60">
          Sorry, the page you are looking for doesn&apos;t exist or has been
          moved. You may go back to the home page.
        </p>

        <Link
          to="/"
          className="mt-10 inline-block rounded-sm bg-[#DB4444] px-12 py-4 text-base font-normal text-[#fafafa] transition hover:bg-[#c0392b]"
        >
          Back to home page
        </Link>
      </div>
    </section>
  );
};

export default NotFound;
