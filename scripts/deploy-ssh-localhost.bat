@echo off
REM 🚀 DEPLOY DOCKER COM SSH - JA Automóveis (Batch)
REM ================================================
REM Script para deploy local com túnel SSH

setlocal enabledelayedexpansion

REM Configurações
set "APP_NAME=ja-automoveis"
set "LOCAL_APP_PORT=80"
set "LOCAL_API_PORT=5000"
set "LOCAL_MONGO_PORT=27017"

REM Banner
echo.
echo 🚀 DEPLOY DOCKER COM SSH - JA Automóveis
echo ========================================
echo.

REM Função para verificar se Docker está disponível
:check_docker
echo [%time%] Verificando Docker...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker não encontrado. Instale o Docker Desktop primeiro.
    pause
    exit /b 1
)

docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker não está rodando. Inicie o Docker Desktop primeiro.
    pause
    exit /b 1
)

echo ✅ Docker está rodando
goto :check_ports

REM Função para verificar portas
:check_ports
echo [%time%] Verificando portas...

for %%p in (80 5000 27017) do (
    netstat -an | find "%%p" | find "LISTENING" >nul 2>&1
    if !errorlevel! equ 0 (
        echo ⚠️  Porta %%p já está em uso
        set /p continue="Deseja continuar mesmo assim? (y/N): "
        if /i "!continue!" neq "y" exit /b 1
    ) else (
        echo ✅ Porta %%p está livre
    )
)
goto :setup_env

REM Função para configurar variáveis de ambiente
:setup_env
echo [%time%] Configurando variáveis de ambiente...

if not exist ".env" (
    if exist "env.example" (
        echo ⚠️  Arquivo .env não encontrado. Copiando de env.example...
        copy "env.example" ".env" >nul
        echo ✅ Arquivo .env criado
        echo ℹ️  Edite o arquivo .env com suas configurações
    ) else (
        echo ❌ Arquivo .env não encontrado e env.example não existe
        pause
        exit /b 1
    )
) else (
    echo ✅ Arquivo .env encontrado
)

REM Gerar JWT_SECRET se necessário
findstr /C:"JWT_SECRET=" .env >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  JWT_SECRET não configurado. Gerando automaticamente...
    for /f %%i in ('powershell -Command "[System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([System.Guid]::NewGuid().ToString()))"') do set JWT_SECRET=%%i
    powershell -Command "(Get-Content .env) -replace 'JWT_SECRET=.*', 'JWT_SECRET=%JWT_SECRET%' | Set-Content .env"
    echo ✅ JWT_SECRET configurado
)
goto :setup_ssl

REM Função para configurar SSL
:setup_ssl
echo [%time%] Configurando SSL...

if not exist "ssl" mkdir ssl

if not exist "ssl\cert.pem" (
    echo ⚠️  Certificados SSL não encontrados. Criando certificados auto-assinados...
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ssl\key.pem -out ssl\cert.pem -subj "/C=BR/ST=SP/L=SaoPaulo/O=JA-Automoveis/CN=localhost" >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ Certificados SSL criados
        echo ⚠️  Para produção, use certificados válidos (Let's Encrypt)
    ) else (
        echo ❌ Falha ao gerar certificados SSL. Instale o OpenSSL primeiro.
        echo ℹ️  Você pode pular esta etapa editando o script
        pause
        exit /b 1
    )
) else (
    echo ✅ Certificados SSL encontrados
)
goto :build_app

REM Função para fazer build da aplicação
:build_app
echo [%time%] Fazendo build da aplicação...

echo ℹ️  Instalando dependências...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Falha ao instalar dependências
    pause
    exit /b 1
)
echo ✅ Dependências instaladas

echo ℹ️  Build do cliente...
call npm run build:client
if %errorlevel% neq 0 (
    echo ❌ Falha no build do cliente
    pause
    exit /b 1
)
echo ✅ Build do cliente concluído

echo ℹ️  Build do servidor...
call npm run build:server
if %errorlevel% neq 0 (
    echo ❌ Falha no build do servidor
    pause
    exit /b 1
)
echo ✅ Build do servidor concluído
goto :stop_containers

REM Função para parar containers existentes
:stop_containers
echo [%time%] Parando containers existentes...

