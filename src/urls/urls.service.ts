import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Prisma, Url, UrlStatus } from '@prisma/client';

@Injectable()
export class UrlsService {
  constructor(private prisma: PrismaService) {}

  async getAllConfiguredURLs(userId: number): Promise<Url[]> {
    return this.prisma.url.findMany({ where: { userId } });
  }

  async findUrlById(urlId: number): Promise<Url | null> {
    return this.prisma.url.findUnique({
      where: { urlId },
    });
  }

  async addNewUrl(data: Prisma.UrlCreateInput): Promise<Url | null> {
    return this.prisma.url.create({ data });
  }

  async updateURLConfiguration(data: {
    userId: number;
    urlId: number;
    freqInMin: number | null;
    retentionInDays: number | null;
  }): Promise<Url | null> {
    const { userId, urlId, freqInMin, retentionInDays } = data;
    const payload = {};
    if (freqInMin) payload['freqInMin'] = freqInMin;
    if (retentionInDays) payload['retentionInDays'] = retentionInDays;

    return this.prisma.url.update({
      data: payload,
      where: {
        userId_urlId: {
          urlId,
          userId,
        },
      },
    });
  }

  async deleteURL(data: {
    urlId: number;
    userId: number;
  }): Promise<Url | null> {
    const { userId, urlId } = data;
    return this.prisma.url.delete({
      where: { userId_urlId: { urlId, userId } },
    });
  }

  async getUrlStatus({ urlId, timeStamp }): Promise<any[]> {
    return this.prisma.urlStatus.findMany({
      where: { urlId: urlId, createdAt: { gte: timeStamp } },
      orderBy: { createdAt: 'asc' },
    });
  }
}
