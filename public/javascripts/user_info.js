const form = document.forms[0]
form.onsubmit = ev => {
    ev.preventDefault()
    const memberinfo = new FormData(ev.target) // TODO memberinfo is {} when debugging
    // TODO convert graduation year from time string
    // TODO check whether the user input discipline in existing discipline pool
    // TODO if so, POST /discipline
    const openId = form['openId'].value
    const submitbutton = ev.target.lastElementChild
    submitbutton.disabled = true
    submitbutton.classList.add('weui-btn_loading')
    submitbutton.innerHTML = ' <i class="weui-loading"> </i> ';
    // TODO Set xhr field in req header to help server identify xhr
    put("/user/" + openId, memberinfo).then(res => {
        const data = JSON.parse(res)
        submitbutton.classList.remove('weui-btn_loading')
        if (!(data.hasOwnProperty('status') && data.status != 0)) {
            submitbutton.innerHTML = "✔"
            // TODO the user should be able to submit the form the second time
            // TODO the success notification should only appear for certain amount of time
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
    get('/discipline').then(dataStr => {
        let data = JSON.parse(dataStr);
        if (data.hasOwnProperty('status') && data.status != 0) {
            // TODO display error
        } else {
            data.forEach(({name}) => {
                datalist.appendChild(new$('option', {textContent: name}))
            });
        }
    });
}

$(document).ready(function () {
    loadDisciplines();
});
