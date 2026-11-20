// The masks use coordinates in the original photograph, normalized to 840 × 600.
// Every furnishing is painted from that photograph, including its edges and reflections.
type Point = [number, number]
type Piece = {
  outline: Point[]
  start: number
  end: number
  direction: 'right' | 'up' | 'down'
  halo: number
}

const pieces: Piece[] = [
  { outline: [[52,170],[69,164],[155,173],[155,371],[68,375],[50,371]], start:.29,end:.41,direction:'up',halo:8 },
  { outline: [[152,173],[400,194],[401,263],[152,258]], start:.37,end:.50,direction:'right',halo:4 },
  { outline: [[198,381],[617,352],[655,355],[655,397],[238,445],[198,435]], start:.46,end:.64,direction:'right',halo:7 },
  { outline: [[465,363],[480,351],[480,242],[607,248],[608,350],[619,360],[614,362],[601,356],[485,360],[473,366]], start:.625,end:.745,direction:'up',halo:7 },
  { outline: [[255,331],[300,329],[312,345],[313,356],[364,356],[361,370],[319,378],[256,381]], start:.73,end:.81,direction:'up',halo:4 },
  { outline: [[439,464],[513,449],[543,447],[547,435],[587,435],[586,443],[626,433],[639,432],[644,420],[607,415],[607,405],[704,404],[704,417],[665,420],[671,426],[676,438],[711,439],[764,450],[764,459],[710,476],[708,511],[766,519],[766,533],[585,591],[558,590],[438,553],[438,537],[499,521],[499,487],[439,473]], start:.77,end:.93,direction:'up',halo:8 },
]

const width=1680, height=1200
function surface(w=width,h=height){
  const c=document.createElement('canvas')
  c.width=w; c.height=h
  return c
}

function ease(value:number) {
  const t=Math.max(0,Math.min(1,value))
  return t*t*(3-2*t)
}

function imagePatch(source:CanvasImageSource, mask:HTMLCanvasElement,x:number,y:number) {
  const tile=surface(mask.width,mask.height)
  const ctx=tile.getContext('2d')!
  ctx.drawImage(source,-x,-y,width,height)
  ctx.globalCompositeOperation='destination-in'
  ctx.drawImage(mask,0,0)
  return tile
}

export function makePhotoSequence(target: HTMLCanvasElement, concrete: HTMLImageElement, wood: HTMLImageElement, original: HTMLImageElement) {
  const compact=matchMedia('(max-width: 760px)').matches
  target.width=compact?1080:Math.min(2560,Math.max(1920,Math.round(innerWidth*Math.min(devicePixelRatio,2))))
  target.height=Math.round(target.width*height/width)
  const context=target.getContext('2d',{alpha:false})
  if(!context) throw new Error('Canvas indisponível')
  const layers=pieces.map(piece=>{
    const pad=piece.halo*5+4
    const xs=piece.outline.map(([x])=>x*2), ys=piece.outline.map(([,y])=>y*2)
    const x=Math.floor(Math.min(...xs)-pad), y=Math.floor(Math.min(...ys)-pad)
    const mask=surface(Math.ceil(Math.max(...xs)+pad-x),Math.ceil(Math.max(...ys)+pad-y))
    const ctx=mask.getContext('2d')!
    ctx.beginPath()
    piece.outline.forEach((point,i)=>{if(i===0)ctx.moveTo(xs[i]-x,ys[i]-y);else ctx.lineTo(point[0]*2-x,point[1]*2-y)})
    ctx.closePath()
    ctx.lineWidth=piece.halo*2
    ctx.lineJoin='round'
    ctx.shadowColor='#000'
    ctx.shadowBlur=piece.halo*1.7
    ctx.stroke();ctx.fill()
    return {...piece,x,y,tile:imagePatch(original,mask,x,y)}
  })

  // Restore the glow from the original only after the shelf has been installed.
  const lights=surface()
  const lightCtx=lights.getContext('2d')!
  lightCtx.filter='blur(19px)'
  lightCtx.beginPath()
  lightCtx.moveTo(253,322);lightCtx.lineTo(796,384);lightCtx.lineTo(795,396);lightCtx.lineTo(254,348)
  lightCtx.closePath();lightCtx.fill()
  lightCtx.beginPath()
  lightCtx.moveTo(309,510);lightCtx.lineTo(791,518);lightCtx.lineTo(774,536);lightCtx.lineTo(310,548)
  lightCtx.closePath();lightCtx.fill()
  const led=imagePatch(original,lights,0,0)
  const ctx=context
  ctx.setTransform(target.width/width,0,0,target.height/height,0,0)
  let installed:HTMLCanvasElement|undefined
  return (frame:number)=>{
    const p=frame/180
    if(frame===180){ctx.drawImage(original,0,0,width,height);return}
    if(p>=.31 && installed)ctx.drawImage(installed,0,0,width,height)
    else ctx.drawImage(concrete,0,0,width,height)
    if(p>0 && (p<.31 || !installed)){
      ctx.save()
      // Stagger individual boards from right to left. The architecture and camera stay still.
      ctx.beginPath()
      const boards=64, wallWidth=1357
      for(let i=0;i<boards;i++){
        const left=i*wallWidth/boards, right=(i+1)*wallWidth/boards
        const top=Math.max(0,-181+left*.267)-6
        const bottom=1046-left*.137
        const t=ease((p-(boards-1-i)/boards*.185)/.125)
        if(t>0)ctx.rect(left-.35,bottom-(bottom-top)*t,right-left+.7,(bottom-top)*t)
      }
      ctx.clip()
      // The plate includes the wall/ceiling junction; this second clip protects
      // the photographic ceiling from changing as each board is installed.
      ctx.beginPath()
      ctx.moveTo(0,0);ctx.lineTo(674,0);ctx.lineTo(1357,177);ctx.lineTo(1357,854);ctx.lineTo(0,1040)
      ctx.closePath();ctx.clip()
      ctx.drawImage(wood,0,0,width,height)
      ctx.restore()
      if(p>=.31){
        installed=surface(target.width,target.height)
        installed.getContext('2d')!.drawImage(target,0,0)
      }
    }
    for(const part of layers){
      const t=ease((p-part.start)/(part.end-part.start))
      if(t===0) continue
      const {tile,x,y}=part
      if(t===1){ctx.drawImage(tile,x,y);continue}
      // Only the advancing edge is clipped. Already installed pixels stay in place.
      const horizontal=part.direction==='right'
      const w=tile.width*(horizontal?t:1), h=tile.height*(horizontal?1:t)
      const offset=part.direction==='up'?tile.height-h:0
      ctx.drawImage(tile,0,offset,w,h,x,y+offset,w,h)
    }
    ctx.globalAlpha=ease((p-.89)/.085)
    if(p>.89)ctx.drawImage(led,0,0)
    // Finish on the untouched source, resolving the fine contact shadows and glass.
    ctx.globalAlpha=ease((p-.94)/.06)
    if(p>.94)ctx.drawImage(original,0,0,width,height)
    ctx.globalAlpha=1
  }
}
