import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';

@Entity('system_section')
export class SystemSection {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 100 })
  key: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  // Nueva columna para jerarquía: referencia al padre (opcional)
  @Column({ name: 'parent_id', type: 'int', nullable: true })
  parent_id: number | null;

  // Relación ManyToOne: cada sección tiene un padre (opcional)
  @ManyToOne(() => SystemSection, (section) => section.children, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parent_id' })
  parent: SystemSection | null;

  // Relación OneToMany: una sección puede tener múltiples hijos
  @OneToMany(() => SystemSection, (section) => section.parent)
  children: SystemSection[];

  @Column({ type: 'int', default: 0 })
  level: number;

  @Column({ type: 'varchar', length: 500, default: '' })
  path: string;

  @Column({ type: 'int', default: 0 })
  sort_order: number;

  @Column({ type: 'boolean', default: true })
  status: boolean;

  @Column({ name: 'created_by', type: 'uuid' })
  created_by: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updated_at: Date | null;
}
