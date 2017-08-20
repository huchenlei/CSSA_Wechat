// a XHR wrap for ajax requests
(function ajax() {
    const xhr = new XMLHttpRequest()
    function put(url, data) {
        xhr.open('PUT', url)
        return new Promise((accept, reject) => {
            xhr.send(data)
            xhr.onload = () => {
                accept(xhr.response)
            }
            xhr.onerror = reject
        })
    }
    function post(url, data) {
        xhr.open('POST', url)
        return new Promise((accept, reject) => {
            xhr.send(data)
            xhr.onload = () => {
                accept(xhr.response)
            }
            xhr.onerror = reject
        })
    }
    function get(url) {
        xhr.open('GET', url)
        return new Promise((accept, reject) => {
            xhr.send()
            xhr.onload = () => {
                accept(xhr.response)
            }
            xhr.onerror = reject
        })
    }
    Object.assign(this, { put, post, get })
})(window)