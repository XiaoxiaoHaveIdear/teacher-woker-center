// 生成 Capacitor 图标/启动页源图：蓝底 + 白色清单卡片（纯图形，不依赖字体）
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const BLUE = '#2563eb';

function cardSvg(size, padRatio) {
  // size 画布，padRatio 内容四周留白比例
  const p = Math.round(size * padRatio);
  const w = size - p * 2;
  // 卡片占内容区的比例
  const cw = Math.round(w * 0.62);
  const ch = Math.round(w * 0.78);
  const cx = Math.round((size - cw) / 2);
  const cy = Math.round((size - ch) / 2);
  const rx = Math.round(cw * 0.14);
  // 三行：圆点 + 横条
  const rows = [0.24, 0.46, 0.68].map(r => {
    const yy = cy + Math.round(ch * r);
    const dotR = Math.round(cw * 0.055);
    const dotX = cx + Math.round(cw * 0.16);
    const barX = cx + Math.round(cw * 0.30);
    const barW = Math.round(cw * (r === 0.46 ? 0.42 : 0.54));
    const barH = Math.round(ch * 0.075);
    const barRx = Math.round(barH / 2);
    return `<circle cx="${dotX}" cy="${yy}" r="${dotR}" fill="${BLUE}"/>
      <rect x="${barX}" y="${yy - Math.round(barH / 2)}" width="${barW}" height="${barH}" rx="${barRx}" fill="${BLUE}"/>`;
  }).join('');
  return { svg: `<rect x="${cx}" y="${cy}" width="${cw}" height="${ch}" rx="${rx}" fill="#ffffff"/>${rows}`, size };
}

async function main() {
  const outDir = path.join(__dirname, 'assets');
  fs.mkdirSync(outDir, { recursive: true });

  // icon-only：蓝底 + 卡片（1024）
  const only = cardSvg(1024, 0);
  await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024"><rect width="1024" height="1024" fill="${BLUE}"/>${only.svg}</svg>`)).png().toFile(path.join(outDir, 'icon-only.png'));

  // icon-foreground：透明底，内容集中中间 60%（自适应图标安全区）
  const fg = cardSvg(1024, 0.2);
  await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024">${fg.svg}</svg>`)).png().toFile(path.join(outDir, 'icon-foreground.png'));

  // icon-background：纯蓝
  await sharp({ create: { width: 1024, height: 1024, channels: 4, background: BLUE } }).png().toFile(path.join(outDir, 'icon-background.png'));

  // splash / splash-dark：2732 蓝底 + 居中卡片
  const sp = cardSvg(2732, 0.3);
  const splashSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="2732" height="2732"><rect width="2732" height="2732" fill="${BLUE}"/>${sp.svg}</svg>`;
  await sharp(Buffer.from(splashSvg)).png().toFile(path.join(outDir, 'splash.png'));
  await sharp(Buffer.from(splashSvg)).png().toFile(path.join(outDir, 'splash-dark.png'));

  console.log('icons generated:', fs.readdirSync(outDir).join(', '));
}

main().catch(e => { console.error(e); process.exit(1); });
