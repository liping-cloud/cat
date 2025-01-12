<template>
	<div class="app-container">
		<!-- 搜索栏 -->
		<el-form :inline="true" :model="queryParams" class="search-form">
			<el-form-item label="地区">
				<el-cascader :options="regionData" v-model="queryParams.area" size="small"></el-cascader>
			</el-form-item>
			<el-form-item label="承办方">
				<el-input v-model="queryParams.method" placeholder="请输入承办方" style="width: 300px;"></el-input>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" @click="handleSearch">查询</el-button>
				<el-button @click="handleReset">重置</el-button>
			</el-form-item>
		</el-form>

		<!-- 数据表格 -->
		<el-table :data="tableData" style="width: 100%" border stripe>
			<el-table-column prop="serialNumber" align="center" label="审核编号" min-width="120"></el-table-column>
			<el-table-column prop="region" align="center" label="地区" min-width="150"></el-table-column>
			<el-table-column prop="method" align="center" label="承办方" min-width="180"></el-table-column>
			<el-table-column prop="title" align="center" label="文章标题" min-width="250" show-overflow-tooltip></el-table-column>
			<el-table-column prop="targetReading" align="center" label="目标阅读量" min-width="120"></el-table-column>
			<el-table-column prop="phone" align="center" label="联系电话" min-width="120"></el-table-column>
			<el-table-column label="操作" align="center" min-width="200" fixed="right">
				<template slot-scope="scope">
					<el-link type="primary" @click="handleDetail(scope.row)">详情</el-link>
					<el-divider direction="vertical"></el-divider>
					<el-link type="primary" @click="handleEdit(scope.row)">编辑</el-link>
					<el-divider direction="vertical"></el-divider>
					<el-link type="success" @click="handlePass(scope.row)">通过</el-link>
					<el-divider direction="vertical"></el-divider>
					<el-link type="danger" @click="handleReject(scope.row)">不通过</el-link>
				</template>
			</el-table-column>
		</el-table>
		<el-dialog title="扫描二维码" :visible.sync="dialogVisible" width="30%" center>
			<div class="qr-code">
				<canvas ref="qrCanvas"></canvas>
				<div>手机扫码预览H5页面</div>
			</div>
			<span slot="footer" class="dialog-footer">
				<el-button type="primary" @click="dialogVisible = false">关闭</el-button>
			</span>
		</el-dialog>
	</div>
</template>

<script>
import { examineArticle, getArticleReviewList } from '@/api/system/table';
import { regionData } from 'element-china-area-data';
import QRCode from 'qrcode';

export default {
	name: 'DataManagement',
	data() {
		return {
			regionData,
			queryParams: {
				region: '',
				method: ''
			},
			regions: [
				{ value: 'zhejiang', label: '浙江/杭州/浙江' },
				{ value: 'beijing', label: '北京' },
				{ value: 'shanghai', label: '上海' }
			],
			tableData: [
				{
					serialNumber: 'SH100800',
					region: '浙江/杭州/浙江',
					method: '运营X27主题公园',
					title: 'XXXXXXXXXXXXX...',
					targetReading: '300000',
					phone: '13777433171'
				}
			],
			dialogVisible: false,
			qrCodeUrl: ''
		};
	},
	created() {

	},
	methods: {
		handleSearch() {
			console.log('搜索条件：', this.queryParams);
			// 实现搜索逻辑
			getArticleReviewList(this.queryParams).then(res => {
				if (res.code === 200) {
					this.tableData = res.rows;
				}
			});
		},
		handleReset() {
			this.queryParams.region = '';
			this.queryParams.method = '';
			// 重置后可以自动搜索
			this.handleSearch();
		},
		handleDetail(row) {
			this.generateQRCode();
		},
		async generateQRCode() {
			try {
				// 替换为您的实际API端点
				this.qrCodeUrl = 'xxx.png';
				this.dialogVisible = true;
				this.$nextTick(() => {
					QRCode.toCanvas(this.$refs.qrCanvas, this.qrCodeUrl, { width: 200 }, error => {
						if (error) console.error('Error generating QR code', error);
					});
				});
			} catch (error) {
				console.error('获取URL失败:', error);
				this.$message.error('生成二维码失败，请稍后重试');
			}
		},
		handleEdit(row) {
			this.$router.push({
				path: '/article/editArticleTask',
				query: { id: row.id }
			});
		},
		handlePass(row) {
			console.log('通过：', row);
			this.$confirm(`确定通过编号为${row.code}的文章码？`, '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).then(() => {
				examineArticle({
					id: row.id,
					articleExamine: ''
				}).then(res => {
					if (res.code == 200) {
						this.$message.success('审核成功');
						this.handleSearch();
					}
				});
			});
		},
		handleReject(row) {
			this.$confirm(`确定驳回编号为${row.code}的文章码？`, '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).then(() => {
				examineArticle({
					id: row.id,
					articleExamine: ''
				}).then(res => {
					if (res.code == 200) {
						this.$message.success('审核成功');
						this.handleSearch();
					}
				});
			});
		}
	}
};
</script>

<style scoped>
.search-form {
	display: flex;
	align-items: center;
}

.el-divider--vertical {
	margin: 0 8px;
}

/* 调整表格内链接的样式 */
.el-link {
	font-size: 13px;
}

.el-link.el-link--danger {
	color: #F56C6C;
}

.el-link.el-link--danger:hover {
	color: #f78989;
}

/* 表格样式优化 */
.el-table {
	margin-top: 20px;
}

.el-table th {
	background-color: #f5f7fa;
	color: #606266;
}

.el-table td, .el-table th {
	padding: 12px 0;
}

.qr-code {
	background-color: white;
	padding: 20px;
	border-radius: 8px;
	box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
	text-align: center;
}
</style>
