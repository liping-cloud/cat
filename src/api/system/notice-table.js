import request from '@/utils/request'

// 查询公告列表
export function listTable(query) {
  return request({
    url: '/system/noticeTable/list',
    method: 'get',
    params: query
  })
}

// 查询公告详细
export function getTable(id) {
  return request({
    url: '/system/noticeTable/' + id,
    method: 'get'
  })
}

// 新增公告
export function addTable(data) {
  return request({
    url: '/system/noticeTable',
    method: 'post',
    data: data
  })
}

// 修改公告
export function updateTable(data) {
  return request({
    url: '/system/noticeTable',
    method: 'put',
    data: data
  })
}

// 删除公告
export function delTable(id) {
  return request({
    url: '/system/noticeTable/' + id,
    method: 'delete'
  })
}
