import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { AssignedIdAndTimestampBaseEntity } from '../../assigned-id-and-timestamp-base.entity';
import { User } from '../../user/user.entity';
import { ChatRoom } from '../chat-room.entity';

@Entity()
@Index(['chatRoomId', 'userId'], { unique: true })
export class ChatRoomParticipant extends AssignedIdAndTimestampBaseEntity {
  @Column({ name: 'chat_room_id', type: 'int', unsigned: true })
  chatRoomId: number | null;

  @Column({ name: 'user_id', type: 'int', unsigned: true })
  userId: number;

  @ManyToOne(() => ChatRoom, {
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  @JoinColumn({ name: 'chat_room_id' })
  chatRoom: ChatRoom;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  static of(chatRoomId: number | null, userId: number): ChatRoomParticipant {
    const chatRoomParticipant = new ChatRoomParticipant();
    chatRoomParticipant.chatRoomId = chatRoomId;
    chatRoomParticipant.userId = userId;

    return chatRoomParticipant;
  }
}
