"use client"; 

import { useQuery } from '@tanstack/react-query';  
import axios from 'axios';  

const fetchJobs = async () => {  
  const response = await axios.get('/api/jobs');  
  return response.data;  
};  

const JobList = () => {  
  const { data: jobs, isLoading, error } = useQuery({  
    queryKey: ['jobs'],  
    queryFn: fetchJobs,  
    staleTime: 5000,  
  
  });  

  if (isLoading) return <div>Loading jobs...</div>;  
  if (error) return <div>Error fetching jobs</div>;  

  return (  
    <ul>  
      {jobs.map((job:{id:string;title:string;description:string;location:string}) => (  
        <li key={job.id} className="border p-4 mb-2">  
          <h2 className="font-semibold">{job.title}</h2>  
          <p>{job.description}</p>  
          <p>{job.location}</p>  
        </li>  
      ))}  
    </ul>  
  );  
};  

export default JobList;