export interface MsgResponse<T> {
  statusCode: number;
  message: string;
  result: T | null;
  timestamp: string;
}
