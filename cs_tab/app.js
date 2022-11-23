function create_tab(text) {
    const body = document.body

    const tab = document.createElement("div")
    tab.setAttribute("class","tab")
    const aside_tab = document.createElement("div")
    aside_tab.setAttribute("class","aside_tab")

    const main_content = document.createElement("div")
    main_content.setAttribute("class","main_content")
    const content_wrapper = document.createElement("div")
    content_wrapper.setAttribute("class","content_wrapper")
    const drawer_wrapper = document.createElement("div")
    drawer_wrapper.setAttribute("class","drawer_wrapper")

    const remove_icon = document.createElement("div")
    remove_icon.setAttribute("class","remove_icon")
    const hide_icon = document.createElement("div")
    hide_icon.setAttribute("class","hide_icon")

    body.appendChild(tab)
        tab.appendChild(aside_tab)
            aside_tab.appendChild(drawer_wrapper)
            aside_tab.appendChild(hide_icon)
                hide_icon.textContent = "_"
            aside_tab.appendChild(remove_icon)
                remove_icon.textContent = "X"
        tab.appendChild(content_wrapper)
            content_wrapper.appendChild(main_content)

    main_content.textContent = text

    remove_icon.addEventListener("click", () => {
        tab.remove()
    })

    let pointer_status = false
    window.addEventListener("pointermove", (e) => {

        const tab_observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) entry.target.remove()
            })
        })

        if (pointer_status) {
            tab.style.left = `${e.clientX}px`
            tab.style.top = `${e.clientY + (tab.getBoundingClientRect().height / 2)}px`

            tab_observer.observe(tab)
        }
    })
    aside_tab.addEventListener("pointerdown", () => {
        pointer_status = true
    })
    window.addEventListener("pointerup", () => {
        pointer_status = false
    })
    return {
        remove() {
            tab.remove()
        },
        element() {
            return tab
        }
    }
}
// if(innerWidth > 500) {
//     create_tab("idle: none,random,reverse are not done yet!!!")
// }

//temporary 
