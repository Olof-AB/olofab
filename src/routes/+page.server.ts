import type { PageServerLoad, Actions } from './$types';
import { superValidate, message } from 'sveltekit-superforms';
import { formSchema } from '$lib/schema';
import { zod } from 'sveltekit-superforms/adapters';
import { getWeather } from '$lib/weather';
import { env } from '$env/dynamic/private';

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
			// return fail(400, {
			// 	form
			// });
			return message(form, { status: 'error', text: 'invalid form' });
		}

		console.log('Filled out form: ', form);

		const { emailAddress, name, message: formMessage } = form.data;

		const slack_user = env.SLACK_USER ? `<@${env.SLACK_USER}> ` : '';

		const message_text = `${slack_user}Message from web form: ${name}<${emailAddress}>:\n\n${formMessage}`;

		await fetch(env.SLACK_HOOK, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ text: message_text })
		});

		// return {
		// 	form
		// };
		return message(form, { status: 'success', text: 'valid form' });
	}
};
