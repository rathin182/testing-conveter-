"use client";

import React from "react";

interface DistributionItem {
  name: string;
  value: number;
}

interface Props {
  data?: DistributionItem[];
}

const COLORS = [
  "#A855F7",
  "#3B82F6",
  "#22C55E",
  "#EF4444",
  "#F59E0B",
  "#06B6D4",
  "#EC4899",
  "#8B5CF6",
];

const ProjectDistribution: React.FC<Props> = ({ data = [], }) => {
  const [hovered, setHovered] = React.useState<{
    name: string;
    value: number;
    percent: number;
    x: number;
    y: number;
  } | null>(null);
  const total = data.reduce((sum, item) => sum + item.value, 0) || 1;

  const size = 300;
  const strokeWidth = 50;

  const radius =
    (size - strokeWidth) / 2;

  const circumference =
    2 * Math.PI * radius;

  let cumulativePercent = 0;

  return (
    <div className="w-full rounded-3xl border border-[#ECECEC] bg-white p-5">
      <h2 className="mb-6 text-xl font-semibold text-[#111827]">
        Project Distribution
      </h2>

      <div className="flex flex-col items-center">
        <div
          className="relative"
          style={{
            width: size,
            height: size,
          }}
        >
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
          >
            {/* Background Ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#EEF2F7"
              strokeWidth={strokeWidth}
            />

            {data.map((item, index) => {
              const percent =
                item.value / total;

              const dashLength =
                circumference * percent;

              const gapLength =
                circumference -
                dashLength;

              const offset =
                -(
                  cumulativePercent *
                  circumference
                );

              cumulativePercent += percent;

              return (
                <circle
                  key={item.name}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={
                    COLORS[
                    index %
                    COLORS.length
                    ]
                  }
                  strokeWidth={
                    strokeWidth
                  }
                  strokeLinecap="butt"
                  strokeDasharray={`${dashLength} ${gapLength}`}
                  strokeDashoffset={
                    offset
                  }
                  transform={`rotate(-90 ${size / 2
                    } ${size / 2})`}
                />
              );
            })}
          </svg>

          {/* Center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-4xl font-bold text-[#111827]">
              {total}
            </div>

            <div className="text-sm text-[#6B7280]">
              Total Projects
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-8 grid w-full grid-cols-2 gap-4">
          {data.map(
            (item, index) => (
              <div
                key={item.name}
                className="flex items-center gap-3"
              >
                <div
                  className="h-3 w-3 rounded-full"
                  style={{
                    background:
                      COLORS[
                      index %
                      COLORS.length
                      ],
                  }}
                />

                <div className="flex flex-1 items-center justify-between">
                  <span className="truncate text-sm font-medium text-[#374151]">
                    {item.name}
                  </span>

                  <span className="text-sm font-semibold text-[#111827]">
                    {Math.round(
                      (item.value /
                        total) *
                      100
                    )}
                    %
                  </span>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDistribution;