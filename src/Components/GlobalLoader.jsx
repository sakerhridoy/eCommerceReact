import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import nprogress from 'nprogress';
import 'nprogress/nprogress.css';

// Configure nprogress
nprogress.configure({ 
  showSpinner: false,
  easing: 'ease',
  speed: 500,
  minimum: 0.3
});

const GlobalLoader = () => {
  const location = useLocation();

  useEffect(() => {
    nprogress.start();
    const timer = setTimeout(() => {
      nprogress.done();
    }, 200);

    return () => {
      clearTimeout(timer);
      nprogress.done();
    };
  }, [location.pathname]);

  return null;
};

export default GlobalLoader;
