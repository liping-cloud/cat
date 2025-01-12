<template>
	<div class="app-container">
		<el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
			<el-form-item label="文章标题" prop="articleTitle">
				<el-input v-model="queryParams.articleTitle" placeholder="请输入文章标题" clearable @keyup.enter.native="handleQuery" />
			</el-form-item>
			<el-form-item label="地区" prop="area">
				<el-cascader :options="regionData" v-model="queryParams.area" size="small"></el-cascader>
			</el-form-item>
			<el-form-item label="承办方" prop="organizer">
				<el-input v-model="queryParams.organizer" placeholder="请输入承办方" clearable @keyup.enter.native="handleQuery" />
			</el-form-item>

			<el-form-item>
				<el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
				<el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
			</el-form-item>
		</el-form>

		<el-row :gutter="10" class="mb8">
			<el-col :span="1.5">
				<el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd">新增</el-button>
			</el-col>
<!--			<el-col :span="1.5">-->
<!--				<el-button type="success" plain icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate">修改 </el-button>-->
<!--			</el-col>-->
<!--			<el-col :span="1.5">-->
<!--				<el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete"> 删除 </el-button>-->
<!--			</el-col>-->
<!--			<el-col :span="1.5">-->
<!--				<el-button type="warning" plain icon="el-icon-download" size="mini" @click="handleExport">导出</el-button>-->
<!--			</el-col>-->
			<right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
		</el-row>

		<el-table v-loading="loading" :data="tableList" @selection-change="handleSelectionChange" border stripe>
			<el-table-column label="文章编号" align="center" prop="id" />
			<el-table-column label="地区" align="center">
				<template slot-scope="scope">
					<span>{{ scope.row.province }}{{ scope.row.City }}{{ scope.row.area }}</span>
				</template>
			</el-table-column>
			<el-table-column label="承办方" align="center" prop="organizer" />
			<el-table-column label="文章标题" align="center" prop="articleTitle" />
			<el-table-column label="当前阅读量" align="center" prop="readingVolume" />
			<el-table-column label="目标阅读量" align="center" prop="targetNum" />
			<el-table-column label="访问人数" align="center" prop="numberVisitors" />
			<el-table-column label="转发量" align="center" prop="forwardNum" />
			<el-table-column label="用户信息表外键" align="center" prop="userId" />
			<el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="220">
				<template slot-scope="scope">
					<el-button size="mini" type="text" @click="handleDetail(scope.row)">详情</el-button>
					<el-button size="mini" type="text" @click="handleUpdate(scope.row)">编辑</el-button>
					<el-button size="mini" type="text" @click="handleChangeState(scope.row)">
						{{ scope.row.activityState == 0 ? '下架' : '上架' }}
					</el-button>
					<el-button size="mini" type="text" @click="handleIncreaseTarget(scope.row)">增加目标值</el-button>
				</template>
			</el-table-column>
		</el-table>

		<pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

		<el-dialog title="扫描二维码" :visible.sync="dialogVisible" width="30%" center>
			<div class="qr-code">
				<canvas ref="qrCanvas"></canvas>
				<div>手机扫码预览H5页面</div>
			</div>
			<span slot="footer" class="dialog-footer">
				<el-button type="primary" @click="dialogVisible = false">关闭</el-button>
			</span>
		</el-dialog>
		<el-dialog title="扫描二维码支付" :visible.sync="paymentDialogVisible" width="30%" center>
			<div v-loading="loading" class="qr-code">
				<canvas ref="paymentQrCanvas"></canvas>
				<div>请使用微信或支付宝扫码支付</div>
			</div>
			<span slot="footer" class="dialog-footer">
				<el-button @click="paymentDialogVisible = false">取消</el-button>
				<el-button type="primary" @click="confirmPayment">确认已支付</el-button>
			</span>
		</el-dialog>
	</div>
</template>

<script>
import { listTable, getTable, delTable, addTable, updateTable, offShelf, checkPaymentStatus, generatePaymentQRCode } from '@/api/system/list';
import { provinceAndCityData, pcTextArr, regionData, pcaTextArr, codeToText } from 'element-china-area-data';
import QRCode from 'qrcode';

