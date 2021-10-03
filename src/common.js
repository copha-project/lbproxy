const Utils = require('uni-utils')
const stream = require('stream')

const createError = (code,msg) => {
    const err = new Error(msg)
    err.code = code || 0
    return err
}

exports.createError = createError
exports.debug = require('debug')('lbproxy') 

exports.daemon = async (file, args, env={}) => {
    return new Promise((resolve,reject)=>{
        const tmp = new class extends stream.Writable{_write(...args){args[2]()}}()
        const w = require('child_process').fork(file, args, {
        // const w = require('child_process').spawn('node', ['--inspect',file].concat(args), {        
            detached: true,
            stdio: ["ignore","ignore","pipe","ipc"],
            env:{
                ...process.env,
                ...env
            }
        })
        let code = 0,
            msg = ""
        w.stderr.pipe(tmp)
        w.stderr.once('data',_msg => {
            msg = _msg
        })
        w.once('exit', (_code) => {
          code = _code
        })
        Utils.sleep(1000)
        .then(()=>{
            w.stderr.destroy()
            tmp.destroy()
            w.unref()
            w.channel?.unref?.()
            if(code != 0){
                reject(createError(code,msg))
            }
            resolve(w)
        })
    })
}