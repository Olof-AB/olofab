<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from '../$types';
	import { invalidate, invalidateAll } from '$app/navigation';

	export let data: PageData;

	const futureTrain = (train) => {
		const now = new Date();

		return now.getTime() - train.timestamp.getTime() < 30 * 60 * 1000;
		// if (train.estimated) {
		// 	return train.estimated > now;
		// }
		// return train.planned > now;
	};

	const departures = data.trains.filter(
		(train) => train.departure && futureTrain(train) && train.platform !== 'x'
	);

	const departuresWithArrivals = departures.map((train) => {
		const arrival = data.trains.filter(
			(t) => t.platform === train.platform && !t.departure && t.timestamp <= train.timestamp
		);
		if (arrival.length > 0) {
			return { ...train, prevArrival: arrival[arrival.length - 1] };
		}
		return train;
	});

	onMount(() => {
		const interval = setInterval(() => {
			invalidateAll();
		}, 1000 * 30);

		return () => {
			clearInterval(interval);
		};
	});
</script>

<div class="flex flex-wrap justify-start">
	{#each departuresWithArrivals as train}
		<!-- {#if train.operator === 'MTRN'} -->
		<div
			class="max-w-xlx m-1 border border-4 p-3"
			class:border-green-800={train.prevArrival?.actual !== undefined}
			class:border-red-800={train.canceled}
			class:border-gray-400={train.actual !== undefined && !train.canceled}
		>
			<div class:text-gray-400={train.actual !== undefined && !train.canceled}>
				<p class:text-green-800={train.prevArrival?.actual !== undefined}>
					{train.prevArrival?.timestamp.toLocaleTimeString()}
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
					<p>{train.platform}</p>
					<p>{train.destination}</p>
					<p>{train.train}</p>
				</div>
			</div>
		</div>
		<!-- {/if} -->
	{/each}
</div>
