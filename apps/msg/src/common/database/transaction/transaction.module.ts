import { Module } from "@nestjs/common";
import { TransactionService } from "./transaction-service";
import { TransactionServiceImpl } from "./transaction-service-impl";

@Module({
    imports: [],
    providers: [
        {
            provide: TransactionService,
            useClass: TransactionServiceImpl,
        },
    ],
    exports: [TransactionService]
})
export class TransactionModule { }