@echo off
title MN Studio - Launcher
color 0A
chcp 65001 >nul

:: Banner
echo.
echo ███╗   ███╗███╗   ██╗    ███████╗████████╗██╗   ██╗██████╗ ██╗ ██████╗ 
echo ████╗ ████║████╗  ██║    ██╔════╝╚══██╔══╝██║   ██║██╔══██╗██║██╔═══██╗
echo ██╔████╔██║██╔██╗ ██║    ███████╗   ██║   ██║   ██║██║  ██║██║██║   ██║
echo ██║╚██╔╝██║██║╚██╗██║    ╚════██║   ██║   ██║   ██║██║  ██║██║██║   ██║
echo ██║ ╚═╝ ██║██║ ╚████║    ███████║   ██║   ╚██████╔╝██████╔╝██║╚██████╔╝
echo ╚═╝     ╚═╝╚═╝  ╚═══╝    ╚══════╝   ╚═╝    ╚═════╝ ╚═════╝ ╚═╝ ╚═════╝ 
echo.
echo ═══════════════════════════════════════════════════════════════════════
echo                    Plataforma de Mangás e Novels
echo ═══════════════════════════════════════════════════════════════════════
echo.

:: Verificar se Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Node.js não encontrado!
    echo Por favor, instale o Node.js em: https://nodejs.org/
    pause
    exit /b 1
)

:: Verificar se PostgreSQL está rodando
pg_isready -U postgres >nul 2>&1
if %errorlevel% neq 0 (
    echo [AVISO] PostgreSQL pode não estar rodando
    echo Tentando iniciar o serviço...
    net start postgresql-x64-14 >nul 2>&1
    timeout /t 2 >nul
)

:menu
cls
echo.
echo ═══════════════════════════════════════════════════════════════════════
echo                          MN STUDIO - MENU PRINCIPAL
echo ═══════════════════════════════════════════════════════════════════════
echo.
echo  [1] 🚀 Iniciar Projeto Completo (Backend + Frontend)
echo  [2] 🔧 Iniciar apenas Backend
echo  [3] 🎨 Iniciar apenas Frontend
echo  [4] 📦 Instalar/Atualizar Dependências
echo  [5] 🗄️  Configurar Banco de Dados
echo  [6] 👤 Criar Usuário Admin
echo  [7] 🌐 Abrir no Navegador
echo  [8] 📊 Ver Status dos Serviços
echo  [9] ❌ Parar Todos os Serviços
echo  [0] 🚪 Sair
echo.
echo ═══════════════════════════════════════════════════════════════════════
echo.
set /p opcao="Escolha uma opção: "

if "%opcao%"=="1" goto iniciar_completo
if "%opcao%"=="2" goto iniciar_backend
if "%opcao%"=="3" goto iniciar_frontend
if "%opcao%"=="4" goto instalar_deps
if "%opcao%"=="5" goto config_db
if "%opcao%"=="6" goto criar_admin
if "%opcao%"=="7" goto abrir_navegador
if "%opcao%"=="8" goto ver_status
if "%opcao%"=="9" goto parar_servicos
if "%opcao%"=="0" goto sair

echo Opção inválida!
timeout /t 2 >nul
goto menu

:iniciar_completo
cls
echo.
echo ═══════════════════════════════════════════════════════════════════════
echo                    INICIANDO PROJETO COMPLETO
echo ═══════════════════════════════════════════════════════════════════════
echo.

:: Criar arquivo de controle
echo RUNNING > .mn-studio-running

:: Iniciar Backend
echo [1/2] Iniciando Backend...
start "MN Studio - Backend" /min cmd /c "cd backend && npm run dev"
timeout /t 3 >nul

:: Iniciar Frontend
echo [2/2] Iniciando Frontend...
start "MN Studio - Frontend" /min cmd /c "cd frontend && npm run dev"
timeout /t 3 >nul

echo.
echo ✅ Projeto iniciado com sucesso!
echo.
echo 📡 Backend:  http://localhost:5000
echo 🎨 Frontend: http://localhost:5173
echo.
echo Aguardando serviços iniciarem...
timeout /t 5 >nul

:: Abrir navegador automaticamente
start http://localhost:5173

echo.
echo ⚠️  Não feche esta janela!
echo Para parar os serviços, escolha a opção [9] no menu.
echo.
pause
goto menu

:iniciar_backend
cls
echo.
echo ═══════════════════════════════════════════════════════════════════════
echo                         INICIANDO BACKEND
echo ═══════════════════════════════════════════════════════════════════════
echo.
cd backend
call npm run dev
pause
goto menu

:iniciar_frontend
cls
echo.
echo ═══════════════════════════════════════════════════════════════════════
echo                         INICIANDO FRONTEND
echo ═══════════════════════════════════════════════════════════════════════
echo.
cd frontend
call npm run dev
pause
goto menu

:instalar_deps
cls
echo.
echo ═══════════════════════════════════════════════════════════════════════
echo                   INSTALANDO DEPENDÊNCIAS
echo ═══════════════════════════════════════════════════════════════════════
echo.

echo [1/2] Instalando dependências do Backend...
cd backend
call npm install
cd ..

echo.
echo [2/2] Instalando dependências do Frontend...
cd frontend
call npm install
cd ..

echo.
echo ✅ Dependências instaladas com sucesso!
pause
goto menu

:config_db
cls
echo.
echo ═══════════════════════════════════════════════════════════════════════
echo                   CONFIGURANDO BANCO DE DADOS
echo ═══════════════════════════════════════════════════════════════════════
echo.

cd backend
call npm run sync-db

echo.
echo ✅ Banco de dados configurado!
pause
goto menu

:criar_admin
cls
echo.
echo ═══════════════════════════════════════════════════════════════════════
echo                      CRIAR USUÁRIO ADMIN
echo ═══════════════════════════════════════════════════════════════════════
echo.

cd backend
call npm run create-admin

echo.
pause
goto menu

:abrir_navegador
start http://localhost:5173
goto menu

:ver_status
cls
echo.
echo ═══════════════════════════════════════════════════════════════════════
echo                      STATUS DOS SERVIÇOS
echo ═══════════════════════════════════════════════════════════════════════
echo.

:: Verificar Backend
echo Verificando Backend (porta 5000)...
netstat -ano | findstr ":5000" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend está RODANDO
) else (
    echo ❌ Backend está PARADO
)

echo.

:: Verificar Frontend
echo Verificando Frontend (porta 5173)...
netstat -ano | findstr ":5173" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Frontend está RODANDO
) else (
    echo ❌ Frontend está PARADO
)

echo.

:: Verificar PostgreSQL
echo Verificando PostgreSQL...
pg_isready -U postgres >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ PostgreSQL está RODANDO
) else (
    echo ❌ PostgreSQL está PARADO
)

echo.
pause
goto menu

:parar_servicos
cls
echo.
echo ═══════════════════════════════════════════════════════════════════════
echo                    PARANDO TODOS OS SERVIÇOS
echo ═══════════════════════════════════════════════════════════════════════
echo.

:: Matar processos Node.js nas portas específicas
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5000"') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173"') do taskkill /F /PID %%a >nul 2>&1

:: Remover arquivo de controle
del .mn-studio-running >nul 2>&1

echo ✅ Serviços parados!
timeout /t 2 >nul
goto menu

:sair
cls
echo.
echo Parando serviços antes de sair...
:: Matar processos
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5000"') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173"') do taskkill /F /PID %%a >nul 2>&1
del .mn-studio-running >nul 2>&1

echo.
echo Obrigado por usar MN Studio! 👋
timeout /t 2 >nul
exit