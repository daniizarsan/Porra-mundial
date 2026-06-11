# Porra Mundial 2026 ⚽

Aplicación web para gestionar una porra del Mundial 2026 entre amigos.

## Despliegue local con Docker

### Requisitos
- Docker y Docker Compose instalados
- Puerto 3000 libre

### Arrancar

```bash
docker compose up --build -d
```

La primera vez tarda unos minutos en compilar. La base de datos se inicializa automáticamente con los grupos y equipos del Mundial.

### Acceder

- **URL:** http://localhost:3000
- **Admin:** `daniizarsan@gmail.com` / `ROZgKPdqlWiMdE`

### Parar

```bash
docker compose down
```

### Resetear la base de datos

Si quieres empezar de cero (borra todos los datos):

```bash
docker compose down -v   # borra el volumen de datos
docker compose up --build -d
```

## Compartir la imagen por Docker Hub

### Subir (tú)

```bash
docker login
docker tag porra-mundial-app:latest TU_USUARIO/porra-mundial:latest
docker push TU_USUARIO/porra-mundial:latest
```

### Descargar (tu amigo)

Tu amigo necesita:
1. Crear una carpeta con el `docker-compose.yml` y la carpeta `docker/initdb/` (con el archivo SQL)
2. Cambiar la imagen en docker-compose.yml:

```yaml
  app:
    image: TU_USUARIO/porra-mundial:latest   # en vez de build: ...
```

3. Ejecutar:
```bash
docker compose up -d
```

| Dato | Valor |
|------|-------|
| Puerto | `3000` |
| Volumen BD | `porra_db:/var/lib/postgresql/data` |
| Init SQL | `./docker/initdb:/docker-entrypoint-initdb.d:ro` |
