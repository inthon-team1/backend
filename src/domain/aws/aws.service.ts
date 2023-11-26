import { Injectable } from '@nestjs/common';
import {
  StartTranscriptionJobCommand,
  TranscribeClient,
  StartTranscriptionJobCommandInput,
} from '@aws-sdk/client-transcribe';
import {
  GetObjectCommand,
  S3Client,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import * as AWS from 'aws-sdk';
import { Blob } from 'buffer';

@Injectable()
export class AwsService {
  BUCKET_NAME = 'inthon';
  REGION = 'ap-northeast-2';
  AWS_ACCESS = process.env.AWS_ACCESS_KEY;
  AWS_SECRET = process.env.AWS_SECRET_KEY;
  transcribeClient: TranscribeClient;
  constructor() {
    AWS.config.update({
      accessKeyId: this.AWS_ACCESS,
      secretAccessKey: this.AWS_SECRET,
      region: this.REGION,
    });
    this.transcribeClient = new TranscribeClient({
      region: this.REGION,
      credentials: {
        accessKeyId: this.AWS_ACCESS,
        secretAccessKey: this.AWS_SECRET,
      },
    });
  }

  async uploadBuffer(buffer: Buffer) {
    try {
      AWS.config.update({
        accessKeyId: this.AWS_ACCESS,
        secretAccessKey: this.AWS_SECRET,
        region: this.REGION,
      });
      const fileName = new Date().toString();
      const fileContent = buffer;
      const upload = new AWS.S3.ManagedUpload({
        params: {
          Bucket: this.BUCKET_NAME,
          Key: fileName,
          Body: fileContent,
          ContentType: 'audio/mp3',
          ACL: 'public-read',
        },
      });
      const data = await upload.promise();
      return data.Location;
    } catch (err) {
      console.log(err);
    }
  }

  async uploadFile(file: Express.Multer.File) {
    AWS.config.update({
      accessKeyId: this.AWS_ACCESS,
      secretAccessKey: this.AWS_SECRET,
      region: this.REGION,
    });
    const fileName = new Date().getTime().toString();
    const fileContent = file.buffer;
    const upload = new AWS.S3.ManagedUpload({
      params: {
        Bucket: this.BUCKET_NAME,
        Key: fileName,
        Body: fileContent,
        ContentType: file.mimetype,
        ACL: 'public-read',
      },
    });
    const data = await upload.promise();
    return data.Location;
  }

  async startTranscriptionJob(fileSrc: string) {
    AWS.config.update({
      accessKeyId: this.AWS_ACCESS,
      secretAccessKey: this.AWS_SECRET,
      region: this.REGION,
    });
    const jobName = new Date().getTime().toString();
    const params: StartTranscriptionJobCommandInput = {
      TranscriptionJobName: jobName,
      LanguageCode: 'ko-KR',

      MediaFormat: 'mp3',
      Media: {
        MediaFileUri: fileSrc,
      },
      OutputBucketName: this.BUCKET_NAME,
    };
    console.log(params);
    console.log(this.transcribeClient.config);
    await this.transcribeClient.send(new StartTranscriptionJobCommand(params));
    return jobName;
  }

  async getS3(key: string) {
    const client = new S3Client({
      credentials: {
        accessKeyId: this.AWS_ACCESS,
        secretAccessKey: this.AWS_SECRET,
      },
      region: this.REGION,
    });
    const listCom = new ListObjectsV2Command({
      Bucket: this.BUCKET_NAME,
      MaxKeys: 1000,
    });

    while (true) {
      const response = await client.send(listCom);
      const contents = response.Contents;

      let flag = false;
      contents.forEach((content) => {
        if (content.Key === key) flag = true;
      });
      if (flag) break;
    }

    const command = new GetObjectCommand({
      Bucket: this.BUCKET_NAME,
      Key: key,
    });

    const response = await client.send(command);

    const str = await response.Body.transformToString();
    return JSON.parse(str).results.transcripts[0].transcript;
  }
}
