// components/Loader.tsx
"use client";
import { motion } from "framer-motion";
import { Scale } from "lucide-react"; // Use the Scale icon from Lucide

const Loader = () => {
  return (
    // Use a semi-transparent background with blur
    <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-[9999]">
      <motion.div
        className="relative flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Breathing Scale Icon */}
        <motion.div
          animate={{
            scale: [1, 1.08, 1], // Subtle scale pulse
            filter: [ // Add a slight brightness/glow effect
              "brightness(1) drop-shadow(0 0 3px oklch(var(--primary) / 0.4))",
              "brightness(1.2) drop-shadow(0 0 8px oklch(var(--primary) / 0.6))",
              "brightness(1) drop-shadow(0 0 3px oklch(var(--primary) / 0.4))",
            ],
          }}
          transition={{
            duration: 2.0, // Slower, more calming duration
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* Use primary color directly via className */}
          <Scale className="h-16 w-16 text-primary" />
        </motion.div>

        {/* Fading text indicator IN HINDI */}
        <motion.p
          className="absolute top-full mt-4 text-sm font-medium text-primary/80"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2.0, repeat: Infinity, ease: "easeInOut" }}
        >
          संसाधित हो रहा है... {/* <-- Changed text to Hindi */}
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Loader;