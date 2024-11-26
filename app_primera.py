import dash
from dash import dcc, html, Input, Output
import pandas as pd
from itertools import combinations

# Cargar el DataFrame con los datos
data = pd.read_csv('Datos/transformados/df_resultado.csv')

# Asegurarse de que los colores en hexadecimal tengan el prefijo '#'
data['hexadecimal'] = data['hexadecimal'].apply(lambda x: f"#{x}" if not x.startswith('#') else x)

# Generar todas las combinaciones posibles de dos colores
unique_colors = data['hexadecimal'].unique()
color_combinations = list(combinations(unique_colors, 2))

# Crear un DataFrame con las combinaciones
df_colors = pd.DataFrame(color_combinations, columns=['color1', 'color2'])

# Dividir las combinaciones en dos partes (primera mitad)
half_combinations = len(df_colors) // 2
df_colors_user_1_2 = df_colors[:half_combinations]

# Crear un DataFrame para almacenar las respuestas
df_responses = pd.DataFrame(columns=['color1', 'color2', 'combination', 'user'])

# Inicializar la app Dash
app = dash.Dash(__name__)

app.layout = html.Div([
    html.H1("Evaluador de combinaciones de colores (Usuarios 1 y 2)", style={'textAlign': 'center'}),

    # Contador de combinaciones
    html.Div(id='combination-counter', style={'textAlign': 'center', 'margin': '20px'}),

    # Colores a evaluar
    html.Div(id='color-box', style={'display': 'flex', 'justifyContent': 'center', 'margin': '20px'}),

    # Botones de respuesta
    html.Div([
        html.Button('Sí combinan', id='yes-button', n_clicks=0, style={'margin': '10px'}),
        html.Button('No combinan', id='no-button', n_clicks=0, style={'margin': '10px'}),
    ], style={'textAlign': 'center'}),

    # Botón para guardar
    html.Div([
        html.Button('Guardar resultados', id='save-button', n_clicks=0, style={'margin': '10px'}),
    ], style={'textAlign': 'center'}),

    # Mensaje de confirmación
    html.Div(id='save-message', style={'textAlign': 'center', 'marginTop': '20px'}),

    # Mensaje de finalización
    html.Div(id='end-message', style={'textAlign': 'center', 'marginTop': '20px', 'color': 'green'}),
])

# Variable para rastrear el índice actual
current_index = {'value': 0}

@app.callback(
    [Output('color-box', 'children'),
     Output('combination-counter', 'children'),
     Output('end-message', 'children')],
    [Input('yes-button', 'n_clicks'), Input('no-button', 'n_clicks')]
)
def update_colors(yes_clicks, no_clicks):
    """Actualiza la combinación de colores mostrada, el contador de combinaciones y muestra mensaje al final."""
    ctx = dash.callback_context
    if not ctx.triggered:
        return create_color_display(df_colors_user_1_2.iloc[current_index['value']]), f"{current_index['value'] + 1} de {len(df_colors_user_1_2)}", ""

    # Registrar respuesta
    button_id = ctx.triggered[0]['prop_id'].split('.')[0]
    if button_id == 'yes-button':
        register_response('yes', 'User 1 or 2')  # Asumimos que el usuario es 1 o 2
    elif button_id == 'no-button':
        register_response('no', 'User 1 or 2')

    # Avanzar al siguiente índice
    current_index['value'] = (current_index['value'] + 1) % len(df_colors_user_1_2)

    # Verificar si se han clasificado todas las combinaciones
    if current_index['value'] == 0:  # Esto indica que hemos completado todas las combinaciones
        end_message = "Ya has acabado con todas las combinaciones, dale a guardar los resultados"
    else:
        end_message = ""

    return create_color_display(df_colors_user_1_2.iloc[current_index['value']]), f"{current_index['value'] + 1} de {len(df_colors_user_1_2)}", end_message

def create_color_display(row):
    """Crea los cuadros de colores para mostrar."""
    return html.Div([
        html.Div(style={'backgroundColor': row['color1'], 'width': '100px', 'height': '100px', 'margin': '10px'}),
        html.Div(style={'backgroundColor': row['color2'], 'width': '100px', 'height': '100px', 'margin': '10px'}),
    ])

def register_response(combination, user):
    """Registra la respuesta en el DataFrame."""
    global df_responses
    row = df_colors.iloc[current_index['value']]
    new_entry = {'color1': row['color1'], 'color2': row['color2'], 'combination': combination, 'user': user}
    df_responses = pd.concat([df_responses, pd.DataFrame([new_entry])], ignore_index=True)

@app.callback(
    Output('save-message', 'children'),
    Input('save-button', 'n_clicks')
)
def save_results(n_clicks):
    """Guarda los resultados en un archivo CSV, eliminando el '#' de los colores."""
    if n_clicks > 0:
        # Eliminar el '#' de los valores de color antes de guardar
        df_responses['color1'] = df_responses['color1'].apply(lambda x: x.lstrip('#'))
        df_responses['color2'] = df_responses['color2'].apply(lambda x: x.lstrip('#'))
        
        df_responses.to_csv('color_combinations_responses_user_1_2.csv', index=False)
        return "¡Resultados guardados exitosamente!"
    return ""

# Ejecutar la aplicación
if __name__ == '__main__':
    app.run_server(debug=True)
