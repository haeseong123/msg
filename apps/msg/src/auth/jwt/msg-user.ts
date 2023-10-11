import { Expose } from "class-transformer"
import { JwtPayload } from "./jwt-payload";

export class MsgUser implements JwtPayload {
    @Expose({ name: 'sub' })
    private readonly _sub: number;

    @Expose({ name: 'email' })
    private readonly _email: string;

    @Expose({ name: 'token' })
    private readonly _token: string;

    constructor(
        sub: number,
        email: string,
        token: string,
    ) {
        this._sub = sub;
        this._email = email;
        this._token = token;
    }

    get sub(): number {
        return this._sub;
    }

    get email(): string {
        return this._email;
    }

    get token(): string {
        return this._token;
    }
}