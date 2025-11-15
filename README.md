# My Portfolio - The Frontend Experience (Angular)

## 1. Creating a new Angular application

To create a new angular application that runs inside docker, perform the following tasks:

1. Copy the Dockerfile, docker-compose.yml file, .env file, .gitignore file, and .dockerignore file to a new directory.

2. Update the docker compose file as per your requirements.

3. Comment out the line 'RUN npm install' in Dockerfile.

3. Run the following command to create a docker container

```
docker-compose run frontend_experience_angular bash
```

This will install the angular cli, build a docker image, and connect you to the bash terminal.

4. Create a new angular project using the command:

```
ng new <app name> --directory ./
```

This will create a new Angular project and save it in the app directory.

5. Logout of the terminal, remove the docker container and image.

6. Uncomment the line 'RUN npm install' in Dockerfile.

7. Run the docker containers normally using docker compose. This should rebuild the containers and install the packages from package.json

### References

1. [https://www.freecodecamp.org/news/how-to-add-bootstrap-css-framework-to-an-angular-application/](https://www.freecodecamp.org/news/how-to-add-bootstrap-css-framework-to-an-angular-application/)

2. Ross by joney_lol [CC-BY] (https://creativecommons.org/licenses/by/3.0/) via Poly Pizza (https://poly.pizza/m/mNvWmEA4O4)

3. [Environment variables in Angular](https://medium.com/@desinaoluseun/using-env-to-store-environment-variables-in-angular-20c15c7c0e6a)

4. [Environment variables in Angular 2](https://medium.com/@philip.mutua/setting-up-environment-variables-for-an-angular-application-from-scratch-737028f8b7b3)


**OpenApi Specification: [https://djadmin.vip3rtech6069.com/api/docs](https://djadmin.vip3rtech6069.com/api/docs) **