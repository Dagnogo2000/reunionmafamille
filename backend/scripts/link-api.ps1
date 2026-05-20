# Lie api-mafamille vers htdocs XAMPP (à exécuter en admin si besoin)
$source = Resolve-Path "$PSScriptRoot\..\..\api-mafamille"
$target = "C:\xampp\htdocs\api-mafamille"

if (Test-Path $target) {
    Write-Host "Déjà présent : $target"
} else {
    New-Item -ItemType SymbolicLink -Path $target -Target $source -Force
    Write-Host "Lien créé : $target -> $source"
}

Write-Host "Testez : http://localhost/api-mafamille/stats.php"
