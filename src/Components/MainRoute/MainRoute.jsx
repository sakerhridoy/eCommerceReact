import React, { Suspense } from 'react'
import Navbar from '../Navbar/Navbar'
import Footer from '../Footer/Footer'
import AiAssistant from '../AiAssistant/AiAssistant'
import { Outlet } from 'react-router-dom';
import ScrollToTop from '../ScrollToTop';
import GlobalLoader from '../GlobalLoader';
import Analytics from '../Analytics';
import PageLoader from '../PageLoader';

const MainRoute = () => {
  return (
    <>
      <ScrollToTop />
      <GlobalLoader />
      <Analytics />
      <Navbar />
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
      <Footer/>
      <AiAssistant/>
    </>
  )
}

export default MainRoute