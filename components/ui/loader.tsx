"use client";

import { cn } from "@/lib/utils";
import dynamic from 'next/dynamic';

const GridLoader = dynamic(
  () => import('react-spinners').then(lib => lib.GridLoader),
  { ssr: false }
);

interface LoaderProps {
  className?: string;
  text?: string;
}

export function Loader({ className, text }: LoaderProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 bg-white bg-opacity-80 flex flex-col items-center justify-center z-50",
        className
      )}
    >
      <GridLoader color="#22c55e" size={15} margin={2} />
      {text && <p className="text-gray-600 mt-6 text-lg font-medium">{text}</p>}
    </div>
  );
}