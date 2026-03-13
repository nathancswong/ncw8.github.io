import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const width = 800;
const height = 600;
const maxCircles = 10;

const svg = d3.select("#visContainer") 
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .style("border", "1px solid #eaeaea")
  .style("border-radius", "16px")
  .style("box-shadow", "0 4px 20px rgba(0,0,0,0.05)")
  .style("cursor", "crosshair");

let circleData = [];

const calmColors = [
  "#a8c7fa", "#c2e7ff", "#b3e5fc", "#b2dfdb", 
  "#c8e6c9", "#f1f8e9", "#fff9c4", "#ffecb3", 
  "#ffe0b2", "#ffccbc"
];
const colorScale = d3.scaleOrdinal(calmColors);

//d3 drag behavior for circles
const dragHandler = d3.drag()
  .on("start", function(event, d) {
    // Stop the breathing animation immediately so it doesn't fight the drag
    d3.select(this).interrupt(); 
    // Bring the dragged circle to the front and add a subtle stroke
    d3.select(this).raise().style("stroke", "#000").style("stroke-width", 3);
  })
  .on("drag", function(event, d) {
    // Update the underlying data coordinates
    d.x = event.x;
    d.y = event.y;
    // Update the visual circle's position
    d3.select(this).attr("cx", d.x).attr("cy", d.y);
  })
  .on("end", function(event, d) {
    // Remove the stroke when dropped
    d3.select(this).style("stroke", null);
    // Restart the breathing animation from its new location
    breatheAndDrift.call(this);
  });

svg.on("click", function(event) {
  // Prevent creating a new circle if we are just dragging an existing one
  if (event.defaultPrevented) return; 

  const [x, y] = d3.pointer(event);

  circleData.push({
    id: Date.now(),
    x: x,
    y: y,
    color: colorScale(circleData.length % 10),
    baseRadius: Math.random() * 30 + 30 
  });

  if (circleData.length > maxCircles) {
    circleData.shift(); 
  }

  updateVis();
});



function updateVis() {
  const circles = svg.selectAll("circle")
    .data(circleData, d => d.id);

  circles.exit()
    .transition()
    .duration(1500)
    .attr("r", d => d.baseRadius * 1.5) 
    .style("opacity", 0) 
    .remove();

  const enterCircles = circles.enter()
    .append("circle")
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .attr("r", 0)
    .style("fill", d => d.color)
    .style("mix-blend-mode", "multiply")
    .style("opacity", 0)
    .call(dragHandler);  

  enterCircles.transition()
    .duration(1200)
    .ease(d3.easeQuadOut)
    .attr("r", d => d.baseRadius)
    .style("opacity", 0.6)
    .on("end", breatheAndDrift); 
}