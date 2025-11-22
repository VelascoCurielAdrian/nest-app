import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { User } from './user.entity';

// Una entidad que representa el perfil de un usuario en el sistema
@Entity('user_profile')
export class UserProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  user_id: string;

  @Column({ name: 'profile_id', type: 'uuid', nullable: true })
  profile_id: string | null;

  @Column({ name: 'first_name', type: 'varchar', length: 255 })
  first_name: string;

  @Column({ name: 'last_name', type: 'varchar', length: 255 })
  last_name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  gender: string | null;

  @Column({ name: 'local_number', type: 'varchar', length: 20, nullable: true })
  local_number: string | null;

  @Column({ name: 'phone_number', type: 'varchar', length: 20, nullable: true })
  phone_number: string | null;

  @Column({ name: 'avatar_url', type: 'text', nullable: true })
  avatar_url: string | null;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updated_at: Date | null;

  // Relación con User
  @OneToOne(() => User, (user) => user.userProfile)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
