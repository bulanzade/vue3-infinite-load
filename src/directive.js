let instance = null

const throttle = function (fn, delay) {
    let now, lastExec, timer, content, args;

    const execute = function () {
        fn.apply(content, args)
        lastExec = Date.now()
    }

    return function (...theArgs) {
        content = this
        args = theArgs

        now = Date.now()

        if (timer) {
            clearTimeout(timer)
            timer = null
        }

        if (lastExec) {
            const diff = delay - (now - lastExec)
            if (diff < 0) {
                execute()
            } else {
                timer = setTimeout(() => {
                    execute();
                }, diff)
            }
        } else {
            execute()
        }
    }
}

const getScrollTop = function (element) {
    if (element === window) {
        return Math.max(window.scrollY || 0, document.documentElement.scrollTop)
    }
    return element.scrollTop
}

const getVisibleHeight = function (element) {
    if (element === window) {
        return document.documentElement.clientHeight
    }
    return element.clientHeight
}

const getElementTop = function (element) {
    if (element === window) {
        return getScrollTop(window)
    }
    return element.getBoundingClientRect().top + getScrollTop(window)
}

const getScrollEventTarget = function (element) {
    let currentNode = element
    while (currentNode && currentNode.tagName !== 'HTML' && currentNode.tagName !== 'BODY' && currentNode.nodeType === 1) {
        const overflowY = getComputedStyle(currentNode).overflowY
        if (overflowY === 'scroll' || overflowY === 'auto') {
            return currentNode
        }
        currentNode = currentNode.parentNode
    }
    return window
}

const isAttached = function (element) {
    let currentNode = element.parentNode
    while (currentNode) {
        if (currentNode.tagName === 'HTML') {
            return true
        }
        if (currentNode.nodeType === 11) {
            return false
        }
        currentNode = currentNode.parentNode
    }
    return false
}

const doBind = function () {
    if (this.binded) { return }
    this.binded = true

    const directive = this
    const element = directive.el

    const throttleDelayExpr = element.getAttribute('infinite-load-throttle-delay')
    let throttleDelay = 200
    if (throttleDelayExpr) {
        throttleDelay = Number(directive.vm[throttleDelayExpr] || throttleDelayExpr)
        if (isNaN(throttleDelay) || throttleDelay < 0) {
            throttleDelay = 200
        }
    }
    directive.throttleDelay = throttleDelay

    directive.scrollEventTarget = getScrollEventTarget(element)
    directive.scrollListener = throttle(doCheck.bind(directive), directive.throttleDelay)
    directive.scrollEventTarget.addEventListener('scroll', directive.scrollListener)

    const disabledExpr = element.getAttribute('infinite-load-disabled')
    let disabled = false
    if (disabledExpr) {
        directive.vm.$watch(disabledExpr, function(value) {
            directive.disabled = value;
            if (!value && directive.immediateCheck) {
                doCheck.call(directive)
            }
        })
        disabled = Boolean(directive.vm[disabledExpr] || disabledExpr)
    }
    directive.disabled = disabled;

    const reversedExpr = element.getAttribute('infinite-load-reversed')
    let reversed = false
    if (reversedExpr) {
        reversed = Boolean(directive.vm[reversedExpr] || reversedExpr)
    }
    directive.reversed = reversed

    const distanceExpr = element.getAttribute('infinite-load-distance')
    let distance = 0
    if (distanceExpr) {
        distance = Number(directive.vm[distanceExpr] || distanceExpr)
        if (isNaN(distance)) {
            distance = 0
        }
    }
    directive.distance = distance

    const immediateCheckExpr = element.getAttribute('infinite-load-immediate-check')
    let immediateCheck = true
    if (immediateCheckExpr) {
        immediateCheck = Boolean(directive.vm[immediateCheckExpr]);
    }
    directive.immediateCheck = immediateCheck;

    if (immediateCheck || true) {
        doCheck.call(directive);
    }

    const eventName = element.getAttribute('infinite-load-listen-for-event');
    if (eventName) {
        directive.vm.$on(eventName, function() {
            doCheck.call(directive)
        })
    }
}

const doCheck = function (force) {
    const scrollEventTarget = this.scrollEventTarget
    const element = this.el
    const distance = this.distance
    const reversed = this.reversed

    if (force !== true && this.disabled) { return }
    const viewportScrollTop = getScrollTop(scrollEventTarget)
    const viewportBottom = viewportScrollTop + getVisibleHeight(scrollEventTarget)

    let shouldTrigger = false

    if (scrollEventTarget === element) {
        if (reversed) {
            shouldTrigger = viewportScrollTop <= distance
        } else {
            shouldTrigger = scrollEventTarget.scrollHeight - viewportBottom <= distance
        }
    } else {
        const elementBottom = getElementTop(element) - getElementTop(scrollEventTarget) + element.offsetHeight + viewportScrollTop

        if (reversed) {
            shouldTrigger = getElementTop(scrollEventTarget) - getElementTop(element) <= distance
        } else {
            shouldTrigger = viewportBottom + distance >= elementBottom
        }
    }

    if (shouldTrigger && this.expression) {
        this.expression()
    }
}

export default {
    mounted(el, binding, vnode) {
        instance = {
            el,
            vm: binding.instance,
            expression: binding.value
        }

        instance.vm.$nextTick(function () {
            if (isAttached(el)) {
                doBind.call(instance)
            }

            instance.bindTryCount = 0

            const tryBind = function () {
                if (instance.bindTryCount > 10) { return }
                instance.bindTryCount++
                if (isAttached(el)) {
                    doBind.call(instance)
                } else {
                    setTimeout(tryBind, 50)
                }
            }

            tryBind()

        })
    },
    beforeUnmount(el, binding, vnode) {

    },
    unmounted(el, binding, vnode) {
        if (el && instance && instance.scrollEventTarget) {
            instance.scrollEventTarget.removeEventListener('scroll', instance.scrollListener)
        }
    }
}