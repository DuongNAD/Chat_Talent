<#
.SYNOPSIS
  Chat Talent — Cloudflare Tunnel Manager
.DESCRIPTION
  Script quản lý Cloudflare Tunnel cho Chat Talent.
  Hỗ trợ: Quick Tunnel (tạm), Named Tunnel (cố định), và Windows Service.
.EXAMPLE
  .\tunnel.ps1 quick      # Quick tunnel — URL tạm, không cần account
  .\tunnel.ps1 named      # Named tunnel — URL cố định, cần login
  .\tunnel.ps1 setup      # Setup ban đầu cho Named tunnel
  .\tunnel.ps1 service    # Cài tunnel chạy như Windows Service
#>

param(
    [Parameter(Position = 0)]
    [ValidateSet('quick', 'named', 'setup', 'service', 'status', 'stop')]
    [string]$Action = 'quick'
)

$CF = 'C:\Program Files (x86)\cloudflared\cloudflared.exe'
$ConfigFile = Join-Path $PSScriptRoot 'cloudflared-config.yml'
$TunnelName = 'chat-talent'

function Write-Header($msg) {
    Write-Host ""
    Write-Host "  💎 Chat Talent Tunnel — $msg" -ForegroundColor Cyan
    Write-Host "  $('─' * 50)" -ForegroundColor DarkGray
}

switch ($Action) {
    # ============================================================
    # QUICK TUNNEL — URL tạm, không cần tài khoản Cloudflare
    # Tắt script = tắt tunnel
    # ============================================================
    'quick' {
        Write-Header "Quick Tunnel (tạm thời)"
        Write-Host "  ℹ️  URL sẽ hiện bên dưới sau vài giây..." -ForegroundColor Yellow
        Write-Host "  ℹ️  Gửi URL .trycloudflare.com cho bạn bè để kết nối" -ForegroundColor Yellow
        Write-Host "  ⚠️  Ctrl+C để tắt tunnel" -ForegroundColor Red
        Write-Host ""

        # Quick tunnel tự tạo URL random
        & $CF tunnel --url http://localhost:3000
    }

    # ============================================================
    # SETUP — Login + Tạo Named Tunnel (chỉ chạy 1 lần)
    # ============================================================
    'setup' {
        Write-Header "Setup Named Tunnel"

        # Step 1: Login
        Write-Host "  1️⃣  Mở trình duyệt để đăng nhập Cloudflare..." -ForegroundColor Yellow
        & $CF tunnel login
        if ($LASTEXITCODE -ne 0) {
            Write-Host "  ❌ Login thất bại!" -ForegroundColor Red
            exit 1
        }
        Write-Host "  ✅ Đăng nhập thành công!" -ForegroundColor Green

        # Step 2: Create tunnel
        Write-Host ""
        Write-Host "  2️⃣  Tạo tunnel '$TunnelName'..." -ForegroundColor Yellow
        & $CF tunnel create $TunnelName
        if ($LASTEXITCODE -ne 0) {
            Write-Host "  ⚠️  Tunnel có thể đã tồn tại, tiếp tục..." -ForegroundColor Yellow
        } else {
            Write-Host "  ✅ Tunnel đã tạo!" -ForegroundColor Green
        }

        # Step 3: Show tunnel info
        Write-Host ""
        Write-Host "  3️⃣  Thông tin tunnel:" -ForegroundColor Yellow
        & $CF tunnel info $TunnelName

        Write-Host ""
        Write-Host "  📝 BƯỚC TIẾP THEO:" -ForegroundColor Cyan
        Write-Host "  1. Copy Tunnel ID từ output trên" -ForegroundColor White
        Write-Host "  2. Mở file cloudflared-config.yml" -ForegroundColor White
        Write-Host "  3. Thay <YOUR_TUNNEL_ID> bằng Tunnel ID" -ForegroundColor White
        Write-Host "  4. Thay <YOUR_DOMAIN> bằng domain của bạn" -ForegroundColor White
        Write-Host "  5. Chạy: .\tunnel.ps1 named" -ForegroundColor White
        Write-Host ""
        Write-Host "  💡 Để route DNS:" -ForegroundColor Yellow
        Write-Host "     cloudflared tunnel route dns $TunnelName chat.your-domain.com" -ForegroundColor White
    }

    # ============================================================
    # NAMED TUNNEL — URL cố định qua domain
    # ============================================================
    'named' {
        Write-Header "Named Tunnel (cố định)"

        if (-not (Test-Path $ConfigFile)) {
            Write-Host "  ❌ Không tìm thấy $ConfigFile" -ForegroundColor Red
            Write-Host "  💡 Chạy '.\tunnel.ps1 setup' trước" -ForegroundColor Yellow
            exit 1
        }

        Write-Host "  🔗 Tunnel sẽ chạy theo config: $ConfigFile" -ForegroundColor Yellow
        Write-Host "  ⚠️  Ctrl+C để tắt tunnel" -ForegroundColor Red
        Write-Host ""

        & $CF tunnel --config $ConfigFile run
    }

    # ============================================================
    # SERVICE — Cài tunnel chạy ngầm như Windows Service
    # ============================================================
    'service' {
        Write-Header "Cài đặt Windows Service"

        if (-not (Test-Path $ConfigFile)) {
            Write-Host "  ❌ Không tìm thấy $ConfigFile" -ForegroundColor Red
            exit 1
        }

        Write-Host "  📦 Cài đặt service (cần quyền Admin)..." -ForegroundColor Yellow
        & $CF service install --config $ConfigFile

        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ Service đã cài! Tunnel chạy tự động khi Windows khởi động." -ForegroundColor Green
            Write-Host "  💡 Quản lý: services.msc → 'cloudflared'" -ForegroundColor Yellow
        } else {
            Write-Host "  ❌ Cài thất bại. Thử chạy PowerShell với quyền Administrator." -ForegroundColor Red
        }
    }

    # ============================================================
    # STATUS — Kiểm tra tunnel đang chạy
    # ============================================================
    'status' {
        Write-Header "Trạng thái Tunnel"
        & $CF tunnel list
    }

    # ============================================================
    # STOP — Dừng service
    # ============================================================
    'stop' {
        Write-Header "Dừng Tunnel Service"
        & $CF service uninstall
        Write-Host "  ✅ Service đã gỡ." -ForegroundColor Green
    }
}
