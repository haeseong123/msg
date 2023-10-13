import { IsolationLevel } from "./isolation.level";

export abstract class TransactionService {
    abstract withTransaction<T>(func: () => Promise<T>, isolationLevel?: IsolationLevel): Promise<T>
}