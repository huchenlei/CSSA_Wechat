const ws = new WebSocket("ws://" + window.location.hostname + ":8080")
const add = _$('.global-actions > .add')
const merge = _$('.global-actions > .merge')
const refresh = _$('.global-actions > .refresh')
const msgQ = []
ws.onopen = () => {
    msgQ.waiting = false
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
    // everytime got a response, dequeue
    msgQ.clearOne()
}

ws.onclose = ev => {
    console.log(ev)
    msgQ.waiting = true
    alert(ev.reason || 'Conection Error')
}

function sendMessage(type, data) {
    msgQ.maybeSend(JSON.stringify({ type, data }))
}

Object.assign(msgQ, {
    waiting: false,
    maybeSend(message) {
        if (!this.waiting) {
            ws.send(message)
            this.waiting = true
        }
        else {
            this.push(message)
            if (msgQ.length > 3) {
                console.log('network slow, pending operations:\n', msgQ.join('\n'))
            }
        }
    },
    clearOne() {
        this.shift();
        this.waiting = false
        if (this.length > 0)
            this.maybeSend(this[0])
    }
})

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
    // Merge all selected discipline to the first selected discipline, and trigger edit inside divDisciplines.merge()
    merge() {
        const dList = []
        // use the first element as the targetDis
        const targetDis = _$('p', Array.from(this.selected)[0]).textContent
        this.selected.forEach((element) => {
            const dis = _$('p', element).textContent
            dList.push(dis)
            if (dis !== targetDis) {
                this.data.delete(dis)
                element.classList.add("fading")
            }
        })
        sendMessage('mergeDisciplines', { from: dList, to: targetDis })
        this.selected.clear()
        setTimeout(() => {
            this.refresh()
            // trigger edit after refresh
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