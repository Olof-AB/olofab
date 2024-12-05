import { get_trains } from '$lib/trains/trains';
import type { PageServerLoad } from './$types';
import type { Train } from '$lib/trains/types';

interface TrainsData {
	trains_departure: Train[];
	trains_arrival: Train[];
	trains_in_transit: Train[];
	toStation: string | null;
	fromStation: string;
}

const cache = new Map<string, { timestamp: number; data: TrainsData }>();
const CACHE_DURATION = 1000 * 10; // 10 seconds

export const load: PageServerLoad = async ({ params, url }) => {
	const to = url.searchParams.get('to');
	const trainowners_str = url.searchParams.get('trainowners');
	const trainowners = trainowners_str?.split(',') ?? [];

	const cacheKey = `${params.from}-${to}-${trainowners.join(',')}`;
	const cached = cache.get(cacheKey);
	if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
		return cached.data;
	}

	const trains = await get_trains(params.from, to, trainowners);

	const trains_departure = trains.departuresFrom;
	const trains_arrival = trains.departuresTo;
	const trains_in_transit: Train[] = [];

	const result: TrainsData = {
		trains_departure,
		trains_arrival,
		trains_in_transit,
		toStation: to,
		fromStation: params.from
	};

	cache.set(cacheKey, { timestamp: Date.now(), data: result });

	return result;
};
