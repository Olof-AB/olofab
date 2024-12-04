import { get_trains } from '$lib/trains/trains';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url }) => {
	const to = url.searchParams.get('to');
	const trainowners_str = url.searchParams.get('trainowners');
	const trainowners = trainowners_str?.split(',') ?? [];

	return {
		trains: await get_trains(params.from, to, trainowners)
	};
};
