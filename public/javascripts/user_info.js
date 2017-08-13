const form = document.forms[0]
form.onsubmit = async ev => {
    ev.preventDefault()
    const memberinfo = new FormData(ev.target)
    // for (let item of form) {
    //     console.log(item)
    // }
    const mockOpenID = 12345
    const submitbutton = ev.target.lastElementChild
    submitbutton.classList.add('weui-btn_loading')
    submitbutton.innerHTML = ' <i class="weui-loading"> </i> '
    const data = JSON.parse(await put("/user/test/ing", memberinfo))
    console.log(data)
    submitbutton.classList.remove('weui-btn_loading')
    if (data.type === "success") {
        submitbutton.innerHTML = "✔"
        // prevent user from submitting a second time
        form.onsubmit = ev => ev.preventDefault()
    } else {
        submitbutton.innerHTML = "something wrong"
        submitbutton.classList.add('weui-btn_warn')
        setTimeout(() => {
            submitbutton.innerHTML = "Submit"
            submitbutton.classList.remove('weui-btn_warn')
        }, 1000)
    }
}
