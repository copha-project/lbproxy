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
        .option('-H --host <host>',"declare server bind address, default: 127.0.0.1")
        .option('-p --port <port>',"declare server bind port, default: 1080")
        .option('-D --daemon', "run at daemon mode")
        .option('-a --add <proxy>',"add a new proxy config")
        .option('-d --remove <proxy>',"remove a existed proxy config")
        .option('--remove-all',"remove all proxy")
        .option('-l --list','list proxy config')
}

async function main(){
    const program = new commander.Command()
    createCommander(program)
    await program.parseAsync()
    const opts = program.opts()
    if(!Object.keys(opts).length) return program.help()
    return commandResolver(opts)
}

module.exports = () => {
    main().catch(e=>{
        debug(e)
    })
}