# RIUFrontendEugenioTomasCabrera

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.0.1.
It's build to work with Docker.

## Development server

To start the container image, run:

```bash
docker build -t riu-frontend-eugeniotomascabrera .
```

Once builded, run the image with
```bash
docker run -p 8080:8080 riu-frontend-eugeniotomascabrera
```

Once the server is running, open your browser and navigate to `http://localhost:8080/`. The application will automatically reload whenever you modify any of the source files.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```