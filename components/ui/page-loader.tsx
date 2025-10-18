"use client";

import dynamic from 'next/dynamic';

// Dynamically import the loader with SSR turned off
const GridLoader = dynamic(
  () => import('react-spinners').then(lib => lib.GridLoader),
  { ssr: false }
);

export function PageLoader() {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-75 flex flex-col items-center justify-center z-[9999]">
      <GridLoader color="#22c55e" size={15} margin={2} />
    </div>
  );
}