import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { JwtPayload } from "../jwt-payload";
import { Request } from "express";
import { MsgUser } from "../msg-user";
import { UnauthorizedAccessException } from "../../exceptions/unauthorized-access.exception";

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_ACCESS_SECRET,
            ignoreExpiration: false
        })
    }

    async validate(req: Request, payload: JwtPayload) {
        const token = req.headers['authorization']?.replace('Bearer ', '').trim();

        if (!token) {
            throw new UnauthorizedAccessException();
        }

        const user = new MsgUser(payload.sub, payload.email, token);

        return user;
    }
}