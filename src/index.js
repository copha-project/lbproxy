const socks = require('./socks5')
const debug = require('debug')('lbproxy')

exports.createServer = function(){
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
    server.listen(1080)
    console.log(`lbproxy server run port at :`,server.address().port)
    debug(`lbproxy server run at :`,server.address())
}

exports.Lbserver = socks