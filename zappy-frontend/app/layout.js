import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';

// We'll use Space Grotesk for that technical, wide-tracking look on headings
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter' 
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space',
});

export const metadata = {
  title: 'ZAPPY // Event Terminal',
  description: 'Elite real-time event execution and verification protocol.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body 
        className={cn(
          inter.variable, 
          spaceGrotesk.variable,
          "min-h-screen bg-black font-sans antialiased selection:bg-purple-500/30 selection:text-white"
        )}
      >
        {/* CRT Noise / Grain Overlay */}
        <div className="fixed inset-0 pointer-events-none z-[9999] opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        
        {/* Global Scanline Effect */}
        <div className="fixed inset-0 pointer-events-none z-[9998] bg-scanline animate-scan" />

        <main className="relative z-10">
          {children}
        </main>
      </body>
    </html>
  );
}