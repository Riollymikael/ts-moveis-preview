import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

export const rooms = [
  { name: 'Cozinha', title: 'Cozinha com ilha', detail: 'A ilha aproxima o preparo das refeições da área de convivência.' },
  { name: 'Closet', title: 'Closet com vitrine', detail: 'Nichos, cabideiros e gavetas dividem o espaço em diferentes alturas.' },
  { name: 'Sala', title: 'Sala com painel ripado', detail: 'Um painel contínuo reúne o rack suspenso e os nichos de exposição.' },
  { name: 'Dormitório', title: 'Dormitório com cabeceira', detail: 'A cabeceira iluminada conecta a cama aos módulos laterais.' },
  { name: 'Escritório', title: 'Escritório com biblioteca', detail: 'A bancada de trabalho acompanha a estante e deixa os materiais ao alcance.' },
  { name: 'Infantil', title: 'Quarto com beliche', detail: 'Dois níveis de descanso liberam espaço para guardar os objetos do dia a dia.' },
  { name: 'Gourmet', title: 'Espaço gourmet', detail: 'O aparador organiza taças e garrafas ao lado da bancada de apoio.' },
]
export const finishes = [
  { name: 'Nogueira', tint: '#aa795d', sample: '#76513d' },
  { name: 'Carvalho', tint: '#eacba2', sample: '#c19b6e' },
  { name: 'Grafite', tint: '#625e5a', sample: '#514c49' },
]

function pattern(kind: 'wood' | 'stone' | 'fabric') {
  const side = 512
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = side
  const context = canvas.getContext('2d')!
  const pixels = context.createImageData(side, side)
  let seed = 20835
  const random = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296)
  const widths = Array.from({length: side}, () => random())
  for (let y = 0; y < side; y++) {
    for (let x = 0; x < side; x++) {
      const offset = (y * side + x) * 4
      const drift = 3 * Math.sin(y / 83 + x / 55) + 2 * Math.cos(y / 59 - x / 26)
      const streak = widths[(side + Math.floor(x + drift)) % side]
      const grain = Math.sin((x + drift) * .39) + Math.sin((x + drift) * .17 + Math.cos(y / 100))
      const vein = Math.abs(Math.sin(x / 112 + Math.sin(y / 91) * .62 + .007 * y))
      let value = 203 + streak * 25 + grain * 8 + random() * 6
      if (kind === 'stone') value = 225 - (vein < .032 ? (1 - vein / .032) * 20 : 0) + random() * 10
      if (kind === 'fabric') value = 206 + random() * 25 + (x % 3 + y % 3) * 4
      pixels.data.set([value, value, value, 255], offset)
    }
  }
  context.putImageData(pixels, 0, 0)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.anisotropy = 4
  return texture
}

