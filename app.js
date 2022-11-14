const options = document.querySelector(".options")
const track_controls = document.querySelector(".track-controls")
const track_holder = document.querySelector(".track-holder")

const manifest_option = document.querySelector(".manifest-option")
const manifest_containers = document.querySelector(".manifest-containers")
const manifest_track_controls = document.querySelector(".manifest-track-controls")

const ctr_wrapper = document.querySelector(".ctr-wrapper")
const fl_wrapper = document.querySelector(".fl-wrapper")

const body = document.body

function randint(min,max) {
    return Math.floor(Math.random() * (max - min)) + min 
}

const internet_status = (() => {
    // still nothing here
    // i should place this at initializer
})()

const manifest_option_state = (() => {
    let state = true
    return () => {
        if(state) {
            manifest_option.textContent = "X"
            options.style.animation = "manifest-option-out .5s forwards"
            manifest_containers.style.display = "flex"
            manifest_track_controls.style.display = "flex"
    
            state = false
        }
        else {
            manifest_option.textContent = "☰"
            options.style.animation = "manifest-option-in .5s forwards"
            manifest_containers.style.display = "none"
            manifest_track_controls.style.display = "none"
    
            state = true
        }
    }
})()

const manifest_containers_state = (() => {
    let state = true
    return () => {
        if(state) {
            ctr_wrapper.style.display = "none"
            fl_wrapper.style.display = "block"

            state = false
        }
        else {
            ctr_wrapper.style.display = "block"
            fl_wrapper.style.display = "none"
            
            state = true
        }
    }
})()

const manifest_track_controls_state = (() => {
    let state = true

    return () => {
        if(state){
            track_holder.style.display = "none"
            track_controls.style.display = "block"

            state = false
        }
        else {
            track_holder.style.display = "block"
            track_controls.style.display = "none"

            state = true
        }
    }
})()

