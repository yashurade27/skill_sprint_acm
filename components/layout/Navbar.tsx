"use client";


import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Head from "next/head";

export default function Navbar() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Font styles
  const navLinkFont: React.CSSProperties = {
    fontFamily: 'Montserrat, Arial, sans-serif',
    fontWeight: 100,
    fontSize: '0.9rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  };
  const logoFont: React.CSSProperties = {
    fontFamily: 'Poppins, Montserrat, Arial, sans-serif',
    fontWeight: 300,
    fontSize: '1.5rem',
    letterSpacing: '1.5px',
    color: '#222',
  };

  return (
    <>
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400&family=Poppins:wght@700&display=swap" rel="stylesheet" />
      </Head>
      <header className="nav-header fixed top-0 left-0 w-full z-200 shadow-md">
        <nav className="container-max flex items-center justify-between">
          {/* Left Side → Logo / Brand */}
          <div className="nav-logo cursor-pointer">
            <Link href="/">
              <span style={logoFont}>KadamKate&apos;s Snacks</span>
            </Link>
          </div>

          {/* Center Links */}
          <ul className="nav-menu hidden md:flex ">
            <li
              onClick={() => scrollToSection("hero")}
              className="nav-item"
              style={navLinkFont}
            >
              Home
            </li>
            <li
              onClick={() => scrollToSection("products")}
              className="nav-item"
              style={navLinkFont}
            >
              Products
            </li>
            <li
              onClick={() => scrollToSection("story")}
              className="nav-item"
              style={navLinkFont}
            >
              Story
            </li>
            <li
              onClick={() => scrollToSection("testimonials")}
              className="nav-item"
              style={navLinkFont}
            >
              Testimonials
            </li>
            <li
              onClick={() => scrollToSection("visit")}
              className="nav-item"
              style={navLinkFont}
            >
              Visit Us
            </li>
          </ul>

          {/* Right Side CTA */}
          <div className="nav-actions">
            <Button
              asChild
              className="bg-green-600 hover:bg-green-700 text-white rounded-full px-5 py-2 transition-colors duration-300"
            >
              <a
                href="https://wa.me/919876543210" // replace with your number
                target="_blank"
                rel="noopener noreferrer"
              >
                Order on WhatsApp
              </a>
            </Button>
          </div>
        </nav>
      </header>
    </>
  );
}

