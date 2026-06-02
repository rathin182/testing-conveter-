"use client";
import React from 'react'
import { useScrollAnimation } from '@/lib/useScrollAnimation'

const WhatWeOffer = () => {
  const engineersOffers = [
    "Lorem ipsum dolor sit amet consectetur.",
    "Lorem ipsum dolor sit amet consectetur.",
    "Lorem ipsum dolor sit amet consectetur. Praesent dolor habitasse massa volutpat at massa condimentum. Tempus interdum ornare diam nulla at nam velit. A interdum.",
    "Lorem ipsum dolor sit amet consectetur.",
    "Lorem ipsum dolor sit amet consectetur. Pellentesque tortor eu diam pharetra at. Risus id semper vitae mauris aliquet. Id sed.",
    "Lorem ipsum dolor sit amet consectetur.",
    "Lorem ipsum dolor sit amet consectetur.",
    "Lorem ipsum dolor sit amet consectetur.",
    "Lorem ipsum dolor sit amet consectetur."
  ]

  const clientsOffers = [
    "Lorem ipsum dolor sit amet consectetur.",
    "Lorem ipsum dolor sit amet consectetur.",
    "Lorem ipsum dolor sit amet consectetur. Praesent dolor habitasse massa volutpat at massa condimentum. Tempus interdum ornare diam nulla at nam velit. A interdum.",
    "Lorem ipsum dolor sit amet consectetur.",
    "Lorem ipsum dolor sit amet consectetur. Pellentesque tortor eu diam pharetra at. Risus id semper vitae mauris aliquet. Id sed.",
    "Lorem ipsum dolor sit amet consectetur.",
    "Lorem ipsum dolor sit amet consectetur.",
    "Lorem ipsum dolor sit amet consectetur."
  ]

  const titleRef = useScrollAnimation('fadeUp')
  const leftRef = useScrollAnimation('slideLeft')
  const rightRef = useScrollAnimation('slideRight')

  return (
    <section className="w-full bg-white py-20 px-6">
      <div className="w-full">
        {/* Title */}
        <div className="flex flex-col items-center justify-center leading-none mb-8">
          <h2
            ref={titleRef}
            className="text-[50px] lg:text-[85px] font-semibold text-black font-id text-center mb-2"
          >
            What we
          </h2>

          <span className="text-[#FFAE58] font-dm italic text-[3rem] lg:text-[5rem] leading-none">
            offer?
          </span>
        </div>

        {/* Main Content */}
        <div
          className="
    flex
    flex-col
    lg:flex-row

    justify-between
    items-stretch
    lg:items-start

    gap-10
    lg:gap-8

    font-id
  "
        >
          {/* LEFT COLUMN - FOR ENGINEERS */}
          <div
            ref={leftRef}
            className="
      flex
      flex-row

      items-stretch
      gap-0

      w-full
    "
          >
            {/* VERTICAL LABEL */}
            <div className="flex items-stretch shrink-0 pr-3 sm:pr-4">
              <p
                className="
          text-[#6F6F6F]
          font-medium

          text-[20px]
          sm:text-[26px]
          lg:text-[34px]

          border
          border-slate-300

          py-4
          sm:py-5

          px-2

          flex
          items-center
          justify-center
        "
                style={{
                  writingMode: "vertical-rl",
                  transform: "rotate(180deg)",
                }}
              >
                For Engineers
              </p>
            </div>

            {/* CARD */}
            <div
              className="
        border
        border-slate-300

        p-5
        sm:p-8

        w-full
      "
            >
              <div className="space-y-5 sm:space-y-6">
                {engineersOffers.map((offer, index) => (
                  <div
                    key={index}
                    className="
              pb-4
              border-b
              border-slate-200
              last:border-0
            "
                  >
                    <p
                      className="
                text-[15px]
                sm:text-[18px]

                leading-relaxed
                text-black
              "
                    >
                      <span className="font-semibold">
                        {index + 1}.
                      </span>{" "}
                      {offer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - FOR CLIENTS */}
          <div
            ref={rightRef}
            className="
      flex
      flex-row

      items-stretch
      gap-0

      w-full

      lg:mt-40
    "
          >
            {/* CARD */}
            <div
              className="
        border
        border-slate-300

        lg:border-b-0

        p-5
        sm:p-8

        w-full

        lg:-mb-10
      "
            >
              <div className="space-y-5 sm:space-y-6">
                {clientsOffers.map((offer, index) => (
                  <div
                    key={index}
                    className="
              pb-4
              border-b
              border-slate-200
              last:border-0
            "
                  >
                    <p
                      className="
                text-[15px]
                sm:text-[18px]

                leading-relaxed
                text-black
              "
                    >
                      <span className="font-semibold">
                        {index + 1}.
                      </span>{" "}
                      {offer}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* VERTICAL LABEL */}
            <div className="flex items-stretch shrink-0 pl-3 sm:pl-4">
              <p
                className="
          text-[#6F6F6F]
          font-medium

          text-[20px]
          sm:text-[26px]
          lg:text-[34px]

          border
          border-slate-300

          py-4
          sm:py-5

          px-2

          flex
          items-center
          justify-center
        "
                style={{
                  writingMode: "vertical-rl",
                }}
              >
                For Clients
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default WhatWeOffer