var initializer = (function() {
    const collection = []
    const holder = []

    let recent_name = undefined
    let recent_path = undefined

    const search = document.querySelector(".search")
    search.addEventListener("keyup",(e) => {
        const ctr_previews = document.querySelectorAll(".ctr-preview")
        const fl_icons = document.querySelectorAll(".fl-icon")

        ctr_previews.forEach((ctr_preview,index) => {
            const ctr_preview_src = ctr_preview.src

            if(ctr_preview_src.split("/")[ctr_preview_src.split("/").length - 1].trim().toLowerCase().includes(e.target.value.trim().toLowerCase())) {
                ctr_preview.parentElement.style.display = "flex"
            }
            else {
                ctr_preview.parentElement.style.display = "none"
            }
        })
        fl_icons.forEach((fl_icon,index) => {
            const fl_icon_src = fl_icon.src

            if(fl_icon_src.split("/")[fl_icon_src.split("/").length - 1].trim().toLowerCase().includes(e.target.value.trim().toLowerCase())) {
                fl_icon.parentElement.parentElement.style.display = "flex"
            }
            else {
                fl_icon.parentElement.parentElement.style.display = "none"
            }
        })
    })

    const create_controls = (next,prev,label_name,fun_name) => {

        const track_controls_btn = document.createElement("div")
        track_controls_btn.setAttribute("class","track-controls-btn")

        const track_controls_btn_label = document.createElement("div")
        track_controls_btn_label.setAttribute("class","track-controls-btn-label")
        track_controls_btn_label.textContent = `${fun_name()} : ${label_name()}`

        const track_controls_btn_prev = document.createElement("div")
        track_controls_btn_prev.setAttribute("class","track-controls-btn-prev")
        track_controls_btn_prev.textContent = "<|"

        const track_controls_btn_next = document.createElement("div")
        track_controls_btn_next.setAttribute("class","track-controls-btn-next")
        track_controls_btn_next.textContent = "|>"
        
        track_controls_btn_prev.addEventListener("click",() => {
            prev()
            track_controls_btn_label.textContent = `${fun_name()} : ${label_name()}`
        })
        track_controls_btn_next.addEventListener("click",() => {
            next()
            track_controls_btn_label.textContent = `${fun_name()} : ${label_name()}`
        })

        track_controls.appendChild(track_controls_btn)
        track_controls_btn.appendChild(track_controls_btn_label)
        track_controls_btn.appendChild(track_controls_btn_prev)
        track_controls_btn.appendChild(track_controls_btn_next)

    }

    const track_mode = (() => {
        let name = "mode"
        let status = 0
        let options = ["default","random","reverse","repeat"]

        const shifter = () => {
            const random = randint(0,holder.length)

            if(source_collection.audio().ended && holder.length > 0 && status == 0) {
                source_collection.play(holder[0][0],holder[0][1])
                holder.shift()
                track_holder.children[0].remove()
            }
            else if(source_collection.audio().ended && holder.length > 0 && status == 1){
                source_collection.play(holder[random][0],holder[random][1])
                holder.splice(random,1)
                track_holder.children[random].remove()
            }
            else if(source_collection.audio().ended && holder.length > 0 && status == 2){
                source_collection.play(holder[holder.length - 1][0],holder[holder.length - 1][1])
                holder.splice(holder.length - 1,1)
                track_holder.children[holder.length].remove()
            }
            if(source_collection.audio().ended && holder.length >= 0 && status == 3) {
                source_collection.play(recent_path,recent_name)
            }
        }

        const next = () => {
            if(status > options.length - 2) return
            status += 1
        }
        const prev = () => {
            if(status < 1) return
            status -= 1
        }
        const label_name = () => {
            return options[status]
        }
        const fun_name = () => {
            return name
        }

        const controls = create_controls(next,prev,label_name,fun_name)

        return shifter

    })()
    
    const idle_mode = (() => {
        let name = "idle"
        let status = 0
        let options = ["none","default","random","reverse","repeat"]

        const shifter = () => {
            const random = randint(0,collection.length)

            const recent_source = collection.findIndex((c) => {
                return c[0] == recent_path && c[1] == recent_name
            })

            if(source_collection.audio().ended && holder.length == 0 && status == 1) {
                source_collection.play(collection[recent_source + 1][0],collection[recent_source + 1][1])
            }
            else if(source_collection.audio().ended && holder.length == 0 && status == 2){
                source_collection.play(collection[random][0],collection[random][1])
            }
            else if(source_collection.audio().ended && holder.length == 0 && status == 3){
                source_collection.play(collection[recent_source - 1][0],collection[recent_source - 1][1])
            }
            else if(source_collection.audio().ended && holder.length == 0 && status == 4) {
                source_collection.play(recent_path,recent_name)
            }
        }

        const next = () => {
            if(status > options.length - 2) return
            status += 1
        }
        const prev = () => {
            if(status < 1) return
            status -= 1
        }
        const label_name = () => {
            return options[status]
        }
        const fun_name = () => {
            return name
        }

        const controls = create_controls(next,prev,label_name,fun_name)

        return shifter

    })()

    setInterval(() => {
        // shifter(holder[0][0],holder[0][1])
        track_mode()
        idle_mode()
    }, 1000)

    return {
        recent_init(path,name) {
            recent_path = path
            recent_name = name
        },
        recent_name() {
            return recent_name
        },
        recent_source() {
            return [recent_path,recent_name]
        },
        collection_init(path,name) {
            for(c of collection){
                if(c[0] == path && c[1] == name) {
                    return
                }
            }
            collection.push([path,name])
        },
        get_collection() {
            return collection
        },
        holder_init(path,name) {
            holder.push([path,name])
        },
        get_holder() {
            return holder
        },
        track_mode() {
            return {
                next() {
                    track_mode.next()
                },
                prev() {
                    track_mode.prev()
                }
            }
        }
    }
})()

var source_collection = (function() {
    const audio = new Audio()
    const audio_player = document.querySelector(".audio-player")
    const audio_player_icon = document.querySelector(".audio-player-icon")
    const audio_player_title = document.querySelector(".audio-player-title")
    const title = document.querySelector(".title")
    const audio_player_play = document.querySelector(".audio-player-play")
    
    const media = document.querySelector(".media")

    let state = false

    const audio_state = () => {
        if(state){
            audio_play_state()
        }
        else {
            audio_pause_state()
        }
    }
    const audio_play_state = async () => {
        audio_player_play.textContent = "| |"
        await audio.play()
        await media.play()

        state = false
    }
    const audio_pause_state = () => {
        audio_player_play.textContent = ">"
        audio.pause()
        media.pause()

        state = true
    }

    audio_player_play.addEventListener("click",audio_state)

    return {
        audio() {
            return audio
        },
        goAt(seconds) {
            audio.currentTime = seconds
            media.currentTime = seconds
        },
        async play(path,name) {
            if(name == initializer.recent_name() && !audio.paused) return
            else if(name == initializer.recent_name() && !audio.paused){
                audio_play_state()
            }
            else {
                audio_play_state()

                initializer.recent_init(path,name)
                manifest_recent_tracks.only(path,name)
                audio.src = `${path}/${name}`
                media.src = `${path}/${name}`

                await audio.play()
                await media.play()
                media.muted = true

                title.textContent = `${name}`
                audio_player_icon.src = `${path}/${name}`
                await audio_player_icon.play()
                audio_player_icon.muted = true
                setTimeout(() => {
                    audio_player_icon.currentTime = 10
                    audio_player_icon.pause()
                }, 200)
            }
        }
    }
})()

