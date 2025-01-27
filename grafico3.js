d3.csv('https://raw.githubusercontent.com/xaabizulu/datos_visualizacion_reto10/refs/heads/main/prendas.csv').then(function(datosInventadosGrafico3) {
  // Clear existing chart
  d3.select("#chart3").selectAll("*").remove();

  // Sort sizes
  const ordenTallas = ["XS", "S", "M", "L", "XL"];
  
  // Group data
  const datosAgrupadosGrafico3 = Array.from(d3.group(datosInventadosGrafico3, d => d.Prenda), ([key, values]) => ({
    key,
    values,
    count: values.length,
    tallas: d3.rollup(values, v => v.length, d => d.Talla)
  }));

  // Chart configuration
  const width = 800;
  const height = 800;
  const innerRadius = 80;
  const outerRadius = Math.min(width, height) / 2 - 60;

  // Create SVG
  const svg = d3.select("#chart3")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const chartGroup = svg.append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`);

  // Color scale with custom colors
  const colorScale = d3.scaleOrdinal()
    .domain(ordenTallas)
    .range(['#ff9999', '#ff6666', '#ff3333', '#ff0000', '#cc0000']);

  // Scale for the circular axis
  const x = d3.scaleBand()
    .domain(datosAgrupadosGrafico3.map(d => d.key))
    .range([0, 2 * Math.PI])
    .padding(0.1);

  // Scale for bar height
  const y = d3.scaleRadial()
    .domain([0, d3.max(datosAgrupadosGrafico3, d => d.count)])
    .range([innerRadius, outerRadius]);

  // Create tooltip
  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background-color", "white")
    .style("padding", "10px")
    .style("border", "1px solid #ccc")
    .style("border-radius", "5px")
    .style("pointer-events", "none")
    .style("opacity", 0);

  // Add circular grid lines
  const gridCircles = chartGroup.append("g")
    .attr("class", "grid-circles");

  const gridValues = y.ticks(5);
  gridCircles.selectAll("circle")
    .data(gridValues)
    .join("circle")
    .attr("r", y)
    .attr("fill", "none")
    .attr("stroke", "#ddd")
    .attr("stroke-dasharray", "2,2");

  // Add grid labels
  gridCircles.selectAll(".grid-label")
    .data(gridValues)
    .join("text")
    .attr("class", "grid-label")
    .attr("y", d => -y(d))
    .attr("dx", "0.5em")
    .attr("dy", "0.3em")
    .text(d => d)
    .style("font-size", "10px")
    .style("fill", "#666");

  // Create bars for each clothing item
  const bars = chartGroup.append("g")
    .selectAll("g")
    .data(datosAgrupadosGrafico3)
    .join("g")
    .attr("class", "clothing-item");

  // Add stacked bars for each size
  bars.each(function(d) {
    const group = d3.select(this);
    let stackedData = Array.from(d.tallas, ([talla, count]) => ({
      talla,
      count,
      key: d.key
    })).sort((a, b) => ordenTallas.indexOf(a.talla) - ordenTallas.indexOf(b.talla));
    
    let cumSum = 0;
    stackedData.forEach(item => {
      const startAngle = x(d.key);
      const endAngle = startAngle + x.bandwidth();
      
      group.append("path")
        .attr("d", d3.arc()
          .innerRadius(y(cumSum))
          .outerRadius(y(cumSum + item.count))
          .startAngle(startAngle)
          .endAngle(endAngle)
        )
        .attr("fill", colorScale(item.talla))
        .attr("stroke", "white")
        .attr("stroke-width", 1)
        .on("mouseover", function(event) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr("opacity", 0.8)
            .attr("transform", "scale(1.05)");

          tooltip.transition()
            .duration(200)
            .style("opacity", 0.9);

          tooltip.html(`
              <strong>Prenda:</strong> ${item.key}<br/>
              <strong>Talla:</strong> ${item.talla}<br/>
              <strong>Cantidad:</strong> ${item.count}
          `)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
          d3.select(this)
            .transition()
            .duration(200)
            .attr("opacity", 1)
            .attr("transform", "scale(1)");

          tooltip.transition()
            .duration(500)
            .style("opacity", 0);
        })
        .on("click", function() {
          // Rotate chart to center clicked segment
          const angle = (startAngle + endAngle) / 2;
          chartGroup.transition()
            .duration(1000)
            .attr("transform", `translate(${width / 2},${height / 2}) rotate(${-angle * 180 / Math.PI})`);
        });
      
      cumSum += item.count;
    });
  });

  // Add labels for clothing items
  const labels = chartGroup.append("g")
    .selectAll("g")
    .data(datosAgrupadosGrafico3)
    .join("g")
    .attr("class", "label")
    .attr("transform", d => {
      const angle = x(d.key) + x.bandwidth() / 2;
      const radius = outerRadius + 20;
      return `
        rotate(${(angle * 180 / Math.PI - 90)})
        translate(${radius},0)
        ${angle > Math.PI ? "rotate(180)" : ""}
      `;
    });

  labels.append("text")
    .attr("text-anchor", d => {
      const angle = x(d.key) + x.bandwidth() / 2;
      return angle > Math.PI ? "end" : "start";
    })
    .text(d => d.key)
    .style("font-size", "12px")
    .style("font-weight", "bold");

  // Add legend (independent from the rotating group)
  const legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${20}, ${20})`);

  const legendItems = legend.selectAll("g")
    .data(ordenTallas)
    .join("g")
    .attr("transform", (d, i) => `translate(0, ${i * 20})`);

  legendItems.append("rect")
    .attr("width", 15)
    .attr("height", 15)
    .attr("fill", d => colorScale(d));

  legendItems.append("text")
    .attr("x", 20)
    .attr("y", 12)
    .text(d => `Size ${d}`)
    .style("font-size", "12px");

  // Add center text with total items
  const totalItems = d3.sum(datosAgrupadosGrafico3, d => d.count);
  chartGroup.append("text")
    .attr("class", "center-text")
    .attr("text-anchor", "middle")
    .attr("dy", "-0.5em")
    .style("font-size", "24px")
    .style("font-weight", "bold")
    .text(totalItems);

  chartGroup.append("text")
    .attr("class", "center-text")
    .attr("text-anchor", "middle")
    .attr("dy", "1em")
    .style("font-size", "14px")
    .text("Total Items");
});
