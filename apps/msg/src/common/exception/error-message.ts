export enum ErrorMessage {
    // ARGUMENT
    ARGUMENT_INVALID = '잘못된 파라미터 입니다.',
    MANDATORY_ARGUMENT_IS_NULL = '필수 파라미터가 없습니다.',

    // USER
    LOGIN_INPUT_INVALID_EMAIL = '일치하는 이메일이 없습니다.',
    LOGIN_INPUT_INVALID_PASSWORD = '비밀번호가 일치하지 않습니다.',
    USER_EMAIL_ALREADY_EXISTS = '이미 존재하는 이메일입니다.',
    USER_NOT_FOUNDED = '해당 유저가 존재하지 않습니다.',

    // USER-RELATION
    USER_RELATION_FROM_ID_USER_ID_MISMATCH = '자신의 관계만 삭제/수정할 수 있습니다.',
    USER_RELATION_ID_PARAM_MISMATCH = 'DTO에 담긴 관계 id와 URL에 담긴 관계 id가 일치하지 않습니다.',

    // CHAT-ROOM
    CHAT_ROOM_NOT_FOUNDED = '일치하는 채팅방이 없습니다.',
    INVITED_DUPLICATE = '초대 목록에 중복이 있습니다.',
    USER_DUPLICATE_INVITATION_EXCEPTION = '한 채팅방에 유저를 중복으로 초대할 수 없습니다.',
    HOST_ID_IN_INVITED_USER_IDS = '호스트 id가 초대 목록에 있으면 안 됩니다.',
    MAX_INVITED_IDS_EXCEPTION = '최대 초대 인원을 초과했습니다.',

    // MESSAGE
    NOT_PARTICIPANT_IN_CHAT_ROOM = '채팅방 참여자가 아닙니다.',
}