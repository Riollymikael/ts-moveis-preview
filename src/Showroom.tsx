import { useEffect, useId, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { makeStudio, finishes, rooms } from './models/architecture'
import './showroom.css'

type Props = { fallbackImage?: string }
const referencePhotos = [
  'cozinha-madeira-planejada','closet-luxo-iluminado','painel-tv-ripado','quarto-cabeceira-led',
  'escritorio-painel-madeira','quarto-infantil-beliche','adega-espelho-iluminado',
]
const spotNames = ['Porta', 'Gaveta', 'Iluminação']
const spotDetails = [
  'A frente gira sobre o eixo lateral. Abra a porta para ver a divisão interna.',
  'Puxe a gaveta para observar o espaço interno e o movimento do módulo.',
  'A luz sob a prateleira destaca a textura e ajuda a visualizar os objetos.',
]
type ViewerSettings = { room:number, finish:number, door:boolean, drawer:boolean, light:boolean, assembly:number, spot:number | null }
const defaults:ViewerSettings = { room:0, finish:0, door:false, drawer:false, light:true, assembly:1, spot:null }
type CameraAction = 'closer'|'farther'|'left'|'right'|'reset'

function Viewport({settings, hero, selectSpot, fallbackImage, setAvailable}:Props & {
  settings:ViewerSettings, hero:boolean, selectSpot:(n:number)=>void, setAvailable:(value:boolean)=>void
}) {
  const host=useRef<HTMLDivElement>(null)
  const markers=useRef<(HTMLButtonElement|null)[]>([])
  const latest=useRef(settings)
  const invalidate=useRef<()=>void>(()=>{})
  const action=useRef<(a:CameraAction)=>void>(()=>{})
  const [failed,setFailed]=useState(false)
  useEffect(()=>{
    latest.current=settings
    invalidate.current()
  },[settings])
  useEffect(()=>{
    const node=host.current!
    let renderer:THREE.WebGLRenderer
    try { renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'low-power'}) }
    catch { setFailed(true); setAvailable(false); return }
    setFailed(false)
    setAvailable(true)
    renderer.shadowMap.enabled=true
    renderer.shadowMap.type=THREE.PCFSoftShadowMap
    renderer.toneMapping=THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure=1.1
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.65))
    const canvas=renderer.domElement
    canvas.setAttribute('aria-label','Maquete tridimensional do ambiente. Use as setas para girar e mais ou menos para ajustar o zoom.')
    canvas.tabIndex=0
    canvas.className='ts3d-canvas'
    node.prepend(canvas)
    const scene=new THREE.Scene()
    scene.background=new THREE.Color('#c6b9a7')
    const studio=makeStudio()
    const pmrem=new THREE.PMREMGenerator(renderer)
    const surroundings=new RoomEnvironment()
    const env=pmrem.fromScene(surroundings,.04)
    scene.environment=env.texture
    scene.environmentIntensity=.34
    surroundings.dispose()
    pmrem.dispose()
    const groundGeometry=new THREE.PlaneGeometry(200,200)
    const groundMaterial=new THREE.MeshStandardMaterial({color:'#b8ab99',roughness:.95})
    const ground=new THREE.Mesh(groundGeometry,groundMaterial)
    ground.rotation.x=-Math.PI/2
    ground.position.y=-.208
    ground.receiveShadow=true
    scene.add(ground)
    scene.add(new THREE.HemisphereLight('#fff4e6','#aa947d',1.75))
    const sun=new THREE.DirectionalLight('#ffecd4',2.8)
    sun.position.set(1.2,7,4.5)
    sun.castShadow=true
    sun.shadow.mapSize.set(1024,1024)
    Object.assign(sun.shadow.camera,{left:-6,right:6,top:5,bottom:-5,far:17})
    sun.shadow.normalBias=.014
    sun.shadow.bias=-.00035
    scene.add(sun)
    const camera=new THREE.PerspectiveCamera(34,1,.1,90)
    const controls=new OrbitControls(camera,canvas)
    controls.target.set(0,1.06,-.12)
    controls.enableDamping=true
    controls.dampingFactor=.13
    controls.enablePan=false
    controls.enableZoom=false
    controls.minPolarAngle=.45
    controls.maxPolarAngle=Math.PI*.49
    controls.minAzimuthAngle=-.62
    controls.maxAzimuthAngle=.91
    controls.rotateSpeed=.63
    const motion=window.matchMedia('(prefers-reduced-motion: reduce)')
    let currentRoom=studio.createRoom(latest.current.room), index=latest.current.room
    scene.add(currentRoom.root)
    let mounted=true,visible=true,raf=0,pending=true
    let targetDistance=8,door=0,drawer=0,glow=1,built=1
    let autoView=true,previousScroll=0
    const start=performance.now()
    const temp=new THREE.Vector3()
    const look=new THREE.Vector3()
    function widthDistance() { return 8.5*Math.max(1,1.53/camera.aspect) }
    function resetCamera() {
      targetDistance=widthDistance()
      camera.position.copy(controls.target).add(look.set(.45,.34,.89).normalize().multiplyScalar(targetDistance))
      controls.update()
    }
    function draw() {
      raf=0
      if(!mounted || !visible) return
      const state=latest.current
      if(index!==state.room) {
        scene.remove(currentRoom.root)
        currentRoom.root.traverse(object=>{if(object instanceof THREE.InstancedMesh) object.dispose()})
        currentRoom=studio.createRoom(state.room)
        index=state.room
        scene.add(currentRoom.root)
        autoView=true
        resetCamera()
        pending=true
      }
      const now=performance.now()
      const intro=!motion.matches&&autoView?Math.max(0,1-(now-start)/1850):0
      const distance=(autoView ? widthDistance()*(1+intro**2*.22-previousScroll*.09) : targetDistance)
      const ease=motion.matches?1:.13
      const currentDistance=controls.getDistance()
      const cameraMoving=Math.abs(distance-currentDistance)>.003
      if(cameraMoving) camera.position.sub(controls.target).multiplyScalar((currentDistance+(distance-currentDistance)*ease)/currentDistance).add(controls.target)
      const moved=controls.update()
      const opening=Number(state.door),pulling=Number(state.drawer),lighting=Number(state.light)
      const inMotion=Math.abs(opening-door)+Math.abs(pulling-drawer)+Math.abs(lighting-glow)+Math.abs(state.assembly-built)>.001
      if(inMotion||pending||intro||cameraMoving||moved) {
        door+=(opening-door)*ease
        drawer+=(pulling-drawer)*ease
        glow+=(lighting-glow)*ease
        built+=(state.assembly-built)*ease
        studio.wood.color.set(finishes[state.finish].tint)
        studio.lamp.emissiveIntensity=glow*3
        for(const item of currentRoom.doors) item.rotation.y=-door*1.48
        for(const item of currentRoom.drawers) item.position.z=drawer*.47 + (item.userData.restZ??(item.userData.restZ=item.position.z))
        for(const item of currentRoom.lights) item.intensity=glow*1.8
        for(const stage of currentRoom.stages) {
          const progress=THREE.MathUtils.smoothstep((built-stage.start)/.205,0,1)
          stage.object.visible=progress>.002
          stage.object.position[stage.axis]=stage.travel*(1-progress)
          stage.object.scale.y=.65+progress*.35
        }
        currentRoom.hotspotPositions.forEach((point,i)=>{
          const marker=markers.current[i]
          if(!marker) return
          temp.copy(point).project(camera)
          marker.style.left=(temp.x*.5+.5)*100+'%'
          marker.style.top=(-temp.y*.5+.5)*100+'%'
          marker.hidden=built<.99 || Math.abs(temp.x)>.93 || Math.abs(temp.y)>.88 || temp.z>1
        })
        renderer.render(scene,camera)
        pending=false
      }
      if(inMotion||intro||cameraMoving||moved) request()
    }
    function request() {
      if(mounted&&visible&&!raf) raf=requestAnimationFrame(draw)
    }
    function refresh() { pending=true; request() }
    invalidate.current=refresh
    function manual() { autoView=false; targetDistance=controls.getDistance(); refresh() }
    controls.addEventListener('start',manual)
    controls.addEventListener('change',refresh)
    function cameraAction(step:CameraAction) {
      autoView=false
      if(step==='reset') { previousScroll=0; resetCamera() }
      else if(step==='closer'||step==='farther') {
        targetDistance=THREE.MathUtils.clamp(targetDistance*(step==='closer'?.84:1.19),widthDistance()*.44,widthDistance()*1.43)
      } else {
        camera.position.sub(controls.target).applyAxisAngle(look.set(0,1,0),step==='left'?-.18:.18).add(controls.target)
      }
      refresh()
    }
    action.current=cameraAction
    function keyboard(e:KeyboardEvent) {
      const steps:Record<string,CameraAction>={'+':'closer','=':'closer','-':'farther',ArrowLeft:'left',ArrowRight:'right',Home:'reset'}
      if(steps[e.key]) { e.preventDefault(); cameraAction(steps[e.key]) }
    }
    function scroll() {
      if(!hero||!autoView||motion.matches) return
      const rect=node.getBoundingClientRect()
      previousScroll=THREE.MathUtils.clamp(-rect.top/Math.max(rect.height,1),-.3,1)
      refresh()
    }
    function size() {
      const w=node.clientWidth,h=node.clientHeight
      if(!w||!h) return
      renderer.setSize(w,h,false)
      camera.aspect=w/h
      camera.updateProjectionMatrix()
      resetCamera()
      refresh()
    }
    const resize=new ResizeObserver(size)
    resize.observe(node)
    const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting; if(visible) refresh()})
    observer.observe(node)
    canvas.addEventListener('keydown',keyboard)
    const lost=(e:Event)=>{ e.preventDefault(); setFailed(true); setAvailable(false); visible=false }
    canvas.addEventListener('webglcontextlost',lost)
    window.addEventListener('scroll',scroll,{passive:true,capture:true})
    size()
    if(!motion.matches) camera.position.sub(controls.target).multiplyScalar(1.22).add(controls.target)
    refresh()
    return ()=>{
      mounted=false
      cancelAnimationFrame(raf)
      resize.disconnect(); observer.disconnect()
      controls.dispose()
      studio.dispose()
      currentRoom.root.traverse(object=>{if(object instanceof THREE.InstancedMesh) object.dispose()})
      env.dispose(); sun.shadow.dispose(); groundGeometry.dispose(); groundMaterial.dispose()
      canvas.removeEventListener('keydown',keyboard)
      canvas.removeEventListener('webglcontextlost',lost)
      window.removeEventListener('scroll',scroll,true)
      renderer.dispose(); renderer.forceContextLoss(); canvas.remove()
      invalidate.current=()=>{}; action.current=()=>{}
    }
  },[hero,setAvailable])
  return <div ref={host} className="ts3d-stage">
    {failed ? <div className="ts3d-fallback">
      <img alt={rooms[settings.room].name+' em fotografia de referência'} src={hero&&fallbackImage?fallbackImage:'./images/projetos/'+referencePhotos[settings.room]+'.jpg'}/>
      <span>A maquete requer WebGL. Esta é uma fotografia de referência.</span>
    </div> : <>
      {spotNames.map((name,i)=><button key={name} type="button" className="ts3d-hotspot" ref={el=>{markers.current[i]=el}}
        aria-label={'Explorar '+name.toLowerCase()} aria-pressed={settings.spot===i} onClick={()=>selectSpot(i)}><span aria-hidden="true">+</span></button>)}
      <div className="ts3d-camera" aria-label="Câmera">
        <button type="button" onClick={()=>action.current('closer')} aria-label="Aproximar câmera" title="Aproximar">+</button>
        <button type="button" onClick={()=>action.current('farther')} aria-label="Afastar câmera" title="Afastar">−</button>
        <button type="button" className="ts3d-reset" onClick={()=>action.current('reset')} title="Restaurar vista">Vista inicial</button>
      </div>
    </>}
  </div>
}

