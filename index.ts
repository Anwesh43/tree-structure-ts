const w : number = window.innerWidth 
const h : number = window.innerHeight 
const parts : number = 3 
const scGap : number = 0.02 / parts 
const strokeFactor : number = 90 
const rFactor : number = 12.9 
const delay : number = 20 
const backColor : string = "#BDBDBD"
const sizeFactor : number = 7.9 
const divideFactor : number = 2
const children : number = 2

class ScaleUtil {
    
    static maxScale(scale : number, i : number, n : number) : number {
        return Math.max(0, scale - i / n)
    }

    static divideScale(scale : number, i : number, n : number) : number {
        return Math.max(0, scale - i / n)
    }
}

class DrawingUtil {

    static drawLine(context : CanvasRenderingContext2D, x1 : number, y1 : number, x2 : number, y2 : number) {
        context.beginPath()
        context.lineTo(x1, y1)
        context.moveTo(x2, y2)
        context.stroke()
    }

    static drawCircle(context : CanvasRenderingContext2D, x : number, y : number, r : number) {
        context.beginPath()
        context.arc(x, y, r, 0, 2 * Math.PI)
        context.fill()
    }

    static getXGap(i : number) {
        return (w / (i + 1) * sizeFactor)
    }

    

    static drawNode(context : CanvasRenderingContext2D, i : number, next : boolean, scale : number, cb : Function) {
        const currParts : number = next ? parts : parts - 1
        const x : number =  DrawingUtil.getXGap(i)
        const y : number = i == 0 ? h :  (h / i + 1 * divideFactor)
        if (next) {
            context.save()
            context.translate(x, 0)
            DrawingUtil.drawLine(context, 0, 0, 0, y * ScaleUtil.divideScale(scale, 2, currParts))
            context.restore()
        }
        const r : number = Math.min(w, h) / rFactor 
        const sc1 : number = ScaleUtil.divideScale(scale, 0, currParts)
        const sc2 : number = ScaleUtil.divideScale(scale, 1, currParts)
        DrawingUtil.drawLine(context, 0, 0, x * sc1, 0)
        DrawingUtil.drawCircle(context, x, 0, r * sc2)
    }
}

class Stage {

    canvas : HTMLCanvasElement = document.createElement('canvas')
    context : CanvasRenderingContext2D 

    initCanvas() {
        this.canvas.width = w 
        this.canvas.height = h 
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = backColor 
        this.context.fillRect(0, 0, w, h)
    }

    handleTap() {
        this.canvas.onmousedown = () => {

        }
    }

    static init() {
        const stage : Stage = new Stage()
        stage.initCanvas()
        stage.render()
        stage.handleTap()
    }
}

class State {

    scale : number = 0 
    dir : number = 0

    update(cb : Function) {
        this.scale += this.dir * scGap 
        if (Math.abs(this.scale) > 1) {
            this.scale = 1 
            this.dir = 0
            cb()
        }
    }

    startUpdating(cb : Function) {
        if (this.dir == 0) {
            this.dir = 1
            cb()
        }
    }
}

class Animator {

    animated : boolean = false 
    interval : number 

    start(cb : Function) {
        if (!this.animated) {
            this.animated = true 
            this.interval = setInterval(cb, delay)
        }
    }
    
    stop() {
        if (this.animated) {
            this.animated = false 
            clearInterval(this.interval)
        }
    }
}