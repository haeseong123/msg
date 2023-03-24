export class UserDto {
    id: number;
    email: string;
    address: string;
    nickname: string;

    constructor(
        id: number,
        email: string,
        address: string,
        nickname: string
    ) {
        this.id = id;
        this.email = email;
        this.address = address;
        this.nickname = nickname;
    }
}