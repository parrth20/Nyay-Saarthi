import { Card, CardContent } from "@/components/ui/card"
import { Upload, Brain, FileCheck, Download } from "lucide-react"

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
]

export function HowItWorks() {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-balance mb-4">
            <span className="text-primary">कैसे काम करता है</span> हमारा सिस्टम?
          </h2>
          <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
            सिर्फ 4 आसान चरणों में अपने कानूनी दस्तावेज़ों को समझें। कोई तकनीकी ज्ञान की आवश्यकता नहीं।
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <Card key={index} className="relative border-0 shadow-sm hover:shadow-md transition-shadow">
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
          ))}
        </div>

        {/* Process Flow Visualization */}
        <div className="mt-16 relative">
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-border transform -translate-y-1/2"></div>
          <div className="flex justify-between items-center relative z-10">
            {steps.map((_, index) => (
              <div key={index} className="w-4 h-4 bg-primary rounded-full"></div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
