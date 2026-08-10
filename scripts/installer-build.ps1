# ============================================================
# ALFA PDF Reader 2.0 - Build Profissional
# Script de automação para instalar o instalador com Inno Setup
# ============================================================

param(
    [string]$BuildDir = "release",
    [string]$ProjectRoot = (Split-Path -Parent $SCRIPT_DIR)
)

$ErrorActionPreference = "Stop"

function Write-Log($msg) {
    Write-Host "[ALFA] $msg" -ForegroundColor Cyan
}

function Find-ISCC {
    $candidates = @(
        ${env:ALFAPDF_ISCC},
        "C:\Program Files (x86)\Inno Setup 6\ISCC.exe",
        "C:\Program Files\Inno Setup 6\ISCC.exe",
        "${env:LOCALAPPDATA}\_programs\Inno Setup 6\ISCC.exe"
    ) | Where-Object { $_ }
    
    foreach ($cand in $candidates) {
        if (Test-Path $cand) { return $cand }
    }
    return $null
}

function Install-InnoSetup {
    Write-Log "Inno Setup não encontrado. Instalando automaticamente..."
    
    # URL direta do instalador standalone
    $dlUrl = "https://github.comjrsoftware/iscc/releases/download/v1.0.0/iscc-portable.zip"
    $dlUrl = "https://www.jrsoftware.org/isdl/is603.exe"
    
    $dlPath = "$env:TEMP\is603-setup.exe"
    $installDir = "C:\Program Files\Inno Setup 6"
    
    try {
        Invoke-WebRequest -Uri $dlUrl -OutFile $dlPath -UseBasicParsing
        Write-Log "Download concluído. Executando instalação..."
        
        Start-Process -FilePath $dlPath -ArgumentList "/VERYSILENT", "/DIR=`"$installDir`"", "/NORESTART" -Wait
        
        if (Test-Path "$installDir\ISCC.exe") {
            Write-Log "Inno Setup instalado com sucesso!"
            return "$installDir\ISCC.exe"
        }
    } catch {
        Write-Error "Falha ao instalar Inno Setup: $_"
        return $null
    }
}

# Main
Write-Log "Iniciando build do instalador ALFA PDF Reader 2.0"

# Garantir diretório de saída
$outDir = Join-Path $ProjectRoot $BuildDir
if (-not (Test-Path $outDir)) {
    New-Item -ItemType Directory -Path $outDir | Out-Null
}

# Localizar ou instalar ISCC
$iscc = Find-ISCC
if (-not $iscc) {
    $iscc = Install-InnoSetup
    if (-not $iscc) {
        Write-Error "Não foi possível localizar ou instalar o Inno Setup. Abortando."
        exit 1
    }
}

Write-Log "Inno Setup encontrado: $iscc"

# Localizar script .iss
$issPath = Join-Path $ProjectRoot "installer\ALFA-PDF-Reader.iss"
if (-not (Test-Path $issPath)) {
    Write-Error "Script .iss não encontrado em: $issPath"
    exit 1
}

# Executar build
Write-Log "Compilando instalador: $issPath"
$proc = Start-Process -FilePath $iscc -ArgumentList "/Q", "`"$issPath`"" -Wait -PassThru -NoNewWindow

if ($proc.ExitCode -eq 0) {
    Write-Log "Instalador gerado com sucesso!"
    $exePath = Join-Path $outDir "ALFA-PDF-Reader-2.0-Setup-x64.exe"
    if (Test-Path $exePath) {
        $size = [math]::Round((Get-Item $exePath).Length / 1MB, 1)
        Write-Host "`n==========================================" -ForegroundColor Green
        Write-Host "Instalador pronto: $exePath" -ForegroundColor Green
        Write-Host "Tamanho: ${size} MB" -ForegroundColor Green
        Write-Host "==========================================`n" -ForegroundColor Green
    }
} else {
    Write-Error "Compilação falhou com código: $($proc.ExitCode)"
    exit $proc.ExitCode
}