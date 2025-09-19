'use client';
import HeroSection from "@/components/hero/Hero";
import Navbar from "@/components/layout/Navbar";
import FeaturedProducts from "@/components/products/FeaturedProducts";
import SpecialCollections from "@/components/collections/SpecialCollections";
import TestimonialsSection from "@/components/testimonials/TestimonialsSection";

export default function Home() {
  return (
    <main className="min-h-screen ">
      <Navbar />
      <HeroSection/>
      <FeaturedProducts />
      <SpecialCollections />
      <TestimonialsSection />
    </main>
  );
}