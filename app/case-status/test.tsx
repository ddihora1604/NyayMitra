'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import '../i18n';

export default function Test() {
  const { t } = useTranslation();
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 bg-amber-50 rounded-lg mb-4"
    >
      <h2 className="text-amber-800 font-medium">{t('case_status')}</h2>
      <p>{t('check_your_case_status')}</p>
    </motion.div>
  );
} 