@echo off
setlocal

if not exist "%JAVA_HOME%\bin\java.exe" (
    if exist "C:\Program Files\JetBrains\PyCharm 2026.2.0.1\jbr\bin\java.exe" (
        set "JAVA_HOME=C:\Program Files\JetBrains\PyCharm 2026.2.0.1\jbr"
    )
)

set "PATH=%JAVA_HOME%\bin;%PATH%"

if exist "C:\Users\hidhu\.m2\wrapper\apache-maven-3.9.6\bin\mvn.cmd" (
    call "C:\Users\hidhu\.m2\wrapper\apache-maven-3.9.6\bin\mvn.cmd" %*
) else (
    call mvn %*
)
