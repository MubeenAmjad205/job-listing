import type { Metadata } from "next";
import "./globals.css";
import { ReactNode } from 'react';  
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import QueryProvider from '@/components/QueryProvider';  
import { UserProvider } from '@/context/UserContext';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ToastContainer } from "react-toastify";



export const metadata: Metadata = {
  title: "Jobify",
  description: "Created by Mubeeen Amjad",
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
          <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
          </main>  
          <Footer />  
        </QueryProvider>  
        </UserProvider>
      </body>  
    </html>  
  );  
} 