export default {
	name: 'Table',
	data() {
		return {
			regionData,
			// 遮罩层
			loading: true,
			// 选中数组
			ids: [],
			// 非单个禁用
			single: true,
			// 非多个禁用
			multiple: true,
			// 显示搜索条件
			showSearch: true,
			// 总条数
			total: 0,
			// 文章任务表格数据
			tableList: [],
			// 弹出层标题
			title: '',
			// 是否显示弹出层
			open: false,
			// 查询参数
			queryParams: {
				pageNum: 1,
				pageSize: 10,
				articleTitle: null,
				organizer: null,
				articleContent: null,
				forwardNum: null,
				forRules: null,
				articleState: null,
				articleMode: null,
				targetNum: null,
				articleExamine: null,
				userId: null,
				createTime: null,
				province: null,
				City: null,
				area: null,
				longitude: null,
				latitude: null,
				endTime: null
			},
			// 表单参数
			form: {},
			// 表单校验
			rules: {},
			dialogVisible: false,
			qrCodeUrl: '',
			paymentDialogVisible: false,
			paymentQrCodeUrl: ''
		};
	},
	created() {
		this.getList();
	},
	methods: {
		/** 增加目标值按钮操作 */
		handleIncreaseTarget(row) {
			this.$prompt('请输入要增加的目标值', '增加目标值', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				inputPattern: /^[1-9]\d*$/,
				inputErrorMessage: '请输入正整数'
			})
				.then(({ value }) => {
					this.getPaymentQRCode(row.id, value);
				})
				.catch(() => {
					this.$message({
						type: 'info',
						message: '取消增加目标值'
					});
				});
		},
		getPaymentQRCode(id, value) {
			generatePaymentQRCode(id, value)
				.then(response => {
					if (response.code === 200) {
						this.paymentQrCodeUrl = response.data.qrCodeUrl;
						this.paymentDialogVisible = true;
						this.$nextTick(() => {
							QRCode.toCanvas(this.$refs.paymentQrCanvas, this.paymentQrCodeUrl, { width: 200 }, error => {
								if (error) console.error('Error generating QR code', error);
							});
						});
					} else {
						this.$message.error(response.msg || '生成支付二维码失败');
					}
				})
				.catch(error => {
					console.error('生成支付二维码失败:', error);
					this.$message.error('生成支付二维码失败，请稍后重试');
				});
		},
		confirmPayment() {
			checkPaymentStatus(this.paymentQrCodeUrl)
				.then(response => {
					if (response.code === 200 && response.data.paid) {
						this.$message.success('支付成功，目标值已增加');
						this.paymentDialogVisible = false;
						this.getList(); // 刷新列表
					} else {
						this.$message.warning('支付未完成，请稍后再试');
					}
				})
				.catch(error => {
					console.error('确认支付状态失败:', error);
					this.$message.error('确认支付状态失败，请稍后重试');
				});
		},
		async generateQRCode() {
			try {
				// 替换为您的实际API端点
				this.qrCodeUrl = 'xxx.png';
				this.dialogVisible = true;
				console.log(QRCode);
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
		/** 查询文章任务列表 */
		getList() {
			this.loading = true;
			let data = Object.assign({}, this.queryParams);
			delete data.area;
			listTable(data).then(response => {
				this.tableList = response.rows;
				this.total = response.total;
				this.loading = false;
			});
		},
		// 取消按钮
		cancel() {
			this.open = false;
			this.reset();
		},
		// 表单重置
		reset() {
			this.form = {
				id: null,
				articleTitle: null,
				organizer: null,
				articleContent: null,
				forwardNum: null,
				forRules: null,
				articleState: null,
				articleMode: null,
				targetNum: null,
				articleExamine: null,
				userId: null,
				createTime: null,
				province: null,
				City: null,
				area: null,
				longitude: null,
				latitude: null,
				endTime: null
			};
			this.resetForm('form');
		},
		/** 搜索按钮操作 */
		handleQuery() {
			this.queryParams.pageNum = 1;
			this.getList();
		},
		/** 重置按钮操作 */
		resetQuery() {
			this.form.area = null;
			this.resetForm('queryForm');
			this.handleQuery();
		},
		// 多选框选中数据
		handleSelectionChange(selection) {
			this.ids = selection.map(item => item.id);
			this.single = selection.length !== 1;
			this.multiple = !selection.length;
		},
		/** 新增按钮操作 */
		handleAdd() {
			this.$router.push({ path: '/article/editArticleTask' });
		},
		handleChangeState(row) {
			this.$confirm('是否确认修改 "' + row.articleTitle + '" 文章任务状态?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).then(() => {
				offShelf({
					id: row.id,
					articleState: row.articleState === '0' ? '1' : '0'
				}).then(response => {
					this.$modal.msgSuccess('修改成功');
					this.getList();
				});
			});
		},
		handleDetail(row) {
			this.generateQRCode();
		},
		/** 修改按钮操作 */
		handleUpdate(row) {
			this.$router.push({
				path: '/article/editArticleTask',
				query: { id: row.id }
			});
		},
		/** 提交按钮 */
		submitForm() {
			this.$refs['form'].validate(valid => {
				if (valid) {
					if (this.form.id != null) {
						updateTable(this.form).then(response => {
							this.$modal.msgSuccess('修改成功');
							this.open = false;
							this.getList();
						});
					} else {
						addTable(this.form).then(response => {
							this.$modal.msgSuccess('新增成功');
							this.open = false;
							this.getList();
						});
					}
				}
			});
		},
		/** 删除按钮操作 */
		handleDelete(row) {
			const ids = row.id || this.ids;
			this.$modal
				.confirm('是否确认删除文章任务编号为"' + ids + '"的数据项？')
				.then(function () {
					return delTable(ids);
				})
				.then(() => {
					this.getList();
					this.$modal.msgSuccess('删除成功');
				})
				.catch(() => {});
		},
		/** 导出按钮操作 */
		handleExport() {
			this.download(
				'system/table/export',
				{
					...this.queryParams
				},
				`table_${new Date().getTime()}.xlsx`
			);
		}
	}
};
</script>
<style>
.qr-code {
	background-color: white;
	padding: 20px;
	border-radius: 8px;
	box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
	text-align: center;
}
</style>
