@echo off
setlocal

REM Wrapper to allow esbuild to run in environments where Node cannot spawn .exe directly.
REM This file is referenced via ESBUILD_BINARY_PATH by scripts/vite.mjs.

"%~dp0..\\node_modules\\@esbuild\\win32-x64\\esbuild.exe" %*

