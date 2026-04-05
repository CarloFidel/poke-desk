<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# Ejectar en desarrollo

1. Clonar el repositorio
2. Ejecutar

```
yarn install
```

3. Tener Nest CLI instaldo
```
npm i -g @nestjs/cli
```
4. Levantar la base de datos
```
docker-compose up -d
```
5. Clonar archivo __.env.template__ y renombrar la copia a __.env__
6. Llenar las variables de entornos deficnidas en el __env__

7. Ejecutar la aplicación en dev
```
yarn start:dev
```
8. Reconstruir la base de datos con la semilla

```
htto://localhost:3000/api/v2/seed
```

## Stack utilizado
* MongoDB
* Nestjs
* Docker