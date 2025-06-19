from flask import Flask, render_template, request, redirect, url_for, jsonify, session, flash
from bd_connectionn import create_connection, close_connection
import hashlib
import smtplib
import re
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


app = Flask(__name__)
app.secret_key = "Shadow_4EVER"

@app.route("/")
def landing_page():
    return render_template("landing_page.html")














# Rota para obter dados do usuário
@app.route("/obter_usuario", methods=["GET"])
def obter_usuario():
    if "usuario_id" in session:
        usuario_id = session["usuario_id"]

        conn = create_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            "SELECT NomeUsuario AS name, SobrenomeUsuario AS surname, EmailUsuario FROM Usuario WHERE idUsuario = %s",
            (usuario_id,),
        )
        usuario = cursor.fetchone()

        cursor.close()
        close_connection(conn)

        if usuario:
            return jsonify(usuario)
        else:
            return jsonify({"error": "Usuário não encontrado"}), 404
    return jsonify({"error": "Usuário não autenticado"}), 401

def enviar_email_recuperacao(destinatario_email):

    print(f">>> Iniciando envio de e-mail para: {destinatario_email}")
    remetente_email = "jacareca003@gmail.com"
    senha = "mogwxousidhmdurw"# Replace with app password
    
    # Validate email format
    if not re.match(r"[^@]+@[^@]+\.[^@]+", destinatario_email):
        print(">>> E-mail inválido")
        return False

    msg = MIMEMultipart()
    msg["From"] = remetente_email
    msg["To"] = destinatario_email
    msg["Subject"] = "Recuperação de Conta - Listify"


    link = url_for('nova_senha', email=destinatario_email, _external=True)

    corpo = (
        f"Olá,\n\n"
        "Recebemos uma solicitação para redefinir sua senha no Listify. "
        "Clique no link abaixo para redefinir sua senha:\n\n"
        f"{link}\n\n"
        "Se você não solicitou esta alteração, ignore este e-mail.\n\n"
        "Atenciosamente,\nEquipe Listify"
    )


    msg.attach(MIMEText(corpo, "plain"))

    try:
        print(">>> Conectando ao servidor SMTP...")
        with smtplib.SMTP("smtp.gmail.com", 587) as servidor:
            servidor.starttls()
            servidor.login(remetente_email, senha)
            servidor.sendmail(remetente_email, destinatario_email, msg.as_string())
        print(">>> E-mail enviado com sucesso!")
        return True
    except smtplib.SMTPAuthenticationError:
        print(">>> Erro de autenticação: Verifique o usuário e senha")
        return False
    except Exception as e:
        print(f">>> Erro ao enviar e-mail: {str(e)}")
        return False

@app.route("/nova_senha", methods=["GET"])
def nova_senha():
    email = request.args.get("email")
    if not email:
        flash("Email inválido ou não fornecido.")
        return redirect(url_for("recuperar_conta"))
    return render_template("nova_senha.html", email=email)


@app.route("/mudar-senha", methods=["POST"])
def mudar_senha():
    email = request.args.get("email")  # Obtém o e-mail do usuário a partir da URL
    nova_senha = request.form.get("password")
    confirmar_senha = request.form.get("confirm_password")

    # Verifica se o e-mail foi fornecido
    if not email:
        flash("Email inválido ou não fornecido.")
        return redirect(url_for("recuperar_conta"))

    # Verifica se as senhas coincidem
    if nova_senha != confirmar_senha:
        flash("As senhas não coincidem. Tente novamente.")
        return redirect(url_for("nova_senha", email=email))

    # Gera o hash da nova senha
    hashed_senha = hash_password(nova_senha)

    # Atualiza a senha no banco de dados
    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE Usuario SET senhaUsuario = %s WHERE emailUsuario = %s", (hashed_senha, email)
    )
    conn.commit()
    cursor.close()
    close_connection(conn)

    flash("Senha alterada com sucesso! Faça login com sua nova senha.")
    return redirect(url_for("login"))


























# Função auxiliar para gerar o hash da senha
def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

# Rota para criar conta (ajustada para o HTML fornecido)
@app.route("/templates/criar_conta.html", methods=["GET", "POST"])
def criar_conta():
    if request.method == "POST":
        nome = request.form.get("firstName")
        sobrenome = request.form.get("lastName")
        email = request.form.get("email")
        senha = request.form.get("password")


        

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
        return redirect(url_for("listas"))  # Redireciona para a home após cadastro

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

import uuid  # Para gerar token


#rota para recuperar conta
@app.route("/recuperar-conta", methods=["GET", "POST"])
@app.route("/recuperar_conta", methods=["GET", "POST"])
def recuperar_conta():
    if request.method == "POST":
        print(">>> POST recebido!")
        email = request.form.get("email")
        print(f">>> E-mail recebido: {email}")

        if not email:
            flash("Por favor, insira um e-mail.")
            return redirect(url_for("recuperar_conta"))

        enviar_email_recuperacao(email)
        flash("Se o e-mail estiver cadastrado, um link foi enviado.")
        return redirect(url_for("login"))

    return render_template("recuperar_conta.html")


# Rota para logout
@app.route("/logout")
def logout():
    session.clear()
    flash("Você saiu da sua conta.")
    return redirect(url_for("login"))

if __name__ == "__main__":
    app.run(debug=True)
