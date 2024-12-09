<script lang="ts">
	import type { Train } from '$lib/trains/types';
	import { fade, fly } from 'svelte/transition';
	import { linear } from 'svelte/easing';
	import { flip } from 'svelte/animate';
	import Traincard from './traincard.svelte';

	export let departures: Train[];
	export let direction: 'left' | 'down' = 'left';

	let selectedTrain: string | null = null;

	function handleTrainClick(train: Train) {
		if (selectedTrain === train.train) {
			selectedTrain = null;
			return;
		}

		selectedTrain = train.train;
	}
</script>

<div class="flex flex-wrap items-start justify-start" class:flex-col={direction === 'down'}>
	{#each departures as train (train.train)}
		<!-- {#if train.operator === 'MTRN'} -->
		<button
			class="max-w-md"
			animate:flip={{ duration: 200, easing: linear }}
			in:fly={{ y: 100, duration: 500, easing: linear }}
			out:fade={{ duration: 500, easing: linear }}
			on:click={() => handleTrainClick(train)}
		>
			<Traincard {train} detailed={selectedTrain === train.train} />
		</button>
	{/each}
</div>
