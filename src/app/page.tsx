'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaGithub, FaEnvelope } from 'react-icons/fa';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import client from '@/lib/contentfulClient';


const fetchFeatures = async () => {
  let response = await client.getEntries({
    content_type: 'features',
  });
  
  let finalResponse= response.items.map((item) =>{
    return {
      title: item.fields.title,
      description: item.fields.shortDescription,
      icon: item.fields.emoji,
    };
  });
  // console.log('Response from fetchFeatures: ',finalResponse);
  return finalResponse;
};


const fetchAbout = async () => {
  let response = await client.getEntries({
    content_type: 'about',
  });
  // console.log('Response from contentful: ',response);
  
  let finalResponse= response.items.map((item) =>{
    return {

      description: item.fields.description,
      techStack: item.fields.techStack,
    };
  });
  // console.log('Response from fetchAbout: ',finalResponse);
  return finalResponse[0];
};
const fetchGetInTouch = async () => {
  let response = await client.getEntries({
    content_type: 'getInTouch',
  });
  // console.log('Response from fetchGetInTouch: ',response);
  
  let finalResponse= response.items.map((item) =>{
    return   item.fields.description
    
  });
  // console.log('Response from fetchGetInTouch: ',finalResponse[0]);
  return finalResponse[0];
};
fetchGetInTouch(  );

const HomePage = () => {




  const { user , logout} = useUser();
  const [features, setFeatures] = useState<any>([]);
  const [about, setAbout] = useState<any>({});
  const [getInTouch, setGetInTouch] = useState<any>('');
  const router = useRouter ();

useEffect(() => {

  const fetchContent =async ()=>{
setAbout(await fetchAbout());
 setFeatures(await fetchFeatures());
 setGetInTouch(await fetchGetInTouch());
 
}
fetchContent(); 
// console.log('About:',about);
}, []);




  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-24 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-extrabold mb-6">Welcome to Jobify</h1>
          <p className="text-xl mb-10">
            Your gateway to endless opportunities in the tech world.
          </p>
          {!user ? (
            <div className="space-x-4">
              <button
                onClick={() => {router.push('/auth/login')}}
                className="bg-white text-blue-600 font-semibold py-3 px-8 rounded-full shadow-lg hover:bg-gray-100 transition duration-300"
              >
                Log In
              </button>
              <Link
                href="/auth/register"
                className="bg-white text-blue-600 font-semibold py-3 px-8 rounded-full shadow-lg hover:bg-gray-100 transition duration-300 inline-block"
              >
                Sign Up
              </Link>
            </div>
          ) : (
            <div>
              <h2 className="text-3xl font-semibold">
                Welcome back, {user.name}!
              </h2>
              <div className="mt-6 space-x-4">
                <Link
                  href="/jobs"
                  className="bg-white text-blue-600 font-semibold py-3 px-8 rounded-full shadow-lg hover:bg-gray-100 transition duration-300 inline-block"
                >
                  Explore Jobs
                </Link>
                <button
                  onClick={() => handleLogout()}
                  className="bg-red-600 text-white font-semibold py-3 px-8 rounded-full shadow-lg hover:bg-red-700 transition duration-300"
                >
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Features Section */}
      <section className="bg-gray-100 py-16 px-4">
        <h2 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          Features
        </h2>
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {
          
          features?.map((feature:any) => (
            <div
              key={feature.title}
              className="text-center p-6 bg-white rounded-lg shadow-lg text-indigo-600"
            >
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-2xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section className="container mx-auto py-16 px-4">
        <h2 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          About Jobify
        </h2>
        <p className="text-gray-600 text-lg leading-relaxed text-center max-w-3xl mx-auto">
{about.description}
        </p>
        <div className="mt-12 flex flex-wrap justify-center">
          {/* Tech Stack Badges */}
          {
          
         
          about?.techStack?.map((tech:any) => (
            <span
              key={tech}
              className="bg-gray-200 text-gray-800 m-2 px-5 py-2 rounded-full text-sm font-medium"
            >
              {tech}
            </span>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <footer className="bg-gray-50 py-12">
        <div className="container mx-auto text-center">
          <h3 className="text-3xl font-bold text-gray-800 mb-6">
            Get in Touch
          </h3>
          <p className="text-gray-600 mb-8">
            {getInTouch}
          </p>
          <div className="flex justify-center space-x-8">
           <Link
              href="mailto:mianmubeen205@gmail.com"
              className="text-gray-600 hover:text-gray-800 transition duration-300"
              aria-label="Email"
            >
              <FaEnvelope size={36} />
           </Link>
           <Link
              href="https://github.com/MubeenAmajad205"
              className="text-gray-600 hover:text-gray-800 transition duration-300"
              aria-label="GitHub"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaGithub size={36} />
           </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
