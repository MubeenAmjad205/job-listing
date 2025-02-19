// /src/types/index.ts
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
    // Add additional fields like appliedDate, etc., as needed.
  }
  // types/index.ts
export interface Job {
  id: number;
  title: string;
  description?: string;
}

export interface Application {
  id: number;
  jobId: number;
  jobTitle : string;
  userName: string;
  email: string;
  coverLetter: string;
  resume: string; // Filename or URL
  status: 'pending' | 'accepted' | 'rejected';
}

  

declare module 'iron-session' {  
    interface IronSessionData {  
        user?: {  
          id: number; email: string; role: string; 
            
        };  
    }  
}  