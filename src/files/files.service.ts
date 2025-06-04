import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PublicFile } from './public-file.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { S3 } from 'aws-sdk';
import { v4 as uuid } from 'uuid';
import { PrivateFile } from './private-file.entity';
@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(PublicFile)
    private readonly publicFileRepository: Repository<PublicFile>,
    @InjectRepository(PrivateFile)
    private readonly privateFileRepository: Repository<PrivateFile>,
    private readonly configService: ConfigService,
  ) {}

  async uploadPublicFile(dataBuffer: Buffer, filename: string) {
    const s3 = new S3();
    const uploadResult = await s3.upload({
      Bucket: this.configService.get('AWS_PUBLIC_BUCKET_NAME'),
      Body: dataBuffer,
      Key: `${uuid()}-${filename}`
    })
      .promise();

    const newFile = this.publicFileRepository.create({
      key: uploadResult.Key,
      url: uploadResult.Location
    });
    await this.publicFileRepository.save(newFile);
    return newFile;
  }

  async deletePublicFile(fileId: number) {
    const file = await this.publicFileRepository.findOne({
      where: { id: fileId },
    });
    const s3 = new S3();
    await s3.deleteObject({
      Bucket: this.configService.get('AWS_PUBLIC_BUCKET_NAME'),
      Key: file.key,
    }).promise();
    await this.publicFileRepository.delete(fileId);
  }

  async uploadPrivateFile(dataBuffer: Buffer, ownerId: number, filename: string) {
    const s3 = new S3();
    const uploadResult = await s3.upload({
      Bucket: this.configService.get('AWS_PRIVATE_BUCKET_NAME'),
      Body: dataBuffer,
      Key: `${uuid()}-${filename}`
    })
      .promise();

    const newFile = this.privateFileRepository.create({
      key: uploadResult.Key,
      owner: {
        id: ownerId
      }
    });
    await this.privateFileRepository.save(newFile);
    return newFile;
  }

  async getPrivateFile(fileId: number) {
    const s3= new S3();
    const fileInfo = await this.privateFileRepository.findOne({
      where: { id: fileId },
    });
    if (fileInfo) {
      const stream = s3.getObject({
        Bucket: this.configService.get('AWS_PRIVATE_BUCKET_NAME'),
        Key: fileInfo.key,
      }).createReadStream();
      return {
        stream,
        info: fileInfo,
      }
    }
    throw new NotFoundException();
  }

  public async generatePresignedUrl(key: string) {
    const s3 = new S3();

    return s3.getSignedUrlPromise('getObject', {
      Bucket: this.configService.get('AWS_PRIVATE_BUCKET_NAME'),
      Key: key,
    })
  }
}
