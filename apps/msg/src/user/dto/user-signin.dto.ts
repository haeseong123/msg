import { Exclude, Expose, Transform } from "class-transformer";
import { IsString, MinLength, ValidateNested } from "class-validator"
import { UserEmailInfoDto } from "./user-email-info.dto";

export class UserSigninDto {
    @Expose({ name: 'email' })
    @Transform(({ obj }) => new UserEmailInfoDto(obj['email']))
    @ValidateNested()
    private readonly _emailInfoDto: UserEmailInfoDto;

    @Expose({ name: 'password' })
    @Exclude({ toPlainOnly: true })
    @IsString()
    @MinLength(8)
    private readonly _password: string;

    constructor(
        emailInfoDto: UserEmailInfoDto,
        password: string,
    ) {
        this._emailInfoDto = emailInfoDto;
        this._password = password;
    }

    get emailInfoDto(): UserEmailInfoDto {
        return this._emailInfoDto;
    }

    get password(): string {
        return this._password;
    }
}