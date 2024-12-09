<script lang="ts">
	import { type Train, TrainStatus } from '$lib/trains/types';
	import { format } from 'date-fns';
	import { es } from 'date-fns/locale';

	export let train: Train;
	export let detailed = false;

	$: delayed = train.estimated ? train.estimated.getTime() - train.planned.getTime() > 0 : false;
	$: prevEvent =
		train.status === TrainStatus.Departed ? train.timestamp : train.prevArrival?.timestamp;
	$: prevPlannedEvent =
		train.status === TrainStatus.Departed ? train.planned : train.prevArrival?.planned;
	$: platform = train.status === TrainStatus.Departed ? train.arrival?.platform : train.platform;

	function getNextEvent(train: Train) {
		if (train.status === TrainStatus.Departed) {
			if (train.arrival) {
				if (train.arrival.estimated) {
					return train.arrival.estimated;
				} else {
					return train.arrival.planned;
				}
			}
			return train.planned;
		} else {
			if (train.estimated) {
				return train.estimated;
			}
			return train.planned;
		}
	}

	const toTimeString = (date: Date) => {
		return format(date, 'HH:mm');
	};

	// console.log(train);
</script>

<div
	class="m-2 w-auto rounded-md border border-2 p-3"
	class:border-green-800={train.status === TrainStatus.Arrived}
	class:border-red-800={train.status === TrainStatus.Canceled}
	class:border-yellow-400={delayed && train.status !== TrainStatus.Departed}
>
	<div>
		<div class="flex justify-between gap-1">
			<p class="text-gray-400">
				{#if prevPlannedEvent && prevEvent && prevPlannedEvent.getTime() < prevEvent.getTime()}
					{toTimeString(prevPlannedEvent)}
				{/if}
			</p>
			<p class="">
				{#if prevEvent}
					{toTimeString(prevEvent)}
				{:else}
					-
				{/if}
			</p>
		</div>
		<div class="flex justify-between gap-1 text-lg">
			<p class="text-gray-400">
				{#if train.estimated}
					{toTimeString(train.estimated)}
				{/if}
			</p>
			<p class="font-bold">
				{toTimeString(getNextEvent(train))}
			</p>
		</div>
		<div class="flex justify-between gap-2">
			{#if detailed}
				<p>{train.destination}</p>
				<p>{train.trainowner}</p>
				<p>{train.train}</p>
			{:else}
				<p></p>
			{/if}
			<p>{platform}</p>
		</div>
	</div>
</div>
