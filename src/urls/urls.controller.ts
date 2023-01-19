import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { UrlsService } from './urls.service';
import { Request } from 'express';
import { CreateURLDto } from './dto/create-url.dto';
import { UpdateURLDto } from './dto/update-url.dto';
import { DeleteURLDto } from './dto/delete-url.dto';
import * as moment from 'moment';

@Controller('urls')
export class UrlsController {
  constructor(private readonly urlsService: UrlsService) {}

  @Get()
  async getAllURLs(@Req() req: Request | any): Promise<any> {
    const userId = req.user.userId;

    const urls = await this.urlsService.getAllConfiguredURLs(userId);

    return {
      statusCode: 200,
      data: urls,
      message: 'successfully fetched configured urls',
    };
  }

  @Post()
  async configureNewUrl(
    @Body() createURLDto: CreateURLDto,
    @Req() req: Request | any,
  ): Promise<any> {
    const userId = req.user.userId;
    const { url, freqInMin } = createURLDto;

    const configuredUrl = await this.urlsService.addNewUrl({
      userId,
      url,
      freqInMin,
    });

    return {
      statusCode: 200,
      data: configuredUrl,
      message: 'url configured successfully',
    };
  }

  @Patch()
  async updateConfiguredUrlData(
    @Body() updateURLDto: UpdateURLDto,
    @Req() req: Request | any,
  ): Promise<any> {
    const userId = req.user.userId;

    const { urlId, freqInMin, retentionInDays } = updateURLDto;
    const updatedUrl = await this.urlsService.updateURLConfiguration({
      userId,
      urlId,
      freqInMin,
      retentionInDays,
    });

    return {
      statusCode: 200,
      data: updatedUrl,
      message: 'url call frequency updated successfully',
    };
  }

  @Delete()
  async removeUrl(
    @Body() deleteURLDto: DeleteURLDto,
    @Req() req: Request | any,
  ): Promise<any> {
    const userId = req.user.userId;
    const { urlId } = deleteURLDto;

    // check if url exists with given data
    const existingUrl = await this.urlsService.findUrlById(urlId);
    if (existingUrl == null || existingUrl?.userId != userId) {
      return {
        statusCode: 404,
        error: 'unable to delete url',
      };
    }
    const deletedUrl = await this.urlsService.deleteURL({
      userId,
      urlId,
    });

    return {
      statusCode: 200,
      data: deletedUrl,
      message: 'url deleted successfully',
    };
  }

  @Get('/status/:urlId')
  async getUrlStatus(
    @Req() req: Request | any,
    @Param('urlId') urlId,
  ): Promise<any> {
    const userId = req.user.userId;
    urlId = parseInt(urlId);
    const days = parseInt(req.query?.days ?? 5);
    //check if url exists for the user
    const url = await this.urlsService.findUrlById(urlId);
    if (url == null || url.userId != userId) {
      return {
        statusCode: 400,
        error: 'url does not exists',
      };
    }

    const lastTimeStamp = moment().subtract(days, 'days').format();
    const data = await this.urlsService.getUrlStatus({
      urlId,
      timeStamp: lastTimeStamp,
    });

    return {
      statusCode: 200,
      data: data,
      message: 'successfully fetched status of url',
    };
  }
}
