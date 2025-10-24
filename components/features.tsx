// components/features.tsx
"use client"; // Required for Framer Motion client components

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, MessageSquare, AlertTriangle, Clock, Shield, Languages } from "lucide-react";
import { motion } from "framer-motion"; // Import motion

const features = [
  {
    icon: FileText,
    title: "सरल सारांश",
    description: "जटिल कानूनी भाषा को आसान हिंदी में बदलें। मुख्य बिंदुओं को तुरंत समझें।",
    color: "text-blue-600",
  },
  {
    icon: AlertTriangle,
    title: "जोखिम चेतावनी",
    description: "महत्वपूर्ण खंड, जोखिम और वित्तीय दायित्वों को स्पष्ट रूप से हाइलाइट करें।",
    color: "text-orange-600",
  },
  {
    icon: MessageSquare,
    title: "प्रश्न-उत्तर",
    description: "दस्तावेज़ के बारे में कोई भी प्रश्न पूछें और तुरंत उत्तर पाएं।",
    color: "text-green-600",
  },
  {
    icon: Clock,
    title: "महत्वपूर्ण तारीखें",
    description: "समय सीमा, नवीकरण तिथियां और महत्वपूर्ण मील के पत्थर को ट्रैक करें।",
    color: "text-purple-600",
  },
  {
    icon: Shield,
    title: "डेटा सुरक्षा",
    description: "आपके दस्तावेज़ पूर्ण सुरक्षा और गोपनीयता के साथ संसाधित होते हैं।",
    color: "text-red-600",
  },
  {
    icon: Languages,
    title: "बहुभाषी समर्थन",
    description: "हिंदी, अंग्रेजी और अन्य भारतीय भाषाओं में दस्तावेज़ समझें।",
    color: "text-indigo-600",
  },
];

// Animation variants for staggering children
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Delay between each card animating in
      delayChildren: 0.2, // Small delay before children start animating
    },
  },
};

// Animation variants for individual items
const itemVariants = {
  hidden: { opacity: 0, y: 30 }, // Start slightly down and faded out
  visible: {
    opacity: 1,
    y: 0,
    transition: { // Nested transition object is correct here
      duration: 0.6,
      ease: "easeOut", // Standard easing function name
    },
  },
};


export function Features() {
  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          {/* Animate the header text too */}
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-balance mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5 }}
          >
            क्यों चुनें हमारा <span className="text-primary">AI समाधान</span>?
          </motion.h2>
          <motion.p
            className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            कानूनी दस्तावेज़ों को समझना अब आसान। हमारी उन्नत तकनीक आपको सटीक और विश्वसनीय जानकारी देती है।
          </motion.p>
        </div>

        {/* Wrap the grid in a motion.div */}
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible" // Trigger animation when in view
          viewport={{ once: true, amount: 0.2 }} // Trigger once, when 20% is visible
        >
          {features.map((feature, index) => (
            // Wrap each Card in a motion.div
            <motion.div key={index} variants={itemVariants} className="h-full"> {/* Ensure motion div takes full height */}
              <Card className="border-0 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full flex flex-col"> {/* Added h-full and flex */}
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg bg-background flex items-center justify-center mb-4`}>
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow"> {/* Allow content to grow */}
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}