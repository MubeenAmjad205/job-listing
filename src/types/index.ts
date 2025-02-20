import 'iron-session';


export interface User {
    id: number;
    name: string;
    email: string;
    role: string;
  }
export interface UserSession {
    id: number;
    name: string;
    email: string;
    role: string;
  }

 
  
  export interface Application {
    id: number;
    jobTitle: string;
    status: 'pending' | 'accepted' | 'rejected';
  }


export interface Application {
  id: number;
  jobId: number;
  jobTitle : string;
  userName: string;
  email: string;
  coverLetter: string;
  resume: string;
  status: 'pending' | 'accepted' | 'rejected';
}

  

declare module 'iron-session' {  
    interface IronSessionData {  
        user?: {  
          id: number; email: string; role: string; 
            
        };  
    }  
}  
export interface Job {
  id: string|number;
  title: string;
  description?: string;
  company?: string;
  location?: string;
  category?:string;
  salary?: string;
  postedAt?: string;
}