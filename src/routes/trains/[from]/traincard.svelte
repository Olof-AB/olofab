<script lang="ts">
	import { TrainStatus } from '$lib/trains/types';
	import { format } from 'date-fns';

	export let train;
	let delayed = train.estimated ? train.estimated.getTime() - train.planned.getTime() > 0 : false;

	const toTimeString = (date: Date) => {
		return format(date, 'HH:mm');
	};
</script>

<div
	class="max-w-xlx m-1 border border-4 p-3"
	class:border-green-800={train.status === TrainStatus.Arrived}
	class:border-red-800={train.status === TrainStatus.Canceled}
	class:border-gray-400={train.status === TrainStatus.Departed}
	class:border-yellow-400={delayed && train.status !== TrainStatus.Departed}
>
	<div class:text-gray-400={train.status === TrainStatus.Departed}>
		<p>
			{#if train.prevArrival}
				{toTimeString(train.prevArrival.timestamp)}
			{:else}
				-
			{/if}
		</p>
		<div class="flex justify-between gap-1 text-lg">
			<p class:font-bold={!delayed} class:text-gray-400={delayed}>
				{toTimeString(train.planned)}
			</p>
			{#if train.estimated}
				<p class:font-bold={delayed}>{toTimeString(train.estimated)}</p>
			{/if}
		</div>
		<div class="flex justify-between gap-2">
			<p>{train.platform || '?'}</p>
			<p>{train.destination}</p>
			<p>{train.trainowner}</p>
		</div>
	</div>
</div>
