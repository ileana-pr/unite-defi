import { Link } from "react-router-dom"
import { Github, Twitter, Linkedin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600"></div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                1inch Aptos Bridge
              </span>
            </div>
            <p className="text-slate-400 mb-4">
              Seamless, secure, bidirectional bridge enabling advanced 1inch Fusion+ swaps between Ethereum and Aptos.
            </p>
            <div className="flex gap-4">
              <Link to="#" className="text-slate-400 hover:text-white transition-colors">
                <Twitter size={20} />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link to="#" className="text-slate-400 hover:text-white transition-colors">
                <Github size={20} />
                <span className="sr-only">GitHub</span>
              </Link>
              <Link to="#" className="text-slate-400 hover:text-white transition-colors">
                <Linkedin size={20} />
                <span className="sr-only">LinkedIn</span>
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link to="#" className="text-slate-400 hover:text-white transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link to="#" className="text-slate-400 hover:text-white transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link to="#" className="text-slate-400 hover:text-white transition-colors">
                  API Reference
                </Link>
              </li>
              <li>
                <Link to="#" className="text-slate-400 hover:text-white transition-colors">
                  SDK
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link to="#" className="text-slate-400 hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="#" className="text-slate-400 hover:text-white transition-colors">
                  Community
                </Link>
              </li>
              <li>
                <Link to="#" className="text-slate-400 hover:text-white transition-colors">
                  Security
                </Link>
              </li>
              <li>
                <Link to="#" className="text-slate-400 hover:text-white transition-colors">
                  Roadmap
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link to="#" className="text-slate-400 hover:text-white transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="#" className="text-slate-400 hover:text-white transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="#" className="text-slate-400 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="#" className="text-slate-400 hover:text-white transition-colors">
                  Press Kit
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-slate-400 text-sm mb-4 md:mb-0">© 2025 1inch Aptos Fusion Bridge. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="#" className="text-slate-400 hover:text-white transition-colors text-sm">
              Privacy Policy
            </Link>
            <Link to="#" className="text-slate-400 hover:text-white transition-colors text-sm">
              Terms of Service
            </Link>
            <Link to="#" className="text-slate-400 hover:text-white transition-colors text-sm">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
