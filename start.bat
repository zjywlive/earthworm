@echo off
chcp 65001 >nul
title Earthworm 英语学习 - 本地版

echo ========================================
echo   Earthworm 英语学习应用 - 本地版
echo ========================================
echo.

:: 检查 Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Node.js，请先安装 Node.js ^>= 20
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

:: 检查 pnpm
where pnpm >nul 2>nul
if %errorlevel% neq 0 (
    echo [提示] 未检测到 pnpm，正在自动安装...
    npm install -g pnpm
    if %errorlevel% neq 0 (
        echo [错误] pnpm 安装失败，请手动执行: npm install -g pnpm
        pause
        exit /b 1
    )
)

:: 检查是否已安装依赖
if not exist "node_modules" (
    echo [提示] 首次运行，正在安装依赖（可能需要几分钟）...
    echo.
    pnpm install --no-frozen-lockfile
    if %errorlevel% neq 0 (
        echo [错误] 依赖安装失败，请检查网络连接后重试
        pause
        exit /b 1
    )
    echo.
    echo [完成] 依赖安装成功！
    echo.
)

echo [启动] 正在启动开发服务器...
echo [提示] 启动后请在浏览器访问 http://localhost:3000
echo [提示] 按 Ctrl+C 可停止服务器
echo.

pnpm dev

pause
