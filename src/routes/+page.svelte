<script>
  import * as Card from "$lib/components/ui/card";
  import Line from "$lib/components/viz/line.svelte";

  let width;
  let height;

  const data = [
    {
      date: "2024-02-12",
      value: 12
    },
    {
      date: "2024-02-13",
      value: 13
    },
    {
      date: "2024-02-14",
      value: 11
    },
    {
      date: "2024-02-15",
      value: 15
    },
  ]
</script>

<div class="flex flex-col justify-evenly min-h-screen">
<div class="flex flex-row justify-evenly items-center space-x-40">
  <Card.Root class="max-w-xl">
    <Card.Content>
      At Olof AB, we transform complex data into clear, actionable insights, empowering your organization to make informed decisions. Our expertise in IT security and data visualization goes beyond the basics, turning your data into a visual narrative that’s secure and straightforward. This foundation ensures not just the safety of your information but also its effective communication.    </Card.Content>
  </Card.Root>
  <Card.Root class="max-w-sm">
    <Card.Content>
      Olof AB
    </Card.Content>
  </Card.Root>
</div>
<div bind:clientWidth={width} bind:clientHeight={height} class="flex m-40" >
  <Line {data} getX={(d) => new Date(d.date)} {width} {height} />

</div>
</div>