var track_collection = (function() {

    let icon_timestamp = 10

    return {
        only(path,name) {
            initializer.holder_init(path,name)

            const track = document.createElement("div")
            track.setAttribute("class","track")

            const track_icon = document.createElement("video")
            track_icon.setAttribute("class","track-icon")
            track_icon.setAttribute("poster","school_girl.png")
            track_icon.currentTime = icon_timestamp

            const track_set = document.createElement("div")
            track_set.setAttribute("class","track-set")

            const track_title = document.createElement("div")
            track_title.setAttribute("class","track-title")
            track_title.textContent = name

            track.appendChild(track_icon)
            track.appendChild(track_set)
            track_set.appendChild(track_title)
            track_holder.appendChild(track)

            const track_icon_observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if(!entry.isIntersecting){
                        entry.target.preload = "none"
                    }
                    else if(entry.isIntersecting){
                        entry.target.preload = "auto"
                        track_icon.currentTime = icon_timestamp
                    }
                    entry.target.src = `${path}/${name}`
                })
            })
            track_icon_observer.observe(track_icon)
        }
    }
})()

function add_banner(file_path,obj_pos_x,obj_pos_y) {
    const banner = document.createElement("div")
    banner.setAttribute("class","banner")

    const banner_list = document.createElement("img")
    banner_list.setAttribute("class","banner-list")
    banner_list.src = file_path.toString()
    if((parseFloat(obj_pos_x) && parseFloat(obj_pos_y))){
        const multiplier = 100
        banner_list.style.objectPosition = `${parseFloat(obj_pos_x * multiplier)}% ${parseFloat(obj_pos_y * multiplier)}% `
    }
    
    banner.appendChild(banner_list)

    ctr_wrapper.appendChild(banner)
}
function add_ctr_header(value) {
    const ctr_header = document.createElement("div")
    ctr_header.setAttribute("class","ctr-header")
    ctr_header.textContent = value

    ctr_wrapper.appendChild(ctr_header)
}
function add_filler() {
    const filler = document.createElement("div")
    filler.setAttribute("class","filler")

    ctr_wrapper.appendChild(filler)
}

