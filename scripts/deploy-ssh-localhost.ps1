# 🚀 DEPLOY DOCKER COM SSH - JA Automóveis (PowerShell)
# ===================================================
# Script para deploy local com túnel SSH

param(
    [switch]$SkipBuild,
    [switch]$SkipSSL,
    [switch]$SkipSeed
)

# Configurações
$ErrorActionPreference = "Stop"

# Cores para output
$Colors = @{
    Red = "Red"
    Green = "Green"
    Yellow = "Yellow"
    Blue = "Blue"
    Magenta = "Magenta"
    Cyan = "Cyan"
    White = "White"
}

# Função para log com timestamp
function Write-Log {
    param([string]$Message, [string]$Color = "White")
    $timestamp = Get-Date -Format "HH:mm:ss"
    Write-Host "[$timestamp] $Message" -ForegroundColor $Color
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Cyan
}

# Banner
Write-Host "🚀 DEPLOY DOCKER COM SSH - JA Automóveis" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta
Write-Host ""

# Função para verificar Docker
function Test-Docker {
    Write-Log "Verificando Docker..." "Blue"
    
    try {
        $dockerVersion = docker --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Docker encontrado: $dockerVersion"
        } else {
            throw "Docker não encontrado"
        }
        
        $dockerInfo = docker info 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Docker está rodando"
        } else {
            throw "Docker não está rodando"
        }
    }
    catch {
        Write-Error "Docker não está disponível. Instale o Docker Desktop primeiro."
        exit 1
    }
}

# Função para verificar portas
function Test-Ports {
    Write-Log "Verificando portas..." "Blue"
    
    $ports = @(80, 5000, 27017)
    foreach ($port in $ports) {
        $connection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        if ($connection) {
            Write-Warning "Porta $port já está em uso"
            $response = Read-Host "Deseja continuar mesmo assim? (y/N)"
            if ($response -notmatch "^[Yy]$") {
                exit 1
            }
        } else {
            Write-Success "Porta $port está livre"
        }
    }
}

# Função para configurar variáveis de ambiente
function Set-Environment {
    Write-Log "Configurando variáveis de ambiente..." "Blue"
    
    if (-not (Test-Path ".env")) {
        if (Test-Path "env.example") {
            Write-Warning "Arquivo .env não encontrado. Copiando de env.example..."
            Copy-Item "env.example" ".env"
            Write-Success "Arquivo .env criado"
            Write-Info "Edite o arquivo .env com suas configurações"
        } else {
            Write-Error "Arquivo .env não encontrado e env.example não existe"
            exit 1
        }
    } else {
        Write-Success "Arquivo .env encontrado"
    }
    
    # Gerar JWT_SECRET se necessário
    $envContent = Get-Content ".env" -Raw
    if ($envContent -notmatch "JWT_SECRET=" -or $envContent -match "JWT_SECRET=your-super-secret") {
        Write-Warning "JWT_SECRET não configurado. Gerando automaticamente..."
        $jwtSecret = [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([System.Guid]::NewGuid().ToString()))
        $envContent = $envContent -replace "JWT_SECRET=.*", "JWT_SECRET=$jwtSecret"
        Set-Content ".env" $envContent
        Write-Success "JWT_SECRET configurado"
    }
}

# Função para configurar SSL
function Set-SSL {
    if ($SkipSSL) {
        Write-Info "Pulando configuração SSL"
        return
    }
    
    Write-Log "Configurando SSL..." "Blue"
    
    if (-not (Test-Path "ssl")) {
        New-Item -ItemType Directory -Path "ssl" | Out-Null
    }
    
    if (-not (Test-Path "ssl/cert.pem") -or -not (Test-Path "ssl/key.pem")) {
        Write-Warning "Certificados SSL não encontrados. Criando certificados auto-assinados..."
        
        try {
            # Gerar certificado auto-assinado usando OpenSSL
            $opensslArgs = @(
                "req", "-x509", "-nodes", "-days", "365", "-newkey", "rsa:2048",
                "-keyout", "ssl/key.pem",
                "-out", "ssl/cert.pem",
                "-subj", "/C=BR/ST=SP/L=SaoPaulo/O=JA-Automoveis/CN=localhost"
            )
            
            & openssl @opensslArgs 2>$null
            if ($LASTEXITCODE -eq 0) {
                Write-Success "Certificados SSL criados"
                Write-Warning "Para produção, use certificados válidos (Let's Encrypt)"
            } else {
                throw "Falha ao gerar certificados"
            }
        }
        catch {
            Write-Error "Falha ao gerar certificados SSL. Instale o OpenSSL primeiro."
            Write-Info "Você pode pular esta etapa com -SkipSSL"
            exit 1
        }
    } else {
        Write-Success "Certificados SSL encontrados"
    }
}

