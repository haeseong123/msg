import { IsEmail, IsNotEmpty } from "class-validator"

export class UserSigninDto {
    @IsEmail()
    email: string

    @IsNotEmpty()
    password: string
}