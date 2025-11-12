import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
}

const pageVariants = {
  initial: {
    opacity: 0,
    x: 100, // Start 100px to the right
    scale: 0.98, // Start slightly smaller
  },
  animate: {
    opacity: 1,
    x: 0, // Slide into original position
    scale: 1,
  },
  exit: {
    opacity: 0,
    x: -100, // Slide out to the left
    scale: 0.98,
  },
};

const PageTransition = ({ children }: PageTransitionProps) => {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={{
        type: "tween",
        duration: 0.4,
      }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
