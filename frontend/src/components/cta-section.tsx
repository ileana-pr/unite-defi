

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle } from "lucide-react"

export default function CtaSection() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    organization: "",
    message: "",
  })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the form data to your backend
    setSubmitted(true)
    setFormState({
      name: "",
      email: "",
      organization: "",
      message: "",
    })
    setTimeout(() => setSubmitted(false), 5000)
  }

  return (
    <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-950">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Bridge the Future of DeFi?</h2>
              <p className="text-xl text-slate-300 mb-8">
                Get early access to 1inch Aptos Fusion Bridge and be among the first to experience seamless cross-chain
                DeFi.
              </p>

              <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6 mb-8">
                <h3 className="text-xl font-semibold mb-4">What You'll Get:</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-4 h-4 text-cyan-400" />
                    </div>
                    <span>Priority access to the bridge platform</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-4 h-4 text-cyan-400" />
                    </div>
                    <span>Exclusive developer documentation and SDK access</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-4 h-4 text-cyan-400" />
                    </div>
                    <span>Reduced fees for early adopters</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-4 h-4 text-cyan-400" />
                    </div>
                    <span>Direct support from our engineering team</span>
                  </li>
                </ul>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-slate-700"></div>
                </div>
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-slate-700"></div>
                </div>
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-slate-700"></div>
                </div>
                <span className="text-slate-400">+ 20 more projects already onboarded</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl"></div>

                <div className="relative z-10">
                  <h3 className="text-xl font-semibold mb-6">Get Early Access</h3>

                  {submitted ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center mb-4">
                        <CheckCircle className="w-8 h-8 text-cyan-400" />
                      </div>
                      <h4 className="text-xl font-medium mb-2">Request Submitted!</h4>
                      <p className="text-slate-300 text-center">
                        Thank you for your interest. Our team will contact you shortly with next steps.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit}>
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium mb-1">
                            Name
                          </label>
                          <Input
                            id="name"
                            name="name"
                            value={formState.name}
                            onChange={handleChange}
                            className="bg-slate-800/50 border-slate-700 text-white"
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor="email" className="block text-sm font-medium mb-1">
                            Email
                          </label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formState.email}
                            onChange={handleChange}
                            className="bg-slate-800/50 border-slate-700 text-white"
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor="organization" className="block text-sm font-medium mb-1">
                            Organization (Optional)
                          </label>
                          <Input
                            id="organization"
                            name="organization"
                            value={formState.organization}
                            onChange={handleChange}
                            className="bg-slate-800/50 border-slate-700 text-white"
                          />
                        </div>

                        <div>
                          <label htmlFor="message" className="block text-sm font-medium mb-1">
                            How do you plan to use the bridge? (Optional)
                          </label>
                          <Textarea
                            id="message"
                            name="message"
                            value={formState.message}
                            onChange={handleChange}
                            className="bg-slate-800/50 border-slate-700 text-white"
                            rows={4}
                          />
                        </div>

                        <Button
                          type="submit"
                          className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
                        >
                          Request Early Access
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
