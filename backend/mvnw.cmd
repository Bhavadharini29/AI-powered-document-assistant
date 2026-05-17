@REM ----------------------------------------------------------------------------
@REM Licensed to the Apache Software Foundation (ASF) under one
@REM or more contributor license agreements.  See the NOTICE file
@REM distributed with this work for additional information
@REM regarding copyright ownership.  The ASF licenses this file
@REM to you under the Apache License, Version 2.0 (the
@REM "License"); you may not use this file except in compliance
@REM with the License.  You may obtain a copy of the License at
@REM
@REM    https://www.apache.org/licenses/LICENSE-2.0
@REM
@REM Unless required by applicable law or agreed to in writing,
@REM software distributed under the License is distributed on an
@REM "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
@REM KIND, either express or implied.  See the License for the
@REM specific language governing permissions and limitations
@REM under the License.
@REM ----------------------------------------------------------------------------

@echo off
setlocal enabledelayedexpansion

set MVNW_VERBOSE=
if not "%MVNW_VERBOSE%"=="" echo MVNW_VERBOSE is set to "%MVNW_VERBOSE%"

set BASEDIR=%~dp0
if "%BASEDIR:~-1%"=="\" set "BASEDIR=%BASEDIR:~0,-1%"
set WRAPPER_DIR=%BASEDIR%\.mvn\wrapper
set WRAPPER_JAR=%WRAPPER_DIR%\maven-wrapper.jar
set WRAPPER_PROPERTIES=%WRAPPER_DIR%\maven-wrapper.properties

if exist "%WRAPPER_JAR%" goto :run

if not exist "%WRAPPER_DIR%" mkdir "%WRAPPER_DIR%" >NUL 2>&1

for /f "usebackq tokens=1,* delims==" %%A in ("%WRAPPER_PROPERTIES%") do (
  if "%%A"=="wrapperUrl" set WRAPPER_URL=%%B
)

if "%WRAPPER_URL%"=="" (
  echo Could not find wrapperUrl in "%WRAPPER_PROPERTIES%".
  exit /b 1
)

where powershell >NUL 2>&1
if errorlevel 1 (
  echo PowerShell not found. Cannot download Maven Wrapper.
  exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -Command "$ProgressPreference='SilentlyContinue'; Invoke-WebRequest -Uri '%WRAPPER_URL%' -OutFile '%WRAPPER_JAR%'" || (
  echo Failed to download Maven Wrapper from %WRAPPER_URL%
  exit /b 1
)

:run
set MAVEN_PROJECTBASEDIR=%BASEDIR%
java -classpath "%WRAPPER_JAR%" "-Dmaven.multiModuleProjectDirectory=%MAVEN_PROJECTBASEDIR%" org.apache.maven.wrapper.MavenWrapperMain %*

