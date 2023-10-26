import { PrimaryGeneratedColumn } from 'typeorm';
import { TimestampedBaseEntity } from './timestamped-base.entity';
import { IdNotMatchedException } from './id-not-matched.exception';

export abstract class AssignedIdAndTimestampBaseEntity extends TimestampedBaseEntity {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  validateId(id: number) {
    const isValidId = this.id === id;

    if (!isValidId) {
      throw new IdNotMatchedException();
    }
  }
}
