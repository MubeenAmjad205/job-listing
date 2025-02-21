import {z} from 'zod';


export const registerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  });

  export const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  });

  export const editJobSchema = z.object({
    title: z.string().min(2, 'Job title is required'),
    description: z.string().min(5, 'Job description is required'),
    category: z.string().min(2, 'Category is required'),
    location: z.string().min(2, 'Location is required'),
    salary: z.preprocess((val) => Number(val), z.number().min(0)),
  });

 export const searchSchema = z.object({
    location: z.string().optional(),
    category: z.string().optional(),
    salary: z
      .preprocess((val) => (val === '' || val === null ? undefined : Number(val)), z.number().optional()),
  });

//   export const registerSchema = z.object({
//     name: z.string().min(1, { message: 'Name is required' }),
//     email: z.string().email({ message: 'Invalid email address' }),
//     password: z.string().min(6, { message: 'Password must be at least 6 characters' })
//   });