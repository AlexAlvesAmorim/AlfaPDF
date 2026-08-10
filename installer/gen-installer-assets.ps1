# ============================================================================
#  gen-installer-assets.ps1
#  Gera os BMPs visuais do instalador ALFA PDF Reader 2.0
#  TEMA CLARO: sidebar vermelho vibrante #e4002b + corpo branco
#  - sidebar.bmp : 164 x 314  (WizardImageFile)
#  - small.bmp   : 55  x 58   (WizardSmallImageFile)
# ============================================================================
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$here    = Split-Path -Parent $MyInvocation.MyCommand.Path
$logoSrc = Join-Path $here '..\src\renderer\assets\logo.png'
$outDir  = Join-Path $here 'assets'
if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir | Out-Null }

# Cores da marca ALFA
$red       = [System.Drawing.Color]::FromArgb(228, 0, 43)     # #e4002b
$redDark   = [System.Drawing.Color]::FromArgb(178, 0, 34)     # #b20022
$redDeep   = [System.Drawing.Color]::FromArgb(138, 0, 23)     # #8a0017
$redBright = [System.Drawing.Color]::FromArgb(255, 45, 85)    # #ff2d55
$white     = [System.Drawing.Color]::FromArgb(255, 255, 255)  # #ffffff
$whiteOff  = [System.Drawing.Color]::FromArgb(245, 245, 245)  # #f5f5f5
$mutedW    = [System.Drawing.Color]::FromArgb(255, 200, 210)  # rosa claro p/ texto sobre vermelho
$bgDeep    = [System.Drawing.Color]::FromArgb(10, 10, 10)
$bgBase    = [System.Drawing.Color]::FromArgb(18, 18, 18)
$bgElev    = [System.Drawing.Color]::FromArgb(26, 26, 26)

$logo = [System.Drawing.Image]::FromFile($logoSrc)

# ----------------------------------------------------------------------------
#  SIDEBAR  164 x 314  - vermelho vibrante solido com logo + texto brancos
# ----------------------------------------------------------------------------
$w = 164; $h = 314
$bmp = New-Object System.Drawing.Bitmap $w, $h
$bmp.SetResolution(96, 96)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode     = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.PixelOffsetMode   = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

# fundo vermelho vibrante solido
$g.Clear($red)

# gradiente sutil: topo mais claro -> base mais escuro (profundidade)
$rect = New-Object System.Drawing.Rectangle 0, 0, $w, $h
$grad = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, $redBright, $redDeep, 90
$g.FillRectangle($grad, $rect)

# brilho radial suave no topo (efeito spotlight)
$radPath = New-Object System.Drawing.Drawing2D.GraphicsPath
$radPath.AddEllipse(-30, -70, 224, 180)
$pBrush = New-Object System.Drawing.Drawing2D.PathGradientBrush $radPath
$pBrush.CenterColor = [System.Drawing.Color]::FromArgb(90, 255, 255, 255)
$pBrush.SurroundColors = @([System.Drawing.Color]::FromArgb(0, 255, 255, 255))
$g.FillPath($pBrush, $radPath)

# faixa vertical esquerda mais escura (acento conhecido)
$sideRect = New-Object System.Drawing.Rectangle 0, 0, 5, $h
$sideGrad = New-Object System.Drawing.Drawing2D.LinearGradientBrush $sideRect, $redDeep, $redDark, 90
$g.FillRectangle($sideGrad, $sideRect)

# faixa vertical direita mais clara (highlight)
$sideR = New-Object System.Drawing.Rectangle ($w - 2), 0, 2, $h
$sideRG = New-Object System.Drawing.Drawing2D.LinearGradientBrush $sideR, $redBright, $red, 90
$g.FillRectangle($sideRG, $sideR)

# ---- Logo branca (silhueta) ----
# Desenha a logo original por cima mas aplicamos um overlay branco
# Como nao da pra recolorir facilmente, vamos desenhar a logo original
# (probabilidade de fundo transparente) usando um efeito "frost":
# desenha a logo em grayscale-claro sobre fundo vermelho.
$logoBox = 96
$ar = $logo.Width / $logo.Height
$dw = $logoBox; $dh = $logoBox
if ($ar -lt 1) { $dw = [int]($logoBox * $ar) } else { $dh = [int]($logoBox / $ar) }
$dx = ([int](($w - $dw) / 2)); $dy = 52 + ([int](($logoBox - $dh) / 2))
$dstLogo = New-Object System.Drawing.Rectangle $dx, $dy, $dw, $dh

# Desenha logo com color matrix -> escala pra cinza claro (quase branco)
$cm = New-Object System.Drawing.Imaging.ColorMatrix
# matriz "frost": converte pra grayscale e clareia
$cm.Matrix00 = 0.3; $cm.Matrix01 = 0.3; $cm.Matrix02 = 0.3; $cm.Matrix10 = 0.3; $cm.Matrix11 = 0.3; $cm.Matrix12 = 0.3
$cm.Matrix20 = 0.3; $cm.Matrix21 = 0.3; $cm.Matrix22 = 0.3
$cm.Matrix33 = 1.0
$ia = New-Object System.Drawing.Imaging.ImageAttributes
$ia.SetColorMatrix($cm)
$g.DrawImage($logo, $dstLogo, 0, 0, $logo.Width, $logo.Height, [System.Drawing.GraphicsUnit]::Pixel, $ia)

