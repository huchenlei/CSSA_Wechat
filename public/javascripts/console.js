const ws = new WebSocket("ws://" + window.location.hostname + ":8080")
const dataSet = {}
ws.onopen = () => {
    sendMessage('getDisciplines')
}
ws.onmessage = ({ data }) => {
    console.log(data)
    const dataObj = JSON.parse(data)
    switch (dataObj.type) {
        case "getDisciplines":
            // data.response will be an array of disciplines
            const container = _$('.disciplines')
            dataSet.disciplines = dataObj.response
            dataObj.response.forEach((dis, i) => {
                container.appendChild(renderDiscipline(dis, i))
            })
            break;
    }
}
function sendMessage(type, data) {
    ws.send(JSON.stringify({ type, data }))
}

const _$ = document.querySelector.bind(document)

/**
 * 
 * @param {string} discipline 
 * @return a div element containing the discipline related elements
 */
function renderDiscipline(discipline, key) {
    const wrap = new$("div", { className: "weui-cell weui-cells_checkbox discipline" })
    const header = wrap.appendChild(new$("label", { className: "weui-cell__hd" }))
    const checkbox = header.appendChild(new$("input", { className: "weui-check" }, { name: discipline, type: "checkbox" }))
    const check = header.appendChild(new$('i', { className: "weui-icon-checked" }))
    const body = wrap.appendChild(new$("div", { className: "weui-cell__bd" }))
    const p = body.appendChild(new$('p', { textContent: discipline }))
    const modify = wrap.appendChild(new$('i', { className: "modify", textContent: "✎" }))
    const remove = wrap.appendChild(new$('i', { className: "delete", textContent: "✖" }))
    return wrap
}

function new$(tag, props, attrs) {
    const element = document.createElement(tag)
    if (props) Object.assign(element, props)
    if (attrs) {
        Object.keys(attrs).forEach(key => {
            element.setAttribute(key, attrs[key])
        })
    }
    return element
}

const add = _$('.global-actions > .add')
add.onclick = ev => {
    const discipline = prompt('Add a discipline', "")
    if (discipline && discipline !== "") {
        console.log('new discipline', discipline)
        // check unique
        if (dataSet.disciplines && !dataSet.disciplines.includes(discipline)) {
            _$('.disciplines').insertBefore(renderDiscipline(discipline), _$('.disciplines').firstElementChild)
            dataSet.disciplines.push(discipline)
            sendMessage('addDiscipline', discipline)
        }
    }
}
