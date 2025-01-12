import request from '@/utils/request';

// 查询文章任务列表
export function listTable(query) {
	return request({
		url: '/system/articleTask/list',
		method: 'get',
		params: query
	});
}

// 查询文章任务详细
export function getTable(id) {
	return request({
		url: '/system/articleTask/' + id,
		method: 'get'
	});
}

// 新增文章任务
export function addTable(data) {
	return request({
		url: '/system/articleTask',
		method: 'post',
		data: data
	});
}

// 修改文章任务
export function updateTable(data) {
	return request({
		url: '/system/articleTask',
		method: 'put',
		data: data
	});
}

// 删除文章任务
export function delTable(id) {
	return request({
		url: '/system/articleTask/' + id,
		method: 'delete'
	});
}

export function getUserInfoByPhone(params) {
	return request({
		url: '/system/basicTable/getUserInfo',
		method: 'get',
		params
	});
}

export function createCodePayOrder(data) {
	return request({
		url: '/system/oracle/scanCodePayOrder',
		method: 'post',
		data
	});
}

export function getBaseCost(params) {
	return request({
		url: '/system/baseDataTable/getBaseCost',
		method: 'get',
		params
	});
}
export function offShelf(data) {
	return request({
		url: '/system/articleTask/offShelf',
		method: 'post',
		data
	});
}

export function checkPaymentStatus() {}
export function generatePaymentQRCode() {}
