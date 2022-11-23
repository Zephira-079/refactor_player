const options = document.querySelector(".options")
const track_controls = document.querySelector(".track-controls")
const track_holder = document.querySelector(".track-holder")

const manifest_option = document.querySelector(".manifest-option")
const manifest_containers = document.querySelector(".manifest-containers")
const manifest_track_controls = document.querySelector(".manifest-track-controls")

const ctr_wrapper = document.querySelector(".ctr-wrapper")
const fl_wrapper = document.querySelector(".fl-wrapper")

const body = document.body

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

    const create_controls = (next, prev, label_name, fun_name) => {

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
        many(path, names) {
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
    let holder_range = 10
    const holder = []
    const fetch_recent_tracks = JSON.parse(localStorage.getItem("recent_tracks"))

    if (fetch_recent_tracks) {
        // the arrays from fetch_recent_tracks was implemeted/push into holder array 
        for (f of fetch_recent_tracks) {
            holder.push(f)
        }
        add_ctr_header("recent_tracks")
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
}

window.addEventListener("keydown", e => {
    const search = document.querySelector(".search")

    if (e.keyCode == 39 && e.ctrlKey) skip()
    if (e.keyCode == 32 && document.activeElement == body) source_collection.state()
    if (e.keyCode == 39 && document.activeElement == body) source_collection.goAt(source_collection.audio().currentTime + 10)
    if (e.keyCode == 37 && document.activeElement == body) source_collection.goAt(source_collection.audio().currentTime - 10)
}, true)

add_ctr_header("KawaiiNeko Collection")
const kawaiineko = create_collection()
add_ctr_header("KawaiiNyeow Collection")
const kawaiinyeow = create_collection()

kawaiineko.many("https://rcph-smz.github.io/rcph_player_src/KawaiiNeko", [
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

kawaiinyeow.many("https://rcph-smz.github.io/rcph_player_src/KawaiiNyeow",
    [
        "%5BFULL%5DCentimeter_-_Kanojo%2C_Okarishimasu_Rent-a-Girlfriend_OP___the_peggies__piano_(1080p).mp3",
        "%E3%80%90%E5%B7%A1%E9%9F%B3%E3%83%AB%E3%82%AB%E3%80%91___%E3%81%A9%E3%82%8A%E3%83%BC%E3%81%BF%E3%82%93%E3%83%81%E3%83%A5%E3%83%81%E3%83%A5___Dreamin_Chuchu___by_emon_%E3%80%90MEGURINE_LUKA%E3%80%91(720p).mp3",
        "%E3%80%90Future_Bass%E3%80%91Amidst_-_Phantasy____%E2%99%AB%E2%99%AB%E2%99%AB(720p).mp3",
        "%E3%80%904K%E3%80%91%E3%81%A9%E3%82%8A%E3%83%BC%E3%81%BF%E3%82%93%E3%83%81%E3%83%A5%E3%83%81%E3%83%A5___Dreamin_Chuchu_cover.%E9%B9%BF%E4%B9%83(1080p).mp3",
        "%E3%80%90Genshin_Impact_MMD_4K_60FPS%E3%80%91Lumine___Keqing___Ganyu%E3%80%90%E8%8A%B1%E6%9C%88%E6%88%90%E5%8F%8C%E3%80%91%23PleaseReadDescription(720p).mp3",
        "%E3%80%90Genshin_Impact_MMD_4K_60FPS%E3%80%91Kokomi%E3%80%90%E5%A4%9C%E6%98%8E%E7%8F%A0_%E3%82%A4%E3%82%A8%E3%83%9F%E3%83%B3%E3%82%B8%E3%83%A5_%E3%80%91_%23PleaseReadDescription(720p).mp3",
        "%E3%81%BE%E3%81%98%E5%A8%98_-__%E3%82%A2%E3%82%A4%E3%83%AD%E3%83%8B_Irony_%E5%8F%8D%E8%AF%AD__%5BJapanese_Romaji_English%5D___Lyrics_Lyric_Video(720p).mp3",
        "%E3%80%904K%E3%80%91%E3%81%A9%E3%82%8A%E3%83%BC%E3%81%BF%E3%82%93%E3%83%81%E3%83%A5%E3%83%81%E3%83%A5___Dreamin_Chuchu_cover.%E9%B9%BF%E4%B9%83(480p).mp3",
        "%E3%81%8E%E3%82%85%E3%81%A3%E3%81%A8%E3%80%82__%E3%82%82%E3%81%95%E3%82%92%E3%80%82%E3%80%90Music_Video%E3%80%91(1080p).mp3",
        "%E3%83%8F%E3%83%AD%EF%BC%8F%E3%83%8F%E3%83%AF%E3%83%A6_Hello_how_are_you___Cover_by_Nabi(1080p).mp3",
        "%E3%82%B8%E3%82%A7%E3%83%AA%E3%83%BC%E3%83%95%E3%82%A3%E3%83%83%E3%82%B7%E3%83%A5__feat._%E3%83%AD%E3%83%BC%E3%83%A9%E3%83%BC%E3%82%AC%E3%83%BC%E3%83%AB_-Yunomi_Covered_by_Nabi(720p).mp3",
        "2_23_AM___%E3%81%97%E3%82%83%E3%82%8D%E3%81%86(1080p).mp3",
        "%E3%82%82%E3%81%90%E3%82%82%E3%81%90YUMMY%EF%BC%81__%E7%8C%AB%E5%8F%88%E3%81%8A%E3%81%8B%E3%82%86(1080p).mp3",
        "Amatsuka_Uto_Stream_Intro(1080p).mp3",
        "1st_Single_【_REDHEART_】(1080p)(1).mp3",
        "%E5%B9%BD%E9%9C%8A%E6%9D%B1%E4%BA%AC___%E5%88%9D%E9%9F%B3%E3%83%9F%E3%82%AF(720p).mp3",
        "Aire___Ujico__-_Spiral%E3%80%8CF_C_Virtual_Odyssey__Emotion%E3%80%8D_%5BFuture_Bass%5D(1080p).mp3",
        "aori_-_ぱられループ_を歌ってみた_(Jeku_Remix)(1080p).mp3",
        "Anime_Moan_Remix__Remastered(720p).mp3",
        "Android_52_-_The_New_Shrimp_Groove(720p).mp3",
        "Auburn_-_All_About_Him_(slowed_+_reverb)(720p).mp3",
        "Azla_-_Flash(1080p).mp3",
        "ayiko_-_Teichopsia_(ft._Shoko)(1080p).mp3",
        "Beethoven_-_Für_Elise_(Klutch_Dubstep_Trap_Remix)(720p).mp3",
        "ayiko_-_Teichopsia_(ft._Shoko)(720p).mp3",
        "BEST_NIGHTCORE_✘_MASHUP_J-POP(1080p).mp3",
        "Brandon_Liew_-_DREAMERS_(feat._TOFIE)(1080p).mp3",
        "Brandon_Liew_-_DREAMERS_(feat._TOFIE)(720p).mp3",
        "Brain_Power(1080p).mp3",
        "Chiisana_Koi_no_Uta(1080p).mp3",
        "Christmas_Song_-_N.A.M.E(1080p).mp3",
        "Cloudier_-_A_Centimetre_Apart_(Systile_Remix)(1080p).mp3",
        "BB_Yukus_-_Northern_Sky(1080p).mp3",
        "Chiisana_Koi_no_Uta(720p).mp3",
        "Colate_-_Good_Night_(Feat._Nanahira)_(Nor_Remix)(1080p).mp3",
        "Colate_-_Dot_to_Dot(1080p).mp3",
        "Couple_N_-_Sweet_Garden(1080p).mp3",
        "Crazed_Bucket_-_Still_Lovely(1080p).mp3",
        "damper_&_Devious_-_soda_street(1080p).mp3",
        "Dankel_Rose_-_Blueberry's_Dreamy_Eyes(1080p).mp3",
        "dark_cat_-_BUBBLE_TEA_(feat._juu_&_cinders)(720p).mp3",
        "DJ_Noriken_-_Stargazer_Feat._YUC'e_「_Xignality_Remix_」(1080p).mp3",
        "dark_cat_-_CRAZY_MILK(720p).mp3",
        "Cold_Youth_-_Nearby(480p).mp3",
        "DJ_Noriken_-_Stargazer_Feat._YUC'e_「_Xignality_Remix_」(360p).mp3",
        "DoctorNoSense_-_Safe_to_Say(1080p).mp3",
        "DJ_Noriken_-_スターゲイザ_(Stargazer)ー_feat._YUC'e_(PSYQUI_Remix)(1080p).mp3",
        "DoctorNoSense_-_Safe_to_Say(720p).mp3",
        "DoctorNoSense_-_Safe_to_Say_(Official_Audio)(1080p).mp3",
        "Eli_Noir_–_Wonder_Why_(prod._Noden)_(Lyrics)_[CC](1080p).mp3",
        "DoctorNoSense_-_Love_Me_Now(720p).mp3",
        "Elliot_Hsu_-_夢のかたち_(feat._Yuca)(360p).mp3",
        "eleline△_-_Koto_no_Town(1080p).mp3",
        "Ferst_-_Sparkle_(feat._Nobelz)(1080p).mp3",
        "excuse.mp3",
        "EmoCosine_-_Step_to_Sky(480p).mp3",
        "Ghostrifter_Official_-_Soaring(1080p).mp3",
        "fuwuvi_-_Hyper_Neko(1080p)(1).mp3",
        "glance_-_Epic_Score__w__nabil%21___noguchii_(480p).mp3",
        "glance_-_Epic_Score__w__nabil%21___noguchii_(720p).mp3",
        "Gotoubun_no_Hanayome_Opening_-_Gotoubun_no_Kimochi_Full_Version_(Color_Coded)_+_Lyrics(1080p)(1).mp3",
        "Future_Cαke(720p).mp3",
        "Future_Cαndy(1080p).mp3",
        "Hanatan_→「_Yuuhi_Saka_」(1080p).mp3",
        "greyl_-_MYC(720p).mp3",
        "Hardwell_ft._Jake_Reese_-_Run_Wild_(HANAEL_Remix)(720p).mp3",
        "Hazy_Skyscraper(1080p).mp3",
        "Hatsune_Miku_-_OVER(720p).mp3",
        "Hikanira_&_Mayuru_-_Baka!(1080p).mp3",
        "HoneyComeBear_-_Natsuzora(ナツゾラ)(20XX_Remix)(1080p).mp3",
        "HoneyComeBear_-_Natsuzora_(ナツゾラ)(1080p)(1).mp3",
        "HoneyComeBear_-_Natsuzora_(20XX_Remix)(1080p).mp3",
        "Hyp3rsleep_&_SoLush_-_Lovestruck(1080p).mp3",
        "greyl_-_MYC(720p)(1).mp3",
        "hyleo_-_Trigger_(feat._Such)(720p).mp3",
        "Japanese_Acoustic_Song_•_Zen_Zen_Zense_-_(Cover_by._粉ミルク)__Lyrics_Video(1080p).mp3",
        "Jotori_-_サイキ_(Saiki)(720p).mp3",
        "Jotori_-_Summer_Rain(1080p).mp3",
        "Hyp3rsleep_–_First_light(1080p).mp3",
        "Kamaboko_-_Colorful(720p).mp3",
        "Kamaboko_-_Colorful(720p)(1).mp3",
        "Kanaria_-_KING_covered_by_amatsukauto_໒꒱·_ﾟ(1080p).mp3",
        "Kana_Hanazawa_-_Renai_Circulation_(Lone_Alpha_Remix)(1080p).mp3",
        "Kano_→「_Sentimental_Love_Heart_」(1080p).mp3",
        "Kano_-_Dreamin_Chuchu_♡♡♡(1080p)(1).mp3",
        "Kenneyon_-_Boba(1080p)(1).mp3",
        "Kenneyon_&_NY~ON!_-_Espresso(1080p)(1).mp3",
        "Kenneyon_-_Boba(1080p).mp3",
        "Kenneyon_-_Citrus(1080p).mp3",
        "Kenneyon_-_Taiko(1080p).mp3",
        "Kagi_-_Daydream(1080p).mp3",
        "Kirara_Magic_-_Chaos_Nya(720p).mp3",
        "Kirara_Magic_-_Colors_(feat._Shion)(1080p).mp3",
        "Kirara_Magic_-_Floating_Star_(feat._Shion)(720p).mp3",
        "Kirara_Magic_-_Island(720p).mp3",
        "kiino_-_lucky(720p).mp3",
        "Kirara_Magic_-_Journey_(feat._Ugu)(1080p).mp3",
        "Kodokushi_(VIP)(1080p).mp3",
        "Kirara_Magic_-_Lovely_Daydream_♥_Kawaii_Future_Bass_♫(1080p).mp3",
        "Kirara_Magic_-_Starlight(1080p).mp3",
        "KOTONOHOUSE_-_Let's_go_boogie_[Reupload](360p).mp3",
        "KUWAGO_-_In_Your_Heart(1080p).mp3",
        "K_DA_-_MORE_ft._Madison_Beer%2C__G_I-DLE%2C_Lexie_Liu%2C_Jaira_Burns%2C_Seraphine__Official_Music_Video_(1080p).mp3",
        "KUWAGO_-_Lucky_Girl(1080p).mp3",
        "KUWAGO_-_In_Your_Heart(720p).mp3",
        "Lokan_–_Antigravity(720p).mp3",
        "Leat'eq_-_Tokyo_(Original)__Nya!_arigato(1080p).mp3",
        "Lone_Alpha_-_Make_Up_Your_Mind_(feat._TOFIE)(1080p).mp3",
        "Madeon_-_All_My_Friends_(Kagi_Remix)(720p).mp3",
        "Louis_Vision_-_Chu_Chu_Chu_(feat._GUMI)(1080p).mp3",
        "Manu_Lei_-_lil_fing(1080p).mp3",
        "makinru_-_Farewell(1080p).mp3",
        "LCwwww_-_Sleepy_Ahhh(720p).mp3",
        "MEMODEMO_-_New_Sunshine(1080p).mp3",
        "Michino_Timothy_Kimino_Kimochi(1080p).mp3",
        "Mihka!_X_Kyoto_Black_–_Kodokushi_(孤独死)(720p).mp3",
        "Mihka!_X_Kyoto_Black_–_Kodokushi_VIP_(孤独死)_[Future_Bass](720p).mp3",
        "Manu_Lei_-_lil_fing(720p).mp3",
        "Miruku_-_You_[Official_Audio](720p).mp3",
        "mkhito_-_Bring_Me_Up(480p).mp3",
        "Miraie_&_iMeiden_-_Heartseeker(1080p).mp3",
        "Moe_House_-_Shibuya_moe_girl(720p).mp3",
        "MojiX!_x_Elkuu_-_Minamo(720p).mp3",
        "MØ_-_KAMIKAZE_(FUTURISM._Remix)(720p).mp3",
        "NETNEGATIVE_-_Let's_go!_(_AkoMusic_Release_)(1080p).mp3",
        "NETNEGATIVE_-_Sugar_Rush_(_AkoMusic_Release_)(1080p).mp3",
        "Nightcore_-_Aishiteru_「_Wotamin_」(1080p).mp3",
        "Nightcore_-_4℃_「_CHIHIRO_」(1080p).mp3",
        "Nightcore_-_Asayake_Kimi_No_Uta「Kano」(1080p).mp3",
        "Nightcore_-_BRAVE_「_8utterfly_Feat._CLIFF_EDGE_」(1080p).mp3",
        "Nightcore_-_Baby_I_Love_You__「_TEE_」(1080p).mp3",
        "Mtell_-_Paimon(1080p).mp3",
        "Nightcore_-_Butter_Sugar_Cream_「_Tomggg_Feat._Tsvaci_」(1080p).mp3",
        "Nightcore_-_Daisy_Blue_「_Kano_」(720p).mp3",
        "Nightcore_-_Daisy_Blue_「_Kano_」(1080p).mp3",
        "Nightcore_-_Dakedo,_Kimi_Shika_Mienakute..._「_8utterfly_Feat._Zawachin_」(1080p).mp3",
        "Nightcore_-_Girl's_Talk_「_CHIHIRO_」(1080p).mp3",
        "Nightcore_-_Demons_(Switching_Vocals)_-_(Lyrics)(1080p).mp3",
        "Nightcore_-_Hello!_How_are_you__Lyrics(1080p).mp3",
        "Nightcore_-_Girl's_Talk_「_CHIHIRO_」(360p)(1).mp3",
        "Nightcore_-_Hello,_How_Are_You_「_Kano_」(720p).mp3",
        "Nightcore_-_Ice_Cream_(Switching_Vocals)_-_(Lyrics)(1080p).mp3",
        "Nightcore_-_In_My_Mind_(Remix)_-_(Lyrics)(1080p).mp3",
        "Nightcore_-_Ima_wo_Kakeru_Shoujo_「_Kano_」(1080p)(1).mp3",
        "Nightcore_-_Itsumo_Soba_de_「_KG_Feat._Maiko_Nakamura_」(720p).mp3",
        "Nightcore_-_Lonely_「_CHIHIRO_」(1080p)(1).mp3",
        "Nightcore_-_Kuroneko_「_Akagami_」(360p).mp3",
        "Nightcore_-_Love_Letter_~Eien_no_Shiawase~_「_jyA-Me_」(1080p).mp3",
        "Nightcore_-_LOVE_SONG%E3%80%8C_Yuka_Masaki____%E7%9C%9F%E5%B4%8E%E3%82%86%E3%81%8B_%E3%80%8D(1080p).mp3",
        "Nightcore_-_Miss_U「_CHIHIRO_feat._ZANE_(three_NATION)_」(1080p).mp3",
        "Nightcore_-_Mata_Futari_koi_o_Suru「Wotamin」(1080p).mp3",
        "Nightcore_-_Nemurenai_Hodo_「_Yuka_Masaki_Feat._WISE__」(1080p)(1).mp3",
        "Nightcore_-_Ghost_「_Kano_」(1080p).mp3",
        "Nightcore_-_Nemurenai_Hodo_「_Yuka_Masaki_Feat._WISE__」(1080p).mp3",
        "Nightcore_-_Nitamono_Doushi_「_Hiromi_」(1080p).mp3",
        "Nightcore_-_Motto_Aishitakatta_「Yuka_Masaki」(1080p).mp3",
        "Nightcore_-_Nothing_To_Say_~会いたいなんて言えない_I_Love_You~_「_8utterfly_」(1080p).mp3",
        "Nightcore_-_Niwaka_Ame_「_Hanatan_」(1080p).mp3",
        "Nightcore_-_Please_Dont_Say_You_Love_Me_-_(Lyrics)(1080p).mp3",
        "Nightcore_-_Once_More_Again_~_Mou_Ichido_Dakishimete「_May_J_Feat._LGYankees_」(1080p).mp3",
        "Nightcore_-_Precious_「_Yuna_Ito_」(1080p)(1).mp3",
        "Nightcore_-_Pura_Pura_Lupa_(English_Version)_-_(Lyrics)(1080p).mp3",
        "Nightcore_-_RESET_「_CHIHIRO_」(1080p).mp3",
        "Nightcore_-_No_Friends_(Lyrics)(1080p).mp3",
        "Nightcore_-_Reaper_-_(Lyrics)(1080p).mp3",
        "Nightcore_-_Sad_Song_(Switching_Vocals)_-_(Lyrics)(1080p).mp3",
        "Nightcore_-_Sayonara_Aishiteta「Saki_Kayama」(360p).mp3",
        "Nightcore_-_Sasabune_「_YuRiCa_」(1080p).mp3",
        "Nightcore_-_Sakura_no_Zenya_「_Kano_」(720p).mp3",
        "Nightcore_-_Sayonara_My_Love「_Maiko_Nakamura_Feat._NERDHEAD_」(720p).mp3",
        "Nightcore_-_Setsunakute_「_Da-iCE_」(720p).mp3",
        "Nightcore_-_Sayonara_Kono_Natsu_Ni_「_Shota_Shimizu_」(1080p).mp3",
        "Nightcore_-_Secret_Summer_「_NERDHEAD_Feat._Chihiro_」(1080p).mp3",
        "Nightcore_-_Souzou_Forest_「_Kano_」(1080p).mp3",
        "Nightcore_-_Shinpakusuu_♯0822_「_Akie_」(1080p).mp3",
        "Nightcore_-_They_Don't_Know_About_Us_-_(Lyrics)(1080p).mp3",
        "Nightcore_-_Uta_ni_Katachi_wa_Nai_Keredo_「_Hanatan_」(1080p).mp3",
        "Nightcore_-_Waiting_For_Love_「_Maiko_Nakamura_Feat._Noa_」(720p).mp3",
        "Nightcore_-_Thank_You_「_CHIHIRO_Feat_WISE_」(1080p).mp3",
        "Nightcore_-_Way_Back_Home_(English_Version)__Lyrics(1080p).mp3",
        "Nightcore_-_Why_Don't_You_Love_Me_(Switching_Vocals)(1080p).mp3",
        "Nightcore_-_Why_「_Hiromi_Feat._Full_of_Harmony_」(720p).mp3",
        "Nightcore_-_Yubiwa_to_Aikagi_「_Hazzie_Feat._Ai_RSP_」(1080p).mp3",
        "Nightcore_-_we_can_do_this_all_night__Loli_Dance(1080p).mp3",
        "Nightcore_-_Yume_Egao_「_Chata_」(1080p).mp3",
        "Nightcore_-_Zurui_yo_._._._「_CHIHIRO_」(1080p).mp3",
        "Nightcore_-_Zutto_Tonari_De.._「_jyA-Me_」(1080p).mp3",
        "Nightcore_-_グッドナイトエヴリワン_中日羅字幕(1080p).mp3",
        "Nightcore_-_____Ichibyou_Demo_SORA_x_Se(1080p).mp3",
        "Nikoi0227_-_Wake_Up(1080p).mp3",
        "Nightcore_–_Miss_You_More_(Lyrics)(1080p).mp3",
        "Omoshiroebi_-_Mille_Feuille_(Orig._Stepic)(1080p).mp3",
        "Nikoi0227_-_Sweetie_cocoa(1080p).mp3",
        "Omoshiroebi_-_Sakura_Saku_Remix_(orig._Yunomi)(720p).mp3",
        "Owl_City_-_Fireflies_(dark_cat_remix)(1080p).mp3",
        "Owl_City_-_Fireflies_(Official_Video)(480p).mp3",
        "Oceanus_-_Keep_A_Secret(1080p).mp3",
        "owarin_-_late_for_school!(1080p).mp3",
        "PIKASONIC_-_Friendship!_(Diona,_Qiqi_&_Klee)(1080p).mp3",
        "PIKASONIC_-_Nation(1080p).mp3",
        "PIKASONIC_-_Emptiness(1080p).mp3",
        "PIKASONIC_-_Pets!_♡_Qiqi_&_Klee_Version(1080p).mp3",
        "Pixel_Galaxy(1080p).mp3",
        "PIKASONIC_-_Klee!(1080p).mp3",
        "POI!!_Ohhh~(1080p).mp3",
        "PLEEG_-_Peace(720p).mp3",
        "Polykeeper_-_Restart_Chronicle_(feat._Hatsune_Miku)(720p).mp3",
        "Pretender_-_Official_Hige_Dandism_(Cover_by._Harutya_&_Kobasolo)_Lyrics(1080p)(1).mp3",
        "Polykeeper_-_Unconventional_(feat._Hatsune_Miku)(1080p).mp3",
        "PSYQUI_-_Are_You_Kidding_Me__ft._Mami____Jpop_Future_Core(720p).mp3",
        "PSYQUI_-_Education(720p).mp3",
        "PSYQUI_-_don't_you_want_me_ft._Such(1080p).mp3",
        "PSYQUI_-_Rainbow_Dream__ft._Mo%E2%88%80____Future_Core(720p).mp3",
        "PSYQUI_-_Still_in_my_heart_feat._%E3%81%B7%E3%81%AB%E3%81%B7%E3%81%AB%E9%9B%BB%E6%A9%9F____Lyrics_%5BCC%5D(720p).mp3",
        "Preddy_-_Xikio_(Full_version)(720p).mp3",
        "PSYQUI_-_Your_Voice_So..._feat._Such_(YUKIYANAGI_Remix)(1080p).mp3",
        "PSYQUI_-_Your_Voice_So...__ft._SUCH____Jpop_Kawaii_J-Core_2019(1080p).mp3",
        "PSYQUI_-_Your_Voice_So..._Zekk___Full_Spec___Remix__Ft._SUCH____Future_Core(720p).mp3",
        "PSYQUI_-_ヒステリックナイトガール_feat._Such_(android52_Edit)(720p).mp3",
        "Rejection_-_Signal__ft._SUCH____Future_Core_2020(720p).mp3",
        "PSYQUI_-_Your_Voice_So...__ft._SUCH____Jpop_Kawaii_J-Core_2019(720p).mp3",
        "Rent-a-Girlfriend_-_Opening_Full『Centimeter』by_the_peggies(1080p).mp3",
        "Pure_100%_&_KOTONOHOUSE_-_Girlfriend(720p).mp3",
        "Roa_-_Little_Dream(1080p).mp3",
        "Ruxxi_-_I_Mean_I_Love_You_VIP__w__Malcha_(720p).mp3",
        "Sad_Puppy_-_Flamakae_Baby(1080p).mp3",
        "SECRET;WEAPON【OFFICIAL】(1080p).mp3",
        "Seina_-_Starlight_Wonder_(feat._Shion)(1080p).mp3",
        "Shining_Lights_(feat._PSYQUI)(1080p).mp3",
        "Rocket_Start_-_Alone(720p).mp3",
        "Snail's_House_-_Butterscotch(1080p).mp3",
        "Snail's_House_-_Chiffon(720p).mp3",
        "Snail's_House_-_Chocolate_Island(1080p).mp3",
        "Snail's_House_-_Hot_Milk(1080p).mp3",
        "Snail's_House_-_Kokorotravel(720p).mp3",
        "Snail's_House_-_Ma_Chouchoute_[Tasty_Release](1080p)(1).mp3",
        "Snail's_House_-_Rainbow_Float(720p).mp3",
        "Snail's_House_-_Pudding(720p).mp3",
        "Snail's_House_-_Strawberry(1080p).mp3",
        "Snail's_House_-_ラ・ム・ネ_(ra-mu-ne)(1080p).mp3",
        "Snail's_House_-_ラ・ム・ネ_(ra-mu-ne)_(Lone_Alpha_Remix)(1080p).mp3",
        "Shikimi_-_Uranus(1080p).mp3",
        "Snail's_House___Pixel_Galaxy_Official_MV(720p).mp3",
        "SoLush_-_Raspberry_Iced_Tea(1080p)(1).mp3",
        "Snail's_House_–_Ma_Chouchoute(720p)(1).mp3",
        "Stessie_-_Close_To_You(1080p).mp3",
        "SoLush_-_Sweet_paradise(1080p).mp3",
        "Still_in_my_heart_(feat._ぷにぷに電機)(1080p).mp3",
        "SoLush_-_Fubu_Funk_!(1080p).mp3",
        "succducc_-_me_&_u_[𝐬𝐥𝐨𝐰𝐞𝐝](720p).mp3",
        "succducc_-_me_&_u_(the_sky_edit)_+_(maquia_edit)(720p).mp3",
        "Summer_is_the_perfect_time_for_skirts~(1080p).mp3",
        "Sylrica_-_Make_A_Wish!(1080p).mp3",
        "Sylrica_-_Sweetie(1080p).mp3",
        "Succducc_-_me_&_u(720p).mp3",
        "Synthion_-_Cake_Pop(1080p)(1).mp3",
        "Synthion_-_Konpeito_(Official_Audio)(720p).mp3",
        "Systile_-_Artificial(1080p).mp3",
        "Sylrica_-_Sweetie(720p).mp3",
        "Systile_-_Love_Signals(1080p).mp3",
        "Synthion_-_Twinkle_(Official_Audio)(720p).mp3",
        "t+pazolite_-_Chrome_VOX_(Uncut_Edition)(720p).mp3",
        "Teikyou_-_Deadly_Slot_Game(720p).mp3",
        "t+pazolite_-_Oshama_Scramble!_(Uncut_Edition)(720p).mp3",
        "Tomggg_(Cover._@Taiyoudayo___)_-_Butter_Sugar_Cream(480p).mp3",
        "Tomggg_(Cover._@Taiyoudayo___)_-_Butter_Sugar_Cream(720p).mp3",
        "Systile_-_Sugar_Circuit(1080p).mp3",
        "Tsukachi_-_Together_Is_Better(720p).mp3",
        "the_peggies「センチメートル」Music_Video(1080p).mp3",
        "Ugumugu_-_Usagi_Ni_Datte_Randoseru(1080p).mp3",
        "Viuk,_Setka_&_Love_Club_-_Tea_Groove_♪(720p).mp3",
        "Xomu_-_Walpurgis_Night(720p).mp3",
        "Ultrasonic_exported_0.mp3",
        "Wave_Meow_&_Zentra_-_Cloud_Surfing(1080p).mp3",
        "YOASOBI_-_%E5%A4%9C%E3%81%AB%E9%A7%86%E3%81%91%E3%82%8B___Yoru_ni_Kakeru__Lyric_Video_(1080p).mp3",
        "YOASOBI「夜に駆ける」_Official_Music_Video(720p).mp3",
        "Xomu_&_Justin_Klyvis_-_Setsuna_(Kirara_Magic_Remix)(1080p).mp3",
        "Your_voice_so..._(Zekk's_'FULL_SPEC'_Remix)_(feat._Such)(720p).mp3",
        "YUC'e_x_Snail's_House_-_Cosmic_Air_Ride(720p).mp3",
        "YOASOBI_-_もう少しだけ_(DoctorNoSense_Remix)(720p).mp3",
        "Yunomi_&_nicamoq_-_インドア系ならトラックメイカー_(ミカヅキBIGWAVE_Remix)(1080p).mp3",
        "YUC_e_-_Future_Candy__Kaivaan_Remix_(720p).mp3",
        "YUMMI_-_Starfall_(MoeTunes_Release)(1080p).mp3",
        "Yunomi_&_nicamoq_–_インドア系ならトラックメイカー(720p).mp3",
        "Yunomi_-_ジェリーフィッシュ_(feat._ローラーガール)(1080p).mp3",
        "Yunomi_-_Aimai_Trip_(feat._桃箱_&_miko)(1080p).mp3",
        "Yunomi_-_Shugorei_(守護霊)_feat._nicamoq_(Tecchi_Remix)(1080p).mp3",
        "Yunomi_–_ゆのみっくにお茶して_(feat.nicamoq)_(Hibiki_Remix)(1080p).mp3",
        "Zakku_x_Nakanojojo_-_Matcha_Love_(feat._アリガトユイナ)(1080p).mp3",
        "Yunomi_-_Yumeiro_Parade_(Feat._Momobako_&_Miko)(720p).mp3",
        "[MV]_Gang_Gang,_Kawaii!!_(DEMONDICE)_-_American_Saikoro_XFD(720p).mp3",
        "[Blue_Archive]_Theme_109(720p).mp3",
        "[MV]_REOL_-_drop_pop_candy(720p).mp3",
        "[ORIGINAL]_REFLECT_-_Gawr_Gura(1080p).mp3",
        "Yunomi_-_守護霊_(feat._nicamoq)(720p).mp3",
        "[_Future_Bass_]_Stereoman_-_Hydrangea_(Original_Mix)(720p).mp3",
        "[ORIGINAL_SONG]__失礼しますが、RIP♡__“Excuse_My_Rudeness,_But_Could_You_Please_RIP”_-_Calliope_Mori(1080p).mp3",
        "[MV]_wannabe-_DEMONDICE(720p).mp3",
        "❋「AS___Nightcore」__Sono_Koe_Kienaiyo___❋(720p).mp3",
        "「Nightcore」→_Asayake_Kimi_No_Uta「Kano」(720p).mp3",
        "「Nightcore」→_Aishiteru「Wotamin」(1080p).mp3",
        "「Nightcore」→_A_Perfect_Sky「BONNIE_PINK」(360p).mp3",
        "「Nightcore」→_Day_by_Day「Kano」(1080p).mp3",
        "「Nightcore」→_Boku_no_Oto「Sukima_Switch」(1080p)(1).mp3",
        "「Nightcore」→_Dear_Bride「西野カナ」(360p).mp3",
        "‪(720p).mp3",
        "「Nightcore」→_Glow「Kano」(720p).mp3",
        "「Nightcore」→_Gyutto「Mosawo」(1080p).mp3",
        "「Nightcore」→_Hanabira「Hanako_Oku」(1080p)(1).mp3",
        "「Nightcore」→_Irony「Kano」(720p).mp3",
        "「Nightcore」→_HANABI「Mr.Children」(360p).mp3",
        "「Nightcore」→_Kimi_e_no_Uta「Mai_Kuraki」(720p).mp3",
        "「Nightcore」→_Kanojo_Wa_Tabi_Ni_Deru「Sana」(1080p).mp3",
        "「Nightcore」→_Lemon「Kenshi_Yonezu」(720p).mp3",
        "「Nightcore」→_Mocha「Sana」(1080p).mp3",
        "「Nightcore」→_Miss_U「Ms.OOJA」(720p).mp3",
        "「Nightcore」→_Neko「DISH」(1080p).mp3",
        "「Nightcore」→_Paprika「Kenshi_Yonezu_&_Foorin」(COVER)(1080p).mp3",
        "「Nightcore」→_Your_Song「Super_Beaver」(1080p).mp3",
        "「Nightcore」→_Irony「Kano」(1080p).mp3",
        "「Nightcore」→_Pretender「Official髭男dism」(COVER)(1080p).mp3",
        "「Nightcore」→_キセキ「GReeeeN」(720p).mp3",
        "「Nightcore」→_あなたの好きなところ「西野カナ」(360p).mp3",
        "「Nightcore」→_サヨナラCOLOR「SUPER_BUTTER_DOG」(1080p).mp3",
        "「Nightcore」→_君さえいなけりゃ「KOBASOLO」(720p).mp3",
        "「Nightcore」→_フィクション「sumika」(720p).mp3",
        "「Nightcore」→_夏霞「あたらよ」(720p).mp3",
        "「Nightcore」→_奏「スキマスイッチ」(360p).mp3",
        "「Nightcore」→_好きな人がいること「JY」(360p).mp3",
        "「_Nightcore_」_→_I_Hate_Me_✖(1080p).mp3",
        "「Nightcore」→_トリセツ「西野カナ」(720p).mp3",
        "「Nightcore」→_高嶺の花子さん「back_number」(720p).mp3",
        "「_Nightcore_」_→_Kanawanai_Koi_Demo_✖(1080p)(1).mp3",
        "「_Nightcore_」_→_LOVE_SONG_✖(1080p).mp3",
        "「_Nightcore_」_→_Suki_de,_Suki_de,_Sukinanoni..._✖(1080p).mp3",
        "【GUMI】KING【Kanaria】(720p).mp3",
        "【GUMI】エンヴィーベイビー【Kanaria】(720p).mp3",
        "【MV】ファンサ／mona(CV：夏川椎菜)【HoneyWorks】(1080p)(1).mp3",
        "【Penta】_RENAI_Decorate_【Original_Choreograph】(720p).mp3",
        "ねむるまち_feat.yama__(Official_Video)(1080p).mp3",
        "ぎゅっと_Gyutto_-_Mosawo_もさを__Lyrics_Video(1080p).mp3",
        "インドア系ならトラックメイカー_covered_by_Uto_＆_Nabi(1080p).mp3",
        "「_Nightcore_」_→_Last_Kiss_✖(1080p).mp3",
        "ヨルシカ_-_ただ君に晴れ_(MUSIC_VIDEO)(1080p).mp3",
        "一首好聽的日語歌《彼女は旅に出る》冰鎮豆沙君【中日歌詞Lyrics】(1080p).mp3",
        "不登校のあなたへ(1080p).mp3",
        "ヨルシカ_-_ただ君に晴れ_(MUSIC_VIDEO)(720p).mp3",
        "💳💸_sakehands_-_PLASTIC_ft._Good_Intent_中英文歌詞_Lyrics(720p).mp3",
        "🌸_Cloudier_-_A_Centimetre_Apart_[_Sylrica_Remix_]_🎧(720p).mp3",
        "米津玄師__MV「Lemon」(1080p).mp3"
    ]
)