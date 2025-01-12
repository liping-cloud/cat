import request from '@/utils/request';

// 查询提现申请列表
export function listTable(query) {
	return request({
		url: '/system/applycashoutTable/list',
		method: 'get',
		params: query
	});
}

// 查询提现申请详细
export function getTable(id) {
	return request({
		url: '/system/applycashoutTable/' + id,
		method: 'get'
	});
}

// 新增提现申请
export function addTable(data) {
	return request({
		url: '/system/applycashoutTable',
		method: 'post',
		data: data
	});
}

// 修改提现申请
export function updateTable(data) {
	return request({
		url: '/system/applycashoutTable',
		method: 'put',
		data: data
	});
}

// 删除提现申请
export function delTable(id) {
	return request({
		url: '/system/applycashoutTable/' + id,
		method: 'delete'
	});
}
export function applycashout(data) {
	return request({
		url: '/system/applycashoutTable/applycashout',
		method: 'post',
		data
	});
}
export function setBaseSetting(data) {
	return request({
		url: '/system/baseDataTable/updateBaseCost',
		method: 'post',
		data
	});
}
export function getBaseSetting(data) {
	return request({
		url: '/system/baseDataTable/getBaseCost',
		method: 'post',
		data
	});
}
