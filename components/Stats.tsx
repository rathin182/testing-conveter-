"use client";
import React from 'react'
import { CalendarCheck, Users, Award, Shield, Zap, Globe } from 'lucide-react'
import { useScrollAnimation } from '@/lib/useScrollAnimation'
import Image from 'next/image';

const stats = [
  { value: '10K+', label: 'Project Delivered on Time' },
  { value: '1.2K+', label: 'Engineers onboard' },
  { value: '95%', label: 'Clients satisfaction' },
  { value: '10K+', label: 'Project Delivered on Time' },
  { value: '1.2K+', label: 'Engineers onboard' },
  { value: '95%', label: 'Clients satisfaction' },
]

const companyIcons = [
  { src: '/sugar.png', label: 'sugar' },
  { src: '/abc.png', label: 'abc' },
  { src: '/bbc.png', label: 'bbc' },
  { src: '/gateway.png', label: 'gateway' },
  { src: '/moto.png', label: 'moto' },
  { src: '/flash.png', label: 'flash' },
]

const Stats = () => {
  const headingRef = useScrollAnimation('fadeUp')
  const gridRef = useScrollAnimation('fadeUp')
  const iconsRef = useScrollAnimation('fadeUp')

  return (
    <section className="w-full bg-white py-20 px6 font-inter">
      <div className="mx-auto">
        <div ref={headingRef} className="text-center mb-18">
          <h2 className="text-[40px] lg:text-[50px] font-semibold leading-tight text-slate-950">
            Trusted by <span className="italic">builders,</span><br /> startups &amp; growing teams
          </h2>
        </div>

        <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {stats.map((item, index) => (
            <div key={index} >
              <p className="text-[50px] lg:text-[70px] font-semibold bg-[linear-gradient(106.71deg,#00BBFF_16.24%,#C15DFF_53.84%,#FFAE58_69.09%)] bg-clip-text text-transparent">
                {item.value}
              </p>
              <p className="text-[20px] text-[#4B4B4B] font-id">{item.label}</p>
            </div>
          ))}
        </div>

        <div ref={iconsRef} className="mt-26 w-full h-full border border-slate-200 py-8 w-full overflow-hidden">
          <div className="flex animate-marquee items-center">
            {[...companyIcons, ...companyIcons].map((company, index) => (
              <div key={index} className="flex-shrink-0 h-16 w-[100px] lg:w-[290px] h-[100px] relative">
                <Image src={company.src} alt={company.label} fill className="object-contain" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Stats