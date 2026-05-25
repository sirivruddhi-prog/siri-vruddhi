# Compress venue photos for web + GitHub (max 1920px edge, JPEG quality 82)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$imageDir = Join-Path $PSScriptRoot '..\frontend\src\assets\images'
$quality = 82L
$maxEdge = 1920

function Save-Jpeg($bitmap, $path, $q) {
  $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
    Where-Object { $_.MimeType -eq 'image/jpeg' }
  $encParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
  $encParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
    [System.Drawing.Imaging.Encoder]::Quality, $q
  )
  $bitmap.Save($path, $codec, $encParams)
  $encParams.Dispose()
}

Get-ChildItem $imageDir -File | Where-Object {
  $_.Extension -match '^\.(jpe?g|png)$' -and $_.Name -ne 'sri-chakra.svg'
} | ForEach-Object {
  $file = $_.FullName
  $before = $_.Length
  try {
    $img = [System.Drawing.Image]::FromFile($file)
    $w = $img.Width
    $h = $img.Height
    $scale = [Math]::Min(1, $maxEdge / [Math]::Max($w, $h))
    $nw = [int][Math]::Round($w * $scale)
    $nh = [int][Math]::Round($h * $scale)
    $bmp = New-Object System.Drawing.Bitmap $nw, $nh
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.DrawImage($img, 0, 0, $nw, $nh)
    $g.Dispose()
    $img.Dispose()
    $tmp = "$file.tmp"
    Save-Jpeg $bmp $tmp $quality
    $bmp.Dispose()
    Move-Item -Force $tmp $file
    $after = (Get-Item $file).Length
    Write-Host ("{0}: {1:N1} MB -> {2:N1} MB" -f $_.Name, ($before/1MB), ($after/1MB))
  } catch {
    Write-Warning "Skipped $($_.Name): $_"
  }
}

Write-Host 'Done.'
