import { IsNotEmpty } from "class-validator";

export class ChatRoomDeletedDto {
    @IsNotEmpty()
    id: number;

    @IsNotEmpty()
    name: string;

    constructor(id: number, name: string) {
        this.id = id;
        this.name = name;
    }
}