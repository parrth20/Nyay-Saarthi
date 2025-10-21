// "use client"

import { Hero } from "@/components/hero"
import { Features } from "@/components/features"
import { HowItWorks } from "@/components/how-it-works"
import { Testimonials } from "@/components/testimonials"
import { Footer } from "@/components/footer"
import {Header} from "@/components/header"

export default function HomePage() {
  return (
    <div
      className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50"
      data-scroll-section
    >
      <main className="pt-20">
        
       
        <section data-scroll data-scroll-speed="1">
          <Hero />
        </section>

        <section data-scroll data-scroll-speed="1.5">
          <Features />
        </section>

        <section data-scroll data-scroll-speed="2">
          <HowItWorks />
        </section>

        <section data-scroll data-scroll-speed="1">
          <Testimonials />
        </section>

        <section data-scroll data-scroll-speed="1">
          <Footer />
        </section>
      </main>
    </div>
  )
}
