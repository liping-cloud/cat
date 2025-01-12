<template>
	<div class="app-container">
		<el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
			<el-form-item label="用户名称" prop="nickName">
				<el-input v-model="queryParams.nickName" placeholder="请输入用户昵称" clearable @keyup.enter.native="handleQuery" />
			</el-form-item>
			<el-form-item label="联系电话" prop="phone">
				<el-input v-model="queryParams.phone" placeholder="请输入联系电话" clearable @keyup.enter.native="handleQuery" />
			</el-form-item>
			<!--			<el-form-item label="角色" prop="roleId">-->
			<!--				<el-select v-model="queryParams.roleId" placeholder="请选择角色" clearable @change="handleQuery">-->
			<!--					<el-option label="普通会员" value="0"></el-option>-->
			<!--					<el-option label="VIP会员" value="1"></el-option>-->
			<!--				</el-select>-->
			<!--			</el-form-item>-->
			<el-form-item label="注册时间" prop="regTime">
				<el-date-picker v-model="queryParams.regTime" value-format="yyyy-MM-dd" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"> </el-date-picker>
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
			<el-col :span="1.5">
				<el-button type="success" plain icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate">修改</el-button>
			</el-col>
			<el-col :span="1.5">
				<el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete">删除</el-button>
			</el-col>
			<el-col :span="1.5">
				<el-button type="warning" plain icon="el-icon-download" size="mini" @click="handleExport">导出</el-button>
			</el-col>
			<right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
		</el-row>

		<el-table v-loading="loading" :data="tableList" @selection-change="handleSelectionChange" border stripe>
			<!--			<el-table-column type="selection" width="55" align="center" />-->
			<el-table-column label="用户ID" align="center" prop="id" />
			<el-table-column label="微信昵称" align="center" prop="nickName" />
			<el-table-column label="性别" align="center" prop="gender">
				<template slot-scope="scope">
					<span v-if="scope.row.gender == 0">男</span>
					<span v-else-if="scope.row.gender == 1">女</span>
					<span v-else>未知</span>
				</template>
			</el-table-column>
			<el-table-column label="手机号码" align="center" prop="phone" />
			<el-table-column label="推荐人" align="center" prop="referenceName" />
			<el-table-column label="注册时间" align="center" prop="regTime" width="180">
				<template slot-scope="scope">
					<span>{{ parseTime(scope.row.regTime, '{y}-{m}-{d}') }}</span>
				</template>
			</el-table-column>
			<el-table-column label="操作" align="center" class-name="small-padding fixed-width">
				<template slot-scope="scope">
					<el-button size="mini" type="text" @click="handleUpdate(scope.row)">详情</el-button>
					<el-button size="mini" type="text" @click="handleUpdate(scope.row)">冻结账户</el-button>
					<!--					<el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)">删除</el-button>-->
				</template>
			</el-table-column>
		</el-table>

		<pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

		<!-- 添加或修改用户信息对话框 -->
		<el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
			<el-form ref="form" :model="form" :rules="rules" label-width="80px">
				<el-form-item label="用户头像" prop="profileImg">
					<el-input v-model="form.profileImg" placeholder="请输入用户头像" />
				</el-form-item>
				<el-form-item label="用户昵称" prop="nickName">
					<el-input v-model="form.nickName" placeholder="请输入用户昵称" />
				</el-form-item>
				<el-form-item label="0男 1女 2未知" prop="gender">
					<el-input v-model="form.gender" placeholder="请输入0男 1女 2未知" />
				</el-form-item>
				<el-form-item label="用户电话" prop="phone">
					<el-input v-model="form.phone" placeholder="请输入用户电话" />
				</el-form-item>
				<el-form-item label="所在地区" prop="userArea">
					<el-input v-model="form.userArea" placeholder="请输入所在地区" />
				</el-form-item>
				<el-form-item label="角色Id" prop="roleId">
					<el-input v-model="form.roleId" placeholder="请输入角色Id" />
				</el-form-item>
				<el-form-item label="推荐人Id" prop="referenceId">
					<el-input v-model="form.referenceId" placeholder="请输入推荐人Id" />
				</el-form-item>
				<el-form-item label="推荐码" prop="referenceNum">
					<el-input v-model="form.referenceNum" placeholder="请输入推荐码" />
				</el-form-item>
				<el-form-item label="注册时间" prop="regTime">
					<el-date-picker clearable v-model="form.regTime" type="date" value-format="yyyy-MM-dd" placeholder="请选择注册时间"> </el-date-picker>
				</el-form-item>
				<el-form-item label="微信小程序id" prop="openId">
					<el-input v-model="form.openId" placeholder="请输入微信小程序id" />
				</el-form-item>
				<el-form-item label="0正常 1冻结" prop="state">
					<el-input v-model="form.state" placeholder="请输入0正常 1冻结" />
				</el-form-item>
				<el-form-item label="账户总额" prop="amount">
					<el-input v-model="form.amount" placeholder="请输入账户总额" />
				</el-form-item>
				<el-form-item label="冻结金额" prop="freezeDeposits">
					<el-input v-model="form.freezeDeposits" placeholder="请输入冻结金额" />
				</el-form-item>
				<el-form-item label="累计提现" prop="withdrawal">
					<el-input v-model="form.withdrawal" placeholder="请输入累计提现" />
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
import { listBasicTable, getBasicTable, delBasicTable, addBasicTable, updateBasicTable } from '@/api/system/table';

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
			// 用户信息表格数据
			tableList: [],
			// 弹出层标题
			title: '',
			// 是否显示弹出层
			open: false,
			// 查询参数
			queryParams: {
				pageNum: 1,
				pageSize: 10,
				profileImg: null,
				nickName: null,
				gender: null,
				phone: null,
				userArea: null,
				roleId: null,
				referenceId: null,
				referenceNum: null,
				regTime: [],
				openId: null,
				state: null,
				amount: null,
				freezeDeposits: null,
				withdrawal: null
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
		/** 查询用户信息列表 */
		getList() {
			this.loading = true;
			let params = Object.assign({}, this.queryParams);
			if (params.regTime && params.regTime.length > 0) {
				params['startTime'] = params.regTime[0];
				params['endTime'] = params.regTime[1];
				delete params.regTime;
			}
			listBasicTable(params).then(response => {
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
				profileImg: null,
				nickName: null,
				gender: null,
				phone: null,
				userArea: null,
				roleId: null,
				referenceId: null,
				referenceNum: null,
				regTime: null,
				openId: null,
				state: null,
				amount: null,
				freezeDeposits: null,
				withdrawal: null
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
			this.title = '添加用户信息';
		},
		/** 修改按钮操作 */
		handleUpdate(row) {
			this.reset();
			const id = row.id || this.ids;
			getBasicTable(id).then(response => {
				this.form = response.data;
				this.open = true;
				this.title = '修改用户信息';
			});
		},
		/** 提交按钮 */
		submitForm() {
			this.$refs['form'].validate(valid => {
				if (valid) {
					if (this.form.id != null) {
						updateBasicTable(this.form).then(response => {
							this.$modal.msgSuccess('修改成功');
							this.open = false;
							this.getList();
						});
					} else {
						addBasicTable(this.form).then(response => {
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
				.confirm('是否确认删除用户信息编号为"' + ids + '"的数据项？')
				.then(function () {
					return delBasicTable(ids);
				})
				.then(() => {
					this.getList();
					this.$modal.msgSuccess('删除成功');
				})
				.catch(() => {});
		},
		/** 导出按钮操作 */
		handleExport() {
			let params = Object.assign({}, this.queryParams);
			if (params.regTime && params.regTime.length > 0) {
				params['startTime'] = params.regTime[0];
				params['endTime'] = params.regTime[1];
				delete params.regTime;
			}
			this.download(
				'system/table/export',
				{
					...params
				},
				`table_${new Date().getTime()}.xlsx`
			);
		}
	}
};
</script>
