const ws = new WebSocket("ws://" + window.location.hostname + ":8080")
const add = _$('.discplines-wrapper >.global-actions> .add')
const merge = _$('.discplines-wrapper >.global-actions> .merge')
const refresh = _$('.discplines-wrapper >.global-actions> .refresh')
const menuItemsh2 = _$(".menu-wrapper > h2", document.body)
const saveIcon = _$('div.weui-cells.menu-wrapper > i.weui-icon_msg')
ws.onopen = () => {
    sendMessage('getDisciplines')
    sendMessage('getMenuItems')
}
ws.onmessage = ({ data }) => {
    console.log(data)
    const dataObj = JSON.parse(data)
    switch (dataObj.type) {
        case "getDisciplines":
            // data.response will be an array of disciplines
            loadDisciplines(dataObj.response)
            break;
        case "getMenuItems":
            // data.response will be json in plain text of the menu items
            loadMenuItems(dataObj.response)
            break;
        case "saveMenuItems":
            if (dataObj.response === "success") {
                menuItemsh2.textContent = "Menu Items (Saved)"
                changeMenuState("ready")
            } else {
                menuItemsh2.textContent = "Menu Items (Saving Failed due to " + dataObj.response + ")"
                changeMenuState("error")
            }
            break;
    }
    // everytime got a response, dequeue
}

ws.onclose = ev => {
    console.log(ev)
    alert(ev.reason || 'Conection Error')
}

function sendMessage(type, data) {
    ws.send(JSON.stringify({ type, data }))
}

function loadDisciplines(disciplines) {
    const divDisciplines = new Disciplines(disciplines)
    _$('.discplines-wrapper').appendChild(divDisciplines.render())
    // event listeners to higher level discipline edits
    add.onclick = ev => {
        const discipline = prompt('Add a discipline', "")
        if (discipline && discipline !== "") {
            console.log('new discipline', discipline)
            divDisciplines.add(discipline)
            // the job of checking repetition will be on the server
        }
    }
    merge.onclick = ev => {
        const selected = Array.from(divDisciplines.selected)
        if (selected.length === 0) {
            alert('no disciplines selected')
            return
        }
        divDisciplines.merge()
    }
    refresh.onclick = ev => {
        divDisciplines.destroy()
        sendMessage('getDisciplines')
    }
}

// renders all disciplines
class Disciplines extends Component {
    constructor(list) {
        super('div', { className: "disciplines" })
        this.data = new Set(list)
        this.selected = new Set()
    }
    createDis(dis) {
        // instantiate a discipline item and attach relevant listeners
        const Disp = new Discipline(dis)
        Disp.listen('edit').then(newDis => {
            this.data.delete(dis)
            this.data.add(newDis)
            console.log(dis, '-->', newDis)
            // this.refresh()
        })
        Disp.listen('remove').then(() => {
            this.data.delete(dis)
        })
        // The whole HTMLElement of the discipline is passed here and store into/remove from this.selected
        Disp.listen('select').then(({ isChecked, element }) => {
            console.log('select', dis, this.selected)
            if (isChecked) {
                this.selected.add(element)
            } else {
                this.selected.delete(element)
            }
        })
        Disp.render()
        return Disp
    }
    // add a discipline
    add(dis) {
        if (this.data.has(dis)) return false
        // add a discipline
        this.data.add(dis)
        this.dom.appendChild(this.createDis(dis, this.data.length).dom)
        sendMessage('addDiscipline', dis)
        return true
    }
    // Merge all selected discipline to the first selected discipline, and trigger edit on the element corresponding to targetDis
    merge() {
        const dList = []
        // use the first element as the targetDis
        const targetDis = _$('p', Array.from(this.selected)[0]).textContent
        this.selected.forEach((element) => {
            const dis = _$('p', element).textContent //The name of the discipline to be merged
            dList.push(dis)
            if (dis !== targetDis) {
                this.data.delete(dis)
                element.classList.add("fading")//animation to fade the removed discipline away
            }
        })
        sendMessage('mergeDisciplines', { from: dList, to: targetDis })
        // clear the selected disciplines list
        this.selected.clear()
        setTimeout(() => {
            // after 700ms, the fading animation is done, we can remove the elements corresponding to each of dList by calling this.refresh()
            this.refresh()
            // trigger edit after refresh by clicking on the modify icon
            const index = Array.from(this.data).indexOf(targetDis)
            _$(`.discipline:nth-child(${index + 1}) i.modify`, this.dom).click()
        }, 700)
    }
    render() {
        this.data.forEach(dis => {
            this.dom.appendChild(this.createDis(dis).dom)
        })
        return this.dom
    }
}

