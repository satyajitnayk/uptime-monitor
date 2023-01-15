import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { UrlsService } from './urls.service';
import { Request } from 'express';
import { CreateURLDto } from './dto/create-url.dto';
import { UpdateURLDto } from './dto/update-url.dto';
import { DeleteURLDto } from './dto/delete-url.dto';

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
  async updateConfiguredUrl(
    @Body() updateURLDto: UpdateURLDto,
    @Req() req: Request | any,
  ): Promise<any> {
    const userId = req.user.userId;

    const { urlId, freqInMin } = updateURLDto;
    const updatedUrl = await this.urlsService.updateFrequencyForURL({
      userId,
      urlId,
      freqInMin,
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
}
