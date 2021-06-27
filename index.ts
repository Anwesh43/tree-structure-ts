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