function create_collection() {
    let preview_timestamp = 10
    let preview_min_volume = .6
    let add_track_icon = "+"

    const ctr_collection = document.createElement("div")
    ctr_collection.setAttribute("class","ctr-collection")

    ctr_wrapper.appendChild(ctr_collection)

    return {
        only(path,name) {
            initializer.collection_init(path,name)

            const ctr_group = document.createElement("div")
            ctr_group.setAttribute("class","ctr-group")

            const ctr_preview = document.createElement("video")
            ctr_preview.setAttribute("class","ctr-preview")
            ctr_preview.setAttribute("poster","school_girl.png")
            ctr_preview.currentTime = preview_timestamp
            ctr_preview.volume = preview_min_volume

            const add_track = document.createElement("div")
            add_track.setAttribute("class","add-track")
            add_track.textContent = add_track_icon

            const ctr_group_observer = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    entry.target.classList.toggle("manifest-ctr-group",entry.isIntersecting)
                })
            })
            ctr_group_observer.observe(ctr_group)

            const ctr_preview_observer = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if(!entry.isIntersecting){
                        entry.target.preload = "none"
                    }
                    else {
                        entry.target.preload = "auto"
                        entry.target.currentTime = preview_timestamp
                    }
                    entry.target.src = `${path}/${name}`
                })
            })

            ctr_preview.addEventListener("click",() => {
                // add ready state here instead of public ready state
                source_collection.play(path,name)
            })
            ctr_group.addEventListener("pointerover",async () => {
                ctr_group.style.boxShadow = "4px 4px 4px rgb(180, 184, 227), -4px -4px 4px rgb(180, 184, 227),4px -4px 4px rgb(180, 184, 227),-4px 4px 4px rgb(180, 184, 227)"
                ctr_group.style.transform = "scale(1.2)"

                await ctr_preview.play()
            })
            add_track.addEventListener("click",() => {
                track_collection.only(path,name)
            })

            ctr_group.addEventListener("pointerleave",() => {
                ctr_group.style.boxShadow = ""
                ctr_group.style.transform = ""

                ctr_preview.pause()
                ctr_preview.currentTime = preview_timestamp
            })

            ctr_preview_observer.observe(ctr_preview)

            ctr_group.appendChild(ctr_preview)
            ctr_group.appendChild(add_track)

            ctr_collection.appendChild(ctr_group)

            // fl

            const fl_group = document.createElement("div")
            fl_group.setAttribute("class","fl-group")

            const fl_icon_frame = document.createElement("div")
            fl_icon_frame.setAttribute("class","fl-icon-frame")

            const fl_option = document.createElement("div")
            fl_option.setAttribute("class","fl-option")
            fl_option.textContent = "|>"

            const fl_icon = document.createElement("video")
            fl_icon.setAttribute("class","fl-icon")
            fl_icon.setAttribute("poster","school_girl.png")
            fl_icon.currentTime = preview_timestamp

            const fl_title = document.createElement("div")
            fl_title.setAttribute("class","fl-title")
            fl_title.textContent = name


            fl_option.addEventListener("click",() => {
                // add ready state here instead of public ready state
                source_collection.play(path,name)
            })
            fl_icon_frame.addEventListener("click",() => {
                track_collection.only(path,name)
            })

            const fl_icon_observer = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if(!entry.isIntersecting){
                        entry.target.preload = "none"
                    }
                    else {
                        entry.target.preload = "auto"
                        fl_icon.currentTime = preview_timestamp
                    }
                    entry.target.src = `${path}/${name}`
                })
            })

            fl_icon_observer.observe(fl_icon)

            fl_icon_frame.appendChild(fl_icon)
            fl_group.appendChild(fl_icon_frame)
            fl_group.appendChild(fl_title)
            fl_group.appendChild(fl_option)

            fl_wrapper.appendChild(fl_group)
        },
        many(path,names) {
            names.forEach((name,index) => {
                initializer.collection_init(path,name)
    
                const ctr_group = document.createElement("div")
                ctr_group.setAttribute("class","ctr-group")
    
                const ctr_preview = document.createElement("video")
                ctr_preview.setAttribute("class","ctr-preview")
                ctr_preview.setAttribute("poster","school_girl.png")
                ctr_preview.currentTime = preview_timestamp
                ctr_preview.volume = preview_min_volume
    
                const add_track = document.createElement("div")
                add_track.setAttribute("class","add-track")
                add_track.textContent = add_track_icon
    
                const ctr_group_observer = new IntersectionObserver(entries => {
                    entries.forEach(entry => {
                        entry.target.classList.toggle("manifest-ctr-group",entry.isIntersecting)
                    })
                })
                ctr_group_observer.observe(ctr_group)
    
                const ctr_preview_observer = new IntersectionObserver(entries => {
                    entries.forEach(entry => {
                        if(!entry.isIntersecting){
                            entry.target.preload = "none"
                        }
                        else {
                            entry.target.preload = "auto"
                            entry.target.currentTime = preview_timestamp
                        }
                        entry.target.src = `${path}/${name}`
                    })
                })
    
                ctr_preview.addEventListener("click",() => {
                    // add ready state here instead of public ready state
                    source_collection.play(path,name)
                })
                ctr_group.addEventListener("pointerover",async () => {
                    ctr_group.style.boxShadow = "4px 4px 4px rgb(180, 184, 227), -4px -4px 4px rgb(180, 184, 227),4px -4px 4px rgb(180, 184, 227),-4px 4px 4px rgb(180, 184, 227)"
                    ctr_group.style.transform = "scale(1.2)"
    
                    await ctr_preview.play()
                })
                add_track.addEventListener("click",() => {
                    track_collection.only(path,name)
                })
    
                ctr_group.addEventListener("pointerleave",() => {
                    ctr_group.style.boxShadow = ""
                    ctr_group.style.transform = ""
    
                    ctr_preview.pause()
                    ctr_preview.currentTime = preview_timestamp
                })
    
                ctr_preview_observer.observe(ctr_preview)
    
                ctr_group.appendChild(ctr_preview)
                ctr_group.appendChild(add_track)
    
                ctr_collection.appendChild(ctr_group)
    
                // fl
    
                const fl_group = document.createElement("div")
                fl_group.setAttribute("class","fl-group")
    
                const fl_icon_frame = document.createElement("div")
                fl_icon_frame.setAttribute("class","fl-icon-frame")
    
                const fl_option = document.createElement("div")
                fl_option.setAttribute("class","fl-option")
                fl_option.textContent = "|>"
    
                const fl_icon = document.createElement("video")
                fl_icon.setAttribute("class","fl-icon")
                fl_icon.setAttribute("poster","school_girl.png")
                fl_icon.currentTime = preview_timestamp
    
                const fl_title = document.createElement("div")
                fl_title.setAttribute("class","fl-title")
                fl_title.textContent = name
    
    
                fl_option.addEventListener("click",() => {
                    // add ready state here instead of public ready state
                    source_collection.play(path,name)
                })
                fl_icon_frame.addEventListener("click",() => {
                    track_collection.only(path,name)
                })
    
                const fl_icon_observer = new IntersectionObserver(entries => {
                    entries.forEach(entry => {
                        if(!entry.isIntersecting){
                            entry.target.preload = "none"
                        }
                        else {
                            entry.target.preload = "auto"
                            fl_icon.currentTime = preview_timestamp
                        }
                        entry.target.src = `${path}/${name}`
                    })
                })
    
                fl_icon_observer.observe(fl_icon)
    
                fl_icon_frame.appendChild(fl_icon)
                fl_group.appendChild(fl_icon_frame)
                fl_group.appendChild(fl_title)
                fl_group.appendChild(fl_option)
    
                fl_wrapper.appendChild(fl_group)
            })
        },
        remove_only() {

        },
        remove_many() {

        }
    }
}

