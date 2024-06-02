<script lang="ts">
  export let arrivalPoint: { x: number, y: number };
  export let departurePoint = { x: 50, y: 50 };

  export let arrivalTime : Date;
  export let departureTime : Date;

  export let width = 200;
  export let height = 100;

  $: arrivalLabelStart = { x: arrivalPoint.x - 30, y: arrivalPoint.y - 25 };
  $: departureLabelEnd = { x: departurePoint.x + 30, y: departurePoint.y - 25 };

  function arrowToPoint(point: { x: number, y: number }) {
    return `${point.x},${point.y + 2} ${point.x - 5},${point.y - 10} ${point.x + 5},${point.y - 10}`
  }

  function leftArrowToPoint(point: { x: number, y: number }) {
    return `${point.x + 2},${point.y} ${point.x - 10},${point.y - 5} ${point.x - 10},${point.y + 5}`
  }

  function lineToPoint(fromPoint: { x: number, y: number}, toPoint: { x: number, y: number }) {
    return `${fromPoint.x},${fromPoint.y} ${toPoint.x},${fromPoint.y} ${toPoint.x},${toPoint.y - 2}`
  }

</script>

<!--
  This component is built on a horizontal line which sort of represents the platform.
-->
<svg width={width} height={height} xmlns="http://www.w3.org/2000/svg">
  {#if arrivalTime !== undefined}
  <!-- Arrival arrow, horizontal line that turns 90 degrees and points to the arrivalPoint. It underlines the label for arrivalTime -->
  <polyline points={lineToPoint(arrivalLabelStart, arrivalPoint)} stroke="black" stroke-width="2" fill="none"/>
  <!-- <polygon points="50,40 45,30 55,30" fill="black"/> -->
  <polygon points={arrowToPoint(arrivalPoint)} fill="black"/>
  <!-- Arrival label -->
  <text x={arrivalLabelStart.x} y={arrivalLabelStart.y - 5} font-size="10" fill="black">{arrivalTime.toLocaleTimeString()}</text>
  {/if}

  <polyline points={`${arrivalPoint.x + 1},${arrivalPoint.y} ${departurePoint.x + 1},${departurePoint.y}`} stroke="black" stroke-width="4" fill="none" />

  <!-- Departure arrow, horizontal line that turns 90 degrees and points to the departurePoint. It underlines the label for departureTime -->
  <polyline points={lineToPoint(departureLabelEnd, departurePoint)} stroke="black" stroke-width="2" fill="none"/>

  <polygon points={leftArrowToPoint(departureLabelEnd)} fill="black"/>

  <!-- Departure label -->
  <text x={departureLabelEnd.x - 35} y={departureLabelEnd.y - 5} font-size="10" fill="black">{departureTime.toLocaleTimeString()}</text>
</svg>