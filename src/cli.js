const pkg = require('../package')
const debug = require('debug')('lbproxy')
const commander = require('commander')
const {createServer} = require('./index')

function createCommander(program) {
    program.configureHelp({
      sortSubcommands: true,
      subcommandTerm: (cmd) => cmd.name()
    })

    program.name("lbproxy")

    program
        .version(pkg.version, '-v, --version', 'lbproxy version')
        .option('-H --host <host>',"declare server bind address, default: 127.0.0.1")
        .option('-p --port <port>',"declare server bind port, default: 1080")
        .option('-s --list <list>',"proxy config data, eg: ip:port[;ip:port]")
        .option('-d --daemon', "run at daemon mode")
}

async function main(){
    const program = new commander.Command()
    createCommander(program)
    const parseData = await program.parseAsync()
    const options = parseData.opts()
    createServer(options)
}

module.exports = () => {
    main().catch(e=>{
        debug(e)
    })
}