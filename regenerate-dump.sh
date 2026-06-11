#!/bin/bash
# Regenera el dump SQL desde la BD remota de Abacus.
# Uso: ./regenerate-dump.sh
# Requiere: pg_dump v17 y DATABASE_URL en nextjs_space/.env

set -e

SOURCE_ENV="nextjs_space/.env"
OUTPUT="docker/initdb/01-schema-data.sql"

if [ ! -f "$SOURCE_ENV" ]; then
  echo "❌ No se encontró $SOURCE_ENV"
  exit 1
fi

source "$SOURCE_ENV"

if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL no está definida en $SOURCE_ENV"
  exit 1
fi

PGDUMP=$(command -v pg_dump || echo "/usr/lib/postgresql/17/bin/pg_dump")
echo "Usando pg_dump: $PGDUMP"
echo "Generando dump..."

"$PGDUMP" "$DATABASE_URL" --no-owner --no-privileges --clean --if-exists > "$OUTPUT"

# Limpiar comandos propietarios del servidor Abacus que no son SQL estándar
sed -i '/^\\restrict\|^\\unrestrict/d' "$OUTPUT"

LINES=$(wc -l < "$OUTPUT")
echo "✅ Dump generado: $OUTPUT ($LINES líneas)"
