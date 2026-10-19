const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm');
const api=require('../dist/pixel-animation.js');
assert.equal(api.frameAt(api.clips.light,.084),0);
assert.equal(api.frameAt(api.clips.light,.085),1);
assert.equal(api.frameAt(api.clips.light,3),2);
assert.equal(api.frameAt(api.clips.run,.56),0);
for(const clip of Object.values(api.clips)){
 assert.equal(clip.frames.length,clip.durations.length);
 for(const f of clip.frames){assert.ok(f.w>0&&f.h>0);assert.ok(f.px>=0&&f.py>=0)}
}
const plan=JSON.parse(fs.readFileSync('dist/assets/pixel/animation-plan.json'));
assert.equal(plan.skills.length,9);
for(const a of plan.actions){assert.equal(a.frames,a.durationsMs.length);for(const i of a.activeFrames)assert.ok(i<a.frames)}
for(const s of plan.skills)for(const i of s.cast.emitFrames)assert.ok(i<s.cast.frames);
console.log('PASS: frame timing, loop/clamp, source rectangles, 20 motion definitions and 9 skill schedules.');

assert.deepEqual([api.clips.idle.frames.length,api.clips.run.frames.length,api.clips.light.frames.length],[2,4,3]);
assert.equal(api.clips.light.durations.reduce((a,b)=>a+b,0),280);
assert.equal(api.clips.run.durations.reduce((a,b)=>a+b,0),560);
for(const id of ['idle','run','light']){const item=plan.actions.find(a=>a.id===id);assert.deepEqual(item.durationsMs,api.clips[id].durations);assert.equal(item.frames,api.clips[id].frames.length);}
