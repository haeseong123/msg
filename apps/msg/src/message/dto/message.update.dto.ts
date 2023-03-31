import { IsNotEmpty, IsString } from "class-validator";

export class MessageUpdateDto {
    @IsString()
    @IsNotEmpty()
    message: string;
}