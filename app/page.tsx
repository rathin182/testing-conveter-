import AboutUs from "@/components/AboutUs";
import BrowserCategory from "@/components/BrowserCategory";
import Footer from "@/components/Footer";
import Start from "@/components/Start";
import Stats from "@/components/Stats";
import HowItWorks from "@/components/HowItWorks";
import WhatWeOffer from "@/components/WhatWeOffer";

export default function Home() {
  return (
    <div>
      <Start />
      <HowItWorks />
      <WhatWeOffer />
      <BrowserCategory />
      <Stats />
      <AboutUs />
      <Footer />
    </div>
  );
}
