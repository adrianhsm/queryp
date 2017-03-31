const es = require('event-stream')
const { spawn }  = require('child_process')
const _ = require('lodash')
let headers = null
let winItems = [
    'CommandLine','Name','ProcessId','ParentProcessId'
]
let linuxItems = [
    'cmd','command','pid','ppid'
]
let linuxPFields = [
    'cmd','comm','pid','ppid'  // this is set because that you should specify comm for the name of process although it may be listed as head 'command'
]

const headerConvert = (header)=>{
    if( process.platform !== 'win32'){
        return header.toLowerCase()
    }
    const idx = _.indexOf( winItems, header )
    if( idx !== -1 ){
        if( idx < linuxItems.length ){
            return linuxItems[idx]
        }
    }
    return null
}
const queryp = (filter, pcallback)=>{
   if( typeof filter !== 'object' ){
       cb(new Error("filter should be an object"), null)
       return
   } 
   if( filter === null ){
       filter = {}  //set filter to {} so that no process will be passed
   } 
   const regFilter =  _.mapValues(filter,(f)=>{
       return new RegExp(f)
   })
   let processFetcher = null
   if( process.platform === 'win32'){
       processFetcher = spawn('wmic.exe', ['PROCESS','GET',_.join(winItems)])
   }else{
       processFetcher = spawn('ps', ['-A','-o',_.join(linuxPFields)])
   }
   es.connect(
       processFetcher.stdout,
       es.split(),
       es.map((line,cb)=>{
           if( line === null || line === '' ){
               return cb()
           }
           const cols = line.trim().split(/\s+/)
           if( headers === null ){
               headers = cols.map(headerConvert)
               return cb()
           }
           if( cols.length < headers.length ){
               return cb()
           }
           const row = {}
           const indices = headers.slice()
           //console.log( indices )
           while( indices.length ){
               row[ indices.pop() ] = indices.length?cols.pop():_.join(cols, " ")
           }
           //console.log( JSON.stringify(row) )
           let isMatch = true
           _.keys(regFilter).forEach((k)=>{
               if(k in  row){
                   if( !(row[k].match(regFilter[k])) ){
                       isMatch = false
                   }
               }
           })
           if( isMatch ){
            return cb(null, row)
           }else{
            return cb() 
           }
       }),
       es.writeArray((err, procs)=>{
           pcallback(null, procs)
       })
   ).on('error', pcallback)
}

module.exports = {
    queryp
}

