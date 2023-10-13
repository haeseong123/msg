export enum ErrorMessage {
    /** JWT */
    UNAUTHORIZED = '허가되지 않는 접근입니다.',
    TOKEN_EXPIRED = '토큰이 만료되었습니다.',

    /** ID */
    ID_NOT_MACTHED = 'id 값이 일치하지 않습니다.',

    /** USER */
    USER_NOT_IN_CHAT_ROOM = '유저가 채팅방에 있지 않습니다.',
    UNFOLLOWED_USERS_IN = '목록 중 FOLLOW 하지 않은 유저가 있습니다.',
}