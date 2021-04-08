

const getTriangleHeightFromBase = (base) => 0.5 * Math.sqrt(3) * base
const getTriangleBaseFromHeight = (height) => height / ( 0.5 * Math.sqrt(3) )
const getDistance = ( a , b ) => Math.sqrt( Math.pow( a.x - b.x , 2 ) + Math.pow( a.y - b.y , 2 ) )
const getTriangleArea = ( a , b , c ) => {
    let s = ( a + b + c ) / 2
    return Math.sqrt( s * Math.abs(s-a) * Math.abs(s-b) * Math.abs(s-c) )
}

customElements.define( 'triangle-foc' , class extends HTMLElement{

    constructor(){
        super()
        this.padding = 50
        this.grid = []
        this.gridStep = 6
        this.canvas = null
        this.context = null
        this.base = null
        this.height = null
        this.F = null
        this.O = null
        this.C = null
        this.simpleGrid = true

        this.lastSelectedIndex = null
        this.mouseClicked = false

        this.attachShadow({mode: 'open'})

        this.canvas = document.createElement( 'canvas' )

        const style = document.createElement('style');
        style.textContent = ':host { display: inline-block; }'

        this.shadowRoot.append( style , this.canvas )

        this.canvas.addEventListener( 'mousedown' , e => this.onMouseDown(e) )
        this.canvas.addEventListener( 'mousemove' , e => this.onMouseMove(e) )
        this.canvas.addEventListener( 'mouseup' , e => this.onMouseUp(e) )

        this.canvas.addEventListener( 'touchstart' , e => this.onMouseDown(e) )
        this.canvas.addEventListener( 'touchmove' , e => this.onMouseMove(e) )
        this.canvas.addEventListener( 'touchend' , e => this.onMouseUp(e) )
        
        this.resizeTimeout = null
        window.addEventListener( 'resize' , () => {
            if( this.resizeTimeout != null ){
                clearTimeout( this.resizeTimeout )
            }
            this.resizeTimeout = setTimeout( () => {
                this.refresh()
                this.resizeTimeout = null
            } , 500 )
        } )

    }

    connectedCallback(){
        this.refresh()
    }

    refresh(){
        this.drawTriangle()
        this.buildGrid()
        //this.drawGrid()

        if( this.lastSelectedIndex != null ){
            this.drawPoint( this.grid[ this.lastSelectedIndex ] , 10 , 'black' )
        }
    }

    drawTriangle(){

        // this.canvas = this.shadowRoot.firstChild

        // if( this.canvas == null ){
        //     this.canvas = document.createElement( 'canvas' )
        //     this.canvas.id = 'triangle'
        //     this.shadowRoot.append( this.canvas )

        //     this.canvas.addEventListener( 'mousedown' , e => this.onMouseDown(e) )
        //     this.canvas.addEventListener( 'mousemove' , e => this.onMouseMove(e) )
        //     this.canvas.addEventListener( 'mouseup' , e => this.onMouseUp(e) )
        // }

        this.canvas.height = this.clientHeight
        this.canvas.width = this.clientWidth

        let maxHeight = this.canvas.height - 2 * this.padding
        let maxWidth = this.canvas.width - 2 * this.padding

        this.base = getTriangleBaseFromHeight( maxHeight )
        this.height = getTriangleHeightFromBase( maxWidth )

        if( this.base <= maxWidth ){
            this.height = getTriangleHeightFromBase( this.base )
        } else {
            this.base = getTriangleBaseFromHeight( this.height )
        }

        this.F = { x: this.canvas.width / 2 , y: (this.canvas.height - this.height) / 2 }
        this.O = { x: (this.canvas.width - this.base) / 2 , y: (this.canvas.height + this.height) / 2 }
        this.C = { x: (this.canvas.width + this.base) / 2 , y: (this.canvas.height + this.height) / 2 }


        this.context = this.canvas.getContext( '2d' )

        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.beginPath()
        this.context.moveTo( this.F.x , this.F.y )
        this.context.lineTo( this.O.x , this.O.y )
        this.context.lineTo( this.C.x , this.C.y )
        this.context.lineTo( this.F.x , this.F.y )
        this.context.stroke()
        this.context.closePath()

        this.context.font  = '4vw sans-serif'
        this.context.fillText( 'F' , this.F.x - 4 , this.F.y - 16 )
        this.context.fillText( 'O' , this.O.x - this.context.measureText('O').width - 14 , this.O.y + this.context.measureText('O').actualBoundingBoxAscent )
        this.context.fillText( 'C' , this.C.x + 14 , this.C.y + this.context.measureText('C').actualBoundingBoxAscent )

    }

    buildGrid(){
        this.grid = []
        this.grid.push( this.F )
        this.grid.push( this.O )
        this.grid.push( this.C )

        //this.grid.push( { x: (this.F.x+this.O.x)/2 , y: (this.F.y+this.O.y)/2 } )
        //this.grid.push( { x: (this.F.x+this.C.x)/2 , y: (this.F.y+this.C.y)/2 } )
        //this.grid.push( { x: (this.C.x+this.O.x)/2 , y: (this.C.y+this.O.y)/2 } )

        this.grid.push( { x: this.O.x + this.base/2*(1/6) , y: this.O.y - this.height*(1/6) } )
        this.grid.push( { x: this.O.x + this.base/2*(2/6) , y: this.O.y - this.height*(2/6) } )
        this.grid.push( { x: this.O.x + this.base/2*(3/6) , y: this.O.y - this.height*(3/6) } )
        this.grid.push( { x: this.O.x + this.base/2*(4/6) , y: this.O.y - this.height*(4/6) } )
        this.grid.push( { x: this.O.x + this.base/2*(5/6) , y: this.O.y - this.height*(5/6) } )

        this.grid.push( { x: this.F.x + this.base/2*(5/6) , y: this.O.y - this.height*(1/6) } )
        this.grid.push( { x: this.F.x + this.base/2*(4/6) , y: this.O.y - this.height*(2/6) } )
        this.grid.push( { x: this.F.x + this.base/2*(3/6) , y: this.O.y - this.height*(3/6) } )
        this.grid.push( { x: this.F.x + this.base/2*(2/6) , y: this.O.y - this.height*(4/6) } )
        this.grid.push( { x: this.F.x + this.base/2*(1/6) , y: this.O.y - this.height*(5/6) } )

        this.grid.push( { x: this.O.x + this.base*(1/6) , y: this.O.y } )
        this.grid.push( { x: this.O.x + this.base*(2/6) , y: this.O.y } )
        this.grid.push( { x: this.O.x + this.base*(3/6) , y: this.O.y } )
        this.grid.push( { x: this.O.x + this.base*(4/6) , y: this.O.y } )
        this.grid.push( { x: this.O.x + this.base*(5/6) , y: this.O.y } )

        this.grid.push( { x: this.F.x , y: this.F.y + this.height*1/6 } )
        this.grid.push( { x: this.F.x , y: this.F.y + this.height*2/6 } )
        this.grid.push( { x: this.F.x , y: this.F.y + this.height*3/6 } )
        this.grid.push( { x: this.F.x , y: this.F.y + this.height*4/6 } )
        this.grid.push( { x: this.F.x , y: this.F.y + this.height*5/6 } )

        this.grid.push( {   x: this.O.x + Math.cos(Math.PI/6)*this.height*1/6,
                            y: this.O.y - Math.sin(Math.PI/6)*this.height*1/6 } )

        this.grid.push( {   x: this.O.x + Math.cos(Math.PI/6)*this.height*2/6,
                            y: this.O.y - Math.sin(Math.PI/6)*this.height*2/6 } )

        this.grid.push( {   x: this.O.x + Math.cos(Math.PI/6)*this.height*3/6,
                            y: this.O.y - Math.sin(Math.PI/6)*this.height*3/6 } )

        this.grid.push( {   x: this.O.x + Math.cos(Math.PI/6)*this.height*5/6,
                            y: this.O.y - Math.sin(Math.PI/6)*this.height*5/6 } )

        this.grid.push( {   x: this.C.x - Math.cos(Math.PI/6)*this.height*1/6,
                            y: this.C.y - Math.sin(Math.PI/6)*this.height*1/6 } )

        this.grid.push( {   x: this.C.x - Math.cos(Math.PI/6)*this.height*2/6,
                            y: this.C.y - Math.sin(Math.PI/6)*this.height*2/6 } )

        this.grid.push( {   x: this.C.x - Math.cos(Math.PI/6)*this.height*3/6,
                            y: this.C.y - Math.sin(Math.PI/6)*this.height*3/6 } )

        this.grid.push( {   x: this.C.x - Math.cos(Math.PI/6)*this.height*5/6,
                            y: this.C.y - Math.sin(Math.PI/6)*this.height*5/6 } )

        if( ! this.simpleGrid ){

            this.grid.push( {   x: (this.grid[6].x + this.grid[19].x + this.grid[20].x + this.grid[30].x + this.grid[5].x) / 5,
                                y: (this.grid[6].y + this.grid[19].y + this.grid[20].y + this.grid[30].y + this.grid[5].y) / 5 } )

            this.grid.push( {   x: (this.grid[11].x + this.grid[19].x + this.grid[20].x + this.grid[10].x + this.grid[26].x) / 5,
                                y: (this.grid[11].y + this.grid[19].y + this.grid[20].y + this.grid[10].y + this.grid[26].y) / 5 } )

            this.grid.push( {   x: (this.grid[5].x + this.grid[30].x + this.grid[25].x + this.grid[24].x + this.grid[4].x) / 5,
                                y: (this.grid[5].y + this.grid[30].y + this.grid[25].y + this.grid[24].y + this.grid[4].y) / 5 } )

            this.grid.push( {   x: (this.grid[10].x + this.grid[26].x + this.grid[29].x + this.grid[28].x + this.grid[9].x) / 5,
                                y: (this.grid[10].y + this.grid[26].y + this.grid[29].y + this.grid[28].y + this.grid[9].y) / 5 } )

            this.grid.push( {   x: (this.grid[22].x + this.grid[15].x + this.grid[14].x + this.grid[24].x + this.grid[25].x) / 5,
                                y: (this.grid[22].y + this.grid[15].y + this.grid[14].y + this.grid[24].y + this.grid[25].y) / 5 } )

            this.grid.push( {   x: (this.grid[22].x + this.grid[15].x + this.grid[16].x + this.grid[28].x + this.grid[29].x) / 5,
                                y: (this.grid[22].y + this.grid[15].y + this.grid[16].y + this.grid[28].y + this.grid[29].y) / 5 } )

            this.grid.push( {   x: (this.grid[3].x + this.grid[4].x + this.grid[33].x + this.grid[24].x + this.grid[23].x) / 5,
                                y: (this.grid[3].y + this.grid[4].y + this.grid[33].y + this.grid[24].y + this.grid[23].y) / 5 } )

            this.grid.push( {   x: (this.grid[23].x + this.grid[24].x + this.grid[35].x + this.grid[14].x + this.grid[13].x) / 5,
                                y: (this.grid[23].y + this.grid[24].y + this.grid[35].y + this.grid[14].y + this.grid[13].y) / 5 } )

            this.grid.push( {   x: (this.grid[36].x + this.grid[28].x + this.grid[27].x + this.grid[17].x + this.grid[16].x) / 5,
                                y: (this.grid[36].y + this.grid[28].y + this.grid[27].y + this.grid[17].y + this.grid[16].y) / 5 } )

            this.grid.push( {   x: (this.grid[34].x + this.grid[9].x + this.grid[8].x + this.grid[27].x + this.grid[28].x) / 5,
                                y: (this.grid[34].y + this.grid[9].y + this.grid[8].y + this.grid[27].y + this.grid[28].y) / 5 } )
        
            this.grid.push( {   x: (this.grid[7].x + this.grid[18].x + this.grid[19].x + this.grid[31].x + this.grid[6].x) / 5,
                                y: (this.grid[7].y + this.grid[18].y + this.grid[19].y + this.grid[31].y + this.grid[6].y) / 5 } )
        
            this.grid.push( {   x: (this.grid[18].x + this.grid[12].x + this.grid[11].x + this.grid[32].x + this.grid[19].x) / 5,
                                y: (this.grid[18].y + this.grid[12].y + this.grid[11].y + this.grid[32].y + this.grid[19].y) / 5 } )
        }
    }

    drawGrid(){

        for( let p of this.grid ){
            this.drawPoint( p , 3 , 'black')
        }

    }


    onMouseDown( e ){

        this.mouseClicked = true
        let index = this.searchNearestGridPoint( { x: e.offsetX , y: e.offsetY } )
        this.selectGridPoint( index )

    }

    onMouseMove( e ){

        if( this.mouseClicked ){
            let index = this.searchNearestGridPoint( { x: e.offsetX , y: e.offsetY } )
            this.selectGridPoint( index )    
        }

    }

    onMouseUp( e ){

        this.mouseClicked = false

    }

    searchNearestGridPoint( { x , y } ){
        let shortestDistance = null
        let index = null

        for( let gridPointIndex in this.grid ){
            let gridPoint = this.grid[ gridPointIndex ]
            let distance = getDistance( { x , y } , gridPoint )

            if( shortestDistance == null || distance < shortestDistance ){
                shortestDistance = distance
                index = gridPointIndex
            }
        }

        return index
    }

    selectGridPoint( index ){

        if( index != this.lastSelectedIndex ){
            console.log( 'selected index: ' , index )
            this.lastSelectedIndex = index
            this.refresh()

            let XF = getDistance( this.grid[index] , this.F )
            let XO = getDistance( this.grid[index] , this.O )
            let XC = getDistance( this.grid[index] , this.C )

            let areaXOC = getTriangleArea( XO , XC , this.base )
            let areaXFC = getTriangleArea( XF , XC , this.base )
            let areaXFO = getTriangleArea( XF , XO , this.base )
            let total = areaXOC + areaXFC + areaXFO

            console.log( 'F : ' + Math.round( areaXOC*100/total ) )
            console.log( 'O : ' + Math.round( areaXFC*100/total ) )
            console.log( 'C : ' + Math.round( areaXFO*100/total ) )

        }
    }


    drawPoint( { x , y } , radius , color ){
        this.context.beginPath()
        this.context.arc( x , y , radius , 0 , 2 * Math.PI )
        this.context.fillStyle = color
        this.context.fill()
        this.context.closePath()
    }

} )