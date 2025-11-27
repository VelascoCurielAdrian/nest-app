import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { Profile } from './profile.entity';
import { SectionPermission } from './section-permission.entity';

@Entity('permission_system')
export class PermissionSystem {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'profile_id', type: 'uuid' })
  profile_id: string;

  @Column({ name: 'section_permission_id', type: 'int' })
  section_permission_id: number;

  @Column({ type: 'boolean', default: true })
  status: boolean;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updated_at: Date | null;

  // Relaciones
  @ManyToOne(() => Profile)
  @JoinColumn({ name: 'profile_id' })
  profile: Profile;

  @ManyToOne(() => SectionPermission)
  @JoinColumn({ name: 'section_permission_id' })
  sectionPermission: SectionPermission;
}
