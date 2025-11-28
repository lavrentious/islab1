<a name="readme-top"></a>

<br />
<div align="center">
  <a href="https://github.com/lavrentious/islab">
    <img src="https://islab.lavrentious.ru/hoodwink.png" alt="Logo" width="64" height="64" style="filter: drop-shadow(3px 3px 3px #aaa)">
  </a>

  <h3 align="center">islab</a></h3>

  <p align="center">
    Лабораторная работа по <strong>Информационным системам</strong> 
    <br />
    <a href="https://api.islab.lavrentious.ru/docs"><strong>API документация »</strong></a>
    <br/ >
    <a href="https://islab.lavrentious.ru"><strong>Деплой »</strong></a>
  </p>
</div>

## Стек технологий

- ![NestJS][NestJS]
- ![TypeScript][TypeScript]
- ![Bun][Bun]
- ![Postgres][Postgres]
- ![React][React]

---

## Локальный запуск

Инструкция по локальному поднятию:

### Предварительные требования

1. **Окружение**:

- Node.js (>=18) + `pnpm`/`yarn` или `bun`
- PostgreSQL

### Инициализация и запуск

0. Клонировать репозиторий

   ```sh
   git clone https://github.com/lavrentious/tgrapi.git
   ```

1. Сервер
    1. Установить зависимости

      ```sh
      bun install
      ```

    2. Создать и заполнить `./server/.env.development`/`./server/.env.production` файл на основе [./server/env.example](./server/.env.example)

    3. Запуск dev-сервера

      ```sh
      bun run start:dev
      ```

    Dev сервер будет доступен на `http://localhost:3000`
2. Клиент
    1. Установить зависимости
      ```sh
      bun install
      ```

    2. Создать и заполнить `./client/.env.development`/`./client/.env.production` файл на основе [./client/env.example](./client/.env.example)

    3. Запуск dev-сервера

      ```sh
      bun run dev
      ```

    Dev сервер будет доступен на `http://localhost:5173`



[product-screenshot]: images/screenshot.png
[NestJS]: https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white
[Postgres]: https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white
[TypeScript]: https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white
[NodeJS]: https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white
[PNPM]: https://img.shields.io/badge/pnpm-%234a4a4a.svg?style=for-the-badge&logo=pnpm&logoColor=f69220
[React]: https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB
[Bun]: https://img.shields.io/badge/Bun-000?logo=bun&logoColor=fff&style=for-the-badge
