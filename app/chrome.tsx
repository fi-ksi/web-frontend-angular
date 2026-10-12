'use client';

import { Navbar } from '../src/components/root/Navbar';
import { Footer } from '../src/components/root/Footer';

export function Chrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
