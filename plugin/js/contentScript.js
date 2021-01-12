;(function () {
  let loadingContainer
  function injectScript(file, node) {
    const holder = document.querySelector(node)
    const s = document.createElement('script')
    s.setAttribute('type', 'text/javascript')
    s.setAttribute('src', file)
    holder.appendChild(s)
  }
  // 页面和插件通信需要拿到插件id
  function injectExtId() {
    const id = chrome.runtime.id
    const ele = document.createElement('div')
    ele.setAttribute('id', 'slice-compressor-id')
    ele.setAttribute('data-id', id)
    document.querySelector('body').appendChild(ele)
  }
  function injectLoadingEle() {
    const cssText = `
.SliceCompressor {
  display: flex;
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: rgba(0,0,0, 0.06);
  pointer-events: none;
  z-index: 1000;
}
.SliceCompressor__Loading
{
    margin: auto;
    position: relative;
    width: 50px;
    perspective: 200px;
}
.SliceCompressor__Loading::before,
.SliceCompressor__Loading::after
{
    position: absolute;
    width: 25px;
    height: 25px;
    content: '';
    animation: jumping .5s infinite alternate;
    background: #FFE92F;
}
.SliceCompressor__Loading::before
{
    left: 0;
}
.SliceCompressor__Loading::after
{
    right: 0;
    animation-delay: .15s;
}
@keyframes jumping
{
    0%
    {
      transform: scale(1.0) translateY(0px) rotateX(0deg);
      box-shadow: 0 0 0 rgba(0,0,0,0);
    }
    100%
    {
      transform: scale(1.2) translateY(-25px) rotateX(45deg);
      background: #FF966C;
      box-shadow: 0 25px 40px rgb(255,255,255);
    }
}
.hidden {
  display: none !important;
}
    `
    loadingContainer = document.createElement('div')
    const loading = document.createElement('div')
    const style = document.createElement('style')
    const textNode = document.createTextNode(cssText)
    style.appendChild(textNode)
    loadingContainer.setAttribute('class', 'SliceCompressor hidden')
    loading.setAttribute('class', 'SliceCompressor__Loading')
    loadingContainer.appendChild(loading)
    document.querySelector('head').appendChild(style)
    document.querySelector('body').appendChild(loadingContainer)
  }
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'showLoading') {
      if (!loadingContainer) {
        injectLoadingEle()
      }
      loadingContainer.classList.remove('hidden')
    } else if (request.type === 'hideLoading') {
      loadingContainer.classList.add('hidden')
    }
  })

  injectScript(chrome.extension.getURL('/js/window_hook.js'), 'body')
  injectExtId()
  injectLoadingEle()
})()
