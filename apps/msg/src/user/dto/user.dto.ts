export class UserDto {
    id: number;
    email: string;
    address: string;
    nickname: string;

    constructor() { }

    static of(
        id: number,
        email: string,
        address: string,
        nickname: string
    ): UserDto {
        const dto = new UserDto();
        dto.id = id;
        dto.email = email;
        dto.address = address;
        dto.nickname = nickname;

        return dto;
    }
}