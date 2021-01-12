;(function () {
  let _cou = window.URL.createObjectURL
  const send2Extension = (blobBase64) => {
    const targetExtensionId = document
      .querySelector('#slice-compressor-id')
      .getAttribute('data-id')
    chrome.runtime.sendMessage(
      targetExtensionId,
      {
        type: 'MsgFromPage',
        blobBase64,
      },
      null,
      (res) => {
        console.log(res)
      }
    )
  }

  window.URL.createObjectURL = function (obj) {
    // 避免拦截其他类型文件
    if (obj.size && (obj.type.includes('zip') || obj.type.includes('image'))) {
      const reader = new FileReader()
      reader.onload = function (e) {
        send2Extension(e.target.result)
      }
      reader.readAsDataURL(obj)
    }

    const url = _cou(obj)
    return url
  }
})()
