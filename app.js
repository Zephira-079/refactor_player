const options = document.querySelector(".options")
const track_controls = document.querySelector(".track-controls")
const track_holder = document.querySelector(".track-holder")

const manifest_option = document.querySelector(".manifest-option")
const manifest_containers = document.querySelector(".manifest-containers")
const manifest_track_controls = document.querySelector(".manifest-track-controls")

const ctr_wrapper = document.querySelector(".ctr-wrapper")
const fl_wrapper = document.querySelector(".fl-wrapper")

const body = document.body

async function fetch_tracks(link) {
    const f = await fetch(link)
    const get_json = await f.json()
    return get_json
}

function loadScript(url, callback) {
    const script = document.createElement("script")
    script.type = "text/javascript"
    script.src = url
    script.onload = function () {
        callback()
    }
    document.head.appendChild(script)
}
function sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}
function randint(min, max) {
    return Math.floor(Math.random() * (max - min)) + min
}

const internet_status = (() => {
    // still nothing here
    // i should place this at initializer
})()

const manifest_option_state = (() => {
    let state = true
    return () => {
        if (state) {
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
        if (state) {
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
        if (state) {
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

var initializer = (function () {
    const collection = []
    const holder = []

    let recent_name = undefined
    let recent_path = undefined

    const search = document.querySelector(".search")
    search.addEventListener("keyup", (e) => {
        const ctr_previews = document.querySelectorAll(".ctr-preview")
        const fl_icons = document.querySelectorAll(".fl-icon")

        ctr_previews.forEach((ctr_preview, index) => {
            const ctr_preview_src = encodeURI(ctr_preview.src)

            if (ctr_preview_src.split("/")[ctr_preview_src.split("/").length - 1].trim().toLowerCase().includes(e.target.value.trim().toLowerCase())) {
                ctr_preview.parentElement.style.display = "flex"
            }
            else {
                ctr_preview.parentElement.style.display = "none"
            }
        })
        fl_icons.forEach((fl_icon, index) => {
            const fl_icon_src = encodeURI(fl_icon.src)

            if (fl_icon_src.split("/")[fl_icon_src.split("/").length - 1].trim().toLowerCase().includes(e.target.value.trim().toLowerCase())) {
                fl_icon.parentElement.parentElement.style.display = "flex"
            }
            else {
                fl_icon.parentElement.parentElement.style.display = "none"
            }
        })
    })

    const create_controls = (next, prev, label_name, fun_name, update_time) => {

        const track_controls_btn = document.createElement("div")
        track_controls_btn.setAttribute("class", "track-controls-btn")

        const track_controls_btn_label = document.createElement("div")
        track_controls_btn_label.setAttribute("class", "track-controls-btn-label")
        track_controls_btn_label.textContent = `${fun_name()} : ${label_name()}`

        const track_controls_btn_prev = document.createElement("div")
        track_controls_btn_prev.setAttribute("class", "track-controls-btn-prev")
        track_controls_btn_prev.textContent = "<|"

        const track_controls_btn_next = document.createElement("div")
        track_controls_btn_next.setAttribute("class", "track-controls-btn-next")
        track_controls_btn_next.textContent = "|>"

        track_controls_btn_prev.addEventListener("click", () => {
            prev()
            track_controls_btn_label.textContent = `${fun_name()} : ${label_name()}`
        })
        track_controls_btn_next.addEventListener("click", () => {
            next()
            track_controls_btn_label.textContent = `${fun_name()} : ${label_name()}`
        })

        track_controls.appendChild(track_controls_btn)
        track_controls_btn.appendChild(track_controls_btn_label)
        track_controls_btn.appendChild(track_controls_btn_prev)
        track_controls_btn.appendChild(track_controls_btn_next)
        //update_time parameter is a special parameter to modify label_name parameter every seconds xd
        if (update_time) {
            setInterval(() => {
                label_name = update_time
                track_controls_btn_label.textContent = `${fun_name()} : ${label_name()}`
            }, 1000)
        }

    }

    const track_mode = (() => {
        let name = "mode"
        let status = 0
        let options = ["default", "random", "reverse", "repeat"]

        const shifter = () => {
            const random = randint(0, holder.length)

            if (source_collection.audio().ended && holder.length > 0 && status == 0) {
                source_collection.play(holder[0][0], holder[0][1])
                holder.shift()
                track_holder.children[0].remove()
            }
            else if (source_collection.audio().ended && holder.length > 0 && status == 1) {
                source_collection.play(holder[random][0], holder[random][1])
                holder.splice(random, 1)
                track_holder.children[random].remove()
            }
            else if (source_collection.audio().ended && holder.length > 0 && status == 2) {
                source_collection.play(holder[holder.length - 1][0], holder[holder.length - 1][1])
                holder.splice(holder.length - 1, 1)
                track_holder.children[holder.length].remove()
            }
            if (source_collection.audio().ended && holder.length >= 0 && status == 3) {
                source_collection.play(recent_path, recent_name)
            }
        }

        const next = () => {
            if (status > options.length - 2) return
            status += 1
        }
        const prev = () => {
            if (status < 1) return
            status -= 1
        }
        const label_name = () => {
            return options[status]
        }
        const fun_name = () => {
            return name
        }

        const controls = create_controls(next, prev, label_name, fun_name)

        return shifter

    })()

    const idle_mode = (() => {
        let name = "idle"
        let status = 0
        let options = ["none", "default", "random", "reverse", "repeat"]

        const shifter = () => {
            const random = randint(0, collection.length)

            const recent_source = collection.findIndex((c) => {
                return c[0] == recent_path && c[1] == recent_name
            })

            if (source_collection.audio().ended && holder.length == 0 && status == 1) {
                source_collection.play(collection[recent_source + 1][0], collection[recent_source + 1][1])
            }
            else if (source_collection.audio().ended && holder.length == 0 && status == 2) {
                source_collection.play(collection[random][0], collection[random][1])
            }
            else if (source_collection.audio().ended && holder.length == 0 && status == 3) {
                source_collection.play(collection[recent_source - 1][0], collection[recent_source - 1][1])
            }
            else if (source_collection.audio().ended && holder.length == 0 && status == 4) {
                source_collection.play(recent_path, recent_name)
            }
        }

        const next = () => {
            if (status > options.length - 2) return
            status += 1
        }
        const prev = () => {
            if (status < 1) return
            status -= 1
        }
        const label_name = () => {
            return options[status]
        }
        const fun_name = () => {
            return name
        }

        const controls = create_controls(next, prev, label_name, fun_name)

        return shifter

    })()

    const volume = (() => {
        // todo fix these shitty code xd
        const next = () => {
            volume_manager.main(volume_manager.main() + .1)
        }
        const prev = () => {
            volume_manager.main(volume_manager.main() - .1)
        }
        const label_name = () => {
            //TODO the only code with try catch xd reason: the volume_manager isn't initialize yet :) so it would return error
            try {
                return `${volume_manager.main().toFixed(2) * 100}%`
            }
            catch {
                return `100%`
            }
        }
        const fun_name = () => {
            return "volume"
        }

        const controls = create_controls(next, prev, label_name, fun_name)

    })()

    const navigation = (() => {
        // todo fix these shitty code xd
        const next = () => {
            skip()
        }
        const prev = () => {
            source_collection.state()
        }

        const label_name = () => {
            return "skip"
        }
        const fun_name = () => {
            return "play/pause"
        }

        const controls = create_controls(next, prev, label_name, fun_name)

    })()

    const progression = (() => {
        // todo fix these shitty code xd

        const next = () => {
            source_collection.goAt(source_collection.audio().currentTime + 10)
        }
        const prev = () => {
            source_collection.goAt(source_collection.audio().currentTime - 10)
        }

        const label_name = () => {
            // specially these code
            try {
                return source_collection.audio().currentTime
            }
            catch {
                return 0
            }
        }
        const fun_name = () => {
            return "duration"
        }
        function update_time() {
            return label_name()
        }

        // todo fix this
        const controls = create_controls(next, prev, label_name, fun_name, update_time)
    })()

    setInterval(() => {
        // shifter(holder[0][0],holder[0][1])
        track_mode()
        idle_mode()
    }, 1000)

    return {
        recent_init(path, name) {
            recent_path = path
            recent_name = name
        },
        recent_name() {
            return recent_name
        },
        recent_source() {
            return [recent_path, recent_name]
        },
        collection_init(path, name) {
            for (c of collection) {
                if (c[0] == path && c[1] == name) {
                    return
                }
            }
            collection.push([path, name])
        },
        get_collection() {
            return collection
        },
        holder_init(path, name) {
            holder.push([path, name])
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

var source_collection = (function () {
    const audio = new Audio()
    const audio_player = document.querySelector(".audio-player")
    const audio_player_icon = document.querySelector(".audio-player-icon")
    const audio_player_title = document.querySelector(".audio-player-title")
    const title = document.querySelector(".title")
    const audio_player_play = document.querySelector(".audio-player-play")

    const media = document.querySelector(".media")

    let state = false

    const audio_state = () => {
        if (state) {
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

    audio_player_play.addEventListener("click", audio_state)

    return {
        audio() {
            return audio
        },
        goAt(seconds) {
            audio.currentTime = seconds
            media.currentTime = seconds
        },
        async play(path, name) {
            if (name == initializer.recent_name() && !audio.paused) return
            else if (name == initializer.recent_name() && !audio.paused) {
                audio_play_state()
            }
            else {
                audio_play_state()
                // todo temporary notif
                notif(name)

                initializer.recent_init(path, name)
                manifest_recent_tracks.only(path, name)
                audio.src = encodeURI(`${path}/${name}`)
                media.src = encodeURI(`${path}/${name}`)

                await audio.play()
                await media.play()
                media.muted = true

                title.textContent = `${name}`
                audio_player_icon.src = encodeURI(`${path}/${name}`)
                await audio_player_icon.play()
                audio_player_icon.muted = true
                setTimeout(() => {
                    audio_player_icon.currentTime = 10
                    audio_player_icon.pause()
                }, 200)
            }
        },
        async play_link(url) {
            audio_play_state()
            // todo temporary notif
            notif(url)

            audio.src = encodeURI(`$${url}`)
            media.src = encodeURI(`$${url}`)

            await audio.play()
            await media.play()
            media.muted = true

            title.textContent = `${url}`
            audio_player_icon.src = encodeURI(`${url}`)
            await audio_player_icon.play()
            audio_player_icon.muted = true
            setTimeout(() => {
                audio_player_icon.currentTime = 10
                audio_player_icon.pause()
            }, 200)

        },
        state() {
            // todo fix this thing
            audio_state()
        }
    }
})()

var track_collection = (function () {

    let icon_timestamp = 10

    return {
        only(path, name) {
            initializer.holder_init(path, name)

            const track = document.createElement("div")
            track.setAttribute("class", "track")

            const track_icon = document.createElement("video")
            track_icon.setAttribute("class", "track-icon")
            track_icon.setAttribute("poster", "school_girl.png")
            track_icon.currentTime = icon_timestamp

            const track_set = document.createElement("div")
            track_set.setAttribute("class", "track-set")

            const track_title = document.createElement("div")
            track_title.setAttribute("class", "track-title")
            track_title.textContent = name

            track.appendChild(track_icon)
            track.appendChild(track_set)
            track_set.appendChild(track_title)
            track_holder.appendChild(track)

            const track_icon_observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) {
                        entry.target.preload = "none"
                    }
                    else if (entry.isIntersecting) {
                        entry.target.preload = "auto"
                        track_icon.currentTime = icon_timestamp
                    }
                    entry.target.src = encodeURI(`${path}/${name}`)
                })
            })
            track_icon_observer.observe(track_icon)
        }
    }
})()

function add_banner(file_path, obj_pos_x, obj_pos_y) {
    const banner = document.createElement("div")
    banner.setAttribute("class", "banner")

    const banner_list = document.createElement("img")
    banner_list.setAttribute("class", "banner-list")
    banner_list.src = encodeURI(file_path.toString())
    if ((parseFloat(obj_pos_x) && parseFloat(obj_pos_y))) {
        const multiplier = 100
        banner_list.style.objectPosition = `${parseFloat(obj_pos_x * multiplier)}% ${parseFloat(obj_pos_y * multiplier)}% `
    }

    banner.appendChild(banner_list)

    ctr_wrapper.appendChild(banner)
}
function add_ctr_header(value) {
    const ctr_header = document.createElement("div")
    ctr_header.setAttribute("class", "ctr-header")
    ctr_header.setAttribute("contenteditable", "")
    ctr_header.setAttribute("spellchecker", "false")
    ctr_header.textContent = value

    ctr_wrapper.appendChild(ctr_header)
}
function add_filler() {
    const filler = document.createElement("div")
    filler.setAttribute("class", "filler")

    ctr_wrapper.appendChild(filler)
}

function create_collection() {
    let preview_timestamp = 10
    let add_track_icon = "+"

    const ctr_collection = document.createElement("div")
    ctr_collection.setAttribute("class", "ctr-collection")

    ctr_wrapper.appendChild(ctr_collection)

    return {
        only(path, name) {
            //todo fix again xd
            // damn fix this
            initializer.collection_init(path, name)

            const ctr_group = document.createElement("div")
            ctr_group.setAttribute("class", "ctr-group")

            const ctr_preview = document.createElement("video")
            ctr_preview.setAttribute("class", "ctr-preview")
            ctr_preview.setAttribute("poster", "school_girl.png")
            ctr_preview.currentTime = preview_timestamp
            ctr_preview.volume = volume_manager.ctr()
            ctr_preview.addEventListener("pointerover", (e) => {
                e.target.volume = volume_manager.ctr_hover_in()
            })
            ctr_preview.addEventListener("pointerleave", (e) => {
                volume_manager.ctr_hover_out()
            })

            const add_track = document.createElement("div")
            add_track.setAttribute("class", "add-track")
            add_track.textContent = add_track_icon

            const ctr_group_observer = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    entry.target.classList.toggle("manifest-ctr-group", entry.isIntersecting)
                })
            })
            ctr_group_observer.observe(ctr_group)

            const ctr_preview_observer = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) {
                        entry.target.preload = "none"
                    }
                    else {
                        entry.target.preload = "auto"
                        entry.target.currentTime = preview_timestamp
                    }
                    entry.target.src = encodeURI(`${path}/${name}`)
                })
            })

            ctr_preview.addEventListener("click", () => {
                // add ready state here instead of public ready state
                source_collection.play(path, name)
            })

            ctr_group.addEventListener("contextmenu", e => {
                e.preventDefault()
                context_menu.move(e, path, name)
            })

            ctr_group.addEventListener("pointerover", async () => {
                ctr_group.style.boxShadow = "4px 4px 4px rgb(180, 184, 227), -4px -4px 4px rgb(180, 184, 227),4px -4px 4px rgb(180, 184, 227),-4px 4px 4px rgb(180, 184, 227)"
                ctr_group.style.transform = "scale(1.2)"

                await ctr_preview.play()
            })
            add_track.addEventListener("click", () => {
                track_collection.only(path, name)
            })

            ctr_group.addEventListener("pointerleave", () => {
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
            fl_group.setAttribute("class", "fl-group")

            const fl_icon_frame = document.createElement("div")
            fl_icon_frame.setAttribute("class", "fl-icon-frame")

            const fl_option = document.createElement("div")
            fl_option.setAttribute("class", "fl-option")
            fl_option.textContent = "|>"

            const fl_icon = document.createElement("video")
            fl_icon.setAttribute("class", "fl-icon")
            fl_icon.setAttribute("poster", "school_girl.png")
            fl_icon.currentTime = preview_timestamp

            const fl_title = document.createElement("div")
            fl_title.setAttribute("class", "fl-title")
            fl_title.textContent = name


            fl_option.addEventListener("click", () => {
                // add ready state here instead of public ready state
                source_collection.play(path, name)
            })
            fl_icon_frame.addEventListener("click", () => {
                track_collection.only(path, name)
            })

            const fl_icon_observer = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) {
                        entry.target.preload = "none"
                    }
                    else {
                        entry.target.preload = "auto"
                        fl_icon.currentTime = preview_timestamp
                    }
                    entry.target.src = encodeURI(`${path}/${name}`)
                })
            })

            fl_icon_observer.observe(fl_icon)

            fl_icon_frame.appendChild(fl_icon)
            fl_group.appendChild(fl_icon_frame)
            fl_group.appendChild(fl_title)
            fl_group.appendChild(fl_option)

            fl_wrapper.appendChild(fl_group)
        },
        async many(path, names) {
            //todo fix again xd
            try {
                path = await path
                path = path.path

                names = await names
                names = names.list
            }
            catch {

            }
            names.forEach((name, index) => {
                initializer.collection_init(path, name)

                const ctr_group = document.createElement("div")
                ctr_group.setAttribute("class", "ctr-group")

                const ctr_preview = document.createElement("video")
                ctr_preview.setAttribute("class", "ctr-preview")
                ctr_preview.setAttribute("poster", "school_girl.png")
                ctr_preview.currentTime = preview_timestamp
                ctr_preview.volume = volume_manager.ctr()
                ctr_preview.addEventListener("pointerover", (e) => {
                    e.target.volume = volume_manager.ctr_hover_in()
                })
                ctr_preview.addEventListener("pointerleave", (e) => {
                    volume_manager.ctr_hover_out()
                })

                const add_track = document.createElement("div")
                add_track.setAttribute("class", "add-track")
                add_track.textContent = add_track_icon

                const ctr_group_observer = new IntersectionObserver(entries => {
                    entries.forEach(entry => {
                        entry.target.classList.toggle("manifest-ctr-group", entry.isIntersecting)
                    })
                })
                ctr_group_observer.observe(ctr_group)

                const ctr_preview_observer = new IntersectionObserver(entries => {
                    entries.forEach(entry => {
                        if (!entry.isIntersecting) {
                            entry.target.preload = "none"
                        }
                        else {
                            entry.target.preload = "auto"
                            entry.target.currentTime = preview_timestamp
                        }
                        entry.target.src = encodeURI(`${path}/${name}`)
                    })
                })

                ctr_preview.addEventListener("click", () => {
                    // add ready state here instead of public ready state
                    source_collection.play(path, name)
                })

                ctr_group.addEventListener("contextmenu", e => {
                    e.preventDefault()
                    context_menu.move(e, path, name)
                })

                ctr_group.addEventListener("pointerover", async () => {
                    ctr_group.style.boxShadow = "4px 4px 4px rgb(180, 184, 227), -4px -4px 4px rgb(180, 184, 227),4px -4px 4px rgb(180, 184, 227),-4px 4px 4px rgb(180, 184, 227)"
                    ctr_group.style.transform = "scale(1.2)"

                    await ctr_preview.play()
                })
                add_track.addEventListener("click", () => {
                    track_collection.only(path, name)
                })

                ctr_group.addEventListener("pointerleave", () => {
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
                fl_group.setAttribute("class", "fl-group")

                const fl_icon_frame = document.createElement("div")
                fl_icon_frame.setAttribute("class", "fl-icon-frame")

                const fl_option = document.createElement("div")
                fl_option.setAttribute("class", "fl-option")
                fl_option.textContent = "|>"

                const fl_icon = document.createElement("video")
                fl_icon.setAttribute("class", "fl-icon")
                fl_icon.setAttribute("poster", "school_girl.png")
                fl_icon.currentTime = preview_timestamp

                const fl_title = document.createElement("div")
                fl_title.setAttribute("class", "fl-title")
                fl_title.textContent = name


                fl_option.addEventListener("click", () => {
                    // add ready state here instead of public ready state
                    source_collection.play(path, name)
                })
                fl_icon_frame.addEventListener("click", () => {
                    track_collection.only(path, name)
                })

                const fl_icon_observer = new IntersectionObserver(entries => {
                    entries.forEach(entry => {
                        if (!entry.isIntersecting) {
                            entry.target.preload = "none"
                        }
                        else {
                            entry.target.preload = "auto"
                            fl_icon.currentTime = preview_timestamp
                        }
                        entry.target.src = encodeURI(`${path}/${name}`)
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

const urlparams = (() => {
    this.get_search = function () {
        const url = new URLSearchParams(window.location.search)

        return url
    }
    this.create_link = function (pathname) {
        const url = new URL(window.location.href.split("?")[0])
        url.searchParams.append("q", pathname)
        return url
    }

    const get_q = get_search().get("q")

    // todo remove this later 
    loadScript("cs_tab/app.js", function () {

        const path = decodeURI(get_q.slice(0, get_q.lastIndexOf("/")))
        const name = decodeURI(get_q.slice(get_q.lastIndexOf("/")).slice(1))

        if (get_q) {
            const q_tab = create_tab(`Play : ${name} \nBy clicking on this tab, Else Trust Issue "UwUntu ૮ ˶ᵔ ᵕ ᵔ˶ ა"`).element()
            q_tab.addEventListener("click", () => {
                source_collection.play(path, name)
                q_tab.remove()
            })
        }
        else {
            // greattings
            const greetings = create_tab("Nice to see you!!")
            setTimeout(() => {
                greetings.remove()
            }, 5000)
        }
    })

    return {
        get_search() {
            return get_search()
        },
        create_link(pathname) {
            return create_link(pathname)
        }
    }
})()

var context_menu = (() => {

    let appended = false

    const ctx = document.createElement("div")
    ctx.setAttribute("class", "ctr-ctx")

    const ctr_td = document.createElement("div")
    ctr_td.setAttribute("class", "ctr-ctx-td")

    //todo
    const link_td = document.createElement("div")
    link_td.setAttribute("class", "ctr-ctx-td")
    link_td.style.pointerEvents = `auto`
    link_td.style.justifyContent = `center`

    ctx.appendChild(ctr_td)
    ctx.appendChild(link_td)
    ctx.addEventListener("contextmenu", e => {
        e.preventDefault()
    })

    for (const item of ["scroll", "click", "contextmenu"]) {
        ctr_wrapper.addEventListener(item, () => {
            ctx.remove()
        }, true)
        ctx.addEventListener(item, () => {
            ctx.remove()
        }, true)

    }

    // todo copy_link
    async function copy_link(path, name) {
        await navigator.clipboard.writeText(urlparams.create_link(encodeURI(`${path}/${name}`)))
    }

    return {
        move(event, path, name) {
            if (!appended) body.appendChild(ctx)
            const ctx_offset_x = event.clientX + ctx.getBoundingClientRect().width
            const ctx_x = ctx_offset_x > innerWidth ? event.clientX - (ctx_offset_x - innerWidth) : event.clientX

            const ctx_offset_y = event.clientY + ctx.getBoundingClientRect().height
            const ctx_y = ctx_offset_y > innerHeight ? event.clientY - (ctx_offset_y - innerHeight) : event.clientY

            ctx.style.top = `${ctx_y}px`
            ctx.style.left = `${ctx_x}px`
            ctr_td.textContent = `${name}`
            link_td.textContent = `copy link`
            // todo shall fix this omg aaaaaaaaaaaaaaaaaaaaaaaaaaahhhhhhhhhhhhhhhhhhhhhhhh i can't think anymore.
            link_td.addEventListener("click", () => {
                copy_link(path, name)
            }, true)
        }
    }
})()

var volume_manager = (() => {
    // todo

    let master_volume = 1
    let ctr_volume = .4
    let main_volume = 1

    return {
        master(number) {
            if (undefined || isNaN(number)) return master_volume
            else {
                master_volume = number > 1 ? 1 : number < 0 ? 0 : number
                source_collection.audio().volume = master_volume * main_volume

                return master_volume
            }
        },
        ctr(number) {
            if (undefined || isNaN(number)) return ctr_volume
            else {
                ctr_volume = number > 1 ? 1 : number < 0 ? 0 : number
                return master_volume * ctr_volume
            }
        },
        main(number) {
            if (undefined || isNaN(number)) return main_volume
            else {
                main_volume = number > 1 ? 1 : number < 0 ? 0 : number
                source_collection.audio().volume = master_volume * main_volume

                return main_volume
            }
        },
        ctr_hover_in() {
            source_collection.audio().volume = master_volume * main_volume / 4
            return master_volume * ctr_volume + (1 - ctr_volume - .2) * main_volume
        },
        ctr_hover_out() {
            source_collection.audio().volume = master_volume * main_volume
        }
    }
})()

manifest_option.addEventListener("click", manifest_option_state)
manifest_containers.addEventListener("click", manifest_containers_state)
manifest_track_controls.addEventListener("click", manifest_track_controls_state)

add_banner("./banner/628286.webp")
add_filler()

const manifest_recent_tracks = (() => {
    let holder_range = 20
    const holder = []
    const fetch_recent_tracks = JSON.parse(localStorage.getItem("recent_tracks"))

    if (fetch_recent_tracks) {
        // the arrays from fetch_recent_tracks was implemeted/push into holder array 
        for (f of fetch_recent_tracks) {
            holder.push(f)
        }
        add_ctr_header("recent_of_you")
        const collection = create_collection()
        for (h of holder) {
            collection.only(h[0], h[1])
        }
    }

    return {
        only(path, name) {
            if (!(path && name)) return

            holder.forEach((h, i) => {
                if (h[0] == path && h[1] == name) {
                    holder.splice(i, 1)
                }
            })
            holder.splice(0, 0, [path, name])

            if (holder.length > holder_range) holder.splice(holder_range, holder.length - holder_range)
            localStorage.setItem("recent_tracks", JSON.stringify(holder))

        },
        range(value) {
            holder_range = value
        }
    }
})()

//function temporary

function skip() {
    source_collection.goAt(source_collection.audio().duration)
}

function notif(message) {
    Notification.requestPermission().then(() => {
        new Notification("Player", {
            body: `currently playing: ${message}`,
            tag: `player`,
            icon: "school_girl.png"
        })
    })
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(function (registration) {
            registration.showNotification("Player", {
                body: `currently playing: ${message}`,
                tag: `player`,
                icon: "school_girl.png"
            })
        })
    }
}


window.addEventListener("keyup", e => {
    const search = document.querySelector(".search")

    if (e.keyCode == 39 && e.ctrlKey) skip()
    if (e.keyCode == 32 && document.activeElement == body) source_collection.state()
    if (e.keyCode == 39 && document.activeElement == body) source_collection.goAt(source_collection.audio().currentTime + 10)
    if (e.keyCode == 37 && document.activeElement == body) source_collection.goAt(source_collection.audio().currentTime - 10)
    if (e.keyCode == 70 && document.activeElement == body) manifest_option_state()
    if (e.keyCode == 68 && document.activeElement == body) manifest_track_controls_state()
    if (e.keyCode == 83 && document.activeElement == body) manifest_containers_state()
    if (e.keyCode == 65 && document.activeElement == body) search.focus()
}, true)

add_ctr_header("KawaiiNeko Collection")
const kawaiineko = create_collection()
add_ctr_header("KawaiiNyeow Collection")
const kawaiinyeow = create_collection()

kawaiineko.many(fetch_tracks("https://rcph-smz.github.io/rcph_player_src/fetch/kawaiineko.json"), fetch_tracks("https://rcph-smz.github.io/rcph_player_src/fetch/kawaiineko.json"))

kawaiinyeow.many(fetch_tracks("https://rcph-smz.github.io/rcph_player_src/fetch/kawaiinyeow.json"), fetch_tracks("https://rcph-smz.github.io/rcph_player_src/fetch/kawaiinyeow.json"))