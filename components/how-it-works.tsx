// components/how-it-works.tsx
"use client"; // Add this line

import { Card, CardContent } from "@/components/ui/card";
import { Upload, Brain, FileCheck, Download } from "lucide-react";
import { motion } from "framer-motion"; // Import motion

const steps = [
  {
    icon: Upload,
    title: "दस्तावेज़ अपलोड करें",
    description: "अपना कानूनी दस्तावेज़ (PDF, DOCX) सुरक्षित रूप से अपलोड करें।",
    step: "01",
  },
  {
    icon: Brain,
    title: "AI विश्लेषण",
    description: "हमारा उन्नत AI दस्तावेज़ का विश्लेषण करके मुख्य बिंदुओं को निकालता है।",
    step: "02",
  },
  {
    icon: FileCheck,
    title: "सरल सारांश",
    description: "जटिल कानूनी भाषा को आसान हिंदी में बदलकर प्रस्तुत करता है।",
    step: "03",
  },
  {
    icon: Download,
    title: "परिणाम डाउनलोड",
    description: "सरलीकृत दस्तावेज़ और मुख्य बिंदुओं की रिपोर्ट डाउनलोड करें।",
    step: "04",
  },
];

// --- Animation Variants (can reuse or define new ones) ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15, // Adjust stagger timing
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}
// --- End Animation Variants ---

export function HowItWorks() {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-balance mb-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            variants={textVariants}
          >
            <span className="text-primary">कैसे काम करता है</span> हमारा सिस्टम?
          </motion.h2>
          <motion.p
            className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            variants={textVariants}
            transition={{delay: 0.1}} // Add slight delay
          >
            सिर्फ 4 आसान चरणों में अपने कानूनी दस्तावेज़ों को समझें। कोई तकनीकी ज्ञान की आवश्यकता नहीं।
          </motion.p>
        </div>

        {/* Animate the grid container */}
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {steps.map((step, index) => (
            // Animate each card item
            <motion.div key={index} variants={itemVariants} className="h-full">
              <Card className="relative border-0 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full">
                <CardContent className="p-6 text-center">
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                      {step.step}
                    </div>
                  </div>

                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 mt-4">
                    <step.icon className="w-8 h-8 text-primary" />
                  </div>

                  <h3 className="text-lg font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Animate the process flow line */}
        <div className="mt-16 relative">
          <motion.div
            className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-border transform -translate-y-1/2 origin-left" // Added origin-left
            initial={{ scaleX: 0 }} // Animate scaleX instead of width
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }} // Added ease
          />
          <motion.div
            className="flex justify-between items-center relative z-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            transition={{ staggerChildren: 0.1, delayChildren: 0.8 }} // Stagger dots after line draws
          >
            {steps.map((_, index) => (
              <motion.div
                key={index}
                className="w-4 h-4 bg-primary rounded-full"
                variants={{ hidden: { scale: 0 }, visible: { scale: 1 } }}
                transition={{ duration: 0.4 }}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}