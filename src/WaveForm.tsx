import React, { useRef, useEffect } from 'react'

const WaveForm = (props: { width: number, height: number, onSelect: (start: number, end: number) => void, onSelecting: (start: number, end: number) => void, draw: (context: CanvasRenderingContext2D | null, frameCount: number) => void, frameRate: number }) => { 
  const { draw, onSelect, onSelecting, frameRate, ...rest } = props
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas : HTMLCanvasElement = canvasRef.current as unknown as HTMLCanvasElement
    var isDraggable = false
    var selectionStart = 0
    var selectionEnd = 1

    if (canvas !== null) {
      const context = canvas.getContext("2d")
      let frameCount = 0
      let animationFrameId : number
      let then = Date.now()
      let fpsInterval = 1000 / frameRate

      canvas.addEventListener('dblclick', () => { 
        onSelect(0,1)
      })
      canvas.addEventListener('mousedown', (e: MouseEvent) => { 
        selectionStart = e.offsetX / canvas.width
        
        isDraggable = true
      })
      canvas.addEventListener('mouseup', () => { 
        if (isDraggable) {
          onSelect(Math.min(selectionStart, selectionEnd), Math.max(selectionStart, selectionEnd)) 
        }
        isDraggable = false
      })
      canvas.addEventListener('mouseout', () => { 
        isDraggable = false
      })   
      canvas.addEventListener('mousemove', (e: MouseEvent) => { 
        if (isDraggable) {
          selectionEnd = e.offsetX / canvas.width
          onSelecting(Math.min(selectionStart, selectionEnd), Math.max(selectionStart, selectionEnd)) 
        }
      })   

      const render = () => {
          // request another frame

          animationFrameId = window.requestAnimationFrame(render);

          // calc elapsed time since last loop

          let now = Date.now();
          let elapsed = now - then;

          // if enough time has elapsed, draw the next frame

          if (elapsed > fpsInterval) {
              frameCount++

              // Get ready for next frame by setting then=now, but also adjust for your
              // specified fpsInterval not being a multiple of RAF's interval (16.7ms)
              then = now - (elapsed % fpsInterval);

              // Put your drawing code here
              draw(context, frameCount)
          }
      }
      render()
      
      return () => {
        window.cancelAnimationFrame(animationFrameId)
      }
    }
  }, [draw, frameRate])
  
  return <canvas id="canvas" className="waveform" ref={canvasRef} {...rest}/>
}

export default WaveForm