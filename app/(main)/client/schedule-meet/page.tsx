"use client";

import { Calendar, Clock } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";

export default function ScheduleMeet() {
  const [reason, setReason] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("30");
  const [loading, setLoading] = useState(false);
  const [loadingfetch, setLoadingfetch] = useState(false);
  const [selectedProject, setSelectedProject] = useState("");
  const [projects, setProjects] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  const [meetings, setMeetings] = useState<any[]>([]);
  const [rescheduleModal, setRescheduleModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!reason || !date || !time) {
      toast.error('Please fill all fields');
      return;
    }
    const durationInt = Number(duration);

    if (isNaN(durationInt)) {
      toast.error('Please enter a valid duration');
      return;
    }

    try {
      const res = await fetch('/api/client/meeting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, meetDate: date, meetTime: time, duration: durationInt, projectId: selectedProject })
      });
      if (res.ok) {
        toast.success('Meeting request submitted successfully');
        setReason("");
        setDate("");
        setTime("");
        setDuration("30");
        fetchMeetings();
      }
    } catch (error) {
      toast.error('Failed to submit meeting request');
    } finally {
      setLoading(false);
    }
  };

  const fetchMeetings = async () => {
    setLoadingfetch(true);
    try {
      const res = await fetch('/api/client/meeting');
      const data = await res.json();
      if (data.success) {
        setMeetings(data.meetings);
      }
    } catch (error) {
      toast.error('Failed to fetch meetings');
      // console.log(error);
    } finally {
      setLoadingfetch(false);
    }
  };

  const fetchUser = async () => {
    const res = localStorage.getItem("user");
    // const res = await fetch("/api/user");
    // const data = await res.json();
    const data = res ? JSON.parse(res) : null;

    // if (data.user) {
    //   setUser(data.user);
    // }
    if (data) {
      setUser(data);
    }
  };

  const fetchProject = async () => {
    const res = await fetch(`/api/feedbacks/clientprojectfetch?userId=${user?.id}`);
    const data = await res.json();
    setProjects(data.projects || []);
  };

  useEffect(() => {
    fetchMeetings();
    fetchUser();
  }, []);

  useEffect(() => {
    fetchProject();
  }, [user]);

  const approveMeeting = async (id: string) => {
    try {
      const res = await fetch("/api/client/meeting/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Meeting Approved ✔ Email Sent");
        fetchMeetings();
      }
    } catch (err) {
      toast.error("Something went wrong");
    }
  };



  const openRescheduleModal = (meeting: any) => {
    setSelectedMeeting(meeting);
    setRescheduleModal(true);
  };

  const rescheduleMeeting = async () => {
    try {
      const res = await fetch("/api/client/meeting/reschedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedMeeting.id,
          meetDate: date,
          meetTime: time,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Meeting Rescheduled ✔ Email Sent");
        fetchMeetings();
        setRescheduleModal(false);
      }
    } catch (err) {
      toast.error("Failed to reschedule");
    }
  };


  function toAmPm(time24: string): string {
    if (!time24) return ""

    const [hourStr, minute] = time24.split(":")
    let hour = Number(hourStr)

    if (isNaN(hour)) return time24

    const period = hour >= 12 ? "PM" : "AM"
    hour = hour % 12 || 12

    return `${hour}:${minute} ${period}`
  }


  return (
    <div className="space-y-8">
      <Toaster position="top-right" />
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
            onChange={(e) => setReason(e.target.value.slice(0, 100))}
            maxLength={100}
            minLength={20}
            placeholder="Explain why you want the meeting"
            required
            className="w-full mt-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white p-3 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <p className="my-2 text-right text-xs text-neutral-400 dark:text-neutral-600">{reason.length}/100</p>
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-gray-700 dark:text-gray-300 mb-1.5">
            Project
          </label>

          <div className="relative">
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="
          w-full appearance-none rounded-xl px-4 py-2.5
          bg-white dark:bg-gray-900
          border border-gray-300 dark:border-gray-700
          text-gray-900 dark:text-gray-100
          transition-all duration-200
          shadow-sm
        "
            >
              <option value="">Select Project</option>

              {Array.from(
                new Map(
                  projects.map(p => [p.project.id, p.project])
                ).values()
              ).map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>

            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
              <svg
                className="w-4 h-4 text-gray-500 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </span>
          </div>
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
            <option value="15">15 minutes</option>
            <option value="30">30 minutes</option>
            <option value="45">45 minutes</option>
            <option value="1">1 hour</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[var(--primary)] text-white py-3 rounded-lg font-medium transition-all"
        >
          {loading ? "Submitting..." : "Request Meeting"}
        </button>
      </form>

      {/* Meeting List */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
          Requested Meetings
        </h2>
        <div className="grid gap-4">
          <div className="grid gap-4">
            {loadingfetch ? (
              <p className="text-center text-sm text-gray-500">
                Loading meetings...
              </p>
            ) : meetings.length === 0 ? (
              <p className="text-center text-sm text-gray-500">
                No meetings found
              </p>
            ) : (
              meetings.map((m) => (
                <div
                  key={m.id}
                  className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-md hover:shadow-lg transition flex flex-col"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-sm text-gray-400">
                        {m?.project?.name}
                      </p>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-1">
                        {m.reason}
                      </h3>
                      {m.client && (
                        <span className="text-sm text-gray-500 block mt-1">
                          By {m?.createdBy ? m.createdBy : m.client.name}
                        </span>
                      )}

                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <Calendar size={16} className="text-blue-500" />
                          {new Date(m.meetDate).toDateString()}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <Clock size={16} className="text-green-500" />
                          {toAmPm(m.meetTime)} ({m.duration}min)
                        </div>
                      </div>
                    </div>

                    <span
                      className={`
          px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-4
          ${m.status === "approved"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                          : m.status === "pending"
                            ? "bg-yellow-200 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300"
                            : "bg-red-200 text-red-800 dark:bg-red-900/40 dark:text-red-300"
                        }
        `}
                    >
                      {m.status}
                    </span>
                  </div>

                  {/* Join Link */}
                  {m.status === "approved" && m.meetingLink && (

                    <a href={m.meetingLink}
                      target="_blank"
                      className="mt-5 inline-block px-4 py-2 bg-blue-500/20 text-blue-600 dark:bg-blue-400/20 dark:text-blue-300 rounded-lg hover:bg-blue-500/30 transition text-sm w-fit"
                    >
                      Join Meeting
                    </a>
                  )}

                  {/* Buttons at the bottom right */}
                  <div className="mt-auto pt-3 flex gap-3 justify-end">
                    {/* Approve */}
                    {m.status !== "approved" && (
                      <button
                        onClick={() => approveMeeting(m.id)}
                        className="px-4 py-2 bg-blue-600/20 text-blue-500 rounded-lg text-sm font-medium hover:bg-blue-700/20 transition"
                      >
                        Approve
                      </button>
                    )}

                    {/* Reschedule */}
                    {m.status === "pending" && (

                      <button
                        onClick={() => openRescheduleModal(m)}
                        className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm font-medium hover:bg-red-700/20 transition"
                      >
                        Reschedule
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

        </div>


      </div>
      {
        rescheduleModal && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black/40 flex justify-center items-center z-100">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl w-full max-w-md shadow-xl">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Reschedule Meeting</h2>

              <label className="text-sm text-gray-600 dark:text-gray-300">New Date</label>
              <input
                type="date"
                className="w-full mt-1 p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />

              <label className="text-sm text-gray-600 dark:text-gray-300 mt-3">New Time</label>
              <input
                type="time"
                className="w-full mt-1 p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />

              <div className="mt-5 flex justify-end gap-3">
                <button
                  onClick={() => setRescheduleModal(false)}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-700 dark:text-white rounded-lg"
                >
                  Cancel
                </button>

                <button
                  onClick={rescheduleMeeting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )
      }

    </div >
  );
}
