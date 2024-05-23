<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
	const trains = data.trains;
</script>

<h1>Trains</h1>

{#each trains as train}
	<p>{train.estimated}</p>
{/each}
