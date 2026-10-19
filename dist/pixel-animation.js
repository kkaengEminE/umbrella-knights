/* Native source coordinates are kept separately from the 128px production frame.
   AI sheets are concept assets, not assumed to have exact export dimensions. */
(function(root){
// Hand-verified source rectangles; keep each pose anchored at the feet.
const poses=[
 {x:250,y:35,w:220,h:325,px:100,py:317},
 {x:660,y:35,w:210,h:325,px:100,py:317},
 {x:1060,y:35,w:260,h:325,px:145,py:317},
 {x:220,y:370,w:260,h:310,px:130,py:306},
 {x:630,y:370,w:270,h:310,px:135,py:306},
 {x:1070,y:370,w:250,h:310,px:130,py:306},
 {x:150,y:690,w:310,h:310,px:190,py:303},
 {x:590,y:690,w:470,h:310,px:180,py:303},
 {x:1090,y:690,w:260,h:310,px:100,py:303}
].map(p=>({...p,scale:.39}));
const clips={
 idle:{file:'seol-study-v2.png',loop:true,durations:[450,450],frames:[poses[0],poses[1]]},
 run:{file:'seol-study-v2.png',loop:true,durations:[140,140,140,140],frames:poses.slice(2,6)},
 light:{file:'seol-study-v2.png',loop:false,durations:[85,110,85],active:[1],frames:poses.slice(6,9)}
};
const extra=[
 {x:200,y:10,w:305,h:354,px:190,py:346},
 {x:610,y:80,w:400,h:285,px:155,py:276},
 {x:1025,y:60,w:310,h:306,px:195,py:296},
 {x:205,y:366,w:280,h:274,px:170,py:274},
 {x:610,y:370,w:285,h:314,px:160,py:310},
 {x:1050,y:420,w:330,h:230,px:165,py:230},
 {x:180,y:700,w:310,h:294,px:170,py:294},
 {x:620,y:720,w:295,h:280,px:150,py:274},
 {x:1025,y:650,w:340,h:365,px:205,py:355}
].map(f=>({...f,scale:.39,file:'seol-actions-v3.png'}));
const base=i=>({...poses[i],file:'seol-study-v2.png'});
Object.assign(clips,{
 heavy:{durations:[200,160,190],active:[1],frames:extra.slice(0,3)},
 jump:{durations:[180,180],frames:[extra[3],extra[4]]},
 dash:{durations:[120,110],frames:[extra[5],base(3)]},
 hurt:{durations:[140,140],frames:[extra[6],base(0)]},
 skill0:{durations:[120,120,120],active:[1],frames:[base(6),base(7),base(8)]},
 skill1:{durations:[180,150,150],active:[1],frames:[extra[0],extra[7],extra[2]]},
 skill2:{durations:[240,180,180],active:[1],frames:[extra[0],extra[8],extra[2]]}
});

function frameAt(clip,seconds){const total=clip.durations.reduce((a,b)=>a+b,0);let t=Math.max(0,seconds*1000);t=clip.loop?t%total:Math.min(t,total-.001);let frame=0;while(frame<clip.durations.length-1&&t>=clip.durations[frame])t-=clip.durations[frame++];return frame}

const characterClips=[clips];
for(let hero=1;hero<3;hero++){
 const file=(hero===1?'muyeong':'honga')+'-actions.png';
 const feet=hero===1?[320,320,320,320,320,320,302,302,302,302,302,302,265,292,306,303,306,308]:[330,330,330,330,330,330,302,302,302,302,310,302,265,292,302,304,302,304];
 const frames=Array.from({length:18},(_,i)=>({x:i%6*256,y:Math.floor(i/6)*341,w:256,h:i>=12?342:341,px:150,py:feet[i]-(i>=12?22:0),scale:.5,file}));
 frames[17]={...frames[17],x:1250,y:650,w:286,h:374,px:180,py:hero===1?318:314};
 // Horizontal weapon extension uses the transparent corridor between bodies.
 frames[7]={...frames[7],w:hero===1?325:360,tailMask:true};
 const select=ids=>ids.map(i=>frames[i]);
 characterClips.push({
 idle:{loop:true,durations:[450,450],frames:select([0,1])},
 run:{loop:true,durations:[140,140,140,140],frames:select([2,3,4,5])},
 light:{durations:[85,110,85],active:[1],frames:select([6,7,8])},
 heavy:{durations:[200,160,190],active:[1],frames:select([9,10,11])},
 jump:{durations:[180,180],frames:select([12,13])},
 dash:{durations:[120,110],frames:select([14,3])},
 hurt:{durations:[140,140],frames:select([15,0])},
 skill0:{durations:[120,120,120],active:[1],frames:select([6,7,8])},
 skill1:{durations:[180,150,150],active:[1],frames:select([9,17,11])},
 skill2:{durations:[240,180,180],active:[1],frames:select([9,16,11])}
 });
}
for(let hero=0;hero<3;hero++){
const guard={x:hero*512,y:0,w:hero<2?580:512,h:550,px:245,py:536,scale:.34,guardMask:hero<2,file:'party-guard-v2.png'};
const down={x:hero*512,y:600,w:512,h:424,px:270,py:380,scale:.34,file:'party-guard-down.png'};
Object.assign(characterClips[hero],{
 block:{loop:true,durations:[300],frames:[guard]},
 block_hit:{durations:[120],frames:[guard]},
 down:{durations:[500],frames:[down]}
});
}
// Shared runtime umbrella: pixel-grid geometry, one shaft, one canopy.
function travelUmbrella(ctx,hero,x,y,face,scale,opening,time){
 const a=Math.max(0,Math.min(1,opening));
 ctx.save();ctx.translate(Math.round(x),Math.round(y));ctx.scale(face*scale,scale);
 const col=[['#175b9d','#6cccf5','#d9f5ff'],['#11131f','#363746','#858899'],['#932c42','#d65b62','#f3c1a0']][hero];
 const dot=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x/2)*2,Math.round(y/2)*2,Math.max(2,Math.round(w/2)*2),Math.max(2,Math.round(h/2)*2))};
 // Folded weapon at the hip moves to the hand while opening.
 const ox=-12+30*a,oy=-30-73*a;
 dot(ox,oy-14,2,64,col[2]);dot(ox-6,oy+48,6,2,col[2]);
 const width=8+42*a,height=48-14*a,top=oy-28;
 for(let row=0;row<height;row+=2){
  const f=row/height,half=a<.1?6:Math.max(2,width*Math.sqrt(f));
  for(let xx=-half;xx<half;xx+=2){
   if(hero===2&&f>.65&&((Math.floor((xx+width)/10)%3===1)&&f>.76))continue;
   dot(ox+xx,top+row,2,2,Math.abs(xx)<2||Math.abs(xx-half)<3?col[2]:xx<0?col[0]:col[1]);
  }
 }
 if(hero===0){for(let n=-2;n<=2;n++)dot(ox+n*width/3,top+height-2,4,6,col[2])}
 if(hero===1&&a>.2){for(let n=0;n<6;n++)dot(ox+Math.sin(time*3+n)*width,top+height+n%3*4,4,4,'#24233099')}
 if(hero===2){for(let n=0;n<3;n++){dot(ox-10+n*6,top+height*.5,2,6,col[2]);dot(ox-12+n*6,top+height*.5+2,6,2,col[2])}}
 ctx.restore();
}
const images={};
if(typeof Image!=='undefined') for(const set of characterClips)for(const clip of Object.values(set))for(const f of clip.frames){
 const file=f.file||clip.file;if(!images[file]){let im=new Image();im.src='assets/pixel/'+file;images[file]=im}
}
function draw(ctx,action,seconds,x,y,face=1,scale=1,hero=0){
 const set=characterClips[hero]||clips,clip=set[action]||set.idle,f=clip.frames[frameAt(clip,seconds)],im=images[f.file||clip.file];
 if(!im||!im.complete||!im.naturalWidth)return false;

 ctx.save();ctx.imageSmoothingEnabled=false;ctx.translate(Math.round(x),Math.round(y));ctx.scale(face*scale,scale);
 if(action==='block_hit')ctx.translate(-Math.round(7*Math.max(0,1-seconds/.12)),0);
 if(action==='block'||action==='block_hit'){const u=f.scale,l=-f.px*u,t=-f.py*u;ctx.beginPath();ctx.moveTo(l,t);ctx.lineTo(l+f.w*u,t);ctx.lineTo(l+f.w*u,t+550*u);ctx.lineTo(l,t+550*u);ctx.lineTo(l,t+440*u);ctx.lineTo(l+68*u,t+400*u);ctx.lineTo(l+68*u,t+150*u);ctx.lineTo(l,t+100*u);ctx.closePath();ctx.clip()}
 if(f.guardMask){const l=-f.px*f.scale,t=-f.py*f.scale,u=f.scale;ctx.beginPath();ctx.moveTo(l,t);ctx.lineTo(l+512*u,t);ctx.lineTo(l+512*u,t+170*u);ctx.lineTo(l+580*u,t+285*u);ctx.lineTo(l+580*u,t+335*u);ctx.lineTo(l+512*u,t+430*u);ctx.lineTo(l+512*u,t+550*u);ctx.lineTo(l,t+550*u);ctx.closePath();ctx.clip()}
 if(f.tailMask){
 const left=-f.px*f.scale,top=-f.py*f.scale;
 ctx.beginPath();ctx.moveTo(left,top);ctx.lineTo(left+256*f.scale,top);ctx.lineTo(left+256*f.scale,top+170*f.scale);ctx.lineTo(left+f.w*f.scale,top+170*f.scale);ctx.lineTo(left+f.w*f.scale,top+220*f.scale);ctx.lineTo(left+256*f.scale,top+220*f.scale);ctx.lineTo(left+256*f.scale,top+f.h*f.scale);ctx.lineTo(left,top+f.h*f.scale);ctx.closePath();ctx.clip();
 }
 ctx.drawImage(im,f.x,f.y,f.w,f.h,-f.px*f.scale,-f.py*f.scale,f.w*f.scale,f.h*f.scale);ctx.restore();return true;
}

