const body = document.body

function create_preference() {
    const preference = {
        "layouts" : {
            "ctr" : {
                "list" : [{
                    "type" : "banner" ,
                    "file_path" : "./currentpath/file.png" ,
                    "obj_pos_x" : "0.2" ,
                    "obj_pos_y" : ".5"
                },{
                    "type" : "filler"
                }]
            },
            "fl" : {
                "list" : []
            }
        },
        "playlists" : {
            "list" : ["playlist","play"]
        }
    }
    return preference
}

body.textContent = JSON.stringify(create_preference(),null,4)

console.log(JSON.stringify(create_preference(),null,4))
