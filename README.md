<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Docker: Backend + RabbitMQ + Postgres

### 1. Preparar variables

```bash
cp .env.example .env
```

Verifica estos valores en `.env` para levantar todo por Docker:

- `PORT=3000`
- `DB_USERNAME=postgres`
- `DB_PASSWORD=postgres`
- `DB_DATABASE=db`
- `RABBITMQ_USER=guest`
- `RABBITMQ_PASSWORD=guest`
- Credenciales Firebase (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`) para envío real por FCM.

### 2. Construir y levantar servicios

```bash
docker compose up -d --build api postgres rabbitmq
```

Servicios disponibles:

- API: `http://localhost:3000`
- Swagger: `http://localhost:3000/docs`
- RabbitMQ Management: `http://localhost:15672` (user/pass del `.env`)

### 3. Ejecutar migraciones y seeds (si no existen tablas)

```bash
docker compose exec api npm run migration:run
docker compose exec api npm run seed
```

### 4. Verificar conexión a RabbitMQ

```bash
docker compose logs -f api
```

Debes ver logs similares a:

- `Connected to RabbitMQ`
- `RabbitMQ consumer started`

### 5. Subir imagen a Docker Hub

```bash
docker login
docker tag kashy-api:latest TU_USUARIO_DOCKERHUB/kashy-api:latest
docker push TU_USUARIO_DOCKERHUB/kashy-api:latest
```

Si quieres que `docker compose` use tu imagen publicada en vez de build local, exporta:

```bash
export API_IMAGE=TU_USUARIO_DOCKERHUB/kashy-api:latest
docker compose up -d api postgres rabbitmq
```

### 6. Probar envío de notificaciones (flujo completo)

1. Inicia sesión con un usuario autenticado.
2. Asegúrate de tener `pushEnabled=true` y `debtReminders=true` en `PUT /users/me/notification-preferences`.
3. Crea una deuda con `dueDate` para mañana en `POST /debts`.
4. Espera el ciclo del cron (cada minuto) o revisa logs en `api`.
5. Confirma en RabbitMQ Management que el mensaje pasa por `notifications_queue`.
6. Verifica en el móvil que llega el push FCM.

## Levantar en local y permitir conexiones externas

### 1. Variables de entorno

```bash
cp .env.example .env
```

Configura al menos estos valores en `.env`:

- `HOST=0.0.0.0` para que Nest escuche fuera de `localhost`.
- `PORT=3000` (o el que quieras publicar).
- `ALLOWED_ORIGINS` con los frontends que consumirán la API, separados por coma.

Ejemplo:

```env
HOST=0.0.0.0
PORT=3000
ALLOWED_ORIGINS=http://localhost:3000,http://192.168.1.10:3000
```

### 2. Levantar base de datos local (opcional con Docker)

```bash
docker compose up -d postgres pgadmin
```

### 3. Levantar la API

```bash
npm run start:dev
```

Prueba desde otra maquina en tu misma red:

```bash
curl http://TU_IP_LOCAL:3000/api/v1/exchange-rates/current
```

### 4. Exponer a internet (desarrollo)

Para compartir temporalmente tu API sin abrir puertos del router:

```bash
# opcion A: ngrok
ngrok http 3000

# opcion B: cloudflared
cloudflared tunnel --url http://localhost:3000
```

Luego agrega el dominio publico del tunel a `ALLOWED_ORIGINS` si tu frontend web hará llamadas desde navegador.

### 5. Si no responde desde fuera

- Verifica firewall de macOS (permitir Node.js conexiones entrantes).
- Confirma que el proceso escucha en `0.0.0.0:3000`.
- Si será acceso desde internet sin túnel, configura port forwarding en tu router al equipo local.

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
