
// const ab2str = ( buffer ) => {
//     return String.fromCharCode.apply( null , new Uint8Array( buffer ) );
// }

// const str2ab = ( str ) => {
//     const buf = new ArrayBuffer(str.length);
//     const bufView = new Uint8Array(buf);
//     for (let i = 0, strLen = str.length; i < strLen; i++) {
//         bufView[i] = str.charCodeAt(i);
//     }
//     return buf;
// }

import { base64ToBytes , bytesToBase64 } from './base64.js'

export const authenticate = async ( message , sendMessage ) => {

    let identity = await getIdentity( 
        window.localStorage.auth == null ? null : JSON.parse(window.localStorage.auth) 
        , (auth) => {
        window.localStorage.auth = JSON.stringify(auth)
        })

    console.log( identity )

    return true

}


const getPasswordKey = async ( password ) => {

    const textEncoder = new TextEncoder()

    let key = await crypto.subtle.importKey(
        'raw',
        textEncoder.encode(password),
        { name: 'PBKDF2' },
        false,
        [ 'deriveBits' , 'deriveKey' ] )

    return key
}

const getSymetricKey = async ( password , salt ) => {

    let passwordKey = await getPasswordKey( password )

    let key = await crypto.subtle.deriveKey( 
        { name: 'PBKDF2' , salt, hash: 'SHA-256', iterations: 100000 },
        passwordKey,
        { name: 'AES-GCM', length: 256 },
        true,
        [ 'wrapKey' , 'unwrapKey' ] )

    return key

}


const getIdentity = async ( source , store ) => {

    let identity = {}

    let defaultPassword = 'anonymous'
    let algorithm = { name: 'ECDSA', namedCurve: 'P-384' }
    let wrappingAlgorithm = { name: 'AES-GCM' , iv: undefined }

    const pemPublicHeader = '-----BEGIN PUBLIC KEY-----'
    const pemPublicFooter = '-----END PUBLIC KEY-----'
    const pemPrivateHeader = '-----BEGIN PRIVATE KEY-----'
    const pemPrivateFooter = '-----END PRIVATE KEY-----'

    if( source == null && crypto && crypto.subtle ){

        identity = await crypto.subtle.generateKey( algorithm , true, ['sign', 'verify' /*,'encrypt', 'decrypt' */] )
        identity.iv = wrappingAlgorithm.iv = crypto.getRandomValues(new Uint8Array(12) )
        identity.salt = crypto.getRandomValues( new Uint8Array(16) )
        const wrappingKey = await getSymetricKey( defaultPassword , identity.salt )

        //let exportedPrivateKey = await window.crypto.subtle.wrapKey( 'jwk' , identity.privateKey , wrappingKey , wrappingAlgorithm )
        //let exportedPublicKey = await window.crypto.subtle.exportKey( 'raw' , identity.publicKey )
        let exportedPrivateKey = await window.crypto.subtle.wrapKey( 'pkcs8' , identity.privateKey , wrappingKey , wrappingAlgorithm )
        let exportedPublicKey = await window.crypto.subtle.exportKey( 'spki' , identity.publicKey )

        let base64Nonce = bytesToBase64( identity.iv )
        let base64Salt = bytesToBase64( identity.salt )
        let base64PrivateKey = bytesToBase64( new Uint8Array( exportedPrivateKey ) )
        let base64PublicKey = bytesToBase64( new Uint8Array( exportedPublicKey ) )

        await store( {
            nonce: base64Nonce,
            salt: base64Salt,

            //privateKey: window.btoa( textDecoder.decode( exportedPrivateKey ) ),
            //publicKey: window.btoa( textDecoder.decode( exportedPublicKey ) )

            privateKey: pemPrivateHeader + '\n' + base64PrivateKey.match(/.{1,64}/g).join('\n') + '\n' + pemPrivateFooter,
            publicKey: pemPublicHeader + '\n' + base64PublicKey.match(/.{1,64}/g).join('\n') + '\n' + pemPublicFooter

        } )

    } else if( source != null && crypto && crypto.subtle ){

        const pemPublicKey = source.publicKey
        const pemPrivateKey = source.privateKey
        //let base64PublicKey = source.publicKey
        //let base64PrivateKey = source.privateKey
        const base64Nonce = source.nonce
        const base64Salt = source.salt

        const base64PublicKey = pemPublicKey.split( '-----' )[2].replace( /\s/g , '' )
        const base64PrivateKey = pemPrivateKey.split( '-----' )[2].replace( /\s/g , '' )

        let rawPublicKey = base64ToBytes( base64PublicKey )
        let rawPrivateKey = base64ToBytes( base64PrivateKey )
        let nonce = base64ToBytes( base64Nonce )
        let salt = base64ToBytes( base64Salt )
    
        identity.nonce = wrappingAlgorithm.iv = nonce
        identity.salt = salt
        const wrappingKey = await getSymetricKey( defaultPassword , identity.salt )

        try{
            //identity.publicKey = await window.crypto.subtle.importKey( 'raw' , rawPublicKey , algorithm , true , ['verify'] )
            //identity.privateKey = await window.crypto.subtle.unwrapKey( 'jwk' , rawPrivateKey , wrappingKey , wrappingAlgorithm , algorithm , true , ['sign'] )
            identity.publicKey = await window.crypto.subtle.importKey( 'spki' , rawPublicKey , algorithm , true , ['verify'] )
            identity.privateKey = await window.crypto.subtle.unwrapKey( 'pkcs8' , rawPrivateKey , wrappingKey , wrappingAlgorithm , algorithm , true , ['sign'] )
        } catch( error ){
            console.error( error )
        }

    }

    let rawPublicKey = await window.crypto.subtle.exportKey( 'raw' , identity.publicKey )
    let digest = await crypto.subtle.digest( 'SHA-256' , rawPublicKey )
    //identity.fingerprint = bytesToBase64( new Uint8Array(digest) )
    //identity.fingerprint = new Uint8Array(digest).map(b => b.toString(16).padStart(2, '0')).join(':')
    identity.fingerprint = Array.from( new Uint8Array( digest ) , function(byte) {
        return ('0' + (byte & 0xFF).toString(16)).toUpperCase().slice(-2);
      }).join(':')


    return identity

}