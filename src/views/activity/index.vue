<template>
	<div class="app-container">
		<el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
			<el-form-item label="活动名称" prop="activityTitle">
				<el-input v-model="queryParams.activityTitle" placeholder="请输入活动名称" clearable @keyup.enter.native="handleQuery" />
			</el-form-item>
			<el-form-item label="活动时间" prop="activityTime">
				<el-date-picker v-model="queryParams.activityTime" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" value-format="yyyy-MM-dd" :picker-options="pickerOptions">
				</el-date-picker>
			</el-form-item>
			<el-form-item label="地区" prop="region">
				<el-cascader v-model="queryParams.region" :options="regionOptions" :props="{ expandTrigger: 'hover' }" @change="handleRegionChange"></el-cascader>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
				<el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
			</el-form-item>
		</el-form>

		<el-row :gutter="10" class="mb8">
			<el-col :span="1.5">
				<el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd" v-hasPermi="['system:table:add']">创建活动</el-button>
			</el-col>
			<right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
		</el-row>

		<el-table v-loading="loading" :data="tableList" border stripe>
			<el-table-column label="活动编号" align="center" prop="id" />
			<el-table-column label="活动模板" align="center" prop="activityTitle" />
			<el-table-column label="地区" align="center" prop="">
				<template slot-scope="scope"> {{ scope.row.province }}/{{ scope.row.city }}/{{ scope.row.area }} </template>
			</el-table-column>
			<el-table-column label="承办方" align="center" prop="activityCustomer" />
			<el-table-column label="活动标题" align="center" prop="activityTitle" />
			<el-table-column label="访问次数" align="center" prop="visitCount" />
			<el-table-column label="访问人数" align="center" prop="visitorCount" />
			<el-table-column label="参与人数" align="center" prop="participantCount" />
			<el-table-column label="转发量" align="center" prop="forwardCount" />
			<el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="180">
				<template slot-scope="scope">
					<el-button size="mini" type="text" @click="handleUpdate(scope.row)" v-hasPermi="['system:table:edit']">详情</el-button>
					<el-button size="mini" type="text" @click="handleEdit(scope.row)" v-hasPermi="['system:table:edit']">编辑</el-button>
					<el-button size="mini" type="text" @click="handleTakeDown(scope.row)" v-hasPermi="['system:table:edit']">下架</el-button>
					<el-button size="mini" type="text" @click="handleDelete(scope.row)" v-hasPermi="['system:table:remove']">删除</el-button>
				</template>
			</el-table-column>
		</el-table>

		<pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />
	</div>
</template>

<script>
import { delTable, listTable } from '@/api/activity';
import { regionData } from 'element-china-area-data';

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
			// h5活动表格数据
			tableList: [],
			// 弹出层标题
			title: '',
			// 是否显示弹出层
			open: false,
			// 查询参数
			queryParams: {
				pageNum: 1,
				pageSize: 10,
				activityTitle: null,
				activityTime: [],
				region: [],
				province: null,
				city: null,
				area: null,
				longitude: null,
				latitude: null,
				activityForwardNum: null,
				activityContent: null,
				activityBanner: null,
				activityBg: null,
				activityImg: null,
				activityCustomer: null,
				businessHours: null,
				activityAddress: null,
				activityRule: null,
				wXSummary: null,
				giftTotal: null,
				firstChance: null,
				inviteChance: null,
				thumbnail: null,
				wXImg: null,
				articleExamine: null,
				userId: null
			},
			// 表单参数
			form: {},
			// 表单校验
			rules: {},
			// 地区选项
			regionOptions: regionData,
			// 时间选择器快捷选项
			pickerOptions: {
				shortcuts: [
					{
						text: '最近一周',
						onClick(picker) {
							const end = new Date();
							const start = new Date();
							start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
							picker.$emit('pick', [start, end]);
						}
					},
					{
						text: '最近一个月',
						onClick(picker) {
							const end = new Date();
							const start = new Date();
							start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
							picker.$emit('pick', [start, end]);
						}
					},
					{
						text: '最近三个月',
						onClick(picker) {
							const end = new Date();
							const start = new Date();
							start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
							picker.$emit('pick', [start, end]);
						}
					}
				]
			}
		};
	},
	created() {
		this.getList();
	},
	methods: {
		/** 查询h5活动列表 */
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
				activityTitle: null,
				startTime: null,
				endTime: null,
				province: null,
				city: null,
				area: null,
				longitude: null,
				latitude: null,
				activityForwardNum: null,
				activityContent: null,
				activityBanner: null,
				activityBg: null,
				activityImg: null,
				activityCustomer: null,
				businessHours: null,
				activityAddress: null,
				activityRule: null,
				wXSummary: null,
				giftTotal: null,
				firstChance: null,
				inviteChance: null,
				thumbnail: null,
				wXImg: null,
				articleExamine: null,
				userId: null
			};
			this.resetForm('form');
		},
		/** 搜索按钮操作 */
		handleQuery() {
			this.queryParams.pageNum = 1;
			if (this.queryParams.activityTime && this.queryParams.activityTime.length === 2) {
				this.queryParams.startTime = this.queryParams.activityTime[0];
				this.queryParams.endTime = this.queryParams.activityTime[1];
			} else {
				this.queryParams.startTime = null;
				this.queryParams.endTime = null;
			}
			this.getList();
		},
		/** 重置按钮操作 */
		resetQuery() {
			this.resetForm('queryForm');
			this.queryParams.region = [];
			this.queryParams.activityTime = [];
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
			this.$router.push({ path: '/activity/activityEdit' });
		},
		/** 修改按钮操作 */
		handleUpdate(row) {},
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
				.confirm('是否确认删除h5活动编号为"' + ids + '"的数据项？')
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
		},
		/** 地区选择变化处理 */
		handleRegionChange(value) {
			this.queryParams.province = value[0];
			this.queryParams.city = value[1];
			this.queryParams.area = value[2];
		},
		/** 编辑按钮操作 */
		handleEdit(row) {
			this.$router.push({ path: '/activity/activityEdit', query: { id: row.id } });
		},
		/** 下架按钮操作 */
		handleTakeDown(row) {
			// 实现下架功能
			console.log('下架', row);
		}
	}
};
</script>
