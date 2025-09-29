import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import chalk from "chalk";
import { Request } from "express";
import morgan from "morgan";
import { AppModule } from "./app.module";
import { EnvironmentVariables } from "./env.validation";

function initMorgan() {
  // Custom token for colored status codes
  morgan.token("statusColored", (req, res) => {
    const status = res.statusCode;
    if (status >= 500) return chalk.red(status.toString());
    if (status >= 400) return chalk.yellow(status.toString());
    if (status >= 300) return chalk.cyan(status.toString());
    if (status >= 200) return chalk.green(status.toString());
    return chalk.white(status.toString());
  });

  // Custom token for colored method
  morgan.token("methodColored", (req) => {
    const method = req.method;
    switch (method) {
      case "GET":
        return chalk.cyan(method);
      case "POST":
        return chalk.green(method);
      case "PUT":
      case "PATCH":
        return chalk.yellow(method);
      case "DELETE":
        return chalk.red(method);
      default:
        return chalk.white(method);
    }
  });

  // Custom token for shorter date
  morgan.token("shortDate", () => chalk.gray(new Date().toISOString()));

  // Apply middleware
  return morgan(
    [
      chalk.gray("[") + ":shortDate" + chalk.gray("]"),
      ":methodColored",
      ":url",
      ":statusColored",
      chalk.gray("-"),
      chalk.magenta(":response-time ms"),
      chalk.gray("-"),
      chalk.blue(":res[content-length] bytes"),
    ].join(" "),
    {
      skip: (req: Request) => req.originalUrl.startsWith("/api"),
    },
  );
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService =
    app.get<ConfigService<EnvironmentVariables>>(ConfigService);
  app.enableCors({
    origin: configService.get("CLIENT_URL") as string,
    credentials: true,
  });
  app.use(initMorgan());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  const config = new DocumentBuilder()
    .setTitle("TGR API")
    .setDescription("The IS Lab API description")
    .setVersion(configService.get("VERSION") as string)
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document);
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap(); // eslint-disable-line