# Função para fazer build da aplicação
function Build-Application {
    if ($SkipBuild) {
        Write-Info "Pulando build da aplicação"
        return
    }
    
    Write-Log "Fazendo build da aplicação..." "Blue"
    
    # Instalar dependências
    Write-Info "Instalando dependências..."
    try {
        npm install
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Dependências instaladas"
        } else {
            throw "Falha ao instalar dependências"
        }
    }
    catch {
        Write-Error "Falha ao instalar dependências"
        exit 1
    }
    
    # Build do cliente
    Write-Info "Build do cliente..."
    try {
        npm run build:client
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Build do cliente concluído"
        } else {
            throw "Falha no build do cliente"
        }
    }
    catch {
        Write-Error "Falha no build do cliente"
        exit 1
    }
    
    # Build do servidor
    Write-Info "Build do servidor..."
    try {
        npm run build:server
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Build do servidor concluído"
        } else {
            throw "Falha no build do servidor"
        }
    }
    catch {
        Write-Error "Falha no build do servidor"
        exit 1
    }
}

# Função para parar containers existentes
function Stop-Containers {
    Write-Log "Parando containers existentes..." "Blue"
    
    try {
        $containers = docker-compose ps -q 2>$null
        if ($containers) {
            Write-Info "Parando containers existentes..."
            docker-compose down --volumes --remove-orphans
            Write-Success "Containers parados"
        } else {
            Write-Success "Nenhum container rodando"
        }
    }
    catch {
        Write-Warning "Erro ao parar containers (pode ser normal se não houver containers)"
    }
}

# Função para fazer build das imagens Docker
function Build-DockerImages {
    Write-Log "Fazendo build das imagens Docker..." "Blue"
    
    Write-Info "Build das imagens Docker..."
    try {
        docker-compose build --no-cache
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Imagens Docker construídas"
        } else {
            throw "Falha no build das imagens Docker"
        }
    }
    catch {
        Write-Error "Falha no build das imagens Docker"
        exit 1
    }
}

# Função para iniciar containers
function Start-Containers {
    Write-Log "Iniciando containers..." "Blue"
    
    Write-Info "Iniciando serviços..."
    try {
        docker-compose up -d
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Containers iniciados"
        } else {
            throw "Falha ao iniciar containers"
        }
    }
    catch {
        Write-Error "Falha ao iniciar containers"
        exit 1
    }
}

# Função para aguardar serviços
function Wait-ForServices {
    Write-Log "Aguardando serviços ficarem disponíveis..." "Blue"
    
    # Aguardar MongoDB
    Write-Info "Aguardando MongoDB..."
    for ($i = 1; $i -le 30; $i++) {
        try {
            $result = docker-compose exec -T mongo mongosh --eval "db.runCommand('ping')" 2>$null
            if ($LASTEXITCODE -eq 0) {
                Write-Success "MongoDB disponível"
                break
            }
        }
        catch {
            # Ignorar erro
        }
        
        Write-Host "   Tentativa $i/30..." -ForegroundColor Yellow
        Start-Sleep -Seconds 2
    }
    
    # Aguardar API
    Write-Info "Aguardando API..."
    for ($i = 1; $i -le 30; $i++) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:5000/health" -TimeoutSec 5 -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200) {
                Write-Success "API disponível"
                break
            }
        }
        catch {
            # Ignorar erro
        }
        
        Write-Host "   Tentativa $i/30..." -ForegroundColor Yellow
        Start-Sleep -Seconds 2
    }
    
    # Aguardar Frontend
    Write-Info "Aguardando Frontend..."
    for ($i = 1; $i -le 30; $i++) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost/" -TimeoutSec 5 -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200) {
                Write-Success "Frontend disponível"
                break
            }
        }
        catch {
            # Ignorar erro
        }
        
        Write-Host "   Tentativa $i/30..." -ForegroundColor Yellow
        Start-Sleep -Seconds 2
    }
}

