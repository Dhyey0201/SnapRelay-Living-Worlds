'use client';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls, Sparkles } from '@react-three/drei';
import { useEffect, useRef, useState } from 'react';
import type { Mesh } from 'three';
import type { CharacterState } from '@/lib/engine/schema';

function Creature({state}:{state:CharacterState}) {
 const body=useRef<Mesh>(null); useFrame(({clock, pointer})=>{if(body.current){body.current.position.y=Math.sin(clock.elapsedTime*1.6)*.08;body.current.rotation.y=pointer.x*.12;}});
 const color=`hsl(${state.bodyHue}, 62%, 72%)`;
 return <Float speed={1.5} floatIntensity={.3} rotationIntensity={.1}>
  <group ref={body} scale={state.sizeScale}>
   <mesh position={[0,0,0]} castShadow><sphereGeometry args={[1,48,48]}/><meshStandardMaterial color={color} roughness={.28} metalness={.04}/></mesh>
   <mesh position={[-.32,.23,.83]}><sphereGeometry args={[.2,24,24]}/><meshStandardMaterial color="white"/></mesh><mesh position={[.32,.23,.83]}><sphereGeometry args={[.2,24,24]}/><meshStandardMaterial color="white"/></mesh>
   <mesh position={[-.29,.22,1.005]}><sphereGeometry args={[.09,20,20]}/><meshStandardMaterial color="#25243a"/></mesh><mesh position={[.35,.22,1.005]}><sphereGeometry args={[.09,20,20]}/><meshStandardMaterial color="#25243a"/></mesh>
   <mesh position={[-.33,.31,1.08]}><sphereGeometry args={[.033,12,12]}/><meshBasicMaterial color="white"/></mesh><mesh position={[.31,.31,1.08]}><sphereGeometry args={[.033,12,12]}/><meshBasicMaterial color="white"/></mesh>
   <mesh position={[-.57,-.08,.82]} scale={[.15,.075,.025]}><sphereGeometry args={[1,18,18]}/><meshBasicMaterial color="#ed9da9" transparent opacity={.6}/></mesh><mesh position={[.57,-.08,.82]} scale={[.15,.075,.025]}><sphereGeometry args={[1,18,18]}/><meshBasicMaterial color="#ed9da9" transparent opacity={.6}/></mesh>
   <mesh position={[0,-.19,.965]} rotation={[0,0,Math.PI]}><torusGeometry args={[.12,.023,10,24,Math.PI]}/><meshStandardMaterial color="#623e69"/></mesh>
   <mesh position={[-.56,.77,.02]} rotation={[0,0,.35]}><sphereGeometry args={[.19,24,16]}/><meshStandardMaterial color={state.leafCount?'#72c99b':'#a899dd'}/></mesh>
   <mesh position={[.56,.77,.02]} rotation={[0,0,-.35]}><sphereGeometry args={[.19,24,16]}/><meshStandardMaterial color={state.leafCount?'#72c99b':'#a899dd'}/></mesh>
   {state.glasses&&<group><mesh position={[-.31,.23,1.02]}><torusGeometry args={[.23,.026,8,28]}/><meshStandardMaterial color="#735e37"/></mesh><mesh position={[.32,.23,1.02]}><torusGeometry args={[.23,.026,8,28]}/><meshStandardMaterial color="#735e37"/></mesh><mesh position={[0,.23,1.02]}><boxGeometry args={[.11,.035,.035]}/><meshStandardMaterial color="#735e37"/></mesh></group>}
   {state.leafCount>0&&<><mesh position={[-.3,1.02,.1]} rotation={[0,0,.55]}><sphereGeometry args={[.15,18,12]}/><meshStandardMaterial color="#61bd86"/></mesh><mesh position={[.3,1.02,.1]} rotation={[0,0,-.55]}><sphereGeometry args={[.15,18,12]}/><meshStandardMaterial color="#84d69e"/></mesh></>}
   {state.steamAura&&<Sparkles count={9} scale={2.4} size={4} speed={.25} color="#ffcf83"/>}
   {state.pixelAura&&<Sparkles count={16} scale={2.8} size={3} speed={.6} color="#99efff"/>}
   {state.orbitingStars>0&&<Sparkles count={state.orbitingStars} scale={2.2} size={5} speed={.4} color="#ffdf70"/>}
   <mesh position={[0,-1.05,0]} rotation={[-Math.PI/2,0,0]} scale={[.77,.35,1]}><circleGeometry args={[1,40]}/><meshBasicMaterial color="#88809e" transparent opacity={.22}/></mesh>
  </group>
 </Float>;
}

function MiloFallback({state,className}:{state:CharacterState;className:string}) {
 return <div className={`milo-fallback ${className}`} role="img" aria-label={`${state.name}, level ${state.level} character preview`}>
  <div className="fallback-creature" style={{backgroundColor:`hsl(${state.bodyHue}, 62%, 74%)`}}>
   <span className="fallback-ear ear-left"/><span className="fallback-ear ear-right"/>
   <span className="fallback-eye eye-left"><i/></span><span className="fallback-eye eye-right"><i/></span>
   <span className="fallback-blush blush-left"/><span className="fallback-blush blush-right"/>
   <span className={`fallback-smile ${state.mood==='sleepy'?'sleepy':''}`}/>
   {state.glasses&&<span className="fallback-glasses"><i/><i/><b/></span>}
   {state.leafCount>0&&<span className="fallback-leaves"><i/><i/></span>}
   {state.steamAura&&<span className="fallback-steam"><i/><i/><i/></span>}
   {state.pixelAura&&<span className="fallback-pixels"><i/><i/><i/><i/></span>}
   {state.orbitingStars>0&&<span className="fallback-star">✦</span>}
   {state.ribbonCount>0&&<span className="fallback-ribbon">✧</span>}
   <span className="fallback-foot foot-left"/><span className="fallback-foot foot-right"/>
  </div>
  <span className="fallback-shadow"/><span className="fallback-caption">2D PREVIEW · WEBGL UNAVAILABLE</span>
 </div>;
}

function canRenderWebGL() {
 try {
  const canvas=document.createElement('canvas');
  const context=canvas.getContext('webgl2')??canvas.getContext('webgl');
  if(context)context.getExtension('WEBGL_lose_context')?.loseContext();
  return context!==null;
 } catch { return false; }
}

export default function Milo({state,className=''}:{state:CharacterState;className?:string}) {
 const [webgl,setWebgl]=useState(false);
 useEffect(()=>{const frame=requestAnimationFrame(()=>setWebgl(canRenderWebGL()));return()=>cancelAnimationFrame(frame);},[]);
 if(!webgl)return <MiloFallback state={state} className={className}/>;
 return <div className={`milo-canvas ${className}`} aria-label={`${state.name}, level ${state.level} 3D character`}><Canvas camera={{position:[0,0,4.3],fov:42}} dpr={[1,1.6]}><ambientLight intensity={1.6}/><directionalLight position={[3,4,5]} intensity={2.2} castShadow/><pointLight position={[-3,1,2]} intensity={.7} color="#fff0b0"/><Creature state={state}/><OrbitControls enableZoom={false} enablePan={false} minPolarAngle={Math.PI/2.5} maxPolarAngle={Math.PI/1.7}/></Canvas></div>;
}
