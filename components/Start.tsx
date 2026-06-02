"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const Start = () => {
  const navRef = useRef<HTMLElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.fromTo(navRef.current, { y: -40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 })
      .fromTo(taglineRef.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, "-=0.2")
      .fromTo(headlineRef.current, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, "-=0.3")
      .fromTo(rightRef.current, { x: 40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6 }, "-=0.4")
      .fromTo(bannerRef.current, { scaleY: 0.8, opacity: 0, transformOrigin: "top" }, { scaleY: 1, opacity: 1, duration: 0.7 }, "-=0.3");
  }, []);
  return (
    <div className="min-h-screen p-5 bg-white font-sans">
      {/* Navbar */}
      <header className="border-2 border-gray-200 overflow-hidden">
        <div
          className="
          max-w-full
          mx-auto
          px-4
          sm:px-6
          h-[64px]

          flex
          items-center
          justify-between
        "
        >
          {/* LEFT */}
          <div className="flex items-center">
            {/* LOGO */}
            <span
              className="
              text-[22px]
              font-benz
              tracking-tight
              text-black

              lg:mr-4
              lg:border-r-2
              lg:border-gray-300
              lg:pr-4
            "
            >
              TECH ENGI
            </span>

            {/* DESKTOP NAV */}
            <nav
              className="
              hidden
              lg:flex
              items-center
              gap-8

              font-id
              text-[14px]
              text-black
            "
            >
              <a href="#">How it works?</a>
              <a href="#">Explore Projects</a>
              <a href="#">Blogs</a>
            </nav>
          </div>

          {/* DESKTOP RIGHT */}
          <div
            className="
            hidden
            lg:flex
            items-center
            gap-5

            border-l-2
            border-gray-300
            pl-5
          "
          >
            {/* SOCIAL */}
            <div
              className="
              flex
              items-center
              gap-4

              border-r
              border-gray-200
              pr-5
            "
            >
              {/* LinkedIn */}
              <a href="#" aria-label="LinkedIn">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-black"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>

              {/* Instagram */}
              <a href="#" aria-label="Instagram">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-black"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>

              {/* Facebook */}
              <a href="#" aria-label="Facebook">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-black"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
            </div>

            {/* BUTTONS */}
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="
                inline-flex
                items-center
                justify-center

                px-4
                py-1

                text-[16px]

                font-spacegrotesk
                border-2
                border-gray-300
                text-[#050A30]
                hover:bg-gray-50

                whitespace-nowrap
              "
              >
                BECOME BUILDER
              </Link>

              <Link
                href="/login"
                className="
                inline-flex
                items-center
                justify-center
                gap-2

                px-4
                py-1

                text-[16px]

                font-inter
                bg-black
                text-white
                hover:bg-gray-800

                whitespace-nowrap
              "
              >
                GOT A PROJECT
                <span className="text-base">↗</span>
              </Link>
            </div>
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="
            lg:hidden
            flex
            items-center
            justify-center
          "
          >
            {mobileMenuOpen ? (
              <X className="w-7 h-7 text-black" />
            ) : (
              <Menu className="w-7 h-7 text-black" />
            )}
          </button>
        </div>

        {/* MOBILE MENU */}
        <div
          className={`
          lg:hidden
          overflow-hidden
          transition-all
          duration-300

          ${mobileMenuOpen
              ? "max-h-[500px] border-t border-gray-200"
              : "max-h-0"
            }
        `}
        >
          <div className="px-4 py-5 flex flex-col gap-5 bg-white">
            {/* NAV LINKS */}
            <nav className="flex flex-col gap-4 text-[15px] font-id text-black">
              <a href="#">How it works?</a>
              <a href="#">Explore Projects</a>
              <a href="#">Blogs</a>
            </nav>

            {/* SOCIAL */}
            <div className="flex items-center gap-4">
              {/* LinkedIn */}
              <a href="#" aria-label="LinkedIn">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-black"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>

              {/* Instagram */}
              <a href="#" aria-label="Instagram">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-black"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>

              {/* Facebook */}
              <a href="#" aria-label="Facebook">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-black"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
            </div>

            {/* BUTTONS */}
            <div className="flex flex-col gap-3">
              <Link
                href="/login"
                className="
                flex
                items-center
                justify-center

                px-4
                py-3

                text-[15px]

                border-2
                border-gray-300
                text-[#050A30]
              "
              >
                BECOME BUILDER
              </Link>

              <Link
                href="/login"
                className="
                flex
                items-center
                justify-center
                gap-2

                px-4
                py-3

                text-[15px]

                bg-black
                text-white
              "
              >
                GOT A PROJECT
                <span>↗</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-full mx-auto px-6 pt-6 pb-0">
        {/* Top row */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 mb-8">
          {/* Left */}
          <div className="flex-1">
            <div ref={taglineRef} className="flex items-center gap-2 mb-4 font-id text-[#FFAE58]">
              <span className="text-[16px] uppercase">STRESS LESS</span>
              <span className="">|</span>
              <span className="text-[16px] uppercase">TIMELY DELIVERY</span>
            </div>
            <h1
              ref={headlineRef}
              className="text-[42px] sm:text-[60px] lg:text-[94px] font-benz leading-[1.0] text-black uppercase"
              style={{ letterSpacing: "-1px" }}
            >
              BUILD FASTER,<br />SUBMIT SMARTER
            </h1>
          </div>

          {/* Right */}
          <div ref={rightRef} className="flex flex-col items-start lg:items-end justify-between gap-6 lg:pt-2 w-full lg:max-w-[41%] text-left lg:text-right">
            <p className="text-[18px] sm:text-[22px] lg:text-[26px] font-medium font-id text-black">
              Tech-ENGI connects students with skilled builders who turns your ideas, assignments and projects into ready-to-submit work fast!
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center font-inter gap-3 w-full sm:w-auto">
              <Link href={'register/engineer'} className="px-6 py-4 text-[16px] font-bold text-gray-900 bg-[#F4F4F4] whitespace-nowrap text-center">
                BECOME BUILDER
              </Link>
              <Link href={'register/client'} className="px-6 py-4 text-[16px] font-bold bg-black text-white flex items-center justify-center gap-2 hover:bg-gray-800 whitespace-nowrap">
                START MY PROJECT <span>↗</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Orange Banner */}
        <div className="relative min-h-[320px] lg:min-h-[418px]">

          {/* Background rounded layer */}
          <div className="absolute inset-0 rounded-2xl bg-[#FFAE58]" />

          {/* Two guys image — desktop only, scales with viewport ✅ */}
          <div
            ref={bannerRef}
            className="hidden lg:block absolute -translate-x-1/2"
            style={{
              bottom: 0,
              width: "min(850px, 58vw)",/* ✅ shrinks proportionally, never overflows */
              left: "calc(30% + 80px)",
            }}
          >
            <Image
              src="/two-guys.png"
              alt="Student and builder shaking hands"
              width={560}
              height={480}
              className="w-full h-auto object-contain "
              priority
            />
          </div>

          {/* Mobile/tablet image */}
          {/* Mobile/tablet image */}
          <div className="lg:hidden relative flex justify-center">
            <Image
              src="/two-guys.png"
              alt="Student and builder shaking hands"
              width={1200}
              height={1200}
              className="w-full max-w-[340px] h-auto scale-125 object-contain"
              priority
            />
          </div>

          {/* Bottom-left: Avatars + Trusted */}
          <div className="
          hidden lg:flex
      relative lg:absolute lg:bottom-15 lg:left-20
      flex flex-col items-center gap-3
      px-5 pb-6 pt-4 lg:p-0
    ">
            <div className="flex flex-start -space-x-3 w-full">
              {[
                { bg: "#c0392b" },
                { bg: "#27ae60" },
                { bg: "#2980b9" },
                { bg: "#8e44ad" },
                { bg: "#e67e22" },
              ].map((a, i) => (
                <div
                  key={i}
                  className="w-9 h-9 rounded-full border-2 border-white"
                  style={{ backgroundColor: a.bg }}
                />
              ))}
            </div>
            <span className="text-white font-semibold font-id text-[20px] lg:text-[24px]">Trusted by 1M+ Students</span>
          </div>

          {/* Testimonial card */}
          <div className="
          hidden lg:flex lg:flex-col
      relative lg:absolute lg:bottom-40 lg:right-30
      max-w-[320px] font-inter
      px-5 pb-6 lg:p-0
    ">
            <p className="text-white font-bold text-[25px] mb-0.5">Tarun</p>
            <p className="text-white/70 text-[15px] mb-2">student at XYZ college</p>
            <div className="border-t border-white/40 pt-2">
              <p className="text-white/90 text-[15px] leading-relaxed">
                Lorem ipsum dolor sit amet consectetur. Viverra imperdiet sit viverra sed fusca aliquet eget. Amet faucibus amet sapien dui. Est a at viverra cursus montes libero massa a. Urna.
              </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Start;
