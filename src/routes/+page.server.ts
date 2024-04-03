import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { formSchema } from '$lib/schema';
import { zod } from 'sveltekit-superforms/adapters';
import { getWeather } from '$lib/weather';

export const load: PageServerLoad = async () => {
	return {
		form: await superValidate(zod(formSchema)),
		weatherData: await getWeather()
	};
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(formSchema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		console.log('Filled out form: ', form);

		return {
			form
		};
	}
};
