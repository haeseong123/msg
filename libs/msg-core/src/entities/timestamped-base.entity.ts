import { CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { BaseEntity } from './base.entity';

export abstract class TimestampedBaseEntity extends BaseEntity {
  @CreateDateColumn({ name: 'createdAt', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt', type: 'timestamp' })
  updatedAt: Date;
}
