# VESO
Online Food Ordering and Delivery Platform
## Instructions
Create a web application that allows users to order food from local restaurants.

Implement features for menu management, order tracking, and payment processing. Payment processing must be simulated, you are not expected to add a payment platform.

## Setup
Back-End:
 - `> cd back-end`
 - `> npm install`
 - `> echo 'APP_PORT=3000' > .env`
 - `> npx prisma migrate dev` (not required since we use external Postgres database)
 - `> npx ts-node util/seed.ts` (not required since we use external Postgres database)
 - `> npm start`
<br></br>

Front-End:
 - `> cd front-end`
 - `> npm install`
 - `> npm run dev`
<br></br>

Function app (:3001):
 - `> npm start`
<br></br>

Start/stop everything:
 - linux: `start.sh`/`stop.sh`
 - Windows: `docker-compose up --build --detach`/`docker-compose down`

## Testing
Testing can be done in back and front end via `npm test`.

## Swagger
http://localhost:3000/api-docs/

## Developers
 - Rostislav Duşnîi
 - Nick Maharjan
 - Dima Podoleanu
 - Matej Vesel
 - Shulin Xu
