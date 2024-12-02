<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import { invalidateAll } from '$app/navigation';
	import type { Train } from '$lib/trains/types';
	import { TrainStatus } from '$lib/trains/types';
	import { fade, fly } from 'svelte/transition';
	import { linear } from 'svelte/easing';
	import { flip } from 'svelte/animate';
	import { format } from 'date-fns';

	export let data: PageData;

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

	onMount(() => {
		const interval = setInterval(() => {
			invalidateAll();
		}, 1000 * 10);

		return () => {
			clearInterval(interval);
		};
	});

	const toTimeString = (date: Date) => {
		return format(date, 'HH:mm');
	};

	const isDelayed = (train: Train) => {
		if (train.estimated) {
			return train.estimated.getTime() - train.planned.getTime() > 0;
		}
		return false;
	};
</script>

<div class="flex flex-wrap justify-start">
	{#each departures as train (train.train)}
		<!-- {#if train.operator === 'MTRN'} -->
		<div
			class="max-w-xlx m-1 border border-4 p-3"
			class:border-green-800={train.status === TrainStatus.Arrived}
			class:border-red-800={train.status === TrainStatus.Canceled}
			class:border-gray-400={train.status === TrainStatus.Departed}
			class:border-yellow-400={isDelayed(train) && train.status !== TrainStatus.Departed}
			animate:flip={{ duration: 200, easing: linear }}
			in:fly={{ y: 100, duration: 500, easing: linear }}
			out:fade={{ duration: 500, easing: linear }}
		>
			<div class:text-gray-400={train.status === TrainStatus.Departed}>
				<p>
					{#if train.prevArrival}
						{toTimeString(train.prevArrival.timestamp)}
					{:else}
						-
					{/if}
				</p>
				<p class:font-bold={!isDelayed(train)} class:text-gray-400={isDelayed(train)}>
					{toTimeString(train.planned)}
				</p>
				{#if train.actual}
					<p>Departed</p>
				{:else if train.estimated}
					<p class:font-bold={isDelayed(train)}>{toTimeString(train.estimated)}</p>
				{:else}
					<p>On time</p>
				{/if}
				<div class="flex justify-between gap-2">
					<p>{train.platform || '?'}</p>
					<p>{train.destination}</p>
					<p>{train.train}</p>
				</div>
			</div>
		</div>
		<!-- {/if} -->
	{/each}
</div>
