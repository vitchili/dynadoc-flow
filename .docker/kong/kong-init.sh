#!/bin/sh

echo "Aguardando o Kong iniciar..."
sleep 10

echo "Registrando serviços e rotas no Kong..."

# USER SERVICE
curl -i -X POST http://kong:8001/services \
  --data name=user-service \
  --data url=http://user-nginx:80

curl -i -X POST http://kong:8001/services/user-service/routes \
  --data 'paths[]=/api/auth/login' \
  --data 'strip_path=false'

# TEMPLATE SERVICE
curl -i -X POST http://kong:8001/services \
  --data name=template-service \
  --data url=http://template-nginx:80

curl -i -X POST http://kong:8001/services/template-service/routes \
  --data 'paths[]=/api/contexts' \
  --data 'paths[]=/api/tags' \
  --data 'paths[]=/api/templates' \
  --data 'paths[]=/api/sections' \
  --data 'strip_path=false'

# FILE SERVICE
curl -i -X POST http://kong:8001/services \
  --data name=file-service \
  --data url=http://file-nginx:80

curl -i -X POST http://kong:8001/services/file-service/routes \
  --data 'paths[]=/api/files' \
  --data 'strip_path=false'

echo "Rotas registradas com sucesso!"