export function makeStudio() {
  const textures = [pattern('wood'), pattern('stone'), pattern('fabric')]
  const standard = (color: string, roughness = .68, metalness = 0, map?: THREE.Texture) =>
    new THREE.MeshStandardMaterial({ color, roughness, metalness, map: map ?? null })
  const wood = standard(finishes[0].tint, .43, .05, textures[0])
  const stone = standard('#eee4d7', .32, .07, textures[1])
  const cream = standard('#e9dfcf', .56)
  const floor = standard('#b6a693', .78, .01, textures[1])
  const side = standard('#cdbdaa', .88)
  const charcoal = standard('#363531', .4, .12)
  const brass = standard('#b59465', .29, .67)
  const metal = standard('#66645f', .25, .77)
  const fabric = standard('#d2c5b2', .95, 0, textures[2])
  const green = standard('#626a51', .88)
  const glass = new THREE.MeshPhysicalMaterial({ color: '#afa494', transparent: true, opacity: .2, metalness: .12, roughness: .12, depthWrite: false })
  const lamp = standard('#ffe6b4', .4)
  lamp.emissive.set('#ffd89b')
  const materials = [wood,stone,cream,floor,side,charcoal,brass,metal,fabric,green,glass,lamp]
  const shapes = new Map<string, THREE.BufferGeometry>()
  function shape(key: string, build: () => THREE.BufferGeometry) {
    if (!shapes.has(key)) shapes.set(key, build())
    return shapes.get(key)!
  }
  function mesh(parent: THREE.Object3D, geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number) {
    const obj = new THREE.Mesh(geo, mat)
    obj.position.set(x, y, z)
    obj.castShadow = mat !== glass && mat !== lamp
    obj.receiveShadow = true
    parent.add(obj)
    return obj
  }
  function box(parent: THREE.Object3D, x: number,y: number,z: number, w: number,h: number,d: number, mat: THREE.Material, radius = .012) {
    const geo = shape([w,h,d,radius].join('/'), () => radius
      ? new RoundedBoxGeometry(w,h,d,1,Math.min(radius,w/4,h/4,d/4))
      : new THREE.BoxGeometry(w,h,d))
    return mesh(parent, geo, mat, x,y,z)
  }
  function cylinder(parent: THREE.Object3D,x:number,y:number,z:number, top:number, bottom:number, height:number, mat:THREE.Material) {
    return mesh(parent, shape('c'+[top,bottom,height].join('/'), () => new THREE.CylinderGeometry(top,bottom,height,32)),mat,x,y,z)
  }
  function group(parent: THREE.Object3D,x=0,y=0,z=0) {
    const g = new THREE.Group()
    g.position.set(x,y,z)
    parent.add(g)
    return g
  }
  function createRoom(index:number) {
    const root = new THREE.Group()
    const doors: THREE.Group[] = []
    const drawers: THREE.Group[] = []
    const lights: THREE.Light[] = []
    const stages: { object: THREE.Group, start: number, axis: 'y'|'z', travel:number }[] = []
    const part = (parent:THREE.Object3D,start:number,axis:'y'|'z'='y',travel=.5) => {
      const object = group(parent)
      stages.push({object, start, axis, travel})
      return object
    }
    const shell = part(root, 0,'y',-.12)
    box(shell,0,-.1,.1,6.65,.2,3.95,floor,.035)
    box(shell,0,1.52,-1.8,6.65,3.04,.12,cream)
    box(shell,-3.27,1.52,-.57,.12,3.04,2.55,side)
    box(shell,0,.07,-1.71,6.5,.14,.04,side)
    // Narrow divisions and a recessed plinth keep the elevations legible at room scale.
    const cabinetry = part(root,.13)
    const fronts = part(root,.34,'z',.6)
    const worktops = part(root,.51)
    const leds = part(root,.68)
    const decor = part(root,.79,'y',.4)
    let hingePoint = new THREE.Vector3()
    let drawerPoint = new THREE.Vector3()
    function cabinet(x:number,z:number,w:number,h:number,d:number, mode:'doors'|'drawers'|'shelves', base=0, glazed=false) {
      const t=.043
      const bottom=base+.075, usable=h-.075
      box(cabinetry,x,base+.044,z,w-.12,.088,d-.09,charcoal)
      box(cabinetry,x,bottom+t/2,z,w,t,d,wood)
      box(cabinetry,x,base+h-t/2,z,w,t,d,wood)
      box(cabinetry,x-w/2+t/2,bottom+usable/2,z,t,usable,d,wood)
      box(cabinetry,x+w/2-t/2,bottom+usable/2,z,t,usable,d,wood)
      box(cabinetry,x,bottom+usable/2,z-d/2+t/2,w,usable,t,wood)
      if(mode!=='drawers') {
        const hanging = index===1 && glazed
        const levels = hanging ? [.32,.81] : h>1.8 ? [.25,.5,.75] : [.5]
        for(const level of levels) box(cabinetry,x,bottom+usable*level,z,w-2*t,.033,d-.055,wood)
        if(hanging) {
          const rail=cylinder(cabinetry,x,base+h*.77,z,.017,.017,w-2*t,brass)
          rail.rotation.z=Math.PI/2
          for(let i=0;i<5;i++) {
            const px=x-w*.35+i*w*.165
            cylinder(decor,px,base+h*.745,z,.008,.008,.14,metal)
            const shoulder=mesh(decor,shape('shoulder',()=>new THREE.SphereGeometry(1,12,8)),i%2?fabric:cream,px,base+h*.69,z)
            shoulder.scale.set(.061,.12,.21)
            box(decor,px,base+h*(.568+i%2*.023),z,.107,h*(.223-i%2*.046),.36,i%2?fabric:cream,.035)
          }
        }
      }
      if(mode==='doors') {
        const hinge=group(fronts,x-w/2+.016,bottom+usable/2,z+d/2+.012)
        doors.push(hinge)
        if(doors.length===1) hingePoint.set(x+w*.22,bottom+usable*.55,z+d/2+.15)
        const faceWidth=w-.034
        if(glazed) {
          box(hinge,faceWidth/2,0,0,faceWidth,usable-.015,.025,glass)
          for(const edge of [0,faceWidth]) box(hinge,edge,0,.006,.028,usable-.013,.04,charcoal)
          for(const edge of [-1,1]) box(hinge,faceWidth/2,edge*(usable/2-.018),.006,faceWidth,.03,.04,charcoal)
        } else box(hinge,faceWidth/2,0,0,faceWidth,usable-.012,.045,wood)
        box(hinge,faceWidth-.085,.03,.045,.023,Math.min(usable*.43,.39),.055,brass)
      } else if(mode==='drawers') {
        const n=h>1 ? 3 : 2
        for(let i=0;i<n;i++) {
          const dy=usable/n, y=bottom+dy*(i+.5)
          const drawer=group(fronts,x,y,z+d/2)
          drawers.push(drawer)
          if(drawers.length===1) drawerPoint.set(x,y+.12,z+d/2+.15)
          box(drawer,0,0,.013,w-.025,dy-.024,.044,wood)
          box(drawer,0,dy/2-.066,.045,Math.min(.38,w*.37),.018,.05,brass)
          box(drawer,0,-dy*.4,-d*.42,w-.09,.035,d*.84,cream)
          for(const e of [-1,1]) box(drawer,e*(w/2-.061),-dy*.12,-d*.42,.027,dy*.59,d*.84,cream)
          box(drawer,0,-dy*.12,-d*.83,w-.1,dy*.59,.03,cream)
        }
      }
    }
    function strip(x:number,y:number,z:number,w:number) {
      box(leds,x,y,z,w,.025,.035,lamp)
      const light=new THREE.PointLight('#ffc881',1.8,3,2)
      light.position.set(x,y-.08,z+.18)
      leds.add(light)
      lights.push(light)
    }
    function slats(x:number,z:number,w:number,h:number,base=0) {
      box(cabinetry,x,base+h/2,z,w,h,.075,charcoal)
      const n=Math.ceil(w/.084)
      const slatGeo=shape('slats'+[h,w/n].join('/'),()=>new THREE.BoxGeometry(w/n*.7,h,.055))
      const slats = new THREE.InstancedMesh(slatGeo,wood,n)
      for(let i=0;i<n;i++) slats.setMatrixAt(i,new THREE.Matrix4().makeTranslation(x-w/2+(i+.5)*w/n,base+h/2,z+.06))
      slats.receiveShadow=true
      cabinetry.add(slats)
    }
    function vase(x:number,y:number,z:number,size=.18,withTwigs=true) {
      const profile=[[0,0],[.64,.02],[.78,.17],[.87,.57],[.74,.93],[.37,1.07],[.33,1.27],[.4,1.28],[.35,1.33]]
      const vaseShape=shape('v'+size,()=>new THREE.LatheGeometry(profile.map(([a,b])=>new THREE.Vector2(a*size,b*size)),32))
      mesh(decor,vaseShape,cream,x,y,z)
      if(withTwigs) for(let i=0;i<3;i++) {
        const stem=cylinder(decor,x+(i-1)*size*.25,y+size*1.85,z,.007,.01,size*1.7,green)
        stem.rotation.z=(i-1)*.27
        const leaf=mesh(decor,shape('leaf',()=>new THREE.SphereGeometry(1,12,8)),green,x+(1-i)*size*.77,y+size*(2.32+i*.1),z)
        leaf.scale.set(size*.18,size*.51,size*.12)
        leaf.rotation.z=(i-1)*.56+.25
      }
    }
    function books(x:number,y:number,z:number) {
      for(let i=0;i<5;i++) {
        const b=box(decor,x+i*.075,y+.14+(i%2)*.03,z,.055,.28+(i%2)*.06,.2,i%2?fabric:cream)
        if(i===4) b.rotation.z=-.14
      }
    }
    function counter(x:number,y:number,z:number,w:number,d:number) {
      box(worktops,x,y,z,w,.085,d,stone,.03)
    }
    function stool(x:number,z:number) {
      cylinder(decor,x,.04,z,.24,.25,.055,charcoal)
      cylinder(decor,x,.38,z,.034,.045,.65,brass)
      cylinder(decor,x,.73,z,.255,.24,.095,fabric)
    }
    if(index===0) {
      cabinet(-2.6,-1.28,.97,2.66,.78,'doors')
      cabinet(-1.52,-1.3,1.16,.93,.75,'drawers')
      cabinet(-.26,-1.3,1.34,.93,.75,'doors')
      cabinet(1.08,-1.3,1.31,.93,.75,'drawers')
      cabinet(2.43,-1.31,1.34,2.66,.78,'doors')
      counter(-.24,.975,-1.29,3.83,.86)
      box(cabinetry,-.24,1.4,-1.69,3.84,.82,.08,stone)
      for(let i=0;i<3;i++) cabinet(-1.53+i*1.27,-1.46,1.25,.81,.47,'doors',1.85)
      strip(-.24,1.91,-1.21,3.77)
      cabinet(-.26,.65,2.55,.92,.84,'drawers')
      // A counter made around an actual recessed basin reveals depth when seen from above.
      const islandLeft=-1.645, islandRight=1.345, sinkLeft=-.18, sinkRight=.49
      const islandBack=.105, islandFront=1.275, sinkBack=.36, sinkFront=.81
      counter((islandLeft+sinkLeft)/2,.97,.69,sinkLeft-islandLeft,1.17)
      counter((islandRight+sinkRight)/2,.97,.69,islandRight-sinkRight,1.17)
      counter((sinkLeft+sinkRight)/2,.97,(islandBack+sinkBack)/2,sinkRight-sinkLeft,sinkBack-islandBack)
      counter((sinkLeft+sinkRight)/2,.97,(islandFront+sinkFront)/2,sinkRight-sinkLeft,islandFront-sinkFront)
      box(worktops,.155,.928,.585,.675,.012,.455,metal)
      for(const x of [sinkLeft,sinkRight]) box(worktops,x,.967,.585,.012,.084,.45,metal)
      for(const z of [sinkBack,sinkFront]) box(worktops,.155,.967,z,.67,.084,.012,metal)
      cylinder(worktops,.155,.936,.585,.037,.037,.006,charcoal)
      const arc=new THREE.CatmullRomCurve3([[.31,1.01,.28],[.31,1.32,.28],[.31,1.39,.37],[.31,1.35,.46],[.31,1.29,.49]].map(v=>new THREE.Vector3(...v as [number,number,number])))
      mesh(worktops,shape('faucet',()=>new THREE.TubeGeometry(arc,25,.02,9,false)),brass,0,0,0)
      box(worktops,1.31,.48,.69,.083,.96,1.17,stone)
      box(worktops,.25,1.026,-1.28,.76,.02,.53,charcoal)
      for(const x of [.05,.45]) for(const z of [-1.4,-1.16]) {
        const ring=mesh(worktops,shape('hob',()=>new THREE.TorusGeometry(.082,.0035,5,25)),metal,x,1.038,z)
        ring.rotation.x=-Math.PI/2
      }
      const tallDoor=doors[0]
      box(tallDoor,.47,-.075,.038,.81,.58,.035,charcoal)
      box(tallDoor,.47,-.1,.065,.68,.33,.016,metal)
      box(tallDoor,.47,.11,.082,.65,.026,.041,metal)
      for(const x of [-.95,.05]) stool(x,1.52)
      vase(-.86,1.015,.59,.18)
    } else if(index===1) {
      for(let i=0;i<4;i++) cabinet(-2.34+i*1.56,-1.16,1.535,2.7,.95,i===2?'shelves':'doors',0,true)
      cabinet(.73,-.98,1.41,.74,.5,'drawers')
      for(const x of [-2.34,-.78,2.34]) {
        strip(x,2.56,-.84,1.44)
        books(x-.48,.08,-.89)
        vase(x+.24,2.23,-.95,.16,false)
      }
      box(decor,0,.245,.9,1.48,.49,.69,fabric,.12)
    } else if(index===2) {
      slats(0,-1.62,6.36,2.91)
      cabinet(-1.61,-1.12,2.8,.48,.68,'doors',.3)
      cabinet(1.23,-1.12,2.8,.48,.68,'drawers',.3)
      box(worktops,.22,1.68,-1.45,2.28,1.29,.072,charcoal)
      box(worktops,.22,1.68,-1.402,2.19,1.2,.025,metal)
      strip(-.15,.34,-.81,5.5)
      vase(-2.52,.79,-1.02)
      box(decor,.49,.24,.83,1.9,.095,.86,stone,.06)
      for(const x of [-.06,1.03]) cylinder(decor,x,.11,.83,.17,.17,.22,wood)
    } else if(index===3) {
      slats(0,-1.6,4,1.54)
      strip(0,1.55,-1.52,4.05)
      cabinet(-2.51,-1.15,1.04,2.68,.85,'doors')
      cabinet(2.48,-1.14,1.08,2.68,.86,'doors')
      cabinet(-1.52,-1.08,.76,.48,.58,'drawers',.2)
      cabinet(1.52,-1.08,.76,.48,.58,'drawers',.2)
      box(worktops,0,.29,-.06,2.13,.46,2.63,wood,.07)
      box(decor,0,.64,-.06,2.06,.29,2.57,fabric,.1)
      box(decor,0,.81,.37,2.09,.09,1.65,cream,.04)
      for(const x of [-.52,.52]) box(decor,x,.84,-.94,.89,.17,.49,cream,.08)
      vase(1.53,.69,-1.03,.12)
    } else if(index===4) {
      slats(.82,-1.63,4.52,2.83)
      cabinet(-2.36,-1.17,1.46,2.65,.81,'doors',0,true)
      cabinet(2.18,-1.1,1.31,.76,.83,'drawers')
      counter(.81,.805,-1.08,4.52,1.03)
      for(const y of [1.66,2.24]) {
        box(worktops,.76,y,-1.35,4.38,.058,.48,wood)
        strip(.76,y-.04,-1.14,4.28)
        books(-.93,y+.03,-1.31)
        vase(1.93,y+.03,-1.32,.135,false)
      }
      box(decor,.36,1.16,-1.22,.94,.53,.045,charcoal)
      box(decor,.36,.91,-1.22,.09,.18,.07,metal)
      stool(.42,.04)
    } else if(index===5) {
      cabinet(-2.49,-1.18,1.13,2.58,.91,'doors')
      for(const y of [.42,1.62]) {
        box(cabinetry,.62,y,-.91,3.83,.16,1.43,wood)
        box(decor,.62,y+.17,-.91,3.72,.18,1.34,fabric,.06)
        box(decor,-.76,y+.3,-.91,.47,.12,1.08,cream,.05)
      }
      for(const x of [-1.26,2.49]) for(const z of [-1.58,-.24]) box(cabinetry,x,1.14,z,.09,2.28,.09,wood)
      box(worktops,.15,2.16,-.24,2.9,.083,.075,cream)
      for(let i=0;i<11;i++) box(worktops,-1.13+i*.26,1.94,-.24,.038,.46,.05,cream)
      for(const x of [1.8,2.45]) box(fronts,x,.86,-.065,.068,1.72,.07,wood)
      for(let i=0;i<5;i++) box(fronts,2.12,.25+i*.32,-.065,.65,.056,.095,wood)
      cabinet(.26,-.8,2.85,.31,1.08,'drawers')
      strip(.56,1.53,-.5,3.61)
    } else {
      slats(0,-1.64,6.3,2.85)
      cabinet(-2.36,-1.22,1.44,2.61,.78,'doors',0,true)
      cabinet(-.87,-1.15,1.51,.94,.85,'drawers')
      cabinet(.71,-1.15,1.6,.94,.85,'doors')
      cabinet(2.26,-1.17,1.46,.94,.81,'shelves')
      counter(.69,.985,-1.15,4.64,.96)
      for(const y of [1.64,2.22]) {
        box(worktops,.68,y,-1.35,4.45,.055,.46,wood)
        strip(.68,y-.04,-1.12,4.4)
        for(let i=0;i<5;i++) {
          const x=-.93+i*.28
          cylinder(decor,x,y+.19,-1.34,.075,.078,.31,green)
          cylinder(decor,x,y+.39,-1.34,.027,.04,.1,green)
        }
        vase(2.09,y+.029,-1.31,.16,false)
      }
      counter(.45,1.01,.7,2.77,.81)
      for(const x of [-.82,1.72]) box(cabinetry,x,.49,.7,.09,.98,.78,wood)
      stool(-.24,1.39); stool(.9,1.39)
    }
    const hotspotPositions=[hingePoint,drawerPoint,new THREE.Vector3(.1,1.92,-1.16)]
    if(index===3) hotspotPositions[2].set(.55,1.55,-1.48)
    if(index===2) hotspotPositions[2].set(-1.25,.34,-.75)
    if(index===1) hotspotPositions[2].set(-.78,2.5,-.82)
    if(index===5) hotspotPositions[2].set(.5,1.54,-.48)
    return { root,doors,drawers,lights,stages,hotspotPositions }
  }
  return { createRoom, wood, lamp, dispose() {
    for(const material of materials) material.dispose()
    for(const geometry of shapes.values()) geometry.dispose()
    for(const texture of textures) texture.dispose()
  } }
}
