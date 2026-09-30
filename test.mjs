import test from 'node:test';
import assert from 'node:assert/strict';
import { solve } from './logic.mjs';

test('zero clue plus global total proves safe and mine cells', () => {
  const r = solve({width:3,height:1,cells:[0,null,null],mines:1});
  assert.deepEqual(r.safe,[1]); assert.deepEqual(r.mines,[2]); assert.equal(r.exact,true);
});
test('a true 50/50 remains uncertain', () => {
  const r = solve({width:3,height:1,cells:[null,1,null],mines:1});
  assert.deepEqual(r.safe,[]); assert.deepEqual(r.mines,[]);
  assert.equal(r.solutions,2); assert.deepEqual(r.probabilities.map(x=>x.probability),[0.5,0.5]);
});
test('subtracting a flag makes the other neighbor safe', () => {
  assert.deepEqual(solve({width:3,height:1,cells:['F',1,null]}).safe,[2]);
});
test('contradictory flags produce no recommended move', () => {
  const r=solve({width:2,height:1,cells:[0,'F']});
  assert.ok(r.contradiction); assert.deepEqual(r.safe,[]);
});
test('invalid boards and enumeration limits are rejected', () => {
  assert.throws(()=>solve({width:2,height:1,cells:[null]}),TypeError);
  assert.throws(()=>solve({width:1,height:1,cells:['hidden']}),TypeError);
  assert.throws(()=>solve({width:1,height:1,cells:[null],mines:2}),TypeError);
  assert.throws(()=>solve({width:1,height:1,cells:[null]},{maxUnknown:30}),TypeError);
});
test('budget exhaustion never fabricates probabilities', () => {
  const r=solve({width:19,height:1,cells:Array(19).fill(null)});
  assert.equal(r.exact,false); assert.equal(r.solutions,null); assert.deepEqual(r.probabilities,[]);
});
test('small boards agree with an independent exhaustive reference', () => {
  for(let actual=0;actual<64;actual++) {
    const width=3,height=2,cells=Array(6).fill(null);
    for(let i=0;i<6;i++) if(!((actual>>>i)&1) && i%2===0) {
      let n=0;
      for(let j=0;j<6;j++) if(i!==j && Math.abs(i%width-j%width)<=1 && Math.abs(Math.floor(i/width)-Math.floor(j/width))<=1) n+=(actual>>>j)&1;
      cells[i]=n;
    }
    const total=Array.from({length:6},(_,i)=>(actual>>>i)&1).reduce((a,b)=>a+b,0), possible=[];
    for(let mask=0;mask<64;mask++) {
      const bits=Array.from({length:6},(_,i)=>(mask>>>i)&1);
      if(bits.reduce((a,b)=>a+b,0)!==total)continue;
      if(cells.every((v,i)=>v===null||(!bits[i]&&bits.reduce((n,b,j)=>n+(i!==j&&Math.abs(i%3-j%3)<=1&&Math.abs(Math.floor(i/3)-Math.floor(j/3))<=1?b:0),0)===v)))possible.push(bits);
    }
    const r=solve({width,height,cells,mines:total});assert.equal(r.contradiction,null);
    for(const p of r.probabilities)assert.equal(p.probability,possible.reduce((n,b)=>n+b[p.index],0)/possible.length);
  }
});
