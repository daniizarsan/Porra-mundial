#!/bin/bash
# Script para exportar la imagen Docker + dump SQL inicial para tu compañero.
# Uso: ./export-image.sh

set -e

if [ ! -f docker/initdb/01-schema-data.sql ]; then
  echo "❌ No se encontró docker/initdb/01-schema-data.sql"
  echo "   Este archivo debe contener el dump de la BD con los datos del torneo."
  exit 1
fi

echo "⚽ Construyendo imagen Docker (solo build final, sin código fuente)..."
docker compose build app

echo "📦 Exportando imagen..."
IMAGE_ID=$(docker compose images app -q 2>/dev/null || docker images --filter "reference=*porra*" --format '{{.ID}}' | head -1)

if [ -z "$IMAGE_ID" ]; then
  echo "Error: No se encontró la imagen. Ejecuta primero: docker compose build"
  exit 1
fi

docker tag "$IMAGE_ID" porra-mundial:latest
docker save porra-mundial:latest | gzip > porra-mundial.tar.gz

# Paquete final: imagen + compose para pull + dump SQL
tar czf porra-mundial-deploy.tar.gz \
  porra-mundial.tar.gz \
  docker-compose.pull.yml \
  docker/initdb/01-schema-data.sql

rm porra-mundial.tar.gz
SIZE=$(du -h porra-mundial-deploy.tar.gz | cut -f1)

echo ""
echo "✅ Paquete listo: porra-mundial-deploy.tar.gz ($SIZE)"
echo ""
echo "📤 Para tu compañero, envíale:  porra-mundial-deploy.tar.gz"
echo ""
echo "Él ejecuta:"
echo "   tar xzf porra-mundial-deploy.tar.gz"
echo "   docker load < porra-mundial.tar.gz"
echo "   mv docker-compose.pull.yml docker-compose.yml"
echo "   docker compose up -d"
echo ""
echo "🔒 La imagen NO contiene código fuente, solo el build compilado."
echo "🔒 La BD se inicializa localmente con todos los datos (incluido tu admin)."
