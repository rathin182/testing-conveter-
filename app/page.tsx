"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Engineer = {
  id: string;
  name: string;
  email: string;
};

export default function Home() {
  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEngineers = async () => {
    try {
      const res = await fetch("/api/test");

      if (!res.ok) {
        throw new Error("Failed to fetch engineers");
      }

      const data = await res.json();

      console.log(data);

      // IMPORTANT FIX
      setEngineers(data.engineers);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEngineers();
  }, []);

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col gap-10 py-20 px-16 bg-white dark:bg-black">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />

        <div>
          <h1 className="text-3xl font-bold mb-4">Engineers</h1>

          {loading ? (
            <p>Loading...</p>
          ) : (
            <ul className="space-y-2">
              {engineers.map((engineer) => (
                <li
                  key={engineer.id}
                  className="p-4 rounded bg-blue-500 text-white"
                >
                  <p className="font-semibold">{engineer.name}</p>
                  <p className="text-sm">{engineer.email}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}