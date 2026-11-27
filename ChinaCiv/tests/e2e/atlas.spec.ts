import { expect, test, type Page } from '@playwright/test';
import type { Point } from '../../packages/core-types/src/map';

async function run(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', line => { if (line.type() === 'error') errors.push(line.text()); });
  await page.goto('/?bench=1');
  await expect.poll(() => page.evaluate(() => window.atlasBench?.stats()?.drawCalls), { timeout: 15000 }).toBeGreaterThan(0);
  await expect(page.getByText('合成技术样例，非真实地图')).toBeVisible();
  return errors;
}
const camera = (page: Page) => page.evaluate(() => window.atlasBench!.getView());

test('desktop map renders and supports layers, selection, camera, search and export', async ({ page }) => {
  const errors = await run(page);
  const initial = await camera(page);
  const stats = await page.evaluate(() => window.atlasBench!.stats()!);
  expect(stats.instances).toBeGreaterThan(200);
  expect(stats.triangles).toBeGreaterThan(stats.instances);
  await page.screenshot({ path: 'reports/terrain.png' });
  const population = page.getByRole('button', { name: /人口密度/ });
  await population.click();
  await expect(population).toHaveAttribute('aria-pressed','true');
  await expect(page.getByRole('region', { name: '图例' })).toContainText('无数据');
  await page.waitForTimeout(200);
  await page.screenshot({ path: 'reports/population.png' });
  const map = page.locator('canvas[aria-label="交互六边形地图"]');
  const box = (await map.boundingBox())!;
  await page.mouse.click(box.x + box.width/2 + (155000-initial.x)*box.width/initial.width,
    box.y + box.height/2 + (initial.y-67000)*box.width/initial.width);
  await expect(page.getByRole('region', { name:'地图详情' }).getByRole('heading')).toHaveText('青澜铁路');
  const routes = page.getByRole('switch', { name: '交通网络' });
  await routes.click();
  await expect(routes).toHaveAttribute('aria-checked','false');
  await expect.poll(() => page.evaluate(() => window.atlasBench!.stats()!.drawCalls)).toBeLessThan(stats.drawCalls);
  await page.getByRole('button', { name: '关闭详情' }).click();
  await page.getByRole('button', { name: '查看云津详情' }).click();
  await expect(page.getByRole('region', { name:'地图详情' }).getByRole('heading')).toHaveText('云津');
  const clickPoint = { x: Math.round(box.x+box.width*.39), y: Math.round(box.y+box.height*.61) };
  await page.mouse.click(clickPoint.x,clickPoint.y);
  await expect(page.getByRole('region',{name:'地图详情'})).toContainText('地块详情');
  await page.mouse.move(clickPoint.x,clickPoint.y);
  await page.mouse.down();
  await page.mouse.move(clickPoint.x+130,clickPoint.y+72,{steps:7});
  await page.mouse.up();
  const afterDrag = await camera(page);
  expect(afterDrag.x).toBeLessThan(initial.x-100000);
  expect(afterDrag.y).toBeGreaterThan(initial.y+50000);
  await page.mouse.wheel(0,-120);
  await expect.poll(async () => (await camera(page)).width).toBeLessThan(initial.width);
  const afterZoom = await camera(page);
  const local = [(clickPoint.x+130-box.x)/box.width-.5, .5-(clickPoint.y+72-box.y)/box.width-(box.width-box.height)/(2*box.width)];
  expect(Math.abs(afterZoom.x + local[0]*afterZoom.width - afterDrag.x - local[0]*afterDrag.width)).toBeLessThan(1);
  expect(Math.abs(afterZoom.y + local[1]*afterZoom.width - afterDrag.y - local[1]*afterDrag.width)).toBeLessThan(1);
  await map.press('ArrowRight');
  expect((await camera(page)).x).toBeGreaterThan(afterZoom.x);
  const search = page.getByRole('textbox', { name:'搜索城镇' });
  await search.fill('lanpu'); await search.press('Enter');
  await expect(page.getByRole('region',{name:'地图详情'}).getByRole('heading')).toHaveText('澜浦');
  await expect.poll(async () => (await camera(page)).width).toBe(1160000);
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: '导出地图截图' }).click();
  const png = await download;
  expect(png.suggestedFilename()).toMatch(/\.png$/);
  await png.saveAs('reports/exported-map.png');
  await page.getByRole('button', { name: '重置视野' }).click();
  expect(await camera(page)).toEqual(initial);
  await page.getByRole('button', { name: '在小地图上定位' }).click({ position:{ x:28,y:35 } });
  expect((await camera(page)).x).not.toBe(initial.x);
  await page.getByRole('button', { name: '数据说明' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('dialog').getByRole('button',{ name:'关闭' }).click();
  expect(errors).toEqual([]);
});

