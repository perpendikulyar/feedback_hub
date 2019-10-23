# Feedback Hub

API для сбора фитбека от пользователей.
В приложеннии используется: 
* [PostrgreSQL 11](https://www.postgresql.org/)
* [NEST.JS](https://docs.nestjs.com/)
* [TypeOrm](https://typeorm.io/#/)
* [Passport-JWT](http://www.passportjs.org/packages/passport-jwt/)

## Dependencies

* __@nestjs/common:__ ^6.0.0,
* __@nestjs/core:__ ^6.0.0,
* __@nestjs/jwt:__ ^6.1.1,
* __@nestjs/passport:__ ^6.1.0,
* __@nestjs/platform-express:__ ^6.0.0,
* __@nestjs/typeorm:__ ^6.2.0,
* __bcryptjs:__ ^2.4.3,
* __body-parser:__ ^1.19.0,
* __class-transformer:__ ^0.2.3,
* __class-validator:__ ^0.10.1,
* __config:__ ^3.2.3,
* __passport:__ ^0.4.0,
* __passport-jwt:__ ^4.0.0,
* __pg:__ ^7.12.1,
* __reflect-metadata:__ ^0.1.12,
* __rimraf:__ ^2.6.2,
* __rxjs:__ ^6.3.3,
* __typeorm:__ ^0.2.19
-----
## Development

#### Сборка приложения

Для того чтобы запустить приложение на локальной среде нужно поднять локально Postgres с помощью [докера](https://www.docker.com/)
```cmd
docker-compose up -d
```

либо самостоятельно поставить локально postgres и конфиге приложения прописать коннект к БД

##### .\config\default.yaml
```yml
...

db:
  type: 'postgres'
  port: '5432'
  database: 'frmfeedback'
  host: 'localhost'
  username: 'postgres'
  password: 'postgres'
  sync: true
  timezone: 'Europe/Moscow'

...
```

После успешной установки БД запускается приложение

##### Запуск приложения в режиме разработки с поддержкой hot reload
```
npm run start:dev
```

##### Запуск юнит тестов
```
npm run test
```

##### Обычный запуск приложения
```
npm run start
```

После первого запуска приложение синхронизирует модели и создаст необходимую схему БД.

Приложение будет доступно по хосту: __localhost:3000__

После запуска нужно выполнить POST-запрос для создания пользователя с правами супер админа. Никаие дополнительные параметры запроса передавать не нужно.

```
http://localhost:3000/auth/createSuperAdmin
```

----

## Modules

### Auth.module
Модуль авторизации
Позволяет создавать новых пользователей приложения, и получить авторизационный токен для выполнения запросов.


