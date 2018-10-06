const w = 600, h = 600, nodes = 5

const GifEncoder = require('gifencoder')
const Canvas = require('canvas')

class State {
    constructor() {
        this.scale = 0
        this.dir = 0
        this.prevScale = 0
    }

    update(cb) {
        this.scale += 0.05 * this.dir
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir
            this.dir = 0
            this.prevScale = this.scale
            cb()
        }
    }

    startUpdating(cb) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale
            cb()
        }
    }
}

class TSCNode {
    constructor(i) {
        this.i = i
        this.state = new State()
        this.addNeighbor()
    }

    addNeighbor() {
        if (this.i < nodes - 1) {
            this.next = new TSCNode(this.i + 1)
            this.next.prev = this
        }
    }

    draw(context) {
        const gap = w / (nodes + 1)
        const r = gap / 3
        context.lineWidth = Math.min(w, h) / 60
        context.lineCap = 'round'
        context.strokeStyle = '#1565C0'
        context.save()
        context.translate(this.i * gap + gap, h/2)
        for (var j = 0; j < 2; j++) {
            const sf = 1 - 2 * j
            const sc = Math.min(0.5, this.state.scale - 0.5 * j)
            context.beginPath()
            var k = 0
            var deg = 90 * sc
            for(var j = -deg; j <= deg; j++) {
                const x = r * Math.cos(j * Math.PI/180), y = r * Math.sin(j * Math.PI/180)
                if (k == 0) {
                    context.moveTo(x, y)
                } else {
                    context.lineTo(x, y)
                }
                k++
            }
            context.stroke()
        }
        context.restore()
        if (this.prev) {
            this.prev.draw(context)
        }
    }

    update(cb) {
        this.state.update(cb)
    }

    startUpdating() {
        this.state.startUpdating()
    }

    getNext(dir, cb) {
        var curr = this.prev
        if (dir == 1) {
            curr = this.next
        }
        if (curr) {
            return curr
        }
        cb()
        return this
    }
}

class TwoSideCircle {
    constructor() {
        this.curr = new TSCNode(0)
        this.dir = 1
        this.curr.startUpdating()
    }

    draw(context) {
        this.curr.draw(context)
    }

    update(cb) {
        this.curr.update(() => {
            this.curr = this.curr.getNext(this.dir, () => {
                this.dir *= -1
            })
            if (this.curr.i == 0 && this.dir == 1) {
                cb()
            } else {
                this.curr.startUpdating()
            }
        })
    }
}

class Renderer {
    constructor() {
        this.running = false
        this.curr = new TwoSideCircle()
    }

    render(context, cb, endcb) {
        if (this.running) {
            context.fillStyle = '#212121'
            this.curr.draw(context)
            cb(context)
            this.curr.update(() => {
                endcb()
                this.running = false
            })
        }
    }
}

 class TwoSideCircleGif {
    constructor() {
        this.renderer = new Renderer()
        this.canvas = new Canvas(w, h)
        this.encoder = new GifEncoder(w, h)
        this.context = this.canvas.getContext('2d')
    }

    initEncoder(fn) {
        this.encoder.setRepeat(0)
        this.encoder.setDelay(50)
        this.encoder.setQuality(100)
        this.encoder.createReadStream().pipe(require('fs').createWriteStream(fn))
    }

    create() {
        this.encoder.start()
        this.renderer.render(this.context, (ctx) => {
            this.encoder.addFrame(ctx)
        }, () => {
            this.encoder.end()
        })
    }

    static init(fn) {
        const gif = new TwoSideCircleGif()
        gif.initEncoder(fn)
        gif.create()
    }
 }

module.exports = TwoSideCircleGif.init
