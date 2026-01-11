import { Play } from 'lucide-react'
import { motion } from 'framer-motion'

const Hero = () => (
    <section className="pt-32 pb-20 bg-holi-surface relative overflow-hidden"
        style={{ backgroundImage: 'linear-gradient(to bottom, transparent, rgba(10,5,15,0.8))' }}>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-holi-primary via-holi-secondary to-holi-accent"></div>
        <div className="absolute inset-0 bg-noise opacity-10 pointer-events-none"></div>
        <div className="absolute -left-20 top-20 w-64 h-64 bg-holi-primary/20 rounded-full blur-[80px]"></div>

        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
            <h2 className="text-4xl md:text-6xl font-black mb-16 uppercase tracking-tighter flex flex-col md:flex-row items-center justify-center gap-4 neon-glow">
                <span className="text-white">Você está pronto?</span>
            </h2>

            <div className="relative mx-auto w-full max-w-4xl transform hover:scale-[1.02] transition-transform duration-500">
                {/* TV Antennas */}
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-24 z-0 opacity-0 md:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-1/2 w-1.5 h-32 bg-gradient-to-t from-gray-700 to-gray-400 origin-bottom -rotate-[25deg] rounded-full shadow-lg">
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-300 rounded-full shadow-[0_0_10px_white]"></div>
                    </div>
                    <div className="absolute bottom-0 left-1/2 w-1.5 h-32 bg-gradient-to-t from-gray-700 to-gray-400 origin-bottom rotate-[25deg] rounded-full shadow-lg">
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-300 rounded-full shadow-[0_0_10px_white]"></div>
                    </div>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-8 bg-[#252525] rounded-t-2xl"></div>
                </div>

                {/* TV Body */}
                <div className="relative bg-[#252525] p-4 md:p-8 rounded-[2.5rem] shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_25px_50px_-12px_rgba(0,0,0,0.7)] z-10">
                    <div className="absolute inset-0 rounded-[2.5rem] shadow-[inset_0_2px_4px_rgba(255,255,255,0.1),inset_0_-4px_6px_rgba(0,0,0,0.5)] pointer-events-none"></div>

                    <div className="bg-[#1a1a1a] p-3 md:p-5 rounded-[2rem] flex flex-col md:flex-row gap-6 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] border-b border-white/5">
                        {/* Screen */}
                        <div className="relative flex-1 bg-black rounded-[1.5rem] overflow-hidden shadow-[inset_0_0_30px_rgba(0,0,0,1)] border-[6px] border-[#222]">
                            <div className="absolute inset-0 z-20 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none rounded-[1.2rem]"></div>
                            <div className="absolute inset-0 z-10 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,6px_100%]"></div>

                            <div className="aspect-video relative group">
                                <div className="absolute inset-0 bg-[url('https://media.giphy.com/media/3o7aD2saalBwwftBIY/giphy.gif')] opacity-10 pointer-events-none mix-blend-overlay"></div>
                                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBub9KoKpI9ePtmS-i9xBiR0NvduIfo4fzCjK12GKWUclvwfUzY0Io2om6Hzr6V5gKDSPpR8pjx1vyL2mS_8RCqbYV35kgfJQhUbw7VMYZ88Jwr4LbJf1myyftQaUGydGeb2MVjvHZd6ezB9v_a0g9-x6a-UwflOKxH9XrZ-wlDRpsIudtvGm6zfc2zRoql1j_yxc6VCeQ9GVNvKMc7IGBc6fbG03pP75e0eByJEWxYvqlnGoiCC3Lr8iUAyvJ-Nad4jMnthdrD4MGm" alt="Thumbnail" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500 saturate-[1.1] contrast-[1.1]" />

                                <button className="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 z-30">
                                    <div className="w-20 h-20 bg-gradient-to-br from-holi-primary/90 to-purple-900/90 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40 shadow-[0_0_30px_rgba(217,70,239,0.6)] group-hover:shadow-[0_0_50px_rgba(217,70,239,0.8)] transition-all">
                                        <Play className="text-white fill-current ml-1" size={32} />
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex md:flex-col justify-between items-center md:w-24 bg-[#111] rounded-2xl p-4 border border-white/5 shadow-[inset_0_0_15px_rgba(0,0,0,0.8)] relative overflow-hidden">
                            <div className="hidden md:block mb-4 text-center w-full border-b border-white/10 pb-2">
                                <span className="font-marker text-holi-secondary text-xs tracking-wider opacity-80">HOLI TV</span>
                            </div>
                            <div className="flex md:flex-col gap-5 items-center justify-center">
                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#2a2a2a] to-[#111] border-2 border-[#333] shadow-[0_4px_8px_rgba(0,0,0,0.6)] flex items-center justify-center relative group cursor-pointer hover:border-holi-primary transition-colors">
                                    <div className="w-1.5 h-5 bg-[#444] rounded-full absolute top-1.5 shadow-sm group-hover:bg-holi-primary/50"></div>
                                    <span className="text-[8px] font-bold text-gray-600 absolute bottom-1.5">VOL</span>
                                </div>
                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#2a2a2a] to-[#111] border-2 border-[#333] shadow-[0_4px_8px_rgba(0,0,0,0.6)] flex items-center justify-center relative group cursor-pointer hover:border-holi-accent transition-colors">
                                    <div className="w-1.5 h-5 bg-[#444] rounded-full absolute bottom-1.5 right-3 rotate-45 shadow-sm group-hover:bg-holi-accent/50"></div>
                                    <span className="text-[8px] font-bold text-gray-600 absolute top-1.5">CH</span>
                                </div>
                            </div>
                            <div className="flex-1 flex flex-row md:flex-col gap-1.5 justify-center md:justify-end md:mt-auto w-full px-2 opacity-40">
                                <div className="w-1 md:w-full h-8 md:h-1 bg-black rounded-full border border-[#333]"></div>
                                <div className="w-1 md:w-full h-8 md:h-1 bg-black rounded-full border border-[#333]"></div>
                                <div className="w-1 md:w-full h-8 md:h-1 bg-black rounded-full border border-[#333]"></div>
                            </div>
                        </div>
                    </div>
                    {/* Power LED */}
                    <div className="absolute bottom-6 md:bottom-10 md:left-14 left-8 w-2 h-2 rounded-full bg-red-600 shadow-[0_0_8px_rgba(239,68,68,0.8)] z-30 animate-pulse"></div>
                </div>

                {/* TV Legs */}
                <div className="relative h-6 md:h-8 w-full max-w-[80%] mx-auto -mt-2 z-0 flex justify-between px-8">
                    <div className="w-12 md:w-16 h-full bg-[#1f1f1f] transform skew-x-[15deg] rounded-b-lg border-b-4 border-[#111] shadow-lg"></div>
                    <div className="w-12 md:w-16 h-full bg-[#1f1f1f] transform -skew-x-[15deg] rounded-b-lg border-b-4 border-[#111] shadow-lg"></div>
                </div>
            </div>
        </div>
        <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-holi-dark to-transparent z-20 pointer-events-none"></div>
    </section>
)

export default Hero
