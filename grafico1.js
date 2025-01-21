///////////////////////////////////////////// GRÁFICO 1 /////////////////////////////////////////////////
// Cargar los datos desde el archivo CSV en GitHub
function loadData() {
    const csvUrl = 'https://raw.githubusercontent.com/xaabizulu/datos_visualizacion_reto10/refs/heads/main/clientes_visu.csv';
  
    d3.csv(csvUrl).then(function(data) {
      console.log(data); // Verificar que los datos se cargaron correctamente
  
      // Validar que el CSV contiene las columnas necesarias
      if (
        !data ||
        data.length === 0 ||
        !data[0].hasOwnProperty('user_id') ||
        !data[0].hasOwnProperty('event_timestamp') ||
        !data[0].hasOwnProperty('event_name')
      ) {
        console.error("El archivo CSV no contiene las columnas necesarias.");
        return;
      }
  
      // Formatear event_timestamp como objetos Date
      data.forEach(d => {
        d.event_timestamp = new Date(d.event_timestamp);
      });
  
      // Calcular el último evento y tiempo total por usuario
      const userStats = d3.rollups(
        data,
        events => {
          const sortedEvents = events.sort((a, b) => a.event_timestamp - b.event_timestamp);
          const totalDuration = d3.sum(sortedEvents.slice(1), (e, i) => 
            (e.event_timestamp - sortedEvents[i].event_timestamp) / 1000 // Duración en segundos
          );
          return {
            count: events.length,
            lastEvent: sortedEvents[sortedEvents.length - 1].event_name,
            totalTime: totalDuration.toFixed(2), // Tiempo total en segundos
          };
        },
        d => d.user_id
      );
  
      const usersData = Array.from(userStats, ([userId, stats]) => ({
        userId,
        count: stats.count,
        lastEvent: stats.lastEvent,
        totalTime: stats.totalTime,
      }));
  
      // Llenar el selector con usuarios
      const selector = document.getElementById('selectorUsuarios');
      selector.innerHTML = '<option value="">Seleccione un usuario</option>'; // Resetear opciones
      usersData.forEach(user => {
        const option = document.createElement('option');
        option.value = user.userId;
        option.textContent = user.userId;
        selector.appendChild(option);
      });
  
      // Dibujar el gráfico inicial
      drawBubbleChart(usersData);
  
      // Actualizar el gráfico al seleccionar un usuario
      selector.addEventListener('change', function() {
        const selectedUser = this.value;
        if (selectedUser) {
          const filteredData = usersData.filter(d => d.userId === selectedUser);
          drawBubbleChart(filteredData, true);
        } else {
          drawBubbleChart(usersData);
        }
      });
    }).catch(function(error) {
      console.error("Error al cargar el archivo CSV:", error);
    });
  }
  
  // Función para dibujar el gráfico de burbujas
  function drawBubbleChart(data, isFiltered = false) {
    const container = d3.select('#chart1');
    container.html(''); // Limpiar contenido previo
  
    const width = 800;
    const height = 500;
  
    const svg = container
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .call(
        d3.zoom()
          .scaleExtent([0.5, 5]) // Límites de zoom
          .on('zoom', (event) => {
            g.attr('transform', event.transform); // Aplicar zoom y pan
          })
      );
  
    const g = svg.append('g'); // Grupo para burbujas, SERÁ UTIL PARA EL ZOOM 
  
    // Crear un tooltip
    const tooltip = d3.select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0);
  
    const simulation = d3.forceSimulation(data)
      .force('x', d3.forceX(width / 2).strength(0.05))
      .force('y', d3.forceY(height / 2).strength(0.05))
      .force('collide', d3.forceCollide(d => d.count * 2 + 10)) // Tamaño proporcional a los eventos
      .on('tick', ticked);
  
    const bubbles = g.selectAll('.bubble') // CON EL RATON PODEMOS HACER ZOOM EN EL GRÁFICO
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'bubble')
      .attr('r', d => d.count * 2 + 5)
      .attr('cx', width / 2)
      .attr('cy', height / 2)
      .attr('fill', (d, i) => d3.schemeCategory10[i % 10])
      .attr('opacity', 0.8)
      .on('mouseover', function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', d.count * 2 + 10)
          .attr('opacity', 1);
  
        // Mostrar tooltip
        tooltip
          .transition()
          .duration(200)
          .style('opacity', 0.9);
        tooltip
          .html(`<strong>Usuario:</strong> ${d.userId}<br>
                 <strong>Eventos visistados en total:</strong> ${d.count}<br>
                 <strong>Última sección visitada en web:</strong> ${d.lastEvent}<br>
                 <strong>Tiempo total en la web:</strong> ${d.totalTime} segundos`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', d.count * 2 + 5)
          .attr('opacity', 0.8);
  
        // Ocultar tooltip
        tooltip
          .transition()
          .duration(500)
          .style('opacity', 0);
      });
  
    function ticked() {
      bubbles
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);
    }
  
    if (isFiltered) {
      setTimeout(() => {
        simulation.stop(); // Detener la simulación para datos filtrados
      }, 2000);
    }
  }
  
  // Llamar a la carga de datos al cargar la página
  window.onload = function() {
    loadData();
  };
/////////////////////////
