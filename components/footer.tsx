import { Button } from "@/components/ui/button"
import { Shield, Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-card border-t">
      <div className="container mx-auto max-w-6xl px-4 py-16">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">कानूनी सरलीकरण</span>
            </div>
            <p className="text-muted-foreground mb-6 max-w-md">
              जटिल कानूनी दस्तावेज़ों को सरल भाषा में समझने का सबसे भरोसेमंद AI समाधान। आपकी गोपनीयता और सुरक्षा हमारी प्राथमिकता है।
            </p>
            <div className="flex gap-4">
              <Button size="sm">अभी शुरू करें</Button>
              <Button variant="outline" size="sm">
                और जानें
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">त्वरित लिंक</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  होम
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  सुविधाएं
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  कैसे काम करता है
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  मूल्य निर्धारण
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  सहायता
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">संपर्क</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>support@legalsimplifier.in</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>मुंबई, भारत</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">© 2024 कानूनी सरलीकरण। सभी अधिकार सुरक्षित।</div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">
              गोपनीयता नीति
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              सेवा की शर्तें
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              कुकी नीति
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