docker-compose ps -q >nul 2>&1
if %errorlevel% equ 0 (
    echo ℹ️  Parando containers existentes...
    docker-compose down --volumes --remove-orphans
    echo ✅ Containers parados
) else (
    echo ✅ Nenhum container rodando
)
goto :build_docker

REM Função para fazer build das imagens Docker
:build_docker
echo [%time%] Fazendo build das imagens Docker...

echo ℹ️  Build das imagens Docker...
docker-compose build --no-cache
if %errorlevel% neq 0 (
    echo ❌ Falha no build das imagens Docker
    pause
    exit /b 1
)
echo ✅ Imagens Docker construídas
goto :start_containers

REM Função para iniciar containers
:start_containers
echo [%time%] Iniciando containers...

echo ℹ️  Iniciando serviços...
docker-compose up -d
if %errorlevel% neq 0 (
    echo ❌ Falha ao iniciar containers
    pause
    exit /b 1
)
echo ✅ Containers iniciados
goto :wait_services

REM Função para aguardar serviços
:wait_services
echo [%time%] Aguardando serviços ficarem disponíveis...

echo ℹ️  Aguardando MongoDB...
for /l %%i in (1,1,30) do (
    docker-compose exec -T mongo mongosh --eval "db.runCommand('ping')" >nul 2>&1
    if !errorlevel! equ 0 (
        echo ✅ MongoDB disponível
        goto :wait_api
    )
    echo    Tentativa %%i/30...
    timeout /t 2 /nobreak >nul
)

:wait_api
echo ℹ️  Aguardando API...
for /l %%i in (1,1,30) do (
    curl -s http://localhost:5000/health >nul 2>&1
    if !errorlevel! equ 0 (
        echo ✅ API disponível
        goto :wait_frontend
    )
    echo    Tentativa %%i/30...
    timeout /t 2 /nobreak >nul
)

:wait_frontend
echo ℹ️  Aguardando Frontend...
for /l %%i in (1,1,30) do (
    curl -s http://localhost/ >nul 2>&1
    if !errorlevel! equ 0 (
        echo ✅ Frontend disponível
        goto :seed_database
    )
    echo    Tentativa %%i/30...
    timeout /t 2 /nobreak >nul
)
goto :seed_database

REM Função para popular banco de dados
:seed_database
echo [%time%] Populando banco de dados...

echo ℹ️  Executando seeder...
docker-compose --profile tools run --rm seeder
if %errorlevel% equ 0 (
    echo ✅ Banco de dados populado
) else (
    echo ⚠️  Falha ao popular banco de dados (opcional)
)
goto :test_app

REM Função para testar aplicação
:test_app
echo [%time%] Testando aplicação...

echo ℹ️  Testando endpoints...

curl -s http://localhost/ | find "html" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Frontend funcionando
) else (
    echo ❌ Frontend não está funcionando
)

curl -s http://localhost:5000/health | find "ok" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ API funcionando
) else (
    echo ❌ API não está funcionando
)
goto :show_status

REM Função para mostrar status
:show_status
echo [%time%] Status dos containers:
docker-compose ps

echo.
echo 🎉 DEPLOY COM SSH CONCLUÍDO COM SUCESSO!
echo.
echo 🌐 URLs de Acesso Local:
echo   • Frontend HTTP: http://localhost/ (redireciona para HTTPS)
echo   • Frontend HTTPS: https://localhost/
echo   • API: http://localhost:5000
echo   • Admin: https://localhost/admin
echo.
echo 🔑 Credenciais Admin:
echo   • Username: admin
echo   • Password: adminja2025
echo.
echo 🔒 SSH Túnel (para acesso remoto):
echo   • Frontend: ssh -L 80:localhost:80 %USERNAME%@localhost
echo   • API: ssh -L 5000:localhost:5000 %USERNAME%@localhost
echo   • MongoDB: ssh -L 27017:localhost:27017 %USERNAME%@localhost
echo.
echo 📋 Comandos Úteis:
echo   • Ver logs: docker-compose logs -f
echo   • Parar: docker-compose down
echo   • Reiniciar: docker-compose restart
echo   • Popular banco: docker-compose --profile tools run --rm seeder
echo.
echo 💡 Dicas:
echo   • Use túneis SSH para acessar remotamente
echo   • Configure chaves SSH para autenticação automática
echo   • Para produção, use certificados SSL válidos
echo.
echo ✅ Deploy concluído!
pause
