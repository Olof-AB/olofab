<script lang="ts">
	import type { PageData } from './$types';
	import { getWeather } from '$lib/weather';
	import * as Card from '$lib/components/ui/card';
	import Line from '$lib/components/viz/line.svelte';
	import { onMount } from 'svelte';
	import ContactUsForm from './contact-us-form.svelte';

	let width;
	let height;

	export let data: PageData;
</script>

<div class="flex min-h-screen flex-col justify-evenly">
	<div class="flex flex-row items-center justify-evenly">
		<Card.Root class="m-8 max-w-xl md:m-32">
			<Card.Content>
				At Olof AB, we transform complex data into clear, actionable insights, empowering your
				organization to make informed decisions. Our expertise in IT security and data visualization
				goes beyond the basics, turning your data into a visual narrative that’s secure and
				straightforward. This foundation ensures not just the safety of your information but also
				its effective communication.
			</Card.Content>
			<Card.Footer>
				<ContactUsForm data={data?.form} />
			</Card.Footer>
		</Card.Root>
	</div>
	<div bind:clientWidth={width} bind:clientHeight={height} class="flex md:ml-20 md:mr-20">
		<Line data={data?.weatherData} getX={(d) => d.time} {width} {height} />
	</div>
</div>
