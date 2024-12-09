<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import { invalidateAll } from '$app/navigation';
	import { TrainStatus, type Train } from '$lib/trains/types';
	import Station from './station.svelte';

	export let data: PageData;

	$: departures = data.trains_departure
		.filter((train: Train) => train.advertised)
		.toSorted((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
		.reduce(
			(curr, train: Train) => {
				if (train.status === TrainStatus.Departed) {
					if (train.arrival?.actual === undefined) {
						return { ...curr, inTransit: [...curr.inTransit, train] };
					}
					return curr;
				}
				return { ...curr, future: [...curr.future, train] };
			},
			{ future: [] as Train[], inTransit: [] as Train[] }
		);

	$: arrivals = data.trains_arrival
		.filter((train: Train) => train.advertised)
		.toSorted((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
		.reduce(
			(curr, train: Train) => {
				if (train.status === TrainStatus.Departed) {
					if (train.arrival?.actual === undefined) {
						return { ...curr, inTransit: [...curr.inTransit, train] };
					}
					return curr;
				}
				return { ...curr, future: [...curr.future, train] };
			},
			{ future: [] as Train[], inTransit: [] as Train[] }
		);

	const fromStation = data.fromStation;
	const toStation = data.toStation;

	onMount(() => {
		const interval = setInterval(() => {
			invalidateAll();
		}, 1000 * 10);

		return () => {
			clearInterval(interval);
		};
	});
</script>

<h1>Departures from {fromStation}</h1>
<Station departures={departures.future} />

<h1>In transit from {fromStation}</h1>
<Station departures={departures.inTransit} />

{#if arrivals.future.length > 0}
	<h1>In transit from {toStation}</h1>
	<Station departures={arrivals.inTransit} />

	<h1>Departures from {toStation}</h1>
	<Station departures={arrivals.future} />
{/if}
