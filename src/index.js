const path = require('path')
const fs = require('fs')
const socks = require('./socks5')
const {debug} = require('./common')
const Core = require('./core')
const Utils = require('uni-utils')
const Balancer = require('./balancer')

function createServer(options){
    const server = socks.createServer(options)
    Balancer.getInstance().setMethod(options.method)
    // initServer(server)
    server.on('error', (e) => {
      if (e.code === 'EADDRINUSE') {
        console.error('Address in use')
      }else{
        console.log(e.message)
      }
    })
 
    server.start(()=>{
      console.log(`lbproxy server run port at : ${server.address}:${server.port}`)
    })
}

exports.commandResolver = async (options) => {
  debug(options)
  const core = new Core()

  if(options.stop){
    const pid = core.config.get('pid')
    try {
      process.kill(pid)
      console.log('service stoped.')
    } catch {
      console.log('service is not running.')
    }
    return
  }

  if(options.add){
    return core.addProxy(options.add)
  }

  if(options.remove){
    return core.delProxy(options.remove)
  }

  if(options.removeAll){
    return core.delProxies()
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
      try {
        const p = await Utils.createProcess(
            path.resolve(__dirname,`../bin/${Entry}.js`),
            ['--host',options.host,'--port',options.port,'--method',options.method || Balancer.DefaultMethodName]
          )
        core.config.set('pid', p.pid)
        console.log(`server pid on : ${p.pid}`)
        //todo: createProcess should unref parent process
        process.exit(0)
      } catch (err) {
        console.log(`Error: ${err.message || err.msg}`)
      }
      return
    }
    return createServer(options)
  }
}
