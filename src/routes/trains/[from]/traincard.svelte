<script lang="ts">
	import { type Train, TrainStatus } from '$lib/trains/types';
	import { format } from 'date-fns';

	export let train: Train;
	export let detailed = false;

	interface InfoToShow {
		delayed: boolean;
		prevEvent: Date | undefined;
		prevPlannedEvent: Date | undefined;
		platform: string | undefined;
		train: Train;
		estimated: Date | undefined;
		planned: Date | undefined;
		trainowner: string;
	}

	function convertToInfoToShow(train: Train): InfoToShow {
		if (train.status === TrainStatus.Departed) {
			const delayed = train.arrival?.estimated
				? train.arrival.estimated.getTime() - train.arrival.planned.getTime() > 0
				: false;

			const prevEvent = train.timestamp;
			const prevPlannedEvent = train.planned;
			const platform = train.arrival?.platform;
			const estimated = train.arrival?.estimated;
			const planned = train.arrival?.planned;

			return {
				delayed,
				prevEvent,
				prevPlannedEvent,
				platform,
				train,
				estimated,
				planned,
				trainowner: train.trainowner
			};
		}
		const delayed = train.estimated
			? train.estimated.getTime() - train.planned.getTime() > 0
			: false;
		const prevEvent = train.prevArrival?.timestamp;
		const prevPlannedEvent = train.prevArrival?.planned;
		const platform = train.platform;
		const estimated = train.estimated;
		const planned = train.planned;

		return {
			delayed,
			prevEvent,
			prevPlannedEvent,
			platform,
			train,
			estimated,
			planned,
			trainowner: train.trainowner
		};
	}

	$: info = convertToInfoToShow(train);

	const toTimeString = (date: Date | undefined) => {
		if (!date) return '-';

		return format(date, 'HH:mm');
	};

	// console.log(train);

	$: detailed && console.log(train);
</script>

<div
	class="m-2 w-auto rounded-md border border-2 p-3"
	class:border-green-800={train.status === TrainStatus.Arrived}
	class:border-red-800={train.status === TrainStatus.Canceled}
	class:border-yellow-400={info.delayed}
>
	<div>
		<div class="flex justify-between gap-1">
			<p class="text-gray-400">
				{#if info.prevPlannedEvent && info.prevEvent && info.prevPlannedEvent.getTime() < info.prevEvent.getTime()}
					{toTimeString(info.prevPlannedEvent)}
				{/if}
			</p>
			<p class="">
				{#if info.prevEvent}
					{toTimeString(info.prevEvent)}
				{:else}
					-
				{/if}
			</p>
		</div>
		<div class="flex justify-between gap-1 text-lg">
			<p class="text-gray-400">
				{#if info.estimated}
					{toTimeString(info.planned)}
				{/if}
			</p>
			<p class="font-bold" class:text-red-800={train.status === TrainStatus.Canceled}>
				{toTimeString(info.estimated ?? info.planned)}
			</p>
		</div>
		<div class="flex justify-between gap-2">
			{#if detailed}
				<p>{train.destinationReadable}</p>
				<p>{train.trainowner}</p>
				<p>{train.train}</p>
			{:else}
				<p></p>
			{/if}
			<p>{info.platform}</p>
		</div>
	</div>
</div>
