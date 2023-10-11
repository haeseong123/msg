import { JwtService } from "@nestjs/jwt";
import { JwtPayload } from "./jwt-payload";
import { MsgTokenDto } from "./dto/msg-token.dto";

export class TokenService {
    constructor(private readonly jwtService: JwtService) { }

    generateToken(payload: JwtPayload): MsgTokenDto {
        const accessToken = this.jwtService.sign(payload, { secret: process.env.JWT_ACCESS_SECRET, expiresIn: process.env.JWT_ACCESS_EXPIRATION_TIME });
        const refreshToken = this.jwtService.sign(payload, { secret: process.env.JWT_ACCESS_SECRET, expiresIn: process.env.JWT_ACCESS_EXPIRATION_TIME });
        const token = new MsgTokenDto(accessToken, refreshToken);

        return token;
    }
}