function Studio({hero=false,fallbackImage}:Props & {hero?:boolean}) {
  const [settings,setSettings]=useState<ViewerSettings>(()=>({...defaults,room:hero?2:defaults.room}))
  const [available,setAvailable]=useState(true)
  const [followScroll,setFollowScroll]=useState(false)
  const controlId=useId()
  const model=useRef<HTMLDivElement>(null)
  const stickyView=useRef<HTMLDivElement>(null)
  const update=(change:Partial<ViewerSettings>)=>setSettings(old=>({...old,...change}))
  function selectSpot(i:number) {
    setSettings(old=>({...old, spot:old.spot===i?null:i, door:i===0?!old.door:old.door,drawer:i===1?!old.drawer:old.drawer,light:i===2?!old.light:old.light}))
  }
  useEffect(()=>{
    if(!followScroll) return
    const container=model.current!, viewer=stickyView.current!
    const offset=Number.parseFloat(getComputedStyle(viewer).top)||0
    const startScroll=Math.max(0,window.scrollY+container.getBoundingClientRect().top-offset)
    const length=Math.max(220,container.clientHeight-viewer.clientHeight)
    window.scrollTo({top:startScroll,behavior:'instant'})
    let frame=0
    const onScroll=()=>{ if(!frame) frame=requestAnimationFrame(()=>{ frame=0; const value=THREE.MathUtils.clamp((window.scrollY-startScroll)/length,0,1); setSettings(s=>({...s,assembly:value})) }) }
    window.addEventListener('scroll',onScroll,{passive:true})
    return ()=>{ cancelAnimationFrame(frame);window.removeEventListener('scroll',onScroll) }
  },[followScroll])
  return <div className={'ts3d-studio'+(hero?' ts3d-hero':'')+(followScroll?' ts3d-follow':'')} ref={model}>
    {!hero&&!followScroll&&<div className="ts3d-tabs" aria-label="Selecionar ambiente">{rooms.map((r,i)=>
      <button key={r.name} type="button" aria-pressed={settings.room===i} onClick={()=>{setFollowScroll(false);update({...defaults, room:i, finish:settings.finish})}}>{r.name}</button>)}</div>}
    <div className="ts3d-layout" ref={stickyView}>
      <div className="ts3d-main">
        <div className="ts3d-model-label">{followScroll?'Montagem · '+Math.round(settings.assembly*100)+'%':available?'Maquete conceitual':'Fotografia do ambiente'}</div>
        {followScroll&&<button className="ts3d-exit" type="button" onClick={()=>{setFollowScroll(false);update({assembly:1})}}>Sair da montagem</button>}
        <Viewport settings={settings} hero={hero} selectSpot={selectSpot} fallbackImage={fallbackImage} setAvailable={setAvailable}/>
      </div>
      <div className="ts3d-inspector">
        <h3>{available?rooms[settings.room].title:rooms[settings.room].name}</h3>
        {available?<><p>{rooms[settings.room].detail}</p>
        <div className="ts3d-config">
          <h4>Acabamento <span>{finishes[settings.finish].name}</span></h4>
          <div className="ts3d-swatches" aria-label="Acabamento da madeira">{finishes.map((f,i)=><button type="button" aria-label={f.name}
            title={f.name} key={f.name} aria-pressed={i===settings.finish} onClick={()=>update({finish:i})} style={{'--sample':f.sample} as React.CSSProperties}/>)}</div>
        </div>
        <div className="ts3d-actions">
          {spotNames.map((name,i)=>{
            const enabled=[settings.door,settings.drawer,settings.light][i]
            return <button key={name} type="button" aria-pressed={enabled} onClick={()=>selectSpot(i)}><span>{name}</span><span className="ts3d-switch" aria-hidden="true"/></button>
          })}
        </div>
        {settings.spot!==null&&<p className="ts3d-tip" role="status">{spotDetails[settings.spot]}</p>}
        <div className="ts3d-build">
          <label htmlFor={controlId}>Montagem <output>{Math.round(settings.assembly*100)}%</output></label>
          <input id={controlId} type="range" min="0" max="100" value={Math.round(settings.assembly*100)} onChange={e=>{setFollowScroll(false);update({assembly:Number(e.target.value)/100})}}/>
          {!hero&&<button type="button" aria-pressed={followScroll} onClick={()=>{setFollowScroll(!followScroll);update({assembly:followScroll?1:0,spot:null})}}>{followScroll?'Concluir montagem':'Montar ao rolar'}</button>}
        </div></>:<p>Veja a composição, os volumes e os detalhes de marcenaria deste ambiente.</p>}
      </div>
    </div>
  </div>
}

export function HeroModel(props:Props) { return <Studio hero {...props}/> }

export default function Showroom(props:Props) {
  return <section className="ts3d-section" id="showroom" aria-labelledby="ts3d-title">
    <div className="ts3d-inner">
      <div className="ts3d-heading"><div><span className="ts3d-kicker">Showroom 3D</span><h2 id="ts3d-title">Explore cada detalhe.</h2></div>
        <p>Gire o ambiente, abra os móveis e experimente diferentes acabamentos.</p></div>
      <Studio {...props}/>
    </div>
  </section>
}
