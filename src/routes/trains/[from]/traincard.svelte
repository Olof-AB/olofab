<script lang="ts">
	import { TrainStatus } from '$lib/trains/types';
	import { format } from 'date-fns';

	export let train;
	export let detailed = false;
	$: delayed = train.estimated ? train.estimated.getTime() - train.planned.getTime() > 0 : false;

	const toTimeString = (date: Date) => {
		return format(date, 'HH:mm');
	};

	// console.log(train);
</script>

<div
	class="max-w-xlx m-2 rounded-md border border-2 p-3"
	class:border-green-800={train.status === TrainStatus.Arrived}
	class:border-red-800={train.status === TrainStatus.Canceled}
	class:border-gray-400={train.status === TrainStatus.Departed}
	class:border-yellow-400={delayed && train.status !== TrainStatus.Departed}
>
	<div class:text-gray-400={train.status === TrainStatus.Departed}>
		<p class="text-right">
			{#if train.prevArrival}
				{toTimeString(train.prevArrival.timestamp)}
			{:else}
				-
			{/if}
		</p>
		<div class="flex justify-between gap-1 text-lg">
			{#if !train.estimated}
				<p></p>
			{/if}
			<p class:font-bold={!delayed} class:text-gray-400={delayed}>
				{toTimeString(train.planned)}
			</p>
			{#if train.estimated}
				<p class:font-bold={delayed}>{toTimeString(train.estimated)}</p>
			{/if}
		</div>
		<div class="flex justify-between gap-2">
			{#if detailed}
				<p>{train.destination}</p>
				<p>{train.trainowner}</p>
				<p>{train.train}</p>
			{:else}
				<p></p>
			{/if}
			<p>{train.platform || '?'}</p>
		</div>
	</div>
</div>
