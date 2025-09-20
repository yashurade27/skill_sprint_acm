'use client';
import { useEffect } from 'react';
import HeroSection from "@/components/hero/Hero";
import Navbar from "@/components/layout/Navbar";
import FeaturedProducts from "@/components/products/FeaturedProducts";
import SpecialCollections from "@/components/collections/SpecialCollections";
import OurStory from "@/components/story/OurStory";
import TestimonialsSection from "@/components/testimonials/TestimonialsSection";
import VisitUs from "@/components/info/VisitUs";
import Footer from "@/components/layout/Footer";

export default function Home() {
  useEffect(() => {
    // Handle hash navigation when page loads
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      // Small delay to ensure the page is fully loaded
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  }, []);

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