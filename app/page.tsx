'use client';
import HeroSection from "@/components/hero/Hero";
import Navbar from "@/components/layout/Navbar";
import FeaturedProducts from "@/components/products/FeaturedProducts";
import SpecialCollections from "@/components/collections/SpecialCollections";
import OurStory from "@/components/story/OurStory";
import TestimonialsSection from "@/components/testimonials/TestimonialsSection";
import VisitUs from "@/components/info/VisitUs";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <main className="min-h-screen ">
      <Navbar />
      <HeroSection/>
      <FeaturedProducts />
      <SpecialCollections />
      <OurStory />
      <TestimonialsSection />
      <VisitUs />
      <Footer />
    </main>
  );
}