"use client"
import { motion } from "framer-motion"

const Loader = () => {
  return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-[9999]">
      <motion.div
        className="relative w-28 h-28 flex items-center justify-center"
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1, 1.1, 1] }}
        transition={{ duration: 1, ease: "easeInOut", repeat: Infinity }}
      >
        {/* Outer rotating ring */}
        <motion.div
          className="absolute w-28 h-28 border-4 border-transparent border-t-green-400 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />

        {/* Middle rotating ring (reverse direction) */}
        <motion.div
          className="absolute w-20 h-20 border-4 border-transparent border-b-green-600 rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />

        {/* Inner glowing dot */}
        <motion.div
          className="w-5 h-5 bg-green-500 rounded-full shadow-lg shadow-green-400"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [1, 0.7, 1],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>
    </div>
  )
}

export default Loader