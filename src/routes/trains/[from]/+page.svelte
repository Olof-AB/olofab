<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import { invalidateAll } from '$app/navigation';
	import type { Train } from '$lib/trains/types';

	import { fade, fly } from 'svelte/transition';
	import { linear } from 'svelte/easing';
	import { flip } from 'svelte/animate';
	import Traincard from './traincard.svelte';

	export let data: PageData;

	let selectedTrain: string | null = null;

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
</script>

<div class="flex flex-wrap justify-start">
	{#each departures as train (train.train)}
		<!-- {#if train.operator === 'MTRN'} -->
		<button
			animate:flip={{ duration: 200, easing: linear }}
			in:fly={{ y: 100, duration: 500, easing: linear }}
			out:fade={{ duration: 500, easing: linear }}
			on:click={() => (selectedTrain = train.train)}
		>
			<Traincard {train} detailed={selectedTrain === train.train} />
		</button>
	{/each}
</div>
