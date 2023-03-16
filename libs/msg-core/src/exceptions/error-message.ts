export enum ErrorMessage {
    // COMMON
    ARGUMENT_INVALID = '잘못된 파라미터 입니다.',

    // USER
    LOGIN_INPUT_INVALID_EMAIL = '일치하는 이메일이 없습니다.',
    LOGIN_INPUT_INVALID_PASSWORD = '비밀번호가 일치하지 않습니다.',
    USER_EMAIL_ALREADY_EXIST = '이미 존재하는 이메일입니다.',

    // JWT
    UNAUTHORIZED = '허가되지 않는 접근입니다.',
    TOKEN_EXPIRED = '토큰이 만료되었습니다.',
}