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

    // Formatear event_timestamp con Date
    data.forEach(d => {
      d.event_timestamp = new Date(d.event_timestamp);
    });

    // Procesar estadísticas de usuario
    const userStats = d3.rollups(
      data,
      events => {
        const sortedEvents = events.sort((a, b) => a.event_timestamp - b.event_timestamp);
        const totalDuration = d3.sum(sortedEvents.slice(1), (e, i) => 
          (e.event_timestamp - sortedEvents[i].event_timestamp) / 1000 
        );

        // Contar eventos por tipo
        const eventCounts = d3.rollup(
          events,
          v => v.length,
          d => d.event_name
        );

        return {
          count: events.length,
          lastEvent: sortedEvents[sortedEvents.length - 1].event_name,
          totalDuration: totalDuration,
          eventTypes: eventCounts,
          events: sortedEvents
        };
      },
      d => d.user_id
    );

    // Formatear duración
    userStats.forEach(d => {
      const totalSeconds = d[1].totalDuration;
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      d[1].formattedDuration = hours > 0 ? 
        `${hours}h ${minutes}m` : 
        minutes > 0 ? 
          `${minutes}m ${seconds}s` : 
          `${seconds}s`;
    });

    const usersData = Array.from(userStats, ([userId, stats]) => ({
      userId,
      count: stats.count,
      lastEvent: stats.lastEvent,
      totalTime: stats.totalDuration,
      formattedDuration: stats.formattedDuration,
      eventTypes: stats.eventTypes,
      events: stats.events
    }));

    const selector = document.getElementById('selectorUsuarios');
    selector.innerHTML = '<option value="">Ver todos los usuarios</option>';
    usersData.forEach(user => {
      const option = document.createElement('option');
      option.value = user.userId;
      option.textContent = `Usuario ${user.userId}`;
      selector.appendChild(option);
    });

    // Crear el contenedor principal
    const mainContainer = d3.select("#chart1")
      .html("")
      .append("div")
      .style("width", "100%")
      .style("max-width", "800px")
      .style("margin", "0 auto");

    drawBubbleChart(usersData);

    // actualizacion del gráfico al seleccionar un usuario
    selector.addEventListener('change', function() {
      const selectedUserId = this.value;
      const selectedUser = userStats.find(d => d[0] === selectedUserId);

      if (selectedUserId) {
        const selectedUser = usersData.find(d => d.userId === selectedUserId);
        drawUserInfoCard(selectedUser);
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
    container.html(''); 
  
    const width = 800;
    const height = 500;
  
    const svg = container
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .call(
        d3.zoom()
          .scaleExtent([0.5, 5]) 
          .on('zoom', (event) => {
            g.attr('transform', event.transform); 
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
      .attr('fill', (d, i) => d3.scaleSequential(d3.interpolateReds).domain([0, data.length])(i)) 
      .attr('opacity', 1)
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
                 <strong>Tiempo total en la web:</strong> ${Math.floor(d.totalTime / 3600)}h ${Math.floor((d.totalTime % 3600) / 60)}m ${Math.floor(d.totalTime % 60)}s`)
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
  // funcion para cuando se selecciona un usuario
  function drawUserInfoCard(userData) {
    const container = d3.select('#chart1');
    container.html(''); // Limpiar contenido previo

    const card = container.append('div').attr('class', 'user-card');

    card.append('h5')
        .text(`Usuario ${userData.userId}`)
        .attr('class', 'user-card-title');

    const roundedDuration = userData.formattedDuration;

    const infoList = card.append('ul').attr('class', 'user-card-info');

    infoList.append('li').html(`<strong>Total clicks:</strong> ${userData.count}`);
    infoList.append('li').html(`<strong>Tiempo total:</strong> ${roundedDuration}`);

    card.append('div')
        .attr('class', 'user-card-icon')
        .append('img')
        .attr('src', 'Lookiero-logo.png') // Enlace al icono de lookiero
        .attr('alt', 'Icono decorativo');

    card.append('div')
        .attr('class', 'user-card-footer')
        .text('Datos usuario anonimizados');
}
  
  // Llamada a la carga de datos al cargar la página
  window.onload = function() {
    loadData();
  };
/////////////////////////
