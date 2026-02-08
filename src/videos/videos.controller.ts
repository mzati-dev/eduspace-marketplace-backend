import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config'; // 👈 Import ConfigService
import axios from 'axios';
import * as crypto from 'crypto';

@Controller('videos')
export class VideosController {

    // 💉 Inject ConfigService
    constructor(private readonly configService: ConfigService) { }

    @Post('initiate-upload')
    async initiateUpload(@Body() body: { title: string }) {

        // ✅ Get keys using ConfigService (Automatically picks the right .env file)
        const bunnyLibraryId = this.configService.get<string>('BUNNY_LIBRARY_ID');
        const bunnyApiKey = this.configService.get<string>('BUNNY_API_KEY');

        // Safety Check
        if (!bunnyLibraryId || !bunnyApiKey) {
            console.error("❌ MISSING BUNNY KEYS. Check your .env.development file.");
            throw new HttpException('Server configuration error', HttpStatus.INTERNAL_SERVER_ERROR);
        }

        try {
            // 1. Create the video placeholder in Bunny.net
            const response = await axios.post(
                `https://video.bunnycdn.com/library/${bunnyLibraryId}/videos`,
                { title: body.title },
                {
                    headers: {
                        AccessKey: bunnyApiKey,
                        'Content-Type': 'application/json',
                    },
                }
            );

            const videoId = response.data.guid;

            // 2. Generate the Security Signature for TUS
            const expirationTime = Math.floor(Date.now() / 1000) + 3600; // Expires in 1 hour

            // Signature format: SHA256(libraryId + apiKey + expirationTime + videoId)
            const dataToSign = bunnyLibraryId + bunnyApiKey + expirationTime + videoId;
            const signature = crypto.createHash('sha256').update(dataToSign).digest('hex');

            // 3. Send these keys back to the Frontend
            return {
                signature,
                videoId,
                libraryId: bunnyLibraryId,
                expirationTime,
            };

        } catch (error) {
            console.error('Bunny Error:', error.response?.data || error.message);
            throw new HttpException('Failed to initiate upload', HttpStatus.BAD_REQUEST);
        }
    }
}