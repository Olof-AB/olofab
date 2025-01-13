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

<div class="container text-xs">
	<div class="from-row">
		<h1>Departures from {fromStation}</h1>
		<Station departures={departures.future.splice(0, 5)} />
	</div>
	<div class="transit-to">
		<h1>In transit from {fromStation}</h1>
		<Station departures={departures.inTransit.toReversed()} direction="down" />
	</div>
	<div class="transit-from overflow-y-auto">
		{#if arrivals.future.length > 0}
			<h1>In transit from {toStation}</h1>
			<Station departures={arrivals.inTransit} direction="down" />
		{/if}
	</div>

	<div class="to-row">
		{#if arrivals.future.length > 0}
			<h1>Departures from {toStation}</h1>
			<Station departures={arrivals.future.splice(0, 5)} />
		{/if}
	</div>
</div>

<style>
	.container {
		display: grid;
		grid-template-columns: 1fr 16rem 16rem 1fr;
		grid-template-rows: 7rem 1fr 7rem;
		grid-gap: 4rem;
	}

	@media (max-width: 768px) {
		.container {
			grid-template-columns: 0 1fr 1fr 0;
			grid-gap: 0;
		}
	}
	.from-row {
		grid-column: 2 / 4;
		grid-row: 1;
		overflow: hidden;
	}
	.transit-from {
		grid-column: 2;
		grid-row: 2;
	}
	.transit-to {
		grid-column: 3;
		grid-row: 2;
	}
	.to-row {
		grid-column: 2 / 4;
		grid-row: 3;
	}
</style>
