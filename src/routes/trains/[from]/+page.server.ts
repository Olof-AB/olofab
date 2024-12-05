import { get_trains } from '$lib/trains/trains';
import type { PageServerLoad } from './$types';
import type { Train } from '$lib/trains/types';

export const load: PageServerLoad = async ({ params, url }) => {
	const to = url.searchParams.get('to');
	const trainowners_str = url.searchParams.get('trainowners');
	const trainowners = trainowners_str?.split(',') ?? [];

	const trains_departure = await get_trains(params.from, to, trainowners);
	const trains_arrival = to ? await get_trains(to, params.from, trainowners) : [];
	const trains_in_transit: Train[] = [];

	return {
		trains_departure,
		trains_arrival,
		trains_in_transit,
		toStation: to,
		fromStation: params.from
	};
};
