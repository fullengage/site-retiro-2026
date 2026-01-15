import { Play } from 'lucide-react'
import { motion } from 'framer-motion'

const Hero = () => (
    <section className="pt-24 pb-12 bg-holi-surface relative overflow-hidden"
        style={{ backgroundImage: 'linear-gradient(to bottom, transparent, rgba(10,5,15,0.8))' }}>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-holi-primary via-holi-secondary to-holi-accent"></div>
        <div className="absolute inset-0 bg-noise opacity-10 pointer-events-none"></div>
        <div className="absolute -left-20 top-20 w-64 h-64 bg-holi-primary/20 rounded-full blur-[80px]"></div>

        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-black mb-10 uppercase tracking-tighter flex flex-col md:flex-row items-center justify-center gap-4 neon-glow">
                <span className="text-white">Você está pronto?</span>
            </h2>

            <div className="relative mx-auto w-full max-w-2xl transform hover:scale-[1.01] transition-transform duration-700">
                {/* Vintage TV Antennas */}
                <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-32 z-0">
                    <div className="absolute bottom-0 left-[45%] w-1.5 h-48 bg-gradient-to-t from-yellow-900 to-yellow-600/50 origin-bottom -rotate-[35deg] rounded-full">
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-yellow-400 rounded-full blur-[1px] shadow-[0_0_8px_rgba(250,204,21,0.8)]"></div>
                    </div>
                    <div className="absolute bottom-0 right-[45%] w-1.5 h-48 bg-gradient-to-t from-yellow-900 to-yellow-600/50 origin-bottom rotate-[35deg] rounded-full">
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-yellow-400 rounded-full blur-[1px] shadow-[0_0_8px_rgba(250,204,21,0.8)]"></div>
                    </div>
                </div>

                {/* TV Body (Bronze/Wood Case) */}
                <div className="relative bg-gradient-to-br from-[#5D2906] via-[#8B4513] to-[#3D1A04] p-4 md:p-8 rounded-[3rem] shadow-[0_0_60px_rgba(0,0,0,0.8),inset_0_4px_8px_rgba(255,255,255,0.2),inset_0_-4px_8px_rgba(0,0,0,0.5)] z-10 border-b-8 border-black/40">
                    {/* Metallic Shine Highlight */}
                    <div className="absolute top-4 left-10 right-10 h-1 bg-white/20 blur-[2px] rounded-full"></div>

                    <div className="bg-[#1a1a1a] p-3 md:p-5 rounded-[2.5rem] flex flex-col md:flex-row gap-4 shadow-[inset_0_0_40px_rgba(0,0,0,1)] border-4 border-[#4D2405]">
                        {/* Screen with Bronze Bezel */}
                        <div className="relative flex-1 bg-black rounded-[2rem] overflow-hidden border-[10px] border-gradient-to-br from-[#733A0B] to-[#4D2405] shadow-[0_0_20px_rgba(0,0,0,0.8)]">
                            <div className="aspect-square relative group overflow-hidden">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <iframe
                                        className="w-full border-0"
                                        style={{ height: '177.77%', minWidth: '100%' }}
                                        src="https://www.youtube.com/embed/dx04vs-GShw?autoplay=0&controls=0&rel=0&modestbranding=1&vq=hd1080"
                                        title="YouTube video player"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            </div>
                        </div>

                        {/* Retro Controls */}
                        <div className="flex md:flex-col justify-between items-center md:w-28 bg-[#1a1a1a] rounded-3xl p-4 relative overflow-hidden">
                            <div className="hidden md:block mb-4 text-center w-full">
                                <span className="font-marker text-yellow-600/60 text-[10px] tracking-widest uppercase">Select-O-Matic</span>
                            </div>

                            <div className="flex md:flex-col gap-10 items-center justify-center">
                                {/* Large Tuning Knob 1 */}
                                <div className="relative group cursor-pointer">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#444] to-[#111] border-4 border-[#555] shadow-[0_10px_20px_rgba(0,0,0,0.6)] flex items-center justify-center group-hover:rotate-45 transition-transform duration-500">
                                        <div className="w-1.5 h-6 bg-yellow-600 rounded-full absolute top-2 shadow-[0_0_10px_rgba(202,138,4,0.4)]"></div>
                                        <div className="w-12 h-12 rounded-full border border-white/5 bg-transparent"></div>
                                    </div>
                                    <div className="absolute -inset-2 bg-yellow-500/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </div>

                                {/* Large Tuning Knob 2 */}
                                <div className="relative group cursor-pointer">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#444] to-[#111] border-4 border-[#555] shadow-[0_10px_20px_rgba(0,0,0,0.6)] flex items-center justify-center group-hover:-rotate-90 transition-transform duration-700">
                                        <div className="w-1.5 h-6 bg-yellow-600 rounded-full absolute bottom-2 shadow-[0_0_10px_rgba(202,138,4,0.4)]"></div>
                                        <div className="w-12 h-12 rounded-full border border-white/5 bg-transparent"></div>
                                    </div>
                                    <div className="absolute -inset-2 bg-yellow-500/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </div>
                            </div>

                            {/* Speaker Grill */}
                            <div className="hidden md:flex flex-col gap-2 w-full mt-12 px-2 opacity-60">
                                {[...Array(8)].map((_, i) => (
                                    <div key={i} className="h-[2px] w-full bg-black shadow-[0_1px_rgba(255,255,255,0.05)]"></div>
                                ))}
                            </div>
                        </div>
                    </div>
                    {/* Glowing Power LED */}
                    <div className="absolute bottom-8 right-16 w-3 h-3 rounded-full bg-red-600 shadow-[0_0_15px_rgba(220,38,38,1)] z-30 animate-pulse border border-red-400/50"></div>
                </div>

                {/* Heavy Wooden Legs */}
                <div className="relative h-10 w-full max-w-[85%] mx-auto -mt-4 z-0 flex justify-between px-12">
                    <div className="w-20 h-full bg-[#3D1A04] transform skew-x-[20deg] rounded-b-xl border-b-8 border-black/60 shadow-2xl"></div>
                    <div className="w-20 h-full bg-[#3D1A04] transform -skew-x-[20deg] rounded-b-xl border-b-8 border-black/60 shadow-2xl"></div>
                </div>
            </div>
        </div>
        <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-holi-dark to-transparent z-20 pointer-events-none"></div>
    </section>
)

export default Hero
