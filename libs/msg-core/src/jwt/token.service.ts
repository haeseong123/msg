import { JwtService } from "@nestjs/jwt";
import { TokenPayload } from "./token-payload";
import { Injectable } from "@nestjs/common";
import { MsgTokenDto } from "./dto/msg-token.dto";

@Injectable()
export class TokenService {
    constructor(private readonly jwtService: JwtService) { }

    generateToken(payload: TokenPayload): MsgTokenDto {
        const accessToken = this.jwtService.sign(payload, { secret: process.env.JWT_ACCESS_SECRET, expiresIn: process.env.JWT_ACCESS_EXPIRATION_TIME });
        const refreshToken = this.jwtService.sign(payload, { secret: process.env.JWT_REFRESH_SECRET, expiresIn: process.env.JWT_REFRESH_EXPIRATION_TIME });
        const tokenDto = new MsgTokenDto(accessToken, refreshToken);

        return tokenDto;
    }
}