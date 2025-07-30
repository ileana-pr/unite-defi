import { motion } from "framer-motion"
import { ShieldCheck, Zap, ArrowLeftRight, Wallet, Code, Clock } from "lucide-react"

export default function FeaturesSection() {
  const features = [
    {
      icon: <ShieldCheck className="w-6 h-6 text-cyan-400" />,
      title: "Atomic Swap Guarantees",
      description:
        "Eliminate counterparty risk with cryptographic guarantees that ensure transactions either complete fully or revert entirely.",
    },
    {
      icon: <Zap className="w-6 h-6 text-cyan-400" />,
      title: "Advanced DeFi Actions",
      description: "Support for limit orders, conditional swaps, and other advanced DeFi operations across chains.",
    },
    {
      icon: <ArrowLeftRight className="w-6 h-6 text-cyan-400" />,
      title: "Bidirectional Bridging",
      description: "Seamlessly move assets between Ethereum and Aptos in either direction with equal efficiency.",
    },
    {
      icon: <Wallet className="w-6 h-6 text-cyan-400" />,
      title: "Multi-Wallet Support",
      description: "Compatible with 1inch Wallet, Petra, and MetaMask for a flexible user experience.",
    },
    {
      icon: <Code className="w-6 h-6 text-cyan-400" />,
      title: "Move Module Integration",
      description: "Leverages Aptos Move modules for enhanced security and performance optimizations.",
    },
    {
      icon: <Clock className="w-6 h-6 text-cyan-400" />,
      title: "Sub-second Finality",
      description: "Experience near-instant transaction finality on Aptos with optimized gas usage.",
    },
  ]

  return (
    <section id="features" className="py-20 bg-slate-900/50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold mb-6"
          >
            Technical Features
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl text-slate-300"
          >
            Built with security, speed, and user experience as core principles
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-cyan-500/30 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-slate-300">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-16 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-8 relative overflow-hidden"
        >
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl"></div>

          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-4">Ready to integrate with your DeFi application?</h3>
              <p className="text-slate-300 mb-6">
                Our developer-friendly API and SDK make it easy to add cross-chain capabilities to your DeFi
                application.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 text-sm">
                  <code className="text-cyan-400">npm install @1inch/aptos-bridge</code>
                </div>
                <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 text-sm">
                  <code className="text-cyan-400">yarn add @1inch/aptos-bridge</code>
                </div>
              </div>
            </div>
            <div className="flex-shrink-0">
              <button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-medium">
                View Documentation
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
