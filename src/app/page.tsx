import JobList from '@/components/JobList';  

export default function Home() {  
  return (  
    <div>  
      <h1 className="text-2xl font-bold">Job Listings</h1>  
      <JobList />  
    </div>  
  );  
}