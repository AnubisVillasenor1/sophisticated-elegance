Add-Type -AssemblyName System.Drawing

function New-Canvas([int]$size) {
  $bmp = New-Object System.Drawing.Bitmap($size, $size)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  return @($bmp, $g)
}

function Draw-Emblem($g, [double]$s, [bool]$fillBackground = $true) {
  # Fondo
  if ($fillBackground) {
    $bg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 4, 2, 3))
    $g.FillRectangle($bg, 0, 0, $s, $s)
    $bg.Dispose()
  }

  # Halo cereza
  for ($i = 34; $i -ge 1; $i--) {
    $r = $s * (0.18 + ($i / 34.0) * 0.30)
    $alpha = [int](2 + (34 - $i) * 0.35)
    $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb($alpha, 244, 63, 94))
    $g.FillEllipse($brush, ($s / 2 - $r), ($s * 0.52 - $r), ($r * 2), ($r * 2))
    $brush.Dispose()
  }

  # Anillo orbital
  $ringPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(70, 255, 154, 172), [float]($s * 0.006))
  $g.DrawEllipse($ringPen, [float]($s * 0.075), [float]($s * 0.30), [float]($s * 0.85), [float]($s * 0.42))
  $ringPen.Dispose()
  $ringPen2 = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(30, 246, 232, 226), [float]($s * 0.003))
  $g.DrawEllipse($ringPen2, [float]($s * 0.13), [float]($s * 0.22), [float]($s * 0.74), [float]($s * 0.56))
  $ringPen2.Dispose()

  # Gota de obsidiana
  $drop = New-Object System.Drawing.Drawing2D.GraphicsPath
  $top = $s * 0.115
  $bottom = $s * 0.925
  $left = $s * 0.235
  $right = $s * 0.765
  $midY = $s * 0.545
  $drop.StartFigure()
  $drop.AddBezier([float]($s / 2), [float]$top, [float]($s * 0.635), [float]($s * 0.315), [float]$right, [float]($s * 0.415), [float]$right, [float]$midY)
  $drop.AddBezier([float]$right, [float]($s * 0.735), [float]($s * 0.645), [float]$bottom, [float]($s / 2), [float]$bottom, [float]($s / 2), [float]$bottom)
  $drop.AddBezier([float]($s * 0.355), [float]$bottom, [float]$left, [float]($s * 0.735), [float]$left, [float]$midY, [float]$left, [float]$midY)
  $drop.AddBezier([float]$left, [float]($s * 0.415), [float]($s * 0.365), [float]($s * 0.315), [float]($s / 2), [float]$top, [float]($s / 2), [float]$top)
  $drop.CloseFigure()

  $grad = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.PointF([float]($s * 0.30), [float]($s * 0.10))),
    (New-Object System.Drawing.PointF([float]($s * 0.72), [float]($s * 0.94))),
    [System.Drawing.Color]::FromArgb(255, 53, 20, 29),
    [System.Drawing.Color]::FromArgb(255, 7, 3, 4)
  )
  $g.FillPath($grad, $drop)
  $grad.Dispose()

  $stroke = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.PointF([float]($s * 0.25), [float]($s * 0.15))),
    (New-Object System.Drawing.PointF([float]($s * 0.78), [float]($s * 0.90))),
    [System.Drawing.Color]::FromArgb(255, 255, 154, 172),
    [System.Drawing.Color]::FromArgb(255, 143, 13, 40)
  )
  $pen = New-Object System.Drawing.Pen($stroke, [float]($s * 0.008))
  $g.DrawPath($pen, $drop)
  $pen.Dispose()
  $stroke.Dispose()

  # Monograma X con perla
  $pearl = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.PointF([float]($s * 0.36), [float]($s * 0.36))),
    (New-Object System.Drawing.PointF([float]($s * 0.64), [float]($s * 0.72))),
    [System.Drawing.Color]::FromArgb(255, 255, 250, 247),
    [System.Drawing.Color]::FromArgb(255, 201, 182, 174)
  )
  $xPen = New-Object System.Drawing.Pen($pearl, [float]($s * 0.036))
  $xPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $xPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $g.DrawLine($xPen, [float]($s * 0.375), [float]($s * 0.395), [float]($s * 0.625), [float]($s * 0.690))
  $g.DrawLine($xPen, [float]($s * 0.625), [float]($s * 0.395), [float]($s * 0.375), [float]($s * 0.690))
  $xPen.Dispose()
  $pearl.Dispose()

  # Núcleo
  $core = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(190, 255, 143, 163))
  $g.FillEllipse($core, [float]($s * 0.472), [float]($s * 0.520), [float]($s * 0.056), [float]($s * 0.056))
  $core.Dispose()

  # Destellos
  $spark = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(220, 255, 244, 239))
  $g.FillEllipse($spark, [float]($s * 0.245), [float]($s * 0.27), [float]($s * 0.014), [float]($s * 0.014))
  $g.FillEllipse($spark, [float]($s * 0.745), [float]($s * 0.34), [float]($s * 0.010), [float]($s * 0.010))
  $spark.Dispose()

  $drop.Dispose()
  return
}

