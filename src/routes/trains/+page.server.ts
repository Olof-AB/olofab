import { get_trains } from '$lib/trains';
import type { PageServerLoad } from '../$types';

export const load: PageServerLoad = async () => {
	return {
		trains: await get_trains('U')
	};
};