// Effects are snapped to a 3px grid; no extra image frames or blur are needed.
function fx(ctx,action,t,x,y,face=1,scale=1,hero=0){
 ctx.save();ctx.translate(Math.round(x),Math.round(y));ctx.scale(face*scale,scale);
 const palette=hero===1?{'#70d9ff':'#767784','#ecffff':'#cbc7d8','#a9e8ff':'#777182','#bcefff':'#9d96aa'}:hero===2?{'#70d9ff':'#ed6275','#ecffff':'#ffd2a5','#a9e8ff':'#f0878f','#bcefff':'#f7b6a3'}:{};
 const dot=(x,y,size,color)=>{ctx.fillStyle=palette[color]||color;ctx.fillRect(Math.round(x/3)*3,Math.round(y/3)*3,size,size)};
 const line=(x1,y1,x2,y2,color,size=3)=>{const n=Math.max(1,Math.ceil(Math.hypot(x2-x1,y2-y1)/3));for(let i=0;i<=n;i++)dot(x1+(x2-x1)*i/n,y1+(y2-y1)*i/n,size,color)};
 const crystal=(x,y,h)=>{line(x,y,x-8,y-h+10,'#2e8dd2',6);line(x-8,y-h+10,x,y-h,'#d6ffff',3);line(x,y-h,x+9,y-h+14,'#9eeeff',3);line(x+9,y-h+14,x,y,'#5ecbfa',5)};

 if(hero>0&&action.startsWith('skill')){
 const n=Number(action.slice(-1)),u=t-[.12,.18,.24][n];
 if(u>=0&&u<.9){ctx.globalAlpha=1-u/.9;
 if(hero===1){
  if(n===0){let xx=u*230;line(xx-45,0,xx+55,-110,'#171824',9);line(xx-40,0,xx+60,-110,'#bbb4d0',3)}
  else{for(let i=0;i<28;i++){let a=i*Math.PI/14,r=n===1?55+(i%3)*10:Math.max(8,110-u*110);dot(Math.cos(a)*r,-55+Math.sin(a)*r,9+i%3*3,'#11121c');if(i%3===0)dot(Math.cos(a)*(r+5),-55+Math.sin(a)*(r+5),3,'#858294')}}
 }else{
  if(n===1){for(let i=0;i<20;i++){let a=i*Math.PI/10;line(Math.cos(a)*65,-55+Math.sin(a)*65,Math.cos(a)*(i%2?76:70),-55+Math.sin(a)*(i%2?76:70),'#ef7b88',4)}}
  else{for(let i=0;i<(n===2?11:6);i++){let xx=n===2?(i-5)*26:15+i*30;if(u<i*.025)continue;let h=40+20*Math.sin(i*2);line(xx,0,xx+8,-h,'#b92d4e',7);line(xx+8,-h,xx+17,-h+12,'#ffa7a0',3);line(xx+4,-h/2,xx-9,-h/2-8,'#e56b7b',3)}}
 }
 }
 ctx.restore();return;
 }
 if(action==='light'||action==='heavy'){
  const start=action==='heavy'?.20:.085,duration=action==='heavy'?.22:.15,u=(t-start)/duration;
  if(u>=0&&u<1){ctx.globalAlpha=1-u;for(let i=0;i<24;i++){const a=-1.6+i*.115,r=action==='heavy'?100:76;dot(Math.cos(a)*r,Math.sin(a)*r-48,6,'#70d9ff');if(i%2===0)dot(Math.cos(a)*(r+7),Math.sin(a)*(r+7)-48,3,'#ecffff')}}
 }else if(action==='dash'){for(let i=0;i<5;i++){ctx.globalAlpha=Math.max(0,1-t/.3)*.6;line(-20-i*15,-30-i%3*18,-65-i*15,-30-i%3*18,'#a9e8ff',3)}}
 else if(action==='jump'){for(let i=0;i<7;i++){ctx.globalAlpha=Math.max(0,1-t/.7);dot(-18+i*6,8+t*65+i%2*9,3,'#bcefff')}}
 else if(action==='hurt'){if(t<.22){ctx.globalAlpha=1-t/.22;for(let i=0;i<8;i++){let a=i*Math.PI/4;line(Math.cos(a)*12,-60+Math.sin(a)*12,Math.cos(a)*30,-60+Math.sin(a)*30,'#fff0c6',3)}}}
 else if(action==='skill0'&&t>=.12){let u=t-.12;if(u<.65){ctx.globalAlpha=1-u/.65;let xx=30+u*230;line(xx-50,-48,xx+25,-48,'#69ceff',6);line(xx+25,-48,xx+5,-65,'#e0ffff');line(xx+25,-48,xx+5,-31,'#e0ffff')}} 
 else if(action==='skill1'&&t>=.18){let u=t-.18;if(u<.8){ctx.globalAlpha=1-u/.8;for(let i=0;i<6;i++)if(u>i*.055)crystal(15+i*32,0,35+18*Math.sin(i*2))}}
 else if(action==='skill2'&&t>=.24){let u=t-.24;if(u<.9){ctx.globalAlpha=1-u/.9;for(let i=0;i<12;i++){let a=i*Math.PI/6,r=35+u*125;crystal(Math.cos(a)*r,-55+Math.sin(a)*r,28)} }}
 ctx.restore();
}
const apis=characterClips.map((set,hero)=>({clips:set,frameAt,draw:(ctx,a,t,x,y,face=1,scale=1)=>draw(ctx,a,t,x,y,face,scale,hero),fx:(ctx,a,t,x,y,face=1,scale=1)=>fx(ctx,a,t,x,y,face,scale,hero)}));
root.SeolPixel=apis[0];
root.PartyPixel={forHero:hero=>apis[hero]||apis[0],travelUmbrella,characters:['설','무영','홍아']};
root.SeolPixel.forHero=root.PartyPixel.forHero;
if(typeof module!=='undefined')module.exports=root.SeolPixel;
})(typeof window!=='undefined'?window:globalThis);
