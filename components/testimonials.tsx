import { Card, CardContent } from "@/components/ui/card"
import { Star, Quote } from "lucide-react"

const testimonials = [
  {
    name: "राज कुमार",
    role: "छोटे व्यापारी",
    content: "इस टूल ने मेरे व्यापारिक अनुबंधों को समझने में बहुत मदद की। अब मैं बिना वकील के भी मुख्य बातें समझ सकता हूं।",
    rating: 5,
    avatar: "/indian-businessman.png",
  },
  {
    name: "प्रिया शर्मा",
    role: "गृहिणी",
    content: "घर खरीदते समय जटिल कागजात को समझना मुश्किल था। यह AI टूल बहुत सहायक रहा और सब कुछ सरल भाषा में समझाया।",
    rating: 5,
    avatar: "/serene-indian-woman.png",
  },
  {
    name: "अमित पटेल",
    role: "IT प्रोफेशनल",
    content: "कंपनी के कानूनी दस्तावेज़ों को समझने के लिए यह बेहतरीन है। समय की बचत और सटीक जानकारी मिलती है।",
    rating: 5,
    avatar: "/indian-it-professional.jpg",
  },
]

export function Testimonials() {
  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-balance mb-4">
            <span className="text-primary">उपयोगकर्ताओं</span> का अनुभव
          </h2>
          <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
            हजारों लोग हमारे AI टूल का उपयोग करके अपने कानूनी दस्तावेज़ों को आसानी से समझ रहे हैं।
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                <div className="relative mb-6">
                  <Quote className="w-8 h-8 text-primary/20 absolute -top-2 -left-2" />
                  <p className="text-muted-foreground leading-relaxed pl-6">"{testimonial.content}"</p>
                </div>

                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.avatar || "/placeholder.svg"}
                    alt={testimonial.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
