"use client";

import {
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ArrowUpRight,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

export type Period = "weekly" | "monthly" | "yearly";

interface StatCardProps {
  title: string;
  value: string;
  icon?: React.ReactNode;
  change?: string;
  changeType?: "up" | "down";
  subtitle?: string;
  highlighted?: boolean;
  period?: Period;
  onPeriodChange?: (p: Period) => void;
}

const PERIODS: Period[] = ["weekly", "monthly", "yearly"];

export default function StatCard({ title, value, change, changeType, subtitle, highlighted, period, onPeriodChange, }: StatCardProps) {
  const isUp = changeType === "up";

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, []);

  return (
    <div className="">
      <div className={`relative rounded-[24px] border p-6 m-2 h-43 transition-all duration-300 
       
        ${highlighted
          ? "bg-gradient-to-br from-[#FF7A00] via-[#FFAE58] to-[#FFE0B8] border-transparent text-white"
          : "bg-[#ffffff] border-[#E7E7E7] text-black"
        }
      `}
    >
      {/* Top */}
      <div className="flex items-start justify-between ">
        <div>
          <p
            className={`text-[1.1rem] font-medium ${highlighted ? "text-white/90" : "text-[#111]"
              }`}
          >
            {title}
          </p>
        </div>

        {/* Arrow Button */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center border
            ${highlighted
              ? "bg-white text-black border-white/20"
              : "bg-white text-black border-[#DADADA]"
            }
          `}
        >
          <ArrowUpRight size={18} strokeWidth={2.2} />
        </div>
      </div>

      {/* Value */}
      <div className="mt-2 mb-8">
        <h2 className={`text-[36px] leading-none font-medium tracking-tight ${highlighted ? "text-white" : "text-black"
            }`}
        >
          {value || "0"}
        </h2>
      </div>

      {/* Bottom */}
      <div className="absolute bottom-3 left-6 right-6 flex items-center justify-between">
        {change && changeType ? (
          <div
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium border
              ${highlighted
                ? "bg-white/10 border-white/20 text-white"
                : isUp
                  ? "bg-[#EEF9F1] border-[#D7F0DD] text-[#238B57]"
                  : "bg-red-50 border-red-100 text-red-500"
              }
            `}
          >
            {isUp ? (
              <TrendingUp size={12} />
            ) : (
              <TrendingDown size={12} />
            )}

            <span>{change}</span>
          </div>
        ) : (
          <span className={`text-[13px] ${highlighted ? "text-white/80" : "text-[#6B6B6B]"
              }`}
          >
            {subtitle}
          </span>
        )}

        {/* Optional Period Dropdown */}
        {onPeriodChange && period && (
          <div className="relative" ref={ref}>
            <button
              onClick={() => setOpen((o) => !o)}
              className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs capitalize
                ${highlighted
                  ? "bg-white/10 text-white"
                  : "bg-white text-[#444]"
                }
              `}
            >
              {period}
              <ChevronDown size={12} />
            </button>

            {open && (
              <div className="absolute right-0 bottom-12 w-[110px] overflow-hidden rounded-xl border border-[#E5E5E5] bg-white z-50">
                {PERIODS.map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      onPeriodChange(p);
                      setOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-sm capitalize transition-colors hover:bg-[#F5F5F5]
                      ${p === period
                        ? "font-semibold text-[#177A47]"
                        : "text-[#444]"
                      }
                    `}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    </div>
  );
}