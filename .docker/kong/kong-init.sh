#!/bin/sh

echo "Aguardando o Kong iniciar..."
sleep 10

echo "Registrando serviços e rotas no Kong..."

# USER SERVICE
curl -s -X POST http://kong:8001/services \
  --data name=user-service \
  --data url=http://user-nginx:80

curl -s -X POST http://kong:8001/services/user-service/routes \
  --data 'paths[]=/api/auth/login' \
  --data 'strip_path=false'

# TEMPLATE SERVICE
curl -s -X POST http://kong:8001/services \
  --data name=template-service \
  --data url=http://template-nginx:80

curl -s -X POST http://kong:8001/services/template-service/routes \
  --data 'paths[]=/api/contexts' \
  --data 'paths[]=/api/tags' \
  --data 'paths[]=/api/templates' \
  --data 'paths[]=/api/sections' \
  --data 'strip_path=false'

# FILE SERVICE
curl -s -X POST http://kong:8001/services \
  --data name=file-service \
  --data url=http://file-nginx:80

curl -s -X POST http://kong:8001/services/file-service/routes \
  --data 'paths[]=/api/files' \
  --data 'strip_path=false'

echo "Criando consumer e configurando JWT..."

curl -s -X POST http://kong:8001/consumers \
  --data "username=user-service"

PUB_KEY=$(cat ./jwt-public.pem)

curl -s -X POST http://kong:8001/consumers/user-service/jwt \
  --data "algorithm=RS256" \
  --data-urlencode "rsa_public_key=$PUB_KEY" \
  --data "key=user-service"

# Ativar JWT no template-service
curl -s -X POST http://kong:8001/services/template-service/plugins \
  --data "name=jwt" \
  --data "config.key_claim_name=iss" \
  --data "config.claims_to_verify=exp" \
  --data "config.run_on_preflight=false"

curl -s -X POST http://kong:8001/services/template-service/plugins \
  --data "name=request-transformer" \
  --data "config.add.headers[]=X-User-Id:\$jwt.claims.userId" \
  --data "config.add.headers[]=X-User-Email:\$jwt.claims.email"

# Ativar JWT no file-service
curl -s -X POST http://kong:8001/services/file-service/plugins \
  --data "name=jwt" \
  --data "config.key_claim_name=iss" \
  --data "config.claims_to_verify=exp" \
  --data "config.run_on_preflight=false"

curl -s -X POST http://kong:8001/services/file-service/plugins \
  --data "name=request-transformer" \
  --data "config.add.headers[]=X-User-Id:\$jwt.claims.userId" \
  --data "config.add.headers[]=X-User-Email:\$jwt.claims.email"

echo "Configuração concluída!"
