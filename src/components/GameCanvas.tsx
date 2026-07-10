/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { Play, RotateCcw, Volume2, VolumeX, Shield, Award, Sparkles, AlertTriangle, Crosshair, Zap, BookOpen } from 'lucide-react';
import { GameStats, Player, ActiveObstacle, Projectile, Particle, Boss } from '../types';
import { OBSTACLES_LIST } from './ObstacleList';
import { audioSynth } from '../lib/audio';

// Constants for logical resolution
const GAME_WIDTH = 800;
const GAME_HEIGHT = 400;
const GROUND_Y = 320;

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Core React States
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [gameScore, setGameScore] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [selectedObstacleId, setSelectedObstacleId] = useState<string>('floppy_disk');

  // Stats (localStorage backed)
  const [stats, setStats] = useState<GameStats>({
    highScore: 0,
    lifetimeScore: 0,
    lifetimeRuns: 0,
    discoveredObstacleIds: ['floppy_disk'],
    bossesDefeated: 0,
    totalDodged: 0
  });

  // Announcement state
  const [announcement, setAnnouncement] = useState<{ text: string; sub: string; color: string } | null>({
    text: "67 RUNNER FOREVER",
    sub: "PRESS START TO RUN THE 80s GRID",
    color: "#ff007f"
  });

  // Game Engine Mutable Refs (to prevent react re-render slowness in 60fps loop)
  const stateRef = useRef({
    player: {
      x: 100,
      y: GROUND_Y - 48,
      width: 32,
      height: 48,
      vy: 0,
      isGrounded: true,
      isDucking: false,
      duckCooldown: 0,
      shootCooldown: 0,
      hp: 3,
      maxHp: 3,
      shield: 100,
      score: 0,
      laserCount: 10
    } as Player,
    obstacles: [] as ActiveObstacle[],
    projectiles: [] as Projectile[],
    particles: [] as Particle[],
    boss: null as Boss | null,
    bossSpawnThreshold: 400, // Spawn boss 67 every 400 points
    nextBossScore: 150, // First boss spawns quickly at 150 points for interactive play
    gameSpeed: 5,
    distanceRun: 0,
    tick: 0,
    spawnTimer: 0,
    keys: {} as Record<string, boolean>,
    highScoreBeaten: false
  });

  // Load stats from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('67_runner_forever_stats');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setStats(prev => ({
          ...prev,
          ...parsed,
          discoveredObstacleIds: parsed.discoveredObstacleIds || ['floppy_disk']
        }));
      } catch (e) {
        console.error('Error parsing stats', e);
      }
    }
  }, []);

  // Sync volume state
  useEffect(() => {
    audioSynth.enabled = !isMuted;
  }, [isMuted]);

  // Save stats helper
  const saveStats = (newStats: GameStats) => {
    setStats(newStats);
    localStorage.setItem('67_runner_forever_stats', JSON.stringify(newStats));
  };

  // Resize canvas to responsive container while preserving 16:8 aspect ratio
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current || !containerRef.current) return;
      const container = containerRef.current;
      const width = container.clientWidth;
      // Fixed aspect ratio mapping
      canvasRef.current.style.width = `${width}px`;
      canvasRef.current.style.height = `${width * (GAME_HEIGHT / GAME_WIDTH)}px`;
    };

    handleResize();
    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    window.addEventListener('resize', handleResize);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      stateRef.current.keys[e.code] = true;

      // Prevent scrolling when using Space, Up, Down, W, S keys inside arcade
      if (['Space', 'ArrowUp', 'ArrowDown', 'KeyW', 'KeyS'].includes(e.code)) {
        e.preventDefault();
      }

      if (!isPlaying && !isGameOver && e.code === 'Enter') {
        startGame();
      } else if (isGameOver && e.code === 'Enter') {
        startGame();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      stateRef.current.keys[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPlaying, isGameOver]);

  // Actions
  const startGame = () => {
    // Reset state values
    stateRef.current.player = {
      x: 100,
      y: GROUND_Y - 48,
      width: 32,
      height: 48,
      vy: 0,
      isGrounded: true,
      isDucking: false,
      duckCooldown: 0,
      shootCooldown: 0,
      hp: 3,
      maxHp: 3,
      shield: 100,
      score: 0,
      laserCount: 10
    };
    stateRef.current.obstacles = [];
    stateRef.current.projectiles = [];
    stateRef.current.particles = [];
    stateRef.current.boss = null;
    stateRef.current.gameSpeed = 5;
    stateRef.current.distanceRun = 0;
    stateRef.current.tick = 0;
    stateRef.current.spawnTimer = 0;
    stateRef.current.bossSpawnThreshold = 400; // Reset threshold spacing
    stateRef.current.nextBossScore = 150; // First boss spawns at 150 points for immediate action!
    stateRef.current.highScoreBeaten = false;

    // Increment run count
    saveStats({
      ...stats,
      lifetimeRuns: stats.lifetimeRuns + 1
    });

    setIsGameOver(false);
    setIsPlaying(true);
    setGameScore(0);
    setAnnouncement({
      text: "GET READY!",
      sub: "PREPARE FOR THE SYNTH RUN",
      color: "#00f0ff"
    });

    // Clear initial announcement quickly
    setTimeout(() => {
      setAnnouncement(null);
    }, 1500);

    // Bleep
    audioSynth.playScore();
  };

  // Player action triggers
  const triggerJump = () => {
    const { player } = stateRef.current;
    if (player.isGrounded && !player.isDucking) {
      player.vy = -12;
      player.isGrounded = false;
      audioSynth.playJump();
      // Particles
      spawnExplosion(player.x + player.width / 2, player.y + player.height, '#ff007f', 12);
    }
  };

  const startDuck = () => {
    const { player } = stateRef.current;
    if (player.isGrounded && !player.isDucking) {
      player.isDucking = true;
      player.height = 24;
      player.y = GROUND_Y - 24;
      audioSynth.playSlide();
      // Slide dust particles
      spawnExplosion(player.x + player.width / 2, player.y + player.height, '#00f0ff', 8);
    }
  };

  const endDuck = () => {
    const { player } = stateRef.current;
    if (player.isDucking) {
      player.isDucking = false;
      player.height = 48;
      player.y = GROUND_Y - 48;
    }
  };

  const triggerShoot = () => {
    const { player, projectiles } = stateRef.current;
    if (player.shootCooldown <= 0) {
      // player.laserCount remains infinite and does not decrement
      player.shootCooldown = 12; // 12 frames cooldown (slightly faster fire rate for infinite fun!)
      audioSynth.playShoot();

      projectiles.push({
        x: player.x + player.width,
        y: player.isDucking ? player.y + 12 : player.y + 16,
        vx: 12,
        vy: 0,
        width: 14,
        height: 6,
        color: '#ff007f',
        isPlayer: true
      });

      // Recoil kickback particle
      spawnExplosion(player.x + player.width, player.y + 16, '#ff007f', 4);
    }
  };

  // Particle explosion helper
  const spawnExplosion = (x: number, y: number, color: string, count: number = 10) => {
    const { particles } = stateRef.current;
    for (let i = 0; i < count; i++) {
      particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        color,
        size: Math.random() * 4 + 2,
        alpha: 1,
        life: 0,
        maxLife: Math.random() * 20 + 20
      });
    }
  };

  // Main Loop
  useEffect(() => {
    if (!isPlaying || isGameOver) return;

    let frameId: number;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    const gameLoop = () => {
      const state = stateRef.current;
      const { player, obstacles, projectiles, particles, boss } = state;

      state.tick++;
      state.distanceRun += state.gameSpeed / 60; // 60fps distance

      // Apply key inputs
      if (state.keys['ArrowUp'] || state.keys['KeyW']) {
        triggerJump();
      }
      if (state.keys['ArrowDown'] || state.keys['KeyS']) {
        startDuck();
      } else {
        endDuck();
      }
      if (state.keys['Space'] || state.keys['KeyF'] || state.keys['KeyX'] || state.keys['ControlLeft'] || state.keys['ControlRight']) {
        triggerShoot();
      }

      // 1. Update Player Physics
      if (!player.isGrounded) {
        player.vy += 0.5; // gravity
        player.y += player.vy;
        if (player.y >= GROUND_Y - player.height) {
          player.y = GROUND_Y - player.height;
          player.vy = 0;
          player.isGrounded = true;
        }
      }

      if (player.shootCooldown > 0) player.shootCooldown--;

      // 2. Spawn and Update Obstacles
      if (!boss) {
        state.spawnTimer--;
        if (state.spawnTimer <= 0) {
          // Determine candidate pool based on discovered list to progressively add difficulty
          // But allow spawning any of the 67 once they run far enough
          const maxIdx = Math.min(67, Math.floor(state.distanceRun / 10) + 3);
          const candidateList = OBSTACLES_LIST.slice(0, maxIdx);
          const chosenDef = candidateList[Math.floor(Math.random() * candidateList.length)];

          // Spawn details
          let spawnY = GROUND_Y - chosenDef.height;
          let vy = 0;

          if (chosenDef.type === 'flying') {
            spawnY = GROUND_Y - chosenDef.height - 70 - Math.random() * 80;
          } else if (chosenDef.type === 'ceiling') {
            spawnY = 0;
          } else if (chosenDef.type === 'bouncing') {
            spawnY = GROUND_Y - chosenDef.height - 120;
            vy = 2; // Initial downward bounce
          }

          obstacles.push({
            id: chosenDef.id,
            def: chosenDef,
            x: GAME_WIDTH,
            y: spawnY,
            width: chosenDef.width,
            height: chosenDef.height,
            speedX: -(state.gameSpeed + (chosenDef.type === 'speeding' ? 3 : 0)),
            speedY: vy,
            initialY: spawnY,
            passed: false,
            frame: 0
          });

          // Check if this is a newly discovered obstacle!
          if (!stats.discoveredObstacleIds.includes(chosenDef.id)) {
            const updatedList = [...stats.discoveredObstacleIds, chosenDef.id];
            saveStats({
              ...stats,
              discoveredObstacleIds: updatedList
            });
            setAnnouncement({
              text: `DISCOVERED #${updatedList.length}!`,
              sub: chosenDef.name.toUpperCase(),
              color: '#ffe600'
            });
            setTimeout(() => setAnnouncement(null), 2500);
          }

          // Random spawn interval based on speed
          state.spawnTimer = Math.random() * 80 + 100 - state.gameSpeed * 4;
        }
      }

      // Update active obstacles
      for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];
        obs.x += obs.speedX;
        obs.frame++;

        // Handle bouncing obstacle movement
        if (obs.def.type === 'bouncing') {
          obs.y += obs.speedY;
          if (obs.y + obs.height >= GROUND_Y) {
            obs.y = GROUND_Y - obs.height;
            obs.speedY = -Math.abs(obs.speedY) * 0.9; // bounce back up
          } else {
            obs.speedY += 0.15; // gravity gravity
          }
        }

        // Check if player dodged it
        if (!obs.passed && obs.x + obs.width < player.x) {
          obs.passed = true;
          player.score += 10;
          setGameScore(player.score);

          // Spawn simple celebration spark
          spawnExplosion(obs.x + obs.width / 2, obs.y + obs.height / 2, '#ffe600', 3);

          // Collect laser powerups when certain items passed
          if (Math.random() < 0.25) {
            player.laserCount = Math.min(10, player.laserCount + 1);
          }

          saveStats({
            ...stats,
            totalDodged: stats.totalDodged + 1
          });
        }

        // Collision with player
        const playerBox = {
          x: player.x + 4,
          y: player.y + 4,
          w: player.width - 8,
          h: player.height - 8
        };

        if (
          playerBox.x < obs.x + obs.width &&
          playerBox.x + playerBox.w > obs.x &&
          playerBox.y < obs.y + obs.height &&
          playerBox.y + playerBox.h > obs.y
        ) {
          // Take damage!
          player.hp--;
          audioSynth.playHit();
          spawnExplosion(player.x + player.width / 2, player.y + player.height / 2, '#ff0000', 25);

          // Remove obstacle
          obstacles.splice(i, 1);

          // Screenshake and Flash effect can be drawn
          if (player.hp <= 0) {
            triggerGameOver();
            return;
          }
          continue;
        }

        // Remove off-screen obstacles
        if (obs.x + obs.width < -50) {
          obstacles.splice(i, 1);
        }
      }

      // 3. Boss 67 Event Spawning and Updates
      if (player.score >= state.nextBossScore && !boss) {
        // Trigger Boss 67!
        state.boss = {
          x: GAME_WIDTH + 100,
          y: 80,
          targetY: 80,
          width: 80,
          height: 90,
          hp: 15,
          maxHp: 15,
          state: 'entering',
          shootTimer: 60,
          chargeTimer: 120,
          isCharging: false,
          chargeVx: 0,
          chargeTargetX: 0
        };

        // Clear existing obstacles for clear boss arena
        state.obstacles = [];
        audioSynth.playBossWarning();

        setAnnouncement({
          text: "BOSS 67 DETECTED",
          sub: "WARNING! THE GLITCH ENEMY HAS ENTERED",
          color: "#ff007f"
        });
        setTimeout(() => setAnnouncement(null), 3000);
      }

      if (boss) {
        if (boss.state === 'entering') {
          // Move slow onto screen
          boss.x -= 2;
          if (boss.x <= GAME_WIDTH - 150) {
            boss.state = 'fight';
          }
        } else if (boss.state === 'fight') {
          // Hover up and down
          boss.y = 80 + Math.sin(state.tick * 0.05) * 30;

          // AI behavior
          boss.shootTimer--;
          if (boss.shootTimer <= 0) {
            boss.shootTimer = 100 - Math.min(50, state.gameSpeed * 4); // speed up attacks
            audioSynth.playBossLaser();

            // Fire neon glitch projectile at player
            const angle = Math.atan2(player.y - boss.y, player.x - boss.x);
            projectiles.push({
              x: boss.x,
              y: boss.y + boss.height / 2,
              vx: Math.cos(angle) * 7,
              vy: Math.sin(angle) * 7,
              width: 12,
              height: 12,
              color: '#00f0ff',
              isPlayer: false
            });
            // Little blast particle
            spawnExplosion(boss.x, boss.y + boss.height / 2, '#00f0ff', 4);
          }

          // Periodic charge attack!
          boss.chargeTimer--;
          if (boss.chargeTimer <= 0) {
            boss.chargeTimer = 240; // reset charge timer
            boss.isCharging = true;
            boss.chargeTargetX = -100;
            boss.chargeVx = -9;
            audioSynth.playBossWarning();
          }

          if (boss.isCharging) {
            boss.x += boss.chargeVx;
            if (boss.x <= boss.chargeTargetX && boss.chargeVx < 0) {
              // Return from left side
              boss.x = -150;
              boss.chargeVx = 8;
              boss.chargeTargetX = GAME_WIDTH - 150;
            } else if (boss.x >= boss.chargeTargetX && boss.chargeVx > 0) {
              // Reset charge state
              boss.x = GAME_WIDTH - 150;
              boss.isCharging = false;
            }
          }
        } else if (boss.state === 'dying') {
          // Flash, burst, fall down
          boss.y += 2;
          if (state.tick % 5 === 0) {
            spawnExplosion(
              boss.x + Math.random() * boss.width,
              boss.y + Math.random() * boss.height,
              state.tick % 10 === 0 ? '#ff007f' : '#00f0ff',
              5
            );
          }
          if (boss.y > GAME_HEIGHT) {
            // Defeated fully!
            state.boss = null;
            player.score += 300; // Big bonus
            player.laserCount = Math.min(10, player.laserCount + 5);
            setGameScore(player.score);

            state.nextBossScore = player.score + state.bossSpawnThreshold;
            state.gameSpeed += 0.8; // increase overall difficulty speed

            saveStats({
              ...stats,
              bossesDefeated: stats.bossesDefeated + 1
            });

            audioSynth.playBossDefeated();
            setAnnouncement({
              text: "BOSS 67 DEFEATED!",
              sub: "+300 POINTS BONUS GRID OVERLOADED",
              color: "#10b981"
            });
            setTimeout(() => setAnnouncement(null), 3000);
          }
        }

        // Player collides directly with boss body
        if (boss.state === 'fight') {
          const playerBox = { x: player.x, y: player.y, w: player.width, h: player.height };
          if (
            playerBox.x < boss.x + boss.width &&
            playerBox.x + playerBox.w > boss.x &&
            playerBox.y < boss.y + boss.height &&
            playerBox.y + playerBox.h > boss.y
          ) {
            player.hp--;
            audioSynth.playHit();
            spawnExplosion(player.x + player.width / 2, player.y + player.height / 2, '#ff0000', 30);

            // Bounce player back
            player.vy = -6;
            player.isGrounded = false;

            // Push boss back slightly
            boss.x = Math.min(GAME_WIDTH - 120, boss.x + 50);

            if (player.hp <= 0) {
              triggerGameOver();
              return;
            }
          }
        }
      }

      // 4. Update Projectiles
      for (let i = projectiles.length - 1; i >= 0; i--) {
        const proj = projectiles[i];
        proj.x += proj.vx;
        proj.y += proj.vy;

        // Draw trail particles
        if (state.tick % 3 === 0) {
          particles.push({
            x: proj.x,
            y: proj.y + proj.height / 2,
            vx: -proj.vx * 0.1,
            vy: (Math.random() - 0.5) * 1,
            color: proj.color,
            size: Math.random() * 2 + 1,
            alpha: 0.8,
            life: 0,
            maxLife: 15
          });
        }

        // Collision: Player projectile hitting Boss 67
        if (proj.isPlayer && boss && boss.state === 'fight') {
          if (
            proj.x < boss.x + boss.width &&
            proj.x + proj.width > boss.x &&
            proj.y < boss.y + boss.height &&
            proj.y + proj.height > boss.y
          ) {
            boss.hp--;
            audioSynth.playHit();
            spawnExplosion(proj.x, proj.y, '#ff007f', 12);
            projectiles.splice(i, 1);

            if (boss.hp <= 0) {
              boss.state = 'dying';
              audioSynth.playBossDefeated();
            }
            continue;
          }
        }

        // Collision: Enemy projectile hitting Player
        if (!proj.isPlayer) {
          const playerBox = { x: player.x, y: player.y, w: player.width, h: player.height };
          if (
            proj.x < playerBox.x + playerBox.w &&
            proj.x + proj.width > playerBox.x &&
            proj.y < playerBox.y + playerBox.h &&
            proj.y + proj.height > playerBox.y
          ) {
            player.hp--;
            audioSynth.playHit();
            spawnExplosion(player.x + player.width / 2, player.y + player.height / 2, '#ff0000', 20);
            projectiles.splice(i, 1);

            if (player.hp <= 0) {
              triggerGameOver();
              return;
            }
            continue;
          }
        }

        // Remove off-screen projectiles
        if (proj.x < -100 || proj.x > GAME_WIDTH + 100 || proj.y < -100 || proj.y > GAME_HEIGHT + 100) {
          projectiles.splice(i, 1);
        }
      }

      // 5. Update Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.alpha = 1 - p.life / p.maxLife;

        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
        }
      }

      // 6. Draw Game Scenes
      drawScene(ctx, state);

      // Check for real-time high score beats
      if (player.score > stats.highScore && !state.highScoreBeaten && stats.highScore > 0) {
        state.highScoreBeaten = true;
        setAnnouncement({
          text: "NEW HIGH SCORE!",
          sub: "YOU EXCEEDED THE PREVIOUS GENERATION LIMIT",
          color: "#ffe600"
        });
        setTimeout(() => setAnnouncement(null), 3000);
      }

      frameId = requestAnimationFrame(gameLoop);
    };

    const triggerGameOver = () => {
      const state = stateRef.current;
      setIsGameOver(true);
      setIsPlaying(false);

      // Save highscore
      const finalScore = state.player.score;
      const isNewHigh = finalScore > stats.highScore;
      const updatedStats = {
        ...stats,
        highScore: Math.max(stats.highScore, finalScore),
        lifetimeScore: stats.lifetimeScore + finalScore
      };

      saveStats(updatedStats);

      setAnnouncement({
        text: "GAME OVER",
        sub: isNewHigh ? `NEW RECORD: ${finalScore} POINTS!` : `FINAL SCORE: ${finalScore} POINTS`,
        color: "#ff007f"
      });
    };

    frameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying, isGameOver, stats]);

  // Canvas Drawing routines
  const drawScene = (ctx: CanvasRenderingContext2D, state: any) => {
    const { player, obstacles, projectiles, particles, boss, distanceRun, tick } = state;

    // Clear Canvas with rich 80s gradient or solid grid-dark
    ctx.fillStyle = '#0b0c10';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Parallax background stars/grid lines
    drawBackground(ctx, tick, state.gameSpeed);

    // Draw scrolling grid floor
    drawFloorGrid(ctx, tick, state.gameSpeed);

    // Draw active obstacles
    obstacles.forEach((obs: ActiveObstacle) => {
      obs.def.draw(ctx, obs.x, obs.y, obs.width, obs.height, tick + obs.frame);
    });

    // Draw Projectiles
    projectiles.forEach((proj: Projectile) => {
      ctx.fillStyle = proj.color;
      ctx.fillRect(proj.x, proj.y, proj.width, proj.height);
      // Neon aura glow
      ctx.fillStyle = proj.isPlayer ? 'rgba(255, 0, 127, 0.4)' : 'rgba(0, 240, 255, 0.4)';
      ctx.fillRect(proj.x - 3, proj.y - 3, proj.width + 6, proj.height + 6);
    });

    // Draw Particles
    particles.forEach((p: Particle) => {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    });
    ctx.globalAlpha = 1.0; // reset

    // Draw Boss 67 if active
    if (boss) {
      drawBoss67(ctx, boss, tick);
    }

    // Draw player character
    drawPlayer(ctx, player, tick);

    // HUD overlays drawn directly on Canvas for pixel fidelity
    drawCanvasHUD(ctx, player, boss, distanceRun);
  };

  const drawBackground = (ctx: CanvasRenderingContext2D, tick: number, speed: number) => {
    // 1. Synth Sunset
    const sunRadius = 75;
    const sunX = GAME_WIDTH / 2;
    const sunY = 180;

    const grad = ctx.createLinearGradient(sunX, sunY - sunRadius, sunX, sunY + sunRadius);
    grad.addColorStop(0, '#ffe600');
    grad.addColorStop(0.5, '#ff007f');
    grad.addColorStop(1, '#11031d');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunRadius, Math.PI, 0, false);
    ctx.fill();

    // Horizontal retro scan slice lines inside sun
    ctx.fillStyle = '#0b0c10';
    for (let sy = sunY - sunRadius; sy < sunY; sy += 6) {
      const sliceHeight = Math.max(1, (sy - (sunY - sunRadius)) / 12);
      ctx.fillRect(sunX - sunRadius, sy, sunRadius * 2, sliceHeight);
    }

    // 2. Parallax Cyberpunk Mountains/Grid Hills
    ctx.strokeStyle = '#5b21b6';
    ctx.lineWidth = 1;
    ctx.beginPath();
    const hillScroll = (tick * 0.2) % 120;
    for (let x = -120; x < GAME_WIDTH + 120; x += 120) {
      const hX = x - hillScroll;
      ctx.moveTo(hX, GROUND_Y);
      ctx.lineTo(hX + 60, GROUND_Y - 50);
      ctx.lineTo(hX + 120, GROUND_Y);
    }
    ctx.stroke();

    // 3. Ambient stars bleeping
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 20; i++) {
      const starX = (i * 97 + tick * 0.05) % GAME_WIDTH;
      const starY = (i * 31) % 130;
      const size = (i % 3 === 0 && tick % 20 < 10) ? 2 : 1;
      ctx.fillRect(starX, starY, size, size);
    }
  };

  const drawFloorGrid = (ctx: CanvasRenderingContext2D, tick: number, speed: number) => {
    const horizonY = GROUND_Y;
    const floorHeight = GAME_HEIGHT - horizonY;

    // Background color for floor (deep dark purple)
    ctx.fillStyle = '#110123';
    ctx.fillRect(0, horizonY, GAME_WIDTH, floorHeight);

    // Neon horizon line separator
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, horizonY);
    ctx.lineTo(GAME_WIDTH, horizonY);
    ctx.stroke();

    // Perspective floor grid lines
    ctx.strokeStyle = '#ff007f';
    ctx.lineWidth = 1;
    const cols = 20;
    for (let i = -5; i <= cols + 5; i++) {
      const startX = (GAME_WIDTH / cols) * i;
      // Vanishing point calculations
      const endX = GAME_WIDTH / 2 + (startX - GAME_WIDTH / 2) * 4;
      ctx.beginPath();
      ctx.moveTo(startX, horizonY);
      ctx.lineTo(endX, GAME_HEIGHT);
      ctx.stroke();
    }

    // Horizontal grid lines scrolling forward
    ctx.strokeStyle = 'rgba(255, 0, 127, 0.7)';
    const scroll = (tick * speed) % 40;
    for (let y = 0; y < floorHeight; y += 12) {
      // Perspective scaling for line density
      const densityY = horizonY + y + scroll;
      if (densityY < GAME_HEIGHT && densityY >= horizonY) {
        ctx.lineWidth = Math.max(1, (y / 15));
        ctx.beginPath();
        ctx.moveTo(0, densityY);
        ctx.lineTo(GAME_WIDTH, densityY);
        ctx.stroke();
      }
    }
  };

  const drawPlayer = (ctx: CanvasRenderingContext2D, player: Player, tick: number) => {
    const isFlashing = player.hp <= 1 && tick % 10 < 5;
    if (isFlashing) ctx.globalAlpha = 0.3;

    ctx.save();
    ctx.translate(player.x, player.y);

    // 80s Cyber Runner Pixel Character
    if (player.isDucking) {
      // SLIDING POSE
      // Red jacket/leather
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(0, 8, 28, 12);
      // Cyber shades
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(16, 4, 10, 4);
      // Skin
      ctx.fillStyle = '#ffedd5';
      ctx.fillRect(12, 0, 8, 8);
      // Glowing thruster slide sparks
      ctx.fillStyle = '#ffe600';
      ctx.fillRect(-8, 14, 10, 4);
      ctx.fillStyle = '#ff007f';
      ctx.fillRect(-4, 12, 6, 2);
    } else {
      // RUNNING/JUMPING POSE
      const legCycle = Math.floor(tick / 6) % 4;

      // Hair (epic 80s mullet!)
      ctx.fillStyle = '#18181b';
      ctx.fillRect(0, 0, 14, 12);
      ctx.fillRect(-4, 4, 8, 14); // mullet tail!

      // Skin head
      ctx.fillStyle = '#fed7aa';
      ctx.fillRect(8, 2, 14, 12);

      // Sunglasses (cool cyber neon shades)
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(14, 6, 10, 4);

      // Red retro leather jacket
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(4, 14, 20, 18);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(6, 16, 16, 14);

      // Yellow neon belt
      ctx.fillStyle = '#eab308';
      ctx.fillRect(4, 30, 18, 4);

      // Legs / Running cycle
      ctx.fillStyle = '#1d4ed8'; // blue jeans
      if (!player.isGrounded) {
        // Jump state
        ctx.fillRect(6, 34, 8, 8);
        ctx.fillRect(14, 34, 8, 4);
      } else {
        // Run walk cycle legs
        if (legCycle === 0) {
          ctx.fillRect(4, 34, 6, 10);
          ctx.fillRect(14, 34, 6, 6);
        } else if (legCycle === 1) {
          ctx.fillRect(6, 34, 6, 8);
          ctx.fillRect(12, 34, 6, 10);
        } else if (legCycle === 2) {
          ctx.fillRect(8, 34, 6, 6);
          ctx.fillRect(14, 34, 6, 12);
        } else {
          ctx.fillRect(4, 34, 6, 12);
          ctx.fillRect(12, 34, 6, 8);
        }
      }

      // Neon sneakers
      ctx.fillStyle = '#00f0ff';
      if (player.isGrounded) {
        if (legCycle === 0) {
          ctx.fillRect(4, 44, 8, 4);
        } else if (legCycle === 2) {
          ctx.fillRect(14, 46, 8, 4);
        } else if (legCycle === 3) {
          ctx.fillRect(4, 46, 8, 4);
        }
      }
    }

    ctx.restore();
    ctx.globalAlpha = 1.0; // reset
  };

  const drawBoss67 = (ctx: CanvasRenderingContext2D, boss: Boss, tick: number) => {
    // Holographic digital matrix neon body
    const isFight = boss.state === 'fight';
    const shakeY = isFight ? Math.sin(tick * 0.1) * 3 : 0;
    const bx = boss.x;
    const by = boss.y + shakeY;

    // Glowing shield aura
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ff007f';
    ctx.fillStyle = 'rgba(255, 0, 127, 0.15)';
    ctx.fillRect(bx - 10, by - 10, boss.width + 20, boss.height + 20);

    // Core chassis
    ctx.fillStyle = '#0b0f19';
    ctx.fillRect(bx, by, boss.width, boss.height);
    ctx.strokeStyle = '#ff007f';
    ctx.lineWidth = 4;
    ctx.strokeRect(bx, by, boss.width, boss.height);

    // Inner wireframe face
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(bx + 12, by + 12, boss.width - 24, boss.height - 24);

    // Big glowing red "67" logo inside boss head
    ctx.fillStyle = '#ff007f';
    ctx.font = 'bold 36px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('67', bx + boss.width / 2, by + boss.height / 2);

    // Red cybernetic eyes
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(bx + 16, by + 16, 12, 6);
    ctx.fillRect(bx + boss.width - 28, by + 16, 12, 6);

    // Thruster smoke/beams
    ctx.fillStyle = '#ffe600';
    const thrusterHeight = 10 + Math.random() * 12;
    ctx.fillRect(bx + 15, by + boss.height, 10, thrusterHeight);
    ctx.fillRect(bx + boss.width - 25, by + boss.height, 10, thrusterHeight);

    // Reset shadow
    ctx.shadowBlur = 0;
  };

  const drawCanvasHUD = (ctx: CanvasRenderingContext2D, player: Player, boss: Boss, distance: number) => {
    // Current Run HP Hearts in retro pixel look
    ctx.fillStyle = '#ff007f';
    ctx.font = '14px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('HP:', 20, 26);
    for (let i = 0; i < player.maxHp; i++) {
      if (i < player.hp) {
        // Red pixel square heart
        ctx.fillStyle = '#ff007f';
        ctx.fillRect(50 + i * 20, 14, 12, 12);
        ctx.fillRect(52 + i * 20, 12, 8, 16);
      } else {
        // Gray empty heart
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.strokeRect(50 + i * 20, 14, 12, 12);
      }
    }

    // Laser ammo indicator
    ctx.fillStyle = '#00f0ff';
    ctx.fillText('LASERS: INFINITE', 150, 26);
    for (let l = 0; l < 10; l++) {
      ctx.fillRect(250 + l * 8, 16, 4, 10);
    }

    // Distance run metric
    ctx.fillStyle = '#facc15';
    ctx.fillText(`DIST: ${Math.floor(distance)}m`, GAME_WIDTH - 150, 26);

    // Boss 67 Health bar (drawn on top center if boss active)
    if (boss && boss.state !== 'defeated') {
      const barW = 200;
      const barH = 12;
      const barX = GAME_WIDTH / 2 - barW / 2;
      const barY = 40;

      // Label
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('BOSS 67 POWER MATRIX', GAME_WIDTH / 2, barY - 6);

      // BG
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(barX, barY, barW, barH);
      // FG
      const fillW = (boss.hp / boss.maxHp) * barW;
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(barX + 2, barY + 2, Math.max(0, fillW - 4), barH - 4);
      // Border
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.strokeRect(barX, barY, barW, barH);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto bg-[#050510] text-[#00f2ff] font-mono relative select-none rounded-lg border-[12px] border-[#1a1a3a] shadow-[0_10px_50px_rgba(0,242,255,0.15)] overflow-hidden" id="arcade_cabinet_root">
      
      {/* Absolute CRT Scanline Overlay across the whole cabinet */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.15] z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />

      {/* Cybernetic Elegant Header */}
      <header className="h-20 border-b-4 border-[#ff00ff] bg-[#0a0a20] flex items-center justify-between px-6 md:px-10 shadow-[0_4px_20px_rgba(255,0,255,0.3)] z-40 relative">
        <div className="flex gap-4 md:gap-8">
          <div className="flex flex-col">
            <span className="text-[10px] text-[#ff00ff] uppercase tracking-widest font-bold">Score</span>
            <span className="text-xl md:text-3xl font-bold leading-none text-white tracking-wider font-mono">
              {String(gameScore).padStart(8, '0')}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-[#ff00ff] uppercase tracking-widest font-bold">High Score</span>
            <span className="text-sm md:text-xl opacity-60 leading-none text-white font-mono">
              {String(stats.highScore).padStart(8, '0')}
            </span>
          </div>
        </div>

        <div className="text-center">
          <div className="text-2xl md:text-4xl font-black italic text-white tracking-tighter drop-shadow-[0_0_10px_#00f2ff] font-display">
            67 RUNNER
          </div>
          <div className="text-[9px] md:text-[10px] tracking-[0.4em] opacity-80 uppercase text-cyan-300">
            Forever Edition
          </div>
        </div>

        <div className="flex gap-4 md:gap-8 items-center text-right">
          <div className="flex flex-col">
            <span className="text-[10px] text-[#ff00ff] uppercase tracking-widest font-bold">Multiplier</span>
            <span className="text-lg md:text-2xl font-bold text-[#00ff9d] leading-none">
              x{(1.0 + (gameScore / 1000) * 10).toFixed(1)}
            </span>
          </div>
          <div className="hidden sm:flex gap-1 h-6 items-end">
            <div className={`w-2.5 h-full bg-[#ff00ff] shadow-[0_0_10px_#ff00ff] ${isPlaying && !isMuted ? 'animate-pulse' : ''}`}></div>
            <div className={`w-2.5 h-4/5 bg-[#ff00ff] shadow-[0_0_10px_#ff00ff] ${isPlaying && !isMuted ? 'animate-bounce' : ''}`}></div>
            <div className={`w-2.5 h-3/5 bg-[#ff00ff] shadow-[0_0_10px_#ff00ff] ${isPlaying && !isMuted ? 'animate-pulse' : ''}`}></div>
            <div className="w-2.5 h-2 bg-[#444] opacity-30"></div>
          </div>
        </div>
      </header>

      {/* Main Container - Retro Dotted Background */}
      <main 
        className="relative overflow-hidden bg-[#080815] p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6"
        style={{ 
          backgroundImage: 'radial-gradient(#00f2ff 1px, transparent 1px)', 
          backgroundSize: '40px 40px',
          backgroundPosition: 'center'
        }}
      >
        {/* Left Panel: High Tech Dashboard */}
        <div className="lg:col-span-1 bg-[#0a0a20]/95 border-2 border-[#ff00ff]/30 rounded-lg p-4 flex flex-col justify-between shadow-[0_0_20px_rgba(255,0,255,0.05)] relative z-20 backdrop-blur-sm" id="stats_panel">
          <div>
            <div className="border-b-2 border-[#ff00ff]/30 pb-2 mb-4">
              <h2 className="text-md font-extrabold text-white tracking-wider flex items-center gap-2 font-display">
                <Award className="w-5 h-5 text-[#ff00ff]" />
                CRITICAL DIAGNOSTICS
              </h2>
            </div>

            {/* Glowing Bento-like Metrics Cards */}
            <div className="space-y-4">
              {/* Stage Progress (styled exact from design HTML) */}
              <div className="p-4 border-l-4 border-[#00ff9d] bg-[#00ff9d]/5 w-full rounded-r shadow-[0_0_15px_rgba(0,255,157,0.05)] transition-all hover:bg-[#00ff9d]/10">
                <div className="text-[10px] text-[#00ff9d] opacity-80 uppercase tracking-widest font-bold">Stage Progress</div>
                <div className="text-xl font-bold text-white mt-1">
                  {Math.floor(stateRef.current.distanceRun * 10).toLocaleString()}m / 10k
                </div>
                <div className="w-full bg-black/40 h-1.5 rounded mt-2 overflow-hidden">
                  <div 
                    className="bg-[#00ff9d] h-full transition-all duration-300 shadow-[0_0_8px_#00ff9d]" 
                    style={{ width: `${Math.min(100, (stateRef.current.distanceRun * 10 / 10000) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Obstacles Dodged (styled exact from design HTML) */}
              <div className="p-4 border-l-4 border-orange-500 bg-orange-500/5 w-full rounded-r shadow-[0_0_15px_rgba(249,115,22,0.05)] transition-all hover:bg-orange-500/10">
                <div className="text-[10px] text-orange-400 opacity-80 uppercase tracking-widest font-bold">Obstacles Dodged</div>
                <div className="text-xl font-bold text-white mt-1">
                  {stats.totalDodged} / 67
                </div>
              </div>

              {/* Total runs and details */}
              <div className="p-4 border-l-4 border-[#00f2ff] bg-[#00f2ff]/5 w-full rounded-r shadow-[0_0_15px_rgba(0,242,255,0.05)] transition-all hover:bg-[#00f2ff]/10">
                <div className="text-[10px] text-cyan-400 opacity-80 uppercase tracking-widest font-bold">Lifetime Runs</div>
                <div className="text-xl font-bold text-white mt-1">
                  {stats.lifetimeRuns.toLocaleString()} runs
                </div>
              </div>

              <div className="bg-[#050510] border border-[#ff00ff]/20 p-3 rounded text-center">
                <span className="text-[#ff00ff] text-[10px] uppercase tracking-widest font-bold block mb-1">Database Discovered</span>
                <div className="flex justify-center items-baseline gap-1">
                  <span className="text-2xl font-extrabold text-white">{stats.discoveredObstacleIds.length}</span>
                  <span className="text-gray-500">/</span>
                  <span className="text-md font-bold text-gray-400">67</span>
                </div>
              </div>
            </div>
          </div>

          {/* Controls Panel Mute / Reset */}
          <div className="mt-6 pt-4 border-t border-[#ff00ff]/20 space-y-2">
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className="w-full bg-[#1e1b4b]/80 hover:bg-[#2e2a75] text-[#00f2ff] text-xs py-2.5 px-3 rounded border border-cyan-800 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_10px_rgba(0,242,255,0.1)] active:scale-95"
              id="sound_toggle_btn"
            >
              {isMuted ? (
                <>
                  <VolumeX className="w-4 h-4 text-red-400" />
                  AUDIO ENGINE: STANDBY (MUTE)
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-[#00ff9d]" />
                  AUDIO ENGINE: ACTIVE [44.1kHz]
                </>
              )}
            </button>

            <button 
              onClick={() => {
                if (window.confirm("RESET RETRO RUNNER STATS?")) {
                  saveStats({
                    highScore: 0,
                    lifetimeScore: 0,
                    lifetimeRuns: 0,
                    discoveredObstacleIds: ['floppy_disk'],
                    bossesDefeated: 0,
                    totalDodged: 0
                  });
                }
              }}
              className="w-full bg-transparent hover:bg-red-950/40 text-red-500 text-[10px] py-1.5 px-3 rounded hover:border hover:border-red-900/60 transition-all cursor-pointer text-center"
            >
              PURGE ARCHIVE RETRO LOGS
            </button>
          </div>
        </div>

        {/* Center Panel: Arcade Cabinet view */}
        <div className="lg:col-span-2 flex flex-col items-center relative z-20" id="arcade_canvas_panel">
          
          {/* Cabinet Top Header */}
          <div className="w-full bg-gradient-to-b from-[#110123] to-[#090514] border-t-4 border-x-4 border-[#ff00ff] p-2 text-center rounded-t shadow-[0_-5px_15px_rgba(255,0,255,0.25)]">
            <div className="flex items-center justify-between px-4 text-xs font-mono">
              <span className="text-[#ff00ff] font-extrabold tracking-widest animate-pulse">&bull; RETRO SECTOR ACTIVE &bull;</span>
              <span className="text-[#00f2ff] font-bold">SCORE: {gameScore}</span>
              <span className="text-yellow-400 font-bold hidden sm:inline">COIN INJECTED</span>
            </div>
          </div>

          {/* Canvas Wrapper inside CRT screen container */}
          <div 
            ref={containerRef}
            className="w-full bg-black border-4 border-[#1a1a3a] relative overflow-hidden shadow-[inset_0_0_50px_rgba(0,0,0,1),0_0_20px_rgba(0,242,255,0.1)] rounded-b group"
            style={{ imageRendering: 'pixelated' }}
            id="crt_cabinet_container"
          >
            {/* Real Canvas element */}
            <canvas
              ref={canvasRef}
              width={GAME_WIDTH}
              height={GAME_HEIGHT}
              onClick={() => {
                if (!isPlaying && !isGameOver) {
                  startGame();
                }
              }}
              className="block w-full bg-[#080815]"
            />

            {/* Scanlines layer for heavy 80s arcade immersion */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.35)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-25" />

            {/* Screen reflection simulation overlay */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent opacity-80" />

            {/* In-Game Announcements layer (non-obstructive floating top pill) */}
            {announcement && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/95 border-2 border-cyan-500/50 px-5 py-2 rounded-full text-center z-30 shadow-[0_0_15px_rgba(0,242,255,0.4)] animate-pulse flex items-center justify-center gap-2 max-w-[90%] pointer-events-none">
                <Sparkles className="w-4 h-4 text-yellow-400 shrink-0" />
                <div className="flex flex-col text-left">
                  <h3 
                    className="text-[11px] md:text-xs font-black tracking-wider font-mono uppercase leading-none"
                    style={{ color: announcement.color, textShadow: `0 0 8px ${announcement.color}` }}
                  >
                    {announcement.text}
                  </h3>
                  <span className="text-[8px] md:text-[9px] text-gray-300 font-mono uppercase mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
                    {announcement.sub}
                  </span>
                </div>
              </div>
            )}

            {/* Play Screen Overlay Controls */}
            {!isPlaying && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#07070b]/95 backdrop-blur-xs text-center p-6">
                <div className="max-w-md space-y-4">
                  <div className="bg-[#0a0a20] border-2 border-[#ff00ff] rounded p-4 text-left shadow-[0_0_20px_rgba(255,0,255,0.25)]">
                    <h3 className="text-[#ff00ff] font-extrabold text-center text-md mb-2 tracking-widest font-mono uppercase">
                      {isGameOver ? "⚡️ CONNECTION OVERLOAD ⚡️" : "⚡️ GRID RUNNER SYSTEM ⚡️"}
                    </h3>
                    <p className="text-xs text-gray-300 leading-relaxed mb-4 text-center font-sans">
                      Avoid <span className="text-[#00ff9d] font-bold">67 unique pixel glitches</span> across the cyberspace grid. 
                      Collect weapon powerups and trigger energy lasers to destroy <span className="text-red-500 font-bold">Boss 67</span>!
                    </p>

                    {/* Quick controls table */}
                    <div className="grid grid-cols-3 gap-2 text-center text-xs mt-2 border-t border-purple-950 pt-3 text-[#00f2ff]">
                      <div className="bg-black/60 p-2 rounded border border-cyan-900/40">
                        <span className="block font-bold text-[9px] text-gray-400">JUMP / กระโดด</span>
                        <span className="font-extrabold text-white text-[11px] font-mono">Space / W</span>
                      </div>
                      <div className="bg-black/60 p-2 rounded border border-cyan-900/40">
                        <span className="block font-bold text-[9px] text-gray-400">SLIDE / สไลด์</span>
                        <span className="font-extrabold text-white text-[11px] font-mono">S / Down</span>
                      </div>
                      <div className="bg-black/60 p-2 rounded border border-cyan-900/40">
                        <span className="block font-bold text-[9px] text-gray-400">SHOOT / ยิงเลเซอร์</span>
                        <span className="font-extrabold text-white text-[11px] font-mono">F / Ctrl / X</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={startGame}
                    className="w-full py-3.5 px-6 rounded bg-gradient-to-r from-[#ff00ff] to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-black text-md tracking-widest shadow-[0_0_20px_rgba(255,0,255,0.4)] active:scale-95 transition-all flex items-center justify-center gap-3 border-2 border-pink-400 cursor-pointer"
                    id="arcade_start_btn"
                  >
                    <Play className="w-5 h-5 fill-white" />
                    {isGameOver ? "RESTART RETRO SECTOR" : "INITIALIZE PROTOCOL"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Physical Arcade Console Buttons mockup - Fully styled */}
          <div className="w-full bg-[#0a0a20] p-3.5 rounded-b border-x-4 border-b-4 border-[#ff00ff] grid grid-cols-3 gap-3 text-center shadow-[0_8px_25px_rgba(255,0,255,0.15)] z-20" id="controller_buttons_pad">
            <button
              onMouseDown={triggerJump}
              onTouchStart={(e) => { e.preventDefault(); triggerJump(); }}
              className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-extrabold py-3.5 px-2 rounded-lg border-b-[5px] border-red-900 active:border-b-0 shadow-lg text-xs tracking-widest active:translate-y-1 transition-all flex flex-col items-center justify-center cursor-pointer select-none"
              id="pad_jump_btn"
            >
              <span className="text-white font-bold tracking-wide">JUMP (Space)</span>
              <span className="text-[9px] text-red-200 mt-0.5">RED JUMP POD</span>
            </button>

            <button
              onMouseDown={startDuck}
              onMouseUp={endDuck}
              onMouseLeave={endDuck}
              onTouchStart={(e) => { e.preventDefault(); startDuck(); }}
              onTouchEnd={(e) => { e.preventDefault(); endDuck(); }}
              className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-extrabold py-3.5 px-2 rounded-lg border-b-[5px] border-blue-900 active:border-b-0 shadow-lg text-xs tracking-widest active:translate-y-1 transition-all flex flex-col items-center justify-center cursor-pointer select-none"
              id="pad_duck_btn"
            >
              <span className="text-white font-bold tracking-wide">SLIDE (Down)</span>
              <span className="text-[9px] text-blue-200 mt-0.5">BLUE SLIDE POD</span>
            </button>

            <button
              onMouseDown={triggerShoot}
              onTouchStart={(e) => { e.preventDefault(); triggerShoot(); }}
              className="bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 text-black font-extrabold py-3.5 px-2 rounded-lg border-b-[5px] border-yellow-800 active:border-b-0 shadow-lg text-xs tracking-widest active:translate-y-1 transition-all flex flex-col items-center justify-center cursor-pointer select-none"
              id="pad_shoot_btn"
            >
              <span className="text-black font-extrabold tracking-wide flex items-center gap-1">
                <Zap className="w-3 h-3 fill-black animate-pulse" />
                SHOOT (F)
              </span>
              <span className="text-[9px] text-yellow-900 mt-0.5">YELLOW BLAST POD</span>
            </button>
          </div>
        </div>

        {/* Right Panel: Interactive 67 Obstacles Catalog */}
        <div className="lg:col-span-1 bg-[#0a0a20]/95 border-2 border-[#ff00ff]/30 rounded-lg p-4 flex flex-col h-[525px] shadow-[0_0_20px_rgba(255,0,255,0.05)] relative z-20 backdrop-blur-sm" id="glitch_encyclopedia_panel">
          <div className="border-b-2 border-[#ff00ff]/30 pb-2 mb-2 flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-white tracking-wider flex items-center gap-1.5 font-display">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              GLITCH CYCLOPEDIA
            </h2>
            <span className="text-xs bg-cyan-950 px-2 py-0.5 text-cyan-400 font-bold border border-cyan-800 rounded-full font-mono">
              {stats.discoveredObstacleIds.length}/67
            </span>
          </div>

          <p className="text-[10px] text-gray-400 mb-3 leading-relaxed">
            Scan and index all 67 cyber glitches. Discover new items during runs to decrypt data.
          </p>

          {/* Interactive Previewer Panel with Elegant Neon design */}
          {(() => {
            const selectedDef = OBSTACLES_LIST.find(o => o.id === selectedObstacleId);
            const isDiscovered = stats.discoveredObstacleIds.includes(selectedObstacleId);
            return (
              <div className="bg-[#050510] border border-cyan-900/60 rounded p-3 mb-3 flex flex-col items-center">
                <span className="text-[9px] text-[#00f2ff] uppercase tracking-[0.2em] border-b border-cyan-950/80 pb-1 w-full text-center mb-2 font-bold">
                  VECTOR GRID DECRYPTER
                </span>
                
                {/* Visual canvas thumbnail of this obstacle */}
                <div className="w-24 h-24 bg-[#0a0a20] flex items-center justify-center border-2 border-[#ff00ff]/30 rounded relative overflow-hidden shadow-[0_0_15px_rgba(255,0,255,0.05)]">
                  {isDiscovered ? (
                    <ObstacleThumbnail def={selectedDef!} />
                  ) : (
                    <div className="text-center">
                      <span className="text-3xl block text-gray-700 select-none">🔒</span>
                      <span className="text-[8px] text-red-500 uppercase tracking-widest font-bold block mt-1">LOCKED</span>
                    </div>
                  )}
                  {/* Grid background on thumbnail */}
                  <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%)] bg-[length:100%_6px]" />
                </div>

                <div className="text-center mt-2.5 w-full">
                  <span className="text-xs font-bold text-white block font-mono">
                    {isDiscovered ? selectedDef?.name : '??? UNKNOWN OBJECT ???'}
                  </span>
                  <span className="text-[10px] text-[#ff00ff] block mt-0.5">
                    {isDiscovered ? selectedDef?.thaiName : `สิ่งกีดขวางลำดับที่ ${OBSTACLES_LIST.findIndex(o => o.id === selectedObstacleId) + 1}`}
                  </span>
                  <span className="text-[8px] text-gray-500 uppercase block mt-1 font-bold">
                    CLASS: {selectedDef?.type} &bull; LEVEL 67 COGNITIVE
                  </span>
                </div>
              </div>
            );
          })()}

          {/* Scrolling Checklist Grid */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 custom-scrollbar" id="obstacle_checklist_scroll">
            {OBSTACLES_LIST.map((obs, index) => {
              const isDiscovered = stats.discoveredObstacleIds.includes(obs.id);
              const isSelected = selectedObstacleId === obs.id;
              return (
                <button
                  key={obs.id}
                  onClick={() => setSelectedObstacleId(obs.id)}
                  className={`w-full text-left p-1.5 rounded border text-xs flex items-center justify-between transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-[#1b1b3a] border-cyan-400 text-cyan-300 shadow-[0_0_8px_rgba(0,242,255,0.3)] font-bold' 
                      : 'bg-[#050510]/80 border-cyan-950/40 hover:bg-[#0a0a20] text-gray-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-[10px] text-[#ff00ff] font-bold font-mono">
                      #{String(index + 1).padStart(2, '0')}
                    </span>
                    <span className={`font-mono truncate ${!isDiscovered && 'opacity-30'}`}>
                      {isDiscovered ? obs.name : 'Decrypt Pending...'}
                    </span>
                  </div>
                  
                  {isDiscovered ? (
                    <span className="text-[8px] text-[#00ff9d] bg-[#00ff9d]/10 px-1.5 py-0.5 rounded border border-[#00ff9d]/30 font-bold uppercase tracking-wider">
                      INDEXED
                    </span>
                  ) : (
                    <span className="text-[8px] text-red-500 bg-red-950/10 px-1.5 py-0.5 rounded border border-red-900/20 opacity-60 font-bold uppercase">
                      LOCKED
                    </span>
                  )}
                </button>
              );
            })}
          </div>

        </div>
      </main>

      {/* Cyberpunk Footer of Cabinet */}
      <footer className="h-16 md:h-20 bg-[#0a0a20] border-t-2 border-[#1a1a3a] flex flex-col md:flex-row items-center px-6 md:px-10 justify-between text-[9px] md:text-[10px] tracking-[0.2em] uppercase text-cyan-400 opacity-80 gap-1.5 py-3 md:py-0 relative z-30">
        <div>System: Ver 0.67-Retro8bit</div>
        <div className="hidden md:block">Minimal Audio Engine: {isMuted ? 'STANDBY' : 'ACTIVE [L-PCM 44.1kHz]'}</div>
        <div>&copy; 1980-2026 Pixel Labs Inc. &bull; Cyber Division</div>
      </footer>
    </div>
  );
}


// Separate Mini Component to draw static/semi-static thumbnail preview inside catalog using clean canvas
function ObstacleThumbnail({ def }: { def: any }) {
  const canvasThumbRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasThumbRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameId: number;
    let tick = 0;

    const render = () => {
      tick++;
      ctx.clearRect(0, 0, 96, 96);
      
      // Draw obstacle centered inside thumbnail
      ctx.save();
      // Translate to center minus half obstacle width/height
      const tx = 48 - def.width / 2;
      const ty = 48 - def.height / 2;
      def.draw(ctx, tx, ty, def.width, def.height, tick);
      ctx.restore();

      frameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(frameId);
  }, [def]);

  return (
    <canvas 
      ref={canvasThumbRef} 
      width={96} 
      height={96} 
      className="block w-full h-full pointer-events-none" 
    />
  );
}
