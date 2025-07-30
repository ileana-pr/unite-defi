import { motion } from "framer-motion"
import { ArrowLeftRight, Shield, Zap, Workflow } from "lucide-react"

export default function SolutionSection() {
  return (
    <section id="how-it-works" className="py-20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl"></div>
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
            How 1inch Aptos Fusion Bridge Works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl text-slate-300"
          >
            Seamless, secure, bidirectional bridging with advanced DeFi capabilities
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-8 shadow-xl">
              <div className="relative">
                <div className="absolute -top-12 -left-12 w-24 h-24 bg-cyan-500/20 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-blue-600/20 rounded-full blur-2xl"></div>

                <div className="relative z-10 flex flex-col gap-8">
                  <div className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                    <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center">
                      <ArrowLeftRight className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Bidirectional Atomic Swaps</h3>
                      <p className="text-slate-300 text-sm">
                        Between Ethereum and Aptos using hashlock and timelock mechanisms
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                    <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center">
                      <Shield className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Secure Execution</h3>
                      <p className="text-slate-300 text-sm">
                        Integrates with 1inch Fusion+ and Move contracts for real-time on-chain proof
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                    <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center">
                      <Zap className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Sub-second Finality</h3>
                      <p className="text-slate-300 text-sm">
                        On Aptos with optimized gas and unified cross-chain interface
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                    <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center">
                      <Workflow className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Simple Web UI</h3>
                      <p className="text-slate-300 text-sm">
                        With real-time swap status and wallet integrations (1inch Wallet, Petra, MetaMask)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="aspect-[4/3] rounded-xl overflow-hidden border border-slate-700 shadow-xl">
              <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-800 p-6">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="text-xs text-slate-400">1inch Aptos Fusion Bridge</div>
                </div>

                <div className="flex flex-col gap-6">
                  <div className="flex justify-between">
                    <div className="flex flex-col">
                      <span className="text-sm text-slate-400">From</span>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-6 h-6 rounded-full bg-slate-700"></div>
                        <span>Ethereum</span>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-slate-400">To</span>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-6 h-6 rounded-full bg-slate-700"></div>
                        <span>Aptos</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                    <div className="flex justify-between mb-2">
                      <span className="text-slate-400">Asset</span>
                      <span className="text-slate-400">Amount</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-700"></div>
                        <span>ETH</span>
                      </div>
                      <span className="text-lg font-medium">10.0</span>
                    </div>
                  </div>

                  <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                    <div className="flex justify-between mb-2">
                      <span className="text-slate-400">Transaction Type</span>
                      <span className="text-slate-400">Fee</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span>Fusion+ Swap</span>
                      </div>
                      <span className="text-lg font-medium">0.1%</span>
                    </div>
                  </div>

                  <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-400">Status</span>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-green-500 text-sm">Atomic Guarantee</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-cyan-500 to-blue-600 h-full w-3/4"></div>
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-slate-400">
                      <span>Initiating</span>
                      <span>Locking</span>
                      <span>Finalizing</span>
                    </div>
                  </div>

                  <button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-center py-3 rounded-lg font-medium">
                    Confirm Bridge Transaction
                  </button>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-cyan-500/20 rounded-full blur-2xl"></div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
