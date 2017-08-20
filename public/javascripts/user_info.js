const form = document.forms[0]
form.onsubmit = ev => {
    ev.preventDefault()
    const memberinfo = new FormData(ev.target)
    const openId = form['openId'].value
    const submitbutton = ev.target.lastElementChild
    submitbutton.disabled = true
    submitbutton.classList.add('weui-btn_loading')
    submitbutton.innerHTML = ' <i class="weui-loading"> </i> '
    put("/user/test/" + openId, memberinfo).then(res => {
        const data = JSON.parse(res)
        console.log('got response', data)
        submitbutton.classList.remove('weui-btn_loading')
        if (data.type === "success") {
            submitbutton.innerHTML = "✔"
            // prevent user from submitting a second time
            form.onsubmit = ev => ev.preventDefault()
        } else {
            submitbutton.innerHTML = "✘"
            submitbutton.classList.add('weui-btn_warn')
            setTimeout(() => {
                submitbutton.disabled = false
                submitbutton.innerHTML = "Submit"
                submitbutton.classList.remove('weui-btn_warn')
            }, 1000)
        }
    })
}
async function loadDisciplines() {
    const datalist = _$('#disciplines', form)
    get('/discipline').then(list => {
        // console.log(list)
        JSON.parse(list).forEach(({ name }) => {
            datalist.appendChild(new$('option', { textContent: name }))
        })
    })
}
loadDisciplines()