manifest_option.addEventListener("click",manifest_option_state)
manifest_containers.addEventListener("click",manifest_containers_state)
manifest_track_controls.addEventListener("click",manifest_track_controls_state)

add_banner("./banner/628286.webp")
add_filler()

const manifest_recent_tracks = (() => {
    let holder_range = 10
    const holder = []
    const fetch_recent_tracks = JSON.parse(localStorage.getItem("recent_tracks"))

    if(fetch_recent_tracks){
        // the arrays from fetch_recent_tracks was implemeted/push into holder array 
        for(f of fetch_recent_tracks){
            holder.push(f)
        }
        add_ctr_header("recent_tracks")
        const collection = create_collection()
        for(h of holder){
            collection.only(h[0],h[1])
        }
    }

    return {
        only(path,name) {
            if(!(path && name)) return

            holder.forEach((h,i) => {
                if(h[0] == path && h[1] == name){
                    holder.splice(i,1)
                }
            })
            holder.splice(0,0,[path,name])

            if(holder.length > holder_range) holder.splice(holder_range,holder.length - holder_range)
            localStorage.setItem("recent_tracks",JSON.stringify(holder))
            
        },
        range(value) {
            holder_range = value
        }
    }
})()

add_ctr_header("KawaiiNeko Collection")
const neon = create_collection()

