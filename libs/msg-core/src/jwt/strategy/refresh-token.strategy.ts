import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { TokenPayload } from "../token-payload";
import { MsgUser } from "../msg-user";
import { UnauthorizedAccessException } from "../exception/unauthorizated-access.exception";

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_REFRESH_SECRET,
            passReqToCallback: true,
        })
    }

    async validate(req: Request, payload: TokenPayload) {
        const refreshToken = req.headers['authorization']?.replace('Bearer ', '').trim();

        if (!refreshToken) {
            throw new UnauthorizedAccessException();
        }

        const user = new MsgUser(payload.sub, payload.email, refreshToken);

        return user;
    }
}