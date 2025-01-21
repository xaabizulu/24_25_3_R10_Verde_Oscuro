///////////////////////////////////////////// CONFIGURACIÓN INICIAL /////////////////////////////////////////////////

// Función para mostrar una página
function showPage(pageId) {
  const pages = document.querySelectorAll('.page');
  const header = document.getElementById('main-header');

  // Ocultar todas las páginas
  pages.forEach(page => {
    page.style.display = 'none';
  });

  // Mostrar la página seleccionada
  document.getElementById(pageId).style.display = 'block';

  // Mostrar u ocultar el header según la página
  if (pageId === 'main-menu') {
    header.style.display = 'block'; // Mostrar header en la página principal
  } else {
    header.style.display = 'none'; // Ocultar header en otras páginas
  }

  // Llamar a la función para cargar los gráficos específicos cuando se muestra la página correspondiente
  if (pageId === 'page1') {
    loadGrafico1();  // Función que carga el gráfico 1
  } else if (pageId === 'page2') {
    loadGrafico2();  // Función que carga el gráfico 2
  } else if (pageId === 'page3') {
    loadGrafico3();  // Función que carga el gráfico 3
  }
}

// Configuración inicial para cargar siempre el menú principal al inicio
document.addEventListener('DOMContentLoaded', () => {
  showPage('main-menu');
});

