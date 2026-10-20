const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const noop=()=>{},els=new Map(),handlers={};
const ctx=new Proxy({createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>o[k]||noop,set:(o,k,v)=>(o[k]=v,true)});
function el(s){if(!els.has(s))els.set(s,{style:{},textContent:'',innerHTML:'',focus:noop,getContext:()=>ctx});return els.get(s)}
const box={console,Math,URLSearchParams,location:{search:'?pixel=1'},Image:class{constructor(){this.complete=true;this.naturalWidth=1536}},document:{querySelector:el,addEventListener:(n,f)=>handlers[n]=f},window:{addEventListener:(n,f)=>handlers[n]=f},localStorage:{getItem:()=>null,setItem:noop},requestAnimationFrame:noop};
vm.createContext(box);vm.runInContext(fs.readFileSync('dist/pixel-animation.js','utf8'),box);vm.runInContext(fs.readFileSync('dist/pixel-world.js','utf8'),box);vm.runInContext(fs.readFileSync('dist/game.js','utf8'),box);const run=s=>vm.runInContext(s,box);
handlers.click({target:{closest:()=>({id:'newGame',dataset:{}})}});
run('p.x=enemies[0].x-40;enemies[0].cool=99;p.face=1');
let hp=run('enemies[0].hp');run('attack(true);update(.19)');assert.equal(run('enemies[0].hp'),hp);
run('update(.02)');assert.ok(run('enemies[0].hp')<hp);let after=run('enemies[0].hp');run('update(.03)');assert.equal(run('enemies[0].hp'),after,'single impact');
run('update(.5);p.inv=0;attack();hurt(3,p.x+5)');assert.equal(run('p.pendingHit'),null);assert.equal(run('p.hurtTime'),.28);
run('update(.4);state.slots[0]=[0,1,2];p.inv=0;skill(2)');assert.equal(run('state.cool[0][2]'),0);
run('update(.1);hurt(3,p.x+5)');assert.equal(run('p.pendingSkill'),null);assert.equal(run('state.cool[0][2]'),0,'cancel before emission preserves cooldown');
run('update(.4);skill(2);update(.25)');assert.ok(run('state.cool[0][2]')>14);assert.ok(run("effects.some(e=>e.type==='seolFx'&&e.action==='skill2')"));
let elapsed=run('p.pixelCast.elapsed');run("mode='paused';update(.5)");assert.equal(run('p.pixelCast.elapsed'),elapsed);
run("mode='play';p.attack=0;p.pixelCast=null;p.dash=.23;update(.05)");assert.ok(run("effects.some(e=>e.type==='seolGhost')"));
run('draw()');
for(const action of ['heavy','jump','dash','hurt','skill0','skill1','skill2']){box.window.SeolPixel.draw(ctx,action,.2,100,100,-1);box.window.SeolPixel.fx(ctx,action,.3,100,100,-1);}
console.log('PASS: heavy active timing, one hit, interrupt cancellation, cast/cooldown timing, pause, world-space trails and new action rendering.');
for(let hero=1;hero<3;hero++){
 run("mode='play';resetStage();state.hero="+hero+";state.slots["+hero+"]=[0,1,2];healAll();state.cool["+hero+"]=[0,0,0]");
 const beforeX=run('p.x');run('skill(0);update(.13)');
 assert.ok(run('state.cool['+hero+'][0]')>4);
 if(hero===1)assert.ok(run('p.x')>beforeX,'shadow teleport retained');
 run('update(.5);p.hp=60;skill(1);update(.19)');
 if(hero===2){assert.equal(run('p.hp'),75,'rose shield healing retained');assert.ok(run('p.inv')>2)}
 assert.ok(run('effects.some(e=>e.hero==='+hero+'&&e.type==="seolFx")'));
 const api=box.window.PartyPixel.forHero(hero);
 for(const action of Object.keys(api.clips)){api.draw(ctx,action,.2,100,100,-1);api.fx(ctx,action,.3,100,100,-1)}
 run('p.attack=0;p.pixelCast=null;p.dash=.23;update(.05)');assert.ok(run('effects.some(e=>e.type==="seolGhost"&&e.hero==='+hero+')'));run('draw()');
}
console.log('PASS: both companions, shadow teleport, rose shield healing, actor-bound trails and every clip.');
run("mode='play';resetStage();healAll();state.hero=0;p.inv=0;p.dash=0;p.block=true;p.face=1");
const guardHP=run('p.hp');run('hurt(20,p.x+10)');assert.equal(run('p.guardHit'),.12);assert.ok(run('p.hp')>guardHP-20);run('draw()');
run('p.inv=0;p.block=false;p.hp=1;hurt(20,p.x+10)');assert.notEqual(run('state.hero'),0);assert.ok(run('effects.some(e=>e.type==="fallenHero"&&e.hero===0)'));run('draw()');
for(let stage=0;stage<3;stage++){run('state.stage='+stage+';draw()')}
run("inTown=true;draw()");
console.log('PASS: pixel guard recoil, fallen actor retention, automatic companion switch, three world palettes and village rendering.');
run("mode='play';inTown=false;resetStage();healAll();time=47.99;rain=true;p.umbrellaOpen=1;update(.05)");
assert.ok(run('p.umbrellaOpen')>0&&run('p.umbrellaOpen')<1,'weather folds progressively');
run("mode='paused'");const opening=run('p.umbrellaOpen');run('update(.3)');assert.equal(run('p.umbrellaOpen'),opening);
run("mode='play';update(.3)");assert.equal(run('p.umbrellaOpen'),0);
run("time=72;update(.3)");assert.equal(run('p.umbrellaOpen'),1);
run("keys.arrowright=true;update(.1)");assert.ok(run('p.walkClock')>0);run('keys={};update(.1)');assert.equal(run('p.walkClock'),0);
for(let stage=0;stage<3;stage++){
 run('state.stage='+stage+';resetStage();healAll();mode="play";p.x=3050;update(.016)');assert.equal(run('mode'),'gate');
 handlers.click({target:{closest:()=>({id:'enterBoss',dataset:{}})}});els.get('#dialogueNext').onclick();
 run('boss.hp=1;p.x=boss.x-30;p.face=1;p.inv=10;attack(true);update(.21)');assert.ok(run('cleared'));assert.ok(run('effects.some(e=>e.type==="pixelDeath")'));
 run('p.x=3750;update(.016)');assert.equal(run('mode'),'town');assert.ok(run('state.hp.every(v=>v===maxHP())'));run('draw()');
}
console.log('PASS: weather transition/pause, movement clock and all three pixel boss-to-village paths.');
run('state.stage=0;resetStage();mode="play";healAll();p.x=enemies[0].x-70;p.inv=10;enemies[0].wind=.01;update(.02)');assert.ok(run('enemies[0].swing')>0);const ex=run('enemies[0].x');run('update(.05)');assert.equal(run('enemies[0].x'),ex,'attack recovery must not slide');run('draw()');
console.log('PASS: enemy strike recovery remains stationary.');
