import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from './users.entity';
import { Connection, In, QueryRunner, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { FilesService } from '../files/files.service';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { PublicFile } from '../files/public-file.entity';
import { S3 } from 'aws-sdk';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
    private readonly fileService: FilesService,
    private readonly connection: Connection,
    private readonly configService: ConfigService,
  ) {}

  async getByEmail(email: string) {
    const user = await this.usersRepository.findOne({
      where: { email },
    });
    if (user) {
      return user;
    }
    throw new HttpException(
      'User with this email does not exist',
      HttpStatus.NOT_FOUND,
    );
  }

  async create(userData: CreateUserDto) {
    const newUser = await this.usersRepository.create(userData);
    await this.usersRepository.save(newUser);
    return newUser;
  }

  async getById(id: number) {
    const user = await this.usersRepository.findOne({
      where: { id },
    });
    if (user) {
      return user;
    }
    throw new HttpException(
      'User with this id does not exist',
      HttpStatus.NOT_FOUND,
    );
  }

  async addAvatar(userId: number, imageBuffer: Buffer, fileName: string) {
    const user = await this.getById(userId);
    if (user.avatar) {
      await this.usersRepository.update(userId, {
        ...user,
        avatar: null,
      });
      await this.fileService.deletePublicFile(user.avatar.id);
    }
    const avatar = await this.fileService.uploadPublicFile(
      imageBuffer,
      fileName,
    );
    await this.usersRepository.update(userId, {
      ...user,
      avatar,
    });
    return avatar;
  }

  async deleteAvatar(userId: number) {
    const queryRunner = this.connection.createQueryRunner();

    const user = await this.getById(userId);
    const fileId = user.avatar?.id;
    if (fileId) {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        await queryRunner.manager.update(Users, userId, {
          ...user,
          avatar: null,
        });
        await this.fileService.deletePublicFile(user.id);
        await queryRunner.commitTransaction();
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw new InternalServerErrorException();
      } finally {
        await queryRunner.release();
      }
    }
  }

  async deletePublicFileWithQueryRunner(
    fileId: number,
    queryRunner: QueryRunner,
  ) {
    const file = await queryRunner.manager.findOne(PublicFile, {
      where: { id: fileId },
    });

    const s3 = new S3();
    await s3
      .deleteObject({
        Bucket: this.configService.get('AWS_PUBLIC_BUCKET_NAME'),
        Key: file.key,
      })
      .promise();

    await queryRunner.manager.delete(PublicFile, fileId);
  }

  async addPrivateFile(userId: number, imageBuffer: Buffer, filename: string) {
    return this.fileService.uploadPrivateFile(imageBuffer, userId, filename);
  }

  async getPrivateFile(userId: number, fileId: number) {
    const file = await this.fileService.getPrivateFile(fileId);
    if (file.info.owner.id === userId) {
      return file;
    }
    throw new UnauthorizedException();
  }

  async getAllPrivateFiles(userId: number) {
    const userWitthFiles = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['files'],
    });
    if (userWitthFiles) {
      return Promise.all(
        userWitthFiles.files.map(async (file) => {
          const url = await this.fileService.generatePresignedUrl(file.key);
          return {
            ...file,
            url,
          };
        }),
      );
    }
    throw new NotFoundException('User with this id does not exist');
  }

  async updateUser(userId: number, dto: UpdateUserDto) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });
    if (user) {
      user.name = dto.name;
      user.address = dto.address;
      const updatedUser = await this.usersRepository.update(userId, user);
      return updatedUser;
    }
    throw new NotFoundException('User with this id does not exist');
  }

  async setCurrentRefreshToken(refreshToken: string, userId: number) {
    const currentHashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.usersRepository.update(userId, {
      currentHashedRefreshToken,
    });
  }

  async getUserIfRefreshTokenMatches(refreshToken: string, userId: number) {
    const user = await this.getById(userId);

    const isRefreshMatching = await bcrypt.compare(
      refreshToken,
      user.currentHashedRefreshToken,
    );

    if (isRefreshMatching) {
      return user;
    }
  }

  async removeRefreshToken(userId: number) {
    return this.usersRepository.update(userId, {
      currentHashedRefreshToken: null,
    });
  }

  async getByIds(ids: number[]) {
    return this.usersRepository.find({
      where: { id: In(ids) },
    });
  }

  async setTwoFactorAuthenticationSecret(secret: string, userId: number) {
    return this.usersRepository.update(userId, {
      twoFactorAuthenticationSecret: secret
    });
  }

  async turnOnTwoFactorAuthentication(userId: number) {
    return this.usersRepository.update(userId, {
      isTwoFactorAuthenticationEnabled: true
    });
  }

}
