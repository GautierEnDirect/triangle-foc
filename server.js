import http from 'http'
import { Server as FileServer } from 'node-static'
import WebSocket from 'ws'
import { authenticate } from './public/auth.js'
//import crypto from 'crypto'

// const generateAcceptValue = ( acceptKey ) => {
//   return crypto
//   .createHash( 'sha1' )
//   .update( acceptKey + '258EAFA5-E914–47DA-95CA-C5AB0DC85B11', 'binary' )
//   .digest( 'base64' )
// }



const fileServer = new FileServer('./public')

const server = http.createServer( ( request , response ) => {

    request.addListener( 'end' , () => { fileServer.serve( request , response ) } ).resume()

} )

const websocketServer = new WebSocket.Server({
    server,
    perMessageDeflate: {
        zlibDeflateOptions: {
        // See zlib defaults.
        chunkSize: 1024,
        memLevel: 7,
        level: 3
        },
        zlibInflateOptions: {
        chunkSize: 10 * 1024
        },
        // Other options settable:
        clientNoContextTakeover: true, // Defaults to negotiated value.
        serverNoContextTakeover: true, // Defaults to negotiated value.
        serverMaxWindowBits: 10, // Defaults to negotiated value.
        // Below options specified as default values.
        concurrencyLimit: 10, // Limits zlib concurrency for perf.
        threshold: 1024 // Size (in bytes) below which messages should not be compressed.
    }
})

websocketServer.on( 'connection' , ( ws ) => {



    ws.on( 'message', async ( message ) => {

        //if( await authenticate( message , (data) => ws.send( JSON.stringify( data ) ) ) ){

            //console.log( 'SERVER AUTH OK' )

        //}

        console.log( 'received: %s' , message );

        if( message == 'hello' ){
            ws.send( 'Hello world !' )
        }

    })
})

server.listen( 3000 )