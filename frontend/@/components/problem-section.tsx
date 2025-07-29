import { motion } from "framer-motion"
import { AlertTriangle, Clock, DollarSign, Lock } from "lucide-react"

export default function ProblemSection() {
  const problems = [
    {
      icon: <AlertTriangle className="w-10 h-10 text-amber-500" />,
      title: "Fragmented DeFi Liquidity",
      description:
        "Users miss out on Ethereum's deep liquidity pools when using Aptos applications, limiting trading opportunities and efficiency.",
    },
    {
      icon: <Clock className="w-10 h-10 text-amber-500" />,
      title: "Slow & Complex Bridging",
      description:
        "Manual bridging is time-consuming, expensive, and fails to support advanced DeFi actions like limit orders.",
    },
    {
      icon: <DollarSign className="w-10 h-10 text-amber-500" />,
      title: "High Costs & Fees",
      description:
        "Traditional bridges often involve multiple transactions and high gas fees, eating into your investment returns.",
    },
    {
      icon: <Lock className="w-10 h-10 text-amber-500" />,
      title: "Security Vulnerabilities",
      description:
        "Existing bridges risk loss of funds with no atomic swap guarantees and complex, multi-step user experiences.",
    },
  ]

  return (
    <section className="py-20 bg-slate-900/50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold mb-6"
          >
            The DeFi Bridge Problem
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl text-slate-300"
          >
            Cross-chain DeFi should be seamless, but current solutions fall short in security, speed, and functionality.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {problems.map((problem, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-cyan-500/30 transition-colors"
            >
              <div className="mb-4">{problem.icon}</div>
              <h3 className="text-xl font-semibold mb-3">{problem.title}</h3>
              <p className="text-slate-300">{problem.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
