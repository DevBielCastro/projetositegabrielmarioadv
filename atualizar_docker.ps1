# atualizar_docker.ps1

Write-Host "🔄 Rebuildando imagem Docker..."
docker build -t gabrielmarioadv-app .

Write-Host "🛑 Parando e removendo container antigo (se existir)..."
docker stop gabrielmarioadv-app -ErrorAction SilentlyContinue
docker rm gabrielmarioadv-app -ErrorAction SilentlyContinue

Write-Host "🚀 Subindo novo container com .env..."
docker run -d --env-file .env -p 3000:3000 --name gabrielmarioadv-app gabrielmarioadv-app

Write-Host "✅ Container atualizado com sucesso!"
