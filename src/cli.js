const pkg = require('../package')
const {debug} = require('./common')
const commander = require('commander')
const { commandResolver } = require('./index')

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
        .option('-a --add <proxy>',"add a new proxy config")
        .option('-d --remove <proxy>',"remove a existed proxy config")
        .option('-s --stop',"stop proxy server")
        .option('--remove-all',"remove all proxy")
        .option('-l --list','list proxy config')
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