# divisor branco translucido
$divPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(80, 255, 255, 255)), 1
$g.DrawLine($divPen, 24, 168, ($w - 24), 168)

# ---- Textos brancos ----
$nf = New-Object System.Drawing.StringFormat
$nf.Alignment = [System.Drawing.StringAlignment]::Center
$nf.LineAlignment = [System.Drawing.StringAlignment]::Center

# ALFA (grande, branco, bold)
$fontName = New-Object System.Drawing.Font 'Segoe UI', 18, ([System.Drawing.FontStyle]::Bold)
$g.DrawString('ALFA', $fontName, (New-Object System.Drawing.SolidBrush $white), (New-Object System.Drawing.RectangleF 0, 178, $w, 30), $nf)

# PDF READER (menor, branco)
$fontSub = New-Object System.Drawing.Font 'Segoe UI', 9, ([System.Drawing.FontStyle]::Regular)
$g.DrawString('PDF READER', $fontSub, (New-Object System.Drawing.SolidBrush $white), (New-Object System.Drawing.RectangleF 0, 204, $w, 18), $nf)

# version 2.0 (branco translucido)
$fontVer = New-Object System.Drawing.Font 'Consolas', 8
$g.DrawString('version 2.0', $fontVer, (New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(220, 255, 255, 255))), (New-Object System.Drawing.RectangleF 0, 224, $w, 16), $nf)

# rodape marca
$fontBrand = New-Object System.Drawing.Font 'Segoe UI', 7, ([System.Drawing.FontStyle]::Bold)
$g.DrawString('DEV DE FAVELA', $fontBrand, (New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(230, 255, 255, 255))), (New-Object System.Drawing.RectangleF 0, ($h - 26), $w, 14), $nf)
$fontTiny = New-Object System.Drawing.Font 'Segoe UI', 6
$g.DrawString('(c) 2026 Alex Alves Amorim', $fontTiny, (New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(180, 255, 255, 255))), (New-Object System.Drawing.RectangleF 0, ($h - 14), $w, 12), $nf)

$g.Flush()
$bmp.Save((Join-Path $outDir 'sidebar.bmp'), [System.Drawing.Imaging.ImageFormat]::Bmp)
$bmp.Dispose(); $g.Dispose(); $grad.Dispose(); $pBrush.Dispose(); $sideGrad.Dispose(); $sideRG.Dispose(); $ia.Dispose()
Write-Host 'OK sidebar.bmp'

# ----------------------------------------------------------------------------
#  SMALL  55 x 58  - fundo vermelho vibrante com logo branca
# ----------------------------------------------------------------------------
$w2 = 55; $h2 = 58
$bmp2 = New-Object System.Drawing.Bitmap $w2, $h2
$bmp2.SetResolution(96, 96)
$g2 = [System.Drawing.Graphics]::FromImage($bmp2)
$g2.SmoothingMode     = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g2.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g2.PixelOffsetMode   = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

# fundo vermelho vibrante
$g2.Clear($red)
$rect2 = New-Object System.Drawing.Rectangle 0, 0, $w2, $h2
$grad2 = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect2, $redBright, $redDark, 90
$g2.FillRectangle($grad2, $rect2)

# logo central em grayscale branco
$innerBox = 38
$ar2 = $logo.Width / $logo.Height
$dw2 = $innerBox; $dh2 = $innerBox
if ($ar2 -lt 1) { $dw2 = [int]($innerBox * $ar2) } else { $dh2 = [int]($innerBox / $ar2) }
$dx2 = ([int](($w2 - $dw2) / 2)); $dy2 = ([int](($h2 - $dh2) / 2))
$dstSm = New-Object System.Drawing.Rectangle $dx2, $dy2, $dw2, $dh2
$cm2 = New-Object System.Drawing.Imaging.ColorMatrix
$cm2.Matrix00 = 0.3; $cm2.Matrix01 = 0.3; $cm2.Matrix02 = 0.3
$cm2.Matrix10 = 0.3; $cm2.Matrix11 = 0.3; $cm2.Matrix12 = 0.3
$cm2.Matrix20 = 0.3; $cm2.Matrix21 = 0.3; $cm2.Matrix22 = 0.3
$cm2.Matrix33 = 1.0
$ia2 = New-Object System.Drawing.Imaging.ImageAttributes
$ia2.SetColorMatrix($cm2)
$g2.DrawImage($logo, $dstSm, 0, 0, $logo.Width, $logo.Height, [System.Drawing.GraphicsUnit]::Pixel, $ia2)

$g2.Flush()
$bmp2.Save((Join-Path $outDir 'small.bmp'), [System.Drawing.Imaging.ImageFormat]::Bmp)
$bmp2.Dispose(); $g2.Dispose(); $grad2.Dispose(); $ia2.Dispose()
Write-Host 'OK small.bmp'

$logo.Dispose()
Write-Host 'Done.'