test('landscape touch supports pinch, two-finger tap, drag and long press', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport:{width:1024,height:768}, hasTouch:true, deviceScaleFactor:1.5, reducedMotion:'reduce' });
  const page = await ctx.newPage();
  try {
    const errors = await run(page);
    await page.screenshot({ path:'reports/touch-landscape.png' });
    await page.getByRole('button',{name:'关闭详情'}).tap();
    const map = page.locator('canvas[aria-label="交互六边形地图"]');
    const box = (await map.boundingBox())!;
    const x = box.x + 310, y = box.y + 284;
    const cdp = await ctx.newCDPSession(page);
    const send = (type: 'touchStart'|'touchMove'|'touchEnd', coords: Point[]) =>
      cdp.send('Input.dispatchTouchEvent', { type, touchPoints: coords.map(([x,y],id) => ({x,y,id})) });
    const initial = await camera(page);
    await send('touchStart',[[x-30,y],[x+30,y]]);
    await send('touchMove',[[x-65,y],[x+65,y]]);
    await send('touchEnd',[]);
    await expect.poll(async () => (await camera(page)).width).toBeLessThan(initial.width*.75);
    expect(await page.evaluate(() => window.atlasBench!.getSelection())).toBeNull();
    const pinched = await camera(page);
    await send('touchStart',[[x-30,y],[x+30,y]]);
    await send('touchEnd',[]);
    await expect.poll(async () => (await camera(page)).width).toBeGreaterThan(pinched.width);
    expect(await page.evaluate(() => window.atlasBench!.getSelection())).toBeNull();
    const beforeDrag = await camera(page);
    await send('touchStart',[[x-85,y+70]]);
    await send('touchMove',[[x-35,y+100]]);
    await send('touchMove',[[x-10,y+120]]);
    await send('touchEnd',[]);
    await expect.poll(async () => (await camera(page)).x).toBeLessThan(beforeDrag.x);
    await page.waitForTimeout(500);
    const beforeHold = await camera(page);
    await send('touchStart',[[x-85,y+75]]);
    await expect(page.getByRole('button',{name:'查看详情',exact:true})).toBeVisible();
    await send('touchEnd',[]);
    expect(await page.evaluate(() => window.atlasBench!.getSelection())).toBeNull();
    expect(await camera(page)).toEqual(beforeHold);
    await page.getByRole('button',{name:'查看详情',exact:true}).tap();
    await expect(page.getByRole('region',{name:'地图详情'})).toBeVisible();
    await page.getByRole('button',{name:'关闭详情'}).tap();
    const beforeDoubleTap = await camera(page);
    await send('touchStart',[[x-121,y-92]]);
    await send('touchEnd',[]);
    await send('touchStart',[[x-121,y-92]]);
    await send('touchEnd',[]);
    await expect.poll(async () => (await camera(page)).width).toBeLessThan(beforeDoubleTap.width);
    expect(errors).toEqual([]);
  } finally { await ctx.close(); }
});

test('shows a support screen when WebGL2 is unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    const get = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, options?: unknown) {
      return type === 'webgl2' ? null : Reflect.apply(get,this,[type,options]);
    } as typeof get;
  });
  await page.goto('/');
  await expect(page.getByRole('alert')).toContainText('无法创建 WebGL2 上下文');
});

test('redraws retained map state after WebGL2 context restoration', async ({ page }) => {
  const errors = await run(page);
  await page.getByRole('button', { name:/经济活动/ }).click();
  await page.evaluate(() => {
    const canvas = document.querySelector<HTMLCanvasElement>('canvas[aria-label="交互六边形地图"]')!;
    const context = canvas.getContext('webgl2')!.getExtension('WEBGL_lose_context')!;
    canvas.addEventListener('webglcontextlost', () => window.setTimeout(() => context.restoreContext(), 550), { once:true });
    context.loseContext();
  });
  await expect(page.getByRole('alert')).toContainText('正在恢复地图');
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(page.getByRole('button', { name:/经济活动/ })).toHaveAttribute('aria-pressed','true');
  await expect(page.getByRole('region',{name:'地图详情'}).getByRole('heading')).toHaveText('临川');
  await expect.poll(() => page.evaluate(() => window.atlasBench!.stats()!.drawCalls)).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});
