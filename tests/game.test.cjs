const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const elements=new Map(),handlers={},storage=new Map();const noop=()=>{};
const context=new Proxy({createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>o[k]||noop,set:(o,k,v)=>(o[k]=v,true)});
function el(s){if(!elements.has(s))elements.set(s,{style:{},textContent:'',innerHTML:'',focus:noop,getContext:()=>context});return elements.get(s)}
const sandbox={console,Math,document:{querySelector:el,addEventListener:(n,f)=>handlers[n]=f},window:{addEventListener:(n,f)=>handlers[n]=f},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},requestAnimationFrame:noop};vm.createContext(sandbox);vm.runInContext(fs.readFileSync('dist/game.js','utf8'),sandbox);const run=s=>vm.runInContext(s,sandbox),g=sandbox.window.umbrellaGame;
function click(id,dataset={}){handlers.click({target:{closest:()=>({id,dataset})}})}function key(key,code){handlers.keydown({key,code,preventDefault:noop})}function tick(n=1){for(let i=0;i<n;i++)g.update(.016)}
click('newGame');assert.equal(g.mode,'play');
key(' ','Space');assert.equal(g.player.jumps,1);key(' ','Space');assert.equal(g.player.jumps,2);key(' ','Space');assert.equal(g.player.jumps,2);tick(120);assert.equal(g.player.jumps,0);
key('ArrowRight','ArrowRight');tick(4);key('ArrowRight','ArrowRight');assert.ok(g.player.dash>0);handlers.keyup({key:'ArrowRight',code:'ArrowRight'});tick(30);
key('e','KeyE');assert.equal(g.state.hero,1);key('e','KeyE');assert.equal(g.state.hero,2);key('e','KeyE');
run('p.x=enemies[0].x;p.inv=0;enemies[0].cool=10;');let hp=g.player.hp;tick();assert.equal(g.player.hp,hp,'contact must not hurt');
key('ㅓ','KeyJ');assert.ok(g.enemies[0].hp<g.enemies[0].max,'physical J works with Korean layout');tick(25);
run('p.x=enemies[0].x-40;p.face=1');let eh=g.enemies[0].hp;g.skill(0);assert.ok(g.enemies[0].hp<eh);let cd=g.state.cool[0][0];g.skill(0);assert.equal(g.state.cool[0][0],cd);
g.gainXP(70);assert.equal(g.state.level,2);assert.equal(g.state.points,1);click('tree');click('',{learn:'1'});assert.equal(g.state.learned[0][1],true);click('',{equip:'1,2'});assert.equal(g.state.slots[0][2],1);assert.equal(g.state.slots[0][1],null);click('closeTree');
run('p.x=3050');tick();assert.equal(g.mode,'gate');click('leaveBoss');assert.equal(g.mode,'play');assert.ok(g.player.x<2920,'declining gate must reset approach');tick();run('p.x=3050');tick();click('enterBoss');assert.equal(g.mode,'dialogue');el('#dialogueNext').onclick();assert.equal(g.mode,'play');run('p.x=3000');tick();assert.ok(g.player.x>=3140);
run('boss.hp=1;p.x=boss.x-30;p.face=1;p.attack=0');g.attack(true);assert.ok(g.boss.hp<=0);assert.ok(run('drops.some(d=>d.type==="gold"&&d.v>=90)'));run('p.x=3750');tick();assert.equal(g.mode,'town');
g.state.gold=200;run('p.x=520');key('f','KeyF');el('#dialogueNext').onclick();assert.equal(g.mode,'shop');click('buyWeapon');assert.equal(g.state.weapon,1);click('buyArmor');assert.equal(g.state.armor,1);assert.equal(JSON.parse(storage.get('umbrella-save-v1')).town,true,'shop saves town checkpoint');click('closeShop');run('p.x=1250');tick();click('travel');assert.equal(g.state.stage,1);assert.equal(g.mode,'play');assert.equal(run('inTown'),false);
run('draw()');console.log('PASS: jump, dash, Korean keys, switching, no contact damage, attack, cooldown, level, skills, boss gate/lock/loot, village, shop/save, next chapter, rendering.');

click('newGame');run('p.hp=70');key('e','KeyE');assert.equal(g.player.hp,120);run('p.hp=40');key('q','KeyQ');assert.equal(g.player.hp,70);key('q','KeyQ');assert.equal(g.state.hero,2);assert.equal(g.player.hp,120);
run('time=47;rain=true');handlers.blur();let frozen=run('time');tick(400);assert.equal(run('time'),frozen);assert.equal(run('rain'),true);click('resume');tick();assert.equal(run('rain'),true,'resume must preserve rainy weather');
run('p.hp=1;p.inv=0;p.dash=0;p.block=false;hurt(50,p.x+20)');assert.equal(g.state.hp[2],0);assert.equal(g.state.hero,0);key('q','KeyQ');assert.equal(g.state.hero,1,'skip fallen hero');run('p.hp=1;p.inv=0;hurt(50,p.x+20)');assert.equal(g.state.hero,0);run('p.hp=1;p.inv=0;hurt(50,p.x+20)');assert.equal(g.mode,'dead');click('retry');assert.ok(g.state.hp.every(v=>v===120));
run('p.hp=33;save()');key('e','KeyE');run('p.hp=62;save()');run('healAll();load()');assert.equal(g.state.hp[0],33);assert.equal(g.state.hp[1],62);
click('backTitle');assert.equal(g.mode,'start');click('settings');assert.equal(g.mode,'settings');assert.ok(el('#overlay').innerHTML.includes('홍아'));click('',{settingsTab:'story'});assert.ok(el('#overlay').innerHTML.includes('이름을 잊게 하는 비'));click('closeSettings');assert.equal(g.mode,'start');click('exitGame');assert.equal(g.mode,'exited');click('backTitle');click('startChoice');click('sessionResume');assert.equal(g.mode,'play');run('draw()');
console.log('PASS: independent HP, Q/E wrapping, fallen-member skipping, party wipe/retry, HP persistence, paused weather, title/settings/story/exit.');

click("newGame");run("p.x=1800;state.hp=[0,0,1];state.hero=2;p.inv=0;hurt(50,p.x+10)");tick();assert.equal(g.mode,"dead","party wipe beyond town exit coordinate stays game over");
