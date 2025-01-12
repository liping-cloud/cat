import request from '@/utils/request';

// 查询基础图片设置列表
export function listTable(query) {
	return request({
		url: '/system/baseTable/list',
		method: 'get',
		params: query
	});
}

// 查询基础图片设置详细
export function getTable(id) {
	return request({
		url: '/system/baseTable/' + id,
		method: 'get'
	});
}

// 新增基础图片设置
export function addTable(data) {
	return request({
		url: '/system/baseTable',
		method: 'post',
		data: data
	});
}

// 修改基础图片设置
export function updateTable(data) {
	return request({
		url: '/system/baseTable',
		method: 'put',
		data: data
	});
}

// 删除基础图片设置
export function delTable(id) {
	return request({
		url: '/system/baseTable/' + id,
		method: 'delete'
	});
}
