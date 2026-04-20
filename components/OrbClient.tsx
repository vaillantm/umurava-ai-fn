'use client';

import dynamic from 'next/dynamic';
import type { ComponentProps } from 'react';
import type OrbComponent from './Orb';

const Orb = dynamic(() => import('./Orb'), { ssr: false });

type OrbClientProps = ComponentProps<typeof OrbComponent>;

export default function OrbClient(props: OrbClientProps) {
  return <Orb {...props} />;
}
