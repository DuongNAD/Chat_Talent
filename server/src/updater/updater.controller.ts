import { Controller, Get, Query, Res } from '@nestjs/common';
import type { Response } from 'express';

@Controller('api/updater')
export class UpdaterController {
  @Get()
  checkUpdate(@Query('version') version: string, @Query('target') target: string, @Res() res: Response) {
    // Current version deployed
    const currentVersion = '0.2.0';

    // If version matches or is newer, return 204 No Content
    if (!version || version === currentVersion) {
      return res.status(204).send();
    }

    // Otherwise, return the update schema
    const updateData = {
      version: currentVersion,
      notes: "Cập nhật hiệu năng và sửa lỗi giao diện Đại Sảnh.",
      pub_date: new Date().toISOString(),
      platforms: {
        "windows-x86_64": {
          // You must generate a signature using Tauri CLI and put it here
          "signature": "dW50cnVzdGVkIGNvbW1lbnQ6IHNpZ25hdHVyZSBmcm9tIHRhdXJpIHNlY3JldCBrZXkKUlVUUW4wZTRUMncrUklwSmF1S1o1ZzcrZTh3ZE92SEpPVDhZWmRmZnkyTHlNR25yZUh3aTVQajkK",
          "url": "http://localhost:3000/downloads/ChatTalent_0.2.0_x64_en-US.msi.zip"
        }
      }
    };

    return res.status(200).json(updateData);
  }
}
