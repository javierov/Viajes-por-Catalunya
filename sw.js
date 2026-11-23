const CACHE="vc-viajes-v14",MAPA="vc-mapa";
const FILES=["./","./index.html","./maplibre-gl.js","./manifest.webmanifest","./icon-192.png","./icon-512.png","./apple-touch-icon.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>Promise.all(FILES.map(f=>fetch(f,{cache:"reload"}).then(r=>r.ok&&c.put(f,r)).catch(()=>{})))));self.skipWaiting();});
// solo borra copias propias (las demás apps viven en el mismo sitio)
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>(k.startsWith("vc-")&&k!==CACHE&&k!==MAPA)||k==="viajes-v1"||k==="viajes-v2").map(k=>caches.delete(k)))));self.clients.claim();});
const keyOf=u=>{const p=u.pathname;return p.endsWith("/")?"./index.html":"."+p.slice(p.lastIndexOf("/"))};
self.addEventListener("fetch",e=>{
  const r=e.request;if(r.method!=="GET")return;const u=new URL(r.url);
  // mapa: el estilo y la lista de teselas, primero la red; teselas, letras e iconos, primero la copia (sirven sin señal)
  if(u.hostname==="tiles.openfreemap.org"||u.hostname.endsWith("tile.openstreetmap.org")){
    const fresh=/\/styles\/|\/planet$/.test(u.pathname);
    e.respondWith(caches.open(MAPA).then(c=>fresh?fetch(r).then(n=>{if(n.ok)c.put(r,n.clone());return n}).catch(()=>c.match(r)):c.match(r).then(m=>m||fetch(r).then(n=>{if(n.ok)c.put(r,n.clone());return n}))));return}
  if(u.origin!==location.origin)return; // horarios en vivo: siempre de la red
  if(r.mode==="navigate"){
    const k=keyOf(u);
    e.respondWith(fetch(r,{cache:"no-cache"}).then(n=>{const cp=n.clone();if(n.ok)caches.open(CACHE).then(c=>c.put(k,cp));return n}).catch(()=>caches.match(k).then(m=>m||caches.match("./index.html"))));return}
  e.respondWith(fetch(r).then(n=>{const cp=n.clone();if(n.ok)caches.open(CACHE).then(c=>c.put(r,cp));return n}).catch(()=>caches.match(r)));
});
self.addEventListener("notificationclick",e=>{e.notification.close();e.waitUntil(self.clients.matchAll({type:"window",includeUncontrolled:true}).then(cs=>{for(const c of cs){if(c.url.includes("Viajes-por-Catalunya")&&"focus" in c)return c.focus()}return self.clients.openWindow("./")}))});
