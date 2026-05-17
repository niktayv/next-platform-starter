import * as migration_20260517_040604_init_payload from './20260517_040604_init_payload';

export const migrations = [
  {
    up: migration_20260517_040604_init_payload.up,
    down: migration_20260517_040604_init_payload.down,
    name: '20260517_040604_init_payload'
  },
];
