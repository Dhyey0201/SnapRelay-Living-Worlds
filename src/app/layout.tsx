import type { Metadata } from 'next';
import './globals.css';
import './camera.css';
import './milo-fallback.css';
export const metadata:Metadata={title:'SnapRelay — Living Worlds',description:'One living character, many friends, evolving across their worlds.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" data-scroll-behavior="smooth"><body>{children}</body></html>;}
