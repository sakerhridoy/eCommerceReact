import React from 'react';
import { Link } from 'react-router';

const NotFound = () => {
  return (
    <section className="min-h-screen bg-white">
      <div className="container">
        <div className="pt-20 pb-[140px]">
          <p className="font-poppins font-normal text-sm text-black/50">
            <Link to="/">
              <span> Home /</span>
            </Link>{' '}
            <span className="text-black">404 Error</span>
          </p>
        </div>
        <div className="text-center">
          <h1 className="font-inter leading-[115px] text-[110px] font-medium mb-10">
            404 Not Found
          </h1>

          <p className="font-poppins font-normal text-base leading-6 text-bl">
            Your visited page not found. You may go home page.
          </p>
        </div>
        <div className="pt-24 text-center pb-[156px]">
          <Link
            to="/"
            className="font-poppins font-normal text-base inline-block bg-[#DB4444] hover:bg-red-600 text-[#fafafa] px-12 py-4 rounded-sm transition"
          >
            Back to home page
          </Link>
        </div>
      </div>
    </section>
  );
};

export default NotFound;
