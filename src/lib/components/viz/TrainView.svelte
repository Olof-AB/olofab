<script lang="ts">
  export let arrivalPoint = { x: 10, y: 50 };
  export let departurePoint = { x: 50, y: 50 };

  export let arrivalTime : Date;
  export let departureTime : Date;

  $: arrivalLabelStart = { x: arrivalPoint.x - 30, y: arrivalPoint.y - 20 };

  function arrowToPoint(point: { x: number, y: number }) {
    return `${point.x},${point.y} ${point.x - 5},${point.y - 10} ${point.x + 5},${point.y - 10}`
  }

  function lineToPoint(fromPoint: { x: number, y: number}, toPoint: { x: number, y: number }) {
    return `${fromPoint.x},${fromPoint.y} ${toPoint.x},${fromPoint.y} ${toPoint.x},${toPoint.y - 10}`
  }
</script>

<!--
  This component is built on a horizontal line which sort of represents the platform.
-->
<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
  <!-- Arrival arrow, horizontal line that turns 90 degrees and points to the arrivalPoint. It underlines the label for arrivalTime -->
  <polyline points={lineToPoint(arrivalLabelStart, arrivalPoint)} stroke="black" stroke-width="2" fill="none"/>
  <!-- <polygon points="50,40 45,30 55,30" fill="black"/> -->
  <polygon points={arrowToPoint(arrivalPoint)} fill="black"/>
</svg>