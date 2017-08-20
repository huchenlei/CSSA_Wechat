const _$ = (selector, container = document) => container.querySelector(selector)
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

class Component extends Object {
    constructor(...args) {
        super();
        this.dom = new$(...args)
        this.listeners = new Map()
    }
    listen(eventName) {
        // called by the parent to listen to this instance's event
        return new Promise((accept, reject) => {
            try {
                if (this.listeners.has(eventName)) {
                    this.listeners.get(eventName).add(accept)
                } else {
                    this.listeners.set(eventName, new Set([accept]))
                }
            } catch (e) {
                reject(e)
            }
        })
    }
    emit(eventName, value) {
        // called by the instance to notify its parent
        this.listeners.get(eventName).forEach(callback => callback(value))
    }
    refresh() {
        // all parent listeners stays intact, all child's will be refreshed
        let child;
        while (child = this.dom.lastElementChild) {
            this.dom.removeChild(child)
        }
        return this.render()
    }
    destroy() {
        let parent
        if (parent = this.dom.parentNode) parent.removeChild(this.dom)
        this.listeners = null
        this.dom = null
    }
    render() {
        // to be overwritten, default return the dom element itself
        return this.dom
    }
}
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