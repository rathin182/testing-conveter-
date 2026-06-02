export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-6xl font-bold">404</h1>

      <p className="mt-4 text-gray-500">
        Page not found
      </p>

      <a
        href="/"
        className="mt-6 px-4 py-2 bg-[#FFAE58] text-white rounded-lg"
      >
        Go Home
      </a>
    </div>
  );
}