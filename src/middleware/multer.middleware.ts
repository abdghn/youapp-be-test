import { join, extname } from 'path';
import { diskStorage } from 'multer';
import {mkdirp} from 'mkdirp';
import {pseudoRandomBytes} from 'crypto';
import {extension} from 'mime';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

config();

const configService = new ConfigService();

export const diskStorageProfile = diskStorage({
  destination: function (req, file, cb) {
    let user;
    if (req.body.username !== undefined) {
      user = req.body.username;
    } else {
      user = req.user.username;
    }
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      const type = 'profile';
      const upload_path = join(configService.get('UPLOAD_PATH'), user, type);
      // ensure  access log directory exists
      mkdirp(upload_path, (err) => cb(err, upload_path));
    }
  },
  filename: function (req, file, cb) {
    const currentTime = new Date();
    const dd = currentTime.getDate();
    const mm = currentTime.getMonth() + 1; // January is 0!
    const yyyy = currentTime.getFullYear();
    let dd2, mm2;

    if (dd < 10) {
      dd2 = '0' + dd;
    } else {
      dd2 = dd.toString();
    }

    if (mm < 10) {
      mm2 = '0' + mm;
    } else {
      mm2 = mm.toString();
    }

    pseudoRandomBytes(16, function (err, raw) {
      // cb(null, + yyyy + mm2 + dd2 + '-' + raw.toString('hex') + '.' + mime.extension(file.mimetype));
      cb(
        null,
        +yyyy +
          mm2 +
          dd2 +
          '-' +
          raw.toString('hex') +
          extname(file.originalname),
      );
    });
  },
});


export const multerOptionsProfile = {
  storage: diskStorageProfile,
  limits: { fileSize: 200 * 1024 * 1024 },
};
