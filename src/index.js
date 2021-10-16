const {debug} = require('./common')
const Core = require('./core')

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
  
  if(options.renew && !Number.isInteger(parseInt(options.renew))){
    debug('start renew')
    return core.renewProxy()
  }

  if(options.list){
    const list = core.listProxy()
    if(list.length){
      console.log('Proxy List:')
      console.table(
        list.map(item => ({
            Type: item.type,
            Host: item.host,
            Port: item.port,
            Active: item.active
        }))
      )
    }else{
      console.log('no proxy add')
    }
    return
  }

  // start service
  if(!Object.keys(options).length || options.host || options.port || options.daemon){
    if(core.listProxy().length === 0){
      throw Error('No proxy available, need to add it before run service.')
    }

    if(options.daemon){
      try {
        const p = await core.daemon(options)
        core.config.set('pid', p.pid)
        console.log(`server pid on : ${p.pid}`)
        process.exit(0)
      } catch (err) {
        console.log(`Daemon Error(${err.code}): ${err.message || err.msg || err}`)
      }
      return
    }

    // pre check proxy
    if(options.method === "LRT"){
      debug('LRT need pre renew')
      await core.renewProxy()
    }

    return core.createServer(options)
  }
}
