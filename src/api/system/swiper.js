import request from '@/utils/request'

// 查询轮播广告列表
export function listTable(query) {
  return request({
    url: '/system/table/list',
    method: 'get',
    params: query
  })
}

// 查询轮播广告详细
export function getTable(id) {
  return request({
    url: '/system/table/' + id,
    method: 'get'
  })
}

// 新增轮播广告
export function addTable(data) {
  return request({
    url: '/system/table',
    method: 'post',
    data: data
  })
}

// 修改轮播广告
export function updateTable(data) {
  return request({
    url: '/system/table',
    method: 'put',
    data: data
  })
}

// 删除轮播广告
export function delTable(id) {
  return request({
    url: '/system/table/' + id,
    method: 'delete'
  })
}
