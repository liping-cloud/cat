<template>
	<div class="app-container">
		<el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
			<el-form-item>
				<el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
			</el-form-item>
		</el-form>

		<el-row :gutter="10" class="mb8">
			<el-col :span="1.5">
				<el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd">新增</el-button>
			</el-col>
			<right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
		</el-row>

		<el-table v-loading="loading" :data="tableList" @selection-change="handleSelectionChange" border stripe>
			<el-table-column type="selection" width="55" align="center" />
			<el-table-column label="ID" align="center" prop="id" />
			<el-table-column label="图片" align="center" prop="bannerImg">
				<template slot-scope="scope">
					<el-image :src="imageBaseUrl + scope.row.bannerImg" style="width: 50px; height: 50px" :preview-src-list="[imageBaseUrl + scope.row.bannerImg]" />
				</template>
			</el-table-column>
			<el-table-column label="排序" align="center" prop="imgSort" />
			<el-table-column label="操作" align="center" class-name="small-padding fixed-width">
				<template slot-scope="scope">
					<el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)" v-hasPermi="['system:table:remove']"> 删除 </el-button>
				</template>
			</el-table-column>
		</el-table>

		<pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

		<!-- 添加或修改轮播广告对话框 -->
		<el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
			<el-form ref="form" :model="form" :rules="rules" label-width="80px">
				<el-form-item label="图片" prop="bannerImg">
					<ImageUpload ref="imageUpload" :limit="1" />
				</el-form-item>
				<el-form-item label="排序" prop="imgSort">
					<el-input v-model="form.imgSort" placeholder="请输入图片排序" />
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button type="primary" @click="submitForm">确 定</el-button>
				<el-button @click="cancel">取 消</el-button>
			</div>
		</el-dialog>
	</div>
</template>

<script>
import { listTable, getTable, delTable, addTable, updateTable } from '@/api/system/swiper';
import ImageUpload from '@/components/ImageUpload/index.vue';

export default {
	name: 'Table',
	components: { ImageUpload },
	data() {
		return {
			imageBaseUrl: process.env.VUE_APP_BASE_API,
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
			// 轮播广告表格数据
			tableList: [],
			// 弹出层标题
			title: '',
			// 是否显示弹出层
			open: false,
			// 查询参数
			queryParams: {
				pageNum: 1,
				pageSize: 10,
				bannerImg: null,
				imgSort: null
			},
			// 表单参数
			form: {},
			// 表单校验
			rules: {}
		};
	},
	created() {
		console.log('this.imageBaseUrl', this.imageBaseUrl);
		this.getList();
	},
	methods: {
		showBigImage(image) {
			this.$imagePreview.show(image);
		},
		/** 查询轮播广告列表 */
		getList() {
			this.loading = true;
			listTable(this.queryParams).then(response => {
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
				bannerImg: null,
				imgSort: null
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
			this.reset();
			this.open = true;
			this.title = '添加轮播广告';
		},
		/** 修改按钮操作 */
		handleUpdate(row) {
			this.reset();
			const id = row.id || this.ids;
			getTable(id).then(response => {
				this.form = response.data;
				this.open = true;
				this.title = '修改轮播广告';
			});
		},
		/** 提交按钮 */
		submitForm() {
			if (this.$refs.imageUpload.fileList.length === 1) {
				this.form.bannerImg = this.$refs.imageUpload.fileList[0].name;
			}
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
				.confirm('是否确认删除轮播广告编号为"' + ids + '"的数据项？')
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
