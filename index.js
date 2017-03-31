const { queryp } = require('./lib/queryproc')
module.exports = {
    queryp
}
if( module.parent === null ){
    queryp({comm:"chrome"}, (err, procs)=>{
        if( err ){
            console.error(err)
            return
        }
        procs.forEach((proc)=>{
            console.log( `${proc.pid} ${proc.command}` )
        })
    })
}