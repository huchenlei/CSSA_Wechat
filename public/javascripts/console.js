const ws = new WebSocket("ws://" + window.location.hostname + ":8080")
const add = _$('.global-actions > .add')
const merge = _$('.global-actions > .merge')
const refresh = _$('.global-actions > .refresh')
ws.onopen = () => {
    sendMessage('getDisciplines')
}
ws.onmessage = ({ data }) => {
    console.log(data)
    const dataObj = JSON.parse(data)
    switch (dataObj.type) {
        case "getDisciplines":
            // data.response will be an array of disciplines
            loadDisciplines(dataObj.response)
            break;
    }
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
        const discipline = prompt('Merge into what?', selected.join('+'))
        // will use a datalist to give options to the existing names
        if (discipline && discipline !== "" && selected.includes(discipline)) {
            console.log('new discipline', discipline)
            divDisciplines.merge(discipline)
            // the job of checking repetition will be on the server
        } else {
            alert('The discipline name must be one of the merged disciplines')
        }
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
        })
        Disp.listen('remove').then(() => {
            this.data.delete(dis)
        })
        Disp.listen('select').then(isChecked => {
            console.log('select', dis, this.selected)
            if (isChecked) {
                this.selected.add(dis)
            } else {
                this.selected.delete(dis)
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
    merge(newName) {
        // merge all selected items to a new name
        this.selected.forEach(dis => {
            this.data.delete(dis)
        })
        this.data.add(newName)
        sendMessage('mergeDisciplines', { from: Array.from(this.selected), to: newName })
        this.selected.clear()
        this.refresh()
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
        this.discipline = p.textContent
        this.emit('edit', p.textContent)
        sendMessage('editDiscipline', { from: this.discipline, to: p.textContent })
    }
    remove() {
        this.emit('remove')//let parent update its data list
        sendMessage('removeDiscipline', this.discipline)
        this.destroy()
    }
    check(isChecked) {
        this.emit('select', isChecked)
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
        const remove = wrapper.appendChild(new$('i', { className: "delete", textContent: "✖" }))
        remove.onclick = ev => {
            this.remove()
        }
        return wrapper
    }
}