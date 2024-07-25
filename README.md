Pasos para correr la app
1. Instala todas las paqueterias con el comando 'npm i'
3. Correr el comando `docker run -d --name nats-server -p 4222:4222 -p 6222:6222 -p 8222:8222 nats` para levantar el servidor nats en docker
2. Configura las variables de entorno del archivo .env acorde al archivo .env.template
4. Asegurarse de tener docker corriendo
5. Lanzar comandos:
    -   npm run client-gateway (Correr el cliente que se encarga de la comunicacion)
    -   npm run users (Correr el microservicio de usuarios)

Notas:
    - Conforme avance la app la manera de correr esta cambiara para hacerla mas sencilla de momento se trabajara de esta forma