'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function SplashLoader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const hasSeen = sessionStorage.getItem('seenSplash');
    if (hasSeen) {
      setVisible(false);
      return;
    }

    const timer = setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem('seenSplash', 'true');
    }, 2500); // 2.5s cinematic intro

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="splash-overlay"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 1 }}
          }
        >
          <div className="splash-inner">
            <motion.img
              src="/light.png"
              alt="Sexorism Light Logo"
              className="splash-logo"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{
                scale: [0.8, 1.08, 1],
                opacity: [0, 1, 1],
              }}
              transition={{ duration: 2, ease: 'easeInOut' }}
            />

            <motion.p
              className="splash-tagline"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.4, delay: 0.4, ease: 'easeOut' }}
            >
              Bold stories for mature minds — 18+ only.
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
