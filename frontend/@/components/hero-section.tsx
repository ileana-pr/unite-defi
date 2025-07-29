"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, CheckCircle } from "lucide-react"
import { motion } from "framer-motion"

export default function HeroSection() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setSubmitted(true)
      // Here you would typically send the email to your backend
      setEmail("")
      setTimeout(() => setSubmitted(false), 3000)
    }
  }

  return (
    <section className="relative pt-20 pb-32 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-block mb-6 px-4 py-1.5 bg-gradient-to-r from-cyan-500/10 to-blue-600/10 rounded-full backdrop-blur-sm border border-cyan-500/20"
          >
            <span className="text-cyan-400 font-medium">Introducing 1inch Aptos Fusion Bridge</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300"
          >
            Unlock Ethereum's DeFi power on Aptos
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto"
          >
            Instantly bridge and swap ETH, USDC, USDT, and more — enjoy DeFi limit orders and atomic security, all in
            one unified platform.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white text-lg px-8 py-6 h-auto">
              Get Early Access
            </Button>
            <Button
              variant="outline"
              className="border-slate-700 text-white hover:bg-slate-800 text-lg px-8 py-6 h-auto bg-transparent"
            >
              Learn More
            </Button>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            onSubmit={handleSubmit}
            className="max-w-md mx-auto"
          >
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter your email for updates"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-400"
                required
              />
              <Button type="submit" className="bg-cyan-500 hover:bg-cyan-600 text-white">
                {submitted ? <CheckCircle size={18} /> : <ArrowRight size={18} />}
              </Button>
            </div>
            {submitted && <p className="text-cyan-400 text-sm mt-2">Thanks! We'll keep you updated.</p>}
          </motion.form>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="relative mx-auto mt-16 max-w-5xl"
        >
          <div className="aspect-[16/9] rounded-xl overflow-hidden border border-slate-800 shadow-2xl shadow-cyan-500/10">
            <div className="w-full h-full bg-slate-800 flex items-center justify-center">
              <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-800 p-8 flex items-center justify-center">
                <div className="w-full max-w-3xl">
                  <div className="bg-slate-900 rounded-xl border border-slate-700 p-6 shadow-lg">
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600"></div>
                        <span className="font-medium text-white">1inch Aptos Bridge</span>
                      </div>
                      <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                        <div className="flex justify-between mb-2">
                          <span className="text-slate-400">From</span>
                          <span className="text-slate-400">Ethereum</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xl font-medium">10 ETH</span>
                          <div className="flex items-center gap-1">
                            <div className="w-4 h-4 rounded-full bg-slate-600"></div>
                            <span>ETH</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                        <div className="flex justify-between mb-2">
                          <span className="text-slate-400">To</span>
                          <span className="text-slate-400">Aptos</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xl font-medium">10 ETH</span>
                          <div className="flex items-center gap-1">
                            <div className="w-4 h-4 rounded-full bg-slate-600"></div>
                            <span>ETH</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-center py-3 rounded-lg font-medium">
                      Bridge Assets
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-2 rounded-full text-white font-medium shadow-lg">
            Secure • Atomic • Fast
          </div>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-8 mt-20">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-slate-700"></div>
            <span className="text-slate-300">Ethereum</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-slate-700"></div>
            <span className="text-slate-300">Aptos</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-slate-700"></div>
            <span className="text-slate-300">1inch</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-slate-700"></div>
            <span className="text-slate-300">USDC</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-slate-700"></div>
            <span className="text-slate-300">USDT</span>
          </div>
        </div>
      </div>
    </section>
  )
}
