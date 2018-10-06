const w = 600, h = 600, nodes = 5

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
