@echo off

set cwd=%~dp0

cd /d %cwd%

..\..\..\Python\python.exe generate.py build
copy source\favicon.ico build\favicon.ico

rem pause

rem robocopy build ..\..\..\..\Pharo\qfe /MIR

pause
