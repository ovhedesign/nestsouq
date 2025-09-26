'use client';

import { usePageViews } from '@/lib/hooks';

export default function Analytics() {
  usePageViews();
  return null;
}
