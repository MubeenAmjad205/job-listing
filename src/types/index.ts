import 'iron-session';


export interface User {
    id: number;
    name: string;
    email: string;
    role: string;
  }

  export interface UserContextType {
    user: User | null;
    login: (userData: User) => void;
    logout: () => Promise<void>;
    isLoading: boolean;
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

  

export interface SessionData {
  user?: {
    id: number;
    name:string;
    email: string;
    role: string;
  };
}  
export interface Job {
  id: string|number;
  title: string;
  description?: string;
  company?: string;
  location?: string;
  category?:string;
  salary?: string|number;
  postedAt?: string;
}