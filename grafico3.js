d3.csv('https://raw.githubusercontent.com/xaabizulu/datos_visualizacion_reto10/refs/heads/main/prendas.csv').then(function(datosInventadosGrafico3) {
  // Eliminar columna innecesaria
  datosInventadosGrafico3.forEach(d => {
    delete d['Unnamed: 0'];
  });

  console.log(datosInventadosGrafico3[0]); 
  d3.select("#chart3").selectAll("*").remove();

  const ordenTallas = ["XS", "S", "M", "L", "XL"];
  
  const datosAgrupadosGrafico3 = Array.from(d3.group(datosInventadosGrafico3, d => d.Prenda), ([key, values]) => {
    console.log(key, values);  // Verifica los valores agrupados
    return {
      key,
      values,
      count: values.length,
      tallas: d3.rollup(values, v => v.length, d => d.Talla)  // Agrupar por Talla y contar
    };
  });

  const width = 800;
  const height = 800;
  const innerRadius = 80;
  const outerRadius = Math.min(width, height) / 2 - 60;

  const svg = d3.select("#chart3")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const chartGroup = svg.append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`);

  const colorScale = d3.scaleOrdinal()
    .domain(ordenTallas)
    .range(['#ff9999', '#ff6666', '#ff3333', '#ff0000', '#cc0000']);

  const x = d3.scaleBand()
    .domain(datosAgrupadosGrafico3.map(d => d.key))
    .range([0, 2 * Math.PI])
    .padding(0.1);

  const y = d3.scaleRadial()
    .domain([0, d3.max(datosAgrupadosGrafico3, d => d.count)])
    .range([innerRadius, outerRadius]);

  const tooltip2 = d3.select("body").append("div")
    .attr("class", "tooltip2")
    
  const bars = chartGroup.append("g")
    .selectAll("g")
    .data(datosAgrupadosGrafico3)
    .join("g")
    .attr("class", "clothing-item");

  // Barras apiladas
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
        .datum(item) // Asignar el dato asociado al arco
        .attr("d", d3.arc()
          .innerRadius(y(cumSum))
          .outerRadius(y(cumSum + item.count))
          .startAngle(startAngle)
          .endAngle(endAngle)
        )
        .attr("fill", colorScale(item.talla))
        .attr("stroke", "white")
        .attr("stroke-width", 1)
        .on("mouseover", function(event, d) {
          const item = d3.select(this).datum();  // Obtener el dato de la barra actual
          console.log(item);
          const talla = item.talla;  
          const count = item.count;  
        
          d3.select(this)
            .transition()
            .duration(200)
            .attr("opacity", 0.8)
            .attr("transform", "scale(1.05)");
        
          tooltip2.transition()
            .duration(200)
            .style("opacity", 0.9);
        
            tooltip2
            .classed("show", true) // Añade la clase 'show'
            .html(`
              <strong>Prenda:</strong> ${d.key}<br/>
              <strong>Talla:</strong> ${d.talla}<br/>
              <strong>Cantidad:</strong> ${d.count}
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
  
          tooltip2.transition()
            .duration(500)
            .style("opacity", 0);
        })
        .on("click", function() {
          const angle = (startAngle + endAngle) / 2;
          chartGroup.transition()
            .duration(1000)
            .attr("transform", `translate(${width / 2},${height / 2}) rotate(${-angle * 180 / Math.PI})`);
        });
  
      cumSum += item.count;
    });
  });

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

});
