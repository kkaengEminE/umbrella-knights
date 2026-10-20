(function(root){
const enemyAtlas=typeof Image!=='undefined'?new Image():null;
if(enemyAtlas)enemyAtlas.src='assets/pixel/forest-enemies-v1.png';
const themes=[['#142536','#254752','#47706b','#829d7a'],['#202338','#39394f','#596272','#b1ad8e'],['#282333','#443449','#6e4a59','#b98e89']];
function rect(c,x,y,w,h,color){c.fillStyle=color;c.fillRect(Math.round(x/2)*2,Math.round(y/2)*2,Math.ceil(w/2)*2,Math.ceil(h/2)*2)}
function background(c,W,H,cam,time,stage){
const p=themes[stage%3];rect(c,0,0,W,H,p[0]);
for(let y=100;y<H;y+=48)rect(c,0,y,W,48,y<300?p[1]:p[2]);
for(let row=0;row<8;row++)for(let col=0;col<8;col++)if((row-3.5)**2+(col-3.5)**2<15)rect(c,920-cam*.05+col*6,60+row*6,6,6,'#c0cec0');
// Distant architecture separates the forest, abandoned city and bell tower.
if(stage>0)for(let i=-1;i<10;i++){
 const x=i*190-cam*.12%190,h=stage===1?160+(i%3)*42:220+(i%2)*60;
 rect(c,x,500-h,110,h,p[0]);
 for(let r=0;r<5;r++)rect(c,x+12+r*8,500-h-12-r*12,86-r*16,12,p[0]);
 for(let yy=520-h;yy<470;yy+=30)for(let xx=18;xx<100;xx+=28)rect(c,x+xx,yy,6,12,p[3]+'55');
}
for(let layer=0;layer<3;layer++){
const step=layer===0?160:220,offset=cam*[.1,.3,.55][layer],color=['#263d4b','#213943','#172d35'][layer];
for(let i=-2;i<12;i++){let x=i*step-offset%step,w=18+layer*10;
rect(c,x,0,w,530,color);for(let n=0;n<5;n++){rect(c,x-n*14,120+n*10,18,12,color);rect(c,x+w+n*14,240-n*12,18,14,color)}
for(let n=0;n<5;n++)rect(c,x-50+n*12,15+n*18,100-n*16,18,color);
rect(c,x+w-4,70,4,300,layer===2?'#314a48':color);
if(layer===2){for(let n=0;n<8;n++){rect(c,x+4+(n%3)*6,50+n*59,4,22,'#203b40');rect(c,x-12+n%3*6,510+n%2*6,20,6,'#213d3c')}
for(let n=0;n<9;n++){let tx=x-60+n*18,ty=90+(n%3)*12;rect(c,tx,ty,30,8,'#274b49');rect(c,tx+4,ty-6,18,6,'#315653')}}
}}
for(let i=0;i<22;i++){let x=((i*137-cam*.5)%W+W)%W,y=180+i*47%260;rect(c,x,y,2,2,'#c9cc8c')}
}
function ground(c,W,H,G,cam,platforms,stage){
const p=themes[stage%3];
rect(c,0,G,W,H-G,'#101e2b');
for(let wx=Math.floor(cam/32)*32;wx<cam+W+32;wx+=32){let x=wx-cam;
rect(c,x,G,32,6,p[3]);rect(c,x+2,G+6,28,10,p[2]);rect(c,x+6,G+16,20,8,p[1]);
for(let y=G+32;y<H;y+=32){rect(c,x+(y%64?4:14),y,12,4,'#2d414b');rect(c,x+4,y+12,4,4,'#3e5457')}
if((wx/32)%3===0){rect(c,x+8,G-12,4,12,p[3]);rect(c,x+4,G-16,4,6,p[2]);rect(c,x+12,G-8,4,8,p[3])}
}
for(const a of platforms){let x=a.x-cam;rect(c,x,a.y,a.w,6,p[3]);rect(c,x+4,a.y+6,a.w-8,12,p[2]);for(let i=8;i<a.w-12;i+=24)rect(c,x+i,a.y+18,16,10,p[1])}
}
const body=[
'...11......11...',
'...121....121...',
'....12211221....',
'...1222222221...',
'..122322232221..',
'..122322232221..',
'.12222222222221.',
'.12222222222221.',
'.12222222222221.',
'..122222222221..',
'..122222222221..',
'...1222222221...',
'...1111111111...',
'...11..11..11...'];
function monster(c,e,cam,time,stage=0){
if(e.hp<=0)return;let s=e.boss?7:4,x=Math.round(e.x-cam-8*s),y=e.y-14*s;
const recoil=e.hit>0?-e.face*4:0,wind=e.wind>0?Math.round(e.wind*5):0;x+=recoil;y+=wind;
const palette=['transparent','#102330',e.hit>0?'#e3f1de':e.boss?'#59646a':['#46646a','#5c6659','#5c586c'][e.type],e.wind>0?'#ff9575':'#e7cd8e'];
let bob=e.wind>0?0:Math.round(Math.sin(e.phase*4)*2);
const frame=e.wind>0?4:e.swing>0?5:e.moving?2+Math.floor(e.phase*8)%2:Math.floor(e.phase*2)%2;
if(stage===0&&enemyAtlas&&enemyAtlas.complete&&enemyAtlas.naturalWidth){
 const factor=e.boss?.45:.34;
 c.save();c.imageSmoothingEnabled=false;c.translate(Math.round(e.x-cam+recoil),Math.round(e.y+wind));c.scale(e.face||1,1);
 if(e.hit>0)c.globalAlpha=.65;
 let sx=frame*256,sw=256,px=128,py=e.boss?424:415;
 if(e.boss&&frame===4){sx=950;sw=300;px=202;
 c.beginPath();c.moveTo(-px*factor,-py*factor);c.lineTo((sw-px)*factor,-py*factor);c.lineTo((sw-px)*factor,(512-py)*factor);c.lineTo((74-px)*factor,(512-py)*factor);c.lineTo((74-px)*factor,(170-py)*factor);c.lineTo(-px*factor,(170-py)*factor);c.closePath();c.clip()}
 if(frame===5){sx=1260;sw=276;px=148}
 if(!e.boss&&frame===4)sw=240;
 c.drawImage(enemyAtlas,sx,e.boss?512:0,sw,512,-px*factor,-py*factor,sw*factor,512*factor);c.restore();
}else{
 for(let r=0;r<body.length;r++)for(let k=0;k<16;k++){const n=Number(body[r][k]);if(n)rect(c,x+k*s,y+r*s+bob,s,s,palette[n])}
}
if(e.wind>0){rect(c,e.x-cam-2,y-20,5,11,'#ffd7a2');rect(c,e.x-cam-2,y-5,5,4,'#ffd7a2');rect(c,e.x-cam+(e.face>0?8:-70),e.y-7,e.boss?110:60,4,'#d88165')}
if(e.hp<e.max&&!e.boss){rect(c,x,y-10,64,4,'#11232a');rect(c,x,y-10,64*e.hp/e.max,4,'#a6d4b7')}
if(e.slow>0)for(let i=0;i<4;i++)rect(c,x+i*14,e.y-8-i%2*8,6,12,'#82ddeb');
}
function props(c,cam,G,town,cleared){
if(town){for(const x of [460,860]){rect(c,x-100,330,200,G-330,'#344c50');for(let r=0;r<6;r++)rect(c,x-130+r*20,330-r*16,260-r*40,16,'#657c70');rect(c,x-22,422,44,104,'#172c35');for(const dx of [-70,55]){rect(c,x+dx,366,24,38,'#c3a866');rect(c,x+dx+10,366,4,38,'#344c50')}for(let y=350;y<G;y+=32)rect(c,x-100,y,200,2,'#253c44')}}
else{let x=3050-cam;rect(c,x,180,65,G-180,'#30474f');rect(c,x+195,180,65,G-180,'#30474f');for(let n=0;n<5;n++)rect(c,x+15+n*18,180-n*14,230-n*36,14,'#5a7070');for(let y=200;y<G;y+=32){rect(c,x,y,65,3,'#172f38');rect(c,x+195,y,65,3,'#172f38')}if(!cleared)for(let n=0;n<6;n++)rect(c,x+76+n*20,205,5,G-205,'#7b9290')}
}
function rain(c,W,H,time){for(let i=0;i<120;i++){let x=(i*73+time*80)%W,y=(i*109+time*580)%H;rect(c,x,y,2,8,'#89aeb166');rect(c,x-2,y+8,2,8,'#89aeb144')}}
function death(c,e,cam){const t=1-e.life/.45,size=e.boss?8:4;for(let i=0;i<16;i++){const a=i*Math.PI/8,r=t*(e.boss?95:55);rect(c,e.x-cam+Math.cos(a)*r,e.y-30+Math.sin(a)*r-t*25,size*(1-t)+2,size*(1-t)+2,'#a5b7ad'+Math.round(255*(1-t)).toString(16).padStart(2,'0'))}}
root.PixelWorld={background,ground,monster,props,rain,death};
})(typeof window!=='undefined'?window:globalThis);
