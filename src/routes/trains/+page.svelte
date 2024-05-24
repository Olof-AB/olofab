<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import type { PageData } from './$types';

	export let data: PageData;
	const trains = data.trains;
</script>

<div class="flex min-h-screen flex-row justify-start">
	<div class="flex flex-col">
		{#each trains as train}
			{#if train.operator === 'MTRN'}
				<Card.Root class="max-w-xlx m-8">
					<Card.Content>
						<p>{train.planned.toLocaleTimeString()}</p>
						{#if train.estimated}
							<p>{train.estimated.toLocaleTimeString()}</p>
						{:else}
							<p>On time</p>
						{/if}
						<p>{train.platform}</p>
						<p>{train.destination}</p>
					</Card.Content>
				</Card.Root>
			{/if}
		{/each}
	</div>
</div>
