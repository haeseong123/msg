import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Request } from "express";
import { MsgUser } from "../msg-user";
import { TokenPayload } from "../token-payload";
import { UnauthorizedAccessException } from "../exception/unauthorizated-access.exception";

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_ACCESS_SECRET,
            passReqToCallback: true,
        })
    }

    async validate(req: Request, payload: TokenPayload) {
        const token = req.headers['authorization']?.replace('Bearer ', '').trim();

        if (!token) {
            throw new UnauthorizedAccessException();
        }

        const user = new MsgUser(payload.sub, payload.email, token);

        return user;
    }
}