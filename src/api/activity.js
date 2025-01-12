import request from '@/utils/request';

// 查询h5活动列表
export function listTable(query) {
	return request({
		url: '/system/activityTable/list',
		method: 'get',
		params: query
	});
}

// 查询h5活动详细
export function getActivity(id) {
	return request({
		url: '/system/activityTable/' + id,
		method: 'get'
	});
}

// 新增h5活动
export function addActivity(data) {
	return request({
		url: '/system/activityTable',
		method: 'post',
		data: data
	});
}

// 修改h5活动
export function updateActivity(data) {
	return request({
		url: '/system/activityTable',
		method: 'put',
		data: data
	});
}

// 删除h5活动
export function delTable(id) {
	return request({
		url: '/system/table/' + id,
		method: 'delete'
	});
}
