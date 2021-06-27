const w : number = window.innerWidth 
const h : number = window.innerHeight 
const parts : number = 3 
const scGap : number = 0.02 / parts 
const strokeFactor : number = 90 
const rFactor : number = 26.9 
const delay : number = 20 
const backColor : string = "#BDBDBD"
const sizeFactor : number = 7.9 
const divideFactor : number = 3.4
const children : number = 2

class ScaleUtil {
    
    static maxScale(scale : number, i : number, n : number) : number {
        return Math.max(0, scale - i / n)
    }

    static divideScale(scale : number, i : number, n : number) : number {
        return Math.min(1 / n, ScaleUtil.maxScale(scale, i, n)) * n
    }
}

class DrawingUtil {

    static drawLine(context : CanvasRenderingContext2D, x1 : number, y1 : number, x2 : number, y2 : number) {
        context.beginPath()
        context.moveTo(x1, y1)
        context.lineTo(x2, y2)
        context.stroke()
    }

    static drawCircle(context : CanvasRenderingContext2D, x : number, y : number, r : number) {
        context.beginPath()
        context.arc(x, y, r, 0, 2 * Math.PI)
        context.fill()
    }

    static getXGap(i : number) : number{
        return (w / ((i + 1) * sizeFactor))
    }

    static getYSize(i : number) : number {
        return i == 0 ? h : h / (divideFactor * i)
    }

    

    static drawNode(context : CanvasRenderingContext2D, i : number, next : boolean, scale : number, cb : Function) {
        const currParts : number = next ? parts : parts - 1
        const x : number =  DrawingUtil.getXGap(i)
        const y : number = DrawingUtil.getYSize(i)
        console.log("X, Y", x, y)
        const r : number = Math.min(w, h) / (rFactor * (i + 1)) 
        if (next) {
            context.save()
            context.translate(x, r)
            DrawingUtil.drawLine(context, 0, 0, 0, y * ScaleUtil.divideScale(scale, 2, currParts))
            cb()
            context.restore()
        }
        
        const sc1 : number = ScaleUtil.divideScale(scale, 0, currParts)
        const sc2 : number = ScaleUtil.divideScale(scale, 1, currParts)
        context.save()
        DrawingUtil.drawLine(context, 0, r, x * sc1, r)
        DrawingUtil.drawCircle(context, x, r, r * sc2)
        context.restore()
    }
}

class Stage {

    canvas : HTMLCanvasElement = document.createElement('canvas')
    context : CanvasRenderingContext2D 
    renderer : Renderer = new Renderer()


    initCanvas() {
        this.canvas.width = w 
        this.canvas.height = h 
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = backColor 
        this.context.fillRect(0, 0, w, h)
        this.renderer.render(this.context)
    }

    handleTap() {
        this.canvas.onmousedown = () => {
            this.renderer.handleTap(() => {
                this.render()
            })
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

class TSNode {

    children : Array<TSNode> = []
    state : State = new State()

    constructor(private level : number) {
        this.populateChildren()

    }
    
    populateChildren() {
        if (this.level >= 5) {
            return 
        }
        for (let i = 0; i < children; i++) {
            this.children.push(new TSNode(this.level + 1))
        }
    }

    draw(context : CanvasRenderingContext2D) {
        //console.log("SCALE_NODE", this.state.scale)
        DrawingUtil.drawNode(context, this.level, this.children.length > 0, this.state.scale, () => {
            this.children.forEach((child : TSNode, j : number) => {
                const gap : number = DrawingUtil.getYSize(this.level)
                const yGap : number = (gap * 0.8) / this.children.length 
                context.save()
                context.translate(0, 0.1 * gap + yGap * j)
                child.draw(context)
                context.restore()
            })
        })
    }

    update(cb : Function) {
        this.state.update(cb)
    }

    startUpdating(cb : Function) {
        this.state.startUpdating(cb)
    }

    consumeChildren(cb : Function) {
        this.children.forEach((node : TSNode) => {
            cb(node)
        })
    }
}

class TreeStructure {

    root : TSNode = new TSNode(0)
    queue : Array<TSNode> = [this.root]

    draw(context : CanvasRenderingContext2D) {
        this.root.draw(context)
    } 

    update(cb : Function) {
        const n : number = this.queue.length 
        let k : number = 0 
        for (let j = 0; j < n; j++) {
            this.queue[j].update(() => {
                k++ 
                if (k == n) {
                    this.flushAndPopulateQueue(cb, n)
                }
            })
        }
    }

    flushAndPopulateQueue(cb : Function, n : number) {
        const nodes : Array<TSNode> = this.queue.splice(0, n)
        cb()
        nodes.forEach((node : TSNode) => {
            
            node.consumeChildren((curr : TSNode) => {
                this.queue.push(curr)
            })
        })
        console.log("QUEUE", this.queue)
    }

    startUpdating(cb : Function) {
        this.queue.forEach((node : TSNode, i : number) => {
            node.startUpdating(() => {
                if (i == 0) {
                    cb()
                }
            })
        })
    }
}

class Renderer {

    ts : TreeStructure = new TreeStructure() 
    animator : Animator = new Animator()
    render(context : CanvasRenderingContext2D) {
        context.fillStyle = 'indigo'
        context.strokeStyle = 'black'
        context.lineCap = 'round'
        context.lineWidth = Math.min(w, h) / strokeFactor
        this.ts.draw(context)    
    }

    handleTap(cb : Function) {
        this.ts.startUpdating(() => {
            this.animator.start(() => {
                cb()
                this.ts.update(() => {
                    this.animator.stop()
                    cb()
                })
            })
        })
    }
}