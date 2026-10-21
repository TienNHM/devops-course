# Kiem tra moi truong phia Windows cho khoa DevOps.
# Cach chay (PowerShell):  powershell -ExecutionPolicy Bypass -File resources\check-env.ps1
# Khong can quyen Administrator. Script chi doc thong tin, khong thay doi may.

$script:missing = 0
$script:warnings = 0

function Write-Ok($label, $msg)   { Write-Host ("[ OK    ] {0,-20} {1}" -f $label, $msg) -ForegroundColor Green }
function Write-Miss($label, $msg) { Write-Host ("[ THIEU ] {0,-20} {1}" -f $label, $msg) -ForegroundColor Red; $script:missing++ }
function Write-Opt($label, $msg)  { Write-Host ("[ THIEU ] {0,-20} (tuy chon) {1}" -f $label, $msg) -ForegroundColor Yellow }
function Write-Warn($label, $msg) { Write-Host ("[ CANH BAO ] {0,-17} {1}" -f $label, $msg) -ForegroundColor Yellow; $script:warnings++ }

Write-Host "== He dieu hanh =="
$os = Get-CimInstance Win32_OperatingSystem
Write-Ok "Windows" ("{0} (build {1})" -f $os.Caption, $os.BuildNumber)
if ([int]$os.BuildNumber -lt 22000) {
    Write-Warn "Windows" "Build thap hon 22000 (Windows 11). WSL2 van chay duoc tren Windows 10 moi, nhung khoa hoc gia dinh Windows 11"
}

Write-Host ""
Write-Host "== Phan cung =="
$cs = Get-CimInstance Win32_ComputerSystem
$ramGb = [math]::Round($cs.TotalPhysicalMemory / 1GB, 1)
if ($ramGb -lt 7.5) {
    Write-Warn "RAM" "$ramGb GB: duoi muc toi thieu 8 GB"
} elseif ($ramGb -lt 15) {
    Write-Ok "RAM" "$ramGb GB (nhom 8 GB: dung Compose va kind luan phien, xem setup-guide)"
} else {
    Write-Ok "RAM" "$ramGb GB"
}
$cpu = Get-CimInstance Win32_Processor | Select-Object -First 1
Write-Ok "CPU" ("{0} ({1} nhan, {2} luong)" -f $cpu.Name.Trim(), $cpu.NumberOfCores, $cpu.NumberOfLogicalProcessors)
$disk = Get-CimInstance Win32_LogicalDisk -Filter "DeviceID='$($env:SystemDrive)'"
if ($disk) {
    $freeGb = [math]::Round($disk.FreeSpace / 1GB, 0)
    if ($freeGb -lt 30) { Write-Warn "O dia trong" "$freeGb GB tren $($env:SystemDrive) (nen co tu 30 GB tro len)" }
    else { Write-Ok "O dia trong" "$freeGb GB tren $($env:SystemDrive)" }
}

# Khi Hyper-V/WSL2 dang chay, VirtualizationFirmwareEnabled co the tra ve False du ao hoa da bat.
# Vi vay coi HypervisorPresent = True la bang chung ao hoa dang hoat dong.
if ($cs.HypervisorPresent) {
    Write-Ok "Ao hoa" "Hypervisor dang hoat dong (ao hoa da bat)"
} elseif ($cpu.VirtualizationFirmwareEnabled) {
    Write-Ok "Ao hoa" "Da bat trong BIOS/UEFI"
} else {
    Write-Miss "Ao hoa" "Chua bat. Vao BIOS/UEFI bat Intel VT-x hoac AMD-V (SVM Mode). Xem troubleshooting-setup.md"
}

Write-Host ""
Write-Host "== WSL =="
if (Get-Command wsl.exe -ErrorAction SilentlyContinue) {
    # wsl.exe xuat UTF-16; chuyen ve text thuong bang cach bo ky tu NUL.
    $raw = & wsl.exe --version 2>&1 | Out-String
    $ver = ($raw -replace "`0", "") -split "`r?`n" | Where-Object { $_.Trim() } | Select-Object -First 1
    if ($ver) { Write-Ok "WSL" $ver } else { Write-Ok "WSL" "da cai (khong doc duoc phien ban)" }

    $list = (& wsl.exe -l -v 2>&1 | Out-String) -replace "`0", ""
    $lines = $list -split "`r?`n" | Where-Object { $_.Trim() }
    $ubuntu = $lines | Where-Object { $_ -match "Ubuntu" }
    if ($ubuntu) {
        foreach ($l in $ubuntu) {
            $clean = ($l -replace "^\s*\*?\s*", "").Trim()
            if ($l -match "\s2\s*$") { Write-Ok "Distro" "$clean" }
            else { Write-Warn "Distro" "$clean (nen la WSL phien ban 2: wsl --set-version <ten> 2)" }
        }
    } else {
        Write-Miss "Ubuntu" "Chua co distro Ubuntu. Chay (PowerShell Admin): wsl --install -d Ubuntu-24.04"
    }
    if ($lines | Where-Object { $_ -match "docker-desktop" }) {
        Write-Ok "docker-desktop" "distro noi bo cua Docker Desktop hien dien"
    }
    $cfg = Join-Path $env:USERPROFILE ".wslconfig"
    if (Test-Path $cfg) { Write-Ok ".wslconfig" $cfg }
    else { Write-Warn ".wslconfig" "chua co. Nen gioi han RAM cho WSL, xem setup-guide" }
} else {
    Write-Miss "WSL" "Khong tim thay wsl.exe. Chay (PowerShell Admin): wsl --install"
}

Write-Host ""
Write-Host "== Cong cu phia Windows =="
function Test-Tool($label, $cmd, $verArgs, $required, $hint) {
    $c = Get-Command $cmd -ErrorAction SilentlyContinue
    if ($c) {
        $v = (& $cmd @verArgs 2>&1 | Select-Object -First 1 | Out-String).Trim()
        Write-Ok $label $v
    } elseif ($required) { Write-Miss $label $hint }
    else { Write-Opt $label $hint }
}
Test-Tool "git"       "git"     @("--version")           $true  "Cai Git for Windows: https://git-scm.com/download/win"
Test-Tool "VS Code"   "code"    @("--version")           $true  "Cai VS Code va chon Add to PATH khi cai"
Test-Tool "docker"    "docker"  @("--version")           $true  "Cai Docker Desktop"
Test-Tool "gh"        "gh"      @("--version")           $false "GitHub CLI (tuy chon)"

Write-Host ""
Write-Host "== Docker Desktop =="
if (Get-Command docker -ErrorAction SilentlyContinue) {
    $info = & docker info --format "Server {{.ServerVersion}}, {{.OperatingSystem}}" 2>&1 | Out-String
    if ($LASTEXITCODE -eq 0) { Write-Ok "docker daemon" $info.Trim() }
    else { Write-Miss "docker daemon" "Khong ket noi duoc. Mo Docker Desktop va doi bieu tuong chuyen sang trang thai Running" }
}

Write-Host ""
if ($script:missing -eq 0) {
    Write-Host "KET QUA: du dieu kien phia Windows. Canh bao: $($script:warnings)" -ForegroundColor Green
    Write-Host "Tiep theo: mo Ubuntu va chay: bash resources/check-env.sh"
    exit 0
} else {
    Write-Host "KET QUA: con $($script:missing) muc THIEU. Xem cac dong [ THIEU ] o tren. Canh bao: $($script:warnings)" -ForegroundColor Red
    exit 1
}
