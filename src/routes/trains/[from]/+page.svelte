<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import { invalidateAll } from '$app/navigation';
	import type { Train } from '$lib/trains/types';
	import Station from './station.svelte';

	export let data: PageData;

	const futureTrain = (train: Train) => {
		const now = new Date();

		return now.getTime() - train.timestamp.getTime() < 30 * 60 * 1000;
	};

	$: departures = data.trains_departure
		.filter((train: Train) => train.advertised)
		.filter((train: Train) => futureTrain(train))
		.toSorted((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

	$: arrivals = data.trains_arrival
		.filter((train: Train) => train.advertised)
		.filter((train: Train) => futureTrain(train))
		.toSorted((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

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
<Station {departures} />

{#if arrivals.length > 0}
	<h1>Departures from {toStation}</h1>
	<Station departures={arrivals} />
{/if}
