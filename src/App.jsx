import './App.css'
import Banner from './Components/Banner/Banner';
import BestSelling from './Components/BestSelling/BestSelling';
import Category from './Components/Category/Category';
import Explore from './Components/Explore/Explore';
import Footer from './Components/Footer/Footer';
import Navbar from './Components/Navbar/Navbar';
import FlashSales from './Components/FlashSales/FlashSales';
import CategoryBanner from './Components/CategoryBanner/CategoryBanner';
import NewArrival from './Components/NewArrival/NewArrival';
import Services from './Components/Services/Services';

function App() {

  return (
    <>
      <Banner />
      <FlashSales />
      <Category />
      <BestSelling />
      <CategoryBanner/>
      <Explore />
      <NewArrival />
      <Services/>
    </>
  );
}

export default App
