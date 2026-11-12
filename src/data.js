export const schema='fieldwork.record.v1';
export function inspectGLB(buffer){
 const d=new DataView(buffer);if(buffer.byteLength<20||d.getUint32(0,true)!==0x46546c67||d.getUint32(4,true)!==2)throw Error('Expected a valid GLB 2.0 file. OBJ and glTF sidecar files are not supported.');
 if(d.getUint32(8,true)!==buffer.byteLength)throw Error('GLB length does not match its header; download may be incomplete.');
 const n=d.getUint32(12,true);if(d.getUint32(16,true)!==0x4e4f534a||20+n>buffer.byteLength)throw Error('Missing or incomplete GLB JSON chunk.');
 const j=JSON.parse(new TextDecoder().decode(new Uint8Array(buffer,20,n)));
 for(const x of [...(j.buffers||[]),...(j.images||[])])if(x.uri&&!x.uri.startsWith('data:'))throw Error('Use a self-contained GLB with embedded textures and buffers. External resources are not loaded.');
 const unsupported=['KHR_draco_mesh_compression','EXT_meshopt_compression','KHR_texture_basisu'];
 if((j.extensionsUsed||[]).some(x=>unsupported.includes(x)))throw Error('This scan uses Draco, Meshopt, or KTX2 compression. This build has no decoder for it; provide a self-contained uncompressed GLB. The original file was not modified.');
 if((j.skins||[]).length||(j.animations||[]).length||(j.meshes||[]).some(m=>m.primitives.some(p=>p.targets?.length)))throw Error('Animated, skinned, or morph-target models are not supported by the static specimen coordinate system.');
 return j;
}
export const distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
const point=p=>Array.isArray(p)&&p.length===3&&p.every(Number.isFinite);
export function validateRecord(r,fingerprint){
 if(r.schema!==schema||r.fingerprint!==fingerprint)throw Error('Record does not belong to this exact GLB. Open the matching scan first.');
 if(!Array.isArray(r.markers)||r.markers.length>1000||!r.markers.every(m=>point(m.position)&&typeof m.label==='string'&&m.label.length<=120&&typeof m.note==='string'&&m.note.length<=4000))throw Error('Invalid marker data.');
 if(!Array.isArray(r.measurements)||r.measurements.length>1000||!r.measurements.every(m=>point(m.a)&&point(m.b)))throw Error('Invalid measurement data.');
 if(!r.metadata||typeof r.metadata!=='object'||Array.isArray(r.metadata)||Object.values(r.metadata).some(v=>typeof v!=='string'||v.length>20000))throw Error('Invalid metadata.');
 if(r.mmPerUnit!==null&&(!Number.isFinite(r.mmPerUnit)||r.mmPerUnit<=0||typeof r.scaleSource!=='string'||!r.scaleSource.trim()))throw Error('Physical calibration requires a positive factor and source.');
 return {schema,fingerprint,markers:r.markers.map(m=>({id:crypto.randomUUID(),position:m.position,label:m.label,note:m.note})),measurements:r.measurements.map(m=>({id:crypto.randomUUID(),a:m.a,b:m.b})),metadata:r.metadata,mmPerUnit:r.mmPerUnit,scaleSource:typeof r.scaleSource==='string'?r.scaleSource:''};
}
export function safeAsset(path){if(typeof path!=='string'||!path||path.startsWith('/')||path.split('/').includes('..'))throw Error('Catalog assets must use relative paths.');const u=new URL(path,document.baseURI);if(u.origin!==location.origin)throw Error('Catalog assets must be hosted with this gallery.');return u.href;}
export function saveDownload(value,name){const u=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);}
