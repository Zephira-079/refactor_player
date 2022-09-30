const readLine = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
})

const fs = require('fs')
let folderName = ''
function ReadLine() {
    return new Promise((resolved,rejected) => {
        readLine.question("folder_name : ",(res) => {
            folderName = res.toString()
            resolved()
            readLine.close()
        })
    })
}

async function readLineWait() {
    await ReadLine()
    fs.readdir(folderName, function(err,file){
        for(i of file){
            fs.appendFile('./fileListJs.txt','\"'+ i.trim() + '\",\n', function(err){

            })
        }
    })
}
readLineWait()