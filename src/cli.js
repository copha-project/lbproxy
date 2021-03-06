const pkg = require('../package')
const {debug} = require('./common')
const commander = require('commander')
const { commandResolver } = require('./index')
const balancer = require('./balancer')

function createCommander(program) {
    program.configureHelp({
      sortSubcommands: true,
      subcommandTerm: (cmd) => cmd.name()
    })

    program.name("lbproxy")

    program
        .version(pkg.version, '-v, --version', 'lbproxy version')
        .option('-H --host <host>',"declare server bind address","127.0.0.1")
        .option('-p --port <port>',"declare server bind port", 1080)
        .option('-D --daemon', "run at daemon mode")
        .addOption(new commander.Option('-m --method <name>', 'select a load balance method').choices(balancer.methodNameList))
        .option('-a --add <proxy>',"add a new proxy to pool")
        .option('-d --remove <proxy>',"remove a existed proxy from pool")
        .option('-s --stop',"stop proxy server")
        .option('--remove-all',"remove all proxy from pool")
        .option('-l --list','list proxy config')
        .option('-r --renew [time]','check and update the list of proxy')
}

async function main(){
    const program = new commander.Command()
    createCommander(program)
    await program.parseAsync()
    const opts = program.opts()
    return commandResolver(opts)
}

module.exports = () => {
    main().catch(e=>{
        console.log(`Running error: ${e.message}`)
        debug(e)
    })
}