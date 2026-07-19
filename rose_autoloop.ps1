while ($true) {

Write-Host "ROSE AUTONOMIE LOOP..."

Invoke-RestMethod `
-Method POST `
-Uri "https://intmggzouwcaidotikbt.supabase.co/functions/v1/rose-auto-loop" `
-Headers @{
"Content-Type"="application/json"
} `
-Body '{"user_id":"david"}'

Start-Sleep -Seconds 300
}