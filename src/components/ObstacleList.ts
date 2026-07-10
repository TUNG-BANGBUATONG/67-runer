/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ObstacleDef } from '../types';

// Helper to draw a pixel grid easily
function drawPixelGrid(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  grid: number[][],
  colors: string[]
) {
  const rows = grid.length;
  const cols = grid[0].length;
  const pxW = w / cols;
  const pxH = h / rows;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const colorIndex = grid[r][c];
      if (colorIndex > 0) {
        ctx.fillStyle = colors[colorIndex - 1];
        ctx.fillRect(
          Math.floor(x + c * pxW),
          Math.floor(y + r * pxH),
          Math.ceil(pxW),
          Math.ceil(pxH)
        );
      }
    }
  }
}

export const OBSTACLES_LIST: ObstacleDef[] = [
  // 1. Floppy Disk
  {
    id: 'floppy_disk',
    name: '3.5" Floppy Disk',
    thaiName: 'แผ่นดิสก์ 3.5 นิ้ว',
    type: 'ground',
    width: 44,
    height: 44,
    color: '#00f0ff',
    draw: (ctx, x, y, w, h) => {
      // Body
      ctx.fillStyle = '#0a324d';
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
      // Top cut-off corner
      ctx.fillStyle = '#0b0c10';
      ctx.beginPath();
      ctx.moveTo(x + w - 8, y);
      ctx.lineTo(x + w, y + 8);
      ctx.lineTo(x + w, y);
      ctx.fill();
      // Metal slider
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(x + w / 2 - 8, y + 2, 16, 12);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x + w / 2 - 4, y + 4, 3, 6);
      // Label
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 6, y + h - 18, w - 12, 14);
      ctx.fillStyle = '#ff007f';
      ctx.fillRect(x + 10, y + h - 14, w - 20, 2);
    }
  },
  // 2. Cassette Tape
  {
    id: 'cassette_tape',
    name: 'Retro Cassette',
    thaiName: 'ตลับเทปคาสเซ็ท',
    type: 'ground',
    width: 50,
    height: 32,
    color: '#ff007f',
    draw: (ctx, x, y, w, h, tick) => {
      ctx.fillStyle = '#111';
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = '#ff007f';
      ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
      // Windows
      ctx.fillStyle = '#333';
      ctx.fillRect(x + 8, y + 8, w - 16, 12);
      // Spindles
      ctx.fillStyle = '#fff';
      const offset = (tick % 10 < 5) ? 0 : 1;
      ctx.beginPath();
      ctx.arc(x + 16, y + 14, 4, 0, Math.PI * 2);
      ctx.arc(x + w - 16, y + 14, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(x + 16, y + 14, 2 + offset, 0, Math.PI * 2);
      ctx.arc(x + w - 16, y + 14, 2 - offset, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  // 3. Vaporwave Palm
  {
    id: 'vapor_palm',
    name: 'Synthwave Palm',
    thaiName: 'ต้นปาล์มซินธ์เวฟ',
    type: 'ground',
    width: 36,
    height: 60,
    color: '#ff5e00',
    draw: (ctx, x, y, w, h) => {
      // Trunk
      ctx.fillStyle = '#ffe600';
      ctx.fillRect(x + w / 2 - 3, y + h / 3, 6, h * 2/3);
      // Palm leaves (pixel style)
      ctx.fillStyle = '#ff007f';
      ctx.fillRect(x + w / 2 - 15, y + 10, 30, 8);
      ctx.fillRect(x + w / 2 - 18, y + 16, 36, 6);
      ctx.fillRect(x + w / 2 - 8, y + 4, 16, 8);
      // Highlights
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(x + w / 2 - 12, y + 10, 4, 2);
      ctx.fillRect(x + w / 2 + 8, y + 14, 4, 2);
    }
  },
  // 4. Neon Triangle
  {
    id: 'neon_triangle',
    name: 'Laser Triangle',
    thaiName: 'สามเหลี่ยมเรืองแสง',
    type: 'ground',
    width: 38,
    height: 38,
    color: '#9d4edd',
    draw: (ctx, x, y, w, h, tick) => {
      const glow = Math.sin(tick * 0.1) * 3 + 3;
      ctx.shadowColor = '#9d4edd';
      ctx.shadowBlur = glow;
      ctx.strokeStyle = '#9d4edd';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(x + w / 2, y + 2);
      ctx.lineTo(x + w - 2, y + h - 2);
      ctx.lineTo(x + 2, y + h - 2);
      ctx.closePath();
      ctx.stroke();
      ctx.shadowBlur = 0; // reset
      // Core inner triangle
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(x + w / 2, y + 10);
      ctx.lineTo(x + w - 10, y + h - 6);
      ctx.lineTo(x + 10, y + h - 6);
      ctx.closePath();
      ctx.fill();
    }
  },
  // 5. CRT Monitor
  {
    id: 'crt_monitor',
    name: 'CRT Monitor',
    thaiName: 'จอตู้ CRT',
    type: 'ground',
    width: 48,
    height: 42,
    color: '#a1a1aa',
    draw: (ctx, x, y, w, h, tick) => {
      // Case
      ctx.fillStyle = '#27272a';
      ctx.fillRect(x, y, w, h - 4);
      ctx.fillStyle = '#3f3f46';
      ctx.fillRect(x + 2, y + 2, w - 4, h - 8);
      // Screen bezel
      ctx.fillStyle = '#18181b';
      ctx.fillRect(x + 6, y + 6, w - 12, h - 16);
      // Screen glow
      ctx.fillStyle = '#052e16';
      ctx.fillRect(x + 8, y + 8, w - 16, h - 20);
      // Glitch lines
      ctx.fillStyle = '#22c55e';
      const lineY = (tick * 1.5) % (h - 22);
      ctx.fillRect(x + 8, y + 8 + lineY, w - 16, 2);
      // Stand
      ctx.fillStyle = '#52525b';
      ctx.fillRect(x + w / 2 - 8, y + h - 4, 16, 4);
    }
  },
  // 6. Atari Joystick
  {
    id: 'atari_joystick',
    name: 'Arcade Joystick',
    thaiName: 'จอยสติ๊กย้อนยุค',
    type: 'ground',
    width: 32,
    height: 44,
    color: '#ef4444',
    draw: (ctx, x, y, w, h) => {
      // Base
      ctx.fillStyle = '#18181b';
      ctx.fillRect(x + 4, y + h - 16, w - 8, 16);
      // Red Fire Button
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(x + 8, y + h - 12, 6, 6);
      // Shaft
      ctx.fillStyle = '#71717a';
      ctx.fillRect(x + w / 2 - 2, y + 10, 4, h - 26);
      // Stick ball
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(x + w / 2, y + 8, 8, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  // 7. Boombox
  {
    id: 'boombox',
    name: 'Power Boombox',
    thaiName: 'วิทยุพกพาบุมบ็อกซ์',
    type: 'ground',
    width: 54,
    height: 36,
    color: '#f59e0b',
    draw: (ctx, x, y, w, h, tick) => {
      // Main Body
      ctx.fillStyle = '#3f3f46';
      ctx.fillRect(x, y + 4, w, h - 4);
      // Handle
      ctx.strokeStyle = '#52525b';
      ctx.lineWidth = 3;
      ctx.strokeRect(x + 8, y, w - 16, 8);
      // Speakers
      const sizeMod = Math.sin(tick * 0.4) * 2;
      ctx.fillStyle = '#18181b';
      ctx.beginPath();
      ctx.arc(x + 12, y + h / 2 + 2, 8, 0, Math.PI * 2);
      ctx.arc(x + w - 12, y + h / 2 + 2, 8, 0, Math.PI * 2);
      ctx.fill();
      // Bass core
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(x + 12, y + h / 2 + 2, Math.max(2, 4 + sizeMod), 0, Math.PI * 2);
      ctx.arc(x + w - 12, y + h / 2 + 2, Math.max(2, 4 + sizeMod), 0, Math.PI * 2);
      ctx.fill();
      // Tape area
      ctx.fillStyle = '#71717a';
      ctx.fillRect(x + w / 2 - 10, y + h / 2 - 4, 20, 12);
    }
  },
  // 8. Retro Sunglasses
  {
    id: 'retro_shades',
    name: '80s Shutter Shades',
    thaiName: 'แว่นกันแดดสุดคูล',
    type: 'flying',
    width: 46,
    height: 24,
    color: '#ec4899',
    draw: (ctx, x, y, w, h) => {
      ctx.fillStyle = '#ec4899';
      // Left rim
      ctx.fillRect(x, y, w / 2 - 2, h);
      // Right rim
      ctx.fillRect(x + w / 2 + 2, y, w / 2 - 2, h);
      // Bridge
      ctx.fillRect(x + w / 2 - 3, y + 4, 6, 3);
      // Shutter lines (cutout)
      ctx.fillStyle = '#0b0c10';
      ctx.fillRect(x + 4, y + 6, w / 2 - 10, 2);
      ctx.fillRect(x + 4, y + 12, w / 2 - 10, 2);
      ctx.fillRect(x + 4, y + 18, w / 2 - 10, 2);

      ctx.fillRect(x + w / 2 + 6, y + 6, w / 2 - 10, 2);
      ctx.fillRect(x + w / 2 + 6, y + 12, w / 2 - 10, 2);
      ctx.fillRect(x + w / 2 + 6, y + 18, w / 2 - 10, 2);
    }
  },
  // 9. Laser Grid Glitch
  {
    id: 'grid_glitch',
    name: 'Grid Glitch',
    thaiName: 'บั๊กตารางเลเซอร์',
    type: 'bouncing',
    width: 32,
    height: 32,
    color: '#10b981',
    draw: (ctx, x, y, w, h, tick) => {
      // Jittering glitch block
      const jitterX = Math.sin(tick * 0.8) * 3;
      const jitterY = Math.cos(tick * 0.8) * 3;
      ctx.fillStyle = '#10b981';
      ctx.fillRect(x + jitterX, y + jitterY, w, h);
      ctx.fillStyle = '#a7f3d0';
      ctx.fillRect(x + jitterX + 4, y + jitterY + 4, w - 8, h - 8);
      // RGB overlay
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(x + jitterX - 2, y + jitterY - 2, 4, h);
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(x + jitterX + w - 2, y + jitterY + 2, 4, h);
    }
  },
  // 10. Rubik's Cube
  {
    id: 'rubik_cube',
    name: 'Rubik\'s Cube',
    thaiName: 'รูบิกสามมิติ',
    type: 'ground',
    width: 36,
    height: 36,
    color: '#ffe600',
    draw: (ctx, x, y, w, h, tick) => {
      // Draw isometric pixel style rubik
      ctx.fillStyle = '#000000';
      ctx.fillRect(x, y, w, h);
      // Grid of squares
      const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#ffffff', '#eab308'];
      const size = (w - 8) / 3;
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const idx = (r * 3 + c + Math.floor(tick / 15)) % colors.length;
          ctx.fillStyle = colors[idx];
          ctx.fillRect(x + 2 + c * (size + 1), y + 2 + r * (size + 1), size, size);
        }
      }
    }
  },
  // 11. Pixel Ghost
  {
    id: 'pixel_ghost',
    name: 'Pinky Ghost',
    thaiName: 'ผีพิกเซลสีชมพู',
    type: 'flying',
    width: 36,
    height: 36,
    color: '#ec4899',
    draw: (ctx, x, y, w, h, tick) => {
      // Classic ghost sprite
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.arc(x + w / 2, y + w / 2, w / 2, Math.PI, 0, false);
      ctx.fillRect(x, y + w / 2, w, h / 2 - 4);
      ctx.fill();

      // Tentacles wavy bottom
      const wave = Math.sin(tick * 0.3) > 0 ? 0 : 4;
      ctx.fillStyle = '#ec4899';
      ctx.fillRect(x, y + h - 6, 8, 6 - wave);
      ctx.fillRect(x + 10, y + h - 6, 8, wave + 2);
      ctx.fillRect(x + 20, y + h - 6, 8, 6 - wave);
      ctx.fillRect(x + 28, y + h - 6, 8, wave + 2);

      // Eyes
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 6, y + 10, 8, 8);
      ctx.fillRect(x + 20, y + 10, 8, 8);
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(x + 10, y + 12, 4, 4);
      ctx.fillRect(x + 24, y + 12, 4, 4);
    }
  },
  // 12. Sega Controller
  {
    id: 'sega_controller',
    name: '16-Bit Controller',
    thaiName: 'จอยเซก้าสีดำ',
    type: 'ground',
    width: 48,
    height: 30,
    color: '#3f3f46',
    draw: (ctx, x, y, w, h) => {
      // Oval controller body
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(x, y + 4, w, h - 4);
      ctx.fillStyle = '#27272a';
      ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
      // D-Pad
      ctx.fillStyle = '#090d16';
      ctx.fillRect(x + 8, y + 10, 10, 10);
      ctx.fillStyle = '#71717a';
      ctx.fillRect(x + 12, y + 8, 2, 14);
      ctx.fillRect(x + 6, y + 14, 14, 2);
      // Action Buttons
      ctx.fillStyle = '#ff007f';
      ctx.beginPath();
      ctx.arc(x + 30, y + 16, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#00f0ff';
      ctx.beginPath();
      ctx.arc(x + 36, y + 12, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffe600';
      ctx.beginPath();
      ctx.arc(x + 42, y + 16, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  // 13. Pac-Fruit
  {
    id: 'pac_fruit',
    name: 'Retro Cherries',
    thaiName: 'ผลไม้เชอร์รี่สีแดง',
    type: 'flying',
    width: 32,
    height: 32,
    color: '#ef4444',
    draw: (ctx, x, y, w, h) => {
      // Cherries
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(x + 8, y + 20, 7, 0, Math.PI * 2);
      ctx.arc(x + 22, y + 24, 7, 0, Math.PI * 2);
      ctx.fill();
      // Highlight
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 6, y + 16, 3, 3);
      ctx.fillRect(x + 20, y + 20, 3, 3);
      // Stems
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + 8, y + 13);
      ctx.quadraticCurveTo(x + 16, y + 4, x + 24, y + 4);
      ctx.moveTo(x + 22, y + 17);
      ctx.quadraticCurveTo(x + 20, y + 8, x + 24, y + 4);
      ctx.stroke();
      // Leaf
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(x + 16, y + 4, 8, 4);
    }
  },
  // 14. Neon Pyramid
  {
    id: 'neon_pyramid',
    name: 'Cyber Pyramid',
    thaiName: 'พีระมิดสีม่วงเรืองแสง',
    type: 'ground',
    width: 44,
    height: 44,
    color: '#d946ef',
    draw: (ctx, x, y, w, h, tick) => {
      const glow = Math.sin(tick * 0.2) * 4 + 4;
      ctx.shadowColor = '#d946ef';
      ctx.shadowBlur = glow;
      // Layers
      for (let i = 0; i < 4; i++) {
        const width = w - i * 10;
        const height = 10;
        const layerX = x + i * 5;
        const layerY = y + h - (i + 1) * 11;
        ctx.fillStyle = i % 2 === 0 ? '#d946ef' : '#86198f';
        ctx.fillRect(layerX, layerY, width, height);
      }
      ctx.shadowBlur = 0;
    }
  },
  // 15. Cyber Car
  {
    id: 'cyber_car',
    name: 'Time Cruiser',
    thaiName: 'รถซิ่ง DeLorean',
    type: 'speeding',
    width: 60,
    height: 28,
    color: '#94a3b8',
    draw: (ctx, x, y, w, h, tick) => {
      // Body (DeLorean style)
      ctx.fillStyle = '#64748b';
      ctx.fillRect(x, y + 10, w, h - 16);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(x + 4, y + 6, w - 12, 10);
      // Windshield
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(x + 36, y + 8, 14, 6);
      // Back thruster glow
      ctx.fillStyle = '#ff007f';
      ctx.fillRect(x - 4, y + 12, 4, 6);
      if (tick % 6 < 3) {
        ctx.fillRect(x - 8, y + 14, 4, 2);
      }
      // Wheels
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(x + 12, y + h - 4, 6, 0, Math.PI * 2);
      ctx.arc(x + w - 14, y + h - 4, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#00f0ff';
      ctx.beginPath();
      ctx.arc(x + 12, y + h - 4, 2, 0, Math.PI * 2);
      ctx.arc(x + w - 14, y + h - 4, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  // 16. Synthesizer Key
  {
    id: 'synth_key',
    name: 'Synthesizer Key',
    thaiName: 'คีย์บอร์ดซินธิไซเซอร์',
    type: 'ground',
    width: 38,
    height: 48,
    color: '#ffffff',
    draw: (ctx, x, y, w, h) => {
      ctx.fillStyle = '#111';
      ctx.fillRect(x, y, w, h);
      // White keys
      const kw = (w - 4) / 4;
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = '#fff';
        ctx.fillRect(x + 1 + i * (kw + 1), y + 2, kw, h - 4);
      }
      // Black keys
      ctx.fillStyle = '#000';
      ctx.fillRect(x + kw - 2, y + 2, 4, h * 0.6);
      ctx.fillRect(x + kw * 2 - 1, y + 2, 4, h * 0.6);
      ctx.fillRect(x + kw * 3, y + 2, 4, h * 0.6);
    }
  },
  // 17. RGB Glitch Block
  {
    id: 'rgb_block',
    name: 'Chromatic Glitch',
    thaiName: 'บล็อกสัญญาณ RGB เพี้ยน',
    type: 'bouncing',
    width: 32,
    height: 32,
    color: '#ff0000',
    draw: (ctx, x, y, w, h, tick) => {
      const shift = Math.sin(tick * 0.5) * 4;
      // Red layer
      ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
      ctx.fillRect(x - shift, y, w, h);
      // Green layer
      ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
      ctx.fillRect(x, y - shift, w, h);
      // Blue layer
      ctx.fillStyle = 'rgba(0, 0, 255, 0.8)';
      ctx.fillRect(x + shift, y + shift, w, h);
    }
  },
  // 18. Diskette 5.25"
  {
    id: 'diskette_525',
    name: '5.25" Floppy',
    thaiName: 'แผ่นดิสเก็ตต์ 5.25 นิ้ว',
    type: 'ground',
    width: 48,
    height: 48,
    color: '#18181b',
    draw: (ctx, x, y, w, h) => {
      // Floppy shell
      ctx.fillStyle = '#18181b';
      ctx.fillRect(x, y, w, h);
      // Center spindle hole
      ctx.fillStyle = '#0b0c10';
      ctx.beginPath();
      ctx.arc(x + w / 2, y + h / 2, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffe600';
      ctx.beginPath();
      ctx.arc(x + w / 2, y + h / 2, 4, 0, Math.PI * 2);
      ctx.fill();
      // Read hole index
      ctx.fillStyle = '#ffe600';
      ctx.fillRect(x + w / 2 - 3, y + h - 14, 6, 10);
      // White label
      ctx.fillStyle = '#f4f4f5';
      ctx.fillRect(x + 4, y + 4, w - 8, 12);
    }
  },
  // 19. VHS Tape
  {
    id: 'vhs_tape',
    name: 'VHS Tape',
    thaiName: 'ม้วนวิดีโอ VHS',
    type: 'ground',
    width: 52,
    height: 30,
    color: '#090d16',
    draw: (ctx, x, y, w, h) => {
      ctx.fillStyle = '#18181b';
      ctx.fillRect(x, y, w, h);
      // Two windows
      ctx.fillStyle = '#ffe600';
      ctx.fillRect(x + 6, y + 6, 14, h - 12);
      ctx.fillRect(x + w - 20, y + 6, 14, h - 12);
      // Tape coil details
      ctx.fillStyle = '#020617';
      ctx.beginPath();
      ctx.arc(x + 13, y + h / 2, 5, 0, Math.PI * 2);
      ctx.arc(x + w - 13, y + h / 2, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  // 20. Space Invader
  {
    id: 'space_invader',
    name: 'Retro Invader',
    thaiName: 'เอเลี่ยนบุกอวกาศ',
    type: 'flying',
    width: 36,
    height: 28,
    color: '#00f0ff',
    draw: (ctx, x, y, w, h, tick) => {
      const frame = Math.floor(tick / 15) % 2;
      // Grid for a classic retro invader
      const invader1 = [
        [0,0,1,0,0,0,0,1,0,0],
        [0,0,0,1,0,0,1,0,0,0],
        [0,0,1,1,1,1,1,1,0,0],
        [0,1,1,0,1,1,0,1,1,0],
        [1,1,1,1,1,1,1,1,1,1],
        [1,0,1,1,1,1,1,1,0,1],
        [1,0,1,0,0,0,0,1,0,1],
        [0,0,0,1,1,1,1,0,0,0]
      ];
      const invader2 = [
        [0,0,1,0,0,0,0,1,0,0],
        [1,0,0,1,0,0,1,0,0,1],
        [1,0,1,1,1,1,1,1,0,1],
        [1,1,1,0,1,1,0,1,1,1],
        [0,1,1,1,1,1,1,1,1,0],
        [0,0,1,1,1,1,1,1,0,0],
        [0,1,0,0,0,0,0,0,1,0],
        [1,0,0,0,0,0,0,0,0,1]
      ];
      const grid = frame === 0 ? invader1 : invader2;
      drawPixelGrid(ctx, x, y, w, h, grid, ['#00f0ff']);
    }
  },
  // 21. Neon Palm Tree
  {
    id: 'neon_palm_tree',
    name: 'Cyber Palm',
    thaiName: 'ต้นมะพร้าวส้มสะท้อนแสง',
    type: 'ground',
    width: 40,
    height: 64,
    color: '#ff4d00',
    draw: (ctx, x, y, w, h, tick) => {
      const shake = Math.sin(tick * 0.15) * 2;
      // Trunk
      ctx.fillStyle = '#ff007f';
      ctx.fillRect(x + w / 2 - 3 + shake / 2, y + h / 3, 6, h * 2 / 3);
      // Palms (curved)
      ctx.fillStyle = '#ff7b00';
      ctx.fillRect(x + w / 2 - 16 + shake, y + 12, 32, 6);
      ctx.fillRect(x + w / 2 - 20 + shake, y + 18, 40, 4);
      ctx.fillStyle = '#ffeb3b';
      ctx.fillRect(x + w / 2 - 8 + shake, y + 6, 16, 6);
    }
  },
  // 22. 8-Bit Heart
  {
    id: '8bit_heart',
    name: 'Pixel Life',
    thaiName: 'หัวใจแปดบิตสีแดง',
    type: 'flying',
    width: 32,
    height: 32,
    color: '#ef4444',
    draw: (ctx, x, y, w, h, tick) => {
      const scale = 1 + Math.sin(tick * 0.2) * 0.1;
      const sw = w * scale;
      const sh = h * scale;
      const sx = x - (sw - w) / 2;
      const sy = y - (sh - h) / 2;
      // Classic 8-bit heart grid
      const grid = [
        [0,0,1,1,0,0,1,1,0,0],
        [0,1,1,1,1,0,1,1,1,0],
        [1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1],
        [0,1,1,1,1,1,1,1,1,0],
        [0,0,1,1,1,1,1,1,0,0],
        [0,0,0,1,1,1,1,0,0,0],
        [0,0,0,0,1,1,0,0,0,0]
      ];
      drawPixelGrid(ctx, sx, sy, sw, sh, grid, ['#ef4444']);
    }
  },
  // 23. Neon Helix
  {
    id: 'neon_helix',
    name: 'Neon Sine Wave',
    thaiName: 'เกลียวคลื่นสีฟ้า',
    type: 'flying',
    width: 44,
    height: 32,
    color: '#06b6d4',
    draw: (ctx, x, y, w, h, tick) => {
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 4;
      ctx.beginPath();
      for (let i = 0; i <= w; i += 4) {
        const py = y + h / 2 + Math.sin((tick * 0.15) + (i * 0.15)) * (h / 3);
        if (i === 0) ctx.moveTo(x + i, py);
        else ctx.lineTo(x + i, py);
      }
      ctx.stroke();
    }
  },
  // 24. Cyber Droid
  {
    id: 'cyber_droid',
    name: 'Robo Sentry',
    thaiName: 'หุ่นยนต์จิ๋วติดปีก',
    type: 'flying',
    width: 34,
    height: 34,
    color: '#a855f7',
    draw: (ctx, x, y, w, h, tick) => {
      const wingY = Math.sin(tick * 0.5) * 6;
      // Body
      ctx.fillStyle = '#6b21a8';
      ctx.fillRect(x + 6, y + 8, w - 12, h - 16);
      ctx.fillStyle = '#a855f7';
      ctx.fillRect(x + 8, y + 10, w - 16, h - 20);
      // Cyber eye
      ctx.fillStyle = '#ff007f';
      ctx.fillRect(x + w / 2 - 3, y + 14, 6, 4);
      // Wings
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(x, y + 12 + wingY, 6, 4);
      ctx.fillRect(x + w - 6, y + 12 - wingY, 6, 4);
    }
  },
  // 25. Acid Face
  {
    id: 'acid_face',
    name: 'Rave Smiley',
    thaiName: 'ไอคอนหน้ายิ้มเหลืองนีออน',
    type: 'bouncing',
    width: 34,
    height: 34,
    color: '#eab308',
    draw: (ctx, x, y, w, h, tick) => {
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.arc(x + w / 2, y + h / 2, w / 2, 0, Math.PI * 2);
      ctx.fill();
      // Face elements (80s acid smiley)
      ctx.fillStyle = '#000';
      // Eyes
      ctx.fillRect(x + 8, y + 10, 4, 8);
      ctx.fillRect(x + w - 12, y + 10, 4, 8);
      // Mouth
      ctx.beginPath();
      ctx.arc(x + w / 2, y + h / 2 + 2, 8, 0, Math.PI, false);
      ctx.stroke();
    }
  },
  // 26. Laser Column
  {
    id: 'laser_column',
    name: 'Laser Barrier',
    thaiName: 'เสาเลเซอร์พิฆาต',
    type: 'ceiling',
    width: 24,
    height: 64,
    color: '#ef4444',
    draw: (ctx, x, y, w, h, tick) => {
      // Emitter
      ctx.fillStyle = '#475569';
      ctx.fillRect(x + 2, y, w - 4, 12);
      // Core beam
      const pulse = Math.sin(tick * 0.4) * 3;
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#ff007f';
      ctx.fillRect(x + w / 2 - 4 - pulse / 2, y + 12, 8 + pulse, h - 12);
      ctx.fillStyle = '#fff';
      ctx.fillRect(x + w / 2 - 2, y + 12, 4, h - 12);
      ctx.shadowBlur = 0;
    }
  },
  // 27. Pixel Skull
  {
    id: 'pixel_skull',
    name: 'Pixel Doom',
    thaiName: 'หัวกะโหลกโจรสลัด',
    type: 'ground',
    width: 36,
    height: 38,
    color: '#f8fafc',
    draw: (ctx, x, y, w, h) => {
      // Procedural pixel skull
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(x + 6, y, w - 12, h - 8);
      ctx.fillRect(x + 10, y + h - 8, w - 20, 8);
      // Eyes
      ctx.fillStyle = '#0b0c10';
      ctx.fillRect(x + 10, y + 10, 6, 6);
      ctx.fillRect(x + w - 16, y + 10, 6, 6);
      // Nose
      ctx.fillRect(x + w / 2 - 2, y + 18, 4, 4);
      // Teeth details
      ctx.fillStyle = '#475569';
      ctx.fillRect(x + 14, y + h - 6, 2, 6);
      ctx.fillRect(x + 18, y + h - 6, 2, 6);
      ctx.fillRect(x + 22, y + h - 6, 2, 6);
    }
  },
  // 28. Floppy Spinner
  {
    id: 'floppy_spinner',
    name: 'Core Wheel',
    thaiName: 'จานหมุนในดิสก์',
    type: 'bouncing',
    width: 32,
    height: 32,
    color: '#00f0ff',
    draw: (ctx, x, y, w, h, tick) => {
      ctx.save();
      ctx.translate(x + w / 2, y + h / 2);
      ctx.rotate((tick * 0.15));
      // Outer ring
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 4;
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      // Spokes
      ctx.fillStyle = '#ff007f';
      ctx.fillRect(-2, -h / 2, 4, h);
      ctx.fillRect(-w / 2, -2, w, 4);
      ctx.restore();
    }
  },
  // 29. Neon Spark
  {
    id: 'neon_spark',
    name: 'Volt Spark',
    thaiName: 'ประกายไฟสายนีออน',
    type: 'flying',
    width: 32,
    height: 32,
    color: '#eab308',
    draw: (ctx, x, y, w, h, tick) => {
      ctx.fillStyle = tick % 10 < 5 ? '#eab308' : '#ff007f';
      ctx.beginPath();
      ctx.moveTo(x + w / 2, y);
      ctx.lineTo(x + w * 0.75, y + h * 0.25);
      ctx.lineTo(x + w, y + h / 2);
      ctx.lineTo(x + w * 0.75, y + h * 0.75);
      ctx.lineTo(x + w / 2, y + h);
      ctx.lineTo(x + w * 0.25, y + h * 0.75);
      ctx.lineTo(x, y + h / 2);
      ctx.lineTo(x + w * 0.25, y + h * 0.25);
      ctx.closePath();
      ctx.fill();
    }
  },
  // 30. Gameboy DMG
  {
    id: 'gameboy_dmg',
    name: '8-Bit Console',
    thaiName: 'เครื่องเกมบอยโบราณ',
    type: 'ground',
    width: 36,
    height: 52,
    color: '#94a3b8',
    draw: (ctx, x, y, w, h) => {
      // Body
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(x, y, w, h);
      // Screen bezel
      ctx.fillStyle = '#475569';
      ctx.fillRect(x + 4, y + 4, w - 8, 20);
      // Green matrix LCD
      ctx.fillStyle = '#859a51';
      ctx.fillRect(x + 6, y + 6, w - 12, 16);
      // Pixel elements on screen
      ctx.fillStyle = '#2f3c1f';
      ctx.fillRect(x + 10, y + 10, 4, 4);
      ctx.fillRect(x + w - 14, y + 12, 4, 4);
      // D-Pad
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x + 6, y + 32, 10, 10);
      // Red Buttons (A/B)
      ctx.fillStyle = '#be123c';
      ctx.beginPath();
      ctx.arc(x + 24, y + 40, 3, 0, Math.PI * 2);
      ctx.arc(x + 30, y + 36, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  // 31. Walkman
  {
    id: 'walkman',
    name: 'Cassette Player',
    thaiName: 'เครื่องวอล์กแมนสีน้ำเงิน',
    type: 'ground',
    width: 38,
    height: 50,
    color: '#1d4ed8',
    draw: (ctx, x, y, w, h) => {
      // Walkman body
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = '#1d4ed8';
      ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
      // Window with rotating gears (fake tape)
      ctx.fillStyle = '#111';
      ctx.fillRect(x + 6, y + 8, w - 12, 18);
      ctx.fillStyle = '#ffe600';
      ctx.beginPath();
      ctx.arc(x + 14, y + 17, 3, 0, Math.PI * 2);
      ctx.arc(x + w - 14, y + 17, 3, 0, Math.PI * 2);
      ctx.fill();
      // Play buttons on side
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(x + w - 2, y + 12, 2, 16);
    }
  },
  // 32. Neon Grid Wave
  {
    id: 'grid_wave',
    name: 'Synth Horizon',
    thaiName: 'คลื่นตารางมิติสีม่วง',
    type: 'bouncing',
    width: 48,
    height: 32,
    color: '#c084fc',
    draw: (ctx, x, y, w, h, tick) => {
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 2;
      // Grid mesh
      for (let i = 0; i < w; i += 12) {
        ctx.beginPath();
        ctx.moveTo(x + i, y);
        ctx.lineTo(x + i + Math.sin(tick * 0.1) * 4, y + h);
        ctx.stroke();
      }
      for (let j = 0; j < h; j += 8) {
        ctx.beginPath();
        ctx.moveTo(x, y + j);
        ctx.lineTo(x + w, y + j);
        ctx.stroke();
      }
    }
  },
  // 33. Pixel Bat
  {
    id: 'pixel_bat',
    name: '8-Bit Vampire',
    thaiName: 'ค้างคาวพิกเซลขยับปีก',
    type: 'flying',
    width: 36,
    height: 24,
    color: '#701a75',
    draw: (ctx, x, y, w, h, tick) => {
      const flap = Math.floor(tick / 10) % 2;
      ctx.fillStyle = '#4a044e';
      ctx.fillRect(x + w / 2 - 4, y + 4, 8, 12); // body
      ctx.fillStyle = '#ffe600'; // eyes
      ctx.fillRect(x + w / 2 - 3, y + 6, 2, 2);
      ctx.fillRect(x + w / 2 + 1, y + 6, 2, 2);

      ctx.fillStyle = '#701a75';
      if (flap === 0) {
        // Wings up
        ctx.fillRect(x, y, w / 2 - 4, 8);
        ctx.fillRect(x + w / 2 + 4, y, w / 2 - 4, 8);
      } else {
        // Wings down
        ctx.fillRect(x, y + 10, w / 2 - 4, 8);
        ctx.fillRect(x + w / 2 + 4, y + 10, w / 2 - 4, 8);
      }
    }
  },
  // 34. Hair Spray
  {
    id: 'hair_spray',
    name: '80s Hair Spray',
    thaiName: 'กระป๋องสเปรย์เซ็ตผม',
    type: 'ground',
    width: 26,
    height: 52,
    color: '#db2777',
    draw: (ctx, x, y, w, h, tick) => {
      // Bottle
      ctx.fillStyle = '#9d174d';
      ctx.fillRect(x, y + 12, w, h - 12);
      ctx.fillStyle = '#db2777';
      ctx.fillRect(x + 2, y + 14, w - 4, h - 16);
      // Cap/Nozzle
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(x + w / 2 - 4, y + 4, 8, 8);
      // Spray particles
      if (tick % 6 < 3) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fillRect(x - 8, y + 2, 6, 6);
        ctx.fillRect(x - 14, y - 2, 8, 8);
      }
    }
  },
  // 35. Dinosaur Run
  {
    id: 'dino_run',
    name: 'Chrome Dino',
    thaiName: 'ไดโนเสาร์ทีเร็กซ์สีเขียว',
    type: 'speeding',
    width: 44,
    height: 44,
    color: '#22c55e',
    draw: (ctx, x, y, w, h, tick) => {
      const step = Math.floor(tick / 8) % 2;
      ctx.fillStyle = '#22c55e';
      // Head
      ctx.fillRect(x + w - 24, y, 20, 14);
      // Eye
      ctx.fillStyle = '#000';
      ctx.fillRect(x + w - 18, y + 4, 3, 3);
      // Body
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(x + 4, y + 14, w - 16, 18);
      // Tail
      ctx.fillRect(x, y + 16, 6, 8);
      // Legs
      if (step === 0) {
        ctx.fillRect(x + 10, y + 32, 4, 12);
        ctx.fillRect(x + w - 18, y + 32, 4, 8);
      } else {
        ctx.fillRect(x + 10, y + 32, 4, 8);
        ctx.fillRect(x + w - 18, y + 32, 4, 12);
      }
    }
  },
  // 36. Retro Soda
  {
    id: 'retro_soda',
    name: 'Neon Cola',
    thaiName: 'กระป๋องน้ำอัดลมสะท้อนแสง',
    type: 'bouncing',
    width: 28,
    height: 42,
    color: '#38bdf8',
    draw: (ctx, x, y, w, h) => {
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
      // Retro wave stripes on can
      ctx.fillStyle = '#ec4899';
      ctx.fillRect(x + 2, y + 14, w - 4, 4);
      ctx.fillStyle = '#ffe600';
      ctx.fillRect(x + 2, y + 22, w - 4, 4);
    }
  },
  // 37. Neon Dice
  {
    id: 'neon_dice',
    name: 'Laser Dice',
    thaiName: 'ลูกเต๋าเลเซอร์หมุน',
    type: 'flying',
    width: 32,
    height: 32,
    color: '#ff007f',
    draw: (ctx, x, y, w, h, tick) => {
      ctx.save();
      ctx.translate(x + w / 2, y + h / 2);
      ctx.rotate(tick * 0.1);
      ctx.fillStyle = '#27272a';
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeStyle = '#ff007f';
      ctx.lineWidth = 3;
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      // Dice dots (procedural based on time)
      ctx.fillStyle = '#00f0ff';
      const frame = Math.floor(tick / 30) % 3;
      if (frame === 0) {
        ctx.fillRect(-3, -3, 6, 6);
      } else if (frame === 1) {
        ctx.fillRect(-10, -10, 6, 6);
        ctx.fillRect(4, 4, 6, 6);
      } else {
        ctx.fillRect(-10, -10, 6, 6);
        ctx.fillRect(-3, -3, 6, 6);
        ctx.fillRect(4, 4, 6, 6);
      }
      ctx.restore();
    }
  },
  // 38. Cyber Glasses
  {
    id: 'cyber_glasses',
    name: '3D Glasses',
    thaiName: 'แว่นตาสามมิติ',
    type: 'flying',
    width: 44,
    height: 20,
    color: '#ef4444',
    draw: (ctx, x, y, w, h) => {
      // Frame
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x, y, w, h);
      // Lenses
      ctx.fillStyle = '#ef4444'; // Red Left
      ctx.fillRect(x + 3, y + 3, w / 2 - 5, h - 6);
      ctx.fillStyle = '#06b6d4'; // Cyan Right
      ctx.fillRect(x + w / 2 + 2, y + 3, w / 2 - 5, h - 6);
      // Bridge detail
      ctx.fillStyle = '#000000';
      ctx.fillRect(x + w / 2 - 2, y + 3, 4, h - 10);
    }
  },
  // 39. Floppy Shadow
  {
    id: 'floppy_shadow',
    name: 'Byte Phantom',
    thaiName: 'เงาผีดิสเก็ตต์',
    type: 'flying',
    width: 38,
    height: 38,
    color: '#6366f1',
    draw: (ctx, x, y, w, h, tick) => {
      const alpha = 0.5 + Math.sin(tick * 0.2) * 0.2;
      ctx.fillStyle = `rgba(99, 102, 241, ${alpha})`;
      ctx.fillRect(x, y, w, h);
      // Ghostly cutouts
      ctx.fillStyle = '#0b0c10';
      ctx.fillRect(x + 6, y + 6, w - 12, 8);
    }
  },
  // 40. Retro Phone
  {
    id: 'retro_phone',
    name: 'Brick Phone',
    thaiName: 'โทรศัพท์กระติกน้ำโบราณ',
    type: 'ground',
    width: 24,
    height: 56,
    color: '#475569',
    draw: (ctx, x, y, w, h) => {
      // Body
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x, y + 10, w, h - 10);
      ctx.fillStyle = '#475569';
      ctx.fillRect(x + 2, y + 12, w - 4, h - 14);
      // Screen
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(x + 4, y + 16, w - 8, 10);
      // Buttons keypad
      ctx.fillStyle = '#94a3b8';
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 3; c++) {
          ctx.fillRect(x + 4 + c * 5, y + 30 + r * 5, 3, 3);
        }
      }
      // Antenna
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x + 4, y, 3, 10);
    }
  },
  // 41. Arcade Token
  {
    id: 'arcade_token',
    name: 'Arcade Token',
    thaiName: 'เหรียญโทเคนอาร์เคด',
    type: 'flying',
    width: 32,
    height: 32,
    color: '#fbbf24',
    draw: (ctx, x, y, w, h, tick) => {
      const spin = Math.abs(Math.sin(tick * 0.1));
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.ellipse(x + w / 2, y + h / 2, (w / 2) * spin, h / 2, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.ellipse(x + w / 2, y + h / 2, (w / 2 - 4) * spin, h / 2 - 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // "PLAY" pixel star inside
      ctx.fillStyle = '#78350f';
      ctx.fillRect(x + w / 2 - 2, y + h / 2 - 4, 4, 8);
    }
  },
  // 42. Vaporwave Sun
  {
    id: 'vapor_sun',
    name: 'Horizon Sun',
    thaiName: 'ดวงอาทิตย์ลายเส้น',
    type: 'flying',
    width: 50,
    height: 40,
    color: '#f97316',
    draw: (ctx, x, y, w, h) => {
      // Retro sun with horizontal cutout lines
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(x + w / 2, y + h, w / 2, Math.PI, 0, false);
      ctx.fill();
      // Cutout lines
      ctx.fillStyle = '#0b0c10';
      ctx.fillRect(x, y + h - 4, w, 2);
      ctx.fillRect(x, y + h - 10, w, 3);
      ctx.fillRect(x, y + h - 18, w, 4);
      ctx.fillRect(x, y + h - 28, w, 5);
    }
  },
  // 43. RGB Splitter
  {
    id: 'rgb_splitter',
    name: 'RGB Divider',
    thaiName: 'ตัวแบ่งแสงสี',
    type: 'flying',
    width: 32,
    height: 32,
    color: '#ff007f',
    draw: (ctx, x, y, w, h, tick) => {
      const angle = (tick * 0.1) % (Math.PI * 2);
      ctx.save();
      ctx.translate(x + w / 2, y + h / 2);
      ctx.rotate(angle);
      // Red dot
      ctx.fillStyle = '#ff0000';
      ctx.beginPath(); ctx.arc(0, -10, 4, 0, Math.PI * 2); ctx.fill();
      // Green dot
      ctx.fillStyle = '#00ff00';
      ctx.beginPath(); ctx.arc(-8, 6, 4, 0, Math.PI * 2); ctx.fill();
      // Blue dot
      ctx.fillStyle = '#0000ff';
      ctx.beginPath(); ctx.arc(8, 6, 4, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
  },
  // 44. Laser Shield
  {
    id: 'laser_shield',
    name: 'Neon Shield',
    thaiName: 'โล่ป้องกันนีออน',
    type: 'ground',
    width: 32,
    height: 36,
    color: '#38bdf8',
    draw: (ctx, x, y, w, h, tick) => {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 4;
      const pulse = Math.sin(tick * 0.1) * 3;
      ctx.shadowBlur = pulse + 4;
      ctx.shadowColor = '#38bdf8';
      ctx.strokeRect(x, y, w, h);
      ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.fillRect(x, y, w, h);
      ctx.shadowBlur = 0;
    }
  },
  // 45. Yoyo Pixel
  {
    id: 'yoyo_pixel',
    name: '80s Yoyo',
    thaiName: 'โยโย่สีรุ้งแกว่ง',
    type: 'bouncing',
    width: 32,
    height: 32,
    color: '#a855f7',
    draw: (ctx, x, y, w, h, tick) => {
      ctx.fillStyle = '#a855f7';
      ctx.beginPath();
      ctx.arc(x + w / 2, y + h / 2, w / 2, 0, Math.PI * 2);
      ctx.fill();
      // Stripes
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x + w / 2, y + h / 2, w / 3, 0, Math.PI * 2);
      ctx.stroke();
    }
  },
  // 46. Boombox Speaker
  {
    id: 'boombox_speaker',
    name: 'Giga Speaker',
    thaiName: 'ลำโพงยักษ์สั่นสะเทือน',
    type: 'ground',
    width: 44,
    height: 44,
    color: '#0f172a',
    draw: (ctx, x, y, w, h, tick) => {
      const scale = 1 + Math.sin(tick * 0.5) * 0.08;
      const sw = w * scale;
      const sh = h * scale;
      const sx = x - (sw - w) / 2;
      const sy = y - (sh - h) / 2;

      ctx.fillStyle = '#334155';
      ctx.fillRect(sx, sy, sw, sh);
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(sx + sw / 2, sy + sh / 2, sw / 2 - 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.arc(sx + sw / 2, sy + sh / 2, sw / 3 - 2, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  // 47. Retro Camera
  {
    id: 'retro_camera',
    name: 'Polaroid Camera',
    thaiName: 'กล้องโพลารอยด์พิกเซล',
    type: 'ground',
    width: 42,
    height: 38,
    color: '#cbd5e1',
    draw: (ctx, x, y, w, h, tick) => {
      // Body
      ctx.fillStyle = '#475569';
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
      // Rainbow stripe (Polaroid classic)
      ctx.fillStyle = '#ef4444'; ctx.fillRect(x + w / 2 - 6, y + 2, 3, h - 4);
      ctx.fillStyle = '#eab308'; ctx.fillRect(x + w / 2 - 3, y + 2, 3, h - 4);
      ctx.fillStyle = '#3b82f6'; ctx.fillRect(x + w / 2, y + 2, 3, h - 4);
      // Lens
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(x + 12, y + h / 2, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#00f0ff';
      ctx.beginPath();
      ctx.arc(x + 12, y + h / 2, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  // 48. Glitch Arrow
  {
    id: 'glitch_arrow',
    name: 'Cyber Arrow',
    thaiName: 'ลูกศรบั๊กบอกทิศ',
    type: 'flying',
    width: 36,
    height: 32,
    color: '#ff007f',
    draw: (ctx, x, y, w, h, tick) => {
      ctx.save();
      const shake = Math.sin(tick * 0.8) * 3;
      ctx.translate(shake, 0);
      ctx.fillStyle = '#ff007f';
      ctx.beginPath();
      ctx.moveTo(x, y + h / 2);
      ctx.lineTo(x + w / 2, y);
      ctx.lineTo(x + w / 2, y + h / 3);
      ctx.lineTo(x + w, y + h / 3);
      ctx.lineTo(x + w, y + h * 2 / 3);
      ctx.lineTo(x + w / 2, y + h * 2 / 3);
      ctx.lineTo(x + w / 2, y + h);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  },
  // 49. Pixel Cactus
  {
    id: 'pixel_cactus',
    name: 'Neon Cactus',
    thaiName: 'กระบองเพชรนีออนตลก',
    type: 'ground',
    width: 32,
    height: 48,
    color: '#10b981',
    draw: (ctx, x, y, w, h) => {
      ctx.fillStyle = '#10b981';
      // Center trunk
      ctx.fillRect(x + w / 2 - 4, y, 8, h);
      // Left arm
      ctx.fillRect(x + 4, y + 14, 8, 4);
      ctx.fillRect(x + 4, y + 4, 4, 10);
      // Right arm
      ctx.fillRect(x + w - 12, y + 22, 8, 4);
      ctx.fillRect(x + w - 8, y + 12, 4, 10);
    }
  },
  // 50. Disco Ball
  {
    id: 'disco_ball',
    name: 'Party Disco Ball',
    thaiName: 'ลูกบอลดิสโก้',
    type: 'flying',
    width: 40,
    height: 40,
    color: '#e2e8f0',
    draw: (ctx, x, y, w, h, tick) => {
      // Chain
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x + w / 2, y - 20); ctx.lineTo(x + w / 2, y); ctx.stroke();
      // Sphere
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, w / 2, 0, Math.PI * 2); ctx.fill();
      // Mirror tiles (simulated with random flickering colors)
      const colors = ['#fff', '#00f0ff', '#ff007f', '#ffe600', '#9d4edd'];
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          const colorIdx = (r + c + Math.floor(tick / 6)) % colors.length;
          ctx.fillStyle = colors[colorIdx];
          ctx.fillRect(x + 6 + c * 7, y + 6 + r * 7, 5, 5);
        }
      }
    }
  },
  // 51. Sega Logo Glitch
  {
    id: 'sega_glitch',
    name: 'Retro Text Glitch',
    thaiName: 'อักษรสีน้ำเงินกระพริบ',
    type: 'flying',
    width: 52,
    height: 24,
    color: '#2563eb',
    draw: (ctx, x, y, w, h, tick) => {
      if (tick % 10 < 5) {
        ctx.fillStyle = '#2563eb';
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px monospace';
        ctx.fillText('RETRO', x + 6, y + h - 8);
      } else {
        ctx.fillStyle = '#ff007f';
        ctx.fillRect(x + 4, y + 2, w, h);
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 12px monospace';
        ctx.fillText('GLITCH', x + 10, y + h - 6);
      }
    }
  },
  // 52. Cyber Helmet
  {
    id: 'cyber_helmet',
    name: 'Tron Helmet',
    thaiName: 'หมวกกันน็อคนีออน',
    type: 'flying',
    width: 36,
    height: 34,
    color: '#00f0ff',
    draw: (ctx, x, y, w, h) => {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
      // Cyan Visor Glow
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(x + 6, y + 10, w - 12, 10);
      // Highlights
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 8, y + 12, 4, 4);
    }
  },
  // 53. Atari Key
  {
    id: 'atari_key',
    name: 'Retro Symbol',
    thaiName: 'สัญลักษณ์ปุ่มสีแดง',
    type: 'flying',
    width: 32,
    height: 32,
    color: '#ef4444',
    draw: (ctx, x, y, w, h) => {
      // Draw classic Atari look logo
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(x + w / 2 - 3, y, 6, h);
      ctx.fillRect(x + 2, y + 10, 4, h - 10);
      ctx.fillRect(x + w - 6, y + 10, 4, h - 10);
      ctx.beginPath();
      ctx.arc(x + w / 2, y + h - 10, 10, Math.PI, 0, false);
      ctx.stroke();
    }
  },
  // 54. Space Satellite
  {
    id: 'satellite',
    name: 'Orbit Satellite',
    thaiName: 'ดาวเทียมพิกเซล',
    type: 'flying',
    width: 44,
    height: 32,
    color: '#64748b',
    draw: (ctx, x, y, w, h, tick) => {
      const anim = Math.sin(tick * 0.1) * 3;
      // Satellite core
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(x + w / 2 - 6, y + h / 2 - 6, 12, 12);
      // Solar panels
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(x, y + h / 2 - 4 + anim, 10, 8);
      ctx.fillRect(x + w - 10, y + h / 2 - 4 - anim, 10, 8);
      // Connecting arms
      ctx.fillStyle = '#64748b';
      ctx.fillRect(x + 10, y + h / 2 - 2, w - 20, 4);
    }
  },
  // 55. CRT Noise
  {
    id: 'crt_noise',
    name: 'Static TV',
    thaiName: 'จอสลัวสัญญาณซ่า',
    type: 'ground',
    width: 40,
    height: 34,
    color: '#71717a',
    draw: (ctx, x, y, w, h, tick) => {
      ctx.fillStyle = '#111';
      ctx.fillRect(x, y, w, h);
      // Sparkly snow noise
      for (let i = 0; i < 40; i++) {
        const px = x + Math.floor(Math.random() * w);
        const py = y + Math.floor(Math.random() * h);
        ctx.fillStyle = Math.random() > 0.5 ? '#fff' : '#444';
        ctx.fillRect(px, py, 2, 2);
      }
    }
  },
  // 56. Neon Star
  {
    id: 'neon_star',
    name: 'Cyber Star',
    thaiName: 'ดาวเรืองแสงห้าแฉก',
    type: 'flying',
    width: 32,
    height: 32,
    color: '#facc15',
    draw: (ctx, x, y, w, h, tick) => {
      const glow = Math.sin(tick * 0.15) * 4 + 4;
      ctx.shadowBlur = glow;
      ctx.shadowColor = '#facc15';
      ctx.fillStyle = '#facc15';
      // Retro style 4-point star for cleaner pixel grid drawing
      ctx.beginPath();
      ctx.moveTo(x + w / 2, y);
      ctx.lineTo(x + w * 0.65, y + h * 0.35);
      ctx.lineTo(x + w, y + h / 2);
      ctx.lineTo(x + w * 0.65, y + h * 0.65);
      ctx.lineTo(x + w / 2, y + h);
      ctx.lineTo(x + w * 0.35, y + h * 0.65);
      ctx.lineTo(x, y + h / 2);
      ctx.lineTo(x + w * 0.35, y + h * 0.35);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  },
  // 57. Hover Board
  {
    id: 'hover_board',
    name: 'Pink Hoverboard',
    thaiName: 'บอร์ดลอยฟ้าสีชมพู',
    type: 'flying',
    width: 46,
    height: 18,
    color: '#ff007f',
    draw: (ctx, x, y, w, h, tick) => {
      ctx.fillStyle = '#ff007f';
      ctx.fillRect(x, y + 4, w, h - 8);
      // Yellow stripes
      ctx.fillStyle = '#ffe600';
      ctx.fillRect(x + 10, y + 4, 6, h - 8);
      ctx.fillRect(x + w - 16, y + 4, 6, h - 8);
      // Hover engine glow beneath
      ctx.fillStyle = '#00f0ff';
      if (tick % 4 < 2) {
        ctx.fillRect(x + 6, y + h - 2, 8, 2);
        ctx.fillRect(x + w - 14, y + h - 2, 8, 2);
      }
    }
  },
  // 58. Cassette Spindle
  {
    id: 'cassette_spindle',
    name: 'Spindle Reel',
    thaiName: 'แกนหมุนสายเทปหลุด',
    type: 'bouncing',
    width: 32,
    height: 32,
    color: '#f43f5e',
    draw: (ctx, x, y, w, h, tick) => {
      ctx.fillStyle = '#475569';
      ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, w / 2, 0, Math.PI * 2); ctx.fill();
      // Gears
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, w / 3, 0, Math.PI * 2); ctx.stroke();
      // Unspooled ribbon trailing
      ctx.strokeStyle = '#27272a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x + w / 2, y + h / 2);
      ctx.quadraticCurveTo(x - 10, y + h + 10, x - 20, y + h + Math.sin(tick * 0.2) * 5);
      ctx.stroke();
    }
  },
  // 59. Laser Mine
  {
    id: 'laser_mine',
    name: 'Laser Spike Mine',
    thaiName: 'ทุ่นระเบิดเลเซอร์',
    type: 'ground',
    width: 34,
    height: 34,
    color: '#ef4444',
    draw: (ctx, x, y, w, h, tick) => {
      const active = tick % 16 < 8;
      // Core sphere
      ctx.fillStyle = '#334155';
      ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, w / 3, 0, Math.PI * 2); ctx.fill();
      // Spikes
      ctx.fillStyle = active ? '#ef4444' : '#b91c1c';
      ctx.fillRect(x + w / 2 - 2, y, 4, h);
      ctx.fillRect(x, y + h / 2 - 2, w, 4);
      // Warning glow
      if (active) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, 4, 0, Math.PI * 2); ctx.fill();
      }
    }
  },
  // 60. Pixel Flame
  {
    id: 'pixel_flame',
    name: 'Cyber Fire',
    thaiName: 'ลูกไฟพิกเซลสีฟ้า',
    type: 'bouncing',
    width: 32,
    height: 38,
    color: '#06b6d4',
    draw: (ctx, x, y, w, h, tick) => {
      const flicker = (tick % 3) * 2;
      // Flame layers
      ctx.fillStyle = '#0891b2'; // Dark Blue outer
      ctx.fillRect(x + 4, y + flicker, w - 8, h - flicker);
      ctx.fillStyle = '#06b6d4'; // Cyan middle
      ctx.fillRect(x + 8, y + 8 + flicker, w - 16, h - 8 - flicker);
      ctx.fillStyle = '#ffffff'; // White core
      ctx.fillRect(x + w / 2 - 4, y + 14 + flicker, 8, h - 14 - flicker);
    }
  },
  // 61. Glitch Ghost
  {
    id: 'glitch_ghost',
    name: 'Shifting Wraith',
    thaiName: 'วิญญาณบั๊กสลับสี',
    type: 'flying',
    width: 36,
    height: 36,
    color: '#00f0ff',
    draw: (ctx, x, y, w, h, tick) => {
      const colors = ['#00f0ff', '#ff007f', '#ffe600'];
      const colorIdx = Math.floor(tick / 10) % colors.length;
      ctx.fillStyle = colors[colorIdx];
      ctx.fillRect(x, y, w, h);
      // Creepy glitches
      ctx.fillStyle = '#000000';
      ctx.fillRect(x + 4, y + 8, 8, 4);
      ctx.fillRect(x + w - 12, y + 8, 8, 4);
    }
  },
  // 62. 8-Bit Diamond
  {
    id: '8bit_diamond',
    name: 'Emerald Core',
    thaiName: 'เพชรนีออนสีมรกต',
    type: 'flying',
    width: 32,
    height: 32,
    color: '#10b981',
    draw: (ctx, x, y, w, h, tick) => {
      const glow = Math.sin(tick * 0.1) * 3 + 3;
      ctx.shadowBlur = glow;
      ctx.shadowColor = '#10b981';
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.moveTo(x + w / 2, y);
      ctx.lineTo(x + w, y + h / 2);
      ctx.lineTo(x + w / 2, y + h);
      ctx.lineTo(x, y + h / 2);
      ctx.closePath();
      ctx.fill();
      // Sparkle
      ctx.fillStyle = '#a7f3d0';
      ctx.fillRect(x + w / 2 - 3, y + h / 2 - 3, 6, 6);
      ctx.shadowBlur = 0;
    }
  },
  // 63. Cyber Portal
  {
    id: 'cyber_portal',
    name: 'Dimension Vortex',
    thaiName: 'พอร์ทัลมิติสีชมพู',
    type: 'ground',
    width: 38,
    height: 54,
    color: '#ec4899',
    draw: (ctx, x, y, w, h, tick) => {
      // Rotating spiral portals
      ctx.fillStyle = '#3f003f';
      ctx.fillRect(x, y, w, h);
      const wave = Math.sin(tick * 0.2) * 4;
      ctx.fillStyle = '#ec4899';
      ctx.fillRect(x + 4 + wave / 2, y + 4, w - 8 - wave, h - 8);
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(x + 10 - wave / 2, y + 10, w - 20 + wave, h - 20);
    }
  },
  // 64. Neon Bolt
  {
    id: 'neon_bolt',
    name: 'Zeus Bolt',
    thaiName: 'สายฟ้าขีดฟ้าวาบ',
    type: 'flying',
    width: 28,
    height: 40,
    color: '#fbbf24',
    draw: (ctx, x, y, w, h, tick) => {
      const flicker = tick % 8 < 4;
      ctx.fillStyle = flicker ? '#fbbf24' : '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(x + w - 6, y);
      ctx.lineTo(x, y + h * 0.6);
      ctx.lineTo(x + w / 2, y + h * 0.6);
      ctx.lineTo(x + 6, y + h);
      ctx.lineTo(x + w, y + h * 0.4);
      ctx.lineTo(x + w / 2, y + h * 0.4);
      ctx.closePath();
      ctx.fill();
    }
  },
  // 65. Retro Mug
  {
    id: 'retro_mug',
    name: 'Grid Coffee',
    thaiName: 'ถ้วยเซรามิกสีพาสเทล',
    type: 'ground',
    width: 34,
    height: 34,
    color: '#fb7185',
    draw: (ctx, x, y, w, h) => {
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(x, y, w - 8, h); // cup main
      // Handle
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 4;
      ctx.strokeRect(x + w - 10, y + 8, 8, h - 16);
      // Pastel waves
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(x + 2, y + 12, w - 12, 4);
      ctx.fillStyle = '#ffe600';
      ctx.fillRect(x + 2, y + 20, w - 12, 4);
    }
  },
  // 66. Glitch Matrix
  {
    id: 'glitch_matrix',
    name: 'Digital Rain',
    thaiName: 'รหัสแมทริกซ์ตกหล่น',
    type: 'ceiling',
    width: 30,
    height: 60,
    color: '#22c55e',
    draw: (ctx, x, y, w, h, tick) => {
      ctx.fillStyle = 'rgba(16, 185, 129, 0.1)';
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = '#10b981';
      // Fall down columns
      const pos1 = (tick * 2) % (h - 10);
      const pos2 = (tick * 1.5 + 20) % (h - 10);
      ctx.fillRect(x + 4, y + pos1, 6, 8);
      ctx.fillRect(x + w - 10, y + pos2, 6, 8);
      ctx.fillStyle = '#fff';
      ctx.fillRect(x + 4, y + pos1 + 6, 6, 2);
      ctx.fillRect(x + w - 10, y + pos2 + 6, 6, 2);
    }
  },
  // 67. The 67 Logo
  {
    id: 'the_67_logo',
    name: 'The Glorious "67"',
    thaiName: 'สัญลักษณ์เลข 67 ยักษ์',
    type: 'bouncing',
    width: 48,
    height: 48,
    color: '#ff007f',
    draw: (ctx, x, y, w, h, tick) => {
      // Glow and pulse
      const pulse = Math.sin(tick * 0.15) * 4;
      ctx.shadowBlur = 12 + pulse;
      ctx.shadowColor = '#00f0ff';
      // Draw massive 67 numbers in retro grid box
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = '#ff007f';
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, w, h);

      // Text "67" stylized
      ctx.fillStyle = '#00f0ff';
      ctx.font = 'bold 24px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('67', x + w / 2, y + h / 2 + 1);
      ctx.shadowBlur = 0;
    }
  }
];
