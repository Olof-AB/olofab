<script lang="ts">
	import * as d3 from 'd3';

	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import { invalidateAll } from '$app/navigation';
	import type { Train } from '$lib/trains/types';
	import { TrainStatus } from '$lib/trains/types';
	import { fade, fly } from 'svelte/transition';
	import { linear } from 'svelte/easing';
	import { flip } from 'svelte/animate';
	import TrainView from '$lib/components/viz/TrainView.svelte';

	export let data: PageData;
	export let width = 960;

	const futureTrain = (train: Train) => {
		const now = new Date();

		return now.getTime() - train.timestamp.getTime() < 30 * 60 * 1000;
		// if (train.estimated) {
		// 	return train.estimated > now;
		// }
		// return train.planned > now;
	};

	$: departures = data.trains
		.filter((train: Train) => futureTrain(train))
		.toSorted((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

	$: xScale = d3.scaleTime()
		.domain(d3.extent(departures, (d) => d.timestamp))
		.range([0, width]);

	onMount(() => {
		const interval = setInterval(() => {
			invalidateAll();
		}, 1000 * 10);

		return () => {
			clearInterval(interval);
		};
	});
</script>

<div bind:clientWidth={width} class="flex flex-wrap justify-start">
	
	{#each departures as train (train.train)}
		{#if train.prevArrival}
		<TrainView
			arrivalPoint={{ x: xScale(train.prevArrival.timestamp), y: 50}}
			arrivalTime={train.prevArrival.timestamp}
			departurePoint={{ x: xScale(train.planned), y: 50}}
			departureTime={train.planned}
			width={width}
			height={50}
		/>
		{/if}
		<!-- {#if train.operator === 'MTRN'} -->
		<!-- <div
			class="max-w-xlx m-1 border border-4 p-3"
			class:border-green-800={train.status === TrainStatus.Arrived}
			class:border-red-800={train.status === TrainStatus.Canceled}
			class:border-gray-400={train.status === TrainStatus.Departed}
			animate:flip={{ duration: 200, easing: linear }}
			in:fly={{ y: 100, duration: 500, easing: linear }}
			out:fade={{ duration: 500, easing: linear }}
		>
			<div class:text-gray-400={train.status === TrainStatus.Departed}>
				<p>
					{#if train.prevArrival}
						{train.prevArrival.timestamp.toLocaleTimeString()}
					{:else}
						-
					{/if}
				</p>
				<p class="font-bold">{train.planned.toLocaleTimeString()}</p>
				{#if train.actual}
					<p>Departed</p>
				{:else if train.estimated}
					<p>{train.estimated.toLocaleTimeString()}</p>
				{:else}
					<p>On time</p>
				{/if}
				<div class="flex justify-between">
					<p>{train.platform || '?'}</p>
					<p>{train.destination}</p>
					<p>{train.train}</p>
				</div>
			</div>
		</div> -->
		<!-- {/if} -->
	{/each}
</div>
