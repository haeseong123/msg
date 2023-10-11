import { IsolationLevel } from "./isolation.level";

export abstract class TransactionService {
    abstract logicWithTransaction<T>(logic: () => Promise<T>, isolationLevel?: IsolationLevel): Promise<T>
}