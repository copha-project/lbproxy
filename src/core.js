const Config = require('./config')
const path = require('path')
const { daemon, debug } = require('./common')
const Utils = require('uni-utils')
const socks = require('./socks5')
const Balancer = require('./balancer')
const Proxy = require('./proxy')

class Core {
    static #instance = null
    #config = Config.getInstance()
	
    constructor(){
    }
	
    static getInstance(){
        if(!this.#instance){
            this.#instance = new this
        }
        return this.#instance
    }
    
    get config(){
	    return this.#config
    }
	
    async renewProxy(url){
        this.config.renewLastTime = Utils.getTimeStamp()
        return this.connectUrlTest(url)
    }

    async connectUrlTest(testUrl){
        const list = this.listProxy()

        for (const item of list) {
            const proxy = new Proxy(item)
            try {
                const resp = await proxy.connect(testUrl || this.config.connectTestUrl)
                if(parseInt(resp.statusCode) !== 200){
                    proxy.setDown()
                }else{
                    proxy.setUp()
                }
            } catch (error) {
                debug(error.message)
                proxy.setDown()
            }
        }
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
	    const proxy = new Proxy()
        proxy.host = host
        proxy.port = parseInt(port)
        if(this.findProxy(proxy) >= 0) return
        return this.config.addProxy(proxy.toJson())
    }

    delProxy(data){
        const [host,port] = data.split(':')
        const proxy = new Proxy()
        proxy.host = host
        proxy.port = parseInt(port)
        return this.config.delProxy(proxy.toJson())
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

    createServer(options){
        const server = socks.createServer(options)
        Balancer.getInstance().setMethod(options.method)
        server.on('error', (e) => {
          if (e.code === 'EADDRINUSE') {
            console.error('Address in use')
            process.exit(100)
          }else{
            console.log(e.message)
          }
        })
     
        server.start(()=>{
          console.log(`lbproxy server run port at : ${server.address}:${server.port}`)
        })
    }
}

exports.getInstance = () => Core.getInstance()