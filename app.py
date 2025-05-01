from flask import Flask, render_template, request, redirect, url_for, jsonify, session, flash
from db_connection import create_connection, close_connection
import hashlib

app = Flask(__name__)
app.secret_key = "Shadow_4EVER"

# Função auxiliar para gerar o hash da senha
def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

# Rota para criar conta (ajustada para o HTML fornecido)
@app.route("/login/criar_conta", methods=["GET", "POST"])
def criar_conta():
    if request.method == "POST":
        nome = request.form.get("nome")
        sobrenome = request.form.get("sobrenome")
        email = request.form.get("email")
        senha = request.form.get("senha")
        confirmar_senha = request.form.get("confirmar_senha")

        # Validação básica (senhas iguais)
        if senha != confirmar_senha:
            return redirect(url_for("criar_conta"))  # Redireciona sem mensagem

        # Verifica se o e-mail já existe
        conn = create_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM Usuario WHERE EmailUsuario = %s", (email,))
        if cursor.fetchone():
            cursor.close()
            close_connection(conn)
            return redirect(url_for("criar_conta"))  # Redireciona sem mensagem

        # Cria o usuário no banco de dados
        hashed_senha = hash_password(senha)
        cursor.execute(
            "INSERT INTO Usuario (NomeUsuario, SobrenomeUsuario, EmailUsuario, senhaUsuario) VALUES (%s, %s, %s, %s)",
            (nome, sobrenome, email, hashed_senha),
        )
        conn.commit()
        usuario_id = cursor.lastrowid
        cursor.close()
        close_connection(conn)

        # Login automático
        session["usuario_id"] = usuario_id
        session["nome"] = nome
        return redirect(url_for("home"))  # Redireciona para a home após cadastro

    return render_template("criar_conta.html") 

# Rota para login
@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        email = request.form.get("email")
        senha = request.form.get("password")

        conn = create_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM Usuario WHERE EmailUsuario = %s", (email,))
        usuario = cursor.fetchone()
        cursor.close()
        close_connection(conn)

        if usuario and usuario["senhaUsuario"] == hash_password(senha):
            session["usuario_id"] = usuario["idUsuario"]
            session["nome"] = usuario["NomeUsuario"]
            flash("Login realizado com sucesso!")
            return redirect(url_for("home"))
        else:
            flash("E-mail ou senha incorretos.")
            return redirect(url_for("login"))

    return render_template("login.html")

# Rotas para Listas
@app.route("/listas", methods=["GET", "POST"])
def listas():
    if "usuario_id" not in session:
        return redirect(url_for("login"))

    usuario_id = session["usuario_id"]

    if request.method == "POST":
        texto_lista = request.form.get("txtLista")
        conn = create_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO Lista (txtLista, Usuario_idUsuario) VALUES (%s, %s)",
            (texto_lista, usuario_id)
        )
        conn.commit()
        cursor.close()
        close_connection(conn)
        flash("Lista criada com sucesso!")
        return redirect(url_for("listas"))

    # Obter listas do usuário
    conn = create_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        "SELECT * FROM Lista WHERE Usuario_idUsuario = %s", (usuario_id,))
    listas = cursor.fetchall()
    cursor.close()
    close_connection(conn)

    return render_template("listas.html", listas=listas)

# Rotas para Notas
@app.route("/notas", methods=["GET", "POST"])
def notas():
    if "usuario_id" not in session:
        return redirect(url_for("login"))

    usuario_id = session["usuario_id"]

    if request.method == "POST":
        texto_nota = request.form.get("txtNotas")
        conn = create_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO Notas (txtNotas, Usuario_idUsuario) VALUES (%s, %s)",
            (texto_nota, usuario_id)
        )
        conn.commit()
        cursor.close()
        close_connection(conn)
        flash("Nota criada com sucesso!")
        return redirect(url_for("notas"))

    # Obter notas do usuário
    conn = create_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        "SELECT * FROM Notas WHERE Usuario_idUsuario = %s", (usuario_id,))
    notas = cursor.fetchall()
    cursor.close()
    close_connection(conn)

    return render_template("notas.html", notas=notas)

# Rotas para Calendário
@app.route("/calendario", methods=["GET", "POST"])
def calendario():
    if "usuario_id" not in session:
        return redirect(url_for("login"))

    usuario_id = session["usuario_id"]

    if request.method == "POST":
        data_evento = request.form.get("DataCalendario")
        conn = create_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO Calendario (DataCalendario, Usuario_idUsuario) VALUES (%s, %s)",
            (data_evento, usuario_id)
        )
        conn.commit()
        cursor.close()
        close_connection(conn)
        flash("Evento adicionado ao calendário!")
        return redirect(url_for("calendario"))

    # Obter eventos do usuário
    conn = create_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        "SELECT * FROM Calendario WHERE Usuario_idUsuario = %s", (usuario_id,))
    eventos = cursor.fetchall()
    cursor.close()
    close_connection(conn)

    return render_template("calendario.html", eventos=eventos)

# Rota para home/dashboard
@app.route("/home")
def home():
    if "usuario_id" not in session:
        return redirect(url_for("login"))

    return render_template("home.html")

# Rota para logout
@app.route("/logout")
def logout():
    session.clear()
    flash("Você saiu da sua conta.")
    return redirect(url_for("login"))

if __name__ == "__main__":
    app.run(debug=True)