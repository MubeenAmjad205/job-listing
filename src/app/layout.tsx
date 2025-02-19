import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ReactNode } from 'react';  
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import QueryProvider from '@/components/QueryProvider';  
import { UserProvider } from '@/context/UserContext';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
// import { ToastContainer } from 'react-toastify'; 


// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "Job Listing App",
  description: "Generated by create next app",
};
export default function RootLayout({ children }: { children: ReactNode }) {  
  return (  
    <html lang="en">  
      <body  className="relative bg-white">  
        <UserProvider>

        <QueryProvider>  
          <Header />  
          <main className="pt-16 ">  
            {children}  
          <ReactQueryDevtools initialIsOpen={false} />
          </main>  
      {/* <ToastContainer position="top-right" autoClose={2000} hideProgressBar /> */}
          <Footer />  
        </QueryProvider>  
        </UserProvider>
      </body>  
    </html>  
  );  
} 