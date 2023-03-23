export class ChatRoomSavedResultDto {
    id: number;
    name: string;
    invitedUserIds: number[];

    constructor(id: number, name: string, invitedUserIds: number[]) {
        this.id = id;
        this.name = name;
        this.invitedUserIds = invitedUserIds;
    }
}