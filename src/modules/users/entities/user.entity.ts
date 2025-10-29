import { Column, CreateDateColumn, Entity, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { UserProfile } from './user-profile.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: false })
  username: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  password: string | null;

  @Column({ type: 'boolean', default: true })
  status: boolean;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updated_at: Date | null;

  // Relación con UserProfile
  @OneToOne(() => UserProfile, (userProfile) => userProfile.user)
  userProfile: UserProfile;
}
