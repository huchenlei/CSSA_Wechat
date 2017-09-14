const _$ = (selector, container = document) => container.querySelector(selector)

// Create a new HTMLElement, a syntax sugar for document.createElement
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

// A minimal Web component with Vue-like data binding
class Component extends Object {
    // upon instantiation, create the root html element as this.dom
    constructor(...args) {
        super();
        this.dom = new$(...args)
        // the listeners will get populated when other code calls the listen() method
        this.listeners = new Map()
    }
    // register an eventListener for this component, event body is passed through a Promise
    listen(eventName) {
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
    // emit an event, trigger all registered functions in this.listeners of the emitted event
    emit(eventName, value) {
        this.listeners.get(eventName).forEach(callback => callback(value))
    }
    // recreate all the children
    refresh() {
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
    // to be overwritten, default return the dom element itself
    render() {
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