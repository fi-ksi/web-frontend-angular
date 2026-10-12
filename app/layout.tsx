import type { Metadata } from 'next';
import { Providers } from './providers';
import { Chrome } from './chrome';

export const metadata: Metadata = {
  title: 'KSI',
  description: 'Korespondenční seminář z informatiky'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs">
      <body>
        <Providers>
          <Chrome>{children}</Chrome>
        </Providers>
      </body>
    </html>
  );
}