# Função para popular banco de dados
function Seed-Database {
    if ($SkipSeed) {
        Write-Info "Pulando seed do banco de dados"
        return
    }
    
    Write-Log "Populando banco de dados..." "Blue"
    
    Write-Info "Executando seeder..."
    try {
        docker-compose --profile tools run --rm seeder
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Banco de dados populado"
        } else {
            Write-Warning "Falha ao popular banco de dados (opcional)"
        }
    }
    catch {
        Write-Warning "Falha ao popular banco de dados (opcional)"
    }
}

# Função para testar aplicação
function Test-Application {
    Write-Log "Testando aplicação..." "Blue"
    
    Write-Info "Testando endpoints..."
    
    # Teste do frontend
    try {
        $response = Invoke-WebRequest -Uri "http://localhost/" -TimeoutSec 10
        if ($response.Content -match "html") {
            Write-Success "Frontend funcionando"
        } else {
            Write-Error "Frontend não está funcionando"
        }
    }
    catch {
        Write-Error "Frontend não está funcionando"
    }
    
    # Teste da API
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5000/health" -TimeoutSec 10
        if ($response.Content -match "ok") {
            Write-Success "API funcionando"
        } else {
            Write-Error "API não está funcionando"
        }
    }
    catch {
        Write-Error "API não está funcionando"
    }
}

# Função para mostrar status
function Show-Status {
    Write-Log "Status dos containers:" "Blue"
    docker-compose ps
    
    Write-Host ""
    Write-Host "🎉 DEPLOY COM SSH CONCLUÍDO COM SUCESSO!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 URLs de Acesso Local:" -ForegroundColor Blue
    Write-Host "  • Frontend HTTP: http://localhost/ (redireciona para HTTPS)"
    Write-Host "  • Frontend HTTPS: https://localhost/"
    Write-Host "  • API: http://localhost:5000"
    Write-Host "  • Admin: https://localhost/admin"
    Write-Host ""
    Write-Host "🔑 Credenciais Admin:" -ForegroundColor Blue
    Write-Host "  • Username: admin"
    Write-Host "  • Password: adminja2025"
    Write-Host ""
    Write-Host "🔒 SSH Túnel (para acesso remoto):" -ForegroundColor Blue
    Write-Host "  • Frontend: ssh -L 80:localhost:80 $(whoami)@localhost"
    Write-Host "  • API: ssh -L 5000:localhost:5000 $(whoami)@localhost"
    Write-Host "  • MongoDB: ssh -L 27017:localhost:27017 $(whoami)@localhost"
    Write-Host ""
    Write-Host "📋 Comandos Úteis:" -ForegroundColor Blue
    Write-Host "  • Ver logs: docker-compose logs -f"
    Write-Host "  • Parar: docker-compose down"
    Write-Host "  • Reiniciar: docker-compose restart"
    Write-Host "  • Popular banco: docker-compose --profile tools run --rm seeder"
    Write-Host ""
    Write-Host "💡 Dicas:" -ForegroundColor Yellow
    Write-Host "  • Use túneis SSH para acessar remotamente"
    Write-Host "  • Configure chaves SSH para autenticação automática"
    Write-Host "  • Para produção, use certificados SSL válidos"
}

# Função principal
function Main {
    Write-Host "🎯 Iniciando deploy Docker com SSH..." -ForegroundColor Blue
    Write-Host ""
    
    try {
        # 1. Verificações
        Test-Docker
        Test-Ports
        Set-Environment
        Set-SSL
        
        # 2. Build
        Build-Application
        
        # 3. Docker
        Stop-Containers
        Build-DockerImages
        Start-Containers
        
        # 4. Aguardar e popular
        Wait-ForServices
        Seed-Database
        
        # 5. Testes
        Test-Application
        
        # 6. Status final
        Show-Status
    }
    catch {
        Write-Error "Erro durante o deploy: $($_.Exception.Message)"
        Write-Info "Limpando recursos..."
        try {
            docker-compose down --volumes --remove-orphans 2>$null
        }
        catch {
            # Ignorar erro de limpeza
        }
        exit 1
    }
}

# Executar
Main
