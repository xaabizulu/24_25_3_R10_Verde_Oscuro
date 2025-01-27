// Generación de datos aleatorios con atributos más detallados, se explica en README_VISU.md el por qué de esto
const generateRandomData = () => {
    const categories = ["Camiseta", "Pantalón", "Abrigo", "Chaqueta", "Sudadera", "Falda"];
    const sizes = ["S", "M", "L", "XL"];
    const seasons = ["Verano", "Otoño", "Invierno", "Primavera"];
    const colors = ["roja", "azul", "verde", "amarilla", "morado", "negra", "marrón", "gris"];
    const fabrics = ["Algodón", "Denim", "Lana", "Cuero", "Poliéster", "Lino"];

    return Array.from({ length: 100 }, (_, i) => {
        const category = categories[Math.floor(Math.random() * categories.length)];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const fabric = fabrics[Math.floor(Math.random() * fabrics.length)];
        const size = sizes[Math.floor(Math.random() * sizes.length)];
        const season = seasons[Math.floor(Math.random() * seasons.length)];

        return {
            id: i + 1,
            category,
            price: Math.floor(Math.random() * 100) + 20, 
            size,
            season,
            color,
            fabric,
            description: `${category} ${color} ${fabric} - Talla: ${size}` 
        };
    });
};

const data = generateRandomData();


// Calculo el precio medio por categoría
const calculateAveragePriceByCategory = () => {
    const categories = Array.from(new Set(data.map(d => d.category)));
    return categories.map(category => {
        const prices = data.filter(d => d.category === category).map(d => d.price);
        const avgPrice = prices.reduce((acc, price) => acc + price, 0) / prices.length;
        return { category, avgPrice };
    });
};

const averageData = calculateAveragePriceByCategory();

const margin = { top: 20, right: 30, bottom: 40, left: 40 };
const width = 500;
const height = 270;

const svg = d3.select("#chart2")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);


// Escalas
const x = d3.scaleBand()
  .domain(data.map(d => d.category))
  .range([0, width])
  .padding(0.1);

const y = d3.scaleLinear()
  .domain([0, d3.max(data, d => d.price)])
  .nice()
  .range([height, 0]);

const color = d3.scaleOrdinal()
  .domain(data.map(d => d.category))
  .range(["#ff9999", "#ff6666", "#ff4d4d", "#ff3333", "#e60000", "#cc0000", "#990000"]);

// Crear las interacciones para el gráfico de barras y de dispersión
let currentGraphType = 'scatter'; // Por defecto, es un gráfico de dispersión AL PRINCIPIo, luego se puede cambiar


const drawChart = () => {
  svg.selectAll("*").remove(); // Limpio el gráfico antes de redibujarlo

  if (currentGraphType === 'scatter') {
    svg.selectAll(".dot")
      .data(data)
      .enter().append("circle")
      .attr("class", "dot")
      .attr("cx", d => x(d.category) + x.bandwidth() / 2)
      .attr("cy", d => y(d.price))
      .attr("r", 10)
      .style("fill", d => color(d.category))
      .on("mouseover", function (event, d) {
        d3.select(this).transition().duration(200).attr("r", 15);
        tooltip.style("opacity", 1)
          .html(`Producto: ${d.description}<br>Precio: $${d.price}<br>Tamaño: ${d.size}<br>Temporada: ${d.season}`)
          .style("left", (event.pageX + 5) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function () {
        d3.select(this).transition().duration(200).attr("r", 10);
        tooltip.style("opacity", 0);
      });
      svg.append("text")
      .attr("x", -height / 2) 
      .attr("y", -margin.left + 10) 
      .attr("transform", "rotate(-90)") 
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .text("Precio ($)");


    // Ejes
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    svg.append("g")
      .call(d3.axisLeft(y));
    } else if (currentGraphType === 'bar') {
        svg.selectAll(".bar")
          .data(averageData)
          .enter().append("rect")
          .attr("class", "bar")
          .attr("x", d => x(d.category))
          .attr("y", d => y(d.avgPrice))
          .attr("width", x.bandwidth())
          .attr("height", d => height - y(d.avgPrice))
          .style("fill", d => color(d.category))
          .on("mouseover", function (event, d) {
            d3.select(this).transition().duration(200).style("fill", "orange"); // Resaltar barra
            tooltip.style("opacity", 1)
            .html(`Categoría: ${d.category}<br>Precio Medio: $${d.avgPrice.toFixed(2)}`)
            .style("left", (event.pageX + 5) + "px")
              .style("top", (event.pageY - 28) + "px");
          })
          .on("mouseout", function (event, d) {
            d3.select(this).transition().duration(200).style("fill", color(d.category)); // Restaurar color
            tooltip.style("opacity", 0);
          })
          .on("click", function (event, d) {
            alert(`La media del precio para ${d.category} es $${d.avgPrice.toFixed(2)}`);
          });
    
        // Ejes
        svg.append("g")
          .attr("transform", `translate(0,${height})`)
          .call(d3.axisBottom(x));
          svg.append("text")
          .attr("x", -height / 2) 
          .attr("y", -margin.left + 10) 
          .attr("transform", "rotate(-90)") 
          .style("text-anchor", "middle")
          .style("font-size", "12px")
          .text("Precio ($)")

        svg.append("g")
          .call(d3.axisLeft(y));
      }
    };
    
    // Tooltip
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("opacity", 0)
      .style("background-color", "rgba(0, 0, 0, 0.7)")
      .style("color", "white")
      .style("border-radius", "5px")
      .style("padding", "5px")
      .style("pointer-events", "none");
    
    // La Función para cambiar el tipo de gráfico
    const changeGraphType = (type) => {
      currentGraphType = type;
      drawChart();
    };
    
    drawChart();