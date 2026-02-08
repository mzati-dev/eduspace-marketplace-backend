import { Module } from '@nestjs/common';
import { VideosController } from './videos.controller'; // adjust path if needed

@Module({
    controllers: [VideosController],
    providers: [], // add a service here later if needed
})
export class VideosModule { }