class Discipline extends Component {
    constructor(dis) {
        super('div', { className: "weui-cell weui-cells_checkbox discipline" });
        this.discipline = dis
    }
    edit(p) {
        // edit a single discipline
        p.setAttribute('contenteditable', '')
        p.focus()
        p.onblur = ev => this.submitEdit(p)
        p.onkeydown = ev => {
            if (ev.key === "Enter") {
                ev.preventDefault()
                this.submitEdit(p)
            }
        }
    }
    submitEdit(p) {
        // set to null to prevent duplicates of the same edit
        p.onblur = null
        p.onkeydown = null
        p.removeAttribute('contenteditable')
        this.emit('edit', p.textContent)
        sendMessage('editDiscipline', { from: this.discipline, to: p.textContent })
        this.discipline = p.textContent
    }
    // remove() {
    //     this.emit('remove')//let parent update its data list
    //     sendMessage('removeDiscipline', this.discipline)
    //     this.destroy()
    // }

    // event listener when checkbox gets clicked
    check(isChecked) {
        this.emit('select', { isChecked, element: this.dom })
    }
    render() {
        const wrapper = this.dom
        const header = wrapper.appendChild(new$("label", { className: "weui-cell__hd" }))
        const checkbox = header.appendChild(new$("input", { className: "weui-check" }, { name: this.discipline, type: "checkbox" }))
        checkbox.onchange = ev => {
            this.check(ev.target.checked)
        }
        const check = header.appendChild(new$('i', { className: "weui-icon-checked" }))
        const body = wrapper.appendChild(new$("div", { className: "weui-cell__bd" }))
        const p = body.appendChild(new$('p', { textContent: this.discipline }))
        const modify = wrapper.appendChild(new$('i', { className: "modify", textContent: "✎" }))
        modify.onclick = ev => {
            this.edit(p)
        }
        // const remove = wrapper.appendChild(new$('i', { className: "delete", textContent: "✖" }))
        // remove.onclick = ev => {
        //     this.remove()
        // }
        return wrapper
    }
}

/**
 * After menu.json is returned from server, pass to this function to render the editor
 * @param {string} jsonText 
 */
function loadMenuItems(jsonText) {
    const editor = ace.edit("editor");
    window.editor = editor
    const session = editor.session
    session.setMode("ace/mode/javascript");
    session.setUseWrapMode(true);
    //loads menu.json into the editor
    session.setValue(jsonText);
    //When a change happens, indicate ready to save
    session.on('change', (e) => {
        menuItemsh2.textContent = "Menu Items (Ctrl/Cmd+S to Save)"
        changeMenuState("ready")
    })
    //Ctrl + S saving keybinding
    editor.commands.addCommand({
        name: 'Save',
        bindKey: { win: 'Ctrl-S', mac: 'Command-S' },
        exec: saveMenu,
        readOnly: true // false if this command should not apply in readOnly mode
    });
    //clicking on the ico can also save the changes
    saveIcon.onclick = ev => {
        switch (saveIcon.classList[0]) {
            case "weui-icon-success":
                saveMenu(editor)
                break;
        }
    }
}

/**
 * Upload changes of the menu.json to server
 * @param {object} an ace editor instance
 */
function saveMenu(editor) {
    menuItemsh2.textContent = "Menu Items (Saving...)"
    sendMessage("saveMenuItems", editor.getValue())
    changeMenuState("saving")
}

/**
 * Change the appearance of the save menu items icon
 * @param {string} type, either "ready","saving",or "error"
 */
function changeMenuState(type) {
    switch (type) {
        case "ready":
            saveIcon.className = "weui-icon-success weui-icon_msg"
            break;
        case "saving":
            saveIcon.className = "weui-icon-waiting weui-icon_msg"
            break;
        case "error":
            saveIcon.className = "weui-icon-warn weui-icon_msg"
            break;
    }
}