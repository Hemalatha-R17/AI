import { animate } from "framer-motion";
import { useEffect, useState } from "react";

export default function useCountUp(target) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const numericTarget = Number(target) || 0;
    const controls = animate(0, numericTarget, {
      duration: 0.6,
      ease: "easeOut",
      onUpdate: (v) => setValue(Math.round(v)),
    });
    return () => controls.stop();
  }, [target]);

  return value;
}
