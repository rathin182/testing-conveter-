"use client";

import React, { useState } from "react";

export default function ScheduleMeet() {
  const [reason, setReason] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [duration, setDuration] = useState<string>("30 minutes");

  const [meetings, setMeetings] = useState<any[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newMeeting = {
      id: meetings.length + 1,
      reason,
      date,
      time,
      duration,
      status: "pending",
      meetLink: ""
    };

    setMeetings([newMeeting, ...meetings]);

    setReason("");
    setDate("");
    setTime("");
    setDuration("30 minutes");
  };

  return (
    <div className="space-y-8">

      {/* Heading */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Schedule a Meeting
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
          Request a meeting with the admin or developer team.
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 space-y-5"
      >
        {/* Reason */}
        <div>
          <label className="text-sm font-medium text-gray-800 dark:text-gray-300">
            Meeting Reason
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain why you want the meeting"
            required
            className="w-full mt-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white p-3 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Date + Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div>
            <label className="text-sm font-medium text-gray-800 dark:text-gray-300">
              Date
            </label>
            <input
              type="date"
              value={date}
              required
              onChange={(e) => setDate(e.target.value)}
              className="w-full mt-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-800 dark:text-gray-300">
              Time
            </label>
            <input
              type="time"
              value={time}
              required
              onChange={(e) => setTime(e.target.value)}
              className="w-full mt-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="text-sm font-medium text-gray-800 dark:text-gray-300">
            Duration
          </label>
          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full mt-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white p-3 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="15 minutes">15 minutes</option>
            <option value="30 minutes">30 minutes</option>
            <option value="45 minutes">45 minutes</option>
            <option value="1 hour">1 hour</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-all"
        >
          Request Meeting
        </button>
      </form>

      {/* Meeting List */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
          Requested Meetings
        </h2>

        <div className="grid gap-4">
          {meetings.map((m) => (
            <div
              key={m.id}
              className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {m.reason}
                </h3>

                <span
                  className={`px-3 py-1 text-xs rounded-full ${m.status === "approved"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                      : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300"
                    }`}
                >
                  {m.status}
                </span>
              </div>
              <div className="flex justify-between items-center mt-3">

                <div className="space-y-1">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Date: {m.date}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Time: {m.time}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Duration: {m.duration}
                  </p>
                </div>

                {m.status === "approved" && m.meetLink && (
                  <a
                    href={m.meetLink}
                    target="_blank"
                    className="
              px-4 py-2 rounded-lg text-sm font-medium
              bg-blue-500/30 text-blue-600
              dark:bg-blue-400/20 dark:text-blue-300
              hover:bg-blue-500/40 dark:hover:bg-blue-400/30
              transition
            "
                  >
                    Join
                  </a>
                )}
              </div>

            </div>
          ))}
        </div>


      </div>
    </div>
  );
}
