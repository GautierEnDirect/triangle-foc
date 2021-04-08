import { authenticate } from './lib/auth.js'

let ws = new WebSocket( 'ws://localhost:3000/' )

ws.addEventListener( 'open' , () => {

    ws.send( 'hello' )

} )

ws.addEventListener( 'message' , async (event) => {

    if( await authenticate(event.data , (data) => ws.send( JSON.stringify(data) ) ) ){

        console.log( 'CLIENT AUTH OK' )

    }


    console.log( 'Received:' , event.data )
} )
