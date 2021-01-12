;(function () {
  const warningRate = 0.6
  const toggleEle = document.querySelector('#compressToggle')
  const tinyPngEle = document.querySelector('#compressTinypng')
  const rateEle = document.querySelector('#compressRate')
  const rateValueEle = document.querySelector('#rateValue')
  const toggleClass = (ele, enabled, className = 'on', callback) => {
    ele.classList[enabled ? 'add' : 'remove'](className)
    callback && callback()
  }

  const rateValueWatcher = (val) => {
    rateValueEle.innerHTML = val
    rateValueEle.style.color = val >= warningRate ? '#f00' : 'unset'
  }

  chrome.storage.sync.get(
    {enabled: true, useTinify: false, rate: 0.3, notify: true},
    function (items) {
      toggleClass(toggleEle, items.enabled)
      toggleClass(tinyPngEle, items.useTinify)
      rateEle.setAttribute('value', items.rate)
      rateValueWatcher(items.rate)
      !items.enabled || items.useTinify
        ? rateEle.setAttribute('disabled', true)
        : rateEle.removeAttribute('disabled')

      toggleEle.addEventListener('click', () => {
        items.enabled = !items.enabled
        toggleClass(toggleEle, items.enabled, 'on', () => {
          items.enabled && !items.useTinify
            ? rateEle.removeAttribute('disabled')
            : rateEle.setAttribute('disabled', true)
          toggleClass(tinyPngEle, !items.enabled, 'disabled')
        })
        chrome.storage.sync.set(items) // background.js监听storage变更
      })

      tinyPngEle.addEventListener('click', () => {
        if (items.enabled) {
          items.useTinify = !items.useTinify
          toggleClass(tinyPngEle, items.useTinify, 'on', () => {
            items.useTinify
              ? rateEle.setAttribute('disabled', true)
              : rateEle.removeAttribute('disabled')
          })
          chrome.storage.sync.set(items) // background.js监听storage变更
        }
      })

      rateEle.addEventListener('change', (e) => {
        const {value} = e.target
        items.rate = value
        rateValueWatcher(value)
        chrome.storage.sync.set(items)
      })
    }
  )
})()
