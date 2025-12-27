"use client";

export default function SkipLinks() {
  return (
    <div className="sr-only focus-within:not-sr-only">
      <a
        href="#main-content"
        className="absolute top-0 left-0 z-[9999] bg-primary text-white px-4 py-2 rounded-br-lg focus:outline-none focus:ring-2 focus:ring-white"
      >
        Skip to main content
      </a>
      <a
        href="#navigation"
        className="absolute top-0 left-32 z-[9999] bg-primary text-white px-4 py-2 rounded-br-lg focus:outline-none focus:ring-2 focus:ring-white"
      >
        Skip to navigation
      </a>
    </div>
  );
}
