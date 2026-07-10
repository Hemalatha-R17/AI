import { motion } from "framer-motion";

export default function Spinner() {
  return (
    <motion.span
      className="spinner"
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
    />
  );
}
