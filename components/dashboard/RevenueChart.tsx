"use client";

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

export default function RevenueChart({
  data,
  totalRevenue,
}: {
  data: any;
  totalRevenue: number;
}) {

  // FILTER LOGIC

  const [period, setPeriod] = useState<
    "monthly" | "yearly"
  >("monthly");

  // MONTH SLIDER

  const [startIndex, setStartIndex] =
    useState(0);

  // RESPONSIVE ITEMS COUNT

  const [itemsPerView, setItemsPerView] =
    useState(6);

  // useEffect(() => {

  //   const updateItems = () => {

  //     if (window.innerWidth < 640) {

  //       // MOBILE
  //       setItemsPerView(3);

  //     } else if (
  //       window.innerWidth < 1024
  //     ) {

  //       // TABLET
  //       setItemsPerView(4);

  //     } else {

  //       // DESKTOP
  //       setItemsPerView(6);

  //     }
  //   };

  //   updateItems();

  //   window.addEventListener(
  //     "resize",
  //     updateItems
  //   );

  //   return () =>
  //     window.removeEventListener(
  //       "resize",
  //       updateItems
  //     );

  // }, []);

  // ACTIVE DATA

  useEffect(() => {

  const updateItems = () => {

    let newItemsPerView = 6;

    if (window.innerWidth < 640) {

      // MOBILE
      newItemsPerView = 3;

    } else if (
      window.innerWidth < 1024
    ) {

      // TABLET
      newItemsPerView = 4;

    }

    setItemsPerView(newItemsPerView);

    // RESET INDEX WHEN SCREEN CHANGES
    setStartIndex(0);
  };

  updateItems();

  window.addEventListener(
    "resize",
    updateItems
  );

  return () =>
    window.removeEventListener(
      "resize",
      updateItems
    );

}, []);
  
  const activeData = useMemo(() => {

    return (
      data?.[period] ||
      Object.values(data || {})[0] ||
      []
    );

  }, [data, period]);

  // RESPONSIVE VISIBLE DATA

  // const visibleData = period === "monthly" ? activeData.slice(startIndex,startIndex + itemsPerView) : activeData;
  const visibleData =
  period === "monthly"
    ? itemsPerView >= 6
      ? activeData
      : activeData.slice(
          startIndex,
          startIndex + itemsPerView
        )
    : activeData;

  // TOOLTIP

  const [hoveredIndex, setHoveredIndex] =
    useState<number | null>(null);

  // HEIGHT LOGIC

  const maxValue = useMemo(() => {

    return Math.max(
      ...activeData.map(
        (item: any) =>
          Number(item?.value || 0)
      ),
      1
    );

  }, [activeData]);

  // NEXT

  const handleNext = () => {

    if (
      startIndex + itemsPerView <
      activeData.length
    ) {

      setStartIndex(
        (prev) => prev + itemsPerView
      );
    }
  };

  // PREV

  const handlePrev = () => {

    if (startIndex > 0) {

      setStartIndex(
        (prev) => prev - itemsPerView
      );
    }
  };

  return (
    <div
      className="
        bg-white
        p-4 sm:p-5 xl:p-6
        rounded-[28px]
        border border-[#EAEAEA]
        w-full
        h-full
        overflow-hidden
      "
    >

      {/* HEADER */}

      <div
        className="
          flex
          items-start
          justify-between
          gap-4
          mb-2
        "
      >

        <div className="min-w-0">

          <h3
            className="
              text-[1rem]
              sm:text-[1.1rem]
              xl:text-[1.3rem]
              font-semibold
              text-black
            "
          >
            Revenue Overview
          </h3>

          <h1
            className="
              text-[26px]
              sm:text-[32px]
              xl:text-[42px]
              font-medium
              leading-none
              mt-3
              text-black
              tracking-[-1px]
              xl:tracking-[-1.5px]
              mb-5
              break-all
            "
          >
            ₹
            {totalRevenue?.toLocaleString() ||
              "0"}
          </h1>

        </div>

        {/* FILTER */}

        <button
          onClick={() => {

            setPeriod((prev) =>
              prev === "monthly"
                ? "yearly"
                : "monthly"
            );

            setStartIndex(0);

          }}
          className="
            h-[38px]
            sm:h-[42px]
            px-3 sm:px-4
            rounded-xl
            border border-[#E5E5E5]
            bg-white
            flex items-center
            gap-2
            text-[12px]
            sm:text-[14px]
            font-semibold
            capitalize
            shrink-0
          "
        >

          {period}

          <ChevronDown size={15} />

        </button>

      </div>

      {/* GRAPH */}

      <div
        className="
          flex
          items-end
          gap-2
          sm:gap-4
          h-[220px]
          sm:h-[250px]
          min-w-0
        "
      >

        {/* LEFT BUTTON */}

        {period === "monthly" && itemsPerView < 6 && (
          <button
            onClick={handlePrev}
            disabled={startIndex === 0}
            className="
              min-w-[34px]
              sm:min-w-[40px]
              h-[34px]
              sm:h-[40px]
              rounded-full
              border border-[#E5E5E5]
              flex items-center justify-center
              disabled:opacity-40
              shrink-0
            "
          >
            <ChevronLeft size={18} />
          </button>
        )}

        {/* BARS */}

        <div
          className="
            flex-1
            flex
            items-end
            justify-between
            gap-2
            sm:gap-4
            h-full
            min-w-0
          "
        >

          {visibleData.map(
            (
              item: any,
              index: number
            ) => {

              const fillHeight =
                (
                  (Number(
                    item?.value || 0
                  ) / maxValue) *
                  100
                );

              return (
                <div
                  key={index}
                  className="
                    relative
                    flex
                    flex-col
                    items-center
                    justify-end
                    h-full
                    min-w-0
                  "
                  onMouseEnter={() =>
                    setHoveredIndex(index)
                  }
                  onMouseLeave={() =>
                    setHoveredIndex(null)
                  }
                >

                  {/* TOOLTIP */}

                  {hoveredIndex === index && (
                    <div
                      className="
                        absolute
                        -top-16
                        z-20
                        bg-white
                        border border-[#ECECEC]
                        rounded-2xl
                        px-4 py-3
                        min-w-[120px]
                        shadow-sm
                      "
                    >

                      <p className="text-[13px] font-semibold text-black">
                        {item?.name}
                      </p>

                      <p className="text-[12px] text-[#777] mt-1">
                        Revenue : ₹
                        {Number(
                          item?.revenue ||
                            item?.value ||
                            0
                        ).toLocaleString()}
                      </p>

                    </div>
                  )}

                  {/* BAR */}

                  <div
                    className="
                      relative
                      w-[28px]
                      sm:w-[36px]
                      md:w-[42px]
                      xl:w-[52px]
                      h-[120px]
                      sm:h-[145px]
                      xl:h-[170px]
                      rounded-full
                      overflow-hidden
                      cursor-pointer
                      shrink-0
                    "
                  >

                    {/* STRIPED BG */}

                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        backgroundImage:
                          "repeating-linear-gradient(135deg,#D2D2D2 0px,#D2D2D2 3px,transparent 3px,transparent 8px)",
                      }}
                    />

                    {/* FILLED BAR */}

                    <div
                      className="
                        absolute
                        bottom-0
                        left-0
                        w-full
                        rounded-full
                        transition-all
                        duration-500
                      "
                      style={{
                        height: `${fillHeight}%`,
                        background:
                          "#FFAE58",
                      }}
                    />

                  </div>

                  {/* LABEL */}

                  <span
                    className="
                      mt-2
                      text-[10px]
                      sm:text-[11px]
                      xl:text-[13px]
                      text-[#9E9E9E]
                      font-medium
                      truncate
                      max-w-[50px]
                    "
                  >
                    {item?.name}
                  </span>

                </div>
              );
            }
          )}
        </div>

        {/* RIGHT BUTTON */}

        {period === "monthly" && itemsPerView < 6 && (
          <button
            onClick={handleNext}
            disabled={
              startIndex +
                itemsPerView >=
              activeData.length
            }
            className="min-w-[34px] sm:min-w-[40px] h-[34px] sm:h-[40px] rounded-full border border-[#E5E5E5] flex items-center justify-center disabled:opacity-40 shrink-0">
            <ChevronRight size={18} />
          </button>
        )}

      </div>
    </div>
  );
}