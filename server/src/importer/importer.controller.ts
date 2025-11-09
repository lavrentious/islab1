import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ImporterService } from "./importer.service";

@Controller("imports")
export class ImporterController {
  constructor(private readonly importerService: ImporterService) {}
  @Post()
  @UseInterceptors(FileInterceptor("file"))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    console.log("controller: got file", file);
    if (!file) {
      throw new BadRequestException(
        "No file uploaded (`file` key in form-data)",
      );
    }
    return this.importerService.enqueueImport(file);
  }

  @Get()
  findAll() {
    return this.importerService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.importerService.findOneOrFail(+id);
  }
}
