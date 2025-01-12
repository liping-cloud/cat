<template>
	<div class="app-container">
		<el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
			<el-form-item label="首页广告图" prop="adImg">
				<el-input v-model="queryParams.adImg" placeholder="请输入首页广告图" clearable @keyup.enter.native="handleQuery" />
			</el-form-item>
			<el-form-item label="首页广告链接" prop="adIndex">
				<el-input v-model="queryParams.adIndex" placeholder="请输入首页广告链接" clearable @keyup.enter.native="handleQuery" />
			</el-form-item>
			<el-form-item label="合伙人展示图" prop="brandImg">
				<el-input v-model="queryParams.brandImg" placeholder="请输入合伙人展示图" clearable @keyup.enter.native="handleQuery" />
			</el-form-item>
			<el-form-item label="发布时间" prop="createTime">
				<el-date-picker clearable v-model="queryParams.createTime" type="date" value-format="yyyy-MM-dd" placeholder="请选择发布时间"> </el-date-picker>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
				<el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
			</el-form-item>
		</el-form>

		<el-row :gutter="10" class="mb8">
			<el-col :span="1.5">
				<el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd" v-hasPermi="['system:table:add']">新增</el-button>
			</el-col>
			<el-col :span="1.5">
				<el-button type="success" plain icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate" v-hasPermi="['system:table:edit']">修改</el-button>
			</el-col>
			<el-col :span="1.5">
				<el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete" v-hasPermi="['system:table:remove']">删除</el-button>
			</el-col>
			<el-col :span="1.5">
				<el-button type="warning" plain icon="el-icon-download" size="mini" @click="handleExport" v-hasPermi="['system:table:export']">导出</el-button>
			</el-col>
			<right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
		</el-row>

		<el-table v-loading="loading" :data="tableList" @selection-change="handleSelectionChange" stripe border>
			<el-table-column type="selection" width="55" align="center" />
			<el-table-column label="${comment}" align="center" prop="id" />
			<el-table-column label="首页广告图" align="center" prop="adImg" />
			<el-table-column label="首页广告链接" align="center" prop="adIndex" />
			<el-table-column label="合伙人展示图" align="center" prop="brandImg" />
			<el-table-column label="发布时间" align="center" prop="createTime" width="180">
				<template slot-scope="scope">
					<span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
				</template>
			</el-table-column>
			<el-table-column label="操作" align="center" class-name="small-padding fixed-width">
				<template slot-scope="scope">
					<el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:table:edit']">修改</el-button>
					<el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)" v-hasPermi="['system:table:remove']">删除</el-button>
				</template>
			</el-table-column>
		</el-table>

		<pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

		<!-- 添加或修改基础图片设置对话框 -->
		<el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
			<el-form ref="form" :model="form" :rules="rules" label-width="80px">
				<el-form-item label="首页广告图" prop="adImg">
					<el-input v-model="form.adImg" placeholder="请输入首页广告图" />
				</el-form-item>
				<el-form-item label="首页广告链接" prop="adIndex">
					<el-input v-model="form.adIndex" placeholder="请输入首页广告链接" />
				</el-form-item>
				<el-form-item label="合伙人展示图" prop="brandImg">
					<el-input v-model="form.brandImg" placeholder="请输入合伙人展示图" />
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
import { listTable, getTable, delTable, addTable, updateTable } from '@/api/system/image';

export default {
	name: 'Table',
	data() {
		return {
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
			// 基础图片设置表格数据
			tableList: [],
			// 弹出层标题
			title: '',
			// 是否显示弹出层
			open: false,
			// 查询参数
			queryParams: {
				pageNum: 1,
				pageSize: 10,
				adImg: null,
				adIndex: null,
				brandImg: null,
				createTime: null
			},
			// 表单参数
			form: {},
			// 表单校验
			rules: {}
		};
	},
	created() {
		this.getList();
	},
	methods: {
		/** 查询基础图片设置列表 */
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
				adImg: null,
				adIndex: null,
				brandImg: null,
				createTime: null
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
			this.title = '添加基础图片设置';
		},
		/** 修改按钮操作 */
		handleUpdate(row) {
			this.reset();
			const id = row.id || this.ids;
			getTable(id).then(response => {
				this.form = response.data;
				this.open = true;
				this.title = '修改基础图片设置';
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
				.confirm('是否确认删除基础图片设置编号为"' + ids + '"的数据项？')
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
