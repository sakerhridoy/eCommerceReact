import './App.css'
import Banner from './Components/Banner/Banner';
import BestSelling from './Components/BestSelling/BestSelling';
import Category from './Components/Category/Category';
import Explore from './Components/Explore/Explore';
import FlashSales from './Components/FlashSales/FlashSales';
import CategoryBanner from './Components/CategoryBanner/CategoryBanner';
import NewArrival from './Components/NewArrival/NewArrival';
import Testimonials from './Components/Testimonials/Testimonials';
import Services from './Components/Services/Services';
import SEO from './Components/SEO';

function App() {

  return (
    <>
      <SEO description="Shop the latest electronics, fashion, and home appliances at Exclusive. Genuine products, best prices, and fast delivery." />
      <Banner />
      <FlashSales />
      <Category />
      <BestSelling />
      <CategoryBanner/>
      <Explore />
      <NewArrival />
      <Testimonials className="px-4 xl:px-0 py-20" />
      <Services/>
    </>
  );
}

export default App
