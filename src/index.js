const path = require('path')
const fs = require('fs')
const socks = require('./socks5')
const {debug} = require('./common')
const Core = require('./core')
const Utils = require('uni-utils')

function createServer(options){
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
    server.on('error', (e) => {
      if (e.code === 'EADDRINUSE') {
        console.error('Address in use')
      }else{
        console.log(e.message)
      }
    })
 
    server.listen(port,host,()=>{
      console.log(`lbproxy server run port at : ${server.address().address}:${server.address().port}`)
    })
}

exports.commandResolver = async (options) => {
  debug(options)
  const core = new Core()

  if(options.stop){
    const pid = 11354
    return process.kill(pid)
  }

  if(options.add){
    return core.addProxy(options.add)
  }

  if(options.remove){
    return core.delProxy(options.remove)
  }

  if(options.removeAll){
    return core.delProxys()
  }

  if(options.list){
    const list = core.listProxy()
    if(list.length){
      console.log('Proxy List:')
      console.table(
        list.map(item => ({
            Type: item.type,
            Host: item.host,
            Port: item.port
        }))
      )
    }else{
      console.log('no proxy add')
    }
    return
  }

  // start service
  if(!Object.keys(options).length || options.host || options.port || options.daemon){
    if(options.daemon){
      const Entry = "dev"
      Utils.createProcess(
          path.resolve(__dirname,`../bin/${Entry}.js`),
          ['--host',options.host,'--port',options.port]
        )
      .then(p=>{

        console.log(`pid: ${p.pid}`)
      })
      .catch(err=>{
        console.log(`Error: ${err.msg}`)
      })
      return
    }
    return createServer(options)
  }
}

exports.Lbserver = socks