import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {inspectGLB} from './data.js';
const vec=a=>new T.Vector3(...a);
function disposeTree(root){const geometries=new Set(),materials=new Set(),textures=new Set();root.traverse(o=>{if(o.geometry)geometries.add(o.geometry);for(const m of [o.material].flat().filter(Boolean)){materials.add(m);for(const v of Object.values(m))if(v?.isTexture)textures.add(v);}});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>{t.dispose();t.source?.data?.close?.();});}
export class SpecimenView{
 constructor(host,index,events){
  this.host=host;this.index=index;this.events=events;this.token=0;this.speed=8;this.spinning=false;this.radius=1;this.tool='navigate';this.visible=true;this.materials=new Map();this.dirty=true;
  this.canvas=document.createElement('canvas');this.canvas.tabIndex=0;this.canvas.setAttribute('aria-label',`3D specimen ${index?'B':'A'}. Drag to orbit, use view buttons for orientation.`);host.prepend(this.canvas);
  this.renderer=new T.WebGLRenderer({canvas:this.canvas,antialias:true,alpha:true,powerPreference:'low-power'});this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));this.renderer.outputColorSpace=T.SRGBColorSpace;this.renderer.setClearColor(0x000000,0);
  this.scene=new T.Scene();this.camera=new T.OrthographicCamera(-1,1,1,-1,.01,100);this.camera.position.set(0,0,4);
  this.orbit=new OrbitControls(this.camera,this.canvas);this.orbit.enableDamping=false;this.orbit.minZoom=.1;this.orbit.maxZoom=40;this.orbit.addEventListener('change',()=>{this.dirty=true;if(!this.syncing)this.events.camera(this);});
  this.ambient=new T.AmbientLight(0xffffff,.5);this.key=new T.DirectionalLight(0xffffff,3);this.fill=new T.DirectionalLight(0xffffff,.5);this.scene.add(this.ambient,this.key,this.fill);
  this.ray=new T.Raycaster();this.pointer=new T.Vector2();this.status=host.querySelector('.view-status');this.labels=host.querySelector('.labels');this.meta=host.querySelector('.view-meta');
  this.canvas.addEventListener('pointerdown',e=>{this.down={x:e.clientX,y:e.clientY,id:e.pointerId};this.events.active(this.index);});
  this.canvas.addEventListener('pointerup',e=>{if(this.down?.id===e.pointerId&&Math.hypot(e.clientX-this.down.x,e.clientY-this.down.y)<6&&this.tool!=='navigate'&&this.root){const rect=this.canvas.getBoundingClientRect();this.pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);this.scene.updateMatrixWorld(true);this.ray.setFromCamera(this.pointer,this.camera);const hit=this.ray.intersectObject(this.root,true)[0];if(hit)this.events.pick(this,this.space.worldToLocal(hit.point.clone()).toArray());}this.down=null;});
  this.canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();this.say('Graphics context lost. Reload this page to restore the viewer; export notes first.',true);});
  this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(host);
 }
 say(message,error=false){this.status.textContent=message;this.status.classList.toggle('error',error);}
 resize(){const w=this.host.clientWidth,h=this.host.clientHeight;if(!w||!h)return;this.renderer.setSize(w,h,false);const aspect=w/h,extent=this.radius*1.3/Math.min(1,aspect);this.camera.left=-extent*aspect;this.camera.right=extent*aspect;this.camera.top=extent;this.camera.bottom=-extent;this.camera.updateProjectionMatrix();this.dirty=true;}
 async load(buffer){const seq=++this.token;inspectGLB(buffer);const gltf=await new GLTFLoader().parseAsync(buffer,'');if(seq!==this.token){disposeTree(gltf.scene);return false;}
  const root=gltf.scene;root.updateMatrixWorld(true);const box=new T.Box3().setFromObject(root,true),center=box.getCenter(new T.Vector3()),radius=box.getSize(new T.Vector3()).length()/2;if(!Number.isFinite(radius)||radius<=0){disposeTree(root);throw Error('Scan has no measurable mesh bounds.');}
  this.clear();this.root=root;this.center=center;this.radius=radius;this.pivot=new T.Group();this.space=new T.Group();this.space.position.copy(center).negate();this.space.add(root);this.pivot.add(this.space);this.scene.add(this.pivot);
  this.meshes=[];root.traverse(o=>{if(o.isMesh){this.meshes.push(o);this.materials.set(o,o.material);}});this.overlay=new T.Group();this.space.add(this.overlay);this.reset();this.say('');this.meta.textContent='ORTHOGRAPHIC / ORIGINAL GEOMETRY';this.resize();return true;
 }
 clear(){if(this.pivot){this.restoreMaterials();disposeTree(this.pivot);this.scene.remove(this.pivot);}this.pivot=null;this.root=null;this.materials.clear();this.labels.replaceChildren();}
 restoreMaterials(){for(const [mesh,original]of this.materials){if(mesh.material!==original){for(const m of [mesh.material].flat())m.dispose();mesh.material=original;}}}
 surface(mode){if(!this.root)return;this.restoreMaterials();for(const [mesh,original]of this.materials){if(mode==='original')continue;mesh.material=mode==='normals'?new T.MeshNormalMaterial({side:T.DoubleSide}):mode==='silhouette'?new T.MeshBasicMaterial({color:0x080c10,side:T.DoubleSide}):mode==='wire'?new T.MeshBasicMaterial({color:0xbad4e6,wireframe:true}):new T.MeshStandardMaterial({color:0xb8b6ad,roughness:.9,metalness:0,side:T.DoubleSide});}this.host.style.background=mode==='silhouette'?'#c4cdd2':'';this.dirty=true;}
 light(s){const a=T.MathUtils.degToRad(s.azimuth),e=T.MathUtils.degToRad(s.elevation);this.key.position.set(Math.sin(a)*Math.cos(e),Math.sin(e),Math.cos(a)*Math.cos(e));this.fill.position.set(-Math.sin(a)*Math.cos(e),Math.sin(e),-Math.cos(a)*Math.cos(e));this.key.intensity=s.strength;this.ambient.intensity=s.ambient;this.fill.intensity=s.opposing;this.dirty=true;}
 reset(){if(this.pivot)this.pivot.rotation.set(0,0,0);this.spinning=false;this.orient('front');}
 orient(name){const dirs={front:[0,0,1],back:[0,0,-1],left:[-1,0,0],right:[1,0,0],top:[0,1,0],bottom:[0,-1,0],oblique:[1,.65,1]};const d=vec(dirs[name]||dirs.front).normalize();this.camera.up.set(0,1,0);this.camera.position.copy(d.multiplyScalar(this.radius*4));this.camera.near=Math.max(this.radius/10000,1e-8);this.camera.far=this.radius*100;this.camera.zoom=1;this.orbit.target.set(0,0,0);this.camera.updateProjectionMatrix();this.orbit.update();this.dirty=true;}
 copyView(from){if(!from.root||!this.root)return;this.syncing=true;const ratio=this.radius/from.radius;this.camera.position.copy(from.camera.position).multiplyScalar(ratio);this.camera.up.copy(from.camera.up);this.orbit.target.copy(from.orbit.target).multiplyScalar(ratio);this.camera.zoom=from.camera.zoom;this.camera.updateProjectionMatrix();this.orbit.update();this.syncing=false;this.dirty=true;}
 setTool(tool){this.tool=tool;this.orbit.enabled=tool==='navigate';this.canvas.style.cursor=tool==='navigate'?'grab':'crosshair';}
 setRecord(record){this.record=record;this.rebuildOverlays();}
 rebuildOverlays(){if(!this.root)return;disposeTree(this.overlay);this.overlay.clear();this.labels.replaceChildren();this.labelNodes=[];for(const [i,m]of this.record.markers.entries()){const el=document.createElement('button');el.className='point-label';el.textContent=String(i+1);el.title=m.label;el.setAttribute('aria-label',`Edit marker ${i+1}: ${m.label}`);el.onclick=()=>this.events.edit(this,m);this.labels.append(el);this.labelNodes.push({el,position:vec(m.position)});}
  for(const m of this.record.measurements){const g=new T.BufferGeometry().setFromPoints([vec(m.a),vec(m.b)]);this.overlay.add(new T.Line(g,new T.LineBasicMaterial({color:0xa6c9f5,depthTest:false,transparent:true,opacity:.9})));for(const p of [m.a,m.b]){const dot=new T.Mesh(new T.SphereGeometry(this.radius*.008,8,6),new T.MeshBasicMaterial({color:0xa6c9f5,depthTest:false}));dot.position.copy(vec(p));dot.renderOrder=10;this.overlay.add(dot);}}
 this.dirty=true;
 }
 draw(dt){if(!this.visible)return;if(this.pivot&&this.spinning){this.pivot.rotation.y+=T.MathUtils.degToRad(this.speed)*dt;this.dirty=true;}if(!this.dirty)return;this.scene.updateMatrixWorld(true);this.renderer.render(this.scene,this.camera);
  for(const item of this.labelNodes||[]){const world=this.space.localToWorld(item.position.clone()),p=world.clone().project(this.camera);this.ray.setFromCamera(new T.Vector2(p.x,p.y),this.camera);const hit=this.ray.intersectObject(this.root,true)[0];const visible=Math.abs(p.x)<=1&&Math.abs(p.y)<=1&&Math.abs(p.z)<=1&&(!hit||hit.point.distanceTo(world)<this.radius*.012);item.el.hidden=!visible;item.el.style.left=`${(p.x*.5+.5)*100}%`;item.el.style.top=`${(-p.y*.5+.5)*100}%`;}
 this.dirty=false;
 }
 dispose(){this.token++;this.clear();this.resizeObserver.disconnect();this.orbit.dispose();this.renderer.dispose();}
}
