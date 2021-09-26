const socks = require('./socks5')
const debug = require('debug')('lbproxy')

exports.createServer = function(options){
    const host = options.host || '127.0.0.1'
    const port = options.port || 1080

    function initServer(server){
        server.on('proxyConnect', (info, destination) => {
            console.log('connected to remote server at %s:%d', info.address, info.port);
          
            // destination.on('data', (data) => {
            //   console.log(data.length);
            // })
          });
          
          // When data arrives from the remote connection
        //   server.on('proxyData', (data) => {
        //     console.log(data.length);
        //   });
          
          // When an error occurs connecting to remote destination
          server.on('proxyError', (err) => {
            console.error('unable to connect to remote server');
            console.error(err);
          });
          
          // When a request for a remote destination ends
          server.on('proxyDisconnect', (originInfo, destinationInfo, hadError) => {
            console.log(
              'client %s:%d request has disconnected from remote server at %s:%d with %serror',
              originInfo.address,
              originInfo.port,
              destinationInfo.address,
              destinationInfo.port,
              hadError ? '' : 'no ');
          });
          
          // When a proxy connection ends
          server.on('proxyEnd', (response, args) => {
            console.log('socket closed with code %d', response);
            console.log(args);
          });
    }
    const server = socks.createServer()
    initServer(server)
    server.listen(port,host,()=>{
      console.log(`lbproxy server run port at : ${server.address().address}:${server.address().port}`)
    })
}

exports.Lbserver = socks