neon.many("https://rcph-smz.github.io/rcph_player_src/KawaiiNeko",[
    "Achillea - アキレア.mp3",
"Aice room (Nor) - DREAMY PLANET (featYUCe).mp3",
"Android52 - Wrapped Up Remix.mp3",
"Ashidoran - 明日の夢 (feat 初音ミク).mp3",
"Author Wind & Kunaru - Run It Back.mp3",
"Asterism❖.mp3",
"Author wind - After school.mp3",
"awfuless - Broken Heart (w Riya).mp3",
"Author wind - Closer to you.mp3",
"awfuless - Redemption.mp3",
"ayiko - Teichopsia (ft Shoko).mp3",
"Bad Computer & Danyka Nadeau - Chasing Clouds.mp3",
"banvox - Let Me Take You [Official Music Video].mp3",
"banvox - Summer [Official Music Video].mp3",
"banvox - Watch Me (Audio) [Google Android TV Commercial Music].mp3",
"Best Friend.mp3",
"Broken Light (feat mami).mp3",
"Bolide - Flower Petals.mp3",
"Brandon Liew - DREAMERS (feat TOFIE).mp3",
"Citrus OP「Azalea」By nanoRIPE Lyrics.mp3",
"Day by Day (feat Nicole Curry).mp3",
"Digitalized Landmark.mp3",
"DoctorNoSense - Safe to Say (Official Audio).mp3",
"dooks & nabil! - AH!.mp3",
"emon - Dreamin Chuchu (Plexi Edit).mp3",
"Endless (feat Mameyudoufu).mp3",
"Eruker - Back To You.mp3",
"f(x) - 4 Walls (Zekk Remix).mp3",
"Friend.mp3",
"Future Cider.mp3",
"Future Cαke.mp3",
"Future Cαndy.mp3",
"Geoxor - Kill Aura.mp3",
"Giga & KIRA - GETCHA! ft初音ミク & GUMI【MV】.mp3",
"glance - Epic Score (w nabil! & noguchii).mp3",
"Gloomy Flash (feat mami).mp3",
"Gloomy Flash (Hyper Speed Garage Mix).mp3",
"greyl - Trendy.mp3",
"Hiromi - One Love Feat Simon.mp3",
"HoneyComeBear - See You - またね.mp3",
"HoneyComeBear - Dear.mp3",
"HoneyComeBear - Sneaker.mp3",
"HoneyComeBear - レイニーガール (Official Audio).mp3",
"I'm falling in love with my teacher yuki.mp3",
"I'm falling in love with my teacher sekai.mp3",
"icesawder - Stardom.mp3",
"greyl - MYC.mp3",
"Just Love (feat PSYQUI).mp3",
"Kamaboko - Colorful.mp3",
"Juwubi - Im Okay.mp3",
"just saying, the body is honest yuki.mp3",
"kamome sano - Lovesick (feat ぷにぷに電機).mp3",
"Katomori - Makuramoto ni Ghost Remix.mp3",
"KONPEKI ftカミるれ - ETERNAL HERO.mp3",
"Koro  Candle - Worry About Me.mp3",
"Kara & unhappycore - To The Core.mp3",
"Koro  Kunaru - Then Do It (Purukichi Remix).mp3",
"KOTONOHOUSE - PRESS START!.mp3",
"KOTONOHOUSE - Pitter  Patter (ftTOFUKU).mp3",
"Kunaru & Kachi - One More Time Cute Thumbnail.mp3",
"Kunaru & MG5902 - Hurt You.mp3",
"Kunaru & Kachi - One More Time.mp3",
"Kunaru & Toy Mecha - Toy & Candy.mp3",
"Kuro - Aiming For That Sky Where The Meteor Shower Flows  From【ハピコア流星群】.mp3",
"lapix - Day by day (PSYQUI Remix).mp3",
"lapix - blue love (ft YUC’e) (PSYQUI Remix).mp3",
"Kanojo Wa Tabi Ni Deru.mp3",
"Madeon - All My Friends (Kagi Remix).mp3",
"Mameyudoufu - Endless Cider (ft SUCH) J-Pop Future Core.mp3",
"masara - Tegami (ft yutsuki & Hikaru Station).mp3",
"Mameyudoufu - Midnight Grow (ft Mami)  Jpop Future Core.mp3",
"Malt & Aiyru - Cosmos.mp3",
"Mihka! X Kyoto Black – Kodokushi (孤独死).mp3",
"Miruku - Bend It Over.mp3",
"Mint Comet - Nor + YUCe (visualizer).mp3",
"Moe Shop - Crush [Pure Pure EP].mp3",
"Moe Shop - Baby Pink (w YUCe).mp3",
"Moe Shop - GHOST FOOD (feat TORIENA).mp3",
"Mirror.mp3",
"Moe Shop - Notice (w TORIENA).mp3",
"Moe Shop - the new non non biyori disco groove.mp3",
"Moe Shop - WONDER POP.mp3",
"Moe Shop - The New Non Non Biyori Disco Groove (Extended).mp3",
"Moe Shop - WWW (feat EDOGA-SULLIVAN).mp3",
"Moe Shop - You Look So Good [Pure Pure EP].mp3",
"MOMO SYRUP.mp3",
"MojiX! x Elkuu - Minamo.mp3",
"nanoRIPE  アザレア - Music Video.mp3",
"Omoshiroebi - Sakura Saku Remix (orig Yunomi).mp3",
"Orange Rocket.mp3",
"Nightcore - No Friends (Lyrics).mp3",
"OYASUMI in my dream (Original Mix).mp3",
"Oreo Bros (feat 妃苺) - Sweet Sweet Magic.mp3",
"poplavor - Broken Light (feat mami).mp3",
"Moe Shop - Want You.mp3",
"PSYQUI & Houou Karin - Shining Lights  Speed Garage.mp3",
"PSYQUI - Are You Kidding Me (ft Mami)  Jpop Future Core.mp3",
"PRout - Galanthus.mp3",
"PSYQUI - Beautiful Future.mp3",
"PSYQUI - Chatroom  Jpop Future Core.mp3",
"PSYQUI - DJ Noriken - スターゲイザ (ft YUCe)  PSYQUI Remix.mp3",
"PSYQUI - Dont You Want Me (ft SUCH)  Jpop Kawaii Future Bass 2019.mp3",
"Psyqui - Deep Blue.mp3",
"PSYQUI - Dont You Want Me (ft Such) Mameyudoufu Remix.mp3",
"PSYQUI - Education  Future Core 2019.mp3",
"PSYQUI - Education.mp3",
"PSYQUI - dont you want me ft Such.mp3",
"PSYQUI - Endless (Mameyudoufu Remix).mp3",
"PSYQUI - Fly To The Moon (ft 中村さんそ)  J-Pop.mp3",
"PSYQUI - Funk Assembly  J-Pop Funk.mp3",
"PSYQUI - Fly to the moon feat 中村さんそ.mp3",
"PSYQUI - Hype (Lapix Remix) ft Such  Jcore Future Core.mp3",
"PSYQUI - Hype feat Such.mp3",
"PSYQUI - Hype (ft SUCH)  Jpop Kawaii J-Core 2019.mp3",
"PSYQUI - Love & Roll (ft SUCH) Speed Garage J-Pop.mp3",
"PSYQUI - Mend Your Ways (ft SUCH)  Jpop Kawaii Future Bass 2019.mp3",
"POISON.mp3",
"PSYQUI - Luv U 4ll ♡ver.mp3",
"PSYQUI - No One  Future Core.mp3",
"PSYQUI - No One.mp3",
"PSYQUI - Nervousness.mp3",
"PSYQUI - Multitalents.mp3",
"PSYQUI - Pallet feat mikanzil.mp3",
"PSYQUI - Rainbow Dream (ft Mo∀)  Future Core.mp3",
"PSYQUI - Raise Your Hands (ft Such)  Future Core.mp3",
"PSYQUI - Still in my heart feat ぷにぷに電機.mp3",
"PSYQUI - Up n Up  Future Core.mp3",
"PSYQUI - Secret Dance Hall (ft SUCH)  J-pop 2019.mp3",
"PSYQUI - Your voice So M-Project Remix.mp3",
"PSYQUI - Vital Error (Beat)  Future Core 2019.mp3",
"PSYQUI - Your Voice So Zekk Full Spec Remix (Ft SUCH)  Future Core.mp3",
"PSYQUI - センチメンタルハートボーイ(ft Such)  J-Pop Future Core.mp3",
"PSYQUI - ヒカリの方へ (ft SUCH) Awakening  Future Core.mp3",
"PSYQUI - OYASUMI in my dream.mp3",
"PSYQUI - ヒカリの方へ (ft SUCH)  Jpop.mp3",
"PSYQUI - ヒステリックナイトガール (Awakening) (ft SUCH)  J-Pop.mp3",
"PSYQUI - 就寝御礼 (Singed By Psyqui Himself!)  J-Pop.mp3",
"PSYQUI - ヒカリの方へ - Lapix & Cranky Remix (ft Such)  Future Core.mp3",
"PSYQUI feat Marpril - Girly Cupid.mp3",
"PSYQUI - ヒステリックナイトガール feat Such (android52 Edit).mp3",
"PSYQUI ft Such - LOVE&ROLL.mp3",
"Purukichi - LOOP  (Feat セトナツメ).mp3",
"Purukichi - Mysterious feat pinana.mp3",
"PUMP.mp3",
"PSYQUI featSuch - C & B.mp3",
"Ruxxi - I Mean I Love You VIP (w Malcha).mp3",
"Signal (feat Such).mp3",
"Smore.mp3",
"Sakumellia.mp3",
"Snails House - Chiffon.mp3",
"Snails House - I secretly love u.mp3",
"Snails House × Moe Shop - Pastel.mp3",
"Snails House - Subspace Drive.mp3",
"snooze  wotaku feat SHIKI.mp3",
"Snails House - Twinklestar (Official MV).mp3",
"snooze  wotaku feat 初音ミク(Hatsune Miku).mp3",
"Sober Bear - カラーズぱわーにおまかせろ！[Mitsuboshi Colors Remix].mp3",
"SPY x FAMILY - Ending Full「Comedy」by Gen Hoshino (LyricsSubtitles).mp3",
"Still in my heart (feat ぷにぷに電機).mp3",
"tekalu - Letter feat おんた.mp3",
"renew Memory.mp3",
"SpaceJellyfish - クラゲ.mp3",
"ToYou トーヨー 東洋 - ENERGY DRINK.mp3",
"WISE - I Loved You Feat Hiroko.mp3",
"Ujico  Snails House - Pixel Dream.mp3",
"Weight of the World壊レタ世界ノ歌.mp3",
"Yuarkin - Drive High.mp3",
"Your Voice So (M-Project Remix).mp3",
"YUCe x Snails House - Cosmic Air Ride.mp3",
"YUCe - Night Club Junkie.mp3",
"YUCe - Future Cαndy (Snails House Remix).mp3",
"YUCe 「Ghost Town」.mp3",
"Your voice so (feat such).mp3",
"YUCe 「Sunset Tea Cup」.mp3",
"YUCe 「macaron moon」.mp3",
"YUCe 「Cappuccino」.mp3",
"YUCe 「outro-duck-tion!!」.mp3",
"Yunomi (Feat 桃箱 & miko) - 走馬灯ラビリンス (Somato Labyrinth).mp3",
"Yunomi - Wakusei Rabbit (ft TORIENA).mp3",
"Yunomi (ft Happy Kuru Kuru) – はんぶんこ花火 (Jotori Remix).mp3",
"Zakku x Nakanojojo - Matcha Love (feat アリガトユイナ).mp3",
"Yunomi – ゆのみっくにお茶して (Hibiki Remix).mp3",
"YUCe 「ライフライン」.mp3",
"[Breakcore] remember.mp3",
"Zekk - City Lights (Remix).mp3",
"[Future Garage] f(x) - 4 Walls (Zekk Remix).mp3",
"「Footwork」[PSYQUI] Too Late.mp3",
"[MV] REOL - drop pop candy.mp3",
"「Future Core」[PRout] Tasogare.mp3",
"「Future Core」[PSYQUI feat Such] ヒカリの方へ (Awakening).mp3",
"【Citrus 柑橘味香氣】nanoRIPE _「アザレア」OP.mp3",
"【Kiichan】drop pop candy 歌ってみた【PVやってみた】.mp3",
"[Blue Archive] Theme 109.mp3",
"【Nightcore】↬ Learn To Meow (Switching Vocals  Lyrics).mp3",
"【ヒステリックナイトガール 】スーパーダンガンロンパ 2【手書き】Super Danganronpa 2【live2d動画】.mp3",
"うさこ  kotu - Blue Spring Groove [Anime Groove].mp3",
"【歌ってみた】春を告げる -  yama南條夢路（cover）.mp3",
"ぴ！pi - SkyHigh VIP.mp3",
"【Electronic】Voia - Almost Human (GonZealous Remix).mp3",
"もっとかわいい  才歌 feat可不.mp3",
"べに／可不.mp3",
"まさらPmasara - Love10 (ft Juunana & Ran).mp3",
"ヒカリの方へ (lapix & Cranky Remix) (feat Such).mp3",
"ココロフロート (feat nicamoq).mp3",
"ヒステリックナイトガール (Original Mix).mp3",
"ヒカリの方へ (Original Mix).mp3",
"合言葉 (feat picco).mp3",
"アイシテゲーモーバー.mp3",
"東京シュノーケル (feat nicamoq).mp3",
"帰り道.mp3",
"夢さんぽ.mp3",
"東雪蓮 - Just Love (featPSYQUI) [Dyako Remix].mp3",
"龍族幻想Dragon Raja OST - Music From My Room (10min).mp3",
"高尾大毅 - Dont be afraid.mp3",
"枕元にゴースト (feat nicamoq).mp3",
    ])

//function temporary

function skip() {
    source_collection.goAt(source_collection.audio().duration)
}