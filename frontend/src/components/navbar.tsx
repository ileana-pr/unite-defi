import { useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import WalletConnect from "./WalletConnect"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-lg bg-slate-950/80 border-b border-slate-800">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600"></div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
            1inch Aptos Bridge
          </span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="#how-it-works" className="text-slate-300 hover:text-white transition-colors">
            How It Works
          </Link>
          <Link to="#features" className="text-slate-300 hover:text-white transition-colors">
            Features
          </Link>
          <Link to="#comparison" className="text-slate-300 hover:text-white transition-colors">
            Why Us
          </Link>
          <WalletConnect />
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
            <Link
              to="#how-it-works"
              className="text-slate-300 hover:text-white transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              How It Works
            </Link>
            <Link
              to="#features"
              className="text-slate-300 hover:text-white transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              to="#comparison"
              className="text-slate-300 hover:text-white transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Why Us
            </Link>
            <WalletConnect />
          </div>
        </div>
      )}
    </nav>
  )
}