$dir = Join-Path (Get-Location) 'public'

foreach ($size in @(192, 512)) {
  $pair = New-Canvas $size
  $bmp = $pair[0]; $g = $pair[1]
  Draw-Emblem $g ([double]$size)
  $g.Dispose()
  $bmp.Save((Join-Path $dir "icon-$size.png"), [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
  Write-Output "icon-$size.png"
}

# Open Graph 1200x630
$w = 1200; $h = 630
$bmp = New-Object System.Drawing.Bitmap($w, $h)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

$bg = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
  (New-Object System.Drawing.PointF(0, 0)),
  (New-Object System.Drawing.PointF($w, $h)),
  [System.Drawing.Color]::FromArgb(255, 12, 5, 8),
  [System.Drawing.Color]::FromArgb(255, 4, 2, 3)
)
$g.FillRectangle($bg, 0, 0, $w, $h)
$bg.Dispose()

for ($i = 30; $i -ge 1; $i--) {
  $r = 120 + ($i / 30.0) * 320
  $alpha = [int](2 + (30 - $i) * 0.6)
  $b = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb($alpha, 244, 63, 94))
  $g.FillEllipse($b, (260 - $r), (330 - $r), ($r * 2), ($r * 2))
  $b.Dispose()
}

$ring = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(60, 255, 154, 172), 1.4)
$g.DrawEllipse($ring, 120, 170, 420, 220)
$ring.Dispose()

# Emblema a la izquierda
$state = $g.Save()
$g.TranslateTransform(120, 130)
$g.ScaleTransform(0.58, 0.58)
Draw-Emblem $g 640 $false
$g.Restore($state)

# Texto
$white = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 245, 236, 232))
$muted = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 178, 158, 152))
$cherry = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 244, 63, 94))

$titleFont = New-Object System.Drawing.Font('Georgia', 78, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$smallFont = New-Object System.Drawing.Font('Segoe UI', 17, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$eyebrowFont = New-Object System.Drawing.Font('Segoe UI', 15, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)

$g.DrawString('TAMV ONLINE NETWORK PRESENTA', $eyebrowFont, $muted, 560, 150)
$g.DrawString('XCLUSIVE', $titleFont, $white, 552, 188)
$g.DrawString(('UN PARA' + [char]0x00CD + 'SO PROHIBIDO'), $smallFont, $cherry, 560, 300)
$g.DrawString(('Edici' + [char]0x00F3 + 'n privada  ' + [char]0x00B7 + '  Modo DEMO'), $smallFont, $muted, 560, 336)
$g.DrawString(('Membres' + [char]0x00ED + 'as, clips y salones editoriales.'), $smallFont, $muted, 560, 392)
$g.DrawString(('Sin cobros reales ' + [char]0x00B7 + ' Solo 18+'), $eyebrowFont, $muted, 560, 428)

$line = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(90, 244, 63, 94), 1)
$g.DrawLine($line, 560, 480, 1080, 480)
$line.Dispose()

$g.DrawString('xclusive.tamvonline.network', $eyebrowFont, $muted, 560, 500)

$titleFont.Dispose(); $smallFont.Dispose(); $eyebrowFont.Dispose()
$white.Dispose(); $muted.Dispose(); $cherry.Dispose()
$g.Dispose()
$bmp.Save((Join-Path $dir 'og.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Output 'og.png'
