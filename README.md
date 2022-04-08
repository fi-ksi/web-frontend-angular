# KSI Web frontend

This project was build upon the [Angular](https://angular.io/guide/) framework as an frontend for the [backend server](https://github.com/fi-ksi/web-backend). 

## Clone

```bash
git clone https://github.com/fi-ksi/web-frontend-angular.git &&
cd web-frontend-angular &&
npm install
```

## Running

To start the development server, use `npm run start`.

## Building

To build for:

- testing server: `npm run build.kyzikos`

- production server: `npm run build.kleobis`

## Utilities

Utilities are located inside the `util/` directory, containing following files:

### gen-api.sh

- executed by `npm run gen.api`

`gen-api.sh` takes `swagger.json` produced by [backend swagger project](https://github.com/fi-ksi/web-backend-swagger). Both projects need to be cloned to the same directory.

Based on the swagger definition, it generates API service and models inside the `src/api/` folder. 

A few automatics fixes to the generated code are then made by this util.

### gen-changelog.sh

- executed by `npm run gen.changelog`

`gen-changelog.sh` takes git's log and saves this information into `src/assets/changelog/` directory. This is then used by the changelog modal inside the application.

### gen-scss-theme.sh

executed by `npm run gen.theme`

`gen-scss-theme.sh` generates scss variables based on `src/app/styles/theme.scss` and saves them into the same file under `AUTO-GENERATED` section. for usage inside the application. SCSS variables are safer than regular css variables because the compiler throws error if used variable is undefined.

### gen-icons.sh

executed by `npm run gen.icons`

`gen-icons.sh` takes main `.svg` icon from `src/assets/img/icon.svg` and generates all required `.png` icons under `src/assets/icons` for PWA.


## Deployment

Automatic deploy is executed based on which branch is pushed into. To see which branch deploys where, take a look inside the `.github/workflows` directory.

## Localization

The source code is written in English, but the web itself is in Czech. This is possible by using `ngx-translate` package. All texts (except a few exceptions) are saved inside `src/assets/cs.json`.

The routes are also translated by using `fileReplacements` inside `angular.json` file. Raw values can be found inside `src/routes/`.
