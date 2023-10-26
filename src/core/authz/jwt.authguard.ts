import { Injectable } from '@nestjs/common';
import { AuthGuard as NestAuth0Guard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends NestAuth0Guard('jwt') {}
