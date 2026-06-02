"use client";
import React from 'react'
import { Briefcase, Users, Rocket } from 'lucide-react'
import { useScrollAnimation } from '@/lib/useScrollAnimation'

const HowItWorks = () => {
    const steps = [
        {
            icon: Briefcase,
            title: "Post a Job",
            description: "Describe your robotics or tech project with requirements, timeline, and budget."
        },
        {
            icon: Users,
            title: "Get the Match",
            description: "Describe your robotics or tech project with requirements, timeline, and budget."
        },
        {
            icon: Rocket,
            title: "Collaborate & Deliver",
            description: "Describe your robotics or tech project with requirements, timeline, and budget."
        }
    ]

    const headerRef = useScrollAnimation('fadeUp')
    const cardsRef = useScrollAnimation('fadeUp')

    return (
        <section className="w-full bg-white py-20 px-6">
            <div className="w-full">
                {/* Header */}
                <div ref={headerRef} className="text-center space-y-1 mb-16">
                    <div className="inline-flex items-center gap-2 justify-center text-[#FFAE58] ">
                        <span className="text-lg">•</span>
                        <p className="font-medium font-id text-[22px] tracking-wide">How it works</p>
                        <span className="text-lg">•</span>
                    </div>

                    <h2 className="text-[2.5rem] lg:text-7xl font-id font-semibold text-slate-950">
                        How we make everything<br />easy for you?
                    </h2>
                </div>

                {/* Cards Grid */}
                <div
  ref={cardsRef}
  className="
    grid
    grid-cols-1
    sm:grid-cols-2
    xl:grid-cols-3

    gap-y-16
    gap-x-8
    lg:gap-x-12
    xl:gap-x-20

    px-4
    sm:px-6
    lg:px-10
    xl:px-15
  "
>
  {steps.map((step, index) => {
    const Icon = step.icon

    return (
      <div
        key={index}
        className="
          relative
          w-full
          max-w-[390px]
          mx-auto
          font-id
        "
      >
        {/* ORANGE BACKGROUND */}
        <div
          className="
            absolute

            left-[-16px]
            right-[-16px]

            sm:left-[-20px]
            sm:right-[-20px]

            top-[140px]

            h-[220px]

            rounded-3xl
            bg-[#FFAE58]

            z-0
          "
        />

        {/* MAIN CARD */}
        <div
          className="
            relative
            z-10

            min-h-[340px]
            sm:min-h-[360px]
            lg:min-h-[370px]

            w-full

            bg-white
            rounded-3xl

            p-6
            sm:p-8

            border
            border-slate-200
          "
        >
          {/* ICON */}
          <div className="mt-8 sm:mt-10 flex justify-center">
            <div className="relative border-4 border-gray-200 rounded-2xl">
              
              {/* GLOW */}
              <div
                className="
                  absolute

                  left-1/2
                  top-1/2

                  -translate-x-1/2
                  -translate-y-1/2

                  w-24
                  h-24

                  bg-gradient-to-b
                  from-[#FFB05F]
                  to-[#FF8400]

                  rounded-2xl
                  blur-lg
                  opacity-40
                "
              />

              {/* ICON BOX */}
              <div
                className="
                  relative

                  w-20
                  h-20

                  bg-gradient-to-b
                  from-[#FFB05F]
                  to-[#FF8400]

                  rounded-2xl

                  flex
                  items-center
                  justify-center
                "
              >
                <Icon
                  size={40}
                  className="text-white"
                  strokeWidth={1.5}
                />
              </div>
            </div>
          </div>

          {/* CONTENT */}
          <div
            className="
              mt-10
              sm:mt-12

              flex
              flex-col
              items-center
              text-center

              space-y-4
            "
          >
            <h3
              className="
                text-[18px]
                sm:text-[20px]

                font-semibold
                text-slate-950
              "
            >
              {step.title}
            </h3>

            <p
              className="
                text-slate-500

                text-[15px]
                sm:text-[17px]

                font-medium
                leading-relaxed
              "
            >
              {step.description}
            </p>
          </div>
        </div>
      </div>
    )
  })}
</div>
            </div>
        </section>
    )
}

export default HowItWorks
