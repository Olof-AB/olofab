import { get_trains } from '$lib/trains/trains';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url }) => {
	const to = url.searchParams.get('to');
	const operator = url.searchParams.get('operator');
	const operators = operator?.split(',') ?? [];

	return {
		trains: await get_trains(params.from, to, operators)
	};
};
