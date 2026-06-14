import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  instagram: z
    .string()
    .transform((val) => val.replace(/^@/, '')) // strip @ prefix if provided
    .optional()
    .or(z.literal('')),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const categories = ['Dance', 'Music', 'Social', 'Fitness', 'Celebration', 'Other'] as const;

export const eventCreateSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  category: z.enum(['Dance', 'Music', 'Social', 'Fitness', 'Celebration', 'Other'], {
    message: 'Invalid event category select',
  }),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date-time format',
  }),
  location: z.string().min(5, 'Exact location must be at least 5 characters'),
  city: z.string().min(2, 'City name must be at least 2 characters'),
  maxParticipants: z
    .union([z.number(), z.string()])
    .transform((val) => {
      const parsed = parseInt(val.toString(), 10);
      return isNaN(parsed) ? 0 : parsed;
    })
    .pipe(z.number().nonnegative('Capacity limit cannot be negative')),
  image: z.string().url('Invalid image URL').optional().or(z.literal('')),
  organizerContact: z.string().min(3, 'Organizer contact detail is required'),
});

export const commentCreateSchema = z.object({
  content: z.string().min(1, 'Comment text cannot be empty').max(500, 'Comment too long (max 500 chars)'),
});

export const reportCreateSchema = z.object({
  reason: z.string().min(3, 'Please specify a valid reason'),
  description: z.string().optional().or(z.literal('')),
});
