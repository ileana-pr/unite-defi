import { motion } from "framer-motion"
import { Check, X } from "lucide-react"

export default function ComparisonSection() {
  const features = [
    "Atomic Swap Guarantees",
    "DeFi Limit Orders",
    "Sub-second Finality",
    "No Centralized Custodian",
    "Gas Optimization",
    "Multi-wallet Support",
  ]

  return (
    <section id="comparison" className="py-20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 right-1/3 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold mb-6"
          >
            How We're Different
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl text-slate-300"
          >
            1inch Aptos Fusion Bridge vs. Traditional Bridges
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="overflow-x-auto"
        >
          <table className="w-full min-w-[768px] border-collapse">
            <thead>
              <tr>
                <th className="p-4 text-left"></th>
                <th className="p-4 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center mb-2">
                      <span className="font-bold text-white">1i</span>
                    </div>
                    <span className="font-bold">1inch Aptos Bridge</span>
                  </div>
                </th>
                <th className="p-4 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center mb-2">
                      <span className="font-bold">W</span>
                    </div>
                    <span className="font-bold">Wormhole</span>
                  </div>
                </th>
                <th className="p-4 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center mb-2">
                      <span className="font-bold">L</span>
                    </div>
                    <span className="font-bold">LayerZero</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {features.map((feature, index) => (
                <tr key={index} className={index % 2 === 0 ? "bg-slate-800/30" : ""}>
                  <td className="p-4 border-t border-slate-700">{feature}</td>
                  <td className="p-4 text-center border-t border-slate-700">
                    <Check className="w-6 h-6 text-cyan-400 mx-auto" />
                  </td>
                  <td className="p-4 text-center border-t border-slate-700">
                    {feature === "No Centralized Custodian" ? (
                      <Check className="w-6 h-6 text-slate-400 mx-auto" />
                    ) : (
                      <X className="w-6 h-6 text-slate-400 mx-auto" />
                    )}
                  </td>
                  <td className="p-4 text-center border-t border-slate-700">
                    {feature === "No Centralized Custodian" || feature === "Multi-wallet Support" ? (
                      <Check className="w-6 h-6 text-slate-400 mx-auto" />
                    ) : (
                      <X className="w-6 h-6 text-slate-400 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 text-center"
        >
          <p className="text-slate-300 max-w-2xl mx-auto">
            Unlike basic bridges like Wormhole or LayerZero, 1inch Aptos Fusion Bridge supports advanced DeFi operations
            while eliminating counterparty risk through atomic swap guarantees.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
