// import-file-storage.service.ts
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { EnvironmentVariables } from "src/env.validation";

const BASE_PATH = "imports";

@Injectable()
export class ImportFileStorageService {
  private readonly bucket: string;
  private readonly endpoint: string;

  constructor(
    private readonly s3: S3Client,
    private readonly config: ConfigService<EnvironmentVariables>,
  ) {
    this.bucket = this.config.get("S3_BUCKET")!;
    this.endpoint = this.config.get("S3_ENDPOINT")!;
  }

  async uploadFile(fileName: string, data: Buffer, mimeType?: string) {
    const path = `${BASE_PATH}/${fileName}`;
    // throw new InternalServerErrorException(`SIMULATED S3 FAILURE`);
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: path,
        Body: data,
        ContentType: mimeType,
      }),
    );
  }

  async deleteFile(fileName: string) {
    const path = `${BASE_PATH}/${fileName}`;
    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: path,
      }),
    );
  }

  async getDownloadUrl(key: string, expiresInSeconds = 3600): Promise<string> {
    const path = `${BASE_PATH}/${key}`;
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: path,
    });

    return getSignedUrl(this.s3, command, {
      expiresIn: expiresInSeconds,
    });
  }
}
