import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { SystemSection } from './system-section.entity';
import { TypePermission } from './type-permission.entity';

@Entity('section_permission')
export class SectionPermission {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'section_id', type: 'int' })
  section_id: number;

  @Column({ name: 'permission_id', type: 'int' })
  permission_id: number;

  @Column({ type: 'boolean', default: true })
  status: boolean;

  @Column({ name: 'created_by', type: 'uuid' })
  created_by: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updated_at: Date | null;

  // Relaciones
  @ManyToOne(() => SystemSection)
  @JoinColumn({ name: 'section_id' })
  section: SystemSection;

  @ManyToOne(() => TypePermission)
  @JoinColumn({ name: 'permission_id' })
  permission: TypePermission;
}
