export enum ErrorMessage {
  /** JWT */
  UNAUTHORIZED = '허가되지 않는 접근입니다.',
  TOKEN_EXPIRED = '토큰이 만료되었습니다.',

  /** ID */
  ID_NOT_MACTHED = 'id 값이 일치하지 않습니다.',

  /** USER */
  UNFOLLOWED_USERS_IN = '목록 중 FOLLOW 하지 않은 유저가 있습니다.',
  NOT_FOUND_RELATION = '일치하는 관계가 없습니다.',
  DUPLICATE_RELATION = '관계가 이미 존재합니다.',

  /** CHAT_ROOM */
  USER_NOT_IN_CHAT_ROOM = '유저가 채팅방에 있지 않습니다.',
  DUPLICATE_PARTICIPANT = '유저가 채팅방에 이미 참여중입니다.',
}
