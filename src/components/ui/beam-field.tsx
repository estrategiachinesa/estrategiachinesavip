'use client';

import { motion } from "framer-motion";

export function BeamField() {
  return (
    <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden rounded-xl border border-white/5 bg-transparent">
      {/* Light grid lines overlaid subtly */}
      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      {/* Vertical scanning line (azul - blue) */}
      <motion.div 
        className="absolute top-0 bottom-0 w-[3px] bg-gradient-to-b from-transparent via-blue-500 to-transparent shadow-[0_0_15px_rgba(59,130,246,0.6)]" 
        animate={{ left: ["5%", "95%", "45%", "5%"] }} 
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} 
      />

      {/* Top Horizontal scanning line (vermelha - red) */}
      <motion.div 
        className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_10px_rgba(239,68,68,0.5)]"
        animate={{ top: ["5%", "48%", "20%", "5%"] }} 
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} 
      />

      {/* Bottom Horizontal scanning line (verde - green) */}
      <motion.div 
        className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-green-500 to-transparent shadow-[0_0_10px_rgba(34,197,94,0.5)]"
        animate={{ top: ["52%", "95%", "70%", "52%"] }} 
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} 
      />
    </div>
  );
}

export default BeamField;
