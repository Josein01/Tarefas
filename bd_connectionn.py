# bd_connection.py
import mysql.connector
from mysql.connector import Error

db_config = {
    "host": "localhost",
    "user": "Bea",
    "password": "admin",
    "database": "pi_iii",
    "port": 3306,
}

def create_connection():
    conn = None
    try:
        conn = mysql.connector.connect(**db_config)
        if conn.is_connected():
            print("Conexão com o MySQL estabelecida com sucesso!")
        return conn
    except Error as e:
        print(f"Erro ao conectar ao MySQL: {e}")
        return None

def close_connection(conn):
    if conn and conn.is_connected():
        conn.close()
        print("Conexão com o MySQL encerrada.")
