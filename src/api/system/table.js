import request from '@/utils/request';

// 查询用户信息列表
export function listBasicTable(query) {
	return request({
		url: '/system/basicTable/list',
		method: 'get',
		params: query
	});
}

// 查询用户信息详细
export function getBasicTable(id) {
	return request({
		url: '/system/basicTable/' + id,
		method: 'get'
	});
}

// 新增用户信息
export function addBasicTable(data) {
	return request({
		url: '/system/basicTable',
		method: 'post',
		data: data
	});
}

// 修改用户信息
export function updateBasicTable(data) {
	return request({
		url: '/system/basicTable',
		method: 'put',
		data: data
	});
}

// 删除用户信息
export function delBasicTable(id) {
	return request({
		url: '/system/basicTable/' + id,
		method: 'delete'
	});
}

export function getArticleReviewList(){
	return request({
		url: '/system/articleReview/list',
		method: 'get'
	});
}
export function examineArticle(data){
	return request({
		url: '/system/articleReview/examine',
		method: 'post',
		data
	});
}
