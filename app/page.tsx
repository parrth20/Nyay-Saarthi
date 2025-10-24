// app/page.tsx
"use client"; // Add this line

import { Hero } from "@/components/hero";
import { Features } from "@/components/features";
import { HowItWorks } from "@/components/how-it-works";
import { Testimonials } from "@/components/testimonials";
import { Footer } from "@/components/footer";
import { motion } from "framer-motion"; // Import motion

// --- Define Animation Variants for Sections ---
const sectionVariants = {
  hidden: { opacity: 0, y: 50 }, // Start hidden, slightly down
  visible: {
    opacity: 1,
    y: 0, // Animate to visible, original position
    transition: {
      duration: 0.7, // Animation duration
      ease: "easeOut", // Animation easing
    },
  },
};
// --- End Animation Variants ---

export default function HomePage() {
  return (
    // Keep main container styles, remove data-scroll-section
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* pt-20 might be handled by layout, adjust if needed */}
      <main>
        {/* --- Wrap sections with motion.section --- */}
        {/* Hero section might have its own internal animations, adjust as needed */}
        <motion.section
          // Optional: You might want less aggressive animation for the hero
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }} // Trigger earlier if desired
          variants={sectionVariants}
          // transition={{ duration: 0.5, delay: 0.1 }} // Customize transition
        >
          <Hero />
        </motion.section>

        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }} // Trigger when 20% visible
          variants={sectionVariants}
        >
          {/* Features component will handle its internal animations */}
          <Features />
        </motion.section>

        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionVariants}
        >
          {/* HowItWorks component needs internal animations added */}
          <HowItWorks />
        </motion.section>

        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionVariants}
        >
          {/* Testimonials component needs internal animations added */}
          <Testimonials />
        </motion.section>

        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionVariants}
        >
          <Footer />
        </motion.section>
      </main>
    </div>
  );
}