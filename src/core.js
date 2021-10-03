const Config = require('./config')
const path = require('path')
const { daemon } = require('./common')
const Balancer = require('./balancer')

const PROXY_ITEM = {
	type: 5,
	host: '',
	port: 1080
  }

class Core {
    constructor(){
        this.config = new Config()
    }

    getProxy(){
        const proxies = this.listProxy()
        if(proxies.length==0){
            throw Error('proxy pool not has proxy.')
        }
        // todo 添加获取代理的策略
        return proxies[0]
    }

    listProxy(){
        return this.config.proxies
    }

    findProxy(proxy){
        return this.config.proxies.findIndex(e=>{
            return e.host === proxy.host && e.port === parseInt(proxy.port)
        })
    }

    addProxy(data){
        const [host,port] = data.split(':')
        if(!host || !port) throw Error('format error')
        const proxy = Object.assign({},PROXY_ITEM)
        proxy.host = host
        proxy.port = parseInt(port)
        if(this.findProxy(proxy) >= 0) return
        return this.config.addProxy(proxy)
    }

    delProxy(data){
        const [host,port] = data.split(':')
        const proxy = Object.assign({},PROXY_ITEM)
        proxy.host = host
        proxy.port = parseInt(port)
        return this.config.delProxy(proxy)
    }

    delProxies(){
        return this.config.delProxies()
    }

    async daemon(options){
        const Entry = "index"
        const execPath = path.resolve(__dirname,`../bin/${Entry}.js`)
        const args = ['--host',options.host,'--port',options.port,'--method',options.method || Balancer.DefaultMethodName]
        return daemon(execPath,args,{LBPROXY_DAEMON:1,DEBUG:'none'})
    }
}

module.exports = Core
module.exports.getProxy = ()=>{
    const core = new Core()
    return core.getProxy()
}