;(function () {
  const host = 'http://localhost:3120'
  let settings = {
    // enabled: true,
    // useTinify: false,
    // rate: 0.3, // 此压缩率较合适，高于0.4后图片有一定失真
    // showLoading: true,
  }
  let downloadingItem

  function waiting(time) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve()
      }, time)
    })
  }

  function dataURItoBlob(dataURI) {
    let byteString
    const dataArr = dataURI.split(',')
    if (dataArr[0].indexOf('base64') >= 0) byteString = atob(dataArr[1])
    else byteString = unescape(dataURI.split(',')[1])

    const mimeString = dataArr[0].split(':')[1].split(';')[0]

    const ia = new Uint8Array(byteString.length)
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i)
    }

    return new Blob([ia], {type: mimeString})
  }

  function toggleLoading(toggle = false) {
    if (!settings.showLoading) return
    chrome.tabs.query(
      {
        active: true,
        currentWindow: true,
      },
      (tabs) => {
        const message = {
          type: toggle ? 'showLoading' : 'hideLoading',
        }
        chrome.tabs.sendMessage(tabs[0].id, message, () => {})
      }
    )
  }

  chrome.runtime.onInstalled.addListener(function () {
    chrome.storage.sync.set(settings, function () {
      console.log('安装后默认开启压缩')
    })
  })

  chrome.storage.sync.get(
    {enabled: true, rate: 0.3, useTinify: false, showLoading: true},
    function (items) {
      toggleCapture(items.enabled)
      settings = {
        ...items,
      }
    }
  )

  chrome.runtime.onMessageExternal.addListener(function (
    request,
    sender,
    sendResponse
  ) {
    if (request.type === 'MsgFromPage') {
      // 从window_hook.js传来的base64串
      settings.enabled && sendFile2Server(request.blobBase64)
      sendResponse('done')
    }
  })

  // 监听popup页面修改设置
  chrome.storage.onChanged.addListener(function (changes, namespace) {
    for (const setting in settings) {
      if (changes[setting]) {
        const {newValue} = changes[setting]
        settings[setting] = newValue
        if (setting === 'enabled') {
          toggleCapture(newValue)
        }
      }
    }
  })

  function toggleCapture(enabled) {
    chrome.downloads.onDeterminingFilename[
      enabled ? 'addListener' : 'removeListener'
    ](captureDownload)
    chrome.browserAction.setIcon({
      path: {
        32: `icons/32${enabled ? '' : '_gray'}.png`,
        64: `icons/64${enabled ? '' : '_gray'}.png`,
        128: `icons/128${enabled ? '' : '_gray'}.png`,
        256: `icons/256${enabled ? '' : '_gray'}.png`,
      },
    })
  }

  function captureDownload(downloadItem, suggestion) {
    suggestion()
    const {finalUrl, id} = downloadItem
    if (
      downloadItem.state === 'in_progress' &&
      (finalUrl.includes('figma.com') || finalUrl.includes('lanhuapp.com'))
    ) {
      chrome.downloads.cancel(id)
      downloadingItem = downloadItem
    }
  }

  async function sendFile2Server(blobBase64) {
    if (!downloadingItem) await waiting(300) // 需要等待页面捕获到下载文件
    toggleLoading(true)
    const {mime: type, filename} = downloadingItem || {}
    const file = new File([dataURItoBlob(blobBase64)], filename, {
      type,
    })
    const formData = new FormData()
    formData.append('file', file)
    formData.append('rate', settings.rate)
    formData.append('useTinify', Number(settings.useTinify))

    return fetch(`${host}/compress`, {
      method: 'POST',
      body: formData,
      responseType: 'arraybuffer',
    })
      .then((res) => res.arrayBuffer())
      .then((arraybuffer) => {
        const url = window.URL.createObjectURL(new Blob([arraybuffer], {type}))
        const link = document.createElement('a')
        link.style.display = 'none'
        link.href = url
        link.setAttribute('download', filename)
        link.click()
      })
      .catch((error) => console.error('fetch error====', error))
      .finally(() => {
        downloadingItem = null
        toggleLoading()
      })
  }
})()
