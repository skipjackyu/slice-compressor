const fs = require('fs')
const imagemin = require('imagemin')
const imageminMozjpeg = require('imagemin-mozjpeg')
const imageminPngquant = require('imagemin-pngquant')
const AdmZip = require('adm-zip')
const tinify = require('tinify') // 调用tinify 的api延迟较高

tinify.key = '' // 替换成自己的key

const getOpts = (rate) => ({
  // destination: 'temp/compressed', // 此参数为空返回的是buffer 列表，不在磁盘创建文件
  plugins: [
    imageminMozjpeg({
      quality: 70, // jpg设置70比较合理
    }),
    imageminPngquant({
      quality: [rate, rate + 0.1 > 1 ? 1 : rate + 0.1],
    }),
  ],
})

const compressImage = async (files, {rate = 0.5} = {}) => {
  const res = await imagemin(files, getOpts(rate))
  return res[0].data
}

const compressZip = async (file, {rate = 0.5, useTinify}) =>
  new Promise(async (resolve, reject) => {
    try {
      const zip = new AdmZip(file.path)
      const zipEntries = zip.getEntries()
      const rtZip = new AdmZip()
      for (const zipEntry of zipEntries) {
        // forEach循环和异步一起使用有bug
        const imgBuffer = zipEntry.getData()
        const compressedBuffer = useTinify
          ? await tinifyFromBuffer(imgBuffer)
          : await imagemin.buffer(imgBuffer, getOpts(rate))
        rtZip.addFile(zipEntry.entryName, compressedBuffer, '')
      }
      resolve(rtZip.toBuffer())
    } catch (error) {
      console.error(error)
      reject(error)
    }
  })

const tinifyFromFile = (src) =>
  new Promise((resolve, reject) => {
    try {
      tinify.fromFile(src).toBuffer((error, resultData) => {
        if (error) {
          reject(error)
        } else {
          resolve(resultData)
        }
      })
    } catch (error) {
      reject(error)
    }
  })

const tinifyFromBuffer = (sourceData) =>
  new Promise((resolve, reject) => {
    tinify.fromBuffer(sourceData).toBuffer(function (err, resultData) {
      if (err) reject(err)
      resolve(resultData)
    })
  })

const compressFile = ({file, rate, useTinify}) => {
  const {type, path} = file
  const rateNum = 1 - rate
  // 不是图片也不是zip包就直接返回原文件
  if (!type.includes('image') && !type.includes('zip')) {
    return fs.readFileSync(path)
  }
  if (useTinify != 1) {
    if (type === 'application/zip') {
      return compressZip(file, {rate: rateNum})
    } else {
      return compressImage([path], {rate: rateNum})
    }
  } else {
    if (type === 'application/zip') {
      return compressZip(file, {useTinify})
    } else {
      return tinifyFromFile(path)
    }
  }
}

module.exports = {
  compressFile,
}
