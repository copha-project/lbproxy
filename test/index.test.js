const socks5 = require('../src/socks')
const axios = require('axios').default
const randomUseragent = require('random-useragent')

const SocksProxyAgent = require('socks-proxy-agent')
const ProxyTimeout = 5000

async function createServer(){
    function initServer(server){
        server.on('proxyConnect', (info, destination) => {
          console.log('connected to remote server at %s:%d', info.address, info.port);
    
        //   destination.on('data', (data) => {
        //     console.log(data.length);
        //   });
        });
    
        // When data arrives from the remote connection
        server.on('proxyData', (data) => {
        //   console.log(data.length);
        });
    
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
        })
    
        server.on('close', ()=>{
            console.log('all client disconnect, server be close')
        })
    }

    const server = new socks5.SocksServer()
    

    initServer(server.server)

    server.listen(1080)
    setInterval(()=>{
        for (const client of server.clients) {
            console.log(client.localAddress)
        }
    },5000)

    let token = 0

    process.on('SIGINT',()=>{
        console.log(token,server.clients)
        if(token==0){
            server.server.close(()=>{
                console.log('manual stop server callback')
                process.exit()
            })
        }
        token++
    })
    console.log("create server done");
}

const req = async function (url,proxy) {
    const proxyOptions = `socks5://${proxy}`
    // create the socksAgent for axios
    const httpsAgent = new SocksProxyAgent(proxyOptions)
    const httpAgent = httpsAgent

    const CancelToken = axios.CancelToken
    const source = CancelToken.source()

    const options = {
        timeout: ProxyTimeout,
        cancelToken: source.token,
        headers: {
            'User-Agent': randomUseragent.getRandom()
        },
        httpsAgent,
        httpAgent
    }

    try {
        setTimeout(source.cancel,ProxyTimeout)

        const response = await axios.get(url,options)

        console.log(response.data)
        console.log(response.status)

    } catch (e) {
        console.log(e.message)
    }
}

;(async ()=>{
    console.log(process.pid,process.argv[2])
    try {
        switch (process.argv[2]) {
            case 'c':
                {
                    console.log('req')
                    const url = process.argv[3] ||  "http://www.baidu.com"
                    const proxy = "127.0.0.1:1080"
                    await req(url,proxy)
                    console.log('req end');
                }
                break
            default:
                createServer()

        }
    } catch (e) {
        console.log(e)
    }
})()

