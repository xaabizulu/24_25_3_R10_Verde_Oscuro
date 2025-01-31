import json
from confluent_kafka import Consumer, KafkaException
import pandas as pd
import numpy as np
import pickle
import networkx as nx

consumer = Consumer({
    'bootstrap.servers': 'localhost:9092',
    'group.id': 'mygroup',
    'auto.offset.reset': 'earliest'
})

consumer.subscribe(['reto_10'])

# Cargar el DataFrame de características con todos los valores únicos por columna
df_caracteristicas = pd.read_csv("caracteristicas_nodos_bg.csv")  # Suponiendo que lo tienes en CSV

output_data = []

try:
    while True:
        msg = consumer.poll(1.0)
        if msg is None:
            continue
        if msg.error():
            if msg.error().code() == KafkaException._PARTITION_EOF:
                break
            else:
                print(f"Error: {msg.error()}")
                continue

        instancia = json.loads(msg.value().decode('utf-8'))
        print(f"\nRecibido: {instancia}")

        dummies = pd.get_dummies(df_caracteristicas, dtype=int)

        # F
        def obtener_carac(df_caracteristicas_nodos, df_codificado):
            nuevo_label = int(df_caracteristicas_nodos['label'].iloc[-1]) + 1
            instancia['label'] = nuevo_label

            df_caracteristicas_prenda_nueva = pd.DataFrame([instancia])
            df_caracteristicas_nodos_nuevo = pd.concat([df_caracteristicas_nodos, df_caracteristicas_prenda_nueva], ignore_index=True)
            dummies_prenda_nueva = pd.get_dummies(df_caracteristicas_prenda_nueva, dtype=int)
            columnas_categoricas = df_codificado.columns
            columnas_categoricas = df_codificado.columns[columnas_categoricas != 'label']
            dummies_prenda_nueva = dummies_prenda_nueva.reindex(columns=columnas_categoricas, fill_value=0)

            return df_caracteristicas_prenda_nueva, df_caracteristicas_nodos_nuevo

        df_caracteristicas_prenda_nueva, df_caracteristicas_nodos_nuevo = obtener_carac(df_caracteristicas, dummies)

        nodo_nuevo = df_caracteristicas_prenda_nueva['label'].item()
        print(f"Nodo nuevo: {nodo_nuevo}")
        df_caracteristicas_nodos_nuevo = pd.DataFrame(df_caracteristicas_nodos_nuevo)
        
        


       
        # Función para calcular la similitud entre dos nodos
        def calcular_similitud(node1, node2, df_caracteristicas_nodos):
            row1 = df_caracteristicas_nodos[df_caracteristicas_nodos["label"] == node1]
            row2 = df_caracteristicas_nodos[df_caracteristicas_nodos["label"] == node2]

            temperatura_map = {'cold': 0, 'warm': 1}
            temperatura_diff = abs(temperatura_map.get(row1['weather'].item(), -1) - temperatura_map.get(row2['weather'].item(), -1))

            formalidad_map = {'formal': 1, 'informal': 0}
            formalidad_diff = abs(formalidad_map.get(row1.formalidad.item(), -1) - formalidad_map.get(row2.formalidad.item(), -1))

            adventurous_diff = abs(int(row1.adventurous.item()) - int(row2.adventurous.item())) / (5 - 1)
            feature_diff = np.array([adventurous_diff, temperatura_diff, formalidad_diff])
            similaridad = feature_diff.sum()

            if row1.color.item() == row2.color.item():
                similaridad += 0
            else:
                similaridad += 1

            if row1.estampado.item() == row2.estampado.item():
                similaridad += 0
            else:
                similaridad += 1

            if row1.estilo.item() == row2.estilo.item():
                similaridad += 0
            else:
                similaridad += 1

            if row1.fit.item() == row2.fit.item():
                similaridad += 0
            else:
                similaridad += 1

            if row1.application.item() == row2.application.item():
                similaridad += 0
            else:
                similaridad += 1

            return similaridad

        # Función para encontrar el nodo más similar
        def encontrar_nodo_mas_similar(nodo_inicial, df_caracteristicas_nodos):
            caracteristicas_nodo_objetivo = df_caracteristicas_nodos[df_caracteristicas_nodos["label"] == nodo_inicial]
            subnivel = caracteristicas_nodo_objetivo["subnivel"]
            df = df_caracteristicas_nodos[df_caracteristicas_nodos["subnivel"] == subnivel.item()]
            nodos = df["label"].unique()
            nodo_mas_similar = None
            similitud_minima = float('inf')

            for nodo in nodos:
                if int(nodo) != int(nodo_inicial):  # No comparar el nodo consigo mismo
                    similitud = calcular_similitud(nodo_inicial, nodo, df_caracteristicas_nodos)
                    if similitud < similitud_minima:
                        similitud_minima = similitud
                        nodo_mas_similar = nodo
            return nodo_mas_similar, similitud_minima



        # NODO MAS SIMILAR
        nodo_mas_similar,similitud_minima = encontrar_nodo_mas_similar(nodo_nuevo,df_caracteristicas_nodos_nuevo)
        print()
        print(f'El nodo mas similar al nodo {nodo_nuevo} es el nodo {nodo_mas_similar}')

        #-----------------------------------------------------------------------------------------------------------

        # CONEXIONES NUEVO NODO
        with open('grafo.pkl', 'rb') as file:
            G7 = pickle.load(file)

        # Obtén las conexiones del nodo
        conexiones_nodo_mas_similar = list(G7.neighbors(int(nodo_mas_similar)))

        df_filtrado = df_caracteristicas_nodos_nuevo[df_caracteristicas_nodos_nuevo.index.isin(conexiones_nodo_mas_similar)]

        # Muestra las primeras 5 filas del DataFrame filtrado
        print()
        print('Aqui sus primeras 5 conexiones:')
        print(df_filtrado.head())


        #-----------------------------------------------------------------------------------------------------------

        # Triangulos del nodo
        import numpy as np
        from itertools import combinations

        def media_geometrica(lista):
            """Calcula la media geométrica de una lista de números."""
            return np.exp(np.mean(np.log(lista)))

        def es_valido_triangulo(nodo1, nodo2, nodo3, G):
            """Verifica si el triángulo cumple con las condiciones del 'look' basadas en los niveles de las prendas."""

            # Extraemos los niveles de las prendas del cuarto atributo de cada nodo
            nivel1 = G.nodes[nodo1].get('feature', [])[3]  # El cuarto atributo es el nivel
            nivel2 = G.nodes[nodo2].get('feature', [])[3]  # El cuarto atributo es el nivel
            nivel3 = G.nodes[nodo3].get('feature', [])[3]  # El cuarto atributo es el nivel

            # Si alguno de los nodos no tiene un 'nivel_prenda' válido, el triángulo no es válido
            if nivel1 is None or nivel2 is None or nivel3 is None:
                return False

            # Si hay un nivel 1.2, las otras dos prendas deben ser 3.x y de subniveles distintos
            if nivel1 == 1.2 or nivel2 == 1.2 or nivel3 == 1.2:
                niveles_restantes = [nivel for nivel in [nivel1, nivel2, nivel3] if nivel != 1.2]
                if sorted(niveles_restantes) != [3.0, 3.1]:  # Los niveles restantes deben ser 3.x y distintos
                    return False
            else:
                # Si no hay nivel 1.2, debe haber un nodo de cada nivel (1.1, 1.2, 2.x o 3.x)
                niveles = [nivel1, nivel2, nivel3]
                if len(set(niveles)) != 3:  # Todos los niveles deben ser diferentes
                    return False
                # Verificar que hay al menos un nivel de cada tipo: 1.x, 2.x, 3.x
                if not any(nivel in [1.1, 1.2] for nivel in niveles) or not any(nivel == 2.0 for nivel in niveles) or not any(nivel >= 3.0 for nivel in niveles):
                    return False

            return True 

        def obtener_triangulos_para_nodo_validos(G, nodo_objetivo):
            triangulos_validos = []  # Lista para almacenar los triángulos válidos con sus medias geométricas

            # Obtenemos los vecinos del nodo objetivo
            vecinos = list(G.neighbors(nodo_objetivo))

            # Generamos combinaciones de pares de vecinos
            for vecino1, vecino2 in combinations(vecinos, 2):
                # Comprobamos si existe una arista entre los dos vecinos, formando un triángulo
                if G.has_edge(vecino1, vecino2):
                    # Verificar si el triángulo es válido según la función es_valido_triangulo
                    if es_valido_triangulo(nodo_objetivo, vecino1, vecino2, G):
                        # Si el triángulo es válido, guardamos los tres nodos y la media geométrica de las ponderaciones
                        ponderaciones = [G[nodo_objetivo][vecino1].get('weight', 1),
                                         G[nodo_objetivo][vecino2].get('weight', 1),
                                         G[vecino1][vecino2].get('weight', 1)]
                        media = media_geometrica(ponderaciones)
                        triangulos_validos.append(((nodo_objetivo, vecino1, vecino2), media))

            return triangulos_validos



        
        # Asumiendo que 'G7' es tu grafo y 'nodo_objetivo' es el nodo de interés
        triangulos_validos = obtener_triangulos_para_nodo_validos(G7, nodo_objetivo=nodo_mas_similar)

        # Ordenar los triángulos válidos por la media geométrica en orden descendente
        triangulos_validos_ordenados = sorted(triangulos_validos, key=lambda x: x[1], reverse=True)

        # Obtener los primeros 3 triángulos
        primeros_tres_triangulos = triangulos_validos_ordenados[:3]

        # Imprimir las filas de 'df_caracteristicas_nodos_nuevo' para los 3 nodos de los primeros triángulos
        print()
        print(f"Primeros 3 looks válidos con las características de las prendas:")

        for triangulo in primeros_tres_triangulos:
            # Mostrar el triángulo sin los tipos numpy
            nodos = triangulo[0]  # Los tres nodos del triángulo
            media_geometrica = triangulo[1]  # La media geométrica
    
            # Convertir los nodos a tipos nativos (int)
            nodos_convertidos = tuple([int(nodo) if isinstance(nodo, np.generic) else nodo for nodo in nodos])   
            nodos_convertidos = (nodo_nuevo,) + nodos_convertidos[1:]
            media_geometrica_convertida = float(media_geometrica) if isinstance(media_geometrica, np.generic) else media_geometrica
    
            print('+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++')
            print(f"\nLOOK: {nodos_convertidos} con media geométrica {media_geometrica_convertida}")
    
            # Mostrar las características de las prendas para cada nodo
            for nodo in nodos_convertidos:
                fila = df_caracteristicas_nodos_nuevo[df_caracteristicas_nodos_nuevo['label'] == nodo]
                print('-------------')
                print(fila)

except KeyboardInterrupt:
    pass
finally:
    with open('datos_etiquetados.json', 'w') as f:
        json.dump(output_data, f, indent=4)
    consumer.close()





