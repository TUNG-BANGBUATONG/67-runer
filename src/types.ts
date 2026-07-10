/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface GameStats {
  highScore: number;
  lifetimeScore: number;
  lifetimeRuns: number;
  discoveredObstacleIds: string[]; // List of obstacle IDs encountered
  bossesDefeated: number;
  totalDodged: number;
}

export type ObstacleType = 'ground' | 'flying' | 'ceiling' | 'bouncing' | 'speeding';

export interface ObstacleDef {
  id: string;
  name: string;
  thaiName: string;
  type: ObstacleType;
  width: number;
  height: number;
  color: string;
  draw: (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, tick: number) => void;
}

export interface ActiveObstacle {
  id: string;
  def: ObstacleDef;
  x: number;
  y: number;
  width: number;
  height: number;
  speedX: number;
  speedY: number;
  bounceY?: number;
  initialY?: number;
  angle?: number;
  passed: boolean;
  frame: number;
}

export interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  vy: number;
  isGrounded: boolean;
  isDucking: boolean;
  duckCooldown: number;
  shootCooldown: number;
  hp: number;
  maxHp: number;
  shield: number;
  score: number;
  laserCount: number;
}

export interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  color: string;
  isPlayer: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
}

export interface Boss {
  x: number;
  y: number;
  targetY: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  state: 'entering' | 'fight' | 'dying' | 'defeated';
  shootTimer: number;
  chargeTimer: number;
  isCharging: boolean;
  chargeVx: number;
  chargeTargetX: number;
}
