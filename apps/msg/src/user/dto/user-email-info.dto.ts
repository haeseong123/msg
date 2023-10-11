import { Expose } from "class-transformer";
import { IsEmail } from "class-validator";

export class UserEmailInfoDto {
    @Expose({ name: 'email' })
    @IsEmail()
    private readonly _email: string;

    constructor(email: string) {
        this._email = email;
    }

    get fullEmail(): string {
        return this._email;
    }

    get emailLocal(): string {
        return this._email.split('@')[0];
    }

    get emailDomain(): string {
        return this._email.split('@')[1];
    }
}