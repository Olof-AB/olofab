import { z } from 'zod';

export const formSchema = z.object({
	emailAddress: z.string().email(),
	name: z.string(),
	message: z.string()
});

export type FormSchema = typeof formSchema;
