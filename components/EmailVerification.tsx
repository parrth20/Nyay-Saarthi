"use client"

import { motion } from "framer-motion"
import { Mail, Sparkles } from "lucide-react"

export default function EmailVerificationPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#f0fdf4] via-[#dcfce7] to-[#bbf7d0] text-[#1f2937]">
      {/* Floating gradient blobs */}
      <motion.div
        className="absolute top-10 left-10 w-72 h-72 bg-[#16a34a]/15 rounded-full blur-3xl"
        animate={{ y: [0, 40, 0], x: [0, 30, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-10 right-10 w-80 h-80 bg-[#10b981]/15 rounded-full blur-3xl"
        animate={{ y: [0, -40, 0], x: [0, -30, 0] }}
        transition={{ duration: 12, repeat: Infinity }}
      />

      {/* Main card */}
      <motion.div
        className="relative z-10 max-w-md w-full bg-[#ffffff]/80 backdrop-blur-2xl p-10 rounded-3xl border border-[#d1fae5] text-center shadow-2xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Icon */}
        <motion.div className="flex justify-center mb-8" variants={itemVariants}>
          <motion.div
            className="w-24 h-24 bg-gradient-to-br from-[#16a34a] to-[#10b981] rounded-full flex items-center justify-center shadow-lg"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1], rotate: [0, 10, 0] }}
            transition={{ duration: 1 }}
          >
            <Mail className="w-12 h-12 text-white drop-shadow-lg" />
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-3xl font-extrabold mb-4 text-[#15803d] drop-shadow-sm"
          variants={itemVariants}
        >
          Verify Your Email
        </motion.h1>

        {/* Description */}
        <motion.p
          className="text-lg text-[#6b7280] mb-6 leading-relaxed"
          variants={itemVariants}
        >
          We’ve sent a verification link to your email address.  
          <br />Please check your inbox and verify your account to continue.
        </motion.p>

        {/* Animated note */}
        <motion.div variants={itemVariants}>
          <div className="flex justify-center items-center gap-2 text-[#16a34a] animate-pulse">
            <Sparkles className="w-5 h-5" />
            <span>Waiting for your confirmation...</span>
          </div>
        </motion.div>

      </motion.div>
    </div>
  )
}
