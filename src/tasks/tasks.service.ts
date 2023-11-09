import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
import * as moment from 'moment';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    console.log(
      `****************CRON JOB RUN STARTED at ${moment().format(
        'YYYY-MM-DD hh:mm:ss',
      )}****************`,
    );
    // fetch urls data from db every 1 min
    const allUrls = await this.prisma.url.findMany({});

    const allPromises = [];
    const urlIdsToRun = [];
    // iterate over all urls & find if this is time to do api call to check status
    const currentTimestamp = moment();
    allUrls?.map((urldata) => {
      const { url, freqInMin, lastRun } = urldata;
      const timeDiffInMinFromLastCall =
        currentTimestamp.diff(moment(lastRun)) / 60000;
      if (timeDiffInMinFromLastCall >= freqInMin || !lastRun) {
        allPromises.push(axios.get(url));
        urlIdsToRun.push(urldata.urlId);
      }
    });

    const urlResponses = await Promise.allSettled(allPromises);
    const urlResponseData = [];

    for (let i = 0; i < urlResponses.length; ++i) {
      const urlResponse = urlResponses[i];
      const { urlId } = allUrls[i];
      let status = 0;
      if (urlResponse.status == 'fulfilled') {
        status = urlResponse.value.status == 200 ? 1 : 0;
        urlResponseData.push({ urlId, status });
      }
    }

    // insert all data into db
    await this.prisma.urlStatus.createMany({ data: urlResponseData });

    //update lastRun to currentTimestamp for respective urlIds
    await this.prisma.url.updateMany({
      data: { lastRun: moment(currentTimestamp).format() },
      where: { urlId: { in: urlIdsToRun } },
    });
    console.log(
      `****************CRON JOB RUN ENDED at ${moment().format(
        'YYYY-MM-DD hh:mm:ss',
      )}****************`,
    );
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async handleUrlCleanUpCron() {
    console.log(
      `****************CRON JOB CLEANUP SERVICE STARTED at ${moment().format(
        'YYYY-MM-DD hh:mm:ss',
      )}****************`,
    );
    const allUrls = await this.prisma.url.findMany({});
    const allPromises = [];
    allUrls?.map((urldata) => {
      const thresholdDate = moment()
        .subtract(urldata.retentionInDays, 'd')
        .format();
      allPromises.push(
        this.prisma.urlStatus.deleteMany({
          where: { createdAt: { lt: thresholdDate } },
        }),
      );
    });

    await Promise.allSettled(allPromises);
    console.log(
      `****************CRON JOB CLEANUP SERVICE ENDED at ${moment().format(
        'YYYY-MM-DD hh:mm:ss',
      )}****************`,
    );
  }
}
