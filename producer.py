import dash
from dash import dcc, html, Input, Output
import dash_bootstrap_components as dbc
from confluent_kafka import Producer
import pandas as pd
import json
import random

# Leer el archivo CSV (asegúrete de que la ruta sea correcta)
prendas_df = pd.read_csv('caracteristicas_nodos_bg.csv').drop(columns=['label'])  # Ajusta la ruta del archivo CSV
prendas_df = prendas_df.fillna('No disponible')

# Obtener las columnas y sus valores únicos
columnas_y_valores = {col: prendas_df[col].unique().tolist() for col in prendas_df.columns}

# Configurar el productor de Kafka
producer = Producer({'bootstrap.servers': 'localhost:9092'})

def acked(err, msg):
    if err is not None:
        print(f"Error enviando mensaje: {err}")
    else:
        print(f"Mensaje enviado a {msg.topic()} [{msg.partition()}]")

# Crear la app de Dash
app = dash.Dash(__name__, external_stylesheets=[dbc.themes.BOOTSTRAP])

# Crear la interfaz de usuario con Bootstrap
app.layout = dbc.Container(
    [
        dbc.Row(
            dbc.Col(
                dbc.Card(
                    dbc.CardBody(
                        [
                            html.H2("Selecciona valores para las Prendas", className="card-title text-center"),
                            html.P("Por favor, elige las características de la prenda:", className="text-center"),
                            
                            *[dbc.Row([
                                dbc.Col(dbc.Label(f"Selecciona {col}:", className="fw-bold"), width=3),
                                dbc.Col(
                                    dcc.Dropdown(
                                        id=col,
                                        options=[{'label': str(i), 'value': i} for i in valores],
                                        value=valores[0]
                                    ),
                                    width=9
                                )
                            ], className="mb-2") for col, valores in columnas_y_valores.items()],
                            
                            html.Br(),
                            dbc.Button("Enviar", id="submit-button", color="primary", className="mt-2"),
                            dbc.Button("Generar nueva instancia aleatoria", id="generate-random-button", color="secondary", className="mt-2 ms-2"),
                            html.Br(),
                            html.Div(id='output', className="mt-3")
                        ]
                    ),
                    className="shadow-lg p-4 mb-5 bg-white rounded",
                    style={"width": "90%", "margin": "auto", "marginTop": "300px"}  # Ajuste de ancho y margen superior
                ),
                width=12
            )
        )
    ],
    className="d-flex justify-content-center align-items-center vh-100"
)

@app.callback(
    Output('output', 'children'),
    [Input('submit-button', 'n_clicks'),
     Input('generate-random-button', 'n_clicks')],
    [Input(col, 'value') for col in columnas_y_valores.keys()]
)
def update_output(n_clicks_submit, n_clicks_generate, *values):
    n_clicks_submit = n_clicks_submit or 0
    n_clicks_generate = n_clicks_generate or 0

    if n_clicks_submit > 0:
        selected_values = dict(zip(columnas_y_valores.keys(), values))
        selected_values_json = json.dumps(selected_values)
        if 'No disponible' in selected_values.values():
            return "No se puede enviar la prenda, alguna característica tiene 'No disponible'."
        producer.produce('reto_10', value=selected_values_json, callback=acked)
        producer.flush()
        return f"Respuestas enviadas: {selected_values}"
    elif n_clicks_generate > 0:
        random_values = {col: random.choice(prendas_df[col].tolist()) for col in prendas_df.columns}
        while any((prendas_df[col] == random_values[col]).all() for col in random_values):
            random_values = {col: random.choice(prendas_df[col].tolist()) for col in prendas_df.columns}
        random_values_json = json.dumps(random_values)
        producer.produce('reto_10', value=random_values_json, callback=acked)
        producer.flush()
        return f"Instancia aleatoria generada y enviada: {random_values}"
    return ""

if __name__ == '__main__':
    app.run_server(debug=True)