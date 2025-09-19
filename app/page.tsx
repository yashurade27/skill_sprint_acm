'use client';
import HeroSection from "@/components/hero/Hero";
import Navbar from "@/components/layout/Navbar";

export default function Home() {
  return (
    <main className="min-h-screen ">
      <Navbar />
      <HeroSection/>
    </main>
  );
}