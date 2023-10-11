import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { JwtPayload } from "../jwt-payload";
import { Request } from "express";
import { MsgUser } from "../msg-user";

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
        const token = req.get('Authorization').replace('Bearer', '').trim();
        const user = new MsgUser(payload.sub, payload.email, token);

        return user;
    }
}