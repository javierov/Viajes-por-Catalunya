const CACHE="vc-viajes-v4",MAPA="vc-mapa";
const FILES=["./","./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png","./apple-touch-icon.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>Promise.all(FILES.map(f=>fetch(f,{cache:"reload"}).then(r=>r.ok&&c.put(f,r)).catch(()=>{})))));self.skipWaiting();});
// solo borra copias propias (las demás apps viven en el mismo sitio)
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>(k.startsWith("vc-")&&k!==CACHE&&k!==MAPA)||k==="viajes-v1"||k==="viajes-v2").map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener("fetch",e=>{
  const r=e.request;if(r.method!=="GET")return;const u=new URL(r.url);
  // calles del mapa: primero la copia guardada (sirven sin señal)
  if(u.hostname.endsWith("tile.openstreetmap.org")){
    e.respondWith(caches.open(MAPA).then(c=>c.match(r).then(m=>m||fetch(r).then(n=>{if(n.ok||n.type==="opaque")c.put(r,n.clone());return n}))));return}
  if(u.origin!==location.origin)return; // horarios en vivo: siempre de la red
  if(r.mode==="navigate"){
    e.respondWith(fetch(r,{cache:"no-cache"}).then(n=>{const cp=n.clone();caches.open(CACHE).then(c=>c.put("./index.html",cp));return n}).catch(()=>caches.match("./index.html").then(m=>m||caches.match("./"))));return}
  e.respondWith(fetch(r).then(n=>{const cp=n.clone();caches.open(CACHE).then(c=>c.put(r,cp));return n}).catch(()=>caches.match(r)));
});
self.addEventListener("notificationclick",e=>{e.notification.close();e.waitUntil(self.clients.matchAll({type:"window",includeUncontrolled:true}).then(cs=>{for(const c of cs){if(c.url.includes("Viajes-por-Catalunya")&&"focus" in c)return c.focus()}return self.clients.openWindow("./")}))});
