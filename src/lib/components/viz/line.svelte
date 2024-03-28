<script>
  import * as d3 from "d3";

  export let data;

  export let width = 960;
  export let height = 480;
  export let getX = (d) => d.date;
  export let getY = (d) => d.value;

  $: xScale = d3.scaleUtc()
    .domain(d3.extent(data, getX))
    .range([0, width]);

  $: yScale = d3.scaleLinear()
    .domain(d3.extent(data, getY))
    .range([height, 0]);

  $: line = d3
    .line()
    .x((d) => xScale(getX(d)))
    .y((d) => yScale(getY(d)));

  // console.log(xScale.domain());
  // console.log(xScale(getX(data[0])))
  // console.log(yScale(13))
</script>

<svg
  {width}
  {height}
  viewBox="0 0 {width} {height}"
>
  <path fill="none" stroke="currentColor" stroke-width="1.5" d={line(data)} />
</svg>