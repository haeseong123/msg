import { Injectable } from "@nestjs/common";
import { TransactionService } from "./transaction-service";
import { DataSource } from "typeorm";
import { IsolationLevel } from "./isolation.level";

@Injectable()
export class TransactionServiceImpl implements TransactionService {
    constructor(
        private dataSource: DataSource
    ) { }

    async logicWithTransaction<T>(logic: () => Promise<T>, isolationLevel?: IsolationLevel | undefined): Promise<T> {
        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction(isolationLevel);
        try {
            const result = await logic();

            await queryRunner.commitTransaction();
            return result;
        } catch (err) {
            /** 오류가 발생하면 롤백을 수행하고 에러를 던집니다. */
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            /** queryRunner를 릴리스합니다. */
            await queryRunner.release();
        }
    }
}