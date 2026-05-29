import pandas as pd
from sqlalchemy import create_engine

caminho_csv = r"C:\Users\Windows\OneDrive\Área de Trabalho\import csv pandas\acidentes_tratado_COMPLETO.csv"

df = pd.read_csv(caminho_csv)

usuario = "postgres"
senha = "postgres123"
host = "localhost"
porta = "5432"
banco = "acidentes_db"

engine = create_engine(
    f"postgresql+psycopg2://{usuario}:{senha}@{host}:{porta}/{banco}"
)

print(df.shape)

df.to_sql(
    "acidentes_tratados",
    engine,
    if_exists="replace",
    index=False
)

print("Dados enviados com sucesso!")